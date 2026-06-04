/**
 * Script temporal para obtener el refresh token de OneDrive (Microsoft Graph).
 * Ejecutar con: node get-onedrive-token.js
 * Luego copiar el ONEDRIVE_REFRESH_TOKEN al archivo .env
 */

const http  = require('http');
const https = require('https');
const url   = require('url');

const CLIENT_ID     = process.env.AZURE_CLIENT_ID     || '';
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET || '';
const TENANT_ID     = process.env.AZURE_TENANT_ID     || '';
const REDIRECT_URI  = 'http://localhost:3000/oauth/callback';
const SCOPES        = 'https://graph.microsoft.com/Files.ReadWrite offline_access';

const authUrl =
  `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&response_mode=query` +
  `&prompt=select_account`;

function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }).toString();

    const options = {
      hostname: 'login.microsoftonline.com',
      path:     `/${TENANT_ID}/oauth2/v2.0/token`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname !== '/oauth/callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code  = parsed.query.code;
  const error = parsed.query.error;

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h2>Error: ${error}</h2><p>${parsed.query.error_description}</p>`);
    server.close();
    return;
  }

  if (!code) {
    res.writeHead(400);
    res.end('No code received');
    server.close();
    return;
  }

  try {
    const tokens = await exchangeCode(code);

    if (tokens.error) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>Error al canjear token</h2><pre>${JSON.stringify(tokens, null, 2)}</pre>`);
      server.close();
      return;
    }

    // Guardar token en archivo para evitar errores al copiar
    require('fs').writeFileSync(
      require('path').join(__dirname, 'onedrive_token.txt'),
      tokens.refresh_token,
      'utf8'
    );

    console.log('\n========================================');
    console.log('REFRESH TOKEN GUARDADO EN: backend/onedrive_token.txt');
    console.log('========================================');
    console.log('\nAhora ejecuta este comando para subirlo a Railway:');
    console.log(`\nrailway variables set ONEDRIVE_REFRESH_TOKEN="$(cat onedrive_token.txt)"\n`);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html><body style="font-family:sans-serif;padding:40px;background:#0C1C3C;color:white;">
        <h2 style="color:#4ade80">Token obtenido correctamente</h2>
        <p>Revisa la consola donde corriste el script para ver el refresh token.</p>
        <p>Puedes cerrar esta ventana.</p>
      </body></html>
    `);
  } catch (err) {
    res.writeHead(500);
    res.end('Error: ' + err.message);
  }

  server.close();
});

server.listen(3000, () => {
  console.log('\n========================================');
  console.log('Servidor esperando callback en puerto 3000');
  console.log('\nAbre este enlace en el navegador e inicia sesion con admin@colegio.edu.co:');
  console.log('\n' + authUrl);
  console.log('\n(Tambien puedes copiar y pegar la URL en el navegador)');
  console.log('========================================\n');
});
