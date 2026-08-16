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
  demoNotice: {
    es: 'Catálogo de ejemplo. Todavía no hay tiendas ni productos reales: los que aparecen aquí sirven para probar cómo se verá la sección.',
    en: 'Sample catalog. There are no real stores or products yet: the ones shown here are only to test how the section will look.',
    pt: 'Catálogo de exemplo. Ainda não há lojas nem produtos reais: os que aparecem aqui servem para testar como a seção vai ficar.'
  },

  /* Declaración de afiliación. Se muestra al final de la sección.
     Pon null si en algún momento no procede. */
  disclosure: {
    es: 'Cuando esta sección incluya enlaces a tiendas, algunos podrán generar una comisión para La Bitácora si compras a través de ellos. El precio para ti no cambia.',
    en: 'When this section includes store links, some may earn La Bitácora a commission if you buy through them. The price you pay stays the same.',
    pt: 'Quando esta seção tiver links de lojas, alguns poderão gerar uma comissão para La Bitácora se você comprar por eles. O preço para você não muda.'
  },

  /* ---------------------------------------------------------------------
     PAÍSES
     El selector solo aparece si hay más de uno activo.
     --------------------------------------------------------------------- */
  defaultCountry: 'CL',
  countries: [
    { code: 'CL', name: { es: 'Chile', en: 'Chile', pt: 'Chile' }, active: true },
    { code: 'US', name: { es: 'Estados Unidos', en: 'United States', pt: 'Estados Unidos' }, active: true }
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
      name: 'Comercio de ejemplo (Chile)',   // nombre propio: no se traduce
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
      name: { es: 'Recompra', en: 'Repeat purchases', pt: 'Recompra' },
      description: {
        es: 'Productos que suelen formar parte del consumo cotidiano.',
        en: 'Products that are usually part of everyday use.',
        pt: 'Produtos que costumam fazer parte do consumo do dia a dia.'
      },
      order: 1,
      active: true
    },
    {
      id: 'alimentacion',
      name: { es: 'Alimentación', en: 'Feeding', pt: 'Alimentação' },
      description: {
        es: 'Lo relacionado con las tomas y con empezar a comer.',
        en: 'Everything around feeds and starting solid food.',
        pt: 'O que tem a ver com as mamadas e com começar a comer.'
      },
      order: 2,
      active: true
    },
    {
      id: 'equipamiento',
      name: { es: 'Tecnología y equipamiento', en: 'Gear and equipment', pt: 'Tecnologia e equipamentos' },
      description: {
        es: 'Compras grandes que se hacen una vez.',
        en: 'Larger purchases you usually make once.',
        pt: 'Compras maiores, que costumam ser feitas uma vez.'
      },
      order: 3,
      active: true
    },
    {
      id: 'complementarios',
      name: { es: 'Complementarios', en: 'Extras', pt: 'Complementares' },
      description: {
        es: 'Juego, libros, ropa, accesorios y regalos.',
        en: 'Play, books, clothing, accessories and gifts.',
        pt: 'Brincadeiras, livros, roupas, acessórios e presentes.'
      },
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
    { id: 'panales',        groupId: 'recompra',        name: { es: 'Pañales', en: 'Diapers', pt: 'Fraldas' },                     order: 1, active: true },
    { id: 'toallitas',      groupId: 'recompra',        name: { es: 'Toallitas', en: 'Wipes', pt: 'Lenços umedecidos' },                   order: 2, active: true },
    { id: 'cremas',         groupId: 'recompra',        name: { es: 'Cremas para pañal', en: 'Diaper cream', pt: 'Pomadas para assadura' },           order: 3, active: true },
    { id: 'bano',           groupId: 'recompra',        name: { es: 'Shampoo y jabón', en: 'Shampoo and soap', pt: 'Xampu e sabonete' },             order: 4, active: true },
    { id: 'higiene',        groupId: 'recompra',        name: { es: 'Productos de higiene', en: 'Hygiene products', pt: 'Produtos de higiene' },        order: 5, active: true },

    { id: 'biberones',      groupId: 'alimentacion',    name: { es: 'Biberones y tetinas', en: 'Bottles and nipples', pt: 'Mamadeiras e bicos' },         order: 1, active: true },
    { id: 'bolsas-leche',   groupId: 'alimentacion',    name: { es: 'Bolsas de almacenamiento', en: 'Milk storage bags', pt: 'Sacos para armazenar leite' },    order: 2, active: true },
    { id: 'lactancia',      groupId: 'alimentacion',    name: { es: 'Accesorios de lactancia', en: 'Breastfeeding accessories', pt: 'Acessórios de amamentação' },     order: 3, active: true },
    { id: 'baberos',        groupId: 'alimentacion',    name: { es: 'Baberos', en: 'Bibs', pt: 'Babadores' },                     order: 4, active: true },
    { id: 'complementaria', groupId: 'alimentacion',    name: { es: 'Alimentación complementaria', en: 'Starting solids', pt: 'Introdução alimentar' }, order: 5, active: true },

    { id: 'extractores',    groupId: 'equipamiento',    name: { es: 'Extractores de leche', en: 'Breast pumps', pt: 'Bombas de leite' },        order: 1, active: true },
    { id: 'monitores',      groupId: 'equipamiento',    name: { es: 'Monitores', en: 'Baby monitors', pt: 'Babás eletrônicas' },                   order: 2, active: true },
    { id: 'portabebe',      groupId: 'equipamiento',    name: { es: 'Mochilas portabebé', en: 'Baby carriers', pt: 'Canguros e slings' },          order: 3, active: true },
    { id: 'sillas',         groupId: 'equipamiento',    name: { es: 'Sillas de alimentación', en: 'High chairs', pt: 'Cadeiras de alimentação' },      order: 4, active: true },
    { id: 'cunas',          groupId: 'equipamiento',    name: { es: 'Cunas y accesorios', en: 'Cribs and accessories', pt: 'Berços e acessórios' },          order: 5, active: true },

    { id: 'juguetes',       groupId: 'complementarios', name: { es: 'Juguetes de desarrollo', en: 'Developmental toys', pt: 'Brinquedos de estímulo' },      order: 1, active: true },
    { id: 'libros',         groupId: 'complementarios', name: { es: 'Libros', en: 'Books', pt: 'Livros' },                      order: 2, active: true },
    { id: 'ropa',           groupId: 'complementarios', name: { es: 'Ropa', en: 'Clothing', pt: 'Roupas' },                        order: 3, active: true },
    { id: 'accesorios',     groupId: 'complementarios', name: { es: 'Accesorios', en: 'Accessories', pt: 'Acessórios' },                  order: 4, active: true },
    { id: 'regalos',        groupId: 'complementarios', name: { es: 'Regalos', en: 'Gifts', pt: 'Presentes' },                     order: 5, active: true }
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
      name: { es: 'Producto de ejemplo · Pañales talla 1', en: 'Sample product · Size 1 diapers', pt: 'Produto de exemplo · Fraldas tamanho 1' },
      description: { es: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.', en: 'Sample description. A short line about the product will go here.', pt: 'Descrição de exemplo. Aqui vai uma linha sobre o produto.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: { es: 'Ejemplo', en: 'Sample', pt: 'Exemplo' }, countries: ['CL'], active: true, placeholder: true
    },
    {
      id: 'ej-panales-2', categoryId: 'panales', merchantId: 'ejemplo-cl',
      name: { es: 'Producto de ejemplo · Pañales talla 2', en: 'Sample product · Size 2 diapers', pt: 'Produto de exemplo · Fraldas tamanho 2' },
      description: { es: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.', en: 'Sample description. A short line about the product will go here.', pt: 'Descrição de exemplo. Aqui vai uma linha sobre o produto.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: { es: 'Ejemplo', en: 'Sample', pt: 'Exemplo' }, countries: ['CL'], active: true, placeholder: true
    },
    {
      id: 'ej-panales-3', categoryId: 'panales', merchantId: 'ejemplo-us',
      name: { es: 'Producto de ejemplo · Pañales (EE. UU.)', en: 'Sample product · Diapers (US)', pt: 'Produto de exemplo · Fraldas (EUA)' },
      description: { es: 'Descripción de ejemplo. Solo aparece si el país es EE. UU.', en: 'Sample description. Only shown when the country is the United States.', pt: 'Descrição de exemplo. Só aparece se o país for os Estados Unidos.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: { es: 'Ejemplo', en: 'Sample', pt: 'Exemplo' }, countries: ['US'], active: true, placeholder: true
    },
    {
      id: 'ej-biberones-1', categoryId: 'biberones', merchantId: 'ejemplo-cl',
      name: { es: 'Producto de ejemplo · Biberón', en: 'Sample product · Bottle', pt: 'Produto de exemplo · Mamadeira' },
      description: { es: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.', en: 'Sample description. A short line about the product will go here.', pt: 'Descrição de exemplo. Aqui vai uma linha sobre o produto.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: { es: 'Ejemplo', en: 'Sample', pt: 'Exemplo' }, countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-biberones-2', categoryId: 'biberones', merchantId: 'ejemplo-cl',
      name: { es: 'Producto de ejemplo · Set de tetinas', en: 'Sample product · Nipple set', pt: 'Produto de exemplo · Kit de bicos' },
      description: { es: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.', en: 'Sample description. A short line about the product will go here.', pt: 'Descrição de exemplo. Aqui vai uma linha sobre o produto.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: { es: 'Ejemplo', en: 'Sample', pt: 'Exemplo' }, countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-extractores-1', categoryId: 'extractores', merchantId: 'ejemplo-cl',
      name: { es: 'Producto de ejemplo · Extractor', en: 'Sample product · Breast pump', pt: 'Produto de exemplo · Bomba de leite' },
      description: { es: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.', en: 'Sample description. A short line about the product will go here.', pt: 'Descrição de exemplo. Aqui vai uma linha sobre o produto.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: { es: 'Ejemplo', en: 'Sample', pt: 'Exemplo' }, countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-juguetes-1', categoryId: 'juguetes', merchantId: 'ejemplo-cl',
      name: { es: 'Producto de ejemplo · Juguete', en: 'Sample product · Toy', pt: 'Produto de exemplo · Brinquedo' },
      description: { es: 'Descripción de ejemplo. Aquí irá una línea sobre el producto.', en: 'Sample description. A short line about the product will go here.', pt: 'Descrição de exemplo. Aqui vai uma linha sobre o produto.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: { es: 'Ejemplo', en: 'Sample', pt: 'Exemplo' }, countries: ['CL', 'US'], active: true, placeholder: true
    },
    {
      id: 'ej-retirado', categoryId: 'juguetes', merchantId: 'ejemplo-cl',
      name: { es: 'Producto de ejemplo · Retirado', en: 'Sample product · Withdrawn', pt: 'Produto de exemplo · Retirado' },
      description: { es: 'Este lleva active: false y no debe aparecer en ningún sitio.', en: 'This one has active: false and must not appear anywhere.', pt: 'Este tem active: false e não deve aparecer em lugar nenhum.' },
      image: null, imageAlt: null, url: null, affiliateUrl: null,
      price: null, badge: null, countries: ['CL', 'US'], active: false, placeholder: true
    }
  ]
};
