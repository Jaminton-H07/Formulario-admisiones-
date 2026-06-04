const { google } = require('googleapis');

const MESES_ES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
];

/**
 * Convierte "8:00 AM – 10:00 AM" + "YYYY-MM-DD" a [startISO, endISO] en hora Bogotá (UTC-5).
 */
function parseFechaHora(fechaStr, horaStr) {
  // horaStr ejemplo: "10:00 AM – 12:00 PM"
  const [startPart, endPart] = horaStr.split('–').map(s => s.trim());

  function toMinutes(part) {
    const [time, ampm] = part.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  const [year, month, day] = fechaStr.split('-').map(Number);

  function buildISO(totalMin) {
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    // Bogotá = UTC-5 → offset +05:00
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00-05:00`;
  }

  return [buildISO(toMinutes(startPart)), buildISO(toMinutes(endPart))];
}

function getCalendarClient() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GCAL_CLIENT_ID,
    process.env.GCAL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GCAL_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth: oAuth2Client });
}

exports.crearEvento = async (solicitud) => {
  const cal = getCalendarClient();
  const [start, end] = parseFechaHora(solicitud.fecha, solicitud.hora);

  const [y, m, d] = solicitud.fecha.split('-').map(Number);
  const fechaLabel = `${d} de ${MESES_ES[m-1]} de ${y}`;

  const evento = {
    summary:     `Entrevista Admisión — ${solicitud.nombreAspirante}`,
    description: [
      `Aspirante: ${solicitud.nombreAspirante} (Grado ${solicitud.grado})`,
      `Padres: ${solicitud.padre1}${solicitud.padre2 ? ' y ' + solicitud.padre2 : ''}`,
      `Email: ${solicitud.email}`,
      `Teléfono: ${solicitud.telefono}`,
      ``,
      `Solicitud ID: ${solicitud._id}`,
    ].join('\n'),
    location: 'Colegio Internacional Bilingüe',
    start: { dateTime: start, timeZone: 'America/Bogota' },
    end:   { dateTime: end,   timeZone: 'America/Bogota' },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email',  minutes: 24 * 60 },
        { method: 'popup',  minutes: 30 },
      ],
    },
    colorId: '11', // Rojo en Google Calendar
  };

  const response = await cal.events.insert({
    calendarId: process.env.GCAL_CALENDAR_ID || 'primary',
    resource:   evento,
  });

  console.log(`[CALENDAR] Evento creado: ${response.data.id}`);
  return response.data.id;
};

// Mapa de slots a rangos horarios en Bogotá (UTC-5)
const SLOT_HORAS = {
  '8:00 AM – 10:00 AM':  { start: 8,  end: 10 },
  '10:00 AM – 12:00 PM': { start: 10, end: 12 },
  '12:00 PM – 2:00 PM':  { start: 12, end: 14 },
  '2:00 PM – 4:00 PM':   { start: 14, end: 16 },
};

/**
 * Devuelve un Set con los slots que están ocupados en Google Calendar para una fecha dada.
 * Un slot se bloquea si hay cualquier evento que se solape con su rango horario.
 */
/**
 * Devuelve un Set con los slots bloqueados por reuniones de la coordinadora.
 * Usa events.list para obtener títulos y filtrar los eventos de admisiones
 * (creados por este sistema), evitando bloquear por eventos del colegio no relacionados.
 */
exports.obtenerSlotsBloqueadosPorCalendario = async (fecha) => {
  const bloqueados = new Set();
  try {
    const cal = getCalendarClient();
    const calendarId = process.env.GCAL_CALENDAR_ID || 'primary';

    const timeMin = `${fecha}T00:00:00-05:00`;
    const timeMax = `${fecha}T23:59:59-05:00`;

    const resp = await cal.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'America/Bogota',
    });

    const eventos = resp.data.items || [];

    // Ignorar:
    // 1. Eventos de todo el día (sin dateTime, solo date)
    // 2. Eventos creados por este sistema (entrevistas de admisiones)
    const reuniones = eventos.filter(ev => {
      if (!ev.start.dateTime) return false; // evento de todo el día → ignorar
      const titulo = (ev.summary || '').toLowerCase();
      return !titulo.startsWith('entrevista admisión') && !titulo.startsWith('entrevista admision');
    });

    if (reuniones.length === 0) return bloqueados;

    const [y, m, d] = fecha.split('-').map(Number);

    for (const [slotLabel, { start: sH, end: eH }] of Object.entries(SLOT_HORAS)) {
      const slotStart = Date.UTC(y, m - 1, d, sH + 5, 0, 0);
      const slotEnd   = Date.UTC(y, m - 1, d, eH + 5, 0, 0);

      for (const ev of reuniones) {
        const evStart = new Date(ev.start.dateTime || ev.start.date).getTime();
        const evEnd   = new Date(ev.end.dateTime   || ev.end.date).getTime();

        if (evStart < slotEnd && evEnd > slotStart) {
          console.log(`[CALENDAR] Slot bloqueado por reunión: "${ev.summary}" — ${slotLabel}`);
          bloqueados.add(slotLabel);
          break;
        }
      }
    }
  } catch (err) {
    console.error('[CALENDAR] Error al consultar eventos:', err.message);
    // Si falla, no bloqueamos nada (mejor mostrar disponible que bloquear todo)
  }
  return bloqueados;
};
