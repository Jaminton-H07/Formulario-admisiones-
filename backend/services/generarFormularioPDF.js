'use strict';
const PDFDocument = require('pdfkit');

/* ── Colores ────────────────────────────────── */
const NAVY   = '#0C1C3C';
const RED    = '#1E6DB4';
const WHITE  = '#FFFFFF';
const BORDER = '#AAAAAA';
const LABEL  = '#555555';
const TEXT   = '#111111';
const LIGHT  = '#F6F6F6';

/* ── Geometría (LETTER = 612 x 792 pts) ────── */
const M  = 40;           // márgenes
const PW = 612;
const PH = 792;
const CW = PW - M * 2;  // 532

function v(x) { return (x || '').toString().trim(); }

/* ─────────────────────────────────────────────
   Helpers de dibujo
   ───────────────────────────────────────────── */

function sectionHeader(doc, y, title, bg) {
  bg = bg || NAVY;
  doc.rect(M, y, CW, 18).fill(bg);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(7.5)
     .text(title, M + 5, y + 5, { width: CW - 10, lineBreak: false });
  doc.fillColor(TEXT).font('Helvetica').fontSize(8);
  return y + 18;
}

/**
 * Dibuja una celda con etiqueta pequeña arriba y valor abajo.
 */
function cell(doc, x, y, w, h, label, value) {
  doc.rect(x, y, w, h).strokeColor(BORDER).lineWidth(0.5).stroke();
  if (label) {
    doc.fillColor(LABEL).font('Helvetica').fontSize(6)
       .text(label, x + 3, y + 3, { width: w - 6, lineBreak: false });
  }
  if (value && v(value) !== '') {
    doc.fillColor(TEXT).font('Helvetica').fontSize(8.5)
       .text(v(value), x + 3, y + 12, { width: w - 6, lineBreak: false });
  }
}

/**
 * Dibuja una fila de celdas. fields = [{w: fracción, label, value}]
 * La última celda toma el espacio sobrante para evitar gaps de redondeo.
 */
function row(doc, y, h, fields) {
  let x = M;
  fields.forEach((f, i) => {
    const isLast = i === fields.length - 1;
    const w = isLast ? (M + CW - x) : Math.round(f.w * CW);
    cell(doc, x, y, w, h, f.label || '', f.value || '');
    x += w;
  });
  return y + h;
}

/**
 * Dibuja un checkbox con etiqueta.
 */
function chk(doc, x, y, label, checked) {
  const s = 8;
  doc.rect(x, y, s, s).strokeColor(BORDER).lineWidth(0.5).stroke();
  if (checked) {
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(8)
       .text('X', x + 1, y + 0.5, { lineBreak: false });
  }
  doc.fillColor(TEXT).font('Helvetica').fontSize(7.5)
     .text(label, x + 11, y + 0.5, { lineBreak: false });
}

/**
 * Sección con fondo de color, líneas guía y texto del padre.
 */
function textArea(doc, y, title, value, nLines, bg) {
  nLines = nLines || 8;
  y = sectionHeader(doc, y, title, bg || RED);
  const lh = 14;
  const h  = lh * nLines;

  doc.rect(M, y, CW, h).fillColor(LIGHT).fill();
  doc.rect(M, y, CW, h).strokeColor(BORDER).lineWidth(0.5).stroke();

  for (let i = 1; i < nLines; i++) {
    doc.moveTo(M + 4, y + lh * i)
       .lineTo(M + CW - 4, y + lh * i)
       .strokeColor('#DDDDDD').lineWidth(0.3).stroke();
  }

  if (v(value)) {
    doc.fillColor(TEXT).font('Helvetica').fontSize(8.5)
       .text(v(value), M + 5, y + 4, { width: CW - 10, height: h - 8 });
  }

  return y + h + 4;
}

function footer(doc) {
  const y = PH - 30;
  doc.moveTo(M, y).lineTo(PW - M, y).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(LABEL).font('Helvetica').fontSize(7)
     .text('Teléfono: 305 401 184 21', M, y + 5)
     .text('Dirección: Km 10 Vía Escobero Las Palmas', M + 160, y + 5)
     .text('F-AR-02  Versión 02', PW - M - 80, y + 5);
}

/* ─────────────────────────────────────────────
   PÁGINA 1 — Aspirante + Razones
   ───────────────────────────────────────────── */
function pagina1(doc, s) {
  // Caja F-AR-02 (esquina superior derecha)
  doc.rect(PW - M - 75, M, 75, 28).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(8).text('F-AR-02', PW - M - 70, M + 4)
     .font('Helvetica').fontSize(7).text('Versión 02', PW - M - 70, M + 15);

  // Título
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(20)
     .text('SOLICITUD DE INGRESO', M, M + 8);
  doc.fillColor(NAVY).font('Helvetica').fontSize(11)
     .text('Colegio Internacional Bilingüe', M, M + 32);

  let y = M + 60;
  y = sectionHeader(doc, y, 'INFORMACIÓN PERSONAL DEL ASPIRANTE');

  // Caja de foto (izquierda)
  const photoW = 115;
  const photoH = 128;
  doc.rect(M, y, photoW, photoH).fillColor('#E8E8E8').fill();
  doc.rect(M, y, photoW, photoH).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(LABEL).font('Helvetica').fontSize(7)
     .text('Fotografía reciente\ntamaño 3x4 cm', M, y + 54, { width: photoW, align: 'center' });

  // Campos del aspirante (derecha de la foto)
  const fx = M + photoW;
  const fw = CW - photoW;
  const rh = 26;
  let fy = y;

  cell(doc, fx, fy, fw, rh, 'NOMBRE COMPLETO:', v(s.nombreAspirante));
  fy += rh;

  cell(doc, fx, fy, Math.round(fw * 0.5), rh,
       'DOCUMENTO DE IDENTIDAD:', v(s.tipoDocAspirante) + (v(s.numDocAspirante) ? ' ' + v(s.numDocAspirante) : ''));
  cell(doc, fx + Math.round(fw * 0.5), fy, fw - Math.round(fw * 0.5), rh,
       'LUGAR DE NACIMIENTO:', v(s.lugarNacAspirante));
  fy += rh;

  cell(doc, fx, fy, Math.round(fw * 0.5), rh,
       'FECHA DE NACIMIENTO (DÍA/MES/AÑO):', v(s.fechaNacAspirante));
  cell(doc, fx + Math.round(fw * 0.5), fy, fw - Math.round(fw * 0.5), rh,
       'NACIONALIDAD:', v(s.nacionalidadTextAsp || s.nacionalidadAspirante));
  fy += rh;

  // Vive con — checkboxes
  cell(doc, fx, fy, fw, rh, 'ACTUALMENTE VIVE CON:', '');
  const vc = v(s.viveCon).toLowerCase();
  const cbY = fy + 14;
  chk(doc, fx + 5,   cbY, 'AMBOS PADRES', vc.includes('ambos'));
  chk(doc, fx + 85,  cbY, 'MAMÁ',  vc === 'mamá' || vc === 'mama' || vc.includes('mamá'));
  chk(doc, fx + 130, cbY, 'PAPÁ',  vc === 'papá' || vc === 'papa' || vc.includes('papá'));
  chk(doc, fx + 175, cbY, 'OTRO',  vc.includes('otro'));
  fy += rh;

  cell(doc, fx, fy, Math.round(fw * 0.5), rh, 'TELÉFONO:', v(s.telefonoAspirante));
  cell(doc, fx + Math.round(fw * 0.5), fy, fw - Math.round(fw * 0.5), rh,
       'DIRECCIÓN:', v(s.direccionAspirante));
  fy += rh;

  // Después del bloque foto/campos
  y = Math.max(y + photoH, fy);

  // Idiomas e ingreso (fila completa)
  y = row(doc, y, 24, [
    { w: 0.6, label: 'IDIOMAS:', value: s.idiomasAspirante },
    { w: 0.4, label: 'AÑO ESCOLAR DE INGRESO:', value: s.grado },
  ]);
  y += 4;

  // Razones
  y = textArea(doc, y, '¿CUÁLES SON LAS RAZONES POR LAS CUALES QUIERE ESCOLARIZAR A SU HIJO EN EL LICEO FRANCÉS?',
               s.razones, 10);

  footer(doc);
}

/* ─────────────────────────────────────────────
   PÁGINA 2 — Sistema educativo + Educación anterior
   ───────────────────────────────────────────── */
function pagina2(doc, s) {
  let y = M;
  const rh = 24;

  y = textArea(doc, y, '¿CONOCE USTED EL SISTEMA EDUCATIVO FRANCÉS?', s.conoceSistema, 8);
  y += 4;
  y = textArea(doc, y, '¿CUÁL ES SU FILOSOFÍA ACERCA DE LA EDUCACIÓN Y EL ROL DE LOS PADRES EN LA EDUCACIÓN DE SUS HIJOS?',
               s.filosofia, 8);
  y += 8;

  y = sectionHeader(doc, y, 'EDUCACIÓN ANTERIOR DEL ASPIRANTE');

  // Liceo francés
  cell(doc, M, y, CW, rh, '', '');
  doc.fillColor(TEXT).font('Helvetica').fontSize(8)
     .text('¿EL CANDIDATO VIENE DE UN LICEO FRANCÉS?', M + 5, y + 9, { lineBreak: false });
  const lf = v(s.vieneLiceoFrances).toLowerCase();
  chk(doc, M + 240, y + 8, 'SÍ', lf === 'si' || lf === 'sí');
  chk(doc, M + 270, y + 8, 'NO', lf === 'no');
  y += rh;

  // Guardería
  cell(doc, M, y, CW, rh, '', '');
  doc.fillColor(TEXT).font('Helvetica').fontSize(8)
     .text('¿EL CANDIDATO VIENE DE GUARDERÍA?', M + 5, y + 9, { lineBreak: false });
  const gd = v(s.vieneGuarderia).toLowerCase();
  chk(doc, M + 225, y + 8, 'SÍ', gd === 'si' || gd === 'sí');
  chk(doc, M + 255, y + 8, 'NO', gd === 'no');
  y += rh;

  y = row(doc, y, rh, [
    { w: 0.22, label: 'GRADO:', value: s.gradoAnterior },
    { w: 0.53, label: 'INSTITUCIÓN:', value: s.institucionAnterior },
    { w: 0.25, label: 'AÑO:', value: s.anioAnterior },
  ]);

  // Bilingüe
  cell(doc, M, y, CW, rh, '', '');
  doc.fillColor(TEXT).font('Helvetica').fontSize(8)
     .text('¿LA INSTITUCIÓN ERA BILINGÜE?', M + 5, y + 9, { lineBreak: false });
  const bi = v(s.institucionBilingue).toLowerCase();
  chk(doc, M + 195, y + 8, 'SÍ', bi === 'si' || bi === 'sí');
  chk(doc, M + 225, y + 8, 'NO', bi === 'no');
  y += rh;

  y = row(doc, y, rh, [{ w: 1, label: 'IDIOMA:', value: s.idiomaInstitucion }]);

  footer(doc);
}

/* ─────────────────────────────────────────────
   Helper: dibuja un bloque de acudiente completo
   ───────────────────────────────────────────── */
function dibujarAcudiente(doc, acud, numero, startY) {
  const rh = 23;
  let y = startY;
  const a = acud || {};

  y = sectionHeader(doc, y, `INFORMACIÓN ACUDIENTE ${numero}`);

  y = row(doc, y, rh, [
    { w: 0.42, label: 'NOMBRE COMPLETO:', value: a.nombre },
    { w: 0.33, label: 'LUGAR DE NACIMIENTO:', value: a.lugarNac },
    { w: 0.25, label: 'NACIONALIDAD:', value: a.nacionalidad },
  ]);
  y = row(doc, y, rh, [
    { w: 0.10, label: 'TIPO D.', value: a.tipoDoc },
    { w: 0.27, label: 'DOCUMENTO DE IDENTIDAD:', value: a.numDoc },
    { w: 0.24, label: 'EXPEDIDO EN:', value: a.expedidoEn },
    { w: 0.28, label: 'FECHA DE NACIMIENTO (D/M/A):', value: a.fechaNac },
    { w: 0.11, label: 'FOTO', value: '' },
  ]);
  y = row(doc, y, rh, [
    { w: 0.55, label: 'COLEGIO EN EL QUE REALIZÓ SUS ESTUDIOS SECUNDARIOS:', value: a.colegioSec },
    { w: 0.45, label: 'ESTUDIOS SUPERIORES (Univ / Esp / Maes / Doc):', value: a.estudios },
  ]);
  y = row(doc, y, rh, [
    { w: 1, label: '¿DE QUÉ UNIVERSIDAD ES SU TÍTULO PROFESIONAL?:', value: a.univTitulo },
  ]);
  y = row(doc, y, rh, [
    { w: 0.60, label: '¿DE QUÉ UNIVERSIDAD ES EL ÚLTIMO GRADO ADQUIRIDO?:', value: a.univUltimo },
    { w: 0.40, label: 'IDIOMAS:', value: a.idiomas },
  ]);
  y = row(doc, y, rh, [
    { w: 0.38, label: 'PROFESIÓN:', value: a.profesion },
    { w: 0.62, label: 'OCUPACIÓN:', value: a.ocupacion },
  ]);
  y = row(doc, y, rh, [
    { w: 0.25, label: 'EMPRESA:', value: a.empresa },
    { w: 0.22, label: 'CARGO:', value: a.cargo },
    { w: 0.30, label: 'DIRECCIÓN OFICINA:', value: a.dirOficina },
    { w: 0.23, label: 'TELÉFONO OFICINA:', value: a.telOficina },
  ]);
  y = row(doc, y, rh, [
    { w: 0.36, label: 'DIRECCIÓN RESIDENCIA:', value: a.dirResidencia },
    { w: 0.36, label: 'EDIFICIO/UNIDAD RESIDENCIAL:', value: a.edificio },
    { w: 0.28, label: 'BARRIO:', value: a.barrio },
  ]);
  y = row(doc, y, rh, [
    { w: 0.30, label: 'CELULAR 1:', value: a.celular1 },
    { w: 0.30, label: 'CELULAR 2:', value: a.celular2 },
    { w: 0.40, label: 'CORREO ELECTRÓNICO:', value: a.email },
  ]);

  // Otro matrimonio
  y += 5;
  y = sectionHeader(doc, y, 'OTRO MATRIMONIO');
  y = row(doc, y, rh, [{ w: 1, label: 'CÓNYUGE:', value: a.conyuge }]);
  y = row(doc, y, rh, [
    { w: 0.70, label: 'HIJO 1:', value: a.hijo1Nom },
    { w: 0.30, label: 'EDAD:', value: a.hijo1Edad },
  ]);
  y = row(doc, y, rh, [
    { w: 0.70, label: 'HIJO 2:', value: a.hijo2Nom },
    { w: 0.30, label: 'EDAD:', value: a.hijo2Edad },
  ]);

  // Abuelo
  y += 5;
  y = sectionHeader(doc, y, `INFORMACIÓN DEL ABUELO DEL ASPIRANTE (ACUDIENTE ${numero})`);
  y = row(doc, y, rh, [{ w: 1, label: 'NOMBRE COMPLETO:', value: a.abueloNom }]);
  y = row(doc, y, rh, [
    { w: 0.28, label: 'PROFESIÓN:', value: a.abueloProf },
    { w: 0.36, label: 'OCUPACIÓN:', value: a.abueloOcup },
    { w: 0.36, label: 'EMPRESA DONDE LABORÓ:', value: a.abueloEmp },
  ]);
  y = row(doc, y, rh, [
    { w: 0.55, label: 'DIRECCIÓN RESIDENCIA:', value: a.abueloDir },
    { w: 0.45, label: 'CELULAR:', value: a.abueloCel },
  ]);

  // Abuela
  y += 5;
  y = sectionHeader(doc, y, `INFORMACIÓN DE LA ABUELA DEL ASPIRANTE (ACUDIENTE ${numero})`);
  y = row(doc, y, rh, [{ w: 1, label: 'NOMBRE COMPLETO:', value: a.abuelaNom }]);
  y = row(doc, y, rh, [
    { w: 0.28, label: 'PROFESIÓN:', value: a.abuelaProf },
    { w: 0.36, label: 'OCUPACIÓN:', value: a.abuelaOcup },
    { w: 0.36, label: 'EMPRESA DONDE LABORÓ:', value: a.abuelaEmp },
  ]);
  y = row(doc, y, rh, [
    { w: 0.55, label: 'DIRECCIÓN RESIDENCIA:', value: a.abuelaDir },
    { w: 0.45, label: 'CELULAR:', value: a.abuelaCel },
  ]);

  return y;
}

/* ─────────────────────────────────────────────
   PÁGINAS 3 y 4 — Acudientes
   ───────────────────────────────────────────── */
function pagina3(doc, s) {
  dibujarAcudiente(doc, s.acud1, 1, M);
  footer(doc);
}

function pagina4(doc, s) {
  dibujarAcudiente(doc, s.acud2, 2, M);
  footer(doc);
}

/* ─────────────────────────────────────────────
   PÁGINA 5 — Hermanos + Autorizaciones + Firmas
   ───────────────────────────────────────────── */
function pagina5(doc, s) {
  const rh = 24;
  let y = M;

  y = sectionHeader(doc, y, 'INFORMACIÓN DE LOS HERMANOS DEL ASPIRANTE');

  // Cabecera de tabla
  const col1 = Math.round(CW * 0.50);
  const col2 = Math.round(CW * 0.18);
  const col3 = CW - col1 - col2;
  cell(doc, M,          y, col1, 18, 'NOMBRE COMPLETO', '');
  cell(doc, M + col1,   y, col2, 18, 'EDAD', '');
  cell(doc, M + col1 + col2, y, col3, 18, 'COLEGIO O UNIVERSIDAD', '');
  y += 18;

  const hermanos = Array.isArray(s.hermanos) ? s.hermanos : [];
  for (let i = 0; i < 3; i++) {
    const h = hermanos[i] || {};
    cell(doc, M,          y, col1, rh, '', h.nombre);
    cell(doc, M + col1,   y, col2, rh, '', h.edad);
    cell(doc, M + col1 + col2, y, col3, rh, '', h.colegio);
    y += rh;
  }

  y += 12;
  y = sectionHeader(doc, y, 'INFORMACIÓN PARA USO EXCLUSIVO DEL LYCÉE FRANÇAIS');
  y += 6;

  // Autorización verificar
  doc.rect(M, y, CW, 42).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(TEXT).font('Helvetica').fontSize(8)
     .text('AUTORIZO AL LYCÉE FRANÇAIS MEDELLÍN VERIFICAR LA INFORMACIÓN SUMINISTRADA.',
           M + 8, y + 8, { width: CW - 16 });
  const av = v(s.autorizaVerificar).toLowerCase();
  chk(doc, M + 10, y + 26, 'SÍ', av === 'si' || av === 'sí');
  chk(doc, M + 45, y + 26, 'NO', av === 'no');
  y += 52;

  // Autorización datos
  doc.rect(M, y, CW, 52).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(TEXT).font('Helvetica').fontSize(8)
     .text('AUTORIZO EL TRATAMIENTO DE NUESTROS DATOS PERSONALES ESTABLECIDOS EN LA POLÍTICA VIGENTE DEL LICEO FRANCÉS DE MEDELLÍN.',
           M + 8, y + 8, { width: CW - 16 });
  const ad = v(s.autorizaDatos).toLowerCase();
  chk(doc, M + 10, y + 36, 'SÍ', ad === 'si' || ad === 'sí');
  chk(doc, M + 45, y + 36, 'NO', ad === 'no');
  y += 62;

  // Entrevista agendada
  if (s.fecha && s.hora) {
    y += 5;
    y = sectionHeader(doc, y, 'ENTREVISTA AGENDADA', NAVY);
    y = row(doc, y, rh, [
      { w: 0.45, label: 'FECHA:', value: s.fecha },
      { w: 0.55, label: 'HORA:', value: s.hora },
    ]);
  }

  // Firmas
  y += 30;
  const firmaW = 160;
  doc.moveTo(M + 10, y).lineTo(M + 10 + firmaW, y).strokeColor('#999999').lineWidth(0.5).stroke();
  doc.moveTo(M + CW - 10 - firmaW, y).lineTo(M + CW - 10, y).strokeColor('#999999').lineWidth(0.5).stroke();
  y += 5;
  const nom1 = v((s.acud1 && s.acud1.nombre) || s.padre1);
  const doc1 = v((s.acud1 && s.acud1.numDoc) || '');
  const nom2 = v((s.acud2 && s.acud2.nombre) || s.padre2);
  const doc2 = v((s.acud2 && s.acud2.numDoc) || '');

  doc.fillColor(TEXT).font('Helvetica').fontSize(8)
     .text(`Firma acudiente 1\nC.C. ${doc1}`, M + 10, y)
     .text(`Firma acudiente 2\nC.C. ${doc2}`, M + CW - 10 - firmaW, y);

  footer(doc);
}

/* ─────────────────────────────────────────────
   Función principal exportada
   ───────────────────────────────────────────── */
exports.generarFormularioPDF = function(solicitud) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'LETTER', margin: 0, autoFirstPage: true });

    doc.on('data',  chunk => chunks.push(chunk));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    pagina1(doc, solicitud);
    doc.addPage();
    pagina2(doc, solicitud);
    doc.addPage();
    pagina3(doc, solicitud);
    doc.addPage();
    pagina4(doc, solicitud);
    doc.addPage();
    pagina5(doc, solicitud);

    doc.end();
  });
};
