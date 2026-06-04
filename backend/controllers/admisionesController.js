const Solicitud = require('../models/Solicitud');

exports.crearSolicitud = async (req, res, next) => {
  try {
    const b = req.body;

    // Validaciones deshabilitadas temporalmente (modo prueba)

    const solicitud = await Solicitud.create({
      // Acceso rápido
      padre1:             b.padre1,
      padre2:             b.padre2 || '',
      email:              b.email,
      telefono:           b.telefono,
      nacionalidadPadres: b.nacionalidadPadres,
      situacionLaboral:   b.situacionLaboral,

      // Aspirante
      nombreAspirante:       b.nombreAspirante,
      edad:                  Number(b.edad) || 0,
      grado:                 b.grado,
      nacionalidadAspirante: b.nacionalidadAspirante,
      tipoDocAspirante:      b.tipoDocAspirante,
      numDocAspirante:       b.numDocAspirante,
      lugarNacAspirante:     b.lugarNacAspirante,
      fechaNacAspirante:     b.fechaNacAspirante,
      nacionalidadTextAsp:   b.nacionalidadTextAsp,
      viveCon:               b.viveCon,
      telefonoAspirante:     b.telefonoAspirante,
      direccionAspirante:    b.direccionAspirante,
      idiomasAspirante:      b.idiomasAspirante,
      razones:               b.razones,

      // Educación anterior
      conoceSistema:       b.conoceSistema,
      filosofia:           b.filosofia,
      vieneLiceoFrances:   b.vieneLiceoFrances,
      vieneGuarderia:      b.vieneGuarderia,
      gradoAnterior:       b.gradoAnterior,
      institucionAnterior: b.institucionAnterior,
      anioAnterior:        b.anioAnterior,
      institucionBilingue: b.institucionBilingue,
      idiomaInstitucion:   b.idiomaInstitucion,

      // Acudientes
      acud1: b.acud1 || undefined,
      acud2: b.acud2 || undefined,

      // Hermanos y autorizaciones
      hermanos:          Array.isArray(b.hermanos) ? b.hermanos : [],
      autorizaVerificar: b.autorizaVerificar,
      autorizaDatos:     b.autorizaDatos,
    });

    console.log(`[ADMISIONES] Nueva solicitud: ${solicitud._id} — ${b.nombreAspirante} / Acud1: ${b.padre1}`);

    res.status(201).json({
      mensaje:     'Solicitud creada exitosamente.',
      solicitudId: solicitud._id,
    });
  } catch (err) {
    next(err);
  }
};
