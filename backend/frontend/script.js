/* ═══════════════════════════════════════════════
   LYCÉE FRANÇAIS DE MEDELLÍN — ADMISIONES
   Formulario F-AR-02 — 9 pasos
   ═══════════════════════════════════════════════ */

const API_BASE = '/api';

/* ── Estado ──────────────────────────────────── */
const state = {
  currentStep: 1,
  totalSteps:  9,
  solicitudId: null,
  selectedDate: null,
  selectedSlot: null,
  files:    {},
  formData: {},
  calYear:  new Date().getFullYear(),
  calMonth: new Date().getMonth(),
};


/* ── Definición de documentos ────────────────── */
const CATEGORIAS = {
  proceso:   '📋 Documentos del proceso',
  aspirante: '🎓 Documentos del aspirante',
  fotos:     '📷 Fotografías',
  padres:    '👨‍👩‍👧 Documentos de los padres',
  laboral:   '💼 Documentos laborales',
};

function getDocumentos() {
  const np   = state.formData.nacionalidadPadres;
  const nl   = state.formData.situacionLaboral;
  const na   = state.formData.nacionalidadAspirante;
  const edad = parseInt(state.formData.edad) || 0;
  const docs = [];

  // Proceso
  docs.push({ id:'formulario', cat:'proceso', nombre:'Formulario de inscripción F-AR-02 diligenciado',        desc:'PDF · descargue, diligencie y suba el formulario oficial', formato:'PDF',     req:true  });
  docs.push({ id:'pago',       cat:'proceso', nombre:'Comprobante de pago valoraciones técnicas ($350.000)',  desc:'PDF o JPG · captura o archivo del pago',                  formato:'PDF/JPG', req:true  });
  docs.push({ id:'renta',      cat:'proceso', nombre:'Declaración de renta o certificación pago impuestos',   desc:'PDF · del año fiscal más reciente',                       formato:'PDF',     req:true  });

  // Aspirante
  docs.push({ id:'registro_civil', cat:'aspirante', nombre:'Registro civil de nacimiento del aspirante',           desc:'PDF',                              formato:'PDF',     req:true });
  docs.push({ id:'eps',            cat:'aspirante', nombre:'Certificado seguro médico / EPS / medicina prepagada', desc:'PDF · vigente del aspirante',      formato:'PDF',     req:true });

  if (na === 'col' && edad >= 7)
    docs.push({ id:'ti_aspirante', cat:'aspirante', nombre:'Tarjeta de identidad del aspirante (ambas caras)', desc:'PDF · mayores de 7 años', formato:'PDF/JPG', req:true });
  if (na === 'ext') {
    docs.push({ id:'pasaporte_aspirante',  cat:'aspirante', nombre:'Pasaporte del aspirante',             desc:'PDF o JPG · página principal', formato:'PDF/JPG', req:true });
    docs.push({ id:'visa_aspirante',       cat:'aspirante', nombre:'Visa del aspirante',                  desc:'PDF o JPG · vigente',          formato:'PDF/JPG', req:true });
    docs.push({ id:'cedula_ext_aspirante', cat:'aspirante', nombre:'Cédula de extranjería del aspirante', desc:'PDF o JPG',                    formato:'PDF/JPG', req:true });
  }
  // Fotografías
  docs.push({ id:'foto_aspirante', cat:'fotos', nombre:'Fotografía tipo documento del aspirante',   desc:'JPG · a color, fondo blanco, 3x4 cm',             formato:'JPG/PNG', req:true  });
  docs.push({ id:'foto_familia',   cat:'fotos', nombre:'Fotografía del grupo familiar',             desc:'JPG · todo el grupo con el que convive',          formato:'JPG/PNG', req:true  });
  docs.push({ id:'foto_padre1',    cat:'fotos', nombre:'Fotografía tipo documento acudiente 1',     desc:'JPG · a color, fondo blanco',                     formato:'JPG/PNG', req:true  });
  docs.push({ id:'foto_padre2',    cat:'fotos', nombre:'Fotografía tipo documento acudiente 2',     desc:'JPG · si aplica (segundo acudiente)',              formato:'JPG/PNG', req:false });

  // Padres
  if (np === 'col') {
    docs.push({ id:'cedula_padres',    cat:'padres', nombre:'Cédula de identidad de los padres (ambas caras)', desc:'PDF o JPG',                        formato:'PDF/JPG', req:true });
    docs.push({ id:'pasaporte_padres', cat:'padres', nombre:'Pasaporte de los padres (página principal)',       desc:'PDF o JPG',                        formato:'PDF/JPG', req:true });
  }
  if (np === 'ext') {
    docs.push({ id:'pasaporte_padres_ext', cat:'padres', nombre:'Pasaporte de los padres',            desc:'PDF o JPG · página principal', formato:'PDF/JPG', req:true });
    docs.push({ id:'visa_padres',          cat:'padres', nombre:'Visa de los padres',                 desc:'PDF o JPG · vigente',          formato:'PDF/JPG', req:true });
    docs.push({ id:'cedula_ext_padres',    cat:'padres', nombre:'Cédula de extranjería de los padres',desc:'PDF o JPG',                   formato:'PDF/JPG', req:true });
  }
  if (np !== 'fra') {
    docs.push({ id:'secap1', cat:'padres', nombre:'Documento SECAP acudiente 1', desc:'PDF · requerido para padres no franceses', formato:'PDF', req:true  });
    docs.push({ id:'secap2', cat:'padres', nombre:'Documento SECAP acudiente 2', desc:'PDF · si aplica',                          formato:'PDF', req:false });
  }

  // Laboral
  if (nl === 'emp')
    docs.push({ id:'cert_laboral', cat:'laboral', nombre:'Certificado laboral en papel membretado', desc:'PDF · incluir cargo, antigüedad e ingreso', formato:'PDF', req:true });
  if (nl === 'ind') {
    docs.push({ id:'cert_ingresos', cat:'laboral', nombre:'Certificado de ingresos',           desc:'PDF',          formato:'PDF',     req:true });
    docs.push({ id:'tarjeta_cont',  cat:'laboral', nombre:'Tarjeta profesional del contador',  desc:'PDF o JPG',    formato:'PDF/JPG', req:true });
    docs.push({ id:'camara',        cat:'laboral', nombre:'Cámara de comercio',                desc:'PDF · vigente',formato:'PDF',     req:true });
  }
  if (nl === 'mix') {
    docs.push({ id:'cert_laboral_mix',  cat:'laboral', nombre:'Certificado laboral del empleado (papel membretado)', desc:'PDF · cargo, antigüedad e ingreso', formato:'PDF',     req:true });
    docs.push({ id:'cert_ingresos_mix', cat:'laboral', nombre:'Certificado de ingresos del independiente',           desc:'PDF',                              formato:'PDF',     req:true });
    docs.push({ id:'tarjeta_cont_mix',  cat:'laboral', nombre:'Tarjeta profesional del contador',                   desc:'PDF o JPG',                        formato:'PDF/JPG', req:true });
    docs.push({ id:'camara_mix',        cat:'laboral', nombre:'Cámara de comercio',                                 desc:'PDF · vigente',                    formato:'PDF',     req:true });
  }

  return docs;
}

/* ── Helpers ─────────────────────────────────── */
function showModal(title, msg, icon = '⚠️') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMsg').textContent   = msg;
  document.getElementById('modalIcon').textContent  = icon;
  document.getElementById('modalOverlay').classList.remove('hidden');
}
function hideModal() { document.getElementById('modalOverlay').classList.add('hidden'); }
document.getElementById('modalClose').addEventListener('click', hideModal);

function showLoader(text = 'Procesando...') {
  document.getElementById('loaderText').textContent = text;
  document.getElementById('loaderOverlay').classList.remove('hidden');
}
function hideLoader() { document.getElementById('loaderOverlay').classList.add('hidden'); }

function formatBytes(b) {
  if (b < 1024)    return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function v(id)    { return document.getElementById(id)?.value.trim() || ''; }
function radio(n) { return document.querySelector(`input[name="${n}"]:checked`)?.value || ''; }
function chk(id)  { return document.getElementById(id)?.checked || false; }

/* ── Navegación ──────────────────────────────── */
function goToStep(next) {
  const cur = state.currentStep;
  if (next === cur) return;
  const curPanel  = document.getElementById('step' + cur);
  const nextPanel = document.getElementById('step' + next);
  curPanel.classList.add('exiting');
  setTimeout(() => {
    curPanel.classList.remove('active', 'exiting');
    nextPanel.classList.add('active');
    state.currentStep = next;
    updateProgressBar(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 380);
}

function updateProgressBar(step) {
  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    const n = i + 1;
    dot.classList.remove('active', 'completed');
    if (n < step)  dot.classList.add('completed');
    if (n === step) dot.classList.add('active');
  });
  const pct = ((step - 1) / (state.totalSteps - 1)) * 100;
  document.getElementById('progressLineFill').style.width = pct + '%';
}

/* ══════════════════════════════════════════════
   PASO 1 — Información Personal del Aspirante
   ══════════════════════════════════════════════ */

document.getElementById('btn1Next').addEventListener('click', () => {
  const nombre = v('nombreAspirante');
  const dia    = v('diaNacAspirante');
  const mes    = v('mesNacAspirante');
  const anio   = v('anioNacAspirante');
  const na     = radio('nacionalidadAspirante');
  const vc     = radio('viveCon');
  const grado  = v('grado');

  // Calcular edad aproximada
  const hoy  = new Date();
  const nac  = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
  const edad = isNaN(nac) ? 0 : Math.floor((hoy - nac) / (365.25 * 24 * 3600 * 1000));

  Object.assign(state.formData, {
    nombreAspirante:       nombre,
    tipoDocAspirante:      v('tipoDocAspirante'),
    numDocAspirante:       v('numDocAspirante'),
    lugarNacAspirante:     v('lugarNacAspirante'),
    fechaNacAspirante:     `${dia}/${mes}/${anio}`,
    nacionalidadTextAsp:   v('nacionalidadTextAspirante'),
    nacionalidadAspirante: na,
    viveCon:               vc,
    telefonoAspirante:     v('telefonoAspirante'),
    direccionAspirante:    v('direccionAspirante'),
    idiomasAspirante:      v('idiomasAspirante'),
    grado,
    edad,
    razones:               v('razones'),
  });

  goToStep(2);
});

/* ══════════════════════════════════════════════
   PASO 2 — Educación anterior
   ══════════════════════════════════════════════ */
document.getElementById('btn2Back').addEventListener('click', () => goToStep(1));
document.getElementById('btn2Next').addEventListener('click', () => {
  Object.assign(state.formData, {
    conoceSistema:       v('conoceSistema'),
    filosofia:           v('filosofia'),
    vieneLiceoFrances:   radio('vieneLiceoFrances'),
    vieneGuarderia:      radio('vieneGuarderia'),
    gradoAnterior:       v('gradoAnterior'),
    institucionAnterior: v('institucionAnterior'),
    anioAnterior:        v('anioAnterior'),
    institucionBilingue: radio('institucionBilingue'),
    idiomaInstitucion:   v('idiomaInstitucion'),
  });
  goToStep(3);
});

/* ══════════════════════════════════════════════
   PASO 3 — Acudiente 1
   ══════════════════════════════════════════════ */
document.getElementById('btn3Back').addEventListener('click', () => goToStep(2));
document.getElementById('btn3Next').addEventListener('click', () => {
  const nombre  = v('nombreAcud1');
  const celular = v('celular1Acud1');
  const email   = v('emailAcud1');
  const nl      = radio('situacionLaboral');
  const np      = radio('nacionalidadPadres');

  const estudios = [];
  if (chk('univAcud1'))  estudios.push('Universitarios');
  if (chk('espAcud1'))   estudios.push('Especialización');
  if (chk('maestAcud1')) estudios.push('Maestría');
  if (chk('docAcud1'))   estudios.push('Doctorado');

  Object.assign(state.formData, {
    // Contacto principal
    email,
    telefono:          celular,
    situacionLaboral:  nl,
    nacionalidadPadres: np,
    padre1:            nombre,

    // Datos acudiente 1
    acud1: {
      nombre,
      lugarNac:        v('lugarNacAcud1'),
      nacionalidad:    v('nacionalidadAcud1'),
      tipoDoc:         v('tipoDocAcud1'),
      numDoc:          v('numDocAcud1'),
      expedidoEn:      v('expedidoEnAcud1'),
      fechaNac:        `${v('diaNacAcud1')}/${v('mesNacAcud1')}/${v('anioNacAcud1')}`,
      colegioSec:      v('colegioSecAcud1'),
      estudios:        estudios.join(', '),
      univTitulo:      v('univTituloAcud1'),
      univUltimo:      v('univUltimoGradoAcud1'),
      idiomas:         v('idiomasAcud1'),
      profesion:       v('profesionAcud1'),
      ocupacion:       v('ocupacionAcud1'),
      empresa:         v('empresaAcud1'),
      cargo:           v('cargoAcud1'),
      dirOficina:      v('dirOficinaAcud1'),
      telOficina:      v('telOficinaAcud1'),
      dirResidencia:   v('dirResidenciaAcud1'),
      edificio:        v('edificioAcud1'),
      barrio:          v('barrioAcud1'),
      celular1:        celular,
      celular2:        v('celular2Acud1'),
      email,
      conyuge:         v('conyugeAcud1'),
      hijo1Nom:        v('hijo1NomAcud1'),
      hijo1Edad:       v('hijo1EdadAcud1'),
      hijo2Nom:        v('hijo2NomAcud1'),
      hijo2Edad:       v('hijo2EdadAcud1'),
      abueloNom:       v('abueloNomAcud1'),
      abueloProf:      v('abueloProfAcud1'),
      abueloOcup:      v('abueloOcupAcud1'),
      abueloEmp:       v('abueloEmpAcud1'),
      abueloDir:       v('abueloDirAcud1'),
      abueloCel:       v('abueloCelAcud1'),
      abuelaNom:       v('abuelaNomAcud1'),
      abuelaProf:      v('abuelaProfAcud1'),
      abuelaOcup:      v('abuelaOcupAcud1'),
      abuelaEmp:       v('abuelaEmpAcud1'),
      abuelaDir:       v('abuelaDirAcud1'),
      abuelaCel:       v('abuelaCelAcud1'),
    },
  });

  goToStep(4);
});

/* ══════════════════════════════════════════════
   PASO 4 — Acudiente 2
   ══════════════════════════════════════════════ */
document.getElementById('btn4Back').addEventListener('click', () => goToStep(3));
document.getElementById('btn4Next').addEventListener('click', () => {
  const nombre = v('nombreAcud2');

  const estudios = [];
  if (chk('univAcud2'))  estudios.push('Universitarios');
  if (chk('espAcud2'))   estudios.push('Especialización');
  if (chk('maestAcud2')) estudios.push('Maestría');
  if (chk('docAcud2'))   estudios.push('Doctorado');

  Object.assign(state.formData, {
    padre2: nombre,
    acud2: {
      nombre,
      lugarNac:       v('lugarNacAcud2'),
      nacionalidad:   v('nacionalidadAcud2'),
      tipoDoc:        v('tipoDocAcud2'),
      numDoc:         v('numDocAcud2'),
      expedidoEn:     v('expedidoEnAcud2'),
      fechaNac:       `${v('diaNacAcud2')}/${v('mesNacAcud2')}/${v('anioNacAcud2')}`,
      colegioSec:     v('colegioSecAcud2'),
      estudios:       estudios.join(', '),
      univTitulo:     v('univTituloAcud2'),
      univUltimo:     v('univUltimoGradoAcud2'),
      idiomas:        v('idiomasAcud2'),
      profesion:      v('profesionAcud2'),
      ocupacion:      v('ocupacionAcud2'),
      empresa:        v('empresaAcud2'),
      cargo:          v('cargoAcud2'),
      dirOficina:     v('dirOficinaAcud2'),
      telOficina:     v('telOficinaAcud2'),
      dirResidencia:  v('dirResidenciaAcud2'),
      edificio:       v('edificioAcud2'),
      barrio:         v('barrioAcud2'),
      celular1:       v('celular1Acud2'),
      celular2:       v('celular2Acud2'),
      email:          v('emailAcud2'),
      conyuge:        v('conyugeAcud2'),
      hijo1Nom:       v('hijo1NomAcud2'),
      hijo1Edad:      v('hijo1EdadAcud2'),
      hijo2Nom:       v('hijo2NomAcud2'),
      hijo2Edad:      v('hijo2EdadAcud2'),
      abueloNom:      v('abueloNomAcud2'),
      abueloProf:     v('abueloProfAcud2'),
      abueloOcup:     v('abueloOcupAcud2'),
      abueloEmp:      v('abueloEmpAcud2'),
      abueloDir:      v('abueloDirAcud2'),
      abueloCel:      v('abueloCelAcud2'),
      abuelaNom:      v('abuelaNomAcud2'),
      abuelaProf:     v('abuelaProfAcud2'),
      abuelaOcup:     v('abuelaOcupAcud2'),
      abuelaEmp:      v('abuelaEmpAcud2'),
      abuelaDir:      v('abuelaDirAcud2'),
      abuelaCel:      v('abuelaCelAcud2'),
    },
  });

  goToStep(5);
});

/* ══════════════════════════════════════════════
   PASO 5 — Hermanos y autorizaciones
   ══════════════════════════════════════════════ */
document.getElementById('btn5Back').addEventListener('click', () => goToStep(4));
document.getElementById('btn5Next').addEventListener('click', () => {
  const autVerif = radio('autorizaVerificar');
  const autDatos = radio('autorizaDatos');


  Object.assign(state.formData, {
    hermanos: [
      { nombre: v('herm1Nombre'), edad: v('herm1Edad'), colegio: v('herm1Colegio') },
      { nombre: v('herm2Nombre'), edad: v('herm2Edad'), colegio: v('herm2Colegio') },
      { nombre: v('herm3Nombre'), edad: v('herm3Edad'), colegio: v('herm3Colegio') },
    ].filter(h => h.nombre),
    autorizaVerificar: autVerif,
    autorizaDatos:     autDatos,
  });

  renderDocs();
  goToStep(6);
});

/* ══════════════════════════════════════════════
   PASO 6 — Documentos
   ══════════════════════════════════════════════ */
function getAccept(formato) {
  if (formato === 'PDF')     return '.pdf';
  if (formato === 'JPG/PNG') return '.jpg,.jpeg,.png';
  if (formato === 'PDF/JPG') return '.pdf,.jpg,.jpeg,.png';
  return '.pdf,.jpg,.jpeg,.png';
}

function renderDocs() {
  const docs  = getDocumentos();
  const list  = document.getElementById('docsList');
  list.innerHTML = '';

  const grupos = {};
  docs.forEach(doc => {
    if (!grupos[doc.cat]) grupos[doc.cat] = [];
    grupos[doc.cat].push(doc);
  });

  let idx = 0;
  Object.entries(grupos).forEach(([cat, items]) => {
    const header = document.createElement('div');
    header.className = 'doc-category-header';
    header.innerHTML = `<span>${CATEGORIAS[cat] || cat}</span>`;
    list.appendChild(header);

    items.forEach(doc => {
      const uploaded = state.files[doc.id];
      const item = document.createElement('div');
      item.className = 'doc-item' + (uploaded ? ' doc-done' : '');
      item.id = 'doc-' + doc.id;
      item.style.animationDelay = (idx * 0.03) + 's';
      item.innerHTML = `
        <div class="doc-icon">${uploaded ? '✅' : '📄'}</div>
        <div class="doc-info">
          <div class="doc-name-row">
            <span class="doc-name">${doc.nombre}</span>
            <span class="badge ${doc.req ? 'badge-req' : 'badge-opt'}">${doc.req ? 'Obligatorio' : 'Si aplica'}</span>
          </div>
          <div class="doc-desc">${uploaded ? `📎 ${doc.desc} · <strong>${uploaded.name}</strong> (${formatBytes(uploaded.size)})` : doc.desc}</div>
        </div>
        <div class="doc-actions">
          <input type="file" id="file-${doc.id}" accept="${getAccept(doc.formato)}" style="display:none" data-docid="${doc.id}" />
          ${uploaded
            ? `<button class="btn-change" data-docid="${doc.id}">↑ Cambiar</button>
               <button class="btn-remove" data-docid="${doc.id}" title="Eliminar">✕</button>`
            : `<button class="btn-upload" data-docid="${doc.id}">↑ Subir</button>`}
        </div>`;
      list.appendChild(item);
      idx++;
    });
  });

  list.querySelectorAll('.btn-upload, .btn-change').forEach(btn =>
    btn.addEventListener('click', () => document.getElementById('file-' + btn.dataset.docid).click()));
  list.querySelectorAll('input[type="file"]').forEach(inp =>
    inp.addEventListener('change', handleFileSelect));
  list.querySelectorAll('.btn-remove').forEach(btn =>
    btn.addEventListener('click', () => { delete state.files[btn.dataset.docid]; renderDocs(); }));
}

function handleFileSelect(e) {
  const file  = e.target.files[0];
  const docId = e.target.dataset.docid;
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showModal('Archivo demasiado grande', `El archivo supera el límite de 10 MB. Tamaño: ${formatBytes(file.size)}.`, '📁');
    e.target.value = '';
    return;
  }
  state.files[docId] = file;
  renderDocs();
}

document.getElementById('btn6Back').addEventListener('click', () => goToStep(5));
document.getElementById('btn6Next').addEventListener('click', () => {
  renderReview();
  goToStep(7);
});

/* ══════════════════════════════════════════════
   PASO 7 — Revisión
   ══════════════════════════════════════════════ */
function renderReview() {
  const docs = getDocumentos();
  const list = document.getElementById('reviewList');
  list.innerHTML = '';

  const obligatorios = docs.filter(d => d.req);
  const subidos      = obligatorios.filter(d => state.files[d.id]);
  const pct = obligatorios.length > 0 ? Math.round((subidos.length / obligatorios.length) * 100) : 100;

  document.getElementById('reviewProgressFill').style.width = pct + '%';
  document.getElementById('reviewProgressLabel').textContent =
    `${subidos.length} de ${obligatorios.length} documentos obligatorios`;

  docs.forEach((doc, i) => {
    const ok   = !!state.files[doc.id];
    const item = document.createElement('div');
    item.className = 'review-item';
    item.style.animationDelay = (i * 0.04) + 's';
    item.innerHTML = `
      <div class="review-status ${ok ? 'ok' : 'pending'}">${ok ? '✓' : '!'}</div>
      <span class="review-doc-name">${doc.nombre}</span>
      <span class="badge ${doc.req ? 'badge-req' : 'badge-opt'}">${doc.req ? 'Obligatorio' : 'Si aplica'}</span>`;
    list.appendChild(item);
  });
}

document.getElementById('btn7Back').addEventListener('click', () => goToStep(6));
document.getElementById('btn7Next').addEventListener('click', async () => {
  document.getElementById('alertaFaltantes').classList.add('hidden');

  try {
    showLoader('Guardando solicitud...');
    const res = await fetch(`${API_BASE}/admisiones`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(state.formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al guardar la solicitud');
    state.solicitudId = data.solicitudId;

    // Subir documentos a OneDrive
    const archivos = Object.entries(state.files);
    if (archivos.length > 0) {
      let subidos = 0;
      for (const [docId, file] of archivos) {
        showLoader(`Subiendo documentos… ${subidos + 1} de ${archivos.length}`);
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('tipo', docId);
        fd.append('solicitudId', state.solicitudId);
        try {
          await fetch(`${API_BASE}/documentos`, { method: 'POST', body: fd });
        } catch (_) { /* continuar aunque falle uno */ }
        subidos++;
      }
    }

    hideLoader();
    buildCalendar(state.calYear, state.calMonth);
    goToStep(8);
  } catch (err) {
    hideLoader();
    showModal('Error', err.message, '❌');
  }
});

/* ══════════════════════════════════════════════
   PASO 8 — Calendario y slots
   ══════════════════════════════════════════════ */
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const today = new Date();

function buildCalendar(year, month) {
  document.getElementById('calMonthLabel').textContent = `${MONTHS_ES[month]} ${year}`;
  const container  = document.getElementById('calDays');
  container.innerHTML = '';

  const firstDay   = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr    = toDateStr(today);

  for (let i = 0; i < startOffset; i++) {
    const e = document.createElement('div');
    e.className = 'cal-day empty';
    container.appendChild(e);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj  = new Date(year, month, d);
    const dateStr  = toDateStr(dateObj);
    const dow      = dateObj.getDay();
    const disabled = dow === 0 || dow === 6 || dateStr < todayStr;
    const cell     = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = d;
    if (disabled) {
      cell.classList.add('disabled');
    } else {
      if (dateStr === todayStr)          cell.classList.add('today');
      if (dateStr === state.selectedDate) cell.classList.add('selected');
      cell.addEventListener('click', () => selectDate(dateStr));
    }
    container.appendChild(cell);
  }
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

document.getElementById('calPrev').addEventListener('click', () => {
  state.calMonth--;
  if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  buildCalendar(state.calYear, state.calMonth);
});
document.getElementById('calNext').addEventListener('click', () => {
  state.calMonth++;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  buildCalendar(state.calYear, state.calMonth);
});

async function selectDate(dateStr) {
  state.selectedDate = dateStr;
  state.selectedSlot = null;
  document.getElementById('btn8Next').classList.add('hidden');
  buildCalendar(state.calYear, state.calMonth);
  await loadSlots(dateStr);
}

async function loadSlots(dateStr) {
  const heading = document.getElementById('slotsHeading');
  const list    = document.getElementById('slotsList');
  heading.textContent = 'Cargando horarios disponibles...';
  list.innerHTML = '';
  try {
    const res  = await fetch(`${API_BASE}/slots/${dateStr}`);
    const data = await res.json();
    const parts = dateStr.split('-');
    const d = new Date(parts[0], parts[1]-1, parts[2]);
    const label = d.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' });
    heading.textContent = `Horarios disponibles · ${label.charAt(0).toUpperCase() + label.slice(1)}`;
    data.slots.forEach(slot => {
      const item = document.createElement('div');
      item.className = 'slot-item' + (slot.disponible ? '' : ' occupied');
      item.innerHTML = `<span class="slot-time">${slot.hora}</span><span class="slot-status ${slot.disponible ? 'available' : ''}">${slot.disponible ? 'Disponible' : 'Ocupado'}</span>`;
      if (slot.disponible) item.addEventListener('click', () => selectSlot(item, slot.hora));
      list.appendChild(item);
    });
  } catch {
    heading.textContent = 'Error al cargar horarios. Intenta de nuevo.';
  }
}

function selectSlot(itemEl, hora) {
  document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('selected'));
  itemEl.classList.add('selected');
  state.selectedSlot = hora;
  document.getElementById('btn8Next').classList.remove('hidden');
}

document.getElementById('btn8Back').addEventListener('click', () => goToStep(7));
document.getElementById('btn8Next').addEventListener('click', async () => {
  if (!state.selectedDate || !state.selectedSlot)
    return showModal('Selección incompleta', 'Selecciona una fecha y un horario para continuar.');
  try {
    showLoader('Confirmando tu entrevista...');
    const res = await fetch(`${API_BASE}/confirmar`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ solicitudId: state.solicitudId, fecha: state.selectedDate, hora: state.selectedSlot }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al confirmar la cita');
    hideLoader();
    renderSuccess();
    goToStep(9);
  } catch (err) {
    hideLoader();
    showModal('Error', err.message, '❌');
  }
});

/* ══════════════════════════════════════════════
   PASO 9 — Confirmación
   ══════════════════════════════════════════════ */
function renderSuccess() {
  const fd       = state.formData;
  const parts    = state.selectedDate.split('-');
  const d        = new Date(parts[0], parts[1]-1, parts[2]);
  const fechaLbl = d.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const rows = [
    { icon:'🎓', label:'Aspirante',      value: fd.nombreAspirante },
    { icon:'📅', label:'Fecha',          value: fechaLbl.charAt(0).toUpperCase() + fechaLbl.slice(1) },
    { icon:'🕐', label:'Hora',           value: state.selectedSlot },
    { icon:'👩‍💼', label:'Entrevistadora', value: 'Coordinador/a de Admisiones' },
    { icon:'📍', label:'Lugar',          value: 'Colegio Internacional Bilingüe' },
  ];

  document.getElementById('successSummary').innerHTML = rows.map((r, i) => `
    <div class="summary-row" style="animation-delay:${0.5 + i*0.08}s">
      <span class="summary-icon">${r.icon}</span>
      <span class="summary-label">${r.label}</span>
      <span class="summary-value">${r.value}</span>
    </div>`).join('');

  document.getElementById('successEmail').textContent = fd.email;
}

/* ── Inicialización ───────────────────────────── */
buildCalendar(state.calYear, state.calMonth);
