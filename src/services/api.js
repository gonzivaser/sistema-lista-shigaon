import { MOCK_JANIJIM } from './mockData';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

function isDemo() {
  return !SCRIPT_URL;
}

export function isDemoMode() {
  return isDemo();
}

export async function fetchJanijim() {
  if (isDemo()) {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_JANIJIM;
  }

  const url = `${SCRIPT_URL}?action=getJanijim`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error al obtener janijim: ${res.status}`);
  }

  const data = await res.json();
  return data.janijim;
}

export async function cargarAsistencia({ fecha, tipoActividad, idPresentes, idTardes }) {
  if (isDemo()) {
    await new Promise(r => setTimeout(r, 600));
    console.log('[DEMO] Asistencia cargada:', { fecha, tipoActividad, idPresentes, idTardes });
    return { success: true, message: 'Asistencia cargada (modo demo)' };
  }

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'cargarAsistencia',
      fecha,
      tipoActividad,
      idPresentes,
      idTardes,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error al cargar asistencia: ${res.status}`);
  }

  return res.json();
}
