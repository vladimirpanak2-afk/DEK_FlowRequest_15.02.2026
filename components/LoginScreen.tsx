
import React from 'react';
import { User } from '../types.ts';
import { ShieldCheck, ChevronRight, LayoutDashboard } from 'lucide-react';

interface LoginScreenProps {
  teamMembers: User[];
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ teamMembers, onLogin }) => {
  const admins = teamMembers.filter(u => u.isAdmin);
  const staff = teamMembers.filter(u => !u.isAdmin);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-5xl z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] text-white font-black text-3xl shadow-2xl shadow-indigo-500/20 mb-8 border border-white/10">S</div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4">DEK Snap</h1>
          <p className="text-slate-400 font-medium text-lg uppercase tracking-widest">Okamžitý vhled. Okamžitá akce.</p>
        </div>

        <div className="space-y-12">
          {/* Staff Section */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4 px-4">
              Uživatelé <span className="flex-1 h-px bg-slate-800" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {staff.map(user => (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="group bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-[2rem] p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src={user.avatar} alt="" className="w-14 h-14 rounded-2xl border-2 border-slate-800 bg-slate-950 group-hover:border-slate-700" />
                    <div className="text-slate-700 group-hover:text-slate-500 transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{user.name}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{user.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Section */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4 px-4">
              Administrace <span className="flex-1 h-px bg-slate-800" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {admins.map(user => (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="group bg-slate-900/50 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-400 rounded-[2rem] p-6 text-left transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <img src={user.avatar} alt="" className="w-14 h-14 rounded-2xl border-2 border-slate-800 bg-slate-950 group-hover:border-white/20" />
                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-white/10 text-indigo-400 group-hover:text-white transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-white transition-colors">{user.name}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 group-hover:text-white/60">{user.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
