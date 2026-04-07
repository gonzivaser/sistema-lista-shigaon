# Sistema Lista Shigaon - Camada 18

Web app para tomar asistencia de janijim, conectada a Google Sheets.

## Setup

### 1. Google Apps Script (Backend)

1. Abrir el Google Sheet del CRM en Google Drive
2. Ir a **Extensiones > Apps Script**
3. Pegar el contenido de `google-apps-script/Code.gs`
4. Ir a **Deploy > New deployment**
   - Tipo: **Web app**
   - Ejecutar como: **Tu cuenta**
   - Acceso: **Cualquiera**
5. Click en **Deploy** y copiar la URL generada

### 2. GitHub (Deploy)

1. En el repo de GitHub, ir a **Settings > Secrets and variables > Actions**
2. Crear un secret llamado `GOOGLE_SCRIPT_URL` con la URL del paso anterior
3. Ir a **Settings > Pages** y seleccionar **Source: GitHub Actions**
4. Hacer push a `main` — el deploy se ejecuta automáticamente

### 3. Desarrollo local

```bash
# Instalar dependencias
npm install

# Crear archivo .env con la URL del script
cp .env.example .env
# Editar .env con tu URL real

# Iniciar servidor de desarrollo
npm run dev
```

## Estructura

```
├── google-apps-script/
│   └── Code.gs              # Backend (Google Apps Script)
├── src/
│   ├── components/
│   │   ├── AttendanceForm.jsx  # Formulario de asistencia
│   │   └── MultiSelect.jsx    # Selector múltiple con búsqueda
│   ├── services/
│   │   └── api.js            # Llamadas a la API
│   ├── App.jsx               # App principal con tabs
│   ├── index.css             # Estilos globales + Tailwind
│   └── main.jsx              # Entry point
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions para deploy
└── index.html
```
