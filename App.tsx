
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import FlowCard from './components/FlowCard.tsx';
import NewFlowModal from './components/NewFlowModal.tsx';
import FlowDetails from './components/FlowDetails.tsx';
import RulesManager from './components/RulesManager.tsx';
import TeamView from './components/TeamView.tsx';
import ScenariosModal from './components/ScenariosModal.tsx';
import HelpModal from './components/HelpModal.tsx';
import StaleFlowsBanner from './components/StaleFlowsBanner.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import AIAnalysesArchive from './components/AIAnalysesArchive.tsx';
import { INITIAL_FLOWS, TEAM_MEMBERS as INITIAL_TEAM, INITIAL_MAPPINGS, CONSTRUCTION_FACTS } from './constants.ts';
import { Flow, RoleMapping, User, FlowStatus, Status, SavedAnalysis } from './types.ts';
import { Search, Bell, PlusCircle, Lightbulb, Menu, Layers, Sparkles, HelpCircle, User as UserIcon, Users, LayoutDashboard, BrainCircuit, Sun, Moon, LogOut, Mic, Camera, FileText, Zap, ArrowRight, X, Upload, HardHat, Truck, Shield, Package, LayoutGrid, UserCheck, PenTool, Ruler, Monitor, SquarePlus, Calendar as CalendarIcon, Clock, MessageSquarePlus, Info, FileSearch, Check, Copy } from 'lucide-react';
import { analyzeReply } from './services/geminiService.ts';

const App: React.FC = () => {
  const getStoredData = <T,>(key: string, initial: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return initial;
    try { return JSON.parse(stored); } catch { return initial; }
  };

  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [viewMode, setViewMode] = useState<'mine' | 'team'>('mine');
  const [flows, setFlows] = useState<Flow[]>(() => getStoredData('fr_flows', INITIAL_FLOWS));
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>(() => getStoredData('fr_analyses', []));
  const [teamMembers, setTeamMembers] = useState<User[]>(() => getStoredData('fr_team', INITIAL_TEAM));
  const [mappings, setMappings] = useState<RoleMapping[]>(() => getStoredData('fr_mappings', INITIAL_MAPPINGS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('fr_current_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('fr_theme');
    return stored ? stored === 'dark' : true;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialMode, setModalInitialMode] = useState<'voice' | 'camera' | 'text' | 'upload' | null>(null);
  const [modalInitialAIRezim, setModalInitialAIRezim] = useState<'WORKFLOW' | 'ANALYSIS'>('WORKFLOW');
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prefilledDescription, setPrefilledDescription] = useState('');
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showStaleBanner, setShowStaleBanner] = useState(true);
  const [now, setNow] = useState(new Date());
  const [mobileFact, setMobileFact] = useState("");

  // Persistence
  useEffect(() => localStorage.setItem('fr_flows', JSON.stringify(flows)), [flows]);
  useEffect(() => localStorage.setItem('fr_analyses', JSON.stringify(analyses)), [analyses]);
  useEffect(() => localStorage.setItem('fr_team', JSON.stringify(teamMembers)), [teamMembers]);
  useEffect(() => localStorage.setItem('fr_theme', isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('fr_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('fr_current_user');
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setMobileFact(CONSTRUCTION_FACTS[Math.floor(Math.random() * CONSTRUCTION_FACTS.length)]);
    }
  }, [isMobileMenuOpen]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedFlowId(null);
    setIsMobileMenuOpen(false);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setNotification(`Vítejte zpět v DEK Snap, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedFlowId(null);
    setActiveTab('dashboard');
    setViewMode('mine');
    setIsMobileMenuOpen(false);
  };

  const openNewFlow = (inputMode: 'voice' | 'camera' | 'text' | 'upload', aiRezim: 'WORKFLOW' | 'ANALYSIS' = 'WORKFLOW') => {
    setModalInitialMode(inputMode);
    setModalInitialAIRezim(aiRezim);
    setIsModalOpen(true);
  };

  const closeNewFlow = () => {
    setIsModalOpen(false);
    setPrefilledDescription('');
    setModalInitialMode(null);
  };

  const pendingTeamTasksCount = useMemo(() => {
    if (!currentUser) return 0;
    return flows.reduce((count, flow) => {
      if (flow.creatorId === currentUser.id) return count;
      const myTasks = flow.subRequests.filter(s => 
        s.assigneeId === currentUser.id && 
        s.status !== 'DONE' && 
        s.status !== 'NEEDS_REVIEW'
      );
      return count + myTasks.length;
    }, 0);
  }, [flows, currentUser]);

  const filteredFlows = useMemo(() => {
    let result = flows;
    if (!currentUser) return [];

    if (viewMode === 'mine') {
      result = result.filter(f => f.creatorId === currentUser.id);
      if (dashboardFilter === 'active') result = result.filter(f => f.status === 'ACTIVE');
      else if (dashboardFilter === 'completed') result = result.filter(f => f.status === 'COMPLETED');
    } else {
      result = result.filter(f => f.subRequests.some(s => s.assigneeId === currentUser.id));
      if (dashboardFilter === 'active') {
        result = result.filter(f => f.subRequests.some(s => 
          s.assigneeId === currentUser.id && 
          s.status !== 'DONE' && 
          s.status !== 'NEEDS_REVIEW'
        ));
      } else if (dashboardFilter === 'completed') {
        result = result.filter(f => f.subRequests.every(s => 
          s.assigneeId !== currentUser.id || 
          s.status === 'DONE' || 
          s.status === 'NEEDS_REVIEW'
        ));
      }
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.title.toLowerCase().includes(q) || 
        f.description.toLowerCase().includes(q) ||
        f.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [flows, dashboardFilter, searchQuery, viewMode, currentUser]);

  const staleFlows = useMemo(() => {
    const nowTs = new Date().getTime();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    return flows.filter(f => {
      const created = new Date(f.createdAt).getTime();
      const isOld = (nowTs - created) >= fortyEightHoursMs;
      const isNotDone = f.status === 'ACTIVE';
      const isMine = f.creatorId === currentUser?.id;
      return isOld && isNotDone && isMine;
    });
  }, [flows, currentUser]);

  const updateFlowStatus = (flow: Flow): Flow => {
    const allDone = flow.subRequests.every(s => s.status === 'DONE');
    return { ...flow, status: allDone ? 'COMPLETED' : 'ACTIVE' };
  };

  const handleSaveFlow = (newFlow: Flow) => {
    const initializedFlow = { ...newFlow, status: 'ACTIVE' as FlowStatus };
    setFlows([initializedFlow, ...flows]);
    closeNewFlow();
    setSelectedFlowId(newFlow.id);
    setNotification(`Snap "${newFlow.title}" vytvořen.`);
    setViewMode('mine');
  };

  const handleSaveAnalysis = (analysis: SavedAnalysis) => {
    setAnalyses([analysis, ...analyses]);
    setNotification("Analýza uložena do historie.");
  };

  const handleManualReply = async (flowId: string, subId: string, replyText: string, directVerdict?: 'CONFIRMED' | 'REJECTED') => {
    let summary = '';
    let verdict: 'CONFIRMED' | 'REJECTED' | 'UNCLEAR' = 'UNCLEAR';
    if (directVerdict) {
      summary = replyText;
      verdict = directVerdict;
    } else {
      setNotification("Zpracovávám odpověď...");
      const aiResult = await analyzeReply(replyText);
      summary = aiResult.summary;
      verdict = aiResult.verdict;
    }
    setFlows(prev => prev.map(flow => {
      if (flow.id !== flowId) return flow;
      const updatedFlow = { 
        ...flow, 
        subRequests: flow.subRequests.map(sub => {
          if (sub.id !== subId) return sub;
          return { ...sub, status: 'NEEDS_REVIEW' as Status, replySummary: summary, replyVerdict: verdict };
        })
      };
      return updateFlowStatus(updatedFlow);
    }));
    if (!directVerdict) setNotification("Odpověď zanalyzována a odeslána.");
  };

  const handleToggleSubStatus = (subId: string) => {
    if (!selectedFlowId) return;
    setFlows(prev => prev.map(flow => {
      if (flow.id !== selectedFlowId) return flow;
      const updatedFlow = { 
        ...flow, 
        subRequests: flow.subRequests.map(sub => {
          if (sub.id !== subId) return sub;
          const isDone = sub.status === 'DONE';
          return { ...sub, status: (isDone ? 'SENT' : 'DONE') as Status };
        })
      };
      return updateFlowStatus(updatedFlow);
    }));
  };

  const selectedFlow = flows.find(f => f.id === selectedFlowId);

  const startScenario = (text: string) => {
    setPrefilledDescription(text);
    setModalInitialMode(null);
    setModalInitialAIRezim('WORKFLOW');
    setIsScenariosOpen(false);
    setIsModalOpen(true);
  };

  if (!currentUser) {
    return <LoginScreen teamMembers={teamMembers} onLogin={handleLogin} />;
  }

  const MobileBottomNav = () => (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 h-20 border-t flex justify-around items-center z-40 pb-2 ${isDarkMode ? 'bg-slate-950/90 border-white/5 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'}`}>
      {[
        { id: 'dashboard', label: 'Snaps', icon: LayoutDashboard, color: 'text-indigo-600' },
        { id: 'analyses', label: 'Analyses', icon: Sparkles, color: 'text-violet-600' },
        { id: 'ai-tips', label: 'Tips', icon: Zap, color: 'text-amber-500' },
        { id: 'team', label: 'Tým', icon: Users, adminOnly: true, color: 'text-slate-600' },
      ].map((item) => (
        (!item.adminOnly || currentUser.isAdmin) && (
          <button 
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all relative ${activeTab === item.id ? (isDarkMode ? 'text-white' : item.color) : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
          >
            {item.id === 'dashboard' && pendingTeamTasksCount > 0 && (
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white z-10" />
            )}
            <div className={`p-1.5 rounded-xl ${activeTab === item.id ? (isDarkMode ? 'bg-white/10' : 'bg-slate-100') : ''}`}>
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? item.color : ''}`} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        )
      ))}
    </nav>
  );

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white dark' : 'bg-slate-50 text-slate-900'} relative overflow-x-hidden font-sans`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        pendingTeamCount={pendingTeamTasksCount}
      />
      
      <main className={`flex-1 flex flex-col min-w-0 h-screen relative z-10 bg-transparent ${currentUser.isAdmin ? 'pb-24 lg:pb-0' : ''}`}>
        <header className={`h-20 sm:h-24 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-500 ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className={`p-3 rounded-xl transition-all lg:hidden ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-3">
               <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 shrink-0">S</div>
               <span className={`font-black tracking-tight text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>DEK Snap</span>
            </div>
            <div className={`flex flex-col justify-center border-l pl-4 lg:hidden ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {now.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' })}
              </div>
              <div className={`text-xs font-black flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Clock className="w-3 h-3" />
                {now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => openNewFlow('text', 'WORKFLOW')} 
                className={`flex items-center justify-center px-6 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl transition-all group active:scale-95 ${isDarkMode ? 'shadow-indigo-600/20' : 'shadow-indigo-600/10'}`}
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Nový Snap</span>
              </button>
              <button 
                onClick={() => openNewFlow('text', 'ANALYSIS')} 
                className={`flex items-center justify-center px-6 h-14 bg-violet-600 text-white rounded-2xl shadow-xl transition-all group active:scale-95 ${isDarkMode ? 'shadow-violet-600/20' : 'shadow-violet-600/10'}`}
              >
                <Sparkles  className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" /> 
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">AI Analýza</span>
              </button>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              <button onClick={() => openNewFlow('text', 'WORKFLOW')} className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><PlusCircle className="w-6 h-6"/></button>
              <button onClick={() => openNewFlow('text', 'ANALYSIS')} className="w-11 h-11 bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Sparkles className="w-6 h-6"/></button>
            </div>

            <div className="hidden lg:flex items-center gap-3 ml-2">
              <button onClick={() => setIsScenariosOpen(true)} className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600'}`}>
                <Lightbulb className="w-5 h-5" />
              </button>
              <button onClick={() => setIsHelpOpen(true)} className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className={`absolute left-0 top-0 bottom-0 w-80 p-8 shadow-2xl flex flex-col gap-8 animate-in slide-in-from-left duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">S</div>
                  <h3 className="text-xl font-black tracking-tight">Menu</h3>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/5 transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Práce</p>
                  <button onClick={() => handleTabChange('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')}`}>
                    <LayoutDashboard className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                  </button>
                  <button onClick={() => handleTabChange('analyses')} className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${activeTab === 'analyses' ? 'bg-violet-600 text-white border-violet-500 shadow-lg' : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')}`}>
                    <Sparkles className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">AI Analyses</span>
                  </button>
                  <button onClick={() => handleTabChange('ai-tips')} className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${activeTab === 'ai-tips' ? 'bg-amber-500 text-white border-amber-400 shadow-lg' : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')}`}>
                    <Zap className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">AI Power Tips</span>
                  </button>
                  <button onClick={() => { setIsHelpOpen(true); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <HelpCircle className="w-5 h-5 text-slate-500" /> <span className="text-xs font-black uppercase tracking-widest">Nápověda</span>
                  </button>
                </div>

                {currentUser.isAdmin && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Správa</p>
                    <button onClick={() => handleTabChange('rules')} className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${activeTab === 'rules' ? 'bg-slate-800 text-white border-slate-700 shadow-lg' : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')}`}>
                      <BrainCircuit className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">Pravidla AI</span>
                    </button>
                    <button onClick={() => handleTabChange('team')} className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${activeTab === 'team' ? 'bg-slate-800 text-white border-slate-700 shadow-lg' : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')}`}>
                      <Users className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">Tým</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t flex flex-col gap-4">
                <button onClick={() => { setIsDarkMode(!isDarkMode); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-xs font-black uppercase tracking-widest">{isDarkMode ? 'Denní režim' : 'Noční režim'}</span>
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-5 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest">
                  <LogOut className="w-5 h-5" /> Odhlásit se
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
          {selectedFlow ? (
            <FlowDetails 
              flow={selectedFlow} 
              onBack={() => setSelectedFlowId(null)}
              onToggleStatus={handleToggleSubStatus}
              onManualReply={(subId, text, verdict) => handleManualReply(selectedFlow.id, subId, text, verdict)}
              teamMembers={teamMembers}
              isDarkMode={isDarkMode}
              currentUser={currentUser}
            />
          ) : activeTab === 'dashboard' ? (
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-12 pb-24 lg:pb-0">
              {showStaleBanner && staleFlows.length > 0 && viewMode === 'mine' && (
                <StaleFlowsBanner staleFlows={staleFlows} onDismiss={() => setShowStaleBanner(false)} onSelectFlow={setSelectedFlowId} />
              )}
              
              <div className="flex flex-col gap-6 lg:gap-8">
                <div className="relative w-full">
                  <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input 
                    type="text" 
                    placeholder="Hledat zakázky, PM nebo materiály..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-14 pr-6 h-14 sm:h-16 border rounded-3xl text-sm sm:text-base outline-none transition-all placeholder:text-slate-600 shadow-sm ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/10 backdrop-blur-md' : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-600/5 focus:bg-slate-50'}`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Layers className={`w-8 h-8 ${isDarkMode ? 'text-white/20' : 'text-slate-200'}`} /> 
                    {viewMode === 'mine' ? 'Moje Snaps' : 'Týmové Snaps'}
                  </h2>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className={`flex p-1 rounded-2xl border w-full sm:w-fit ${isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <button onClick={() => setViewMode('mine')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${viewMode === 'mine' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}>
                        <UserIcon className="w-3.5 h-3.5" /> <span className="text-[10px] font-black uppercase tracking-widest">Moje</span>
                      </button>
                      <button onClick={() => setViewMode('team')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 relative ${viewMode === 'team' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}>
                        <Users className="w-3.5 h-3.5" /> <span className="text-[10px] font-black uppercase tracking-widest">Tým</span>
                        {pendingTeamTasksCount > 0 && <div className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-bounce ${viewMode === 'team' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>{pendingTeamTasksCount}</div>}
                      </button>
                    </div>

                    <div className={`flex p-1 rounded-2xl border w-full sm:w-fit backdrop-blur-md transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                      {(['all', 'active', 'completed'] as const).map(f => (
                        <button key={f} onClick={() => setDashboardFilter(f)} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${dashboardFilter === f ? (isDarkMode ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-900 text-white shadow-lg') : (isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900')}`}>
                          {f === 'all' ? 'Vše' : f === 'active' ? 'Aktivní' : 'Hotovo'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {filteredFlows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 animate-in fade-in duration-700">
                  {filteredFlows.map(flow => (
                    <FlowCard key={flow.id} flow={flow} onClick={() => setSelectedFlowId(flow.id)} teamMembers={teamMembers} isDarkMode={isDarkMode} currentUser={currentUser} />
                  ))}
                </div>
              ) : !searchQuery ? (
                <div className="max-w-7xl mx-auto space-y-12 py-10 animate-in fade-in zoom-in duration-1000">
                  <div className="text-center space-y-6">
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Sparkles className="w-4 h-4 animate-pulse" /> Začněte nový Snap
                    </div>
                    <h2 className={`text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter max-w-4xl mx-auto leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Nechte DEK Snap pracovat za vás.
                    </h2>
                    <p className={`text-xl sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Zadejte svůj první Snap úkol nebo vyzkoušejte AI analýzu dokumentu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'scenarios', label: 'Ukázka', desc: 'Inspirujte se', icon: Lightbulb, color: 'bg-amber-500', action: () => setIsScenariosOpen(true) },
                      { id: 'voice', label: 'Diktování', desc: 'Mluvte přirozeně', icon: Mic, color: 'bg-red-500', action: () => openNewFlow('voice', 'WORKFLOW') },
                      { id: 'camera', label: 'Fotka', desc: 'Skenujte výkresy', icon: Camera, color: 'bg-indigo-600', action: () => openNewFlow('camera', 'WORKFLOW') },
                      { id: 'upload', label: 'Soubor', desc: 'Příloha k analýze', icon: Upload, color: 'bg-violet-600', action: () => openNewFlow('upload', 'WORKFLOW') },
                      { id: 'text', label: 'Text', desc: 'Detailní instrukce', icon: FileText, color: 'bg-emerald-600', action: () => openNewFlow('text', 'WORKFLOW') },
                      { id: 'analysis', label: 'AI Analýza', desc: 'Detailní rozbor dat', icon: Sparkles, color: 'bg-violet-600', action: () => openNewFlow('text', 'ANALYSIS') },
                    ].map((tile) => (
                      <button 
                        key={tile.id}
                        onClick={tile.action}
                        className={`group p-8 rounded-[2.5rem] border text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-indigo-200'}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110 ${tile.color}`}>
                          <tile.icon className="w-8 h-8" />
                        </div>
                        <h4 className={`text-xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tile.label}</h4>
                        <p className="text-sm font-medium text-slate-500 leading-tight">{tile.desc}</p>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          Spustit <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="hidden lg:flex justify-center mt-12">
                    <button 
                      onClick={() => openNewFlow('text', 'ANALYSIS')}
                      className={`h-20 px-20 flex items-center gap-6 bg-violet-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl shadow-violet-600/30 active:scale-95 hover:bg-violet-700 hover:shadow-violet-600/40`}
                    >
                      <Sparkles className="w-7 h-7" /> AI ANALÝZA
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto py-20 text-center space-y-4">
                  <div className={`inline-flex items-center justify-center p-3 rounded-2xl mb-4 ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Search className="w-8 h-8" />
                  </div>
                  <h2 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Žádná shoda pro "{searchQuery}"</h2>
                  <p className="text-slate-500">Zkuste zadat jiné klíčové slovo nebo filtr.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'analyses' ? (
            <AIAnalysesArchive analyses={analyses} setAnalyses={setAnalyses} isDarkMode={isDarkMode} />
          ) : activeTab === 'ai-tips' ? (
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className={`p-8 sm:p-12 rounded-[3rem] relative overflow-hidden border ${isDarkMode ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-xl shadow-amber-500/5'}`}>
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <Zap className="w-64 h-64 text-amber-500" />
                </div>
                <div className="relative z-10 max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
                    <Zap className="w-4 h-4 fill-current" /> AI Power User Guide
                  </div>
                  <h2 className={`text-4xl sm:text-6xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mistrovství s AI Snap</h2>
                  <p className="text-xl font-medium text-slate-400 leading-relaxed">Nepřemýšlejte nad formou. Čím přirozeněji zadáte úkol, tím lépe ho Gemini pochopí. Zde je návod, jak ovládnout DEK Snap jako profík.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Kontext je král",
                    desc: "Místo 'Potřebuju nacenit SDK' napište 'PM Sádrokartony: Nacenit 200m2 RB desek pro novostavbu v Liberci'. AI okamžitě identifikuje roli i prioritu.",
                    icon: Info,
                    color: "bg-blue-500"
                  },
                  {
                    title: "Vision Snap",
                    desc: "Nahrajte fotku ručního náčrtu ze stavby. AI vyextrahuje položky a vytvoří z nich strukturovaný seznam úkolů za vás.",
                    icon: Camera,
                    color: "bg-emerald-500"
                  },
                  {
                    title: "Hlasové zkratky",
                    desc: "Využívejte diktování přímo na stavbě. Gemini filtruje šum a soustředí se na klíčová slova jako 'materiál', 'závoz' nebo 'sleva'.",
                    icon: Mic,
                    color: "bg-red-500"
                  },
                  {
                    title: "Hromadné úkoly",
                    desc: "Pokud zmíníte 'Všichni obchodníci', AI nastaví targetScope na ROLE_ALL. Úkol tak dostane celý tým dané specializace.",
                    icon: Users,
                    color: "bg-indigo-500"
                  },
                  {
                    title: "Čistá Analýza",
                    desc: "Režim Analýza slouží pro vytěžování dat. Vložte e-mail od klienta a nechte si udělat stručný výcuc důležitých faktů bez tvorby úkolů.",
                    icon: Sparkles,
                    color: "bg-violet-500"
                  },
                  {
                    title: "Priorita spěchá",
                    desc: "Zvolte prioritu 'Spěchá' pro automatické zkrácení termínů. AI pak PMům zdůrazní, že jde o urgentní záležitost.",
                    icon: Zap,
                    color: "bg-amber-500"
                  }
                ].map((tip, i) => (
                  <div key={i} className={`p-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg mb-6 ${tip.color}`}>
                      <tip.icon className="w-6 h-6" />
                    </div>
                    <h3 className={`text-xl font-black mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tip.title}</h3>
                    <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'rules' ? (
            <RulesManager mappings={mappings} setMappings={setMappings} teamMembers={teamMembers} currentUser={currentUser} isDarkMode={isDarkMode} />
          ) : activeTab === 'team' ? (
            <TeamView teamMembers={teamMembers} setTeamMembers={setTeamMembers} isDarkMode={isDarkMode} />
          ) : null}
        </div>
      </main>

      {currentUser.isAdmin && <MobileBottomNav />}

      {isModalOpen && (
        <NewFlowModal 
          onClose={closeNewFlow}
          onSave={handleSaveFlow}
          onSaveAnalysis={handleSaveAnalysis}
          mappings={mappings}
          setMappings={setMappings}
          initialDescription={prefilledDescription}
          initialMode={modalInitialMode || undefined}
          initialModalMode={modalInitialAIRezim}
          teamMembers={teamMembers}
          setTeamMembers={setTeamMembers}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
        />
      )}

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} isDarkMode={isDarkMode} />}
      {isScenariosOpen && <ScenariosModal onClose={() => setIsScenariosOpen(false)} onStartScenario={startScenario} isDarkMode={isDarkMode} />}
    </div>
  );
};

export default App;
