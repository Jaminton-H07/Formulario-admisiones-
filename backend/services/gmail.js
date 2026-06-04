const { google } = require('googleapis');

const MESES_ES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
];
const DIAS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function fechaLegible(fechaStr) {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DIAS_ES[dt.getDay()]} ${d} de ${MESES_ES[m-1]} de ${y}`;
}

function getOAuthClient() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return oAuth2Client;
}

function buildMimeMessage({ from, to, subject, html }) {
  const boundary = 'boundary_lfm_' + Date.now();
  const mime = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(html, 'utf8').toString('base64'),
    `--${boundary}--`,
  ].join('\r\n');

  return Buffer.from(mime).toString('base64url');
}

exports.enviarConfirmacion = async (solicitud) => {
  const auth   = getOAuthClient();
  const gmail  = google.gmail({ version: 'v1', auth });
  const fecha  = fechaLegible(solicitud.fecha);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Confirmación de entrevista</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.1);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(140deg,#1A2F5E 0%,#0C1C3C 55%,#1E6DB4 100%);padding:36px 40px;text-align:center;">
            <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px;">Colegio Internacional Bilingüe</h1>
            <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">Proceso de Admisiones 2025–2026</p>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="color:#0C1C3C;font-size:20px;margin:0 0 10px;">¡Entrevista confirmada!</h2>
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
              Estimado/a <strong>${solicitud.padre1}</strong>,<br>
              nos complace confirmar que la entrevista de admisión para <strong>${solicitud.nombreAspirante}</strong>
              ha sido agendada exitosamente. A continuación encontrará los detalles:
            </p>

            <!-- Detalles -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8f9ff;border-radius:12px;border:1px solid #e8ecf6;overflow:hidden;margin-bottom:28px;">
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;width:38%;">Aspirante</td>
                <td style="padding:14px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">${solicitud.nombreAspirante}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Grado</td>
                <td style="padding:14px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">${solicitud.grado}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Fecha</td>
                <td style="padding:14px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">${fecha}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Hora</td>
                <td style="padding:14px 20px;color:#1E6DB4;font-size:14px;font-weight:700;">${solicitud.hora}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Entrevistadora</td>
                <td style="padding:14px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">Coordinador/a de Admisiones</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Lugar</td>
                <td style="padding:14px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">Colegio Internacional Bilingüe</td>
              </tr>
            </table>

            <!-- Nota -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fffbeb;border-radius:10px;border:1px solid #fde68a;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 18px;color:#92400e;font-size:14px;">
                  📌 <strong>Importante:</strong> Por favor llegue <strong>10 minutos antes</strong> de su cita.
                </td>
              </tr>
            </table>

            <p style="color:#555;font-size:14px;line-height:1.6;margin:0;">
              Si necesita reprogramar o tiene alguna pregunta, contáctenos. Estamos disponibles para acompañarle en este proceso.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0C1C3C;padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 8px;">Colegio Internacional Bilingüe</p>
            <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0 0 4px;">
              <a href="mailto:admissions@colegio.edu.co" style="color:#1E6DB4;text-decoration:none;">admissions@colegio.edu.co</a>
              &nbsp;·&nbsp; 305 401 8421
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:8px 0 0;">
              <a href="https://colegio.edu.co" style="color:rgba(255,255,255,0.5);text-decoration:none;">colegio.edu.co</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const subjectEncoded = `=?UTF-8?B?${Buffer.from(`Confirmación de entrevista — ${solicitud.nombreAspirante}`, 'utf8').toString('base64')}?=`;
  const fromEncoded = `=?UTF-8?B?${Buffer.from('Admisiones Colegio Internacional Bilingüe', 'utf8').toString('base64')}?= <${process.env.GMAIL_USER}>`;

  const raw = buildMimeMessage({
    from:    fromEncoded,
    to:      solicitud.email,
    subject: subjectEncoded,
    html,
  });

  await gmail.users.messages.send({
    userId:      'me',
    requestBody: { raw },
  });

  console.log(`[GMAIL] Correo enviado a ${solicitud.email}`);
};

exports.enviarNotificacionAdmin = async (solicitud) => {
  const auth  = getOAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });
  const fecha = fechaLegible(solicitud.fecha);
  const admin = process.env.GMAIL_USER;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.1);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(140deg,#1A2F5E 0%,#0C1C3C 55%,#1E6DB4 100%);padding:28px 40px;text-align:center;">
            <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 4px;">Nueva entrevista agendada</h1>
            <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">Proceso de Admisiones 2025–2026</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
              Se ha confirmado una nueva entrevista de admisión:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8f9ff;border-radius:12px;border:1px solid #e8ecf6;overflow:hidden;margin-bottom:24px;">
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:13px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;width:38%;">Aspirante</td>
                <td style="padding:13px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">${solicitud.nombreAspirante}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:13px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Grado</td>
                <td style="padding:13px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">${solicitud.grado}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:13px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Fecha</td>
                <td style="padding:13px 20px;color:#0C1C3C;font-size:14px;font-weight:600;">${fecha}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:13px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Hora</td>
                <td style="padding:13px 20px;color:#1E6DB4;font-size:14px;font-weight:700;">${solicitud.hora}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8ecf6;">
                <td style="padding:13px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Padre/Madre</td>
                <td style="padding:13px 20px;color:#0C1C3C;font-size:14px;">${solicitud.padre1}${solicitud.padre2 ? ' / ' + solicitud.padre2 : ''}</td>
              </tr>
              <tr>
                <td style="padding:13px 20px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Contacto</td>
                <td style="padding:13px 20px;color:#0C1C3C;font-size:14px;">${solicitud.email} · ${solicitud.telefono}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#0C1C3C;padding:20px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">Sistema de Admisiones — Colegio Internacional Bilingüe</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const subjectEncoded = `=?UTF-8?B?${Buffer.from(`Nueva entrevista — ${solicitud.nombreAspirante} — ${fecha}`, 'utf8').toString('base64')}?=`;
  const fromEncoded = `=?UTF-8?B?${Buffer.from('Admisiones Colegio Internacional Bilingüe', 'utf8').toString('base64')}?= <${admin}>`;

  const raw = buildMimeMessage({
    from:    fromEncoded,
    to:      admin,
    subject: subjectEncoded,
    html,
  });

  await gmail.users.messages.send({
    userId:      'me',
    requestBody: { raw },
  });

  console.log(`[GMAIL] Notificación admin enviada a ${admin}`);
};
