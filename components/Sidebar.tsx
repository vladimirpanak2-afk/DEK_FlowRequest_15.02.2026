
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BrainCircuit, Sun, Moon, LogOut, X, Zap, Calendar as CalendarIcon, Cloud, CloudRain, CloudSun, Info, Clock, Sparkles } from 'lucide-react';
import { User } from '../types.ts';
import { CONSTRUCTION_FACTS } from '../constants.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  currentUser: User;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  pendingTeamCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  isDarkMode,
  toggleDarkMode,
  pendingTeamCount = 0
}) => {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);
  const [fact, setFact] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    setFact(CONSTRUCTION_FACTS[Math.floor(Math.random() * CONSTRUCTION_FACTS.length)]);

    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.08&longitude=14.43&current_weather=true');
        const data = await res.json();
        if (data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode
          });
        }
      } catch (e) {
        console.warn("Weather fetch failed", e);
      }
    };
    fetchWeather();
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 2) return <Sun className="w-4 h-4 text-amber-400" />;
    if (code <= 48) return <CloudSun className="w-4 h-4 text-slate-400" />;
    if (code <= 67) return <CloudRain className="w-4 h-4 text-indigo-400" />;
    return <Cloud className="w-4 h-4 text-slate-300" />;
  };

  return (
    <aside className={`
      hidden lg:flex
      sticky top-0 left-0 h-screen w-72 border-r flex-col z-[50] transition-all duration-500 ease-in-out
      ${isDarkMode ? 'bg-slate-900 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}
    `}>
      <div className="p-6 h-full flex flex-col relative z-10 overflow-hidden">
        {/* LOGO SECTION */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20 shrink-0">S</div>
          <h1 className={`text-lg font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>DEK Snap</h1>
        </div>

        {/* PERMANENT DATE BLOCK */}
        <div className={`p-4 rounded-2xl mb-8 border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 shadow-inner' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
              {now.toLocaleDateString('cs-CZ', { weekday: 'long' })}
            </div>
            <div className="flex items-center gap-2">
              {weather && getWeatherIcon(weather.code)}
              <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {weather ? `${weather.temp}°C` : '--°C'}
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {now.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-sm font-black text-indigo-500 flex items-center gap-1.5 mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              {now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* NAVIGATION GROUPS */}
        <nav className="space-y-8 flex-1 overflow-y-auto no-scrollbar pr-1">
          {/* GROUP: MOJE PRÁCE */}
          <div className="space-y-2">
            <div className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Moje Práce</div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all group relative ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : (isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Dashboard</span>
              {pendingTeamCount > 0 && (
                <div className="absolute right-3 w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center animate-pulse border border-white/20">
                  {pendingTeamCount}
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analyses')}
              className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all group ${
                activeTab === 'analyses'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : (isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>AI Analyses</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-tips')}
              className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all group ${
                activeTab === 'ai-tips'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : (isDarkMode ? 'text-slate-500 hover:text-amber-500 hover:bg-amber-500/5' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50')
              }`}
            >
              <Zap className="w-5 h-5 shrink-0" />
              <span>AI Power Tips</span>
            </button>
          </div>

          {/* GROUP: ADMINISTRACE (Pouze pro Admina) */}
          {currentUser.isAdmin && (
            <div className="space-y-2">
              <div className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Správa</div>
              <button
                onClick={() => setActiveTab('rules')}
                className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all group ${
                  activeTab === 'rules' 
                    ? 'bg-slate-800 text-white' 
                    : (isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <BrainCircuit className="w-5 h-5 shrink-0" />
                <span>Pravidla AI</span>
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all group ${
                  activeTab === 'team' 
                    ? 'bg-slate-800 text-white' 
                    : (isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span>Tým</span>
              </button>
            </div>
          )}
        </nav>

        {/* BOTTOM WIDGETS */}
        <div className={`pt-6 border-t space-y-4 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
          {/* Construction Fact Badge */}
          <div className={`p-4 rounded-2xl border relative overflow-hidden group transition-all ${isDarkMode ? 'bg-violet-500/5 border-violet-500/10' : 'bg-violet-50/50 border-violet-100'}`}>
             <div className="flex items-center gap-2 mb-2">
                <Info className="w-3 h-3 text-violet-500" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-500">Víte, že?</span>
             </div>
             <p className={`text-[10px] font-bold leading-relaxed italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               "{fact}"
             </p>
          </div>

          {/* User & Theme Toggle */}
          <div className={`rounded-3xl p-4 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-xl border-2 border-white shrink-0 shadow-sm" />
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</div>
                <div className="text-[9px] font-bold text-slate-500 truncate uppercase">{currentUser.role}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={toggleDarkMode} className={`flex-1 flex items-center justify-center p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-white/10 text-amber-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={onLogout} className="flex-1 flex items-center justify-center p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
