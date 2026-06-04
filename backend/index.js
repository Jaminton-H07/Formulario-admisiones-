require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');

const admisionesRoutes  = require('./routes/admisiones');
const documentosRoutes  = require('./routes/documentos');
const slotsRoutes       = require('./routes/slots');
const confirmarRoutes   = require('./routes/confirmar');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Directorio de uploads temporal ────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Middlewares ────────────────────────────────
const IS_DEV = process.env.NODE_ENV !== 'production';
app.use(cors({
  origin: IS_DEV
    ? true   // permite cualquier origen en desarrollo (file://, localhost, etc.)
    : [process.env.FRONTEND_URL],
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

// ── Rutas ──────────────────────────────────────
app.use('/api/admisiones',  admisionesRoutes);
app.use('/api/documentos',  documentosRoutes);
app.use('/api/slots',       slotsRoutes);
app.use('/api/confirmar',   confirmarRoutes);

// ── Servir frontend estático ───────────────────
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'frontend', 'index.html')));

// ── Health check ───────────────────────────────
app.get('/health', (_req, res) => res.json({ estado: 'ok', fecha: new Date() }));

// ── Diagnóstico OneDrive (temporal) ────────────
app.get('/test-onedrive', async (_req, res) => {
  const https = require('https');
  const CLIENT_ID     = process.env.AZURE_CLIENT_ID;
  const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
  const TENANT_ID     = process.env.AZURE_TENANT_ID;
  const REFRESH_TOKEN = process.env.ONEDRIVE_REFRESH_TOKEN;

  const info = {
    CLIENT_ID:          CLIENT_ID ? CLIENT_ID.slice(0, 8) + '...' : 'NO DEFINIDO',
    CLIENT_SECRET:      CLIENT_SECRET ? CLIENT_SECRET.slice(0, 6) + '...' : 'NO DEFINIDO',
    TENANT_ID:          TENANT_ID ? TENANT_ID.slice(0, 8) + '...' : 'NO DEFINIDO',
    REFRESH_TOKEN_LEN:  REFRESH_TOKEN ? REFRESH_TOKEN.length : 0,
    REFRESH_TOKEN_INI:  REFRESH_TOKEN ? REFRESH_TOKEN.slice(0, 20) + '...' : 'NO DEFINIDO',
  };

  if (!REFRESH_TOKEN) return res.json({ error: 'ONEDRIVE_REFRESH_TOKEN no definido', info });

  const body = new URLSearchParams({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type:    'refresh_token',
    scope:         'https://graph.microsoft.com/Files.ReadWrite',
  }).toString();

  const options = {
    hostname: 'login.microsoftonline.com',
    path:     `/${TENANT_ID}/oauth2/v2.0/token`,
    method:   'POST',
    headers:  { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  };

  const result = await new Promise((resolve) => {
    const req = https.request(options, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(body);
    req.end();
  });

  res.json({ info, result });
});

// ── Manejo de errores ──────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ mensaje: err.message || 'Error interno del servidor' });
});

// ── Conexión a MongoDB y arranque ──────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[DB] Conectado a MongoDB');
    app.listen(PORT, () => console.log(`[SERVER] Escuchando en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('[DB] Error de conexión:', err.message);
    process.exit(1);
  });
