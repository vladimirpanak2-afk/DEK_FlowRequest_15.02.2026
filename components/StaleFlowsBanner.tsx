
import React from 'react';
import { AlertTriangle, Clock, ArrowRight, X } from 'lucide-react';
import { Flow } from '../types';

interface StaleFlowsBannerProps {
  staleFlows: Flow[];
  onDismiss: () => void;
  onSelectFlow: (flowId: string) => void;
}

const StaleFlowsBanner: React.FC<StaleFlowsBannerProps> = ({ staleFlows, onDismiss, onSelectFlow }) => {
  if (staleFlows.length === 0) return null;

  return (
    <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="bg-white border border-red-100 rounded-2xl p-1.5 pr-4 shadow-xl shadow-red-500/5 flex items-center gap-4 group hover:border-red-200 transition-all">
        <div className="bg-red-500 self-stretch px-4 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        
        <div className="flex-1 py-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.15em]">Upozornění: Zaseknuté zakázky</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Více než 48 hodin</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {staleFlows.map(flow => (
              <button 
                key={flow.id}
                onClick={() => onSelectFlow(flow.id)}
                className="px-3 py-1 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 flex items-center gap-2 group/btn shadow-sm"
              >
                <Clock className="w-3 h-3 text-red-400" />
                {flow.title}
                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onDismiss}
          className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          title="Zavřít upozornění"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StaleFlowsBanner;
