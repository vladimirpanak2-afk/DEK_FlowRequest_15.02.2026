
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
          className={`absolute z-[120] top-full mt-2 left-0 sm:left-auto sm:right-0 w-64 p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border ${
            isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" /> Datum
              </label>
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none ${
                  isDarkMode ? 'bg-slate-800 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 h-9 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
              >
                <Check className="w-3 h-3" /> Uložit
              </button>
              <button
                onClick={handleClear}
                className={`flex-1 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${
                  isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                }`}
              >
                <X className="w-3 h-3" /> Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermButton;
