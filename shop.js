/* =========================================================================
   CAPA COMERCIAL — "Descubre productos".

   Módulo independiente. No lee ni escribe los registros del bebé, no toca
   localStorage, no comparte estado con app.js y no llama a ninguna de sus
   funciones. Su único punto de contacto con la página es el contenedor
   vacío #shopMount de index.html.

   Si se quita el <script> de este archivo, la aplicación queda exactamente
   como antes: la sección simplemente no aparece.

   Los datos vienen de catalog.js (window.MBH_CATALOG). Este archivo no
   contiene ningún producto, tienda ni enlace.
   ========================================================================= */
(function () {
  'use strict';

  var I18N = window.MBH_I18N;
  var mount = document.getElementById('shopMount');
  var catalog = window.MBH_CATALOG;
  if (!mount || !catalog || !I18N) return;   // sin catálogo, la sección no existe

  var t = I18N.t, tp = I18N.tp, pick = I18N.pick;

  /* Clave propia: el país de compra NO se guarda junto a los datos del bebé
     ni junto al idioma. Son variables distintas y viven separadas. */
  var SHOP_KEY = 'mbh.shop.v1';

  function readCountry() {
    try {
      var raw = localStorage.getItem(SHOP_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return (d && typeof d.country === 'string') ? d.country : null;
    } catch (e) { return null; }
  }
  function writeCountry(code) {
    try { localStorage.setItem(SHOP_KEY, JSON.stringify({ country: code })); } catch (e) {}
  }

  /* Estado propio del módulo. Vive en memoria y no se guarda en ningún
     sitio: la capa comercial no persiste nada en el dispositivo. */
  var view = { level: 'groups', categoryId: null };
  var country = readCountry() || catalog.defaultCountry || null;
  var lastFocus = null;
  var slot = null;

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function byOrder(a, b) { return (a.order || 0) - (b.order || 0); }
  function label(x) { return pick(x); }
  function isActive(x) { return x && x.active !== false; }
  function inCountry(x) {
    if (!country || !x.countries || !x.countries.length) return true;
    return x.countries.indexOf(country) >= 0;
  }

  function activeCountries() {
    return (catalog.countries || []).filter(isActive);
  }
  function merchantOf(p) {
    var list = catalog.merchants || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === p.merchantId) return list[i];
    return null;
  }
  function categoryOf(id) {
    var list = catalog.categories || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function groupOf(id) {
    var list = catalog.groups || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function categoriesOf(groupId) {
    return (catalog.categories || [])
      .filter(function (c) { return c.groupId === groupId && isActive(c); })
      .sort(byOrder);
  }

  /* Productos visibles de una categoría: activos, del país elegido y con
     un comercio activo que opere en ese país. */
  function productsOf(categoryId) {
    return (catalog.products || []).filter(function (p) {
      if (p.categoryId !== categoryId || !isActive(p) || !inCountry(p)) return false;
      var m = merchantOf(p);
      if (!m || !isActive(m)) return false;
      return inCountry(m);
    });
  }

  /* Enlace final hacia el comercio. Si el producto ya trae affiliateUrl se
     usa tal cual. Si no, y el comercio tiene programa de afiliados
     configurado, se añade su parámetro a la URL normal. Sin nada de eso,
     devuelve null y el botón queda desactivado. */
  function outboundUrl(p) {
    if (p.placeholder) return null;
    if (p.affiliateUrl) return p.affiliateUrl;
    if (!p.url) return null;
    var m = merchantOf(p);
    if (m && m.affiliate && m.affiliate.program && m.affiliate.param && m.affiliate.value) {
      try {
        var u = new URL(p.url);
        u.searchParams.set(m.affiliate.param, m.affiliate.value);
        return u.href;
      } catch (e) {
        return p.url;
      }
    }
    return p.url;
  }

  /* ---------------------------------------------------------------------
     Acceso en la columna lateral
     --------------------------------------------------------------------- */
  function renderEntry() {
    mount.innerHTML =
      '<section class="shop-entry">' +
        '<div class="shop-entry-eyebrow">' + esc(t('shop.name')) + '</div>' +
        '<p class="shop-entry-desc">' + esc(t('shop.desc')) + '</p>' +
        '<button type="button" class="shop-entry-btn" data-shop-open="1">' + esc(t('shop.enter')) + '</button>' +
      '</section>';
    mount.querySelector('[data-shop-open]').addEventListener('click', open);
  }

  /* ---------------------------------------------------------------------
     Panel
     --------------------------------------------------------------------- */
  function open() {
    if (slot) return;
    lastFocus = document.activeElement;
    view = { level: 'groups', categoryId: null };
    slot = document.createElement('div');
    slot.id = 'shopSlot';
    document.body.appendChild(slot);
    document.body.classList.add('mbh-locked');
    render();
  }

  function close() {
    if (!slot) return;
    slot.parentNode.removeChild(slot);
    slot = null;
    document.body.classList.remove('mbh-locked');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  function render() {
    if (!slot) return;
    var countries = activeCountries();
    var head =
      '<div class="shop-head">' +
        (view.level === 'category'
          ? '<button type="button" class="shop-back" data-shop-back="1"><span aria-hidden="true">&lsaquo;</span> ' + esc(t('shop.back')) + '</button>'
          : '') +
        '<div class="shop-head-top">' +
          '<div>' +
            '<h2 class="shop-title" id="shopTitle">' + esc(t('shop.name')) + '</h2>' +
            '<p class="shop-desc">' + esc(t('shop.desc')) + '</p>' +
          '</div>' +
          '<button type="button" class="shop-close" aria-label="' + esc(t('form.close')) + '" data-shop-close="1">×</button>' +
        '</div>' +
        (countries.length > 1
          ? '<div class="shop-country">' +
              '<label for="shopCountry">' + esc(t('shop.country')) + '</label>' +
              '<select id="shopCountry">' + countries.map(function (c) {
                return '<option value="' + esc(c.code) + '"' + (c.code === country ? ' selected' : '') + '>' + esc(label(c.name)) + '</option>';
              }).join('') + '</select>' +
            '</div>'
          : '') +
      '</div>';

    slot.innerHTML =
      '<div class="shop-overlay" data-shop-backdrop="1">' +
        '<div class="shop" role="dialog" aria-modal="true" aria-labelledby="shopTitle">' +
          head +
          '<div class="shop-body">' +
            noticeHtml() +
            (view.level === 'category' ? categoryHtml() : groupsHtml()) +
            footHtml() +
          '</div>' +
        '</div>' +
      '</div>';

    bind();
    var first = slot.querySelector('.shop-back, .shop-cat, .shop-close');
    if (first) first.focus();
  }

  function noticeHtml() {
    if (!catalog.demoNotice) return '';
    return '<div class="shop-notice" role="note">' + t('shop.demo') + esc(label(catalog.demoNotice)) + '</div>';
  }

  function groupsHtml() {
    var groups = (catalog.groups || []).filter(isActive).sort(byOrder);
    if (!groups.length) {
      return '<div class="shop-empty">' + esc(t('shop.emptyAll')) + '</div>';
    }
    return groups.map(function (g) {
      var cats = categoriesOf(g.id);
      if (!cats.length) return '';
      return '<section class="shop-group">' +
        '<div class="shop-group-name">' + esc(label(g.name)) + '</div>' +
        (g.description ? '<p class="shop-group-desc">' + esc(label(g.description)) + '</p>' : '') +
        '<div class="shop-cats">' + cats.map(function (c) {
          var n = productsOf(c.id).length;
          return '<button type="button" class="shop-cat" data-shop-cat="' + esc(c.id) + '">' +
            '<span>' + esc(label(c.name)) + '</span>' +
            '<span class="shop-cat-count">' + esc(n ? tp('shop.options', n) : t('shop.noOptions')) +
            ' <span class="shop-cat-arrow" aria-hidden="true">&rsaquo;</span></span>' +
          '</button>';
        }).join('') + '</div>' +
      '</section>';
    }).join('');
  }

  function categoryHtml() {
    var cat = categoryOf(view.categoryId);
    if (!cat) return '<div class="shop-empty">' + esc(t('shop.goneCat')) + '</div>';
    var group = groupOf(cat.groupId);
    var items = productsOf(cat.id);
    var body = items.length
      ? '<div class="shop-list">' + items.map(itemHtml).join('') + '</div>'
      : '<div class="shop-empty">' + t('shop.emptyCat') + '</div>';
    return '<h3 class="shop-cat-title">' + esc(label(cat.name)) + '</h3>' +
      '<p class="shop-cat-sub">' + esc(group ? label(group.name) : '') + '</p>' +
      body;
  }

  function itemHtml(p) {
    var m = merchantOf(p);
    var href = outboundUrl(p);
    var name = label(p.name);
    var thumb = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(label(p.imageAlt) || name) + '" loading="lazy" />'
      : '<span>' + esc(t('shop.noImage')) + '</span>';

    var cta = href
      ? '<a class="shop-cta" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer nofollow sponsored" ' +
          'aria-label="' + esc(t('shop.viewAria', { name: name, merchant: m ? m.name : '' })) + '">' +
          esc(t('shop.view')) + ' <span class="shop-cta-ext" aria-hidden="true">&#8599;</span></a>'
      : '<span class="shop-cta shop-cta--off">' + esc(t('shop.pending')) + '</span>';

    return '<article class="shop-item">' +
      '<div class="shop-thumb"' + (p.image ? '' : ' aria-hidden="true"') + '>' + thumb + '</div>' +
      '<div class="shop-item-body">' +
        (p.badge ? '<span class="shop-badge">' + esc(label(p.badge)) + '</span>' : '') +
        '<h4 class="shop-name">' + esc(name) + '</h4>' +
        (p.description ? '<p class="shop-item-desc">' + esc(label(p.description)) + '</p>' : '') +
        '<div class="shop-meta">' + esc(m ? m.name : t('shop.noMerchant')) +
          (p.price ? ' · <span class="shop-price">' + esc(p.price) + '</span>' : '') +
        '</div>' +
        cta +
      '</div>' +
    '</article>';
  }

  function footHtml() {
    var parts = [];
    if (catalog.disclosure) parts.push('<p>' + esc(label(catalog.disclosure)) + '</p>');
    parts.push('<p>' + esc(t('shop.foot1', { brand: I18N.BRAND })) + '</p>');
    parts.push('<p>' + esc(t('shop.foot2')) + '</p>');
    return '<div class="shop-foot">' + parts.join('') + '</div>';
  }

  /* ---------------------------------------------------------------------
     Eventos del panel
     --------------------------------------------------------------------- */
  function bind() {
    slot.addEventListener('click', function (e) {
      if (e.target.closest('[data-shop-close]')) { close(); return; }
      if (e.target.closest('[data-shop-back]')) { view = { level: 'groups', categoryId: null }; render(); return; }
      var cat = e.target.closest('[data-shop-cat]');
      if (cat) { view = { level: 'category', categoryId: cat.getAttribute('data-shop-cat') }; render(); return; }
      if (e.target.hasAttribute && e.target.hasAttribute('data-shop-backdrop')) close();
    });

    var sel = slot.querySelector('#shopCountry');
    if (sel) sel.addEventListener('change', function () {
      country = this.value;
      writeCountry(country);      // se recuerda; el idioma no cambia
      render();
    });

    slot.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var panel = slot.querySelector('.shop');
      if (!panel) return;
      var f = [];
      var all = panel.querySelectorAll('a[href], button, select, input, [tabindex]:not([tabindex="-1"])');
      for (var i = 0; i < all.length; i++) if (!all[i].disabled && !all[i].hidden) f.push(all[i]);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  renderEntry();

  /* Al cambiar el idioma se repinta la sección. El país no se toca. */
  I18N.onChange(function () {
    renderEntry();
    if (slot) render();
  });

  /* Punto de entrada mínimo para pruebas y para abrir la sección desde
     fuera si algún día hiciera falta. No expone datos del bebé. */
  window.MBH_SHOP = { open: open, close: close, get country() { return country; } };

})();
