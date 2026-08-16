/* =========================================================================
   CAPA DE IDIOMA

   Un único diccionario por idioma. La lógica de la aplicación nunca depende
   del idioma: los identificadores internos (feed, sleep, fever, ml…) son
   estables y el idioma solo decide cómo se muestran.

   El contenido que escribe la persona —nombres, observaciones, textos de
   "Otro"— no pasa por aquí nunca y no se traduce jamás.

   La marca es independiente del idioma y se define una sola vez, abajo.
   ========================================================================= */
(function () {
  'use strict';

  var BRAND = 'La Bitácora';

  var PREFS_KEY = 'mbh.prefs.v1';
  var LANGS = ['es', 'en', 'pt'];
  var LOCALES = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
  var NAMES = { es: 'Español', en: 'English', pt: 'Português' };
  var FLAGS = { es: '🇪🇸', en: '🇺🇸', pt: '🇧🇷' };

  var DICT = {

  /* ------------------------------------------------------------------ */
  es: {
    'lang.name': 'Idioma',
    'lang.title': 'Elige tu idioma',
    'lang.desc': 'Puedes cambiarlo cuando quieras desde la cabecera.',

    'app.tagline': 'Los registros diarios de la vida de tu bebé',
    'app.description': 'Registra fácilmente las tomas, el sueño, los pañales, los medicamentos y los momentos importantes de cada día. Los datos quedan en tu dispositivo.',
    'app.noName': 'Sin nombre',

    'header.childLabel': 'Nombre del bebé',
    'header.childPlaceholder': 'Nombre',
    'header.childHint': 'Escribe arriba el nombre del bebé. Aparecerá en tus registros, en el PDF y en lo que compartas.',
    'header.prevDay': 'Día anterior',
    'header.nextDay': 'Día siguiente',
    'header.pickDate': 'Seleccionar fecha',
    'header.today': 'Hoy',
    'header.todaySuffix': ' · hoy',

    'record.title': 'Registrar',
    'record.desc': 'Registra fácilmente las tomas, el sueño, los pañales, los medicamentos y los momentos importantes de cada día.',

    'cat.feed.label': 'Alimentación', 'cat.feed.short': 'Alimentación',
    'cat.sleep.label': 'Sueño', 'cat.sleep.short': 'Sueño',
    'cat.care.label': 'Higiene', 'cat.care.short': 'Higiene y cuidados',
    'cat.health.label': 'Salud', 'cat.health.short': 'Salud',
    'cat.med.label': 'Medicación', 'cat.med.short': 'Medicación',
    'cat.note.label': 'Observación', 'cat.note.short': 'Observaciones',

    'type.breastmilk': 'Leche materna',
    'type.expressed': 'Leche extraída',
    'type.formula': 'Fórmula',
    'type.food': 'Alimento',
    'type.wetdiaper': 'Pañal mojado',
    'type.stool': 'Deposición',
    'type.bath': 'Baño',
    'type.fever': 'Fiebre',
    'type.cough': 'Tos',
    'type.diarrhea': 'Diarrea',
    'type.vomiting': 'Vómitos',
    'type.congestion': 'Congestión',
    'type.rash': 'Erupción',
    'type.pain': 'Dolor',
    'type.lethargy': 'Decaimiento',
    'type.appetiteloss': 'Falta de apetito',
    'type.other': 'Otro',

    'unit.ml': 'ml', 'unit.g': 'g', 'unit.oz': 'oz', 'unit.min': 'min',
    'unit.mg': 'mg', 'unit.drops': 'gotas', 'unit.tablet': 'comprimido', 'unit.sachet': 'sobre',

    'dur.h': 'h', 'dur.min': 'min',

    'count.records.one': '1 registro', 'count.records.other': '{n} registros',
    'count.periods.one': '1 período', 'count.periods.other': '{n} períodos',

    'timeline.title': 'Línea temporal del día',
    'timeline.emptyToday': 'Hoy empieza una nueva página.<br />Registra aquí lo que vaya ocurriendo durante el día.',
    'timeline.emptyOther': 'Todavía no hay registros de este día.<br />Puedes añadir algo que ocurrió hace un rato.',
    'timeline.edit': 'Editar registro',
    'timeline.delete': 'Eliminar registro',
    'timeline.fromYesterday': 'desde ayer',
    'timeline.ongoing': 'en curso',

    'sleep.ongoingTitle': 'Sueño en curso',
    'sleep.ongoingFrom': 'Desde {date} · {time} · {dur} hasta ahora',
    'sleep.editHours': 'Editar horas',
    'sleep.finishNow': 'Finalizar ahora',
    'sleep.toNow': '{start} → en curso · {dur} hasta ahora',
    'sleep.continues': 'Sueño que continúa',

    'summary.title': 'Resumen del día',
    'summary.todayCount': 'Hoy llevas <b>{n}</b>.',
    'summary.dayCount': 'Ese día: <b>{n}</b>.',
    'summary.empty': 'Todavía no hay registros de este día.',
    'summary.first': 'Primer registro',
    'summary.last': 'Último registro',
    'summary.longestSleep': 'Sueño más largo del día',
    'summary.close': 'Un día más queda guardado en su historia.',

    'form.edit': 'Editar {cat}',
    'form.save': 'Registrar',
    'form.saveEdit': 'Guardar cambios',
    'form.cancel': 'Cancelar',
    'form.close': 'Cerrar',
    'form.optional': '(opcional)',
    'form.date': 'Fecha',
    'form.time': 'Hora',
    'form.startDate': 'Fecha de inicio',
    'form.startTime': 'Hora de inicio',
    'form.endDate': 'Fecha de término',
    'form.endTime': 'Hora de término',
    'form.type': 'Tipo',
    'form.event': 'Acontecimiento',
    'form.specify': 'Especificar',
    'form.specifyEvent': 'Especificar acontecimiento',
    'form.specifyPlaceholder': 'Escribe lo que ocurrió',
    'form.med': 'Medicamento',
    'form.medPlaceholder': 'Nombre tal como lo administraste',
    'form.amount': 'Cantidad',
    'form.amountGiven': 'Cantidad administrada',
    'form.unit': 'Unidad',
    'form.temp': 'Temperatura registrada',
    'form.reason': 'Motivo registrado',
    'form.reasonPlaceholder': 'Por ejemplo: fiebre',
    'form.note': 'Observación',
    'form.notePlaceholder': 'Añade un detalle',
    'form.textPlaceholder': 'Pasó la tarde con los abuelos.',
    'form.sleepNow': 'Se durmió ahora · {time}',
    'form.orHours': 'o registra las horas',
    'form.leaveOpen': 'Dejar en curso',
    'form.duration': 'Duración: {dur}',
    'form.willStayOpen': 'Sin hora de término: quedará en curso',

    'err.when': 'Indica cuándo ocurrió.',
    'err.endIncomplete': 'Completa la fecha y la hora de término, o deja el sueño en curso.',
    'err.endInvalid': 'La hora de término no es válida.',
    'err.endBefore': 'La hora de término debe ser posterior al inicio.',
    'err.pickEvent': 'Elige el acontecimiento que quieres registrar.',
    'err.pickMed': 'Indica el medicamento que administraste.',
    'err.writeNote': 'Escribe la observación.',
    'err.pickType': 'Elige el tipo de registro.',

    'toast.saved': 'Registrado · {cat}',
    'toast.updated': 'Registro actualizado',
    'toast.deleted': 'Registro eliminado',
    'toast.sleepSaved': 'Sueño registrado · {dur}',
    'toast.sleepOpen': 'Sueño en curso desde {time}',
    'toast.sleepStarted': 'Sueño iniciado · {time}',
    'toast.pdf': 'PDF generado',
    'toast.copied': 'Texto copiado',
    'toast.noStorage': 'No se pudo guardar en este navegador.',
    'toast.noShare': 'Tu navegador no ofrece el menú de compartir. Texto copiado.',
    'toast.whatsapp': 'Abriendo WhatsApp. Elige el destinatario y confirma el envío.',
    'toast.exported': 'Respaldo exportado · {n}',
    'toast.restored': 'Respaldo restaurado · {n}',

    'del.title': '¿Eliminar este registro?',
    'del.keep': 'Conservar',
    'del.confirm': 'Eliminar',
    'dialog.ok': 'Entendido',

    'share.title': 'Compartir el registro',
    'share.desc': 'Genera una versión limpia para enviar a otra persona o para llevar al pediatra.',
    'share.open': 'Compartir',
    'share.pdf': 'Descargar PDF',
    'share.period': 'Período',
    'share.today': 'Hoy',
    'share.last3': 'Últimos 3 días',
    'share.last7': 'Últimos 7 días',
    'share.custom': 'Rango personalizado',
    'share.from': 'Desde',
    'share.to': 'Hasta',
    'share.whatsapp': 'WhatsApp',
    'share.copy': 'Copiar texto',
    'share.foot': 'Al compartir se abre el menú de tu dispositivo o WhatsApp; el envío lo confirmas tú.',

    'txt.recordOf': 'Registro del {date}',
    'txt.summary': 'Resumen',
    'txt.dayLine': 'Línea del día',
    'txt.noRecords': 'Sin registros.',
    'txt.feedings.one': '1 alimentación', 'txt.feedings.other': '{n} alimentaciones',
    'txt.sleeps.one': '1 período de sueño · {dur}', 'txt.sleeps.other': '{n} períodos de sueño · {dur}',
    'txt.hygiene.one': '1 registro de higiene', 'txt.hygiene.other': '{n} registros de higiene',
    'txt.health.one': '1 registro de salud', 'txt.health.other': '{n} registros de salud',
    'txt.meds.one': '1 registro de medicación', 'txt.meds.other': '{n} registros de medicación',
    'txt.notes.one': '1 observación', 'txt.notes.other': '{n} observaciones',
    'txt.disclaimer': 'Registro introducido por el cuidador. No contiene recomendaciones.',

    'pdf.summary': 'Resumen del período',
    'pdf.timeline': 'Línea temporal',
    'pdf.continued': '{label} (continuación)',
    'pdf.generated': 'Generado: {when}',
    'pdf.opening': 'Todo lo que pasó hoy, queda guardado aquí.',
    'pdf.closing': 'Una página más de su historia.',
    'pdf.footer': '{brand} · Registro diario de {name}',
    'pdf.legal': 'Documento generado a partir de los datos introducidos por el cuidador. Contiene información registrada, no recomendaciones.',
    'pdf.file': 'Registro',
    'pdf.tempRecorded': 'Temperatura registrada: {v} °C',
    'pdf.reason': 'Motivo: {v}',

    'backup.title': 'Respaldo de los datos',
    'backup.desc': 'Tus registros se guardan en este dispositivo. Haz un respaldo cada cierto tiempo para conservarlos si cambias de teléfono o borras los datos del navegador.',
    'backup.export': 'Exportar respaldo',
    'backup.import': 'Importar respaldo',
    'backup.restoreTitle': 'Restaurar respaldo',
    'backup.restoreWarn': 'Vas a restaurar un respaldo. Los datos actuales serán reemplazados por los datos contenidos en este archivo.',
    'backup.nowHave': 'Ahora en la aplicación: {n}.',
    'backup.fileHas': 'En el respaldo: {n}.',
    'backup.skipped.one': 'Se omitirá 1 entrada con un formato que la aplicación no reconoce.',
    'backup.skipped.other': 'Se omitirán {n} entradas con un formato que la aplicación no reconoce.',
    'backup.createdOn': 'Respaldo creado el {when}.',
    'backup.restore': 'Restaurar',
    'backup.failTitle': 'No se pudo restaurar el respaldo',
    'backup.unchanged': 'No se ha modificado ningún dato.',
    'backup.errNotJson': 'El archivo no es un JSON válido.',
    'backup.errShape': 'El archivo no tiene la estructura de un respaldo.',
    'backup.errApp': 'El archivo no es un respaldo de esta aplicación.',
    'backup.errVersion': 'El respaldo no indica una versión de formato válida.',
    'backup.errNewer': 'El respaldo se creó con una versión más reciente de la aplicación.',
    'backup.errNoEvents': 'El respaldo no contiene la lista de registros.',
    'backup.errBigTitle': 'El archivo es demasiado grande',
    'backup.errBig': 'Un respaldo de esta aplicación no debería superar los 8 MB. No se ha modificado ningún dato.',
    'backup.errReadTitle': 'No se pudo leer el archivo',
    'backup.errRead': 'El navegador no consiguió abrirlo. No se ha modificado ningún dato.',
    'backup.errMakeTitle': 'No se pudo crear el respaldo',
    'backup.errMake': 'Los registros no se pudieron convertir en archivo. No se ha modificado ningún dato.',
    'backup.errDownTitle': 'No se pudo descargar el respaldo',
    'backup.errDown': 'Tu navegador bloqueó la descarga del archivo.',

    'privacy.1': '<strong>Tus datos son privados.</strong> Los registros se guardan en este navegador, en este dispositivo, y no se envían a ningún servidor.',
    'privacy.2': 'Eso también significa que nadie más los conserva por ti: si cambias de teléfono, borras los datos del navegador o desinstalas la aplicación, se pierden. Exporta un respaldo cada cierto tiempo.',

    'shop.name': 'Descubre productos',
    'shop.desc': 'Opciones y productos relacionados con el cuidado diario de tu bebé.',
    'shop.enter': 'Ver opciones',
    'shop.back': 'Todas las categorías',
    'shop.country': '¿Dónde quieres comprar?',
    'shop.demo': '<b>Sección en preparación.</b> ',
    'shop.view': 'Ver producto',
    'shop.viewAria': 'Ver {name} en {merchant} (se abre en otra pestaña)',
    'shop.pending': 'Enlace pendiente',
    'shop.noImage': 'Sin imagen',
    'shop.noOptions': 'Sin opciones aún',
    'shop.options.one': '1 opción', 'shop.options.other': '{n} opciones',
    'shop.emptyCat': 'Todavía no hay opciones en esta categoría.<br />Iremos añadiendo tiendas y productos poco a poco.',
    'shop.emptyAll': 'Todavía no hay categorías disponibles.',
    'shop.goneCat': 'Esa categoría ya no está disponible.',
    'shop.noMerchant': 'Comercio no indicado',
    'shop.foot1': 'La compra se realiza siempre en el sitio del comercio. {brand} no vende, no cobra, no envía y no gestiona devoluciones ni garantías.',
    'shop.foot2': 'Esta sección no usa los registros de tu bebé para elegir qué mostrarte.'
  },

  /* ------------------------------------------------------------------ */
  en: {
    'lang.name': 'Language',
    'lang.title': 'Choose your language',
    'lang.desc': 'You can change it anytime from the header.',

    'app.tagline': 'The daily record of your baby’s life',
    'app.description': 'Easily record feeds, sleep, diapers, medication and the moments that matter each day. Your data stays on your device.',
    'app.noName': 'No name',

    'header.childLabel': 'Baby’s name',
    'header.childPlaceholder': 'Name',
    'header.childHint': 'Enter your baby’s name above. It will appear in your records, in the PDF and in anything you share.',
    'header.prevDay': 'Previous day',
    'header.nextDay': 'Next day',
    'header.pickDate': 'Choose a date',
    'header.today': 'Today',
    'header.todaySuffix': ' · today',

    'record.title': 'Add a record',
    'record.desc': 'Easily record feeds, sleep, diapers, medication and the moments that matter each day.',

    'cat.feed.label': 'Feeding', 'cat.feed.short': 'Feeding',
    'cat.sleep.label': 'Sleep', 'cat.sleep.short': 'Sleep',
    'cat.care.label': 'Hygiene', 'cat.care.short': 'Hygiene and care',
    'cat.health.label': 'Health', 'cat.health.short': 'Health',
    'cat.med.label': 'Medication', 'cat.med.short': 'Medication',
    'cat.note.label': 'Note', 'cat.note.short': 'Notes',

    'type.breastmilk': 'Breast milk',
    'type.expressed': 'Expressed milk',
    'type.formula': 'Formula',
    'type.food': 'Solid food',
    'type.wetdiaper': 'Wet diaper',
    'type.stool': 'Bowel movement',
    'type.bath': 'Bath',
    'type.fever': 'Fever',
    'type.cough': 'Cough',
    'type.diarrhea': 'Diarrhea',
    'type.vomiting': 'Vomiting',
    'type.congestion': 'Congestion',
    'type.rash': 'Rash',
    'type.pain': 'Pain',
    'type.lethargy': 'Low energy',
    'type.appetiteloss': 'Loss of appetite',
    'type.other': 'Other',

    'unit.ml': 'ml', 'unit.g': 'g', 'unit.oz': 'oz', 'unit.min': 'min',
    'unit.mg': 'mg', 'unit.drops': 'drops', 'unit.tablet': 'tablet', 'unit.sachet': 'sachet',

    'dur.h': 'h', 'dur.min': 'min',

    'count.records.one': '1 record', 'count.records.other': '{n} records',
    'count.periods.one': '1 period', 'count.periods.other': '{n} periods',

    'timeline.title': 'Today’s timeline',
    'timeline.emptyToday': 'Today starts a new page.<br />Record here whatever happens during the day.',
    'timeline.emptyOther': 'No records for this day yet.<br />You can add something that happened earlier.',
    'timeline.edit': 'Edit record',
    'timeline.delete': 'Delete record',
    'timeline.fromYesterday': 'since yesterday',
    'timeline.ongoing': 'ongoing',

    'sleep.ongoingTitle': 'Sleep in progress',
    'sleep.ongoingFrom': 'Since {date} · {time} · {dur} so far',
    'sleep.editHours': 'Edit times',
    'sleep.finishNow': 'End now',
    'sleep.toNow': '{start} → ongoing · {dur} so far',
    'sleep.continues': 'Sleep continuing',

    'summary.title': 'Day summary',
    'summary.todayCount': 'So far today: <b>{n}</b>.',
    'summary.dayCount': 'That day: <b>{n}</b>.',
    'summary.empty': 'No records for this day yet.',
    'summary.first': 'First record',
    'summary.last': 'Last record',
    'summary.longestSleep': 'Longest sleep of the day',
    'summary.close': 'Another day saved in their story.',

    'form.edit': 'Edit {cat}',
    'form.save': 'Save',
    'form.saveEdit': 'Save changes',
    'form.cancel': 'Cancel',
    'form.close': 'Close',
    'form.optional': '(optional)',
    'form.date': 'Date',
    'form.time': 'Time',
    'form.startDate': 'Start date',
    'form.startTime': 'Start time',
    'form.endDate': 'End date',
    'form.endTime': 'End time',
    'form.type': 'Type',
    'form.event': 'What happened',
    'form.specify': 'Specify',
    'form.specifyEvent': 'Specify what happened',
    'form.specifyPlaceholder': 'Write what happened',
    'form.med': 'Medication',
    'form.medPlaceholder': 'Name as you gave it',
    'form.amount': 'Amount',
    'form.amountGiven': 'Amount given',
    'form.unit': 'Unit',
    'form.temp': 'Temperature recorded',
    'form.reason': 'Reason recorded',
    'form.reasonPlaceholder': 'For example: fever',
    'form.note': 'Note',
    'form.notePlaceholder': 'Add a detail',
    'form.textPlaceholder': 'Spent the afternoon with the grandparents.',
    'form.sleepNow': 'Fell asleep now · {time}',
    'form.orHours': 'or enter the times',
    'form.leaveOpen': 'Leave ongoing',
    'form.duration': 'Duration: {dur}',
    'form.willStayOpen': 'No end time: it will stay ongoing',

    'err.when': 'Enter when it happened.',
    'err.endIncomplete': 'Enter both the end date and time, or leave the sleep ongoing.',
    'err.endInvalid': 'That end time is not valid.',
    'err.endBefore': 'The end time must be later than the start.',
    'err.pickEvent': 'Choose what you want to record.',
    'err.pickMed': 'Enter the medication you gave.',
    'err.writeNote': 'Write the note.',
    'err.pickType': 'Choose the type of record.',

    'toast.saved': 'Recorded · {cat}',
    'toast.updated': 'Record updated',
    'toast.deleted': 'Record deleted',
    'toast.sleepSaved': 'Sleep recorded · {dur}',
    'toast.sleepOpen': 'Sleep ongoing since {time}',
    'toast.sleepStarted': 'Sleep started · {time}',
    'toast.pdf': 'PDF created',
    'toast.copied': 'Text copied',
    'toast.noStorage': 'Could not save in this browser.',
    'toast.noShare': 'Your browser has no share menu. Text copied instead.',
    'toast.whatsapp': 'Opening WhatsApp. Pick a contact and confirm the message.',
    'toast.exported': 'Backup exported · {n}',
    'toast.restored': 'Backup restored · {n}',

    'del.title': 'Delete this record?',
    'del.keep': 'Keep',
    'del.confirm': 'Delete',
    'dialog.ok': 'Got it',

    'share.title': 'Share the record',
    'share.desc': 'Create a clean version to send to someone else or to take to the pediatrician.',
    'share.open': 'Share',
    'share.pdf': 'Download PDF',
    'share.period': 'Period',
    'share.today': 'Today',
    'share.last3': 'Last 3 days',
    'share.last7': 'Last 7 days',
    'share.custom': 'Custom range',
    'share.from': 'From',
    'share.to': 'To',
    'share.whatsapp': 'WhatsApp',
    'share.copy': 'Copy text',
    'share.foot': 'Sharing opens your device menu or WhatsApp; you confirm before anything is sent.',

    'txt.recordOf': 'Record for {date}',
    'txt.summary': 'Summary',
    'txt.dayLine': 'Through the day',
    'txt.noRecords': 'No records.',
    'txt.feedings.one': '1 feeding', 'txt.feedings.other': '{n} feedings',
    'txt.sleeps.one': '1 sleep period · {dur}', 'txt.sleeps.other': '{n} sleep periods · {dur}',
    'txt.hygiene.one': '1 hygiene record', 'txt.hygiene.other': '{n} hygiene records',
    'txt.health.one': '1 health record', 'txt.health.other': '{n} health records',
    'txt.meds.one': '1 medication record', 'txt.meds.other': '{n} medication records',
    'txt.notes.one': '1 note', 'txt.notes.other': '{n} notes',
    'txt.disclaimer': 'Entered by the caregiver. Contains no recommendations.',

    'pdf.summary': 'Summary of the period',
    'pdf.timeline': 'Timeline',
    'pdf.continued': '{label} (continued)',
    'pdf.generated': 'Created: {when}',
    'pdf.opening': 'Everything that happened today, kept in one place.',
    'pdf.closing': 'One more page of their story.',
    'pdf.footer': '{brand} · Daily record of {name}',
    'pdf.legal': 'Document generated from the data entered by the caregiver. It contains recorded information, not recommendations.',
    'pdf.file': 'Record',
    'pdf.tempRecorded': 'Temperature recorded: {v} °C',
    'pdf.reason': 'Reason: {v}',

    'backup.title': 'Data backup',
    'backup.desc': 'Your records are stored on this device. Back them up now and then so you keep them if you change phones or clear your browser data.',
    'backup.export': 'Export backup',
    'backup.import': 'Import backup',
    'backup.restoreTitle': 'Restore backup',
    'backup.restoreWarn': 'You are about to restore a backup. Your current data will be replaced by the data in this file.',
    'backup.nowHave': 'Currently in the app: {n}.',
    'backup.fileHas': 'In the backup: {n}.',
    'backup.skipped.one': '1 entry in a format the app does not recognize will be skipped.',
    'backup.skipped.other': '{n} entries in a format the app does not recognize will be skipped.',
    'backup.createdOn': 'Backup created on {when}.',
    'backup.restore': 'Restore',
    'backup.failTitle': 'The backup could not be restored',
    'backup.unchanged': 'No data has been changed.',
    'backup.errNotJson': 'The file is not valid JSON.',
    'backup.errShape': 'The file does not have the structure of a backup.',
    'backup.errApp': 'This file is not a backup from this app.',
    'backup.errVersion': 'The backup does not state a valid format version.',
    'backup.errNewer': 'The backup was created with a newer version of the app.',
    'backup.errNoEvents': 'The backup does not contain the list of records.',
    'backup.errBigTitle': 'The file is too large',
    'backup.errBig': 'A backup from this app should not exceed 8 MB. No data has been changed.',
    'backup.errReadTitle': 'The file could not be read',
    'backup.errRead': 'Your browser could not open it. No data has been changed.',
    'backup.errMakeTitle': 'The backup could not be created',
    'backup.errMake': 'The records could not be turned into a file. No data has been changed.',
    'backup.errDownTitle': 'The backup could not be downloaded',
    'backup.errDown': 'Your browser blocked the download.',

    'privacy.1': '<strong>Your data is private.</strong> Records are stored in this browser, on this device, and are not sent to any server.',
    'privacy.2': 'That also means nobody else keeps them for you: if you change phones, clear your browser data or uninstall the app, they are gone. Export a backup now and then.',

    'shop.name': 'Discover products',
    'shop.desc': 'Options and products related to your baby’s daily care.',
    'shop.enter': 'See options',
    'shop.back': 'All categories',
    'shop.country': 'Where do you want to buy?',
    'shop.demo': '<b>Section in preparation.</b> ',
    'shop.view': 'View product',
    'shop.viewAria': 'View {name} at {merchant} (opens in a new tab)',
    'shop.pending': 'Link pending',
    'shop.noImage': 'No image',
    'shop.noOptions': 'No options yet',
    'shop.options.one': '1 option', 'shop.options.other': '{n} options',
    'shop.emptyCat': 'No options in this category yet.<br />We will be adding stores and products little by little.',
    'shop.emptyAll': 'No categories available yet.',
    'shop.goneCat': 'That category is no longer available.',
    'shop.noMerchant': 'Store not specified',
    'shop.foot1': 'Purchases always happen on the store’s own site. {brand} does not sell, charge, ship or handle returns or warranties.',
    'shop.foot2': 'This section does not use your baby’s records to decide what to show you.'
  },

  /* ------------------------------------------------------------------ */
  pt: {
    'lang.name': 'Idioma',
    'lang.title': 'Escolha o seu idioma',
    'lang.desc': 'Você pode mudar quando quiser, pelo cabeçalho.',

    'app.tagline': 'Os registros diários da vida do seu bebê',
    'app.description': 'Registre com facilidade as mamadas, o sono, as fraldas, os medicamentos e os momentos importantes de cada dia. Os dados ficam no seu aparelho.',
    'app.noName': 'Sem nome',

    'header.childLabel': 'Nome do bebê',
    'header.childPlaceholder': 'Nome',
    'header.childHint': 'Escreva acima o nome do bebê. Ele aparecerá nos seus registros, no PDF e no que você compartilhar.',
    'header.prevDay': 'Dia anterior',
    'header.nextDay': 'Próximo dia',
    'header.pickDate': 'Escolher data',
    'header.today': 'Hoje',
    'header.todaySuffix': ' · hoje',

    'record.title': 'Registrar',
    'record.desc': 'Registre com facilidade as mamadas, o sono, as fraldas, os medicamentos e os momentos importantes de cada dia.',

    'cat.feed.label': 'Alimentação', 'cat.feed.short': 'Alimentação',
    'cat.sleep.label': 'Sono', 'cat.sleep.short': 'Sono',
    'cat.care.label': 'Higiene', 'cat.care.short': 'Higiene e cuidados',
    'cat.health.label': 'Saúde', 'cat.health.short': 'Saúde',
    'cat.med.label': 'Medicamentos', 'cat.med.short': 'Medicamentos',
    'cat.note.label': 'Observação', 'cat.note.short': 'Observações',

    'type.breastmilk': 'Leite materno',
    'type.expressed': 'Leite ordenhado',
    'type.formula': 'Fórmula',
    'type.food': 'Alimento',
    'type.wetdiaper': 'Fralda molhada',
    'type.stool': 'Evacuação',
    'type.bath': 'Banho',
    'type.fever': 'Febre',
    'type.cough': 'Tosse',
    'type.diarrhea': 'Diarreia',
    'type.vomiting': 'Vômitos',
    'type.congestion': 'Congestão',
    'type.rash': 'Manchas na pele',
    'type.pain': 'Dor',
    'type.lethargy': 'Moleza',
    'type.appetiteloss': 'Falta de apetite',
    'type.other': 'Outro',

    'unit.ml': 'ml', 'unit.g': 'g', 'unit.oz': 'oz', 'unit.min': 'min',
    'unit.mg': 'mg', 'unit.drops': 'gotas', 'unit.tablet': 'comprimido', 'unit.sachet': 'sachê',

    'dur.h': 'h', 'dur.min': 'min',

    'count.records.one': '1 registro', 'count.records.other': '{n} registros',
    'count.periods.one': '1 período', 'count.periods.other': '{n} períodos',

    'timeline.title': 'Linha do tempo do dia',
    'timeline.emptyToday': 'Hoje começa uma nova página.<br />Registre aqui o que for acontecendo durante o dia.',
    'timeline.emptyOther': 'Ainda não há registros deste dia.<br />Você pode adicionar algo que aconteceu antes.',
    'timeline.edit': 'Editar registro',
    'timeline.delete': 'Excluir registro',
    'timeline.fromYesterday': 'desde ontem',
    'timeline.ongoing': 'em andamento',

    'sleep.ongoingTitle': 'Sono em andamento',
    'sleep.ongoingFrom': 'Desde {date} · {time} · {dur} até agora',
    'sleep.editHours': 'Editar horários',
    'sleep.finishNow': 'Encerrar agora',
    'sleep.toNow': '{start} → em andamento · {dur} até agora',
    'sleep.continues': 'Sono que continua',

    'summary.title': 'Resumo do dia',
    'summary.todayCount': 'Hoje você já tem <b>{n}</b>.',
    'summary.dayCount': 'Nesse dia: <b>{n}</b>.',
    'summary.empty': 'Ainda não há registros deste dia.',
    'summary.first': 'Primeiro registro',
    'summary.last': 'Último registro',
    'summary.longestSleep': 'Sono mais longo do dia',
    'summary.close': 'Mais um dia guardado na história dele.',

    'form.edit': 'Editar {cat}',
    'form.save': 'Registrar',
    'form.saveEdit': 'Salvar alterações',
    'form.cancel': 'Cancelar',
    'form.close': 'Fechar',
    'form.optional': '(opcional)',
    'form.date': 'Data',
    'form.time': 'Hora',
    'form.startDate': 'Data de início',
    'form.startTime': 'Hora de início',
    'form.endDate': 'Data de término',
    'form.endTime': 'Hora de término',
    'form.type': 'Tipo',
    'form.event': 'O que aconteceu',
    'form.specify': 'Especificar',
    'form.specifyEvent': 'Especificar o que aconteceu',
    'form.specifyPlaceholder': 'Escreva o que aconteceu',
    'form.med': 'Medicamento',
    'form.medPlaceholder': 'Nome como você administrou',
    'form.amount': 'Quantidade',
    'form.amountGiven': 'Quantidade administrada',
    'form.unit': 'Unidade',
    'form.temp': 'Temperatura registrada',
    'form.reason': 'Motivo registrado',
    'form.reasonPlaceholder': 'Por exemplo: febre',
    'form.note': 'Observação',
    'form.notePlaceholder': 'Acrescente um detalhe',
    'form.textPlaceholder': 'Passou a tarde com os avós.',
    'form.sleepNow': 'Dormiu agora · {time}',
    'form.orHours': 'ou registre os horários',
    'form.leaveOpen': 'Deixar em andamento',
    'form.duration': 'Duração: {dur}',
    'form.willStayOpen': 'Sem hora de término: ficará em andamento',

    'err.when': 'Indique quando aconteceu.',
    'err.endIncomplete': 'Preencha a data e a hora de término, ou deixe o sono em andamento.',
    'err.endInvalid': 'A hora de término não é válida.',
    'err.endBefore': 'A hora de término deve ser posterior ao início.',
    'err.pickEvent': 'Escolha o que você quer registrar.',
    'err.pickMed': 'Indique o medicamento que você administrou.',
    'err.writeNote': 'Escreva a observação.',
    'err.pickType': 'Escolha o tipo de registro.',

    'toast.saved': 'Registrado · {cat}',
    'toast.updated': 'Registro atualizado',
    'toast.deleted': 'Registro excluído',
    'toast.sleepSaved': 'Sono registrado · {dur}',
    'toast.sleepOpen': 'Sono em andamento desde {time}',
    'toast.sleepStarted': 'Sono iniciado · {time}',
    'toast.pdf': 'PDF gerado',
    'toast.copied': 'Texto copiado',
    'toast.noStorage': 'Não foi possível salvar neste navegador.',
    'toast.noShare': 'Seu navegador não oferece o menu de compartilhar. Texto copiado.',
    'toast.whatsapp': 'Abrindo o WhatsApp. Escolha o destinatário e confirme o envio.',
    'toast.exported': 'Backup exportado · {n}',
    'toast.restored': 'Backup restaurado · {n}',

    'del.title': 'Excluir este registro?',
    'del.keep': 'Manter',
    'del.confirm': 'Excluir',
    'dialog.ok': 'Entendi',

    'share.title': 'Compartilhar o registro',
    'share.desc': 'Gere uma versão limpa para enviar a outra pessoa ou levar ao pediatra.',
    'share.open': 'Compartilhar',
    'share.pdf': 'Baixar PDF',
    'share.period': 'Período',
    'share.today': 'Hoje',
    'share.last3': 'Últimos 3 dias',
    'share.last7': 'Últimos 7 dias',
    'share.custom': 'Período personalizado',
    'share.from': 'De',
    'share.to': 'Até',
    'share.whatsapp': 'WhatsApp',
    'share.copy': 'Copiar texto',
    'share.foot': 'Ao compartilhar, abre o menu do seu aparelho ou o WhatsApp; o envio é você quem confirma.',

    'txt.recordOf': 'Registro de {date}',
    'txt.summary': 'Resumo',
    'txt.dayLine': 'Ao longo do dia',
    'txt.noRecords': 'Sem registros.',
    'txt.feedings.one': '1 alimentação', 'txt.feedings.other': '{n} alimentações',
    'txt.sleeps.one': '1 período de sono · {dur}', 'txt.sleeps.other': '{n} períodos de sono · {dur}',
    'txt.hygiene.one': '1 registro de higiene', 'txt.hygiene.other': '{n} registros de higiene',
    'txt.health.one': '1 registro de saúde', 'txt.health.other': '{n} registros de saúde',
    'txt.meds.one': '1 registro de medicamento', 'txt.meds.other': '{n} registros de medicamentos',
    'txt.notes.one': '1 observação', 'txt.notes.other': '{n} observações',
    'txt.disclaimer': 'Registro inserido pelo cuidador. Não contém recomendações.',

    'pdf.summary': 'Resumo do período',
    'pdf.timeline': 'Linha do tempo',
    'pdf.continued': '{label} (continuação)',
    'pdf.generated': 'Gerado: {when}',
    'pdf.opening': 'Tudo o que aconteceu hoje fica guardado aqui.',
    'pdf.closing': 'Mais uma página da história dele.',
    'pdf.footer': '{brand} · Registro diário de {name}',
    'pdf.legal': 'Documento gerado a partir dos dados inseridos pelo cuidador. Contém informação registrada, não recomendações.',
    'pdf.file': 'Registro',
    'pdf.tempRecorded': 'Temperatura registrada: {v} °C',
    'pdf.reason': 'Motivo: {v}',

    'backup.title': 'Backup dos dados',
    'backup.desc': 'Seus registros ficam guardados neste aparelho. Faça um backup de vez em quando para não perdê-los se trocar de celular ou limpar os dados do navegador.',
    'backup.export': 'Exportar backup',
    'backup.import': 'Importar backup',
    'backup.restoreTitle': 'Restaurar backup',
    'backup.restoreWarn': 'Você vai restaurar um backup. Os dados atuais serão substituídos pelos dados deste arquivo.',
    'backup.nowHave': 'Agora no aplicativo: {n}.',
    'backup.fileHas': 'No backup: {n}.',
    'backup.skipped.one': '1 entrada em um formato que o aplicativo não reconhece será ignorada.',
    'backup.skipped.other': '{n} entradas em um formato que o aplicativo não reconhece serão ignoradas.',
    'backup.createdOn': 'Backup criado em {when}.',
    'backup.restore': 'Restaurar',
    'backup.failTitle': 'Não foi possível restaurar o backup',
    'backup.unchanged': 'Nenhum dado foi alterado.',
    'backup.errNotJson': 'O arquivo não é um JSON válido.',
    'backup.errShape': 'O arquivo não tem a estrutura de um backup.',
    'backup.errApp': 'O arquivo não é um backup deste aplicativo.',
    'backup.errVersion': 'O backup não indica uma versão de formato válida.',
    'backup.errNewer': 'O backup foi criado com uma versão mais recente do aplicativo.',
    'backup.errNoEvents': 'O backup não contém a lista de registros.',
    'backup.errBigTitle': 'O arquivo é grande demais',
    'backup.errBig': 'Um backup deste aplicativo não deveria passar de 8 MB. Nenhum dado foi alterado.',
    'backup.errReadTitle': 'Não foi possível ler o arquivo',
    'backup.errRead': 'O navegador não conseguiu abri-lo. Nenhum dado foi alterado.',
    'backup.errMakeTitle': 'Não foi possível criar o backup',
    'backup.errMake': 'Os registros não puderam ser convertidos em arquivo. Nenhum dado foi alterado.',
    'backup.errDownTitle': 'Não foi possível baixar o backup',
    'backup.errDown': 'Seu navegador bloqueou o download.',

    'privacy.1': '<strong>Seus dados são privados.</strong> Os registros ficam guardados neste navegador, neste aparelho, e não são enviados a nenhum servidor.',
    'privacy.2': 'Isso também significa que ninguém guarda uma cópia por você: se trocar de celular, limpar os dados do navegador ou desinstalar o aplicativo, eles se perdem. Exporte um backup de vez em quando.',

    'shop.name': 'Descubra produtos',
    'shop.desc': 'Opções e produtos relacionados ao cuidado diário do seu bebê.',
    'shop.enter': 'Ver opções',
    'shop.back': 'Todas as categorias',
    'shop.country': 'Onde você quer comprar?',
    'shop.demo': '<b>Seção em preparação.</b> ',
    'shop.view': 'Ver produto',
    'shop.viewAria': 'Ver {name} em {merchant} (abre em outra aba)',
    'shop.pending': 'Link pendente',
    'shop.noImage': 'Sem imagem',
    'shop.noOptions': 'Ainda sem opções',
    'shop.options.one': '1 opção', 'shop.options.other': '{n} opções',
    'shop.emptyCat': 'Ainda não há opções nesta categoria.<br />Vamos acrescentar lojas e produtos aos poucos.',
    'shop.emptyAll': 'Ainda não há categorias disponíveis.',
    'shop.goneCat': 'Essa categoria não está mais disponível.',
    'shop.noMerchant': 'Loja não indicada',
    'shop.foot1': 'A compra acontece sempre no site da loja. {brand} não vende, não cobra, não envia e não cuida de devoluções nem garantias.',
    'shop.foot2': 'Esta seção não usa os registros do seu bebê para escolher o que mostrar.'
  }
  };

  /* ---------------------------------------------------------------------
     Estado y utilidades
     --------------------------------------------------------------------- */
  var listeners = [];
  var lang = null;          // null = todavía no elegido

  function readPrefs() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return {};
      var d = JSON.parse(raw);
      return (d && typeof d === 'object') ? d : {};
    } catch (e) { return {}; }
  }
  function writeLang(code) {
    try {
      var p = readPrefs();
      p.lang = code;
      localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    } catch (e) { /* sin almacenamiento, el idioma dura la sesión */ }
  }

  /* Idioma sugerido por el navegador, solo como valor inicial mientras la
     persona todavía no ha elegido. */
  function guess() {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'es';
    var two = String(nav).slice(0, 2).toLowerCase();
    return LANGS.indexOf(two) >= 0 ? two : 'es';
  }

  var stored = readPrefs().lang;
  var chosen = LANGS.indexOf(stored) >= 0;
  lang = chosen ? stored : guess();

  function t(key, vars) {
    var table = DICT[lang] || DICT.es;
    var s = table[key];
    if (s === undefined) s = DICT.es[key];
    if (s === undefined) return key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return vars[k] === undefined ? m : vars[k];
      });
    }
    return s;
  }

  /* Plural simple: los tres idiomas distinguen solo uno / varios. */
  function tp(key, n, vars) {
    var v = vars || {};
    v.n = n;
    return t(key + (n === 1 ? '.one' : '.other'), v);
  }

  /* Texto de un campo que el catálogo guarda por idioma:
     { es: '…', en: '…', pt: '…' }. Si llega un texto plano, se usa tal cual. */
  function pick(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[lang] || value.es || value.en || value.pt || '';
  }

  function setLang(code) {
    if (LANGS.indexOf(code) < 0 || code === lang) {
      if (LANGS.indexOf(code) >= 0) { chosen = true; writeLang(code); }
      return;
    }
    lang = code;
    chosen = true;
    writeLang(code);
    applyStatic();
    for (var i = 0; i < listeners.length; i++) listeners[i](lang);
  }

  /* Aplica las traducciones al HTML estático mediante data-i18n. */
  function applyStatic() {
    document.documentElement.lang = lang;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].innerHTML = t(nodes[i].getAttribute('data-i18n'));
    }
    nodes = document.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < nodes.length; i++) {
      var pairs = nodes[i].getAttribute('data-i18n-attr').split(',');
      for (var j = 0; j < pairs.length; j++) {
        var kv = pairs[j].split(':');
        nodes[i].setAttribute(kv[0].trim(), t(kv[1].trim()));
      }
    }
    var title = document.querySelector('title');
    if (title) title.textContent = BRAND + ' · ' + t('app.tagline');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('app.description'));
  }

  window.MBH_I18N = {
    BRAND: BRAND,
    langs: LANGS,
    names: NAMES,
    flags: FLAGS,
    get lang() { return lang; },
    get chosen() { return chosen; },
    get locale() { return LOCALES[lang] || 'es-ES'; },
    t: t,
    tp: tp,
    pick: pick,
    setLang: setLang,
    applyStatic: applyStatic,
    onChange: function (fn) { listeners.push(fn); }
  };

  applyStatic();
})();
