import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sword, Scroll, Users, ArrowRight, Crown, Map, Plus, X, UserPlus, Trash2, Dna, Edit2, Clock, Zap, Skull, Target } from 'lucide-react';

// IMPORT DATA
import { civData } from './civ_campaign.js';
import { staggingData } from './stagging_campaign.js';
import { stressData } from './stress_campaign.js'; 

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GameLobby = ({ onSelectCampaign }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Creation & Edit State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('rpg'); 
  const [stressSubMode, setStressSubMode] = useState('sudden_death'); 
  const [playerNames, setPlayerNames] = useState([]); 
  const [playerLimits, setPlayerLimits] = useState({ min: 2, max: 8 });

  // Hent kampagner
  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('id, title, engine, active_state, static_config, created_at')
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data);
    setLoading(false);
  };

  // --- REALTIME LISTENER ---
  useEffect(() => { 
      fetchCampaigns(); 
      const channel = supabase
        .channel('campaign-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'campaigns' },
          (payload) => { fetchCampaigns(); }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
  }, []);

  // --- ACTIONS ---
  const deleteCampaign = async (id, e) => {
      e.stopPropagation();
      if (!window.confirm("ER DU SIKKER? Slettes permanent!")) return;
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (!error) setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const deleteTodaysCampaigns = async () => {
      if (!window.confirm("WARNING: This will delete ALL campaigns created TODAY. Are you sure?")) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { error } = await supabase
          .from('campaigns')
          .delete()
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString());

      if (error) { alert("Error deleting campaigns: " + error.message); } 
      else { setCampaigns(prev => prev.filter(c => { const cDate = new Date(c.created_at); return cDate < today || cDate >= tomorrow; })); }
  };

  const renameCampaign = async (id, oldTitle, e) => {
      e.stopPropagation();
      const newName = window.prompt("Nyt navn til kampagnen:", oldTitle);
      if (newName && newName.trim() !== "" && newName !== oldTitle) {
          const { error } = await supabase.from('campaigns').update({ title: newName }).eq('id', id);
          if (!error) { setCampaigns(prev => prev.map(c => c.id === id ? { ...c, title: newName } : c)); }
      }
  };

  // --- SETUP LOGIC ---
  const openSetup = (type) => {
    const dateStr = new Date().toLocaleDateString();
    let defaultTitle = `Game ${dateStr}`;
    let limits = { min: 2, max: 8 };

    if (type === 'civ') {
        defaultTitle = `Civ Mode ${dateStr}`;
        limits = civData.playerLimits;
    } else if (type === 'rpg') {
        defaultTitle = `Stagging ${dateStr}`;
        limits = staggingData.playerLimits;
    } else if (type === 'stress') {
        defaultTitle = `Stress Duel ${dateStr}`;
        limits = { min: 2, max: 6 }; 
    } else if (type === 'chess') { 
        defaultTitle = `Chess Clock ${dateStr}`;
        limits = { min: 1, max: 6 }; 
    } else if (type === 'tracker') { // NYT
        defaultTitle = `Commander Tracker ${dateStr}`;
        limits = { min: 1, max: 4 }; // Fokus på single/få spillere
    }

    setNewTitle(defaultTitle);
    setSelectedEngine(type);
    setPlayerLimits(limits);
    setStressSubMode('sudden_death'); 

    let initialPlayers;
    if (type === 'chess' || type === 'tracker') {
        initialPlayers = Array(limits.min).fill('');
    } else {
        initialPlayers = Array(limits.min).fill('').map((_, i) => `Player ${i + 1}`);
    }
    
    setPlayerNames(initialPlayers);
    setIsCreating(true);
  };

  const updateName = (index, val) => {
    const newNames = [...playerNames];
    newNames[index] = val;
    setPlayerNames(newNames);
  };

  const addPlayer = () => {
      if (playerNames.length >= playerLimits.max) return;
      if (selectedEngine === 'chess' || selectedEngine === 'tracker') {
          setPlayerNames([...playerNames, '']);
      } else {
          setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
      }
  };
  
  const removePlayer = (index) => {
      if (playerNames.length <= playerLimits.min) return;
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
  };

  const launchCampaign = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let startLt = 20;
    let startHs = 7;

    if (selectedEngine === 'civ') { startLt = 10; startHs = 6; }
    else if (selectedEngine === 'rpg') { startLt = 15; startHs = 6; }
    else if (selectedEngine === 'stress') { startLt = 40; startHs = 7; }
    else if (selectedEngine === 'chess') { startLt = 20; startHs = 7; } 
    else if (selectedEngine === 'tracker') { startLt = 40; startHs = 0; } // Commander Start

    let initialPlayers = playerNames.map(name => ({
        name: name.trim() || "Unknown",
        vp: 0, xp: 0, 
        lt: startLt,
        hs: startHs,
        nbl: 0, acmc: 0, colors: [],
        role: '', spouse: '', drunk: 0, rank: null, ranking_roll: null,
        penalties: 0,
        ...(selectedEngine === 'chess' || selectedEngine === 'tracker' ? { is_seated: false, seated_by: null } : {})
    }));

    if (selectedEngine === 'chess') {
        const slotsNeeded = 6 - initialPlayers.length;
        for (let i = 0; i < slotsNeeded; i++) {
            initialPlayers.push({
                name: `Open Seat ${initialPlayers.length + 1}`,
                vp: 0, xp: 0, lt: startLt, hs: startHs,
                nbl: 0, acmc: 0, colors: [], role: '', spouse: '', drunk: 0,
                is_seated: false, seated_by: null
            });
        }
    } else if (selectedEngine === 'tracker') {
        // For Tracker mode, vi sikrer bare at der er et par åbne pladser
        const slotsNeeded = Math.max(0, 4 - initialPlayers.length);
        for (let i = 0; i < slotsNeeded; i++) {
            initialPlayers.push({
                name: `Open Seat ${initialPlayers.length + 1}`,
                vp: 0, xp: 0, lt: startLt, hs: startHs,
                drunk: 0, is_seated: false, seated_by: null
            });
        }
    }

    initialPlayers = initialPlayers.map((p, i) => ({
        ...p,
        name: (p.name === "Unknown" || p.name === "") ? `Open Seat ${i + 1}` : p.name
    }));

    let config = {};
    if (selectedEngine === 'civ') {
        config = { mechanics: { use_xp: false, use_vp: true, track_life_total: true, track_hand_size: true } };
    } else if (selectedEngine === 'rpg') {
        config = { mechanics: { use_xp: true, use_vp: true, use_roles: true, track_life_total: true, track_hand_size: true, use_drunk: true, use_marriage: true } };
    } else if (selectedEngine === 'stress') {
        config = { 
            mode: stressSubMode,
            modes: stressData.modes,
            mechanics: { track_life_total: true, track_hand_size: true, use_vp: false }
        };
    } else if (selectedEngine === 'chess') { 
        config = { mechanics: { track_life_total: true, track_hand_size: true, use_vp: false } };
    } else if (selectedEngine === 'tracker') {
        config = { mechanics: { track_life_total: true, track_hand_size: false, use_vp: false } };
    } else {
        config = { mechanics: { use_xp: false, use_vp: true, track_life_total: true, track_hand_size: true } };
    }

    const { data } = await supabase.from('campaigns').insert([{ 
        title: newTitle, engine: selectedEngine, static_config: config, active_state: { players: initialPlayers } 
    }]).select().single();

    if (data) onSelectCampaign(data.id);
  };

  if (loading && !isCreating) return <div className="h-screen bg-[#050505] flex items-center justify-center text-amber-600 font-serif">Loading Campaigns...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-6 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"><style>{`@keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .nebula-bg { background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000); background-size: 400% 400%; animation: nebula 15s ease infinite; }`}</style><div className="w-full h-full nebula-bg"></div></div>

        <div className="max-w-6xl w-full z-10 space-y-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-grow w-full">
                <header className="mb-6 border-b border-stone-800 pb-4">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600 tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>Campaigns</h1>
                    <p className="text-stone-500 text-xs mt-1 flex items-center gap-2"><Scroll size={12}/> Select Campaign</p>
                    <button onClick={deleteTodaysCampaigns} className="text-[10px] uppercase font-bold text-stone-600 hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-900/10" title="Delete all games created today"> <Trash2 size={12}/> Clear Today </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {campaigns.map((camp, index) => {
                        const isNewest = index === 0; 
                        return (
                        <div key={camp.id} onClick={() => onSelectCampaign(camp.id)} className={`group relative bg-[#111]/80 border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-2xl flex flex-col ${isNewest ? 'border-amber-500/60 shadow-amber-900/20' : 'border-stone-800 hover:border-amber-600/50'}`}>
                            <div className="p-4 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${camp.engine === 'civ' ? 'bg-blue-900/20 text-blue-400 border-blue-800' : (camp.engine === 'rpg' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-800' : (camp.engine === 'stress' ? 'bg-red-900/20 text-red-500 border-red-800' : (camp.engine === 'chess' ? 'bg-purple-900/20 text-purple-500 border-purple-800' : (camp.engine === 'tracker' ? 'bg-emerald-900/20 text-emerald-500 border-emerald-800' : 'bg-stone-800 text-stone-400 border-stone-600'))))}`}> {camp.engine === 'civ' ? 'Civ Mode' : (camp.engine === 'rpg' ? 'Stagging RPG' : (camp.engine === 'stress' ? 'Stress Mode' : (camp.engine === 'chess' ? 'Chess Mode' : (camp.engine === 'tracker' ? 'Tracker' : 'Standard'))))} </span>
                                        {isNewest && ( <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-green-600 text-white border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"> NEW </span> )}
                                    </div>
                                    <span className="text-[10px] text-stone-600">{new Date(camp.created_at).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-lg font-bold text-stone-200 group-hover:text-amber-500 transition-colors font-serif">{camp.title}</h2>
                                {camp.engine === 'stress' && camp.static_config?.mode && ( <div className="text-[10px] text-red-400 mt-1 uppercase font-bold tracking-wider">{camp.static_config.mode.replace('_', ' ')}</div> )}
                                <div className="mt-2 flex items-center gap-2 text-xs text-stone-500"><Users size={12}/> {camp.active_state?.players?.length || 0} Players</div>
                            </div>
                            
                            <div className="p-3 bg-black/40 border-t border-stone-800/50 flex justify-between items-center group-hover:bg-amber-900/5 transition-colors">
                                <div className="flex gap-2">
                                    <button onClick={(e) => renameCampaign(camp.id, camp.title, e)} className="p-1.5 text-stone-600 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-colors z-20" title="Rename"><Edit2 size={14} /></button>
                                    <button onClick={(e) => deleteCampaign(camp.id, e)} className="p-1.5 text-stone-600 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors z-20" title="Delete"><Trash2 size={14} /></button>
                                </div>
                                <div className="flex items-center text-stone-400 group-hover:text-amber-500 text-xs font-bold uppercase tracking-widest gap-2">Enter <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></div>
                            </div>
                            <div className={`h-1 w-full bg-gradient-to-r transition-all ${camp.engine === 'civ' ? 'from-blue-900 to-blue-500' : (camp.engine === 'stress' ? 'from-red-900 to-red-600' : (camp.engine === 'chess' ? 'from-purple-900 to-purple-600' : (camp.engine === 'tracker' ? 'from-emerald-900 to-emerald-600' : 'from-yellow-900 to-amber-500')))}`}></div>
                        </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full md:w-80 shrink-0 bg-[#0f0f13]/80 border border-stone-800 rounded-xl p-5 backdrop-blur-sm sticky top-6">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-800 pb-2">Start New</h3>
                <div className="space-y-3">
                    <button onClick={() => openSetup('rpg')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-stone-800 hover:border-yellow-600 hover:bg-yellow-900/10 transition-all text-left group">
                        <div className="p-2 bg-yellow-900/20 rounded-full text-yellow-500 group-hover:scale-110 transition-transform"><Crown size={18}/></div>
                        <div><div className="text-sm font-bold text-stone-200 group-hover:text-yellow-500">Stagging It Up</div><div className="text-[10px] text-stone-500">Roles, XP & King rules</div></div>
                    </button>
                    <button onClick={() => openSetup('civ')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-stone-800 hover:border-blue-600 hover:bg-blue-900/10 transition-all text-left group">
                        <div className="p-2 bg-blue-900/20 rounded-full text-blue-500 group-hover:scale-110 transition-transform"><Map size={18}/></div>
                        <div><div className="text-sm font-bold text-stone-200 group-hover:text-blue-500">MagicCiv (Xian's)</div><div className="text-[10px] text-stone-500">Board game & Victory conditions</div></div>
                    </button>
                    <button onClick={() => openSetup('stress')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-stone-800 hover:border-red-600 hover:bg-red-900/10 transition-all text-left group">
                        <div className="p-2 bg-red-900/20 rounded-full text-red-500 group-hover:scale-110 transition-transform"><Clock size={18}/></div>
                        <div><div className="text-sm font-bold text-stone-200 group-hover:text-red-500">Stress Duel</div><div className="text-[10px] text-stone-500">Timers, Penalties & Panic</div></div>
                    </button>
                    <button onClick={() => openSetup('chess')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-stone-800 hover:border-purple-600 hover:bg-purple-900/10 transition-all text-left group">
                        <div className="p-2 bg-purple-900/20 rounded-full text-purple-500 group-hover:scale-110 transition-transform"><Zap size={18}/></div>
                        <div><div className="text-sm font-bold text-stone-200 group-hover:text-purple-500">Chess Mode</div><div className="text-[10px] text-stone-500">Instant Priority Passing</div></div>
                    </button>
                    
                    {/* NY KNAP: TRACKER MODE */}
                    <button onClick={() => openSetup('tracker')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-stone-800 hover:border-emerald-600 hover:bg-emerald-900/10 transition-all text-left group">
                        <div className="p-2 bg-emerald-900/20 rounded-full text-emerald-500 group-hover:scale-110 transition-transform"><Target size={18}/></div>
                        <div><div className="text-sm font-bold text-stone-200 group-hover:text-emerald-500">Tracker Mode</div><div className="text-[10px] text-stone-500">Single Player Life & Counters</div></div>
                    </button>

                    <button onClick={() => openSetup('standard')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-stone-800 hover:border-stone-400 hover:bg-stone-800 transition-all text-left group">
                        <div className="p-2 bg-stone-800 rounded-full text-stone-400 group-hover:scale-110 transition-transform"><Dna size={18}/></div>
                        <div><div className="text-sm font-bold text-stone-200 group-hover:text-stone-300">Standard</div><div className="text-[10px] text-stone-500">Just trackers, no rules</div></div>
                    </button>
                </div>
            </div>
        </div>

        {isCreating && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#111] border border-stone-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-900/50 shrink-0">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            {selectedEngine === 'rpg' && <Crown size={18} className="text-yellow-500"/>}
                            {selectedEngine === 'civ' && <Map size={18} className="text-blue-500"/>}
                            {selectedEngine === 'stress' && <Clock size={18} className="text-red-500"/>}
                            {selectedEngine === 'chess' && <Zap size={18} className="text-purple-500"/>}
                            {selectedEngine === 'tracker' && <Target size={18} className="text-emerald-500"/>}
                            New {selectedEngine === 'rpg' ? 'Stagging' : selectedEngine === 'civ' ? 'Civ' : selectedEngine === 'stress' ? 'Stress' : selectedEngine === 'chess' ? 'Chess' : selectedEngine === 'tracker' ? 'Tracker' : 'Standard'}
                        </h2>
                        <button onClick={() => setIsCreating(false)} className="text-stone-500 hover:text-white"><X size={20}/></button>
                    </div>
                    <form onSubmit={launchCampaign} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Campaign Title</label>
                            <input className="w-full bg-black border border-stone-700 rounded p-3 text-white focus:border-amber-500 focus:outline-none" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                        </div>
                        
                        {/* --- PLAYERS SECTION START --- */}
                        {selectedEngine === 'chess' || selectedEngine === 'tracker' ? (
                            <div className={`border p-6 rounded-lg text-center animate-in fade-in my-4 ${selectedEngine === 'tracker' ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-purple-900/10 border-purple-500/30'}`}>
                                {selectedEngine === 'tracker' ? <Target size={24} className="mx-auto text-emerald-500 mb-3"/> : <Zap size={24} className="mx-auto text-purple-500 mb-3"/>}
                                <div className={`${selectedEngine === 'tracker' ? 'text-emerald-400' : 'text-purple-400'} font-bold uppercase tracking-widest text-sm mb-2`}>Auto-Seating Protocol</div>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    No pre-registration required.
                                    <br/>
                                    <span className="text-stone-300 font-bold">Open Seats</span> will be initialized immediately.
                                    <br/>
                                    Players claim seats on device entry.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Players ({playerNames.length}) <span className="text-[10px] text-stone-600 ml-2 font-normal normal-case">(Min: {playerLimits.min}, Max: {playerLimits.max})</span></label>
                                    <button type="button" onClick={addPlayer} disabled={playerNames.length >= playerLimits.max} className={`text-xs flex items-center gap-1 font-bold ${playerNames.length >= playerLimits.max ? 'text-stone-700 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}><UserPlus size={14}/> Add Player</button>
                                </div>
                                <div className="space-y-2">
                                    {playerNames.map((name, i) => (
                                        <div key={i} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                                            <input className="flex-grow bg-stone-900/50 border border-stone-800 rounded p-2 text-sm text-gray-300 focus:border-stone-600 focus:outline-none focus:text-white" placeholder={`Player ${i+1} Name`} value={name} onChange={(e) => updateName(i, e.target.value)} />
                                            <button type="button" onClick={() => removePlayer(i)} disabled={playerNames.length <= playerLimits.min} className={`p-2 rounded ${playerNames.length <= playerLimits.min ? 'text-stone-800 cursor-not-allowed' : 'text-stone-600 hover:text-red-500 hover:bg-red-900/20'}`}><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* --- PLAYERS SECTION END --- */}

                        <div className="pt-2">
                            <button type="submit" className={`w-full py-4 rounded font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${selectedEngine === 'civ' ? 'bg-blue-700 hover:bg-blue-600 text-white shadow-blue-900/20' : (selectedEngine === 'stress' ? 'bg-red-700 hover:bg-red-600 text-white shadow-red-900/20' : (selectedEngine === 'chess' ? 'bg-purple-700 hover:bg-purple-600 text-white shadow-purple-900/20' : (selectedEngine === 'tracker' ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-yellow-700 hover:bg-yellow-600 text-white shadow-yellow-900/20')))}`}>Start Campaign</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
export default GameLobby;

