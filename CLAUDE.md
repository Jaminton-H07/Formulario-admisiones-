# Formulario de Admisiones — Colegio Internacional Bilingüe

## Descripción del proyecto
Sistema web de admisiones escolar con formulario de 9 pasos (basado en el formulario F-AR-02 del Lycée Français de Medellín). Incluye modo demo funcional sin backend y un backend completo en Node.js para uso en producción.

---

## Estructura del repositorio

```
admisiones-demo/
├── docs/                        # Frontend estático (GitHub Pages)
│   ├── index.html
│   ├── script.js                # Lógica del formulario + modo demo
│   └── style.css
├── backend/                     # API Node.js (Railway)
│   ├── index.js                 # Servidor Express + MongoDB
│   ├── frontend/                # Frontend servido por Express (producción)
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── controllers/
│   │   ├── admisionesController.js
│   │   ├── documentosController.js
│   │   ├── slotsController.js
│   │   └── confirmarController.js
│   ├── routes/
│   │   ├── admisiones.js        # POST /api/admisiones
│   │   ├── documentos.js        # POST /api/documentos
│   │   ├── slots.js             # GET  /api/slots/:fecha
│   │   └── confirmar.js         # POST /api/confirmar
│   ├── models/
│   │   ├── Solicitud.js
│   │   └── Slot.js
│   ├── services/
│   │   ├── onedrive.js          # Subida de documentos a OneDrive
│   │   ├── gmail.js             # Envío de correos
│   │   ├── calendar.js          # Google Calendar
│   │   └── generarFormularioPDF.js
│   ├── get-onedrive-token.js    # Script utilitario OAuth (usar una sola vez)
│   ├── .env                     # Credenciales reales (NO se sube a git)
│   ├── .env.example             # Plantilla de variables de entorno
│   └── package.json
├── railway.json                 # Configuración de despliegue en Railway
└── CLAUDE.md                    # Este archivo
```

---

## Pasos del formulario

| Paso | Descripción |
|------|-------------|
| 1 | Información personal del aspirante |
| 2 | Educación anterior |
| 3 | Acudiente 1 (datos completos) |
| 4 | Acudiente 2 |
| 5 | Hermanos y autorizaciones |
| 6 | Carga de documentos (dinámicos según nacionalidad y situación laboral) |
| 7 | Revisión y envío al backend |
| 8 | Calendario para agendar entrevista |
| 9 | Confirmación final |

---

## Modo Demo

En `docs/script.js` (línea ~9):

```js
const DEMO_MODE = true;
```

Cuando está en `true`, intercepta todas las llamadas a la API con respuestas simuladas:
- `POST /api/admisiones` → devuelve `solicitudId: 'DEMO-<timestamp>'`
- `POST /api/documentos` → simula subida exitosa
- `GET /api/slots/:fecha` → devuelve 12 horarios (algunos ocupados)
- `POST /api/confirmar` → confirma la cita sin backend

Para conectar el backend real cambiar a `DEMO_MODE = false`.

---

## Detección de entorno

```js
const IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const API_BASE  = IS_LOCAL ? 'http://localhost:3000/api' : '/api';
```

- **Local** (incluyendo `file://`): apunta a `http://localhost:3000/api`
- **Producción** (GitHub Pages / Railway): usa URL relativa `/api`

---

## Despliegue actual

| Componente | Plataforma | URL |
|------------|------------|-----|
| Frontend (demo) | GitHub Pages | `https://jaminton-h07.github.io/Formulario-admisiones-/` |
| Backend (API) | Railway | Configurado via `railway.json` |
| Base de datos | MongoDB Atlas | URI en variable de entorno `MONGODB_URI` |

---

## Variables de entorno (backend/.env)

```env
PORT=3000
MONGODB_URI=mongodb+srv://...

# Microsoft Graph API (OneDrive)
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=
ONEDRIVE_FOLDER=Admisiones 2025-2026

# Gmail API (OAuth2)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_USER=

# Google Calendar API (OAuth2)
GCAL_CLIENT_ID=
GCAL_CLIENT_SECRET=
GCAL_REFRESH_TOKEN=
GCAL_CALENDAR_ID=

# CORS
FRONTEND_URL=https://jaminton-h07.github.io
```

---

## Cómo probar localmente

```powershell
cd backend
npm install
npm run dev
# Abrir http://localhost:3000
```

El backend sirve `backend/frontend/` como frontend. No abrir `docs/index.html` directamente si se quiere probar con el backend real (usar `http://localhost:3000`).

---

## Seguridad

- El archivo `.env` está en `.gitignore` — nunca se sube a git
- `get-onedrive-token.js` usa `process.env` (las credenciales se leen del `.env`, no están hardcodeadas)
- El repositorio es **público** en GitHub — no subir credenciales reales en ningún archivo de código

---

## Historial de cambios relevantes

- Se limpió el historial de git para eliminar credenciales de Azure que estaban hardcodeadas en `get-onedrive-token.js`
- Se renombró `frontend/` a `docs/` para compatibilidad con GitHub Pages
- Se agregó modo demo para funcionar sin backend
