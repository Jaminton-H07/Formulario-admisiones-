const mongoose = require('mongoose');

const HORAS_VALIDAS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
];

const SlotSchema = new mongoose.Schema({
  fecha:      { type: String, required: true },  // YYYY-MM-DD
  hora:       { type: String, required: true, enum: HORAS_VALIDAS },
  ocupado:    { type: Boolean, default: true },
  solicitudId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Solicitud', default: null },
  reservadoEn:{ type: Date, default: Date.now },
}, {
  timestamps: false,
});

SlotSchema.index({ fecha: 1, hora: 1 }, { unique: true });

module.exports = mongoose.model('Slot', SlotSchema);
module.exports.HORAS_VALIDAS = HORAS_VALIDAS;
