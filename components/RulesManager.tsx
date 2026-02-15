
import React, { useState, useRef } from 'react';
import { RoleMapping, User } from '../types.ts';
import { BrainCircuit, Plus, X, Trash2, ChevronRight, ChevronDown, Package, Truck, Wrench, Layers, MapPin, Save, Download, Upload, Settings2, Check } from 'lucide-react';

interface RulesManagerProps {
  mappings: RoleMapping[];
  setMappings: React.Dispatch<React.SetStateAction<RoleMapping[]>>;
  teamMembers: User[];
  currentUser: User;
  isDarkMode: boolean;
}

const RulesManager: React.FC<RulesManagerProps> = ({ mappings, setMappings, teamMembers, currentUser, isDarkMode }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<{mappingId: string, groupName: string} | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(mappings[0]?.id || null);
  const [addingGroupToRoleId, setAddingGroupToRoleId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const roleFileInputRef = useRef<HTMLInputElement>(null);
  const [activeImportId, setActiveImportId] = useState<string | null>(null);

  const toggleRole = (id: string) => setExpandedRole(expandedRole === id ? null : id);

  const addKeyword = (mappingId: string, groupName: string) => {
    const kw = newKeyword.toLowerCase().trim();
    if (!kw) return;
    
    setMappings(prev => prev.map(m => {
      if (m.id !== mappingId) return m;
      return {
        ...m,
        groups: m.groups.map(g => {
          if (g.name !== groupName) return g;
          if (g.keywords.includes(kw)) return g;
          return { ...g, keywords: [...g.keywords, kw] };
        })
      };
    }));
    setNewKeyword('');
    setEditingGroupId(null);
  };

  const removeKeyword = (mappingId: string, groupName: string, keyword: string) => {
    setMappings(prev => prev.map(m => {
      if (m.id !== mappingId) return m;
      return {
        ...m,
        groups: m.groups.map(g => 
          g.name === groupName ? { ...g, keywords: g.keywords.filter(k => k !== keyword) } : g
        )
      };
    }));
  };

  const confirmAddGroup = (mappingId: string) => {
    if (!newGroupName.trim()) return;
    setMappings(prev => prev.map(m => 
      m.id === mappingId ? { ...m, groups: [...m.groups, { name: newGroupName.trim(), keywords: [] }] } : m
    ));
    setNewGroupName('');
    setAddingGroupToRoleId(null);
  };

  const deleteGroup = (mappingId: string, groupName: string) => {
    if (!confirm(`Opravdu chcete smazat kategorii ${groupName}?`)) return;
    setMappings(prev => prev.map(m => 
      m.id === mappingId ? { ...m, groups: m.groups.filter(g => g.name !== groupName) } : m
    ));
  };

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('materiál') || n.includes('desky') || n.includes('zdivo')) return <Package className="w-4 h-4" />;
    if (n.includes('logistik') || n.includes('auto') || n.includes('doprava')) return <Truck className="w-4 h-4" />;
    if (n.includes('služb') || n.includes('konstrukce') || n.includes('montáž')) return <Wrench className="w-4 h-4" />;
    return <Layers className="w-4 h-4" />;
  };

  const downloadJson = (data: any, filename: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportAll = () => downloadJson(mappings, "flowrequest-rules-full.json");

  const handleExportRole = (mapping: RoleMapping) => {
    const fileName = `rules-${mapping.role.toLowerCase().replace(/\s+/g, '-')}.json`;
    downloadJson(mapping, fileName);
  };

  const handleGlobalImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setMappings(json);
        } else {
          throw new Error("Neplatný formát pravidel.");
        }
      } catch (error) { alert("Chyba: " + (error as Error).message); }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };

  const handleRoleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeImportId) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && json.groups && Array.isArray(json.groups)) {
          setMappings(prev => prev.map(m => m.id === activeImportId ? { ...m, groups: json.groups } : m));
        }
      } catch (error) { alert("Chyba: " + (error as Error).message); }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
    setActiveImportId(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8 pb-20">
      <div className={`rounded-[2.5rem] p-8 lg:p-12 border shadow-sm relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
        
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BrainCircuit className={`w-64 h-64 ${isDarkMode ? 'text-indigo-600' : 'text-slate-900'}`} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-[1.5rem] shadow-xl ${isDarkMode ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-900 text-white shadow-slate-200'}`}>
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Globální kompetence AI</h2>
              <p className="text-slate-500 font-medium">Spravujte slovník pojmů, podle kterých AI přiřazuje práci.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleExportAll}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDarkMode ? 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
            >
              <Download className="w-4 h-4" /> Exportovat vše
            </button>
            <button 
              onClick={() => globalFileInputRef.current?.click()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDarkMode ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
            >
              <Upload className="w-4 h-4" /> Importovat vše
            </button>
            <input type="file" ref={globalFileInputRef} onChange={handleGlobalImport} accept=".json" className="hidden" />
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {mappings.map((mapping) => (
            <div key={mapping.id} className={`rounded-3xl border transition-all overflow-hidden ${
              expandedRole === mapping.id 
                ? (isDarkMode ? 'border-indigo-500/50 bg-white/5 ring-4 ring-indigo-500/5 shadow-2xl' : 'border-indigo-200 bg-white ring-4 ring-indigo-500/5 shadow-xl') 
                : (isDarkMode ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50')
            }`}>
              <button onClick={() => toggleRole(mapping.id)} className="w-full p-6 flex items-center justify-between text-left group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    expandedRole === mapping.id 
                      ? 'bg-indigo-600 text-white' 
                      : (isDarkMode ? 'bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-white' : 'bg-white text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 shadow-sm')
                  }`}>
                    {expandedRole === mapping.id ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{mapping.role}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {mapping.contexts?.map(ctx => <span key={ctx} className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-widest ${isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>{ctx}</span>)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{mapping.groups.length} kategorií</span>
                    </div>
                  </div>
                </div>
              </button>

              {expandedRole === mapping.id && (
                <div className={`px-8 pb-10 pt-2 border-t animate-in slide-in-from-top-2 ${isDarkMode ? 'border-white/5' : 'border-slate-50'}`}>
                  
                  <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-8 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/30 border-indigo-100'}`}>
                    <div className="flex items-center gap-3">
                      <Settings2 className="w-4 h-4 text-indigo-600" />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Správa této jednotky</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleExportRole(mapping)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}
                      >
                        <Download className="w-3.5 h-3.5" /> Exportovat tuto roli
                      </button>
                      <button 
                        onClick={() => { setActiveImportId(mapping.id); roleFileInputRef.current?.click(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}`}
                      >
                        <Upload className="w-3.5 h-3.5" /> Importovat do této role
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {mapping.groups.map((group) => (
                      <div key={group.name} className={`p-6 rounded-2xl border space-y-4 hover:shadow-lg transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50/50 border-slate-100 hover:bg-white'}`}>
                        <div className={`flex items-center justify-between pb-2 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-600">{getCategoryIcon(group.name)}</span>
                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{group.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditingGroupId({mappingId: mapping.id, groupName: group.name})} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><Plus className="w-4 h-4" /></button>
                            <button onClick={() => deleteGroup(mapping.id, group.name)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {group.keywords.map((kw) => (
                            <span key={kw} className={`px-3 py-1.5 border text-xs font-bold rounded-xl flex items-center gap-2 group/tag transition-all ${
                              isDarkMode 
                                ? 'bg-white/5 border-white/10 text-slate-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400' 
                                : 'bg-white border-slate-100 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                            }`}>
                              {kw}
                              <button onClick={() => removeKeyword(mapping.id, group.name, kw)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover/tag:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                            </span>
                          ))}
                          
                          {editingGroupId?.mappingId === mapping.id && editingGroupId?.groupName === group.name ? (
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2 animate-in slide-in-from-top-1">
                              <input
                                autoFocus
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addKeyword(mapping.id, group.name)}
                                placeholder="Nové slovo..."
                                className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none shadow-sm focus:ring-4 transition-all ${isDarkMode ? 'bg-slate-800 border border-white/10 text-white focus:ring-indigo-500/10' : 'bg-white border border-indigo-200 text-slate-900 focus:ring-indigo-500/5'}`}
                              />
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => addKeyword(mapping.id, group.name)} className="flex-1 sm:flex-none h-11 px-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"><Save className="w-4 h-4" /> ULOŽIT</button>
                                <button onClick={() => setEditingGroupId(null)} className={`h-11 px-4 rounded-xl text-[10px] font-black transition-all ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}>ZRUŠIT</button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setEditingGroupId({mappingId: mapping.id, groupName: group.name})} 
                              className={`text-xs italic transition-colors flex items-center gap-1 py-1.5 px-3 rounded-xl border border-dashed ${isDarkMode ? 'text-slate-500 border-white/10 hover:text-indigo-400 hover:border-indigo-500/50' : 'text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                            >
                              <Plus className="w-3 h-3" /> Přidat pojem
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className={`p-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all min-h-[160px] ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50/30'}`}>
                      {addingGroupToRoleId === mapping.id ? (
                        <div className="w-full space-y-4 animate-in zoom-in duration-300">
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="Název kategorie..." 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmAddGroup(mapping.id)}
                            className={`w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-slate-800 border-white/10 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                          />
                          <div className="flex gap-2">
                             <button onClick={() => confirmAddGroup(mapping.id)} className="flex-1 h-10 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"><Check className="w-3.5 h-3.5" /> POTVRDIT</button>
                             <button onClick={() => { setAddingGroupToRoleId(null); setNewGroupName(''); }} className={`px-4 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>ZRUŠIT</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAddingGroupToRoleId(mapping.id)} className={`flex flex-col items-center justify-center gap-3 w-full h-full group ${isDarkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-white group-hover:bg-indigo-600 group-hover:text-white shadow-sm'}`}>
                            <Plus className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Nová kategorie</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <input type="file" ref={roleFileInputRef} onChange={handleRoleImport} accept=".json" className="hidden" />
    </div>
  );
};

export default RulesManager;
