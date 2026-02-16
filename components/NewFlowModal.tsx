
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Trash2, Mic, MicOff, MailCheck, Camera, Upload, ChevronDown, UserCheck, Users, Clock, Zap, AlertTriangle, FileImage, Check, Image as ImageIcon, Search, User, UserPlus, Users2, Plus, FileSearch, ListChecks, Copy, History, AtSign, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import { analyzeTaskBreakdown, analyzeDocumentVision, performPureAnalysis } from '../services/geminiService.ts';
// Fixed casing for EmailService import to match PascalCase standard
import { processTaskEmailAutomation } from '../services/EmailService.ts';
import { Flow, SubRequest, RoleMapping, User as UserType, Status, SavedAnalysis } from '../types.ts';
import TermButton from './TermButton.tsx';

interface NewFlowModalProps {
  onClose: () => void;
  onSave: (flow: Flow) => void;
  onSaveAnalysis?: (analysis: SavedAnalysis) => void;
  mappings: RoleMapping[];
  setMappings: React.Dispatch<React.SetStateAction<RoleMapping[]>>;
  initialDescription?: string;
  initialMode?: 'voice' | 'camera' | 'text' | 'upload';
  initialModalMode?: 'WORKFLOW' | 'ANALYSIS';
  teamMembers: UserType[];
  setTeamMembers: React.Dispatch<React.SetStateAction<UserType[]>>;
  currentUser: UserType;
  isDarkMode: boolean;
}

const NewFlowModal: React.FC<NewFlowModalProps> = ({ 
  onClose, onSave, onSaveAnalysis, mappings, setMappings, initialDescription = '', 
  initialMode, initialModalMode = 'WORKFLOW', teamMembers, setTeamMembers, currentUser, isDarkMode 
}) => {
  const getDeadlineDate = (urgency: 'NORMAL' | 'URGENT') => {
    const date = new Date();
    const daysToAdd = urgency === 'URGENT' ? 2 : 7;
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString();
  };

  const [description, setDescription] = useState(initialDescription);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [subTasks, setSubTasks] = useState<Partial<SubRequest>[]>([]);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'CUSTOM'>('NORMAL');
  const [globalDeadline, setGlobalDeadline] = useState(getDeadlineDate('NORMAL'));
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  
  const [modalMode, setModalMode] = useState<'WORKFLOW' | 'ANALYSIS'>(initialModalMode);
  const [pureAnalysisResult, setPureAnalysisResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight(mainTextareaRef.current);
  }, [description, interimTranscript]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => console.error("Video play failed:", err));
    }
  }, [isCameraActive]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'cs-CZ';
      recognitionRef.current.onresult = (event: any) => {
        let final = '', interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        if (final) {
          setDescription(prev => (prev.length > 0 && !prev.endsWith(' ') ? prev + ' ' : prev) + final);
          setInterimTranscript('');
        } else setInterimTranscript(interim);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => { setIsListening(false); setInterimTranscript(''); };
    }

    if (initialMode === 'voice') setTimeout(() => toggleListening(), 500);
    else if (initialMode === 'camera') setTimeout(() => startCamera(), 500);
    else if (initialMode === 'upload') setTimeout(() => fileInputRef.current?.click(), 500);

    return () => { if (recognitionRef.current) recognitionRef.current.stop(); stopCamera(); };
  }, [initialMode]);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setIsListening(true); try { recognitionRef.current?.start(); } catch { setIsListening(false); } }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream; setIsCameraActive(true);
    } catch { alert("Chyba fotoaparátu."); }
  };
  const stopCamera = () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setIsCameraActive(false); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTaskManually = () => {
    const mainContent = (description + interimTranscript).trim();
    const suggestedTitle = mainContent ? (mainContent.split(/[.!?\n]/)[0].substring(0, 60)) : '';
    const suggestedDesc = mainContent || '';

    const newTask: Partial<SubRequest> = {
      id: `manual-${Date.now()}`,
      title: suggestedTitle,
      description: suggestedDesc,
      task_type: 'MANUÁLNÍ',
      assigned_role_key: '',
      isBroadcast: false,
      status: 'PENDING' as Status,
      dueDate: globalDeadline,
      assigneeId: ''
    };
    
    if (!title && suggestedTitle) setTitle(suggestedTitle);
    else if (!title) setTitle('Nová zakázka');

    setSubTasks(prev => [...prev, newTask]);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  };

  const handleAIAnalyze = async () => {
    if (!description.trim() && !selectedImage && !interimTranscript) return;
    setIsAnalyzing(true);
    setIsSaved(false);
    try {
      const finalDesc = (description + interimTranscript).trim();
      if (modalMode === 'ANALYSIS') {
        const imageParam = selectedImage ? { data: selectedImage, mimeType: imageMimeType } : undefined;
        const result = await performPureAnalysis(finalDesc, imageParam);
        setPureAnalysisResult(result);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      } else {
        const result = selectedImage 
          ? await analyzeDocumentVision(selectedImage, imageMimeType, mappings, currentUser, priority === 'CUSTOM' ? 'NORMAL' : priority, finalDesc)
          : await analyzeTaskBreakdown(finalDesc, mappings, currentUser, priority === 'CUSTOM' ? 'NORMAL' : priority);
        
        if (!title) setTitle(result.title);
        
        const newAISubTasks: Partial<SubRequest>[] = result.suggestedSubTasks.map((st, idx) => ({
          id: `ai-${idx}-${Date.now()}`,
          title: st.title,
          description: st.description,
          task_type: st.task_type,
          assigned_role_key: st.estimatedRoleKey,
          isBroadcast: st.targetScope === 'ROLE_ALL',
          status: 'PENDING' as Status,
          dueDate: globalDeadline, 
          assigneeId: st.targetScope === 'ROLE_ALL' 
            ? `ROLE_${st.estimatedRoleKey}` 
            : teamMembers.find(m => m.role_key === st.estimatedRoleKey)?.id || ''
        }));
        setSubTasks(prev => [...prev, ...newAISubTasks]);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
      }
    } finally { setIsAnalyzing(false); }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current; const canvas = canvasRef.current;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setSelectedImage(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        setImageMimeType('image/jpeg'); stopCamera();
      }
    }
  };

  const handleCopyResult = () => {
    if (pureAnalysisResult) {
      navigator.clipboard.writeText(pureAnalysisResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSaveToHistory = () => {
    if (pureAnalysisResult && onSaveAnalysis) {
      const analysis: SavedAnalysis = {
        id: `sa-${Date.now()}`,
        title: description.split('\n')[0].substring(0, 50) || 'AI Analýza dokumentu',
        content: pureAnalysisResult,
        createdAt: new Date().toISOString(),
        imagePreview: selectedImage || undefined,
        mimeType: imageMimeType || undefined
      };
      onSaveAnalysis(analysis);
      setIsSaved(true);
    }
  };

  const handleSave = async () => {
    if (!title) { alert("Prosím zadejte název zakázky."); return; }
    if (subTasks.some(t => !t.title || !t.assigneeId)) { alert("Prosím vyplňte názvy a řešitele u všech úkolů."); return; }
    setIsSending(true);
    const flowId = `f-${Date.now()}`;
    const finalTasks: SubRequest[] = [];
    
    // Create the final flow context once
    const tempFlowContext: Flow = { 
      id: flowId, 
      title, 
      description, 
      creatorId: currentUser.id, 
      createdAt: new Date().toISOString(), 
      tags: [priority === 'URGENT' ? 'Spěchá' : 'Normální'], 
      subRequests: [], 
      status: 'ACTIVE' 
    };

    const expandedTasks: SubRequest[] = [];
    
    // Phase 1: Expand broadcasts into individual tasks
    for (let i = 0; i < subTasks.length; i++) {
      const st = subTasks[i];
      if (st.isBroadcast) {
        const isGeneric = !st.assigned_role_key?.includes('_');
        const usersInRole = teamMembers.filter(u => 
          isGeneric 
            ? u.role_key.startsWith(st.assigned_role_key!) 
            : u.role_key === st.assigned_role_key
        );

        for (const user of usersInRole) {
          expandedTasks.push({ 
            ...st, 
            id: `t-bc-${user.id}-${i}-${Date.now()}`, 
            assigneeId: user.id,
            status: 'PENDING'
          } as SubRequest);
        }
      } else {
        expandedTasks.push({ ...st, id: `t-${i}-${Date.now()}`, status: 'PENDING' } as SubRequest);
      }
    }

    // Phase 2: Send and record each task
    for (let i = 0; i < expandedTasks.length; i++) {
      const task = expandedTasks[i];
      try {
        await processTaskEmailAutomation(task, tempFlowContext, teamMembers);
        finalTasks.push({ ...task, status: 'SENT' });
      } catch (e) {
        console.error("Failed to send task email:", e);
        finalTasks.push({ ...task, status: 'BLOCKED' });
      }
      setSendProgress(((i + 1) / expandedTasks.length) * 100);
    }
    
    onSave({ ...tempFlowContext, subRequests: finalTasks });
  };

  const AssigneePicker = ({ task, index }: { task: Partial<SubRequest>, index: number }) => {
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('');
    
    const isOpen = openPickerId === task.id;
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          setOpenPickerId(null);
          setIsCreatingNew(false);
        }
      };
      if (isOpen) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (val: string, isBC: boolean, roleKey: string) => {
      const n = [...subTasks];
      n[index].assigneeId = val;
      n[index].isBroadcast = isBC;
      n[index].assigned_role_key = roleKey;
      setSubTasks(n);
      setOpenPickerId(null);
      setIsCreatingNew(false);
    };

    const handleCreateNewMember = () => {
      if (!newUserName || !newUserEmail || !newUserRole) {
        alert("Prosím vyplňte všechna pole pro nového člena.");
        return;
      }
      
      const roleKey = newUserRole.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
      const newUserId = `u-new-${Date.now()}`;
      
      const newUser: UserType = {
        id: newUserId,
        name: newUserName,
        email: newUserEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newUserName)}`,
        role: newUserRole,
        role_key: roleKey,
        isAdmin: false
      };

      setTeamMembers(prev => [...prev, newUser]);

      if (!mappings.find(m => m.role === newUserRole)) {
        setMappings(prev => [...prev, {
          id: `m-new-${Date.now()}`,
          role: newUserRole,
          groups: [{ name: 'Nová oblast', keywords: [] }]
        }]);
      }

      handleSelect(newUserId, false, roleKey);
    };

    const selectedUser = teamMembers.find(m => m.id === task.assigneeId);
    const getAssigneeLabel = () => {
      if (task.isBroadcast) {
        if (task.assigned_role_key === 'OBCHODNIK') return 'VŠICHNI OBCHODNÍCI';
        if (task.assigned_role_key === 'PM') return 'VŠICHNI PM';
        return `VŠICHNI: ${teamMembers.find(t => t.role_key === task.assigned_role_key)?.role || task.assigned_role_key}`;
      }
      return selectedUser ? `${selectedUser.name} (${selectedUser.role})` : 'Vybrat řešitele';
    };

    return (
      <div className="relative w-full lg:w-72" ref={pickerRef}>
        <button onClick={() => setOpenPickerId(isOpen ? null : (task.id || null))} className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 border-white/5 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}>
          <div className="flex items-center gap-2 truncate">
            {task.isBroadcast ? <Users className="w-4 h-4 text-amber-500 shrink-0" /> : <User className="w-4 h-4 text-indigo-500 shrink-0" />}
            <span className="truncate">{getAssigneeLabel()}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className={`absolute bottom-full mb-2 left-0 right-0 z-[100] rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
            {!isCreatingNew ? (
              <>
                <div className={`p-3 border-b flex items-center gap-2 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <button onClick={() => setShowBroadcast(false)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!showBroadcast ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Kolegové</button>
                  <button onClick={() => setShowBroadcast(true)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${showBroadcast ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Hromadné</button>
                </div>
                <div className="p-1.5 max-h-80 overflow-y-auto custom-scrollbar">
                  {!showBroadcast ? (
                    <>
                      {teamMembers.map(m => (
                        <button key={m.id} onClick={() => handleSelect(m.id, false, m.role_key)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${task.assigneeId === m.id ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700') : (isDarkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700')}`}>
                          <img src={m.avatar} className="w-8 h-8 rounded-lg border border-white/10" alt="" />
                          <div className="min-w-0"><div className="text-[11px] font-black uppercase truncate">{m.name}</div><div className="text-[9px] text-slate-500 font-bold uppercase truncate">{m.role}</div></div>
                        </button>
                      ))}
                      <button onClick={() => setIsCreatingNew(true)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border border-dashed mt-2 transition-all ${isDarkMode ? 'border-indigo-500/30 text-indigo-400 hover:bg-white/5' : 'border-indigo-200 text-indigo-600 hover:bg-slate-50'}`}>
                        <Plus className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nový řešitel</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-2 space-y-1">
                        <button onClick={() => handleSelect('ROLE_ALL_OBCHODNIK', true, 'OBCHODNIK')} className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20`}>
                          <Users2 className="w-6 h-6" />
                          <div><div className="text-[10px] font-black uppercase tracking-widest">Všichni obchodníci</div><div className="text-[9px] font-bold">Celoplošně (Zdivo, SDK, Fasády...)</div></div>
                        </button>
                        <button onClick={() => handleSelect('ROLE_ALL_PM', true, 'PM')} className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all bg-violet-500/10 text-violet-500 border border-violet-500/20 hover:bg-violet-500/20`}>
                          <Sparkles className="w-6 h-6" />
                          <div><div className="text-[10px] font-black uppercase tracking-widest">Všichni PM</div><div className="text-[9px] font-bold">Celoplošně (Všichni produktoví)</div></div>
                        </button>
                      </div>
                      <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />
                      {Array.from(new Set(teamMembers.map(m => m.role_key))).map((rk: string) => {
                        const roleName = teamMembers.find(t => t.role_key === rk)?.role;
                        const isSelected = task.isBroadcast && task.assigned_role_key === rk;
                        return (
                          <button key={rk} onClick={() => handleSelect(`ROLE_${rk}`, true, rk)} className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${isSelected ? (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700') : (isDarkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700')}`}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500 text-white shadow-lg shadow-amber-500/20"><Users2 className="w-5 h-5" /></div>
                            <div><div className="text-[10px] font-black uppercase tracking-widest">Všichni: {roleName}</div><div className="text-[9px] text-slate-500 font-bold uppercase">Hromadná distribuce</div></div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="p-5 space-y-4 animate-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Nový člen týmu</span>
                  <button onClick={() => setIsCreatingNew(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Celé jméno" className={`w-full pl-9 pr-4 py-2 text-[11px] font-bold rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-slate-50 border-slate-200'}`} />
                  </div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="E-mail" className={`w-full pl-9 pr-4 py-2 text-[11px] font-bold rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-slate-50 border-slate-200'}`} />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input value={newUserRole} onChange={e => setNewUserRole(e.target.value)} placeholder="Pracovní pozice" className={`w-full pl-9 pr-4 py-2 text-[11px] font-bold rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-slate-50 border-slate-200'}`} />
                  </div>
                </div>
                <button onClick={handleCreateNewMember} className="w-full h-10 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 mt-2">PŘIDAT A ZVOLIT</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleGlobalDeadlineChange = (iso?: string) => {
    if (iso) {
      setGlobalDeadline(iso);
      setPriority('CUSTOM');
    } else {
      setPriority('NORMAL');
      setGlobalDeadline(getDeadlineDate('NORMAL'));
    }
  };

  const handleSubTaskDeadlineChange = (index: number, iso?: string) => {
    const n = [...subTasks];
    n[index].dueDate = iso || globalDeadline;
    setSubTasks(n);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 animate-in fade-in duration-300 overflow-hidden">
      <div className={`flex-1 flex flex-col w-full relative h-full ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        {isSending && (
          <div className={`fixed inset-0 z-[110] flex flex-col items-center justify-center p-8 text-center bg-slate-900/95`}>
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">Probíhá distribuce Snapu...</h3>
            <div className="w-full max-w-sm h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner"><div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${sendProgress}%` }} /></div>
          </div>
        )}

        <header className={`px-4 sm:px-6 h-16 lg:h-24 lg:px-12 border-b flex justify-between items-center sticky top-0 z-20 shrink-0 ${isDarkMode ? 'bg-slate-900/90 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-100 backdrop-blur-xl'}`}>
          <div className="flex items-center gap-6">
            <h2 className="text-lg sm:text-xl lg:text-3xl font-black tracking-tighter uppercase whitespace-nowrap">{modalMode === 'WORKFLOW' ? `Nový Snap` : `AI Analýza`}</h2>
            <div className={`hidden sm:flex p-1.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 shadow-sm'}`}>
              <button onClick={() => setModalMode('WORKFLOW')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalMode === 'WORKFLOW' ? 'bg-indigo-600 text-white shadow-xl scale-105 z-10' : (isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')}`}>Workflow</button>
              <button onClick={() => setModalMode('ANALYSIS')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalMode === 'ANALYSIS' ? 'bg-violet-600 text-white shadow-xl scale-105 z-10' : (isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')}`}>Analýza</button>
            </div>
          </div>
          <button onClick={onClose} className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-50'}`}><X className="w-8 h-8 text-slate-400" /></button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 space-y-10 lg:space-y-14">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vstupní zadání (AI Snap Asistent)</label>
                <div className="flex flex-wrap items-center gap-4">
                  {modalMode === 'WORKFLOW' && (
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 border p-1 rounded-2xl transition-all ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-white shadow-sm'}`}>
                        <button 
                          onClick={() => { setPriority('NORMAL'); setGlobalDeadline(getDeadlineDate('NORMAL')); }} 
                          className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${priority === 'NORMAL' ? 'bg-indigo-600 text-white shadow-md' : (isDarkMode ? 'text-slate-500 hover:text-indigo-400 hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50')}`}
                        >
                          Normální
                        </button>
                        <button 
                          onClick={() => { setPriority('URGENT'); setGlobalDeadline(getDeadlineDate('URGENT')); }} 
                          className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${priority === 'URGENT' ? 'bg-red-600 text-white shadow-md' : (isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50')}`}
                        >
                          Spěchá
                        </button>
                      </div>

                      <TermButton 
                        valueISO={priority === 'CUSTOM' ? globalDeadline : undefined}
                        onChangeISO={handleGlobalDeadlineChange}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleListening} className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : (isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:bg-indigo-500/10' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}><Mic className="w-5 h-5" /></button>
                    <button onClick={startCamera} className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all ${isCameraActive ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:bg-indigo-500/10' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}><Camera className="w-5 h-5" /></button>
                    <button onClick={() => fileInputRef.current?.click()} className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:bg-indigo-500/10' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}><Upload className="w-5 h-5" /></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                </div>
              </div>

              {isCameraActive && (
                <div className="w-full max-w-3xl mx-auto aspect-video relative rounded-3xl overflow-hidden border-4 border-indigo-500 shadow-2xl bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-6"><button onClick={capturePhoto} className="flex-1 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl py-4 flex items-center justify-center gap-2"><Camera className="w-5 h-5" /> SNÍMEK</button><button onClick={stopCamera} className="px-6 bg-slate-900/80 text-white rounded-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md">ZAVŘÍT</button></div>
                </div>
              )}

              <div className={`relative rounded-[2.5rem] border-2 transition-all ${isDarkMode ? 'bg-white/5 border-white/5 shadow-2xl shadow-indigo-500/5' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1">
                    <textarea ref={mainTextareaRef} value={description + interimTranscript} onChange={(e) => setDescription(e.target.value)} placeholder={modalMode === 'WORKFLOW' ? `Máme rozdělanou tu školu v Berouně...` : `Vyfoť, nahrej, nadiktuj. Řekni co chceš a zbytek už udělá DEK Snap...`} className="w-full p-8 lg:p-12 bg-transparent border-none outline-none text-xl sm:text-2xl font-semibold resize-none leading-tight overflow-hidden" />
                  </div>
                  {selectedImage && (
                    <div className="lg:w-80 p-8 border-t lg:border-t-0 lg:border-l flex flex-col items-center justify-center bg-black/5 dark:bg-white/5">
                      <div className="relative group w-full aspect-square"><img src={`data:${imageMimeType};base64,${selectedImage}`} alt="Příloha" className="w-full h-full object-cover rounded-3xl shadow-2xl" /><button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 h-10 w-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button></div>
                    </div>
                  )}
                </div>
                <div className="p-4 lg:p-8 flex flex-col sm:flex-row items-center gap-4 bg-indigo-500/5 rounded-b-[2.3rem]">
                  <div className="flex-1" />
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {modalMode === 'WORKFLOW' && (
                      <button onClick={handleAddTaskManually} className={`flex-1 sm:flex-none h-14 px-8 flex items-center justify-center gap-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${isDarkMode ? 'bg-slate-800 border-white/20 text-slate-200 hover:bg-slate-700 hover:border-white/30' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm'}`}><Plus className="w-5 h-5" /> Přidat úkol</button>
                    )}
                    <button onClick={handleAIAnalyze} disabled={isAnalyzing || (!description.trim() && !selectedImage)} className={`flex-[2] sm:flex-none h-14 px-10 flex items-center justify-center gap-3 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 ${modalMode === 'WORKFLOW' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/30' : 'bg-violet-600 shadow-xl shadow-violet-600/30'}`}>{isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 fill-current" />}{isAnalyzing ? 'Pracuji...' : (modalMode === 'WORKFLOW' ? 'Vytvořit Snap' : 'AI Analýza')}</button>
                  </div>
                </div>
              </div>
            </div>

            <section ref={resultsRef} className="space-y-12 pb-48 animate-in slide-in-from-bottom-8 duration-700">
              {modalMode === 'ANALYSIS' && pureAnalysisResult && (
                <div className={`p-8 lg:p-16 rounded-[3rem] border-2 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-violet-500/20 shadow-2xl shadow-indigo-500/5' : 'bg-white border-violet-100 shadow-2xl'}`}>
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Zap className="w-48 h-48 text-violet-500" /></div>
                   <div className="flex items-center gap-6 mb-12"><div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl"><Sparkles className="w-7 h-7" /></div><h3 className="text-3xl font-black tracking-tighter uppercase">Výsledek AI Snap Analýzy</h3></div>
                   <div className={`prose prose-lg max-w-none font-medium leading-relaxed whitespace-pre-wrap mb-12 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{pureAnalysisResult}</div>
                   <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-white/5"><button onClick={handleSaveToHistory} disabled={isSaved} className={`h-14 px-8 rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 transition-all ${isSaved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>{isSaved ? <Check /> : <History />} {isSaved ? 'Uloženo' : 'Uložit'}</button><button onClick={handleCopyResult} className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 shadow-xl transition-all active:scale-95">{isCopied ? <Check /> : <Check />} {isCopied ? 'Zkopírováno' : 'Kopírovat'}</button></div>
                </div>
              )}

              {modalMode === 'WORKFLOW' && subTasks.length > 0 && (
                <div className="space-y-12">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Název projektu / Zakázky</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Např. Rezidence Vltava..." className={`w-full p-4 bg-transparent border-b-4 font-black text-2xl sm:text-4xl lg:text-6xl outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 ${isDarkMode ? 'text-white border-white/5 focus:border-indigo-500/50' : 'text-slate-900 border-slate-100 focus:border-indigo-600'}`} /></div>
                  <div className="grid grid-cols-1 gap-8">
                    {subTasks.map((task, idx) => (
                      <div key={task.id} className={`p-6 lg:p-12 rounded-[3rem] border-2 flex flex-col lg:flex-row gap-10 items-start transition-all hover:shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                        <div className="flex-1 space-y-6 w-full"><input placeholder="Název úkolu..." value={task.title || ''} onChange={(e) => { const n = [...subTasks]; n[idx].title = e.target.value; setSubTasks(n); }} className={`w-full bg-transparent border-b-2 py-2 font-black text-xl lg:text-2xl outline-none transition-all ${isDarkMode ? 'border-white/10 focus:border-indigo-500' : 'border-slate-200 focus:border-indigo-600'}`} /><textarea placeholder="Instrukce..." value={task.description || ''} onChange={(e) => { const n = [...subTasks]; n[idx].description = e.target.value; setSubTasks(n); adjustTextareaHeight(e.target); }} onFocus={(e) => adjustTextareaHeight(e.target)} className="w-full bg-transparent border-none p-0 text-xl font-medium outline-none resize-none overflow-hidden leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700" rows={1} /></div>
                        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 w-full lg:w-80 shrink-0">
                          <AssigneePicker task={task} index={idx} />
                          <div className="flex items-center gap-2 w-full lg:w-auto">
                            <TermButton 
                              valueISO={task.dueDate}
                              onChangeISO={(iso) => handleSubTaskDeadlineChange(idx, iso)}
                              isDarkMode={isDarkMode}
                              className="flex-1 lg:flex-none"
                            />
                            <button onClick={() => setSubTasks(subTasks.filter((_, i) => i !== idx))} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm shrink-0"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        <footer className={`p-8 lg:px-12 border-t flex flex-col sm:flex-row justify-between items-center gap-6 sticky bottom-0 z-30 shrink-0 ${isDarkMode ? 'bg-slate-950/95 backdrop-blur-md border-white/5 shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)]' : 'bg-white/95 backdrop-blur-md border-slate-100 shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.08)]'}`}>
          <button onClick={onClose} className="hidden sm:block h-14 px-12 font-black uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-900 transition-colors">Zahodit a zrušit</button>
          {modalMode === 'WORKFLOW' && subTasks.length > 0 && (
            <button disabled={!title || isSending} onClick={handleSave} className="w-full sm:w-auto h-16 px-16 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-6 text-sm uppercase tracking-[0.2em] active:scale-95 disabled:opacity-30">ROZESLAT SNAP ÚKOLY <MailCheck className="w-7 h-7" /></button>
          )}
        </footer>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default NewFlowModal;
