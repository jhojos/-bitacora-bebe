# Catálogo comercial — "Descubre productos"

Todo lo comercial vive en tres archivos. **Ninguno de ellos toca la bitácora.**

| Archivo | Qué contiene |
|---|---|
| `catalog.js` | Los datos: países, comercios, grupos, categorías y productos |
| `shop.js` | La lógica: cómo se muestra y se navega la sección |
| `shop.css` | Los estilos, todos con el prefijo `.shop-` |

Para el trabajo del día a día **solo necesitas editar `catalog.js`**.

Después de cualquier cambio, sube el número de versión en la primera línea
de `sw.js` (`'v6'` → `'v7'`) para que los teléfonos ya instalados reciban el
catálogo nuevo cuanto antes.

---

## Añadir un producto

Añade un objeto al final de la lista `products`:

```js
{
  id: 'panales-marca-t1',        // único, no lo reutilices nunca
  categoryId: 'panales',         // debe existir en `categories`
  merchantId: 'mi-tienda',       // debe existir en `merchants`
  name: 'Pañales Marca, talla 1',
  description: 'Paquete de 40 unidades.',
  image: './shop/panales-marca.jpg',   // o null
  imageAlt: 'Paquete de pañales Marca talla 1',
  url: 'https://mitienda.cl/panales-marca-t1',
  affiliateUrl: null,            // ver más abajo
  price: '12.990 CLP',           // texto ya formateado, o null
  badge: null,
  countries: ['CL'],
  active: true
  // sin `placeholder`: en cuanto lo quites, deja de salir marcado como ejemplo
}
```

**Mientras un producto tenga `placeholder: true`, el botón queda desactivado
y aparece "Enlace pendiente".** Es la red de seguridad para que un dato de
prueba no pueda pasar por real.

Si añades imágenes, crea la carpeta `shop/`, guárdalas ahí
optimizadas (200 px de lado basta) y añádelas a la lista `ASSETS` de `sw.js`
para que funcionen sin conexión.

## Retirar un producto

Cambia `active: true` por `active: false`. Desaparece de la sección pero
queda el registro de que existió. Borrar el objeto también funciona.

## Cambiar un producto

Edita sus campos. No cambies el `id`.

## Añadir un comercio

Añade un objeto a `merchants`:

```js
{
  id: 'mi-tienda',
  name: 'Mi Tienda',
  countries: ['CL'],
  affiliate: { program: null, param: null, value: null },
  active: true
}
```

Un producto solo se muestra si su comercio está activo y opera en el país
seleccionado.

## Añadir un enlace de afiliación

Hay dos formas, y la aplicación admite las dos:

**1. El programa da una URL completa por producto** (lo habitual en
Amazon Associates o en redes tipo Awin). Pega esa URL en `affiliateUrl` del
producto. Se usa tal cual, sin tocarla.

**2. El programa consiste en añadir un parámetro a la URL normal.**
Configúralo una sola vez en el comercio:

```js
affiliate: { program: 'Amazon Associates', param: 'tag', value: 'mibebehoy-20' }
```

A partir de ahí, cualquier producto de ese comercio que tenga `url` recibe
el parámetro automáticamente. No hay que tocar producto por producto.

Si `affiliateUrl` existe, gana sobre el parámetro del comercio.

## Añadir un país

1. Añádelo a `countries`: `{ code: 'MX', name: 'México', active: true }`.
2. Añade los comercios de ese país con `countries: ['MX']`.
3. Añade los productos con `countries: ['MX']`.

El selector de país aparece solo cuando hay más de uno activo. Un producto
sin `countries` se muestra en todos.

## Añadir, quitar o reordenar categorías

En `categories`. El campo `order` decide la posición dentro de su grupo, y
`groupId` a qué bloque pertenece. Para crear un bloque nuevo, añade una
entrada a `groups` con su propio `order`.

Cambiar el nombre visible de una categoría es solo cambiar `name`: el `id`
no debe tocarse, porque es lo que enlaza los productos.

## Textos en varios idiomas

Los campos visibles del catálogo (nombres de grupos, categorías, productos,
descripciones, etiquetas y países) admiten un objeto por idioma:

```js
name: { es: 'Pañales', en: 'Diapers', pt: 'Fraldas' }
```

También admiten un texto plano, que se muestra igual en los tres idiomas.
Úsalo para los nombres propios de las tiendas, que no se traducen.

## Textos de la sección

- `demoNotice`: el aviso de "catálogo de ejemplo". **Ponlo a `null` cuando
  el catálogo sea real** — si no, seguirá diciendo que está en preparación.
- `disclosure`: la declaración de afiliación que aparece al final. Revísala
  con criterio legal antes de operar con comisiones reales.
- El nombre y el descriptor de la sección están en las dos primeras
  constantes de `shop.js`.

---

## Qué NO hace esta capa, por diseño

- No lee los registros del bebé. No puede: `shop.js` no accede a
  `localStorage` ni a ningún elemento de la bitácora.
- No guarda nada en el dispositivo. El país elegido dura lo que dura la
  sesión. Si algún día quisieras recordarlo, usa una clave propia
  (`mbh.shop.v1`) y nunca `mbh.v1`.
- No aparece en el respaldo ni en el PDF.
- No relaciona síntomas ni medicamentos con productos, y no hay ningún
  código que lo permita.

## Desactivarla por completo

Borra estas dos líneas de `index.html`:

```html
<script defer src="./catalog.js"></script>
<script defer src="./shop.js"></script>
```

La bitácora sigue funcionando exactamente igual; la sección simplemente no
aparece. Está comprobado con pruebas automatizadas.
