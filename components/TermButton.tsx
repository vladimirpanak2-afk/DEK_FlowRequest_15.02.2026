
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';

interface TermButtonProps {
  valueISO?: string;
  onChangeISO: (iso?: string) => void;
  isDarkMode: boolean;
  className?: string;
}

const TermButton: React.FC<TermButtonProps> = ({ valueISO, onChangeISO, isDarkMode, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const d = valueISO ? new Date(valueISO) : new Date();
      setTempDate(d.toISOString().split('T')[0]);
    }
  }, [isOpen, valueISO]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formattedLabel = useMemo(() => {
    if (!valueISO) return 'TERMÍN';
    const d = new Date(valueISO);
    return `TERMÍN: ${d.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
  }, [valueISO]);

  const handleSave = () => {
    if (!tempDate) return;
    // Vytvoříme datum z vybraného dne (čas se nastaví na půlnoc)
    const combined = new Date(tempDate);
    onChangeISO(combined.toISOString());
    setIsOpen(false);
  };

  const handleClear = () => {
    onChangeISO(undefined);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
          valueISO 
            ? 'bg-amber-600 text-white border-amber-500 shadow-lg' 
            : (isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm')
        } ${className}`}
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        <span className="truncate">{formattedLabel}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          className={`absolute z-[120] top-full mt-2 left-0 sm:left-auto sm:right-0 w-72 p-6 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border ${
            isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5" /> Výběr data
              </label>
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-800 border-white/10 text-white [color-scheme:dark] focus:border-indigo-500/50' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 h-11 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
              >
                <Check className="w-4 h-4" /> Uložit
              </button>
              <button
                onClick={handleClear}
                className={`flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                  isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:bg-red-500 hover:text-white' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-red-500 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" /> Smazat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermButton;
