
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
import AIPowerTips from './components/AIPowerTips.tsx';
import { INITIAL_FLOWS, TEAM_MEMBERS as INITIAL_TEAM, INITIAL_MAPPINGS } from './constants.ts';
import { Flow, RoleMapping, User, FlowStatus, Status, SavedAnalysis } from './types.ts';
import { Search, PlusCircle, Lightbulb, Menu, Layers, Sparkles, HelpCircle, User as UserIcon, Users, LayoutDashboard, Zap, Clock, X, Trash2, Mic, Camera, FileText, Upload, LayoutGrid, Info } from 'lucide-react';
import { analyzeReply } from './services/geminiService.ts';

const App: React.FC = () => {
  const getStoredData = <T,>(key: string, initial: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return initial;
    try { return JSON.parse(stored); } catch { return initial; }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardFilter, setDashboardFilter] = useState<'to_action' | 'active' | 'archive'>('to_action');
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

  // Úkoly delegované uživateli od ostatních (Tým)
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

  // Vlastní zakázky uživatele, kde někdo odpověděl a čeká se na schválení (Moje)
  const pendingMyActionCount = useMemo(() => {
    if (!currentUser) return 0;
    return flows.filter(f => 
      f.creatorId === currentUser.id && 
      f.subRequests.some(s => s.status === 'NEEDS_REVIEW')
    ).length;
  }, [flows, currentUser]);

  const filteredFlows = useMemo(() => {
    let result = flows;
    if (!currentUser) return [];

    if (viewMode === 'mine') {
      result = result.filter(f => f.creatorId === currentUser.id);
      if (dashboardFilter === 'to_action') {
        result = result.filter(f => f.subRequests.some(s => s.status === 'NEEDS_REVIEW'));
      } else if (dashboardFilter === 'active') {
        result = result.filter(f => f.status === 'ACTIVE');
      } else if (dashboardFilter === 'archive') {
        result = result.filter(f => f.status === 'COMPLETED');
      }
    } else {
      result = result.filter(f => f.subRequests.some(s => s.assigneeId === currentUser.id));
      if (dashboardFilter === 'to_action') {
        result = result.filter(f => f.subRequests.some(s => 
          s.assigneeId === currentUser.id && 
          s.status !== 'DONE' && 
          s.status !== 'NEEDS_REVIEW'
        ));
      } else if (dashboardFilter === 'active') {
        result = result.filter(f => f.status === 'ACTIVE');
      } else if (dashboardFilter === 'archive') {
        result = result.filter(f => f.status === 'COMPLETED');
      }
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.title.toLowerCase().includes(q) || 
        f.description.toLowerCase().includes(q)
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

  const handleSaveFlow = (newFlow: Flow) => {
    const initializedFlow = { ...newFlow, status: 'ACTIVE' as FlowStatus };
    setFlows([initializedFlow, ...flows]);
    closeNewFlow();
    setSelectedFlowId(newFlow.id);
    setNotification(`Snap "${newFlow.title}" vytvořen.`);
  };

  const handleManualReply = async (flowId: string, subId: string, replyText: string, directVerdict?: 'CONFIRMED' | 'REJECTED') => {
    let summary = replyText;
    let verdict: 'CONFIRMED' | 'REJECTED' | 'UNCLEAR' = directVerdict || 'UNCLEAR';
    
    if (!directVerdict) {
      setNotification("Zpracovávám odpověď...");
      const aiResult = await analyzeReply(replyText);
      summary = aiResult.summary;
      verdict = aiResult.verdict;
    }

    setFlows(prev => prev.map(flow => {
      if (flow.id !== flowId) return flow;
      return { 
        ...flow, 
        subRequests: flow.subRequests.map(sub => {
          if (sub.id !== subId) return sub;
          return { ...sub, status: 'NEEDS_REVIEW' as Status, replySummary: summary, replyVerdict: verdict };
        })
      };
    }));
  };

  const handleToggleSubStatus = (subId: string) => {
    if (!selectedFlowId) return;
    setFlows(prev => prev.map(flow => {
      if (flow.id !== selectedFlowId) return flow;
      const updatedSubRequests = flow.subRequests.map(sub => {
        if (sub.id !== subId) return sub;
        const currentIsDone = sub.status === 'DONE';
        return { ...sub, status: (currentIsDone ? 'SENT' : 'DONE') as Status };
      });
      return { 
        ...flow, 
        subRequests: updatedSubRequests,
        status: updatedSubRequests.every(s => s.status === 'DONE') ? 'COMPLETED' : 'ACTIVE'
      };
    }));
  };

  if (!currentUser) return <LoginScreen teamMembers={teamMembers} onLogin={handleLogin} />;

  const DashboardEmptyState = () => (
    <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 py-12 sm:py-20 animate-in fade-in zoom-in duration-1000">
      <div className="text-center space-y-6">
        <h2 className={`text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter max-w-4xl mx-auto leading-[1.1] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Nechte DEK Snap pracovat za vás.
        </h2>
        <p className={`text-lg sm:text-2xl font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Zadejte svůj první Snap úkol nebo vyzkoušejte AI analýzu dokumentu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
        {[
          { id: 'scenarios', label: 'Ukázka', desc: 'INSPIRUJTE SE', icon: Lightbulb, color: 'bg-amber-500', onClick: () => setIsScenariosOpen(true) },
          { id: 'voice', label: 'Diktování', desc: 'MLUVTE PŘIROZENĚ', icon: Mic, color: 'bg-red-500', onClick: () => openNewFlow('voice', 'WORKFLOW') },
          { id: 'camera', label: 'Fotka', desc: 'SKENUJTE VÝKRESY', icon: Camera, color: 'bg-indigo-500', onClick: () => openNewFlow('camera', 'WORKFLOW') },
          { id: 'upload', label: 'Soubor', desc: 'PŘÍLOHA K ANALÝZE', icon: Upload, color: 'bg-violet-500', onClick: () => openNewFlow('upload', 'WORKFLOW') },
          { id: 'text', label: 'Text', desc: 'DETAILNÍ INSTRUKCE', icon: FileText, color: 'bg-emerald-500', onClick: () => openNewFlow('text', 'WORKFLOW') },
          { id: 'analysis', label: 'AI Analýza', desc: 'DETAILNÍ ROZBOR DAT', icon: Sparkles, color: 'bg-indigo-600', onClick: () => openNewFlow('text', 'ANALYSIS') },
        ].map((tile) => (
          <button
            key={tile.id}
            onClick={tile.onClick}
            className={`group p-8 sm:p-12 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-6 hover:scale-[1.03] active:scale-95 ${isDarkMode ? 'bg-slate-900/50 border-white/5 hover:border-indigo-500/50 hover:bg-slate-900' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-xl shadow-slate-200/50'}`}
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl ${tile.color} flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:rotate-12`}>
              <tile.icon className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className={`text-xl sm:text-2xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tile.label}</div>
              <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{tile.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={() => openNewFlow('text', 'ANALYSIS')}
          className="flex items-center gap-4 px-12 py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95"
        >
          <Sparkles className="w-6 h-6" /> AI ANALÝZA
        </button>
      </div>
    </div>
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
        pendingTeamCount={pendingTeamTasksCount + pendingMyActionCount}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen relative z-10 bg-transparent overflow-y-auto no-scrollbar">
        <header className={`h-20 sm:h-24 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl border-b ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 rounded-xl lg:hidden bg-indigo-500/10 text-indigo-500"><Menu className="w-6 h-6" /></button>
            <div className="hidden sm:flex items-center gap-3">
               <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">S</div>
               <span className="font-black tracking-tight text-xl">DEK Snap</span>
            </div>
            <div className="hidden lg:flex flex-col justify-center border-l pl-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Dnes</div>
              <div className="text-xs font-black flex items-center gap-1"><Clock className="w-3 h-3" /> {now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => openNewFlow('text', 'WORKFLOW')} className="hidden sm:flex items-center justify-center px-6 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl transition-all group active:scale-95">
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
              <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Nový Snap</span>
            </button>
            <button onClick={() => openNewFlow('text', 'ANALYSIS')} className="hidden sm:flex items-center justify-center px-6 h-14 bg-violet-600 text-white rounded-2xl shadow-xl transition-all group active:scale-95">
              <Sparkles  className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" /> 
              <span className="ml-3 text-[10px] font-black uppercase tracking-widest">AI Analýza</span>
            </button>
            <div className="sm:hidden flex items-center gap-2">
              <button onClick={() => openNewFlow('text', 'WORKFLOW')} className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><PlusCircle className="w-6 h-6"/></button>
            </div>
            <button onClick={() => setIsScenariosOpen(true)} className="p-3 rounded-2xl bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all"><Lightbulb className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-12">
          {selectedFlowId ? (
            <FlowDetails 
              flow={flows.find(f => f.id === selectedFlowId)!} 
              onBack={() => setSelectedFlowId(null)}
              onToggleStatus={handleToggleSubStatus}
              onManualReply={(subId, text, verdict) => handleManualReply(selectedFlowId, subId, text, verdict)}
              teamMembers={teamMembers}
              isDarkMode={isDarkMode}
              currentUser={currentUser}
            />
          ) : activeTab === 'dashboard' ? (
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-12">
               {showStaleBanner && staleFlows.length > 0 && viewMode === 'mine' && (
                <StaleFlowsBanner staleFlows={staleFlows} onDismiss={() => setShowStaleBanner(false)} onSelectFlow={setSelectedFlowId} />
              )}
              
              <div className="flex flex-col gap-6 lg:gap-8">
                <div className="relative w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Hledat zakázky, PM nebo materiály..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-14 pr-6 h-14 sm:h-16 border rounded-3xl outline-none transition-all placeholder:text-slate-600 shadow-sm ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-white border-slate-200 text-slate-900 focus:bg-slate-50'}`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Layers className={`w-8 h-8 ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`} /> 
                    {viewMode === 'mine' ? 'Moje Snaps' : 'Týmové Snaps'}
                  </h2>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Přepínač MOJE / TÝM s notifikačními badge */}
                    <div className={`flex p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      <button 
                        onClick={() => setViewMode('mine')} 
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest relative ${viewMode === 'mine' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <UserIcon className="w-3.5 h-3.5" /> 
                        <span>MOJE</span>
                        {pendingMyActionCount > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-slate-950 shadow-lg">
                            {pendingMyActionCount}
                          </div>
                        )}
                      </button>
                      <button 
                        onClick={() => setViewMode('team')} 
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest relative ${viewMode === 'team' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <Users className="w-3.5 h-3.5" /> 
                        <span>TÝM</span>
                        {pendingTeamTasksCount > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-slate-950 shadow-lg">
                            {pendingTeamTasksCount}
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Stavové filtry */}
                    <div className={`flex p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      {(['to_action', 'active', 'archive'] as const).map((filter) => (
                        <button 
                          key={filter}
                          onClick={() => setDashboardFilter(filter)} 
                          className={`px-4 sm:px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${dashboardFilter === filter ? (isDarkMode ? 'bg-white text-slate-900 shadow-lg' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500 hover:text-white'}`}
                        >
                          {filter === 'to_action' ? 'K AKCI' : filter === 'active' ? 'AKTIVNÍ' : 'ARCHIV'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {filteredFlows.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 animate-in fade-in duration-700">
                  {filteredFlows.map(flow => (
                    <FlowCard key={flow.id} flow={flow} onClick={() => setSelectedFlowId(flow.id)} teamMembers={teamMembers} isDarkMode={isDarkMode} currentUser={currentUser} />
                  ))}
                </div>
              ) : (
                <DashboardEmptyState />
              )}
            </div>
          ) : activeTab === 'analyses' ? (
            <AIAnalysesArchive analyses={analyses} setAnalyses={setAnalyses} isDarkMode={isDarkMode} />
          ) : activeTab === 'ai-tips' ? (
            <AIPowerTips isDarkMode={isDarkMode} />
          ) : activeTab === 'team' ? (
            <TeamView teamMembers={teamMembers} setTeamMembers={setTeamMembers} isDarkMode={isDarkMode} />
          ) : activeTab === 'rules' ? (
            <RulesManager mappings={mappings} setMappings={setMappings} teamMembers={teamMembers} currentUser={currentUser} isDarkMode={isDarkMode} />
          ) : null}
        </div>
      </main>

      {isModalOpen && (
        <NewFlowModal 
          onClose={closeNewFlow}
          onSave={handleSaveFlow}
          onSaveAnalysis={(a) => setAnalyses([a, ...analyses])}
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
      {isScenariosOpen && <ScenariosModal onClose={() => setIsScenariosOpen(false)} onStartScenario={(t) => { setPrefilledDescription(t); setIsModalOpen(true); }} isDarkMode={isDarkMode} />}
    </div>
  );
};

export default App;
