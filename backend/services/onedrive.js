const https = require('https');
const fs    = require('fs');
const path  = require('path');

const CLIENT_ID     = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const TENANT_ID     = process.env.AZURE_TENANT_ID;

let cachedAccessToken  = null;
let tokenExpiresAt     = 0;

function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return Promise.resolve(cachedAccessToken);
  }

  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: process.env.ONEDRIVE_REFRESH_TOKEN,
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Files.ReadWrite offline_access',
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
        const json = JSON.parse(data);
        if (json.error) return reject(new Error(`${json.error}: ${json.error_description}`));
        cachedAccessToken = json.access_token;
        tokenExpiresAt    = Date.now() + json.expires_in * 1000;
        resolve(cachedAccessToken);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function graphRequest(method, apiPath, body, token, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    };
    if (body && !Buffer.isBuffer(body)) {
      headers['Content-Type']   = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    } else if (Buffer.isBuffer(body)) {
      headers['Content-Length'] = body.length;
    }

    const options = {
      hostname: 'graph.microsoft.com',
      path:     `/v1.0${apiPath}`,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 204) return resolve({});
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);

    if (body) {
      req.write(Buffer.isBuffer(body) ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function obtenerOCrearCarpeta(nombreFamilia) {
  const token      = await getAccessToken();
  const rootFolder = process.env.ONEDRIVE_FOLDER || 'Admisiones 2025-2026';

  // Intentar obtener la carpeta de la familia
  const check = await graphRequest(
    'GET',
    `/me/drive/root:/${encodeURIComponent(rootFolder)}/${encodeURIComponent(nombreFamilia)}`,
    null,
    token
  );

  if (check.id) return check.id;

  // Obtener o crear la carpeta raíz
  let rootItem = await graphRequest(
    'GET',
    `/me/drive/root:/${encodeURIComponent(rootFolder)}`,
    null,
    token
  );

  if (!rootItem.id) {
    // Crear carpeta raíz si no existe
    rootItem = await graphRequest(
      'POST',
      '/me/drive/root/children',
      { name: rootFolder, folder: {}, '@microsoft.graph.conflictBehavior': 'rename' },
      token
    );
  }

  // Crear carpeta de la familia
  const nueva = await graphRequest(
    'POST',
    `/me/drive/items/${rootItem.id}/children`,
    { name: nombreFamilia, folder: {}, '@microsoft.graph.conflictBehavior': 'rename' },
    token
  );

  if (!nueva.id) {
    throw new Error(`No se pudo crear la carpeta: ${JSON.stringify(nueva)}`);
  }

  return nueva.id;
}

exports.subirBuffer = async (buffer, nombreArchivo, nombreFamilia, carpetaIdExistente) => {
  const token    = await getAccessToken();
  let carpetaId  = carpetaIdExistente;
  if (!carpetaId) carpetaId = await obtenerOCrearCarpeta(nombreFamilia);

  const uploaded = await graphRequest(
    'PUT',
    `/me/drive/items/${carpetaId}:/${encodeURIComponent(nombreArchivo)}:/content`,
    buffer,
    token,
    { 'Content-Type': 'application/pdf' }
  );

  if (!uploaded.id && !uploaded.webUrl) {
    throw new Error(`Error al subir PDF: ${JSON.stringify(uploaded)}`);
  }
  console.log(`[ONEDRIVE] PDF subido: ${nombreArchivo}`);
  return { carpetaId, itemPath: uploaded.webUrl || uploaded.id };
};

exports.subirArchivo = async (file, nombreFamilia, carpetaIdExistente) => {
  const token     = await getAccessToken();
  let carpetaId   = carpetaIdExistente;

  if (!carpetaId) {
    carpetaId = await obtenerOCrearCarpeta(nombreFamilia);
  }

  const nombreArchivo = path.basename(file.originalname);
  const contenido     = fs.readFileSync(file.path);

  // PUT para archivos <= 4 MB
  const uploaded = await graphRequest(
    'PUT',
    `/me/drive/items/${carpetaId}:/${encodeURIComponent(nombreArchivo)}:/content`,
    contenido,
    token,
    { 'Content-Type': 'application/octet-stream' }
  );

  if (!uploaded.id && !uploaded.webUrl) {
    throw new Error(`Error al subir archivo: ${JSON.stringify(uploaded)}`);
  }

  return {
    carpetaId,
    itemPath: uploaded.webUrl || uploaded.id,
  };
};
