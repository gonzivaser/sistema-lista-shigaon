import { useState } from 'react';

export default function MultiSelect({ label, options, selected, onChange, placeholder = 'Elegir...', disabledMap = {}, loadingDisabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function selectAll() {
    const allIds = filtered.filter(o => !disabledMap[o.id]).map(o => o.id);
    const merged = [...new Set([...selected, ...allIds])];
    onChange(merged);
  }

  function deselectAll() {
    const filteredIds = new Set(filtered.map(o => o.id));
    onChange(selected.filter(s => !filteredIds.has(s)));
  }

  const selectedCount = selected.length;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 text-white/90">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer transition-colors flex items-center justify-between"
      >
        <span>{selectedCount > 0 ? `${selectedCount} seleccionados` : placeholder}</span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="bg-purple-900 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20">
              <span className="text-white font-semibold text-sm uppercase tracking-wider">{label}</span>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-3 py-2 flex gap-2 border-b border-purple-500/20">
              <button type="button" onClick={selectAll} className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-medium">
                Seleccionar todos
              </button>
              <span className="text-purple-500">|</span>
              <button type="button" onClick={deselectAll} className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-medium">
                Deseleccionar todos
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-purple-300/60 text-sm">Sin resultados</div>
              ) : (
                filtered.map(opt => {
                  const tipoAsistencia = disabledMap[opt.id];
                  const isDisabled = !!tipoAsistencia;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 px-4 py-3 sm:py-2 transition-colors ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : selected.includes(opt.id)
                            ? 'bg-purple-700/60 cursor-pointer'
                            : 'hover:bg-purple-800/40 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(opt.id)}
                        disabled={isDisabled}
                        onChange={() => !isDisabled && toggle(opt.id)}
                        className="w-5 h-5 sm:w-4 sm:h-4 rounded accent-amber-500 flex-shrink-0 disabled:cursor-not-allowed cursor-pointer"
                      />
                      <span className="text-sm text-white/90 flex-1">
                        {opt.label}
                        {isDisabled && <span className="ml-2 text-xs text-purple-300/60">ya cargado</span>}
                      </span>
                      {isDisabled && (
                        <span className={`text-xs font-bold flex-shrink-0 ${tipoAsistencia === 'P' ? 'text-green-400' : 'text-amber-400'}`}>
                          {tipoAsistencia}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
