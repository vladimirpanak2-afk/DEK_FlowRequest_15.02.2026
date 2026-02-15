
import React, { useState } from 'react';
import { SavedAnalysis } from '../types.ts';
import { Sparkles, Trash2, Calendar, Copy, Check, Eye, X, Search, FileText } from 'lucide-react';

interface AIAnalysesArchiveProps {
  analyses: SavedAnalysis[];
  setAnalyses: React.Dispatch<React.SetStateAction<SavedAnalysis[]>>;
  isDarkMode: boolean;
}

const AIAnalysesArchive: React.FC<AIAnalysesArchiveProps> = ({ analyses, setAnalyses, isDarkMode }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Opravdu chcete smazat tuto analýzu z historie?")) {
      setAnalyses(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleCopy = (analysis: SavedAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(analysis.content);
    setCopiedId(analysis.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = analyses.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Sparkles className="w-8 h-8 text-violet-500" /> AI Analyses
          </h2>
          <p className={`mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Historie vašich AI analýz, přepisů a extrakcí dat.</p>
        </div>

        <div className={`flex items-center px-4 h-12 rounded-xl border w-full md:w-80 transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Hledat v analýzách..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold w-full placeholder:text-slate-500" 
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(analysis => (
            <div 
              key={analysis.id}
              onClick={() => setSelectedAnalysis(analysis)}
              className={`group p-6 rounded-[2rem] border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden flex flex-col h-full ${
                isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-violet-200'
              }`}
            >
              <div className="flex-1 space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <button 
                      onClick={(e) => handleDelete(analysis.id, e)}
                      className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'}`}
                      title="Smazat analýzu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className={`font-black text-lg leading-tight line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{analysis.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {new Date(analysis.createdAt).toLocaleDateString('cs-CZ')}
                  </p>
                </div>

                <p className={`text-sm font-medium line-clamp-4 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {analysis.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-500">
                <Eye className="w-3.5 h-3.5" /> Zobrazit detail
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`py-24 text-center rounded-[3rem] border-2 border-dashed ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
          <div className="w-16 h-16 bg-violet-500/10 text-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Žádné uložené analýzy</h3>
          <p className="text-slate-500 font-medium">Analyzujte dokumenty nebo text v AI okně a uložte si výsledek.</p>
        </div>
      )}

      {selectedAnalysis && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-[3rem] border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className={`px-8 h-20 sm:h-24 flex items-center justify-between border-b ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black truncate max-w-[200px] sm:max-w-md">{selectedAnalysis.title}</h3>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(selectedAnalysis.createdAt).toLocaleString('cs-CZ')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={(e) => handleCopy(selectedAnalysis, e as any)}
                  className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${copiedId === selectedAnalysis.id ? 'bg-emerald-500 text-white' : (isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                >
                  {copiedId === selectedAnalysis.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedId === selectedAnalysis.id ? 'Zkopírováno' : 'Kopírovat text'}</span>
                </button>
                <button onClick={() => setSelectedAnalysis(null)} className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12 no-scrollbar">
               <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-8">
                    <div className={`prose prose-sm sm:prose-base max-w-none font-medium leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {selectedAnalysis.content}
                    </div>
                  </div>
                  
                  {selectedAnalysis.imagePreview && (
                    <div className="lg:w-64 shrink-0">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Původní dokument</label>
                        <img 
                          src={`data:${selectedAnalysis.mimeType || 'image/jpeg'};base64,${selectedAnalysis.imagePreview}`} 
                          alt="Zdroj" 
                          className="w-full rounded-2xl shadow-xl border-2 border-white/10 grayscale hover:grayscale-0 transition-all duration-500" 
                        />
                      </div>
                    </div>
                  )}
               </div>
            </div>
            
            <div className={`p-8 border-t ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
               <button onClick={() => setSelectedAnalysis(null)} className={`w-full h-14 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'}`}>
                 Zavřít detail
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysesArchive;
