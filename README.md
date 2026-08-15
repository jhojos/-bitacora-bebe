# Mi Bebé Hoy

Registro diario de los cuidados de un bebé. Aplicación web estática e instalable (PWA).
Sin cuentas, sin servidor, sin base de datos: **todos los datos viven en el
dispositivo de quien la usa.**

---

## Estructura

```
bitacora-bebe/
├── index.html                 Página única de la aplicación
├── manifest.webmanifest       Datos de instalación (nombre, iconos, colores)
├── sw.js                      Service worker: caché de archivos para uso sin conexión
├── README.md                  Este archivo
├── README-catalogo.md         Cómo mantener la sección "Descubre productos"
├── assets/
│   ├── app.css                Estilos de la bitácora
│   ├── app.js                 Lógica de la bitácora
│   ├── shop.css               Estilos de la capa comercial (prefijo .shop-)
│   ├── shop.js                Lógica de la capa comercial
│   ├── catalog.js             Datos comerciales (países, tiendas, productos)
│   ├── jspdf.umd.min.js       Generador de PDF (biblioteca jsPDF 2.5.2, MIT)
│   └── fonts/                 Instrument Sans e Instrument Serif (SIL OFL)
└── icons/                     Iconos PROVISIONALES, pendientes de reemplazo
```

Todos los archivos son necesarios. No hay proceso de compilación: lo que hay
en el repositorio es exactamente lo que se publica.

---

## Publicar en GitHub Pages

1. Crea un repositorio y sube **el contenido** de esta carpeta a la raíz
   (que `index.html` quede en la raíz del repositorio, no dentro de otra carpeta).
2. `Settings` → `Pages` → `Source: Deploy from a branch` → rama `main`, carpeta `/ (root)`.
3. Espera un par de minutos. Quedará en `https://TU-USUARIO.github.io/TU-REPO/`.

Todas las rutas son relativas, así que funciona igual en una subcarpeta que en
la raíz de un dominio propio. No hay que tocar ningún archivo al cambiar de sitio.

## Probar en local

Un service worker no funciona abriendo el archivo con doble clic (`file://`).
Hace falta un servidor local:

```bash
cd bitacora-bebe
python3 -m http.server 8000
```

Abre `http://localhost:8000`. Los navegadores tratan `localhost` como origen
seguro, así que la PWA se puede probar entera.

## Publicar en el dominio definitivo

Sube el contenido a la carpeta pública del hosting, con HTTPS activado.
No hace falta cambiar nada dentro de los archivos.

**Importante:** `localStorage` está ligado al dominio. Al cambiar de dirección,
los datos NO viajan solos. El camino es: *Exportar respaldo* en la dirección
antigua → abrir la nueva → *Importar respaldo*.

---

## Actualizar la aplicación

Al subir una versión nueva, cambia el número de versión en la primera línea
de `sw.js`:

```js
var CACHE = CACHE_PREFIX + 'v3';   // → 'v4'
```

El service worker ya revalida `index.html`, `app.css` y `app.js` en segundo
plano, así que una versión nueva llega igualmente en la siguiente apertura.
Subir el número fuerza la descarga inmediata y descarta la caché anterior:
hazlo siempre que cambies tipografías, iconos o jsPDF, que no se revalidan.

## Reemplazar los iconos

Los archivos de `icons/` dicen «ICONO PROVISIONAL» a propósito. Cuando exista
la identidad definitiva, sustitúyelos conservando nombres y tamaños:

| Archivo | Tamaño | Para qué |
|---|---|---|
| `icon-192.png` | 192×192 | Android, pestañas |
| `icon-512.png` | 512×512 | Pantalla de inicio, splash |
| `icon-maskable-512.png` | 512×512 | Android recorta los bordes: deja ~20 % de margen de seguridad |
| `apple-touch-icon-180.png` | 180×180 | iPhone y iPad |

No hay que tocar el código.

---

## Privacidad

- Ninguna petición sale del dispositivo. La única dirección externa del código
  es `wa.me`, y solo se abre cuando la persona pulsa el botón de WhatsApp.
- El PDF y el archivo de respaldo se generan en el navegador.
- El service worker solo guarda los archivos de la aplicación. No tiene acceso
  a `localStorage` ni envía nada a ningún sitio.
- No hay analítica ni rastreadores.
- La sección "Descubre productos" es un catálogo estático: no lee los
  registros del bebé, no guarda nada y no envía nada. Los enlaces salen
  hacia el comercio solo cuando la persona los pulsa.

## Licencias de terceros

- jsPDF 2.5.2 — MIT
- Instrument Sans e Instrument Serif — SIL Open Font License 1.1
  (texto completo en `assets/fonts/`)
