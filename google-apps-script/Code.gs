// ============================================================
// Google Apps Script - Backend para Sistema Lista Shigaon
// ============================================================
// 
// INSTRUCCIONES DE SETUP:
// 1. Abrir Google Sheets con el CRM
// 2. Extensiones > Apps Script
// 3. Pegar este código en Code.gs
// 4. Deploy > New deployment > Web app
//    - Ejecutar como: Tu cuenta
//    - Acceso: Cualquiera
// 5. Copiar la URL del deployment
// ============================================================

const SHEET_LISTADO = 'Listado';
const SHEET_ASISTENCIA = 'AsistenciaJetAdmin';

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getJanijim') {
      return jsonResponse(getJanijim());
    }

    return jsonResponse({ error: 'Acción no válida' }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'cargarAsistencia') {
      const result = cargarAsistencia(data.fecha, data.tipoActividad, data.idPresentes, data.idTardes);
      return jsonResponse(result);
    }

    return jsonResponse({ error: 'Acción no válida' }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function getJanijim() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(SHEET_LISTADO);
  const data = ws.getDataRange().getValues();
  const headers = data[0];

  const janijim = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] && !row[1]) continue;

    janijim.push({
      id: row[0],
      nombre: row[1],
      numSocio: row[2],
      fechaNacimiento: row[3] ? row[3].toString() : '',
      dni: row[4],
      mailJanij: row[5],
      telefonoJanij: row[6],
      adulto1: row[7],
      mailAdulto1: row[8],
      telAdulto1: row[9],
      adulto2: row[10],
      mailAdulto2: row[11],
      telAdulto2: row[12],
      colegio: row[13],
      hermanosJuventud: row[14],
      actividadesCISSAB: row[15],
      jashiNeda: row[16],
      alimentacion: row[17],
      color: row[18],
      mejan: row[19],
    });
  }

  return { janijim: janijim };
}

function cargarAsistencia(fecha, tipoActividad, idPresentes, idTardes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(SHEET_ASISTENCIA);

  const nuevaFila = [
    new Date(fecha),
    tipoActividad,
    idPresentes || '',
    idTardes || '',
  ];

  ws.appendRow(nuevaFila);

  return { success: true, message: 'Asistencia cargada correctamente' };
}

function jsonResponse(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
