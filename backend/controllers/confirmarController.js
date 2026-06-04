const Solicitud  = require('../models/Solicitud');
const Slot       = require('../models/Slot');
const gmail      = require('../services/gmail');
const calendar   = require('../services/calendar');
const onedrive   = require('../services/onedrive');
const { generarFormularioPDF } = require('../services/generarFormularioPDF');

exports.confirmarCita = async (req, res, next) => {
  try {
    const { solicitudId, fecha, hora } = req.body;

    if (!solicitudId || !fecha || !hora)
      return res.status(400).json({ mensaje: 'Faltan campos: solicitudId, fecha, hora.' });

    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud)
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });

    if (solicitud.estado === 'cita_agendada' || solicitud.estado === 'completado')
      return res.status(409).json({ mensaje: 'Esta solicitud ya tiene una cita agendada.' });

    // Verificar que el slot siga disponible
    const slotExistente = await Slot.findOne({ fecha, hora });
    if (slotExistente && slotExistente.ocupado)
      return res.status(409).json({ mensaje: 'Este horario ya no está disponible. Por favor elige otro.' });

    // Bloquear slot en MongoDB
    await Slot.create({ fecha, hora, solicitudId, ocupado: true });

    // Actualizar solicitud
    solicitud.fecha  = fecha;
    solicitud.hora   = hora;
    solicitud.estado = 'cita_agendada';

    // Crear evento en Google Calendar
    try {
      const eventoId = await calendar.crearEvento(solicitud);
      solicitud.eventoCalendarId = eventoId;
    } catch (calErr) {
      console.error('[CALENDAR] Error al crear evento:', calErr.message);
      // No detener el flujo si Calendar falla
    }

    await solicitud.save();

    // Enviar correo de confirmación al padre y notificación al admin
    try {
      await gmail.enviarConfirmacion(solicitud);
    } catch (mailErr) {
      console.error('[GMAIL] Error al enviar correo:', mailErr.message);
    }
    try {
      await gmail.enviarNotificacionAdmin(solicitud);
    } catch (mailErr) {
      console.error('[GMAIL] Error al enviar notificación admin:', mailErr.message);
    }

    // Generar PDF del formulario y subirlo a OneDrive
    try {
      const pdfBuffer     = await generarFormularioPDF(solicitud);
      // Mismo nombre de carpeta que usa documentosController
      const partes = [solicitud.nombreAspirante, solicitud.padre1].filter(p => p && p.trim());
      const carpetaNombre = (partes.join(' — ') || 'Familia').trim();
      const nombrePDF     = `Formulario_Admision_${(solicitud.padre1 || 'Familia').split(' ').slice(-1)[0]}.pdf`;
      await onedrive.subirBuffer(pdfBuffer, nombrePDF, carpetaNombre, solicitud.carpetaOnedriveId);
      console.log(`[PDF] Formulario generado y subido: ${nombrePDF}`);
    } catch (pdfErr) {
      console.error('[PDF] Error al generar/subir formulario:', pdfErr.message, pdfErr.stack);
    }

    console.log(`[CONFIRMAR] Cita confirmada: ${solicitudId} — ${fecha} ${hora}`);

    res.json({
      mensaje:    'Cita confirmada exitosamente.',
      solicitudId,
      fecha,
      hora,
      aspirante:  solicitud.nombreAspirante,
      email:      solicitud.email,
    });
  } catch (err) {
    // Si falla por duplicado de slot (race condition)
    if (err.code === 11000)
      return res.status(409).json({ mensaje: 'Este horario fue reservado en el momento de confirmar. Elige otro.' });
    next(err);
  }
};
