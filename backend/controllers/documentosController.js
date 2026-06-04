const path      = require('path');
const Solicitud = require('../models/Solicitud');

// Cuando AZURE_CLIENT_ID esté configurado, cambiar USE_ONEDRIVE a true
const USE_ONEDRIVE = !!(
  process.env.AZURE_CLIENT_ID &&
  process.env.AZURE_CLIENT_SECRET &&
  process.env.AZURE_TENANT_ID
);

exports.subirDocumento = async (req, res, next) => {
  try {
    const { tipo, solicitudId } = req.body;

    if (!req.file)    return res.status(400).json({ mensaje: 'No se recibió ningún archivo.' });
    if (!tipo)        return res.status(400).json({ mensaje: 'Falta el tipo de documento.' });
    if (!solicitudId) return res.status(400).json({ mensaje: 'Falta el ID de la solicitud.' });

    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud)   return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });

    let itemPath;

    if (USE_ONEDRIVE) {
      // ── Modo producción: subir a OneDrive ──────
      try {
        const onedrive      = require('../services/onedrive');
        const partes = [solicitud.nombreAspirante, solicitud.padre1].filter(p => p && p.trim());
        const carpetaNombre = (partes.join(' — ') || 'Familia').trim();
        const result        = await onedrive.subirArchivo(req.file, carpetaNombre, solicitud.carpetaOnedriveId);

        if (result.carpetaId && !solicitud.carpetaOnedriveId) {
          solicitud.carpetaOnedriveId = result.carpetaId;
        }
        itemPath = result.itemPath;

        require('fs').unlink(req.file.path, () => {});
        console.log(`[DOCUMENTOS] '${tipo}' subido a OneDrive para solicitud ${solicitudId}`);
      } catch (onedriveErr) {
        console.error(`[ONEDRIVE] Error al subir, guardando localmente: ${onedriveErr.message}`);
        itemPath = path.join('uploads', req.file.filename);
      }
    } else {
      // ── Modo local: guardar en uploads/ ────────
      itemPath = path.join('uploads', req.file.filename);
      console.log(`[DOCUMENTOS] '${tipo}' guardado localmente en ${itemPath} (solicitud ${solicitudId})`);
    }

    // Registrar en la solicitud
    solicitud.documentos.push({
      tipo,
      nombre:       req.file.originalname,
      onedrivePath: itemPath,
    });

    await solicitud.save();

    res.json({ mensaje: 'Documento subido correctamente.', tipo });
  } catch (err) {
    next(err);
  }
};
