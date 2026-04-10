const SHEET_LISTADO = 'Listado';
const SHEET_ASISTENCIA = 'AsistenciaJetAdmin';
const SHEET_CONCATENADA = 'AsistenciaJetAdminConcatenada';

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getJanijim') {
      return jsonResponse(getJanijim());
    }

    if (action === 'getAsistenciaCargada') {
      const fecha = e.parameter.fecha;
      const tipo = e.parameter.tipo;
      return jsonResponse(getAsistenciaCargada(fecha, tipo));
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
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getSheetByName(SHEET_ASISTENCIA);

    const parts = fecha.split('-');
    const fechaFormateada = parseInt(parts[1]) + '/' + parseInt(parts[2]) + '/' + parts[0].slice(-2);

    var lastRow = ws.getLastRow() + 1;
    ws.getRange(lastRow, 1).setValue(fechaFormateada);
    ws.getRange(lastRow, 2).setValue(tipoActividad);
    ws.getRange(lastRow, 3).setNumberFormat('@').setValue(idPresentes || '');
    ws.getRange(lastRow, 4).setNumberFormat('@').setValue(idTardes || '');
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return { success: true, message: 'Asistencia cargada correctamente' };
}

function parseFechaCelda(cell) {
  if (!cell) return null;
  var d = null;
  if (typeof cell.getMonth === 'function') {
    d = cell;
  } else {
    d = new Date(String(cell));
  }
  if (d && !isNaN(d.getTime())) {
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
  }
  var str = String(cell).trim();
  var parts = str.split('/');
  if (parts.length === 3) {
    var mm = parseInt(parts[0]);
    var dd = parseInt(parts[1]);
    var yy = parseInt(parts[2]);
    if (yy < 100) yy += 2000;
    return { y: yy, m: mm, d: dd };
  }
  return null;
}

function getAsistenciaCargada(fecha, tipoActividad) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(SHEET_ASISTENCIA);
  const data = ws.getDataRange().getValues();

  const parts = fecha.split('-');
  const targetY = parseInt(parts[0]);
  const targetM = parseInt(parts[1]);
  const targetD = parseInt(parts[2]);

  var seen = {};

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var fechaParsed = parseFechaCelda(row[0]);
    if (!fechaParsed) continue;

    if (fechaParsed.y === targetY && fechaParsed.m === targetM && fechaParsed.d === targetD && String(row[1]).trim() === tipoActividad) {
      var presentes = String(row[2] || '').split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
      var tardes = String(row[3] || '').split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
      for (var j = 0; j < presentes.length; j++) {
        var idP = parseInt(presentes[j]);
        if (!isNaN(idP)) seen[idP] = 'P';
      }
      for (var k = 0; k < tardes.length; k++) {
        var idT = parseInt(tardes[k]);
        if (!isNaN(idT)) seen[idT] = 'T';
      }
    }
  }

  return { idsCargados: seen };
}

function jsonResponse(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
