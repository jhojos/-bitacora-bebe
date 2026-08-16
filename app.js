/* =========================================================================
   Bitácora Bebé — lógica de la aplicación.

   El sistema REGISTRA, ORGANIZA, CALCULA, CONSULTA y COMPARTE.
   No interpreta, no diagnostica y no recomienda.

   Todo ocurre en el dispositivo: los datos viven en localStorage y ni el
   PDF ni el respaldo salen del navegador. No hay peticiones de red.
   ========================================================================= */
(function () {
  'use strict';

  /* Nombre visible en los documentos generados (PDF y texto de compartir).
     Cambiar estas dos líneas renombra la aplicación en todas sus salidas;
     el rótulo de la cabecera está en index.html. */
  var I18N = window.MBH_I18N;
  var t = I18N.t, tp = I18N.tp;
  var APP_NAME = I18N.BRAND;                 // la marca no se traduce

  /* Identificación del formato de respaldo. La versión permite migrar el
     modelo de datos en el futuro sin romper los archivos ya guardados. */
  var APP_ID = 'bitacora-bebe';
  var BACKUP_APP_NAME = 'Bitácora Bebé';     // etiqueta interna del respaldo, no se muestra
  var BACKUP_VERSION = 1;
  var BACKUP_PREFIX = 'Bitacora_Bebe_Respaldo_';

  /* ---------------------------------------------------------------------
     Catálogo de categorías (idéntico al prototipo de diseño)
     --------------------------------------------------------------------- */
  /* Los identificadores (feed, sleep, breastmilk, fever…) son estables y no
     dependen del idioma. La letra del distintivo forma parte del diseño y es
     la misma en los tres idiomas. Las etiquetas visibles salen del
     diccionario mediante catLabel / catShort / typeLabel. */
  var CATS = {
    feed:   { color: 'oklch(0.55 0.10 40)',  initial: 'A', types: ['breastmilk', 'expressed', 'formula', 'food', 'other'] },
    sleep:  { color: 'oklch(0.45 0.09 265)', initial: 'S', types: null },
    care:   { color: 'oklch(0.48 0.08 200)', initial: 'H', types: ['wetdiaper', 'stool', 'bath', 'other'] },
    health: { color: 'oklch(0.5 0.11 15)',   initial: 'L', types: ['fever', 'cough', 'diarrhea', 'vomiting', 'congestion', 'rash', 'pain', 'lethargy', 'appetiteloss', 'other'] },
    med:    { color: 'oklch(0.45 0.10 320)', initial: 'M', types: null },
    note:   { color: 'oklch(0.44 0.07 150)', initial: 'O', types: null }
  };

  function catLabel(k) { return t('cat.' + k + '.label'); }
  function catShort(k) { return t('cat.' + k + '.short'); }
  /* Si llega un valor que el diccionario no conoce (por ejemplo un respaldo
     editado a mano), se muestra tal cual en vez de perderlo. */
  function typeLabel(id) { var v = t('type.' + id); return v === 'type.' + id ? id : v; }
  function unitLabel(id) { var v = t('unit.' + id); return v === 'unit.' + id ? id : v; }

  /* Equivalencias del modelo anterior, que guardaba el texto en español.
     Se aplican al cargar y al importar, y son idempotentes. */
  var LEGACY_TYPES = {
    'Leche materna': 'breastmilk', 'Leche extraída': 'expressed', 'Fórmula': 'formula',
    'Alimento': 'food', 'Pañal mojado': 'wetdiaper', 'Deposición': 'stool', 'Baño': 'bath',
    'Fiebre': 'fever', 'Tos': 'cough', 'Diarrea': 'diarrhea', 'Vómitos': 'vomiting',
    'Congestión': 'congestion', 'Erupción': 'rash', 'Dolor': 'pain',
    'Decaimiento': 'lethargy', 'Falta de apetito': 'appetiteloss', 'Otro': 'other'
  };
  var LEGACY_UNITS = { 'gotas': 'drops', 'comprimido': 'tablet', 'sobre': 'sachet' };

  function migrateEvent(ev) {
    if (ev.type && LEGACY_TYPES[ev.type]) ev.type = LEGACY_TYPES[ev.type];
    if (ev.unit && LEGACY_UNITS[ev.unit]) ev.unit = LEGACY_UNITS[ev.unit];
    return ev;
  }
  var ORDER = ['feed', 'sleep', 'care', 'health', 'med', 'note'];
  var STORE_KEY = 'mbh.v1';
  var DAY = 86400000;

  /* ---------------------------------------------------------------------
     Estado
     --------------------------------------------------------------------- */
  var state = {
    child: '',
    events: [],
    dateKey: null,
    form: null,
    share: null,
    now: Date.now()
  };

  var $ = function (id) { return document.getElementById(id); };
  var toastTimer = null;
  var lastFocus = null;

  /* ---------------------------------------------------------------------
     Utilidades de fecha y formato
     --------------------------------------------------------------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayStart(key) { var p = key.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 0, 0, 0, 0).getTime(); }
  function shiftKey(key, n) { var d = new Date(dayStart(key)); d.setDate(d.getDate() + n); return keyOf(d); }
  function fmtTime(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtDay(key, withYear) {
    var d = new Date(dayStart(key));
    var o = { weekday: 'long', day: 'numeric', month: 'long' };
    if (withYear) o.year = 'numeric';
    return d.toLocaleDateString(I18N.locale, o);
  }
  function fmtShortDay(key) { return new Date(dayStart(key)).toLocaleDateString(I18N.locale, { day: 'numeric', month: 'short' }); }
  function fmtDur(min) {
    var m = Math.max(0, Math.round(min));
    var H = t('dur.h'), MIN = t('dur.min');
    if (m < 60) return m + ' ' + MIN;
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + ' ' + H + ' ' + r + ' ' + MIN : h + ' ' + H;
  }
  function mk(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    var p = dateStr.split('-'), t = timeStr.split(':');
    var ms = new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1], 0, 0).getTime();
    return isNaN(ms) ? null : ms;
  }
  function overlapMin(a, b, s, e) { return Math.max(0, Math.min(b, e) - Math.max(a, s)) / 60000; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ---------------------------------------------------------------------
     Persistencia
     --------------------------------------------------------------------- */
  function load() {
    var events = [], child = '';
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        events = Array.isArray(d.events) ? d.events : [];
        child = typeof d.child === 'string' ? d.child : '';
      }
    } catch (e) { /* almacenamiento no disponible */ }
    state.events = events.map(migrateEvent);
    state.child = child;
  }
  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ v: 1, child: state.child, events: state.events }));
    } catch (e) {
      toast(t('toast.noStorage'));
    }
  }

  /* ---------------------------------------------------------------------
     Lectura de eventos
     --------------------------------------------------------------------- */
  function sleepEnd(ev) { return ev.endAt || state.now; }

  function detailOf(ev) {
    var c = ev.cat, parts = [];
    if (c === 'sleep') {
      var s = fmtTime(ev.at);
      if (!ev.endAt) return t('sleep.toNow', { start: s, dur: fmtDur((state.now - ev.at) / 60000) });
      var cross = keyOf(new Date(ev.at)) !== keyOf(new Date(ev.endAt));
      var e = (cross ? fmtShortDay(keyOf(new Date(ev.endAt))) + ' ' : '') + fmtTime(ev.endAt);
      return s + ' → ' + e + ' · ' + fmtDur((ev.endAt - ev.at) / 60000);
    }
    if (c === 'med') {
      parts.push(ev.med || t('form.med'));
      if (ev.amount) parts.push(ev.amount + (ev.unit ? ' ' + unitLabel(ev.unit) : ''));
      if (ev.reason) parts.push(t('pdf.reason', { v: ev.reason }));
      return parts.join(' · ');
    }
    if (c === 'note') return ev.text || t('form.note');
    // El texto de "Otro" lo escribió la persona: se muestra tal cual.
    var lab = ev.type === 'other' ? (ev.other ? ev.other : typeLabel('other')) : typeLabel(ev.type);
    parts.push(ev.type ? lab : '—');
    if (c === 'feed' && ev.amount) parts.push(ev.amount + (ev.unit ? ' ' + unitLabel(ev.unit) : ''));
    if (c === 'health' && ev.temp) parts.push(t('pdf.tempRecorded', { v: ev.temp }));
    return parts.join(' · ');
  }

  /* Filas de un día. El sueño que cruza medianoche aparece en ambos días,
     marcado como continuación, sin duplicar la duración. */
  function dayRows(key) {
    var a = dayStart(key), b = a + DAY, rows = [];
    state.events.forEach(function (ev) {
      if (ev.cat === 'sleep') {
        var end = sleepEnd(ev);
        if (end <= a || ev.at >= b) return;
        var cont = ev.at < a;
        rows.push({ ev: ev, sort: cont ? a : ev.at, cont: cont });
      } else if (ev.at >= a && ev.at < b) {
        rows.push({ ev: ev, sort: ev.at, cont: false });
      }
    });
    rows.sort(function (x, y) { return x.sort - y.sort; });
    return rows;
  }

  /* Resumen puramente descriptivo: conteos y minutos que caen dentro del día. */
  function daySummary(key) {
    var a = dayStart(key), b = a + DAY;
    var counts = { feed: 0, care: 0, health: 0, med: 0, note: 0 };
    var periods = 0, mins = 0;
    state.events.forEach(function (ev) {
      if (ev.cat === 'sleep') {
        var end = sleepEnd(ev);
        if (end <= a || ev.at >= b) return;
        periods++;
        mins += overlapMin(a, b, ev.at, end);
      } else if (ev.at >= a && ev.at < b && counts[ev.cat] !== undefined) {
        counts[ev.cat]++;
      }
    });
    return { counts: counts, periods: periods, mins: mins };
  }

  function regLabel(n) { return tp('count.records', n); }

  /* Métricas simples del día. Todo se calcula sobre los mismos tramos que ya
     usa el resumen, así que un sueño que cruza medianoche aporta a cada día
     solo la parte que le corresponde. No se estima ni se completa nada. */
  function dayMetrics(key) {
    var rows = dayRows(key), a = dayStart(key), b = a + DAY;
    var longest = 0, sleeps = 0;
    rows.forEach(function (x) {
      if (x.ev.cat !== 'sleep') return;
      sleeps++;
      var m = overlapMin(a, b, x.ev.at, sleepEnd(x.ev));
      if (m > longest) longest = m;
    });
    return {
      total: rows.length,
      first: rows.length ? rows[0] : null,
      last: rows.length ? rows[rows.length - 1] : null,
      longest: sleeps ? longest : 0
    };
  }

  function rowLabel(x) {
    return (x.cont ? '00:00' : fmtTime(x.ev.at)) + ' · ' + catShort(x.ev.cat);
  }
  function dot(color, size) {
    var s = size || 10;
    return 'width:' + s + 'px;height:' + s + 'px;border-radius:50%;flex:none;background:' + color;
  }

  /* ---------------------------------------------------------------------
     Aviso breve
     --------------------------------------------------------------------- */
  function toast(text) {
    clearTimeout(toastTimer);
    $('toastSlot').innerHTML = '<div role="status" class="toast">' + esc(text) + '</div>';
    toastTimer = setTimeout(function () { $('toastSlot').innerHTML = ''; }, 2800);
  }

  /* ---------------------------------------------------------------------
     Render principal
     --------------------------------------------------------------------- */
  function renderRegGrid() {
    var html = ORDER.map(function (k) {
      var c = CATS[k];
      return '<button type="button" class="reg-btn" data-open="' + k + '">' +
        '<span class="cat-badge" style="background:' + c.color + '">' + c.initial + '</span>' +
        '<span>' + esc(catLabel(k)) + '</span></button>';
    }).join('');
    $('regGrid').innerHTML = html;
  }

  function renderHeader() {
    var key = state.dateKey, todayKey = keyOf(new Date());
    var childEl = $('child'), dateEl = $('datePick');
    if (document.activeElement !== childEl && childEl.value !== state.child) childEl.value = state.child;
    if (document.activeElement !== dateEl && dateEl.value !== key) dateEl.value = key;
    // La ayuda solo aparece mientras no hay nombre: después estorba.
    $('childHint').hidden = !!state.child.trim();
    $('dateLabel').textContent = cap(fmtDay(key)) + (key === todayKey ? t('header.todaySuffix') : '');
  }

  function renderOngoing() {
    var ev = null;
    for (var i = 0; i < state.events.length; i++) {
      if (state.events[i].cat === 'sleep' && !state.events[i].endAt) { ev = state.events[i]; break; }
    }
    var slot = $('ongoingSlot');
    if (!ev) { if (slot.innerHTML) slot.innerHTML = ''; return; }
    var detail = t('sleep.ongoingFrom', {
      date: fmtShortDay(keyOf(new Date(ev.at))), time: fmtTime(ev.at),
      dur: fmtDur((state.now - ev.at) / 60000)
    });
    slot.innerHTML =
      '<div class="ongoing">' +
        '<div class="ongoing-left">' +
          '<span class="ongoing-pulse"></span>' +
          '<div><div class="ongoing-title">' + esc(t('sleep.ongoingTitle')) + '</div>' +
          '<div class="ongoing-detail">' + esc(detail) + '</div></div>' +
        '</div>' +
        '<div class="ongoing-actions">' +
          '<button type="button" class="ongoing-ghost" data-editsleep="' + ev.id + '">' + esc(t('sleep.editHours')) + '</button>' +
          '<button type="button" class="ongoing-solid" data-finishsleep="' + ev.id + '">' + esc(t('sleep.finishNow')) + '</button>' +
        '</div>' +
      '</div>';
  }

  function renderTimeline() {
    var rows = dayRows(state.dateKey);
    $('tlCount').textContent = rows.length ? regLabel(rows.length) : '';
    if (!rows.length) {
      // En un día pasado, "hoy empieza una nueva página" sería falso.
      var texto = t(state.dateKey === keyOf(new Date()) ? 'timeline.emptyToday' : 'timeline.emptyOther');
      $('timeline').innerHTML = '<div class="tl-empty">' + texto + '</div>';
      return;
    }
    $('timeline').innerHTML = rows.map(function (x) {
      var c = CATS[x.ev.cat];
      var catTxt = catShort(x.ev.cat) + ((x.ev.cat === 'sleep' && !x.ev.endAt) ? ' · ' + t('timeline.ongoing') : '');
      return '<div class="tl-row">' +
        '<div class="tl-timecol">' +
          '<div class="tl-time">' + (x.cont ? '00:00' : fmtTime(x.ev.at)) + '</div>' +
          '<div class="tl-sub">' + (x.cont ? esc(t('timeline.fromYesterday')) : '') + '</div>' +
        '</div>' +
        '<div class="tl-dotcol"><span style="' + dot(c.color, 11) + '"></span></div>' +
        '<div class="tl-body">' +
          '<div class="tl-cat" style="color:' + c.color + '">' + esc(catTxt) + '</div>' +
          '<div class="tl-detail">' + esc(detailOf(x.ev)) + '</div>' +
          (x.ev.note ? '<div class="tl-note">' + esc(x.ev.note) + '</div>' : '') +
        '</div>' +
        '<div class="tl-actions">' +
          '<button type="button" class="icon-btn" aria-label="' + esc(t('timeline.edit')) + '" data-edit="' + x.ev.id + '">' + esc(t('timeline.edit').split(' ')[0]) + '</button>' +
          '<button type="button" class="icon-btn icon-btn--x" aria-label="' + esc(t('timeline.delete')) + '" data-del="' + x.ev.id + '">×</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderSummary() {
    var s = daySummary(state.dateKey);
    var m = dayMetrics(state.dateKey);
    var isToday = state.dateKey === keyOf(new Date());

    var head = m.total
      ? t(isToday ? 'summary.todayCount' : 'summary.dayCount', { n: esc(regLabel(m.total)) })
      : t('summary.empty');

    var items = [
      { k: 'feed', value: regLabel(s.counts.feed) },
      { k: 'sleep', value: s.periods ? tp('count.periods', s.periods) + ' · ' + fmtDur(s.mins) : tp('count.periods', 0) },
      { k: 'care', value: regLabel(s.counts.care) },
      { k: 'health', value: regLabel(s.counts.health) },
      { k: 'med', value: regLabel(s.counts.med) },
      { k: 'note', value: regLabel(s.counts.note) }
    ];

    var extra = [];
    if (m.total) {
      extra.push({ label: t('summary.first'), value: rowLabel(m.first) });
      if (m.total > 1) extra.push({ label: t('summary.last'), value: rowLabel(m.last) });
      if (m.longest > 0) extra.push({ label: t('summary.longestSleep'), value: fmtDur(m.longest) });
    }

    $('summary').innerHTML =
      '<div class="sum-total">' + head + '</div>' +
      items.map(function (it) {
        var c = CATS[it.k];
        return '<div class="sum-row">' +
          '<span style="' + dot(c.color, 10) + '"></span>' +
          '<div class="sum-label">' + esc(catShort(it.k)) + '</div>' +
          '<div class="sum-value">' + esc(it.value) + '</div>' +
        '</div>';
      }).join('') +
      extra.map(function (it) {
        return '<div class="sum-row">' +
          '<span class="sum-gap"></span>' +
          '<div class="sum-label">' + esc(it.label) + '</div>' +
          '<div class="sum-value">' + esc(it.value) + '</div>' +
        '</div>';
      }).join('') +
      (m.total ? '<div class="sum-close">' + esc(t('summary.close')) + '</div>' : '');
  }

  /* Selector de idioma. Es el mismo diálogo la primera vez y cuando se
     cambia después: un solo componente, sin pantalla de configuración. */
  var pendingLangChoice = false;

  function renderLangBtn() {
    var b = $('langBtn');
    b.textContent = I18N.lang.toUpperCase();
    b.setAttribute('aria-label', t('lang.name') + ': ' + I18N.names[I18N.lang]);
    $('brandTxt').textContent = APP_NAME + ' · ' + t('app.tagline');
  }

  function openLangDialog(firstTime) {
    pendingLangChoice = !!firstTime;
    var opts = I18N.langs.map(function (code) {
      return '<button type="button" class="lang-opt' + (code === I18N.lang ? ' on' : '') + '" data-lang="' + code + '">' +
        '<span aria-hidden="true">' + I18N.flags[code] + '</span> ' + esc(I18N.names[code]) + '</button>';
    }).join('');
    openModal(
      '<div class="overlay overlay--confirm">' +
        '<div class="sheet sheet--confirm" role="dialog" aria-modal="true" data-stop="1">' +
          '<div class="confirm-title">' + esc(t('lang.title')) + '</div>' +
          '<div class="confirm-body">' + esc(t('lang.desc')) + '</div>' +
          '<div class="lang-opts">' + opts + '</div>' +
        '</div>' +
      '</div>'
    );
    $('modalSlot').querySelector('.lang-opts').addEventListener('click', function (e) {
      var b = e.target.closest('[data-lang]');
      if (!b) return;
      pendingLangChoice = false;
      var code = b.getAttribute('data-lang');
      closeModal();
      I18N.setLang(code);
    });
    var cur = $('modalSlot').querySelector('.lang-opt.on') || $('modalSlot').querySelector('.lang-opt');
    if (cur) cur.focus();
  }

  /* Cambiar de idioma solo repinta la presentación: ni un dato se toca. */
  I18N.onChange(function () {
    renderRegGrid();
    renderLangBtn();
    render();
  });

  function render() {
    renderHeader();
    renderOngoing();
    renderTimeline();
    renderSummary();
  }

  /* ---------------------------------------------------------------------
     Formulario de registro
     --------------------------------------------------------------------- */
  function units(cat) {
    if (cat === 'med') return ['ml', 'mg', 'drops', 'tablet', 'sachet'];
    return ['ml', 'g', 'oz', 'min'];
  }

  function openForm(cat, ev) {
    var now = new Date();
    var f = {
      cat: cat, id: ev ? ev.id : null, error: '',
      date: state.dateKey, time: pad(now.getHours()) + ':' + pad(now.getMinutes()),
      endDate: '', endTime: '', type: '', other: '', amount: '', unit: units(cat)[0],
      temp: '', med: '', reason: '', note: '', text: ''
    };
    if (ev) {
      var d = new Date(ev.at);
      f.date = keyOf(d);
      f.time = pad(d.getHours()) + ':' + pad(d.getMinutes());
      if (ev.endAt) {
        var e = new Date(ev.endAt);
        f.endDate = keyOf(e); f.endTime = pad(e.getHours()) + ':' + pad(e.getMinutes());
      }
      ['type', 'other', 'amount', 'unit', 'temp', 'med', 'reason', 'note', 'text'].forEach(function (k) {
        if (ev[k]) f[k] = ev[k];
      });
    } else if (cat === 'sleep') {
      f.endDate = state.dateKey;
    }
    state.form = f;
    buildFormModal();
  }

  function setF(k, v) {
    state.form[k] = v;
    if (k !== 'error') state.form.error = '';
    syncForm();
  }

  function buildFormModal() {
    var f = state.form, c = CATS[f.cat];
    var us = units(f.cat).slice();
    if (f.unit && us.indexOf(f.unit) < 0) us.unshift(f.unit);   // unidad de un respaldo antiguo

    var chips = (c.types || []).map(function (id, i) {
      return '<button type="button" class="chip" data-chip="' + i + '">' + esc(typeLabel(id)) + '</button>';
    }).join('');

    var html =
    '<div class="overlay">' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(catShort(f.cat)) + '" data-stop="1">' +

        '<div class="sheet-head">' +
          '<div class="sheet-title-wrap">' +
            '<span style="' + dot(c.color, 12) + '"></span>' +
            '<div class="sheet-title" id="fTitle"></div>' +
          '</div>' +
          '<button type="button" class="sheet-close" aria-label="' + esc(t('form.close')) + '" data-close="form">×</button>' +
        '</div>' +

        '<div class="field" id="fSleepNow">' +
          '<button type="button" class="sleepnow" id="fSleepNowBtn"></button>' +
          '<div class="divider"><span class="line"></span><span>' + esc(t('form.orHours')) + '</span><span class="line"></span></div>' +
        '</div>' +

        '<div class="field" id="fTypes">' +
          '<div class="label label--chips" id="fTypeLabel"></div>' +
          '<div class="chips" id="fChips">' + chips + '</div>' +
        '</div>' +

        '<div class="field" id="fOtherWrap">' +
          '<label class="label" for="fOther"><span id="fOtherLabel"></span> <span class="opt">' + esc(t('form.optional')) + '</span></label>' +
          '<input id="fOther" class="input" placeholder="' + esc(t('form.specifyPlaceholder')) + '" autocomplete="off" />' +
        '</div>' +

        '<div class="field" id="fMedWrap">' +
          '<label class="label" for="fMed">' + esc(t('form.med')) + '</label>' +
          '<input id="fMed" class="input" placeholder="' + esc(t('form.medPlaceholder')) + '" autocomplete="off" />' +
        '</div>' +

        '<div class="row2 field">' +
          '<div class="c13"><label class="label" for="fDate" id="fDateLabel"></label>' +
            '<input id="fDate" type="date" class="input input--date" /></div>' +
          '<div class="c1"><label class="label" for="fTime" id="fTimeLabel"></label>' +
            '<input id="fTime" type="time" class="input input--date" /></div>' +
        '</div>' +

        '<div class="field" id="fSleepEnd">' +
          '<div class="row2" style="margin-bottom:10px">' +
            '<div class="c13"><label class="label" for="fEndDate">' + esc(t('form.endDate')) + '</label>' +
              '<input id="fEndDate" type="date" class="input input--date" /></div>' +
            '<div class="c1"><label class="label" for="fEndTime">' + esc(t('form.endTime')) + '</label>' +
              '<input id="fEndTime" type="time" class="input input--date" /></div>' +
          '</div>' +
          '<div class="dur-row">' +
            '<button type="button" class="clear-end" id="fClearEnd">' + esc(t('form.leaveOpen')) + '</button>' +
            '<div class="dur-label" id="fDur"></div>' +
          '</div>' +
        '</div>' +

        '<div class="row2 field" id="fAmountWrap">' +
          '<div class="c1"><label class="label" for="fAmount"><span id="fAmountLabel"></span> <span class="opt">' + esc(t('form.optional')) + '</span></label>' +
            '<input id="fAmount" class="input" inputmode="decimal" placeholder="—" autocomplete="off" /></div>' +
          '<div class="c1"><label class="label" for="fUnit">' + esc(t('form.unit')) + '</label>' +
            '<select id="fUnit" class="select">' + us.map(function (u) { return '<option value="' + esc(u) + '">' + esc(unitLabel(u)) + '</option>'; }).join('') + '</select></div>' +
        '</div>' +

        '<div class="field" id="fTempWrap">' +
          '<label class="label" for="fTemp">' + esc(t('form.temp')) + ' <span class="opt">' + esc(t('form.optional')) + '</span></label>' +
          '<div class="temp-row">' +
            '<input id="fTemp" class="input" inputmode="decimal" placeholder="38,5" autocomplete="off" />' +
            '<span class="temp-unit">°C</span>' +
          '</div>' +
        '</div>' +

        '<div class="field" id="fReasonWrap">' +
          '<label class="label" for="fReason">' + esc(t('form.reason')) + ' <span class="opt">' + esc(t('form.optional')) + '</span></label>' +
          '<input id="fReason" class="input" placeholder="' + esc(t('form.reasonPlaceholder')) + '" autocomplete="off" />' +
        '</div>' +

        '<div class="field" id="fTextWrap">' +
          '<label class="label" for="fText">' + esc(t('form.note')) + '</label>' +
          '<textarea id="fText" class="textarea" rows="3" placeholder="' + esc(t('form.textPlaceholder')) + '"></textarea>' +
        '</div>' +

        '<div class="field" id="fNoteWrap">' +
          '<label class="label" for="fNote">' + esc(t('form.note')) + ' <span class="opt">' + esc(t('form.optional')) + '</span></label>' +
          '<input id="fNote" class="input" placeholder="' + esc(t('form.notePlaceholder')) + '" autocomplete="off" />' +
        '</div>' +

        '<div class="error" role="alert" id="fError" hidden><b>!</b><span id="fErrorTxt"></span></div>' +

        '<div class="actions">' +
          '<button type="button" class="btn-cancel" data-close="form">' + esc(t('form.cancel')) + '</button>' +
          '<button type="button" class="btn-save" id="fSave"></button>' +
        '</div>' +
      '</div>' +
    '</div>';

    openModal(html);

    // Enlaces de entrada: 'input' para que todo se recalcule mientras se escribe.
    bindInput('fOther', 'other'); bindInput('fMed', 'med'); bindInput('fAmount', 'amount');
    bindInput('fTemp', 'temp'); bindInput('fReason', 'reason'); bindInput('fNote', 'note');
    bindInput('fText', 'text'); bindInput('fDate', 'date'); bindInput('fTime', 'time');
    bindInput('fEndDate', 'endDate'); bindInput('fEndTime', 'endTime'); bindInput('fUnit', 'unit');

    $('fChips').addEventListener('click', function (e) {
      var b = e.target.closest('[data-chip]');
      if (!b) return;
      setF('type', CATS[state.form.cat].types[+b.getAttribute('data-chip')]);
    });
    $('fClearEnd').addEventListener('click', function () {
      state.form.endDate = ''; state.form.endTime = ''; state.form.error = ''; syncForm();
    });
    $('fSleepNowBtn').addEventListener('click', sleepNow);
    $('fSave').addEventListener('click', save);

    syncForm();
    var first = document.querySelector('#fChips .chip') || $('fMed') || $('fText') || $('fDate');
    if (first) first.focus();
  }

  function bindInput(id, key) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('input', function () { setF(key, el.value); });
    el.addEventListener('change', function () { setF(key, el.value); });
  }

  function setVal(id, v) {
    var el = $(id);
    if (!el) return;
    if (document.activeElement !== el && el.value !== v) el.value = v;
  }
  function show(id, on) { var el = $(id); if (el) el.hidden = !on; }

  function syncForm() {
    var f = state.form;
    if (!f) return;
    var c = CATS[f.cat], types = c.types;

    $('fTitle').textContent = f.id ? t('form.edit', { cat: catShort(f.cat).toLowerCase() }) : catShort(f.cat);
    $('fSave').textContent = t(f.id ? 'form.saveEdit' : 'form.save');
    $('fDateLabel').textContent = t(f.cat === 'sleep' ? 'form.startDate' : 'form.date');
    $('fTimeLabel').textContent = t(f.cat === 'sleep' ? 'form.startTime' : 'form.time');
    $('fTypeLabel').textContent = t(f.cat === 'health' ? 'form.event' : 'form.type');
    $('fOtherLabel').textContent = t(f.cat === 'health' ? 'form.specifyEvent' : 'form.specify');
    $('fAmountLabel').textContent = t(f.cat === 'med' ? 'form.amountGiven' : 'form.amount');

    show('fSleepNow', f.cat === 'sleep' && !f.id);
    show('fTypes', !!types);
    show('fOtherWrap', !!types && f.type === 'other');
    show('fMedWrap', f.cat === 'med');
    show('fSleepEnd', f.cat === 'sleep');
    show('fAmountWrap', f.cat === 'feed' || f.cat === 'med');
    show('fTempWrap', f.cat === 'health' && f.type === 'fever');
    show('fReasonWrap', f.cat === 'med');
    show('fTextWrap', f.cat === 'note');
    show('fNoteWrap', f.cat !== 'note');

    if (f.cat === 'sleep' && !f.id) $('fSleepNowBtn').textContent = t('form.sleepNow', { time: fmtTime(state.now) });

    if (types) {
      var chips = $('fChips').querySelectorAll('[data-chip]');
      for (var i = 0; i < chips.length; i++) {
        var on = types[i] === f.type;
        chips[i].classList.toggle('on', on);
        chips[i].setAttribute('aria-pressed', on ? 'true' : 'false');
        chips[i].style.background = on ? c.color : '';
        chips[i].style.borderColor = on ? c.color : '';
      }
    }

    setVal('fOther', f.other); setVal('fMed', f.med); setVal('fAmount', f.amount);
    setVal('fTemp', f.temp); setVal('fReason', f.reason); setVal('fNote', f.note);
    setVal('fText', f.text); setVal('fDate', f.date); setVal('fTime', f.time);
    setVal('fEndDate', f.endDate); setVal('fEndTime', f.endTime); setVal('fUnit', f.unit);

    if (f.cat === 'sleep') {
      var a = mk(f.date, f.time), b = mk(f.endDate, f.endTime);
      $('fDur').textContent = (a && b && b > a)
        ? t('form.duration', { dur: fmtDur((b - a) / 60000) })
        : t('form.willStayOpen');
    }

    show('fError', !!f.error);
    if (f.error) $('fErrorTxt').textContent = f.error;
  }

  function save() {
    var f = state.form;
    var at = mk(f.date, f.time);
    if (!at) return setF('error', t('err.when'));

    var endAt = null;
    if (f.cat === 'sleep') {
      var hasD = !!f.endDate, hasT = !!f.endTime;
      if (hasD !== hasT) return setF('error', t('err.endIncomplete'));
      if (hasD && hasT) {
        endAt = mk(f.endDate, f.endTime);
        if (!endAt) return setF('error', t('err.endInvalid'));
        if (endAt <= at) return setF('error', t('err.endBefore'));
      }
    }
    if (f.cat === 'health' && !f.type) return setF('error', t('err.pickEvent'));
    if (f.cat === 'med' && !f.med.trim()) return setF('error', t('err.pickMed'));
    if (f.cat === 'note' && !f.text.trim()) return setF('error', t('err.writeNote'));
    if ((f.cat === 'feed' || f.cat === 'care') && !f.type) return setF('error', t('err.pickType'));

    var data = {
      cat: f.cat, at: at, endAt: endAt,
      type: f.type || null,
      other: (f.type === 'other' && f.other) ? f.other : null,
      amount: f.amount ? f.amount : null,
      unit: f.amount ? f.unit : null,
      temp: (f.cat === 'health' && f.type === 'fever' && f.temp) ? f.temp : null,
      med: f.med ? f.med : null,
      reason: f.reason ? f.reason : null,
      note: f.note ? f.note : null,
      text: f.text ? f.text : null
    };

    if (f.id) {
      state.events = state.events.map(function (e) {
        if (e.id !== f.id) return e;
        var merged = Object.assign({}, e, data);
        merged.id = e.id;
        merged.createdAt = e.createdAt;      // hora en que se introdujo el registro
        merged.updatedAt = Date.now();
        return merged;
      });
    } else {
      data.id = uid();
      data.createdAt = Date.now();
      state.events = state.events.concat([data]);
    }

    state.dateKey = keyOf(new Date(at));
    state.form = null;
    closeModal();
    persist();
    render();

    if (f.cat === 'sleep' && endAt) toast(t('toast.sleepSaved', { dur: fmtDur((endAt - at) / 60000) }));
    else if (f.cat === 'sleep') toast(t('toast.sleepOpen', { time: fmtTime(at) }));
    else toast(f.id ? t('toast.updated') : t('toast.saved', { cat: catLabel(f.cat) }));
  }

  function sleepNow() {
    var at = Date.now();
    state.events = state.events.concat([{ id: uid(), cat: 'sleep', at: at, endAt: null, createdAt: at }]);
    state.dateKey = keyOf(new Date(at));
    state.form = null;
    closeModal();
    persist();
    render();
    toast(t('toast.sleepStarted', { time: fmtTime(at) }));
  }

  function finishSleep(id) {
    var dur = 0, now = Date.now();
    state.events = state.events.map(function (e) {
      if (e.id !== id) return e;
      dur = (now - e.at) / 60000;
      return Object.assign({}, e, { endAt: now, updatedAt: now });
    });
    persist();
    render();
    toast(t('toast.sleepSaved', { dur: fmtDur(dur) }));
  }

  /* ---------------------------------------------------------------------
     Diálogo de confirmación (reutilizado por eliminar y por importar)
     --------------------------------------------------------------------- */
  function openConfirm(opts) {
    var actions = opts.okOnly
      ? '<button type="button" class="btn-keep" data-close="1">' + esc(opts.okLabel || t('dialog.ok')) + '</button>'
      : '<button type="button" class="btn-keep" data-close="1">' + esc(opts.cancelLabel || t('form.cancel')) + '</button>' +
        '<button type="button" class="btn-delete" id="cOk">' + esc(opts.okLabel || t('dialog.ok')) + '</button>';
    openModal(
      '<div class="overlay overlay--confirm">' +
        '<div class="sheet sheet--confirm" role="dialog" aria-modal="true" data-stop="1">' +
          '<div class="confirm-title">' + esc(opts.title) + '</div>' +
          '<div class="confirm-body">' + opts.lines.map(esc).join('<br />') + '</div>' +
          '<div class="confirm-actions">' + actions + '</div>' +
        '</div>' +
      '</div>'
    );
    var ok = $('cOk');
    if (ok) {
      ok.addEventListener('click', function () { closeModal(); opts.onOk(); });
      ok.focus();
    } else {
      document.querySelector('.btn-keep').focus();
    }
  }

  /* Aviso de un solo botón: informa y no cambia nada. */
  function alertDialog(title, lines) {
    openConfirm({ title: title, lines: lines, okOnly: true });
  }

  /* ---------------------------------------------------------------------
     Eliminar
     --------------------------------------------------------------------- */
  function askDelete(id) {
    var ev = null;
    for (var i = 0; i < state.events.length; i++) if (state.events[i].id === id) ev = state.events[i];
    if (!ev) return;
    var cont = ev.cat === 'sleep' && ev.at < dayStart(state.dateKey);
    var label = (cont ? '' : fmtTime(ev.at) + ' · ') + catShort(ev.cat) + ' — ' + detailOf(ev);
    openConfirm({
      title: t('del.title'),
      lines: [label],
      cancelLabel: t('del.keep'),
      okLabel: t('del.confirm'),
      onOk: function () {
        state.events = state.events.filter(function (e) { return e.id !== id; });
        persist();
        render();
        toast(t('toast.deleted'));
      }
    });
  }

  /* ---------------------------------------------------------------------
     Rango, texto compartible y datos del PDF
     --------------------------------------------------------------------- */
  function rangeKeys(share) {
    var to = share.range === 'custom' ? share.to : state.dateKey;
    var from = to;
    if (share.range === '3') from = shiftKey(to, -2);
    if (share.range === '7') from = shiftKey(to, -6);
    if (share.range === 'custom') from = share.from;
    if (!from) from = to;
    if (dayStart(from) > dayStart(to)) { var t = from; from = to; to = t; }
    var keys = [], k = from;
    for (var i = 0; i < 400 && dayStart(k) <= dayStart(to); i++) { keys.push(k); k = shiftKey(k, 1); }
    return { from: from, to: to, keys: keys };
  }

  function periodLabel(r) {
    return r.from === r.to ? fmtDay(r.from, true) : fmtDay(r.from, true) + ' — ' + fmtDay(r.to, true);
  }

  /* Frases del resumen en lenguaje natural, solo con lo que hay.
     Nunca se muestra una categoría vacía ni se interpreta nada. */
  function summaryLines(s) {
    var L = [];
    if (s.counts.feed) L.push(tp('txt.feedings', s.counts.feed));
    if (s.periods) L.push(tp('txt.sleeps', s.periods, { dur: fmtDur(s.mins) }));
    if (s.counts.care) L.push(tp('txt.hygiene', s.counts.care));
    if (s.counts.health) L.push(tp('txt.health', s.counts.health));
    if (s.counts.med) L.push(tp('txt.meds', s.counts.med));
    if (s.counts.note) L.push(tp('txt.notes', s.counts.note));
    return L;
  }

  function eventLine(x) {
    var time = x.cont ? '00:00' : fmtTime(x.ev.at);
    var pre = x.cont ? t('timeline.fromYesterday') + ' · ' : '';
    var note = (x.ev.note && x.ev.cat !== 'note') ? ' (' + x.ev.note + ')' : '';
    return time + ' — ' + catShort(x.ev.cat) + ': ' + pre + detailOf(x.ev) + note;
  }

  function shareText(share) {
    var r = rangeKeys(share);
    var oneDay = r.keys.length === 1;
    var L = [APP_NAME, ''];
    if (state.child) L.push(state.child);
    L.push(t('txt.recordOf', { date: oneDay ? fmtDay(r.from, true) : periodLabel(r) }));
    L.push('');

    r.keys.forEach(function (key) {
      var rows = dayRows(key), sum = summaryLines(daySummary(key));
      if (!oneDay) L.push(cap(fmtDay(key)));
      if (!rows.length) {
        L.push((oneDay ? '' : '  ') + t('txt.noRecords'));
        L.push('');
        return;
      }
      if (sum.length) {
        L.push(t('txt.summary'));
        sum.forEach(function (line) { L.push(line); });
        L.push('');
      }
      L.push(t('txt.dayLine'));
      rows.forEach(function (x) { L.push(eventLine(x)); });
      L.push('');
    });

    L.push(t('txt.disclaimer'));
    return L.join('\n');
  }

  function buildPrint(share) {
    var r = rangeKeys(share);
    var tot = { feed: 0, care: 0, health: 0, med: 0, note: 0 };
    var periods = 0, mins = 0, days = [];
    var catRows = { feed: [], sleep: [], care: [], health: [], med: [], note: [] };

    r.keys.forEach(function (key) {
      var s = daySummary(key);
      Object.keys(tot).forEach(function (k) { tot[k] += s.counts[k]; });
      periods += s.periods; mins += s.mins;
      var rows = dayRows(key).map(function (x) {
        return {
          time: x.cont ? '00:00' : fmtTime(x.ev.at),
          cat: catShort(x.ev.cat),
          detail: (x.cont ? t('sleep.continues') + ' · ' : '') + detailOf(x.ev) +
                  (x.ev.note && x.ev.cat !== 'note' ? ' — ' + x.ev.note : '')
        };
      });
      days.push({ label: cap(fmtDay(key)), rows: rows });
    });

    var inRange = function (ev) {
      var key = keyOf(new Date(ev.at));
      if (r.keys.indexOf(key) >= 0) return true;
      if (ev.cat !== 'sleep') return false;
      return r.keys.some(function (k) {
        return overlapMin(dayStart(k), dayStart(k) + DAY, ev.at, sleepEnd(ev)) > 0;
      });
    };

    state.events.filter(inRange).slice()
      .sort(function (a, b) { return a.at - b.at; })
      .forEach(function (ev) {
        catRows[ev.cat].push({
          when: fmtShortDay(keyOf(new Date(ev.at))) + ' · ' + fmtTime(ev.at),
          detail: detailOf(ev) + (ev.note && ev.cat !== 'note' ? ' — ' + ev.note : '')
        });
      });

    var summary = [
      { label: catShort('feed'), value: regLabel(tot.feed) },
      { label: catShort('sleep'), value: tp('count.periods', periods) + ' · ' + fmtDur(mins) },
      { label: catShort('care'), value: regLabel(tot.care) },
      { label: catShort('health'), value: regLabel(tot.health) },
      { label: catShort('med'), value: regLabel(tot.med) },
      { label: catShort('note'), value: regLabel(tot.note) }
    ];

    return {
      child: state.child || t('app.noName'),
      period: cap(periodLabel(r)),
      generated: new Date().toLocaleString(I18N.locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      summary: summary,
      cats: ORDER.filter(function (k) { return catRows[k].length; })
                 .map(function (k) { return { label: catShort(k), rows: catRows[k] }; }),
      days: days.filter(function (d) { return d.rows.length; })
    };
  }

  /* ---------------------------------------------------------------------
     PDF (jsPDF). Documento pensado para leer e imprimir, no una tabla.
     --------------------------------------------------------------------- */
  var INK = [28, 25, 23], MUTED = [87, 83, 78], BODY = [68, 64, 60];
  var RULE = [214, 211, 209], HAIR = [240, 239, 238], SOFT = [231, 229, 228];

  function pdfAvailable() { return !!(window.jspdf && window.jspdf.jsPDF); }

  /* Las fuentes estándar del PDF usan WinAnsi: cualquier carácter fuera de esa
     tabla (la flecha →, emojis) haría que jsPDF cambiara de codificación y
     saliera texto ilegible. Se sustituye lo que tiene equivalente y se descarta
     el resto, sin tocar acentos, ñ, °, · ni guiones largos. */
  var WINANSI_EXTRA = '\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178';
  function pdfSafe(s) {
    var t = String(s == null ? '' : s)
      .replace(/[\u2192\u2190\u2194\u21D2\u27A1\u2794]/g, '\u2013')
      .replace(/\u00A0/g, ' ');
    var out = '';
    for (var i = 0; i < t.length; i++) {
      var ch = t.charAt(i), c = t.charCodeAt(i);
      if (c === 9 || c === 10 || c === 13) { out += ' '; continue; }
      if ((c >= 32 && c <= 126) || (c >= 160 && c <= 255) || WINANSI_EXTRA.indexOf(ch) >= 0) out += ch;
    }
    return out;
  }

  function makePdf(data) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    var M = 14, PW = 210, PH = 297, CW = PW - M * 2;
    var BOTTOM = PH - M - 8;
    var y = M;

    function line(x1, y1, x2, y2, color, w) {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(w || 0.2);
      doc.line(x1, y1, x2, y2);
    }
    function txt(s, x, yy, opt) { doc.text(pdfSafe(s), x, yy, opt); }
    function font(family, style, size, color) {
      doc.setFont(family, style);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
    }
    function newPage() { doc.addPage(); y = M; }
    function need(h) { if (y + h > BOTTOM) newPage(); }

    /* --- cabecera --- */
    font('helvetica', 'normal', 7.6, MUTED);
    doc.setCharSpace(0.55);
    txt(APP_NAME.toUpperCase(), M, y + 3);
    doc.setCharSpace(0);
    font('times', 'normal', 26, INK);
    txt(data.child, M, y + 13.5);
    font('helvetica', 'normal', 8.6, BODY);
    txt(data.period, PW - M, y + 6.5, { align: 'right' });
    txt(t('pdf.generated', { when: data.generated }), PW - M, y + 11, { align: 'right' });
    y += 17;
    line(M, y, PW - M, y, INK, 0.6);
    y += 5;
    font('helvetica', 'normal', 9, MUTED);
    txt(t('pdf.opening'), M, y);
    y += 8;

    /* --- resumen --- */
    font('helvetica', 'normal', 8.2, MUTED);
    doc.setCharSpace(0.4);
    txt(t('pdf.summary').toUpperCase(), M, y);
    doc.setCharSpace(0);
    y += 4.5;
    data.summary.forEach(function (s) {
      need(8);
      font('helvetica', 'normal', 9.6, INK);
      txt(s.label, M, y + 3.4);
      font('helvetica', 'normal', 9.6, BODY);
      txt(s.value, PW - M, y + 3.4, { align: 'right' });
      y += 5;
      line(M, y, PW - M, y, SOFT, 0.15);
      y += 1.4;
    });
    y += 6;

    /* --- bloques por categoría --- */
    function section(title) {
      need(16);
      font('helvetica', 'normal', 8.2, MUTED);
      doc.setCharSpace(0.4);
      txt(title.toUpperCase(), M, y);
      doc.setCharSpace(0);
      y += 2.2;
      line(M, y, PW - M, y, INK, 0.3);
      y += 5;
    }

    /* El ancho de la columna de fecha se mide sobre los textos reales, para
       que valga igual en español, inglés o portugués. */
    font('helvetica', 'normal', 9, BODY);
    var WHEN_W = 26;
    data.cats.forEach(function (c) {
      c.rows.forEach(function (rw) {
        WHEN_W = Math.max(WHEN_W, doc.getTextWidth(pdfSafe(rw.when)) + 6);
      });
    });
    data.cats.forEach(function (c) {
      section(c.label);
      c.rows.forEach(function (r) {
        font('helvetica', 'normal', 9.4, INK);
        var lines = doc.splitTextToSize(pdfSafe(r.detail), CW - WHEN_W);
        var h = lines.length * 4.4 + 2.2;
        if (y + h > BOTTOM) { newPage(); section(t('pdf.continued', { label: c.label })); }
        font('helvetica', 'normal', 9, BODY);
        txt(r.when, M, y + 3.2);
        font('helvetica', 'normal', 9.4, INK);
        doc.text(lines, M + WHEN_W, y + 3.2);
        y += h;
        line(M, y, PW - M, y, HAIR, 0.15);
        y += 1.6;
      });
      y += 5;
    });

    /* --- línea temporal --- */
    if (data.days.length) {
      if (y > M + 40) newPage();
      section(t('pdf.timeline'));
      font('helvetica', 'normal', 9.2, MUTED);
      var T_W = doc.getTextWidth('00:00') + 3.5;
      var C_W = 4.5 + ORDER.reduce(function (m, k) { return Math.max(m, doc.getTextWidth(pdfSafe(catShort(k)))); }, 0);
      data.days.forEach(function (d) {
        need(14);
        font('helvetica', 'bold', 10.5, INK);
        txt(d.label, M, y + 3.4);
        y += 6.4;
        d.rows.forEach(function (r) {
          font('helvetica', 'normal', 9.4, INK);
          var lines = doc.splitTextToSize(pdfSafe(r.detail), CW - T_W - C_W);
          var h = lines.length * 4.4 + 1.8;
          if (y + h > BOTTOM) {
            newPage();
            font('helvetica', 'bold', 10.5, INK);
            txt(t('pdf.continued', { label: d.label }), M, y + 3.4);
            y += 6.4;
          }
          font('helvetica', 'normal', 9.2, INK);
          txt(r.time, M, y + 3.2);
          font('helvetica', 'normal', 9.2, MUTED);
          txt(r.cat, M + T_W, y + 3.2);
          font('helvetica', 'normal', 9.4, INK);
          doc.text(lines, M + T_W + C_W, y + 3.2);
          y += h;
          line(M, y, PW - M, y, HAIR, 0.15);
          y += 1.4;
        });
        y += 5;
      });
    }

    /* --- nota de cierre --- */
    need(16);
    y += 4;
    line(M, y, PW - M, y, RULE, 0.2);
    y += 4.5;
    font('helvetica', 'normal', 9, BODY);
    txt(t('pdf.closing'), M, y);
    y += 5;
    font('helvetica', 'normal', 8, MUTED);
    doc.text(doc.splitTextToSize(pdfSafe(t('pdf.legal')), CW), M, y);

    /* --- pies de página --- */
    var total = doc.getNumberOfPages();
    for (var p = 1; p <= total; p++) {
      doc.setPage(p);
      font('helvetica', 'normal', 7.6, MUTED);
      txt(t('pdf.footer', { brand: APP_NAME, name: data.child }), M, PH - 8);
      txt(p + ' / ' + total, PW - M, PH - 8, { align: 'right' });
    }
    return doc;
  }

  function pdfName(data) {
    var s = (APP_NAME + ' - ' + t('pdf.file') + ' - ' + data.child + ' - ' + data.period)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s.\-—]/g, '').replace(/\s+/g, ' ').trim();
    return s.slice(0, 90) + '.pdf';
  }

  function pdfBlob(share) {
    var data = buildPrint(share);
    var doc = makePdf(data);
    return { blob: doc.output('blob'), name: pdfName(data), doc: doc };
  }

  function downloadPdf(share) {
    if (!pdfAvailable()) return fallbackPrint(share);
    try {
      var r = pdfBlob(share);
      r.doc.save(r.name);
      toast(t('toast.pdf'));
    } catch (e) {
      fallbackPrint(share);
    }
  }

  /* Respaldo: si jsPDF no estuviera disponible, se imprime la hoja diseñada. */
  function fallbackPrint(share) {
    renderPrintSheet(buildPrint(share));
    setTimeout(function () { try { window.print(); } catch (e) {} }, 350);
  }

  function renderPrintSheet(d) {
    var h = '<div class="printsheet">' +
      '<div class="ps-head"><div>' +
        '<div class="ps-kicker">' + esc(APP_NAME + ' · ' + t('app.tagline')) + '</div>' +
        '<div class="ps-name">' + esc(d.child) + '</div></div>' +
        '<div class="ps-meta"><div>' + esc(d.period) + '</div><div>Generado: ' + esc(d.generated) + '</div></div>' +
      '</div>' +
      '<div class="ps-h2">' + esc(t('pdf.summary')) + '</div>' +
      '<table class="ps-table ps-sum">' + d.summary.map(function (s) {
        return '<tr><td>' + esc(s.label) + '</td><td>' + esc(s.value) + '</td></tr>';
      }).join('') + '</table>' +
      d.cats.map(function (c) {
        return '<div class="ps-block"><div class="ps-h3">' + esc(c.label) + '</div><table class="ps-table">' +
          c.rows.map(function (r) {
            return '<tr><td class="when">' + esc(r.when) + '</td><td>' + esc(r.detail) + '</td></tr>';
          }).join('') + '</table></div>';
      }).join('') +
      (d.days.length ? '<div class="ps-page"><div class="ps-h3">' + esc(t('pdf.timeline')) + '</div>' + d.days.map(function (day) {
        return '<div class="ps-day"><div class="ps-day-label">' + esc(day.label) + '</div><table class="ps-table">' +
          day.rows.map(function (r) {
            return '<tr><td class="t">' + esc(r.time) + '</td><td class="c">' + esc(r.cat) + '</td><td>' + esc(r.detail) + '</td></tr>';
          }).join('') + '</table></div>';
      }).join('') + '</div>' : '') +
      '<div class="ps-foot">' + esc(t('pdf.legal')) + '</div>' +
    '</div>';
    $('printSlot').innerHTML = h;
  }

  /* ---------------------------------------------------------------------
     Compartir
     --------------------------------------------------------------------- */
  var SHARE_RANGES = ['hoy', '3', '7', 'custom'];
  var SHARE_KEYS = ['share.today', 'share.last3', 'share.last7', 'share.custom'];

  function openShare() {
    state.share = { range: 'hoy', from: shiftKey(state.dateKey, -6), to: state.dateKey };
    var chips = SHARE_KEYS.map(function (k, i) {
      return '<button type="button" class="chip" data-range="' + i + '">' + esc(t(k)) + '</button>';
    }).join('');
    openModal(
      '<div class="overlay">' +
        '<div class="sheet sheet--share" role="dialog" aria-modal="true" aria-label="Compartir el registro" data-stop="1">' +
          '<div class="sheet-head">' +
            '<div class="sheet-title">' + esc(t('share.title')) + '</div>' +
            '<button type="button" class="sheet-close" aria-label="' + esc(t('form.close')) + '" data-close="share">×</button>' +
          '</div>' +
          '<div class="label label--chips">' + esc(t('share.period')) + '</div>' +
          '<div class="chips" id="sChips" style="margin-bottom:16px">' + chips + '</div>' +
          '<div class="share-dates" id="sCustom">' +
            '<div><label for="sFrom">' + esc(t('share.from')) + '</label><input id="sFrom" type="date" /></div>' +
            '<div><label for="sTo">' + esc(t('share.to')) + '</label><input id="sTo" type="date" /></div>' +
          '</div>' +
          '<div class="share-preview"><pre id="sPreview"></pre></div>' +
          '<div class="share-grid">' +
            '<button type="button" class="btn-primary" id="sShare">' + esc(t('share.open')) + '</button>' +
            '<button type="button" class="btn-secondary" id="sWa">' + esc(t('share.whatsapp')) + '</button>' +
            '<button type="button" class="btn-secondary" id="sCopy">' + esc(t('share.copy')) + '</button>' +
            '<button type="button" class="btn-secondary" id="sPdf">' + esc(t('share.pdf')) + '</button>' +
          '</div>' +
          '<div class="share-foot">' + esc(t('share.foot')) + '</div>' +
        '</div>' +
      '</div>'
    );
    $('sChips').addEventListener('click', function (e) {
      var b = e.target.closest('[data-range]');
      if (!b) return;
      state.share.range = SHARE_RANGES[+b.getAttribute('data-range')];
      syncShare();
    });
    $('sFrom').addEventListener('change', function () { state.share.from = this.value; syncShare(); });
    $('sTo').addEventListener('change', function () { state.share.to = this.value; syncShare(); });
    $('sShare').addEventListener('click', doShare);
    $('sWa').addEventListener('click', doWhatsapp);
    $('sCopy').addEventListener('click', function () { copy(shareText(state.share)); toast(t('toast.copied')); });
    $('sPdf').addEventListener('click', function () { downloadPdf(state.share); });
    syncShare();
    $('sChips').querySelector('.chip').focus();
  }

  function syncShare() {
    var s = state.share;
    var chips = $('sChips').querySelectorAll('[data-range]');
    for (var i = 0; i < chips.length; i++) {
      var on = SHARE_RANGES[i] === s.range;
      chips[i].classList.toggle('on', on);
      chips[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      chips[i].style.background = on ? 'oklch(0.38 0.045 45)' : '';
      chips[i].style.borderColor = on ? 'oklch(0.38 0.045 45)' : '';
    }
    $('sCustom').style.display = s.range === 'custom' ? 'flex' : 'none';
    setVal('sFrom', s.from); setVal('sTo', s.to);
    $('sPreview').textContent = shareText(s);
  }

  /* Compartir: se adjunta el PDF cuando el dispositivo lo permite (así llega a
     WhatsApp como documento) y, si no, se comparte el texto. El envío siempre
     lo confirma la persona en el menú del sistema. */
  function doShare() {
    var text = shareText(state.share);
    var title = APP_NAME + ' — ' + (state.child || t('pdf.file'));
    var file = null;
    if (pdfAvailable()) {
      try {
        var r = pdfBlob(state.share);
        file = new File([r.blob], r.name, { type: 'application/pdf' });
      } catch (e) { file = null; }
    }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: title, text: text })
        .catch(function () {
          navigator.share({ files: [file], title: title }).catch(function () {});
        });
      return;
    }
    if (navigator.share) {
      navigator.share({ title: title, text: text }).catch(function () {});
      return;
    }
    copy(text);
    toast(t('toast.noShare'));
  }

  function doWhatsapp() {
    var text = shareText(state.share);
    try { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); } catch (e) {}
    toast(t('toast.whatsapp'));
  }

  function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text); return; }
    } catch (e) {}
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
  }

  /* ---------------------------------------------------------------------
     Respaldo: exportar e importar

     Todo se hace en el dispositivo. El archivo se genera con Blob y se
     descarga desde el propio navegador; al importar, el contenido se trata
     exclusivamente como datos: nunca se evalúa ni se inserta como HTML.
     --------------------------------------------------------------------- */

  /* Campos de texto del modelo. Se reconstruyen uno a uno al importar, así
     un archivo manipulado no puede introducir propiedades inesperadas. */
  var TEXT_FIELDS = ['type', 'other', 'unit', 'med', 'reason', 'note', 'text'];
  var NUMERIC_TEXT_FIELDS = ['amount', 'temp'];   // se guardan como texto tal cual los escribió el usuario

  function backupObject() {
    return {
      app: APP_ID,
      appName: BACKUP_APP_NAME,
      format: 'backup',
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: { child: state.child, events: state.events }
    };
  }

  function exportBackup() {
    var json;
    try {
      json = JSON.stringify(backupObject(), null, 2);
    } catch (e) {
      return alertDialog(t('backup.errMakeTitle'), [t('backup.errMake')]);
    }
    try {
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = BACKUP_PREFIX + keyOf(new Date()) + '.json';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      toast(t('toast.exported', { n: regLabel(state.events.length) }));
    } catch (e) {
      alertDialog(t('backup.errDownTitle'), [t('backup.errDown')]);
    }
  }

  /* Reconstruye un registro campo a campo. Devuelve null si no es utilizable.
     Conserva at y createdAt exactamente como venían. */
  function sanitizeEvent(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    if (typeof raw.cat !== 'string' || !CATS[raw.cat]) return null;

    var at = Number(raw.at);
    if (!isFinite(at) || at <= 0) return null;

    var endAt = null;
    if (raw.cat === 'sleep' && raw.endAt !== null && raw.endAt !== undefined && raw.endAt !== '') {
      var e = Number(raw.endAt);
      if (isFinite(e) && e > at) endAt = e;
    }

    var ev = {
      id: (typeof raw.id === 'string' && raw.id) ? raw.id.slice(0, 64) : uid(),
      cat: raw.cat,
      at: at,
      endAt: endAt
    };
    TEXT_FIELDS.forEach(function (k) {
      ev[k] = (typeof raw[k] === 'string' && raw[k]) ? raw[k].slice(0, 4000) : null;
    });
    NUMERIC_TEXT_FIELDS.forEach(function (k) {
      var v = raw[k];
      if (typeof v === 'number' && isFinite(v)) v = String(v);
      ev[k] = (typeof v === 'string' && v) ? v.slice(0, 40) : null;
    });

    var c = Number(raw.createdAt);
    ev.createdAt = (isFinite(c) && c > 0) ? c : at;
    var u = Number(raw.updatedAt);
    if (isFinite(u) && u > 0) ev.updatedAt = u;
    // Un respaldo creado con la versión anterior guarda el tipo en español.
    return migrateEvent(ev);
  }

  function parseBackup(text) {
    var obj;
    try {
      obj = JSON.parse(text);
    } catch (e) {
      return { ok: false, reason: t('backup.errNotJson') };
    }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, reason: t('backup.errShape') };
    }
    if (obj.format !== 'backup' || obj.app !== APP_ID) {
      return { ok: false, reason: t('backup.errApp') };
    }
    var v = Number(obj.version);
    if (!isFinite(v) || v < 1) {
      return { ok: false, reason: t('backup.errVersion') };
    }
    if (v > BACKUP_VERSION) {
      return { ok: false, reason: t('backup.errNewer') };
    }
    var d = obj.data;
    if (!d || typeof d !== 'object' || Array.isArray(d) || !Array.isArray(d.events)) {
      return { ok: false, reason: t('backup.errNoEvents') };
    }

    var events = [], seen = Object.create(null), discarded = 0;
    for (var i = 0; i < d.events.length; i++) {
      var ev = sanitizeEvent(d.events[i]);
      if (!ev || seen[ev.id]) { discarded++; continue; }
      seen[ev.id] = true;
      events.push(ev);
    }
    events.sort(function (a, b) { return a.at - b.at; });

    return {
      ok: true,
      child: typeof d.child === 'string' ? d.child.slice(0, 120) : '',
      events: events,
      discarded: discarded,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : ''
    };
  }

  function fmtExportedAt(iso) {
    var d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return '';
    return d.toLocaleString(I18N.locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function importBackupFile(file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      return alertDialog(t('backup.errBigTitle'), [t('backup.errBig')]);
    }
    var fr = new FileReader();
    fr.onerror = function () {
      alertDialog(t('backup.errReadTitle'), [t('backup.errRead')]);
    };
    fr.onload = function () {
      var res = parseBackup(String(fr.result || ''));
      if (!res.ok) {
        return alertDialog(t('backup.failTitle'), [res.reason, t('backup.unchanged')]);
      }
      var lines = [
        t('backup.restoreWarn'),
        '',
        t('backup.nowHave', { n: regLabel(state.events.length) }),
        t('backup.fileHas', { n: regLabel(res.events.length) })
      ];
      if (res.discarded) lines.push(tp('backup.skipped', res.discarded));
      var when = fmtExportedAt(res.exportedAt);
      if (when) lines.push(t('backup.createdOn', { when: when }));

      openConfirm({
        title: t('backup.restoreTitle'),
        lines: lines,
        cancelLabel: t('form.cancel'),
        okLabel: t('backup.restore'),
        onOk: function () {
          state.events = res.events;
          state.child = res.child;
          persist();
          render();
          toast(t('toast.restored', { n: regLabel(res.events.length) }));
        }
      });
    };
    fr.readAsText(file);
  }

  /* ---------------------------------------------------------------------
     Modales: apertura, cierre, teclado
     --------------------------------------------------------------------- */
  function openModal(html) {
    if (!$('modalSlot').innerHTML) lastFocus = document.activeElement;
    $('modalSlot').innerHTML = html;
    document.body.classList.add('mbh-locked');
  }
  function closeModal() {
    if (pendingLangChoice) { pendingLangChoice = false; I18N.setLang(I18N.lang); }
    $('modalSlot').innerHTML = '';
    document.body.classList.remove('mbh-locked');
    state.form = null; state.share = null;
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  document.addEventListener('keydown', function (e) {
    if (!$('modalSlot').innerHTML) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;

    // El foco no debe escaparse del modal mientras está abierto.
    var sheet = document.querySelector('#modalSlot .sheet');
    if (!sheet) return;
    var all = sheet.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    var focusables = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.disabled || el.hidden || el.closest('[hidden]')) continue;
      focusables.push(el);
    }
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (!sheet.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* En el móvil, al abrirse el teclado la mitad inferior del modal queda
     tapada. Se acerca el campo enfocado al centro de lo que queda visible. */
  $('modalSlot').addEventListener('focusin', function (e) {
    var el = e.target;
    if (!el.matches || !el.matches('input, select, textarea')) return;
    setTimeout(function () {
      try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) { /* sin soporte */ }
    }, 300);
  });

  $('modalSlot').addEventListener('click', function (e) {
    var closeEl = e.target.closest('[data-close]');
    if (closeEl) { closeModal(); return; }
    // clic en el fondo del overlay
    if (e.target.classList && e.target.classList.contains('overlay')) closeModal();
  });

  /* ---------------------------------------------------------------------
     Eventos de la página
     --------------------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-open]'))) { openForm(el.getAttribute('data-open'), null); return; }
    if ((el = e.target.closest('[data-edit]'))) {
      var id = el.getAttribute('data-edit');
      var ev = state.events.filter(function (x) { return x.id === id; })[0];
      if (ev) openForm(ev.cat, ev);
      return;
    }
    if ((el = e.target.closest('[data-del]'))) { askDelete(el.getAttribute('data-del')); return; }
    if ((el = e.target.closest('[data-editsleep]'))) {
      var sid = el.getAttribute('data-editsleep');
      var sev = state.events.filter(function (x) { return x.id === sid; })[0];
      if (sev) openForm('sleep', sev);
      return;
    }
    if ((el = e.target.closest('[data-finishsleep]'))) { finishSleep(el.getAttribute('data-finishsleep')); return; }
  });

  $('langBtn').addEventListener('click', function () { openLangDialog(false); });
  $('child').addEventListener('input', function () {
    state.child = this.value;
    // Se actualiza aquí y no con render() para no mover el cursor mientras escribe.
    $('childHint').hidden = !!state.child.trim();
    persist();
  });
  $('prevDay').addEventListener('click', function () { state.dateKey = shiftKey(state.dateKey, -1); render(); });
  $('nextDay').addEventListener('click', function () { state.dateKey = shiftKey(state.dateKey, 1); render(); });
  $('todayBtn').addEventListener('click', function () { state.dateKey = keyOf(new Date()); render(); });
  $('datePick').addEventListener('change', function () { if (this.value) { state.dateKey = this.value; render(); } });
  $('openShare').addEventListener('click', openShare);
  $('openPdf').addEventListener('click', function () {
    downloadPdf({ range: 'hoy', from: state.dateKey, to: state.dateKey });
  });

  $('exportBackup').addEventListener('click', exportBackup);
  $('importBackup').addEventListener('click', function () { $('importFile').click(); });
  $('importFile').addEventListener('change', function () {
    var file = this.files && this.files[0];
    this.value = '';   // permite volver a elegir el mismo archivo
    importBackupFile(file);
  });

  /* ---------------------------------------------------------------------
     Arranque
     --------------------------------------------------------------------- */
  load();
  state.dateKey = keyOf(new Date());
  renderRegGrid();
  renderLangBtn();
  render();
  if (!I18N.chosen) openLangDialog(true);

  setInterval(function () {
    state.now = Date.now();
    var hasOngoing = state.events.some(function (e) { return e.cat === 'sleep' && !e.endAt; });
    if (hasOngoing) { renderOngoing(); renderTimeline(); renderSummary(); }
    if (state.form && state.form.cat === 'sleep' && !state.form.id) syncForm();
  }, 30000);

  // Si el día cambia mientras la página está abierta y se está viendo "hoy".
  var bootKey = state.dateKey;
  setInterval(function () {
    var t = keyOf(new Date());
    if (state.dateKey === bootKey && bootKey !== t) { bootKey = t; state.dateKey = t; render(); }
  }, 60000);

  /* Service worker: solo guarda en caché los archivos de la aplicación para
     que funcione sin conexión. Nunca toca los datos del usuario, que siguen
     exclusivamente en localStorage. Ruta relativa para poder publicar la
     aplicación en una subcarpeta. Sobre file:// no existe y se ignora. */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    try {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    } catch (e) { /* sin service worker la aplicación funciona igual, con conexión */ }
  }

})();
