import { useState, useEffect, useMemo } from 'react';
import AttendanceForm from './components/AttendanceForm';
import { fetchJanijim, cargarAsistencia, isDemoMode } from './services/api';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'color', label: 'Por Color' },
  { id: 'mejan', label: 'Por Mejan' },
];

export default function App() {
  const [tab, setTab] = useState('general');
  const [janijim, setJanijim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMejan, setSelectedMejan] = useState('');

  useEffect(() => {
    loadJanijim();
  }, []);

  async function loadJanijim() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJanijim();
      setJanijim(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const colores = useMemo(() => {
    const set = new Set(janijim.map(j => j.color).filter(Boolean));
    return [...set].sort();
  }, [janijim]);

  const mejanes = useMemo(() => {
    const set = new Set(janijim.map(j => j.mejan).filter(Boolean));
    return [...set].sort();
  }, [janijim]);

  const filteredJanijim = useMemo(() => {
    if (tab === 'color' && selectedColor) {
      return janijim.filter(j => j.color === selectedColor);
    }
    if (tab === 'mejan' && selectedMejan) {
      return janijim.filter(j => j.mejan === selectedMejan);
    }
    return janijim;
  }, [janijim, tab, selectedColor, selectedMejan]);

  async function handleSubmit(data) {
    return cargarAsistencia(data);
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-[#1a0a2e] border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex items-center">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSelectedColor('');
                  setSelectedMejan('');
                }}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-3 text-sm font-semibold transition-colors cursor-pointer text-center ${
                  tab === t.id
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-white/70 hover:text-white border-b-2 border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Demo banner */}
      {isDemoMode() && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-amber-200 text-sm">
          Modo demo — datos de prueba locales. Configurar <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs">VITE_GOOGLE_SCRIPT_URL</code> en .env para conectar con Google Sheets.
        </div>
      )}

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-[#6b0f6b] rounded-xl p-4 sm:p-6 shadow-2xl border border-purple-400/10">
          {/* Tab title */}
          <h1 className="text-2xl font-light mb-4 text-white/90">
            {tab === 'general' && 'Por Camada'}
            {tab === 'color' && 'Por Color'}
            {tab === 'mejan' && 'Por Mejan'}
          </h1>
          <hr className="border-purple-400/20 mb-6" />

          {/* Error state */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-600/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
              <p className="font-semibold mb-1">Error al cargar datos</p>
              <p>{error}</p>
              <button
                onClick={loadJanijim}
                className="mt-2 text-amber-400 hover:text-amber-300 font-medium text-sm cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 text-purple-200/70 py-8 justify-center">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Cargando janijim...</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Filters */}
              {tab === 'color' && (
                <div className="mb-6">
                  <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">
                    Color
                  </label>
                  <select
                    value={selectedColor}
                    onChange={e => setSelectedColor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                  >
                    <option value="">Elegir...</option>
                    {colores.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {tab === 'mejan' && (
                <div className="mb-6">
                  <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">
                    Mejan
                  </label>
                  <select
                    value={selectedMejan}
                    onChange={e => setSelectedMejan(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                  >
                    <option value="">Elegir...</option>
                    {mejanes.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show form only when filter is selected (or general tab) */}
              {(tab === 'general' || (tab === 'color' && selectedColor) || (tab === 'mejan' && selectedMejan)) && (
                <>
                  <AttendanceForm
                    janijim={filteredJanijim}
                    onSubmit={handleSubmit}
                    loading={loading}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
