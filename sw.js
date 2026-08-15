/* =========================================================================
   Service worker de Bitácora Bebé.

   Su único trabajo es guardar en caché los archivos de la aplicación para
   que pueda abrirse sin conexión.

   NUNCA toca los datos del usuario: los registros viven en localStorage,
   al que un service worker no tiene acceso. Aquí no hay sincronización,
   ni envío de información, ni peticiones a servidores externos.

   Estrategia de actualización:
     - navegación  -> primero la red, y la caché si no hay conexión;
     - index/css/js -> se sirve la copia guardada y en paralelo se descarga
       la versión nueva, que queda lista para la siguiente apertura;
     - tipografías, iconos y jsPDF -> solo caché (cambian de nombre cuando
       cambian de contenido).
   Así una versión antigua nunca queda atrapada, aunque se olvide subir el
   número de CACHE al publicar. Subirlo sigue siendo recomendable: fuerza
   la descarga inmediata y descarta de golpe la caché anterior.
   ========================================================================= */

var CACHE_PREFIX = 'bitacora-bebe-';
var CACHE = CACHE_PREFIX + 'v4';

/* Rutas relativas a la ubicación de este archivo, para que funcione tanto en
   la raíz de un dominio como en una subcarpeta del tipo usuario.github.io/repositorio/ */
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app.css',
  './app.js',
  './jspdf.umd.min.js',
  './shop.css',
  './shop.js',
  './catalog.js',
  './instrument-sans-400.woff2',
  './instrument-sans-500.woff2',
  './instrument-sans-600.woff2',
  './instrument-sans-700.woff2',
  './instrument-serif-400.woff2',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon-180.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          // Solo se borran cachés propias: en GitHub Pages el origen puede
          // estar compartido con otros proyectos del mismo usuario.
          if (k === CACHE || k.indexOf(CACHE_PREFIX) !== 0) return null;
          return caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;

  // Solo lecturas y solo archivos propios. Nada más se intercepta.
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Navegación: primero la red (para recibir actualizaciones), y si no hay
  // conexión, la copia guardada.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
          return res;
        })
        .catch(function () {
          return caches.match('./index.html').then(function (hit) {
            return hit || caches.match('./');
          });
        })
    );
    return;
  }

  // Archivos de la aplicación: se responde con la copia guardada y se
  // refresca en segundo plano, para que la próxima apertura ya use la
  // versión nueva sin depender de que se haya subido el número de CACHE.
  var revalidate = /\/(index\.html|app\.css|app\.js|shop\.css|shop\.js|catalog\.js|manifest\.webmanifest)$/.test(new URL(req.url).pathname);

  event.respondWith(
    caches.match(req).then(function (hit) {
      // Tipografías, iconos y jsPDF no cambian sin cambiar de nombre:
      // si están guardados, no se vuelve a preguntar a la red.
      if (hit && !revalidate) return hit;

      var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
      if (!hit) return network;
      network.catch(function () { /* sin conexión: se sigue usando la copia */ });
      return hit;
    })
  );
});
