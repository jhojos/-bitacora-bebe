/* =========================================================================
   CATÁLOGO COMERCIAL — datos de la sección "Descubre productos".

   Este archivo contiene SOLO datos. No toca los registros del bebé, no lee
   localStorage y no ejecuta lógica. Se puede editar sin abrir ningún otro
   archivo del proyecto.

   ⚠ TODO lo que hay aquí es de EJEMPLO. No hay tiendas, productos, precios
   ni enlaces de afiliación reales. Cada producto lleva `placeholder: true`,
   y la interfaz lo muestra marcado como ejemplo mientras ese campo sea true.

   Cómo se usa cada cosa está explicado en README-catalogo.md.
   ========================================================================= */

window.MBH_CATALOG = {

  /* Versión del formato del catálogo. Súbela si cambia la estructura. */
  formatVersion: 1,

  /* Fecha de la última revisión del catálogo (solo informativa). */
  updatedAt: '2026-08-15',

  /* Aviso que se muestra arriba mientras el catálogo sea de ejemplo.
     Cuando existan productos reales, pon null para que desaparezca. */
  demoNotice: 'Catálogo de ejemplo. Todavía no hay tiendas ni productos reales: los que aparecen aquí sirven para probar cómo se verá la sección.',

  /* Declaración de afiliación. Se muestra al final de la sección.
     Pon null si en algún momento no procede. */
  disclosure: 'Cuando esta sección incluya enlaces a tiendas, algunos podrán generar una comisión para La Bitácora si compras a través de ellos. El precio para ti no cambia.',

  /* ---------------------------------------------------------------------
     PAÍSES
     El selector solo aparece si hay más de uno activo.
     --------------------------------------------------------------------- */
  defaultCountry: 'CL',
  countries: [
    { code: 'CL', name: 'Chile', active: true },
    { code: 'US', name: 'Estados Unidos', active: true }
  ],

  /* ---------------------------------------------------------------------
     COMERCIOS
     `affiliate` queda preparado para cuando existan programas reales:
       program : nombre del programa de afiliados
       param   : parámetro que se añade a la URL (por ejemplo 'tag')
       value   : identificador de afiliado
     Con program: null, la aplicación usa la URL tal cual, sin añadir nada.
     --------------------------------------------------------------------- */
  merchants: [
    {
      id: 'ejemplo-cl',
      name: 'Comercio de ejemplo (Chile)',
      countries: ['CL'],
      affiliate: { program: null, param: null, value: null },
      active: true
    },
    {
      id: 'ejemplo-us',
      name: 'Comercio de ejemplo (EE. UU.)',
      countries: ['US'],
      affiliate: { program: null, param: null, value: null },
      active: true
    }
  ],

  /* ---------------------------------------------------------------------
     GRUPOS DE DESCUBRIMIENTO
     Son los bloques de primer nivel. `order` decide la posición.
     --------------------------------------------------------------------- */
  groups: [
    {
      id: 'recompra',
      name: 'Recompra',
      description: 'Productos que suelen formar parte del consumo cotidiano.',
      order: 1,
      active: true
    },
    {
      id: 'alimentacion',
      name: 'Alimentación',
      description: 'Lo relacionado con las tomas y con empezar a comer.',
      order: 2,
      active: true
    },
    {
      id: 'equipamiento',
      name: 'Tecnología y equipamiento',
      description: 'Compras grandes que se hacen una vez.',
      order: 3,
      active: true
    },
    {
      id: 'complementarios',
      name: 'Complementarios',
      description: 'Juego, libros, ropa, accesorios y regalos.',
      order: 4,
      active: true
    }
  ],

  /* ---------------------------------------------------------------------
     CATEGORÍAS
     Cada una pertenece a un grupo. Para retirar una del catálogo sin
     borrarla, basta con active: false.
     --------------------------------------------------------------------- */
  categories: [
    { id: 'panales',        groupId: 'recompra',        name: 'Pañales',                     order: 1, active: true },
    { id: 'toallitas',      groupId: 'recompra',        name: 'Toallitas',                   order: 2, active: true },
    { id: 'cremas',         groupId: 'recompra',        name: 'Cremas para pañal',           order: 3, active: true },
    { id: 'bano',           groupId: 'recompra',        name: 'Shampoo y jabón',             order: 4, active: true },
    { id: 'higiene',        groupId: 'recompra',        name: 'Productos de higiene',        order: 5, active: true },

    { id: 'biberones',      groupId: 'alimentacion',    name: 'Biberones y tetinas',         order: 1, active: true },
    { id: 'bolsas-leche',   groupId: 'alimentacion',    name: 'Bolsas de almacenamiento',    order: 2, active: true },
    { id: 'lactancia',      groupId: 'alimentacion',    name: 'Accesorios de lactancia',     order: 3, active: true },
    { id: 'baberos',        groupId: 'alimentacion',    name: 'Baberos',                     order: 4, active: true },
    { id: 'complementaria', groupId: 'alimentacion',    name: 'Alimentación complementaria', order: 5, active: true },

    { id: 'extractores',    groupId: 'equipamiento',    name: 'Extractores de leche',        order: 1, active: true },
    { id: 'monitores',      groupId: 'equipamiento',    name: 'Monitores',                   order: 2, active: true },
    { id: 'portabebe',      groupId: 'equipamiento',    name: 'Mochilas portabebé',          order: 3, active: true },
    { id: 'sillas',         groupId: 'equipamiento',    name: 'Sillas de alimentación',      order: 4, active: true },
    { id: 'cunas',          groupId: 'equipamiento',    name: 'Cunas y accesorios',          order: 5, active: true },

    { id: 'juguetes',       groupId: 'complementarios', name: 'Juguetes de desarrollo',      order: 1, active: true },
    { id: 'libros',         groupId: 'complementarios', name: 'Libros',                      order: 2, active: true },
    { id: 'ropa',           groupId: 'complementarios', name: 'Ropa',                        order: 3, active: true },
    { id: 'accesorios',     groupId: 'complementarios', name: 'Accesorios',                  order: 4, active: true },
    { id: 'regalos',        groupId: 'complementarios', name: 'Regalos',                     order: 5, active: true }
  ],

  /* ---------------------------------------------------------------------
     PRODUCTOS

     Campos:
       id           identificador único
       categoryId   categoría a la que pertenece
       merchantId   comercio que lo vende
       name         nombre del producto
       description  una línea, corta
       image        ruta relativa a una imagen propia, o null
       imageAlt     texto alternativo de la imagen
       url          dirección del producto en la tienda, o null
       affiliateUrl dirección con el identificador de afiliado, o null
       price        texto ya formateado ('19.990 CLP'), o null
       badge        etiqueta corta opcional
       countries    países en los que se muestra
       active       false lo oculta sin borrarlo
       placeholder  true = dato de ejemplo; la interfaz lo marca y desactiva
                    el botón. Quítalo cuando el producto sea real.

     Solo cuatro categorías llevan ejemplos, a propósito: así se ve tanto una
     categoría con productos como una vacía.
     --------------------------------------------------------------------- */
  products: [
    {
      id: 'ej-panales-1', categoryId: 'panales', merchantId: 'ejemplo-cl',
      name: 'Producto de ejemplo · Pañales talla 1',
      description: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: 'Ejemplo', countries: ['CL'], active: true, placeholder: true
    },
    {
      id: 'ej-panales-2', categoryId: 'panales', merchantId: 'ejemplo-cl',
      name: 'Producto de ejemplo · Pañales talla 2',
      description: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: 'Ejemplo', countries: ['CL'], active: true, placeholder: true
    },
    {
      id: 'ej-panales-3', categoryId: 'panales', merchantId: 'ejemplo-us',
      name: 'Producto de ejemplo · Pañales (EE. UU.)',
      description: 'Descripción de ejemplo. Solo aparece si el país es EE. UU.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: 'Ejemplo', countries: ['US'], active: true, placeholder: true
    },
    {
      id: 'ej-biberones-1', categoryId: 'biberones', merchantId: 'ejemplo-cl',
      name: 'Producto de ejemplo · Biberón',
      description: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: 'Ejemplo', countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-biberones-2', categoryId: 'biberones', merchantId: 'ejemplo-cl',
      name: 'Producto de ejemplo · Set de tetinas',
      description: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: 'Ejemplo', countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-extractores-1', categoryId: 'extractores', merchantId: 'ejemplo-cl',
      name: 'Producto de ejemplo · Extractor',
      description: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: 'Ejemplo', countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-juguetes-1', categoryId: 'juguetes', merchantId: 'ejemplo-cl',
      name: 'Producto de ejemplo · Juguete',
      description: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: 'Ejemplo', countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-retirado', categoryId: 'juguetes', merchantId: 'ejemplo-cl',
      name: 'Producto de ejemplo · Retirado',
      description: 'Este lleva active: false y no debe aparecer en ningún sitio.',
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: null, countries: ['CL', 'US'], active: false, placeholder: true
    }
  ]
};
