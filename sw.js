/* =========================================================================
   Service worker de Bitácora Bebé.

   Su único trabajo es guardar en caché los archivos de la aplicación para
   que pueda abrirse sin conexión.

   NUNCA toca los datos del usuario: los registros viven en localStorage,
   al que un service worker no tiene acceso. Aquí no hay sincronización,
   ni envío de información, ni peticiones a servidores externos.

   Al publicar una versión nueva, sube el número de CACHE: eso descarta la
   caché anterior y obliga a descargar los archivos actualizados.
   ========================================================================= */

var CACHE_PREFIX = 'bitacora-bebe-';
var CACHE = CACHE_PREFIX + 'v1';

/* Rutas relativas a la ubicación de este archivo, para que funcione tanto en
   la raíz de un dominio como en una subcarpeta del tipo usuario.github.io/repositorio/ */
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/app.css',
  './assets/app.js',
  './assets/jspdf.umd.min.js',
  './assets/fonts/instrument-sans-400.woff2',
  './assets/fonts/instrument-sans-500.woff2',
  './assets/fonts/instrument-sans-600.woff2',
  './assets/fonts/instrument-sans-700.woff2',
  './assets/fonts/instrument-serif-400.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon-180.png'
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

  // Resto de archivos: primero la caché (rápido y disponible sin conexión).
  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
