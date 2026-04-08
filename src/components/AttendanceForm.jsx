import { useState, useEffect } from 'react';
import MultiSelect from './MultiSelect';
import { fetchAsistenciaCargada } from '../services/api';

const ACTIVITY_TYPES = [
  { value: 'T', label: 'Tarde' },
  { value: 'N', label: 'Noche' },
  { value: 'M', label: 'Miércoles' },
];

export default function AttendanceForm({ janijim, onSubmit, loading }) {
  const [fecha, setFecha] = useState('');
  const [tipoActividad, setTipoActividad] = useState('');
  const [presentes, setPresentes] = useState([]);
  const [tardes, setTardes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [idsCargados, setIdsCargados] = useState([]);
  const [loadingCargados, setLoadingCargados] = useState(false);

  useEffect(() => {
    if (fecha && tipoActividad) {
      setLoadingCargados(true);
      fetchAsistenciaCargada(fecha, tipoActividad)
        .then(ids => setIdsCargados(ids))
        .catch(() => setIdsCargados([]))
        .finally(() => setLoadingCargados(false));
    } else {
      setIdsCargados([]);
    }
  }, [fecha, tipoActividad]);

  const disabledIds = new Set(idsCargados);

  const options = janijim
    .map(j => ({ id: j.id, label: j.nombre }))
    .sort((a, b) => a.label.localeCompare(b.label));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!fecha) {
      setMessage({ type: 'error', text: 'Seleccioná una fecha' });
      return;
    }
    if (!tipoActividad) {
      setMessage({ type: 'error', text: 'Seleccioná un tipo de actividad' });
      return;
    }
    if (presentes.length === 0) {
      setMessage({ type: 'error', text: 'Seleccioná al menos un janij presente' });
      return;
    }

    setSubmitting(true);
    try {
      const idPresentes = presentes.join(',');
      const idTardes = tardes.join(',');
      await onSubmit({ fecha, tipoActividad, idPresentes, idTardes });
      setMessage({ type: 'success', text: `Asistencia cargada: ${presentes.length} presentes, ${tardes.length} tardes` });
      setPresentes([]);
      setTardes([]);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">
          Fecha
        </label>
        <div className="relative">
          {!fecha && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-semibold pointer-events-none">
              Elegir fecha...
            </span>
          )}
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className={`w-full box-border px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 [&::-webkit-calendar-picker-indicator]:invert ${!fecha ? '[color-scheme:dark] [&::-webkit-datetime-edit]:opacity-0' : ''}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">
          Tipo de Actividad
        </label>
        <select
          value={tipoActividad}
          onChange={e => setTipoActividad(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
        >
          <option value="">Elegir...</option>
          {ACTIVITY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <MultiSelect
        label="Presentes"
        options={options}
        selected={presentes}
        onChange={setPresentes}
        placeholder="Elegir presentes..."
        disabledIds={disabledIds}
        loadingDisabled={loadingCargados}
      />

      <MultiSelect
        label="Tardes (opcional)"
        options={options}
        selected={tardes}
        onChange={setTardes}
        placeholder="Elegir tardes..."
        disabledIds={disabledIds}
        loadingDisabled={loadingCargados}
      />

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-600/30 border border-green-500/50 text-green-200'
            : 'bg-red-600/30 border border-red-500/50 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || loading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-white/90 hover:bg-white text-purple-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        {submitting ? 'Cargando...' : 'Cargar Asistencia'}
      </button>
    </form>
  );
}
