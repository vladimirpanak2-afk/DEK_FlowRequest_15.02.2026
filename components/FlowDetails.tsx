
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Flow, User, Status } from '../types.ts';
import { 
  ArrowLeft, CheckCircle2, Clock, Calendar, Quote, ShieldCheck, 
  ListChecks, Mail, Send, MessageSquareText, Loader2, AtSign, 
  AlertTriangle, Eye, EyeOff, User as UserIcon, ChevronDown, 
  ChevronUp, Lock, UserCheck, Check, X as CloseIcon, ThumbsUp, ThumbsDown,
  XCircle, CheckCircle, Info, Archive, X, Sparkles, Lightbulb, Users
} from 'lucide-react';

interface FlowDetailsProps {
  flow: Flow;
  onBack: () => void;
  onToggleStatus: (subId: string) => void;
  onManualReply: (subId: string, replyText: string, directVerdict?: 'CONFIRMED' | 'REJECTED') => void | Promise<void>;
  teamMembers: User[];
  isDarkMode: boolean;
  currentUser: User;
}

const FlowDetails: React.FC<FlowDetailsProps> = ({ flow, onBack, onToggleStatus, onManualReply, teamMembers, isDarkMode, currentUser }) => {
  const [replyingTo, setReplyingTo] = useState<{ id: string, type: 'YES' | 'NO' | 'MSG' } | null>(null);
  const [manualReplyText, setManualReplyText] = useState('');
  const [isProcessingReply, setIsProcessingReply] = useState(false);
  const [expandedAiTips, setExpandedAiTips] = useState<Record<string, boolean>>({});

  const completedTasks = flow.subRequests.filter(s => s.status === 'DONE');
  const progress = flow.subRequests.length > 0 ? (completedTasks.length / flow.subRequests.length) * 100 : 0;
  
  const isFullyResolved = flow.subRequests.every(s => s.status === 'DONE');
  const hasRejections = flow.subRequests.some(s => s.replyVerdict === 'REJECTED');
  
  const creator = teamMembers.find(u => u.id === flow.creatorId);
  const isMine = currentUser.id === flow.creatorId;

  const toggleAiTip = (subId: string) => {
    setExpandedAiTips(prev => ({
      ...prev,
      [subId]: !prev[subId]
    }));
  };

  const sortedSubRequests = useMemo(() => {
    return [...flow.subRequests].sort((a, b) => {
      const aIsMine = a.assigneeId === currentUser.id;
      const bIsMine = b.assigneeId === currentUser.id;
      if (aIsMine && !bIsMine) return -1;
      if (!aIsMine && bIsMine) return 1;
      return 0;
    });
  }, [flow.subRequests, currentUser.id]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('cs-CZ');
  };

  const handleReplySubmit = async () => {
    if (!replyingTo) return;
    setIsProcessingReply(true);
    try {
      const verdict = replyingTo.type === 'YES' ? 'CONFIRMED' : replyingTo.type === 'NO' ? 'REJECTED' : undefined;
      const text = manualReplyText.trim() || (replyingTo.type === 'YES' ? 'Potvrzuji splnění úkolu.' : replyingTo.type === 'NO' ? 'Nemohu splnit tento úkol.' : '');
      
      await onManualReply(replyingTo.id, text, verdict);
      setReplyingTo(null);
      setManualReplyText('');
    } finally { setIsProcessingReply(false); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className={`group flex items-center gap-4 font-black text-xs uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${isDarkMode ? 'bg-white/5 border-white/5 group-hover:bg-white/10' : 'bg-white border-slate-200 group-hover:bg-indigo-50 shadow-sm'}`}>
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span>Zpět na přehled</span>
        </button>
      </div>

      <div className={`relative overflow-hidden rounded-[3rem] border-2 transition-all duration-700 shadow-2xl ${
        isFullyResolved 
          ? (hasRejections 
              ? (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300 shadow-slate-900/5')
              : (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200 shadow-emerald-500/5')
            )
          : (isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200 shadow-amber-500/5')
      }`}>
        <div className="p-8 sm:p-12 lg:p-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl ${
              isFullyResolved 
                ? (hasRejections ? 'bg-slate-700' : 'bg-emerald-500') 
                : 'bg-amber-500'
            }`}>
              {isFullyResolved 
                ? (hasRejections ? <Archive className="w-10 h-10 lg:w-12 lg:h-12 text-white" /> : <ShieldCheck className="w-10 h-10 lg:w-12 lg:h-12 text-white" />) 
                : <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
              }
            </div>
            
            <div className="flex-1 space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isFullyResolved 
                    ? (hasRejections ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200') 
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {isFullyResolved 
                    ? (hasRejections ? 'VYŘÍZENO (S VÝHRADOU)' : 'HOTOVO A PROVĚŘENO') 
                    : 'PROBÍHÁ ANALÝZA A DELEGACE'
                  }
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-1.5 rounded-full border ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5' : 'bg-white/50 text-slate-400 border-slate-200'}`}>
                  <CheckCircle2 className="w-4 h-4" /> {completedTasks.length}/{flow.subRequests.length} hotovo
                </div>
              </div>

              <div className="space-y-6">
                <h1 className={`text-2xl sm:text-4xl lg:text-6xl font-black leading-tight tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{flow.title}</h1>
                <div className={`p-8 lg:p-12 rounded-[2.5rem] border shadow-inner ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                   <div className="mb-4 text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500">Kontext a zadání flow:</div>
                   <p className={`text-xl lg:text-3xl font-bold leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{flow.description}</p>
                </div>
              </div>

              <div className={`flex flex-wrap items-center gap-y-6 gap-x-12 pt-8 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex items-center gap-4">
                  <img src={creator?.avatar} className="w-12 h-12 rounded-2xl border-2 border-white/10" />
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autor</div>
                    <div className={`text-sm font-black uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>{isMine ? 'Vy (Manažer)' : creator?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-sm"><Calendar className="w-6 h-6 text-slate-400" /></div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Datum založení</div>
                    <div className={`text-sm font-black uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>{formatDate(flow.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex lg:flex-col items-center lg:items-end gap-3 lg:gap-1">
              <div className={`text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-indigo-600'}`}>{Math.round(progress)}%</div>
              <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">STATUS</div>
            </div>
          </div>
        </div>
        
        <div className={`w-full h-3 ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`}>
          <div 
            className={`h-full transition-all duration-1000 ease-out ${isFullyResolved ? (hasRejections ? 'bg-slate-600' : 'bg-emerald-500') : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-8">
        <h2 className={`text-2xl font-black flex items-center gap-4 px-4 uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <ListChecks className="w-8 h-8 text-indigo-500 shrink-0" />
          Rozpad delegovaných úkolů
        </h2>

        <div className="grid grid-cols-1 gap-8">
          {sortedSubRequests.map((sub) => {
            const assignee = teamMembers.find(u => u.id === sub.assigneeId);
            const isDone = sub.status === 'DONE';
            const isReview = sub.status === 'NEEDS_REVIEW';
            const isMyTask = sub.assigneeId === currentUser.id;
            const isReplyingThis = replyingTo?.id === sub.id;
            const isAiExpanded = expandedAiTips[sub.id];

            const isNegative = sub.replyVerdict === 'REJECTED';
            const isPositive = sub.replyVerdict === 'CONFIRMED';

            return (
              <div key={sub.id} className={`rounded-[3rem] border-2 transition-all overflow-hidden ${
                isDone 
                  ? (isNegative 
                      ? (isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50 opacity-80') 
                      : (isDarkMode ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50')
                    )
                  : isReview 
                    ? (isNegative 
                      ? (isDarkMode ? 'border-red-500 bg-red-500/10 shadow-2xl' : 'border-red-400 bg-white shadow-xl ring-8 ring-red-500/5 border-l-8') 
                      : isPositive 
                        ? (isDarkMode ? 'border-emerald-500 bg-emerald-500/10 shadow-2xl' : 'border-emerald-400 bg-white shadow-xl ring-8 ring-emerald-500/5 border-l-8')
                        : (isDarkMode ? 'border-amber-500 bg-amber-500/10 shadow-2xl' : 'border-amber-400 bg-white shadow-xl ring-8 ring-amber-500/5'))
                    : (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm')
              }`}>
                {isReview && (
                  <div className={`${isNegative ? 'bg-red-600' : isPositive ? 'bg-emerald-600' : 'bg-amber-500'} text-white px-8 py-3 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest`}>
                    <div className="flex items-center gap-4">
                      {isNegative ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Info className="w-5 h-5" />}
                      {isNegative ? 'Řešitel nemůže úkol splnit' : isPositive ? 'Úkol splněn – prověřte a uzavřete' : 'Úkol čeká na schválení zadavatelem'}
                    </div>
                  </div>
                )}

                <div className="p-8 lg:p-16">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
                    <div className="flex-1 space-y-6 w-full">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest ${
                          isDone 
                            ? (isNegative ? 'bg-slate-700 text-slate-300' : 'bg-emerald-100 text-emerald-700') 
                            : (isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-100 text-slate-500')
                        }`}>
                          {sub.task_type}
                        </span>
                        {sub.isBroadcast && (
                          <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Hromadný úkol
                          </span>
                        )}
                      </div>
                      <h4 className={`text-2xl lg:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} ${isDone && isNegative ? 'text-slate-500' : ''}`}>{sub.title}</h4>
                      
                      {/* AI Doporučení - Collapsible Tip */}
                      {sub.description && (
                        <div className="space-y-4">
                          <button 
                            onClick={() => toggleAiTip(sub.id)}
                            className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                              isAiExpanded 
                                ? 'text-violet-500' 
                                : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700')
                            }`}
                          >
                            <Sparkles className={`w-4 h-4 transition-transform duration-500 ${isAiExpanded ? 'rotate-12 scale-125' : ''}`} />
                            {isAiExpanded ? 'Skrýt doporučení' : 'Zobrazit doporučený postup (AI)'}
                          </button>
                          
                          {isAiExpanded && (
                            <div className={`p-6 sm:p-8 rounded-[1.5rem] border-l-4 animate-in slide-in-from-top-2 duration-300 ${
                              isDarkMode 
                                ? 'bg-violet-500/5 border-violet-500/40 text-slate-300' 
                                : 'bg-violet-50/50 border-violet-200 text-slate-700'
                            }`}>
                              <div className="flex gap-4">
                                <Lightbulb className="w-6 h-6 text-violet-500 shrink-0" />
                                <p className="text-base sm:text-lg font-medium italic leading-relaxed">{sub.description}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row items-center gap-4 shrink-0">
                      {isMine && isReview && (
                        <button 
                          onClick={() => onToggleStatus(sub.id)} 
                          className={`h-16 px-10 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all ${
                            isNegative ? 'bg-slate-800' : 'bg-emerald-600'
                          }`}
                        >
                          {isNegative ? 'POTVRDIT ZAMÍTNUTÍ' : 'SCHVÁLIT A UZAVŘÍT'}
                        </button>
                      )}

                      {isMyTask && !isReview && !isDone && !isReplyingThis && (
                        <div className="flex items-center gap-4">
                           <button onClick={() => setReplyingTo({ id: sub.id, type: 'YES' })} className="h-16 px-8 flex items-center gap-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 hover:bg-emerald-700 transition-colors">
                             <ThumbsUp className="w-5 h-5" /> ANO
                           </button>
                           <button onClick={() => setReplyingTo({ id: sub.id, type: 'NO' })} className="h-16 px-8 flex items-center gap-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 hover:bg-red-700 transition-colors">
                             <ThumbsDown className="w-5 h-5" /> NE
                           </button>
                           <button onClick={() => setReplyingTo({ id: sub.id, type: 'MSG' })} className={`h-16 w-16 flex items-center justify-center rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                             <MessageSquareText className="w-6 h-6" />
                           </button>
                        </div>
                      )}

                      {isMine && isDone && (
                        <div className={`h-16 w-16 flex items-center justify-center rounded-2xl text-white shadow-xl ${isNegative ? 'bg-slate-700' : 'bg-emerald-500'}`}>
                          {isNegative ? <X className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {isReplyingThis && (
                    <div className="mt-12 p-8 lg:p-12 rounded-[2.5rem] bg-indigo-500/5 border-2 border-indigo-500/20 animate-in zoom-in duration-300">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6">Vaše vyjádření pro zadavatele:</div>
                      <textarea 
                        autoFocus 
                        value={manualReplyText} 
                        onChange={(e) => {
                          setManualReplyText(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }} 
                        className={`w-full p-0 bg-transparent text-2xl lg:text-3xl font-black outline-none resize-none overflow-hidden placeholder:text-slate-300 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} 
                        placeholder="Napište vzkaz..."
                        rows={1}
                      />
                      <div className="flex justify-end gap-6 mt-12 pt-8 border-t border-indigo-500/10">
                        <button onClick={() => { setReplyingTo(null); setManualReplyText(''); }} className="px-8 font-black uppercase tracking-widest text-[11px] text-slate-400">Zrušit</button>
                        <button 
                          disabled={isProcessingReply} 
                          onClick={handleReplySubmit} 
                          className="h-16 px-12 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-4 hover:bg-indigo-700 transition-colors active:scale-95"
                        >
                          {isProcessingReply ? <Loader2 className="animate-spin" /> : <Send />} ODESLAT ODPOVĚĎ
                        </button>
                      </div>
                    </div>
                  )}

                  {sub.replySummary && (
                    <div className={`mt-12 rounded-[2.5rem] p-8 lg:p-12 border flex gap-8 transition-all shadow-inner ${
                      isNegative 
                        ? (isDarkMode ? 'bg-red-500/10 border-red-500/20 shadow-red-500/5' : 'bg-red-50 border-red-100')
                        : isReview 
                          ? (isDarkMode ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-100') 
                          : (isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100')
                    }`}>
                      {isNegative ? (
                        <XCircle className="w-12 h-12 shrink-0 text-red-500" />
                      ) : isPositive ? (
                        <CheckCircle className="w-12 h-12 shrink-0 text-emerald-500" />
                      ) : (
                        <Quote className={`w-12 h-12 shrink-0 ${isReview ? 'text-amber-400' : 'text-emerald-400'}`} />
                      )}
                      <div className="space-y-3">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${isNegative ? 'text-red-600' : isReview ? 'text-amber-600' : 'text-emerald-600'}`}>Souhrn odpovědi:</div>
                        <p className={`text-xl lg:text-3xl font-bold italic leading-relaxed ${isNegative ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-slate-700'}`}>{sub.replySummary}</p>
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between pt-12 mt-12 border-t gap-8 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-5">
                      <img src={assignee?.avatar} alt={assignee?.name} className="w-16 h-16 rounded-2xl border-2 border-white/10 shadow-sm shrink-0" />
                      <div>
                        <div className={`text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{assignee?.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{assignee?.role}</div>
                      </div>
                    </div>
                    <div className={`text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 px-6 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <Calendar className="w-5 h-5" /> Termín: {formatDate(sub.dueDate)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlowDetails;
