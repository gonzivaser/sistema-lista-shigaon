import { useState, useEffect, useMemo } from 'react';
import AttendanceForm from './components/AttendanceForm';
import StatusDia from './components/StatusDia';
import { fetchJanijim, cargarAsistencia, isDemoMode } from './services/api';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'color', label: 'Por Color' },
  { id: 'mejan', label: 'Por Mejan' },
  { id: 'dupla', label: 'Por Dupla' },
];

export default function App() {
  const [view, setView] = useState('home');
  const [tab, setTab] = useState('general');
  const [janijim, setJanijim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMejan, setSelectedMejan] = useState('');
  const [selectedMejan1, setSelectedMejan1] = useState('');
  const [selectedMejan2, setSelectedMejan2] = useState('');

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
    if (tab === 'color' && selectedColor) return janijim.filter(j => j.color === selectedColor);
    if (tab === 'mejan' && selectedMejan) return janijim.filter(j => j.mejan === selectedMejan);
    if (tab === 'dupla' && selectedMejan1 && selectedMejan2)
      return janijim.filter(j => j.mejan === selectedMejan1 || j.mejan === selectedMejan2);
    return janijim;
  }, [janijim, tab, selectedColor, selectedMejan, selectedMejan1, selectedMejan2]);

  async function handleSubmit(data) {
    return cargarAsistencia(data);
  }

  const demoBanner = isDemoMode() && (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-amber-200 text-sm">
      Modo demo — datos de prueba locales. Configurar{' '}
      <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs">VITE_GOOGLE_SCRIPT_URL</code> en .env para conectar con Google Sheets.
    </div>
  );

  /* ── HOME ── */
  if (view === 'home') {
    return (
      <div className="min-h-screen">
        <nav className="bg-[#1a0a2e] border-b border-purple-500/20 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <span className="text-white font-semibold text-base tracking-wide">SHIGAON</span>
          </div>
        </nav>

        {demoBanner}

        <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4">
          {/* Tomar Lista */}
          <div className="bg-[#6b0f6b] rounded-xl p-4 sm:p-6 shadow-2xl border border-purple-400/10">
            <h2 className="text-xl font-light text-white/90 mb-1">Lista de Asistencia</h2>
            <hr className="border-purple-400/20 mb-4" />
            <button
              onClick={() => setView('lista')}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Tomar Lista
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Status del día */}
          <StatusDia janijim={janijim} loadingJanijim={loading} />
        </main>
      </div>
    );
  }

  /* ── LISTA ── */
  return (
    <div className="min-h-screen">
      <nav className="bg-[#1a0a2e] border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex items-center">
            {/* Volver al inicio */}
            <button
              onClick={() => setView('home')}
              className="px-2 sm:px-3 py-3 text-sm text-white/50 hover:text-amber-400 transition-colors cursor-pointer border-b-2 border-transparent flex items-center gap-1 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Inicio</span>
            </button>

            <div className="w-px h-5 bg-purple-500/20 mx-1" />

            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSelectedColor('');
                  setSelectedMejan('');
                  setSelectedMejan1('');
                  setSelectedMejan2('');
                }}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center ${
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

      {demoBanner}

      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-[#6b0f6b] rounded-xl p-4 sm:p-6 shadow-2xl border border-purple-400/10 overflow-hidden">
          <h1 className="text-2xl font-light mb-4 text-white/90">
            {tab === 'general' && 'Por Camada'}
            {tab === 'color' && 'Por Color'}
            {tab === 'mejan' && 'Por Mejan'}
            {tab === 'dupla' && 'Por Dupla'}
          </h1>
          <hr className="border-purple-400/20 mb-6" />

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-600/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
              <p className="font-semibold mb-1">Error al cargar datos</p>
              <p>{error}</p>
              <button onClick={loadJanijim} className="mt-2 text-amber-400 hover:text-amber-300 font-medium text-sm cursor-pointer">
                Reintentar
              </button>
            </div>
          )}

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
              {tab === 'color' && (
                <div className="mb-6">
                  <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">Color</label>
                  <select
                    value={selectedColor}
                    onChange={e => setSelectedColor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                  >
                    <option value="">Elegir...</option>
                    {colores.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {tab === 'mejan' && (
                <div className="mb-6">
                  <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">Mejan</label>
                  <select
                    value={selectedMejan}
                    onChange={e => setSelectedMejan(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                  >
                    <option value="">Elegir...</option>
                    {mejanes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}

              {tab === 'dupla' && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">Mejan 1</label>
                    <select
                      value={selectedMejan1}
                      onChange={e => setSelectedMejan1(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                    >
                      <option value="">Elegir...</option>
                      {mejanes.filter(m => m !== selectedMejan2).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">Mejan 2</label>
                    <select
                      value={selectedMejan2}
                      onChange={e => setSelectedMejan2(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                    >
                      <option value="">Elegir...</option>
                      {mejanes.filter(m => m !== selectedMejan1).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {(tab === 'general' ||
                (tab === 'color' && selectedColor) ||
                (tab === 'mejan' && selectedMejan) ||
                (tab === 'dupla' && selectedMejan1 && selectedMejan2)) && (
                <AttendanceForm janijim={filteredJanijim} onSubmit={handleSubmit} loading={loading} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
