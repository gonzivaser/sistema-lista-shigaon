import { useState, useRef, useEffect } from 'react';

export default function MultiSelect({ label, options, selected, onChange, placeholder = 'Elegir...', disabledIds = new Set(), loadingDisabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const allIds = filtered.filter(o => !disabledIds.has(o.id)).map(o => o.id);
    const merged = [...new Set([...selected, ...allIds])];
    onChange(merged);
  }

  function deselectAll() {
    const filteredIds = new Set(filtered.map(o => o.id));
    onChange(selected.filter(s => !filteredIds.has(s)));
  }

  const selectedCount = selected.length;

  return (
    <div className="mb-4" ref={containerRef}>
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
        <div className="mt-1 bg-purple-900/95 border border-purple-500/30 rounded-lg shadow-2xl overflow-hidden z-50 relative">
          <div className="px-2 py-1.5 flex gap-2 border-b border-purple-500/20">
            <button type="button" onClick={selectAll} className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-medium">
              Seleccionar todos
            </button>
            <span className="text-purple-500">|</span>
            <button type="button" onClick={deselectAll} className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-medium">
              Deseleccionar todos
            </button>
          </div>
          <div className="max-h-72 sm:max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-purple-300/60 text-sm">Sin resultados</div>
            ) : (
              filtered.map(opt => {
                const isDisabled = disabledIds.has(opt.id);
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
                    <span className="text-sm text-white/90">
                      {opt.label}
                      {isDisabled && <span className="ml-2 text-xs text-purple-300/60">ya cargado</span>}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
