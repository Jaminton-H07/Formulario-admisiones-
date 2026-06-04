const mongoose = require('mongoose');

const AcudienteSchema = new mongoose.Schema({
  nombre:        String,
  lugarNac:      String,
  nacionalidad:  String,
  tipoDoc:       String,
  numDoc:        String,
  expedidoEn:    String,
  fechaNac:      String,
  colegioSec:    String,
  estudios:      String,
  univTitulo:    String,
  univUltimo:    String,
  idiomas:       String,
  profesion:     String,
  ocupacion:     String,
  empresa:       String,
  cargo:         String,
  dirOficina:    String,
  telOficina:    String,
  dirResidencia: String,
  edificio:      String,
  barrio:        String,
  celular1:      String,
  celular2:      String,
  email:         String,
  conyuge:       String,
  hijo1Nom:      String,
  hijo1Edad:     String,
  hijo2Nom:      String,
  hijo2Edad:     String,
  abueloNom:     String,
  abueloProf:    String,
  abueloOcup:    String,
  abueloEmp:     String,
  abueloDir:     String,
  abueloCel:     String,
  abuelaNom:     String,
  abuelaProf:    String,
  abuelaOcup:    String,
  abuelaEmp:     String,
  abuelaDir:     String,
  abuelaCel:     String,
}, { _id: false });

const HermanoSchema = new mongoose.Schema({
  nombre:  String,
  edad:    String,
  colegio: String,
}, { _id: false });

const SolicitudSchema = new mongoose.Schema({
  // ── Campos de compatibilidad/acceso rápido ─────
  padre1:             { type: String, trim: true, default: '' },
  padre2:             { type: String, trim: true, default: '' },
  email:              { type: String, trim: true, lowercase: true, default: '' },
  telefono:           { type: String, trim: true, default: '' },
  nacionalidadPadres: { type: String, default: '' },
  situacionLaboral:   { type: String, default: '' },

  // ── Aspirante ──────────────────────────────────
  nombreAspirante:      { type: String, trim: true, default: '' },
  edad:                 { type: Number, default: 0 },
  grado:                { type: String, default: '' },
  nacionalidadAspirante:{ type: String, default: '' },
  tipoDocAspirante:     String,
  numDocAspirante:      String,
  lugarNacAspirante:    String,
  fechaNacAspirante:    String,
  nacionalidadTextAsp:  String,
  viveCon:              String,
  telefonoAspirante:    String,
  direccionAspirante:   String,
  idiomasAspirante:     String,
  razones:              String,

  // ── Educación anterior ─────────────────────────
  conoceSistema:       String,
  filosofia:           String,
  vieneLiceoFrances:   String,
  vieneGuarderia:      String,
  gradoAnterior:       String,
  institucionAnterior: String,
  anioAnterior:        String,
  institucionBilingue: String,
  idiomaInstitucion:   String,

  // ── Acudientes ────────────────────────────────
  acud1: AcudienteSchema,
  acud2: AcudienteSchema,

  // ── Hermanos ──────────────────────────────────
  hermanos: [HermanoSchema],

  // ── Autorizaciones ────────────────────────────
  autorizaVerificar: String,
  autorizaDatos:     String,

  // ── Cita ──────────────────────────────────────
  fecha: { type: String, default: null },
  hora:  { type: String, default: null },

  // ── Documentos subidos ────────────────────────
  documentos: [{
    tipo:         String,
    nombre:       String,
    onedrivePath: String,
    subidoEn:     { type: Date, default: Date.now },
  }],

  // ── Estado ────────────────────────────────────
  estado: {
    type: String,
    enum: ['pendiente','documentos_completos','cita_agendada','completado'],
    default: 'pendiente',
  },

  // ── IDs externos ──────────────────────────────
  eventoCalendarId:  { type: String, default: null },
  carpetaOnedriveId: { type: String, default: null },

  creadoEn:     { type: Date, default: Date.now },
  actualizadoEn:{ type: Date, default: Date.now },
}, { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } });

module.exports = mongoose.model('Solicitud', SolicitudSchema);
