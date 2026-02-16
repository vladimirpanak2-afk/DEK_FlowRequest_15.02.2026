
import React from 'react';
import { Flow, User, Status } from '../types.ts';
import { Calendar, CheckCircle2, ShieldCheck, ShieldAlert, AlertCircle, ChevronRight, BarChart, Check, Archive, X } from 'lucide-react';

interface FlowCardProps {
  flow: Flow;
  onClick: (flow: Flow) => void;
  teamMembers: User[];
  isDarkMode: boolean; 
  currentUser: User;
}

const FlowCard: React.FC<FlowCardProps> = ({ flow, onClick, teamMembers, isDarkMode, currentUser }) => {
  const total = flow.subRequests.length;
  const completed = flow.subRequests.filter(s => s.status === 'DONE').length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const isFullyResolved = flow.status === 'COMPLETED';
  const hasRejections = flow.subRequests.some(s => s.replyVerdict === 'REJECTED');
  
  const createdAtDate = new Date(flow.createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60);
  const isStale = diffInHours >= 48 && !isFullyResolved;

  const creator = teamMembers.find(u => u.id === flow.creatorId);

  const getStatusDotColor = (status: Status, verdict?: string) => {
    if (status === 'DONE') {
      return verdict === 'REJECTED' ? 'bg-slate-600' : 'bg-emerald-500';
    }
    switch(status) {
      case 'NEEDS_REVIEW': return 'bg-amber-500';
      case 'BLOCKED': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div 
      onClick={() => onClick(flow)}
      className={`group relative backdrop-blur-xl rounded-[2rem] border p-6 lg:p-4 shadow-xl transition-all duration-300 cursor-pointer flex flex-col lg:flex-row lg:items-center hover:scale-[1.01] ${
        isDarkMode 
          ? `bg-white/5 hover:bg-white/10 ${isStale ? 'border-red-500/30' : 'border-white/5 hover:border-white/20'}` 
          : `bg-white hover:bg-slate-50 ${isStale ? 'border-red-200' : 'border-slate-100 hover:border-indigo-200'}`
      }`}
    >
      {/* Glow Effect */}
      <div className={`lg:hidden absolute -top-10 -right-10 w-40 h-40 blur-[80px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 ${
        isStale ? 'bg-red-600/10' : isFullyResolved ? 'bg-emerald-600/10 opacity-0' : 'bg-indigo-600/10 opacity-0'
      }`} />

      {/* SECTION 1: Status & Title */}
      <div className="flex-1 lg:flex-[2.5] lg:flex lg:items-center lg:gap-6 mb-4 lg:mb-0 relative z-10">
        <div className={`w-10 h-10 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isFullyResolved 
            ? (hasRejections ? 'bg-slate-700 text-white' : 'bg-emerald-500 text-white') 
            : (isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500')
        }`}>
          {isFullyResolved 
            ? (hasRejections ? <Archive className="w-5 h-5 lg:w-4 lg:h-4" /> : <ShieldCheck className="w-5 h-5 lg:w-4 lg:h-4" />) 
            : <BarChart className="w-5 h-5 lg:w-4 lg:h-4" />
          }
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isStale && (
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white rounded text-[9px] font-black animate-pulse">
                <AlertCircle className="w-3 h-3" /> SPĚCHÁ
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-widest border uppercase ${
              isFullyResolved 
                ? (hasRejections ? 'bg-slate-700 text-white border-slate-600' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20') 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {isFullyResolved ? (hasRejections ? 'ARCHIV' : 'VYŘÍZENO') : 'PROBÍHÁ'}
            </span>
          </div>
          <h3 className={`font-black text-xl lg:text-base leading-tight group-hover:text-indigo-500 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {flow.title}
          </h3>
          <p className={`lg:hidden text-sm line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{flow.description}</p>
        </div>
      </div>

      {/* SECTION 2: Name List */}
      <div className="mb-6 lg:mb-0 lg:flex-[2] lg:px-6 relative z-10">
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
          {flow.subRequests.map((sub) => {
            const assignee = teamMembers.find(m => m.id === sub.assigneeId);
            const isMyTask = sub.assigneeId === currentUser.id;
            return (
              <div key={sub.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(sub.status, sub.replyVerdict)} ${sub.status === 'NEEDS_REVIEW' ? 'animate-pulse' : ''}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isMyTask ? 'text-indigo-600 underline underline-offset-4 decoration-2' : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                  {assignee?.name.split(' ')[0]} ({assignee?.role_key})
                </span>
              </div>
            );
          })}
        </div>
        <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              isStale ? 'bg-red-500' : isFullyResolved ? (hasRejections ? 'bg-slate-600' : 'bg-emerald-500') : 'bg-indigo-500'
            }`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* SECTION 3: Meta */}
      <div className={`pt-4 lg:pt-0 border-t lg:border-t-0 flex items-center justify-between lg:justify-end lg:gap-8 relative z-10 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        
        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
             <div className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Zadal: {creator?.name}</div>
             <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase ${isStale ? 'text-red-400' : 'text-slate-400'}`}>
                <Calendar className="w-3 h-3" />
                {new Date(flow.createdAt).toLocaleDateString('cs-CZ')}
             </div>
          </div>
        </div>

        {/* Chevron */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white ${isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default FlowCard;
