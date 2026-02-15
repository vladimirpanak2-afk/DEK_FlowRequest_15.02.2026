
import React from 'react';
import { X, BrainCircuit, Mail, Target, BookOpen, Sparkles, Layers, FileSearch, MessageSquareText, Zap, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
  isDarkMode: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose, isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-[3rem] border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
        
        {/* Header */}
        <div className={`px-8 h-20 lg:h-24 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl text-white shadow-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Centrum nápovědy</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Jak efektivně využívat DEK Snap</p>
            </div>
          </div>
          <button onClick={onClose} className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
            <X className={`w-8 h-8 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* COLUMN 1: WORKFLOW */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Režim Snap Workflow</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-5 group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <BrainCircuit className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>1. Okamžité zadání</h4>
                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nadiktujte hlasem nebo vyfoťte náčrt. AI automaticky vytvoří úkoly a rozpozná kompetence kolegů.</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <Mail className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>2. Distribuce Snapu</h4>
                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Systém odešle reálné e-maily kolegům s plným kontextem. Ti mohou odpovědět přímo z Outlooku.</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <Target className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>3. Párování stavu</h4>
                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI zachytí e-mailovou odpověď, zanalyzuje ji a automaticky zaktualizuje stav úkolu v dashboardu.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: ANALYSIS */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Režim AI Analýza</h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-5 group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <FileSearch className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Vytěžování dat</h4>
                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tento režim nevytváří úkoly. Slouží k vytažení tabulek z fotek katalogů nebo přepisování ručních poznámek.</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <MessageSquareText className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Výtah z e-mailů</h4>
                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Vložte dlouhou komunikaci s klientem a nechte si udělat stručný odrážkový výpis nejdůležitějších bodů.</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                  <Zap className="w-6 h-6 text-amber-500 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Power Tip</div>
                    <p className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Uložené analýzy najdete v archivu "AI Analyses".</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className={`mt-16 p-8 border-t text-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
            <div className="flex flex-wrap justify-center gap-8">
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gemini 3 Pro Engine</span>
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Real-time SMTP Sync</span>
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kontextuální směrování</span>
               </div>
            </div>
          </div>
        </div>

        <div className={`p-8 shrink-0 border-t ${isDarkMode ? 'border-white/5 bg-slate-950/30' : 'border-slate-100 bg-slate-50'}`}>
          <button onClick={onClose} className={`w-full h-16 font-black rounded-3xl transition-all text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-black'}`}>
            ROZUMÍM, JDU SNAPHNOUT ÚKOL
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
