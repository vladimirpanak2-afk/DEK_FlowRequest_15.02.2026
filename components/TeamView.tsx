
import React, { useState } from 'react';
import { User } from '../types.ts';
import { Users, ShieldCheck, AtSign, Key, Plus, Trash2, Edit3, Save, X, UserPlus } from 'lucide-react';

interface TeamViewProps {
  teamMembers: User[];
  setTeamMembers: React.Dispatch<React.SetStateAction<User[]>>;
  isDarkMode: boolean; // Added missing prop
}

const TeamView: React.FC<TeamViewProps> = ({ teamMembers, setTeamMembers, isDarkMode }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setFormData(user);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: `u-${Date.now()}`,
      name: '',
      email: '',
      role: '',
      role_key: '',
      avatar: ''
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.role_key) {
      alert("Vyplňte prosím všechna pole.");
      return;
    }

    const updatedData = {
      ...formData,
      avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'User')}`
    } as User;

    if (isAdding) {
      setTeamMembers([...teamMembers, updatedData]);
    } else {
      setTeamMembers(teamMembers.map(u => u.id === editingId ? updatedData : u));
    }

    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Opravdu chcete smazat tohoto člena týmu?")) {
      setTeamMembers(teamMembers.filter(u => u.id !== id));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className={`rounded-[2.5rem] p-10 border shadow-xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg shadow-indigo-100">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Správa týmu</h2>
                <p className="text-slate-500 font-medium">Definujte lidi a jejich specializace pro AI směrování.</p>
              </div>
            </div>
            
            <button 
              onClick={startAdd}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 self-start"
            >
              <UserPlus className="w-5 h-5" />
              PŘIDAT ČLENA TÝMU
            </button>
          </div>

          {(isAdding || editingId) && (
            <div className={`mb-10 p-8 border rounded-[2rem] animate-in zoom-in duration-300 ${isDarkMode ? 'bg-white/5 border-indigo-500/20' : 'bg-slate-50 border-indigo-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  {isAdding ? <UserPlus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <h3 className={`font-black uppercase tracking-widest text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  {isAdding ? 'Nový člen týmu' : 'Upravit člena'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Celé jméno</label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Např. Petr Dvořák"
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-white/5 text-white focus:border-indigo-500/50' : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-200'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pracovní E-mail</label>
                  <input 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@firma.cz"
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-white/5 text-white focus:border-indigo-500/50' : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-200'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Název Role</label>
                  <input 
                    type="text" 
                    value={formData.role || ''} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    placeholder="Např. PM Izolace"
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-white/5 text-white focus:border-indigo-500/50' : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-200'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role Key (pro AI)</label>
                  <input 
                    type="text" 
                    value={formData.role_key || ''} 
                    onChange={e => setFormData({...formData, role_key: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                    placeholder="PM_IZOLACE"
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-mono text-xs font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-white/5 text-white focus:border-indigo-500/50' : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-200'}`}
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-3 mt-8 pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <button 
                  onClick={() => { setEditingId(null); setIsAdding(false); }}
                  className={`px-6 py-2.5 font-black text-[10px] uppercase transition-all ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Zrušit
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Uložit změny
                </button>
              </div>
            </div>
          )}

          <div className={`overflow-hidden rounded-3xl border shadow-inner ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Člen týmu</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role Key (AI)</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Akce</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-50'}`}>
                {teamMembers.map((user) => (
                  <tr key={user.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar} alt={user.name} className={`w-12 h-12 rounded-2xl border-2 shadow-sm ring-1 ${isDarkMode ? 'border-slate-800 ring-white/10' : 'border-white ring-slate-100'}`} />
                        <div className="flex flex-col">
                          <span className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] font-bold">
                        <Key className="w-3.5 h-3.5" />
                        {user.role_key}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => startEdit(user)}
                          className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-500 hover:text-indigo-400 hover:bg-white/10' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-white/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
