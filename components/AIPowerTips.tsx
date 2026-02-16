
import React from 'react';
import { Zap, Mic, Camera, Users, Sparkles, MessageSquare, Target, Lightbulb, CheckCircle2 } from 'lucide-react';

interface AIPowerTipsProps {
  isDarkMode: boolean;
}

const AIPowerTips: React.FC<AIPowerTipsProps> = ({ isDarkMode }) => {
  const tips = [
    {
      title: "Hlasové povely (Snap Voice)",
      icon: <Mic className="w-6 h-6 text-red-500" />,
      desc: "Mluvte naprosto přirozeně. AI v DEK Snapu rozumí kontextu, i když používáte hovorovou češtinu.",
      example: "\"Petře, domluv mi u Heluzu slevu na těch 20 palet pro Nováka.\"",
      color: "bg-red-500/10 border-red-500/20"
    },
    {
      title: "Focení dokumentů (Snap Vision)",
      icon: <Camera className="w-6 h-6 text-indigo-500" />,
      desc: "Při focení výpisů z katalogů nebo ručních poznámek se snažte o dobré světlo. AI tabulky automaticky převede na data.",
      example: "Vyfoťte položkový rozpočet a asistent vám navrhne úkoly pro PM podle materiálů.",
      color: "bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Hromadná delegace (Broadcast)",
      icon: <Users className="w-6 h-6 text-amber-500" />,
      desc: "Potřebujete úkol pro všechny? Stačí použít klíčová slova jako 'všichni', 'všem' nebo 'celý tým'.",
      example: "\"Všem obchodníkům: Do pátku mi pošlete reporty ze štik.\"",
      color: "bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "Režim AI Analýza",
      icon: <Sparkles className="w-6 h-6 text-violet-500" />,
      desc: "Nepotřebujete delegovat, ale jen něco zpracovat? Přepněte se do režimu Analýza pro čistý výpis dat.",
      example: "Vložte text dlouhého e-mailu a nechte si udělat stručné odrážkové shrnutí.",
      color: "bg-violet-500/10 border-violet-500/20"
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              AI Power Tips
            </h2>
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Jak ovládnout DEK Snap asistenta jako profík.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {tips.map((tip, idx) => (
          <div key={idx} className={`p-8 lg:p-10 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex gap-6 items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${tip.color}`}>
                {tip.icon}
              </div>
              <div className="space-y-1">
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tip.title}</h3>
                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{tip.desc}</p>
              </div>
            </div>
            
            <div className={`p-5 rounded-2xl border-l-4 ${isDarkMode ? 'bg-slate-800/50 border-amber-500/50 text-slate-300' : 'bg-amber-50 border-amber-400 text-slate-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Příklad zadání</span>
              </div>
              <p className="text-sm font-bold italic">"{tip.example}"</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-8 lg:p-16 rounded-[3rem] border-2 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100 shadow-xl'}`}>
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Lightbulb className="w-48 h-48 text-indigo-500" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <h3 className={`text-2xl lg:text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zlaté pravidlo „Jednoho Snapu“</h3>
          <p className={`text-lg lg:text-xl font-medium leading-relaxed mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Nepište deset e-mailů. Stačí jeden Snap s kompletním příběhem (co se děje, pro koho, co je v příloze). AI se postará o rozdělení úkolů správným lidem tak, aby každý viděl jen to své, ale celý systém znal kontext.
          </p>
          
          <div className="flex flex-wrap gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Ušetřený čas</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Žádné zapomenuté úkoly</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Přehled v Dashboardu</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPowerTips;
