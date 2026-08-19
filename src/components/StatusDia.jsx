import { useState, useEffect } from 'react';
import { fetchAsistenciaCargada } from '../services/api';

function getTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDayOfWeek(fechaStr) {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatFecha(fechaStr) {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS[date.getDay()]} ${d} de ${MESES[m - 1]} de ${y}`;
}

function BarraStat({ color, label, count, pct, icono }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-4 text-center text-base ${color}`}>{icono}</span>
      <span className="text-sm text-white/80 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-purple-800/60 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-white/90 font-semibold w-6 text-right shrink-0">{count}</span>
      <span className="text-xs text-white/40 w-9 text-right shrink-0">{pct}%</span>
    </div>
  );
}

export default function StatusDia({ janijim, loadingJanijim }) {
  const [fecha, setFecha] = useState(getTodayStr());
  const [tipoSabado, setTipoSabado] = useState('T');
  const [idsCargados, setIdsCargados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dayOfWeek = getDayOfWeek(fecha);
  const isWednesday = dayOfWeek === 3;
  const isSaturday = dayOfWeek === 6;
  const hasActivity = isWednesday || isSaturday;
  const tipoActividad = isWednesday ? 'M' : tipoSabado;

  useEffect(() => {
    if (!hasActivity) {
      setIdsCargados({});
      return;
    }
    loadStatus();
  }, [fecha, tipoSabado]);

  async function loadStatus() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAsistenciaCargada(fecha, tipoActividad);
      setIdsCargados(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const presentes = janijim.filter(j => idsCargados[j.id] === 'P');
  const tardes = janijim.filter(j => idsCargados[j.id] === 'T');
  const ausentes = janijim.filter(j => !idsCargados[j.id]);
  const total = janijim.length;
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

  const asistenciaCargada = presentes.length + tardes.length > 0;

  return (
    <div className="bg-[#6b0f6b] rounded-xl p-4 sm:p-6 shadow-2xl border border-purple-400/10">
      <h2 className="text-xl font-light text-white/90 mb-1">Status del Día</h2>
      <hr className="border-purple-400/20 mb-4" />

      {/* Fecha + toggle sábado */}
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-white/60">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-purple-800/60 text-white text-base outline-none border border-purple-500/30 focus:border-amber-500/60"
          />
        </div>

        {isSaturday && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-white/60">Tipo</label>
            <div className="flex rounded-lg overflow-hidden border border-purple-500/30">
              <button
                type="button"
                onClick={() => setTipoSabado('T')}
                className={`px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${tipoSabado === 'T' ? 'bg-amber-500 text-white' : 'bg-purple-800/60 text-white/60 hover:text-white'}`}
              >
                Tarde
              </button>
              <button
                type="button"
                onClick={() => setTipoSabado('N')}
                className={`px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${tipoSabado === 'N' ? 'bg-amber-500 text-white' : 'bg-purple-800/60 text-white/60 hover:text-white'}`}
              >
                Noche
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Label del día */}
      <p className="text-sm text-purple-300/60 mb-5">
        {formatFecha(fecha)}
        {isWednesday && ' · Miércoles'}
        {isSaturday && ` · ${tipoSabado === 'T' ? 'Tarde' : 'Noche'}`}
      </p>

      {/* Sin actividad */}
      {!hasActivity && (
        <div className="py-6 text-center text-purple-300/50 text-sm">
          No hay actividad programada para este día.
        </div>
      )}

      {/* Loading */}
      {hasActivity && (loading || loadingJanijim) && (
        <div className="flex items-center justify-center gap-3 text-purple-200/70 py-8">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Cargando status...</span>
        </div>
      )}

      {/* Error */}
      {hasActivity && !loading && error && (
        <div className="px-4 py-3 bg-red-600/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
          <button onClick={loadStatus} className="ml-3 text-amber-400 hover:text-amber-300 cursor-pointer font-medium">
            Reintentar
          </button>
        </div>
      )}

      {/* Stats */}
      {hasActivity && !loading && !loadingJanijim && !error && (
        <>
          {!asistenciaCargada ? (
            <div className="py-4 text-center text-purple-300/50 text-sm">
              Aún no se cargó la asistencia para este día.
            </div>
          ) : (
            <>
              <div className="text-xs uppercase tracking-wider text-white/40 mb-3">
                {total} janijim totales
              </div>
              <div className="space-y-3 mb-6">
                <BarraStat icono="✓" label="Presentes" color="text-green-400" count={presentes.length} pct={pct(presentes.length)} />
                <BarraStat icono="◑" label="Tardes" color="text-amber-400" count={tardes.length} pct={pct(tardes.length)} />
                <BarraStat icono="✗" label="Ausentes" color="text-red-400" count={ausentes.length} pct={pct(ausentes.length)} />
              </div>

              {ausentes.length === 0 ? (
                <div className="text-center text-green-400 text-sm py-2 font-medium">
                  ¡Todos presentes!
                </div>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
                    Ausentes ({ausentes.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {ausentes.map(j => (
                      <div key={j.id} className="text-sm text-white/70 px-3 py-2 bg-purple-800/30 rounded-lg border border-purple-500/10">
                        {j.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
