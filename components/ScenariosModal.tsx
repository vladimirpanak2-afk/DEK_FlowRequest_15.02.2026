
import React from 'react';
import { X, Play, Truck, HardHat, Sparkles, Zap, Shield, UserCheck, Package, LayoutGrid, Calculator, Users } from 'lucide-react';

interface ScenariosModalProps {
  onClose: () => void;
  onStartScenario: (text: string) => void;
  isDarkMode: boolean; 
}

const ScenariosModal: React.FC<ScenariosModalProps> = ({ onClose, onStartScenario, isDarkMode }) => {
  const scenarios = [
    {
      id: "oz-zdivo",
      title: "OZ Mojmír: Velká zakázka Zdivo",
      icon: <LayoutGrid className="w-6 h-6 text-indigo-400" />,
      desc: "Ověření objektové slevy u PM.",
      text: "Mám poptávku od firmy Stavitel s.r.o. na 80 kamionů cihel Porotherm na projekt Rezidence Vltava. Potřebuji objektovou slevu."
    },
    {
      id: "oz-fasady",
      title: "OZ Honza: Fasády a ETICS",
      icon: <Calculator className="w-6 h-6 text-emerald-400" />,
      desc: "Delegace výpočtu na technika a vzorků na PM.",
      text: "Máme rozdělanou tu školu v Berouně. Potřebuji spočítat přesnou spotřebu ETICS (lepidlo, omítka) podle výkresů, ať to mám v nabídce správně. Lucko (PM), u Stachemy prosím domluv fyzický vzorkovník omítek pro investora, chce si vybrat odstín přímo na stavbě."
    },
    {
      id: "oz-sdk",
      title: "OZ Petra: Sádrokartony",
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      desc: "Delegace podržení akční ceny u výrobce na PM.",
      text: "Připravuji nabídku na sádrokartony pro vestavbu v hale C pro firmu HALA-STAV. Je tam hodně akustických desek Rigips. Petře podržíš mi prosím tu akční cenu ještě o týden déle? Zákazník se rozhodne v pondělí a potřebuju mu tu cenu garantovat."
    },
    {
      id: "reditel-vsem",
      title: "Ředitel Eva: Hromadný report",
      icon: <Users className="w-6 h-6 text-violet-400" />,
      desc: "Zadání pro všechny obchodníky najednou.",
      text: "Všem obchodníkům: Do pátku potřebuji mít v CRM kompletně zapsané všechny štiky za tento měsíc a reporty z posledních schůzek. Budeme to vyhodnocovat na pondělní poradě celého týmu."
    },
    {
      id: "sklad-provireni",
      title: "Provozní: Havárie na pobočce",
      icon: <HardHat className="w-6 h-6 text-red-400" />,
      desc: "Řešení technické závady v areálu.",
      text: "Čestmíre, v zadní části skladu u regálů se zdivem prasklo potrubí a teče tam voda. Okamžitě tam pošli údržbu a prověř, zda není poškozené zboží na spodních paletách. Ředitelka Eva o tom už ví."
    },
    {
      id: "analýza-dokladu",
      title: "AI Analýza: Přepis výkazu",
      icon: <Sparkles className="w-6 h-6 text-blue-400" />,
      desc: "Vytěžení dat z textu nebo obrázku (bez úkolů).",
      text: "Analyzuj tento výpis materiálu: 50x EPS 70F 100mm, 20x Lepidlo Weber 25kg, 5x Omítka Stachema 1.5mm. Udělej mi z toho přehlednou tabulku s celkovou váhou v kg, pokud pytel lepidla má 25kg a kbelík omítky taky."
    }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-[3rem] border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
        
        {/* Header with glow */}
        <div className={`px-8 h-24 lg:px-12 border-b flex justify-between items-center shrink-0 relative ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <div className="absolute top-0 left-0 w-32 h-full bg-indigo-500/10 blur-[50px] pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ukázka a Inspirace</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Reálné DEK scénáře pro otestování AI logiky</p>
            </div>
          </div>
          <button onClick={onClose} className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
            <X className={`w-8 h-8 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-4 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((s) => (
              <button 
                key={s.id} 
                className={`group p-6 border rounded-3xl transition-all text-left flex gap-5 items-start relative overflow-hidden active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-indigo-500/50 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'}`} 
                onClick={() => onStartScenario(s.text)}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-500 shadow-xl ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'}`}>
                  {s.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className={`text-sm font-black tracking-tight group-hover:text-indigo-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{s.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{s.desc}</p>
                  <div className="flex items-center gap-2 text-indigo-500 font-black text-[9px] uppercase tracking-widest pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-2.5 h-2.5 fill-indigo-500" /> Spustit Flow
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`p-8 shrink-0 border-t flex justify-center ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <button onClick={onClose} className={`px-10 py-4 font-black uppercase tracking-widest transition-all text-[10px] rounded-2xl border ${isDarkMode ? 'text-slate-500 hover:text-white bg-white/5 border-white/5 hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 bg-white border-slate-200 hover:bg-slate-100'}`}>
            ZAVŘÍT PŘEHLED
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenariosModal;
