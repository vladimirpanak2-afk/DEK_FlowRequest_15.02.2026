
import React, { useState, useMemo } from 'react';
import { Mail, X, AlertCircle, CheckCircle2, Loader2, ArrowRight, ChevronDown } from 'lucide-react';
import { Flow, User } from '../types.ts';

interface InboundMailSimulatorProps {
  onClose: () => void;
  onReceiveReply: (projectId: string, senderEmail: string, replyText: string) => void | Promise<void>;
  flows: Flow[];
  teamMembers: User[];
  isDarkMode: boolean; // Added missing prop
}

const InboundMailSimulator: React.FC<InboundMailSimulatorProps> = ({ onClose, onReceiveReply, flows, teamMembers, isDarkMode }) => {
  const [projectId, setProjectId] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const eligibleSenders = useMemo(() => {
    if (!projectId) return [];
    const selectedFlow = flows.find(f => f.id === projectId);
    if (!selectedFlow) return [];
    const assigneeIds = new Set(selectedFlow.subRequests.map(s => s.assigneeId));
    return teamMembers.filter(m => assigneeIds.has(m.id));
  }, [projectId, flows, teamMembers]);

  const handleSimulate = async () => {
    if (!projectId || !senderEmail || !emailBody) return;
    setIsProcessing(true);
    try {
      await onReceiveReply(projectId.trim(), senderEmail.trim(), emailBody);
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (error) { setStatus('error'); } finally { setIsProcessing(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 lg:p-4 animate-in fade-in duration-300">
      <div className={`w-full h-full lg:h-auto lg:max-w-xl lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className={`px-4 sm:px-6 h-16 lg:h-24 lg:px-10 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-600 rounded-xl text-white shadow-lg flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight">Simulátor e-mailu</h2>
            </div>
          </div>
          <button onClick={onClose} className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shrink-0 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-200'}`}>
            <X className={`w-7 h-7 sm:w-8 sm:h-8 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">
          {status === 'success' ? (
            <div className="text-center py-10 lg:py-12 animate-in fade-in zoom-in duration-500">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                <CheckCircle2 className="w-10 h-10 sm:w-14 sm:h-14" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2">Příjem potvrzen</h3>
              <p className="text-slate-500 font-medium text-sm">Požadavek byl předán k analýze do fronty.</p>
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vyberte projekt</label>
                <div className="relative">
                  <select value={projectId} onChange={(e) => { setProjectId(e.target.value); setSenderEmail(''); }} className={`w-full h-12 px-4 border rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none pr-10 ${isDarkMode ? 'bg-slate-800 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="">-- Vyberte zakázku --</option>
                    {flows.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className={`space-y-2 transition-opacity ${!projectId ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Odesílatel (Simulovaný kolega)</label>
                <div className="relative">
                  <select value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className={`w-full h-12 px-4 border rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none pr-10 ${isDarkMode ? 'bg-slate-800 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="">-- Vyberte kolegu --</option>
                    {eligibleSenders.map(u => <option key={u.id} value={u.email}>{u.name} ({u.role})</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className={`space-y-2 transition-opacity ${!senderEmail ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Text odpovědi</label>
                <textarea 
                  placeholder="Např.: Ahoj, slevu jsem prověřil a je to v pořádku." 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  className={`w-full p-4 sm:p-5 h-32 sm:h-40 border rounded-[1.25rem] sm:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-medium resize-none placeholder:text-slate-300 ${isDarkMode ? 'bg-slate-800 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                />
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-600 text-[10px] sm:text-xs font-black rounded-xl border border-red-100 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" /> Došlo k chybě při simulaci. Zkuste to znovu.
                </div>
              )}

              <button 
                disabled={isProcessing || !projectId || !senderEmail || !emailBody} 
                onClick={handleSimulate} 
                className="w-full h-12 sm:h-14 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-30 active:scale-95"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <>ODESLAT DO ANALÝZY <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboundMailSimulator;
