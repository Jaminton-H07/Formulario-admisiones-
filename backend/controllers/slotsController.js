const Slot = require('../models/Slot');
const { HORAS_VALIDAS } = require('../models/Slot');

exports.obtenerSlots = async (req, res, next) => {
  try {
    const { fecha } = req.params;

    // Validar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha))
      return res.status(400).json({ mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD.' });

    // Validar que no sea fin de semana
    const [y, m, d] = fecha.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dow = dateObj.getDay();
    if (dow === 0 || dow === 6)
      return res.status(400).json({ mensaje: 'No hay entrevistas los fines de semana.' });

    // Validar que no sea fecha pasada
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fechaD = new Date(y, m-1, d);
    if (fechaD < hoy)
      return res.status(400).json({ mensaje: 'La fecha ya pasó.' });

    // Disponibilidad basada en MongoDB (fuente de verdad)
    // Nota: la verificación de disponibilidad en Google Calendar se activa en producción
    // cuando se use el calendario real de la coordinadora (admissions@colegio.edu.co)
    const ocupados = await Slot.find({ fecha });
    const ocupadasSet = new Set(ocupados.map(s => s.hora));

    const slots = HORAS_VALIDAS.map(hora => ({
      hora,
      disponible: !ocupadasSet.has(hora),
    }));

    res.json({ fecha, slots });
  } catch (err) {
    next(err);
  }
};
