import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Upload, RefreshCw, Skull, Zap, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost, BookOpen, X, Sword, Beer, Info, Clock, ChevronLeft, ChevronRight, Users, Wifi, WifiOff, Minus, Plus, LogOut } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UniversalCampaignManager = ({ campaignId, onExit }) => {
  // --- STATE ---
  const [players, setPlayers] = useState([]);
  const [config, setConfig] = useState(null); // Rules & Mechanics
  const [meta, setMeta] = useState({ title: '', engine: '' });
  
  const [stalemate, setStalemate] = useState(0);
  const [epilogueMode, setEpilogueMode] = useState(false);
  const [lastRollRecord, setLastRollRecord] = useState({ type: '-', value: '-' });
  const [isConnected, setIsConnected] = useState(false);

  // UI State
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [activeRuleSection, setActiveRuleSection] = useState(null);
  const [diceOverlay, setDiceOverlay] = useState({ active: false, value: 1, type: 20, finished: false });

  // Swipe Refs
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  // --- INIT ENGINE ---
  useEffect(() => {
    if (!campaignId) return;

    const loadCampaign = async () => {
      // 1. Hent data fra den nye 'campaigns' tabel baseret på ID
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (data) {
        setMeta({ title: data.title, engine: data.engine });
        setConfig(data.static_config); // Gemmer reglerne (mechanics)
        applyActiveState(data.active_state); // Gemmer spillerne
        setIsConnected(true);
      }
    };

    loadCampaign();

    // Realtime subscription på den specifikke kampagne
    const channel = supabase.channel(`campaign_${campaignId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'campaigns', 
        filter: `id=eq.${campaignId}` 
      }, (payload) => {
        if (payload.new && payload.new.active_state) {
          applyActiveState(payload.new.active_state);
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [campaignId]);

  const applyActiveState = (state) => {
    if (!state) return;
    if (state.players) setPlayers(state.players);
    if (state.stalemate !== undefined) setStalemate(state.stalemate);
    if (state.epilogueMode !== undefined) setEpilogueMode(state.epilogueMode);
    if (state.last_roll) setLastRollRecord(state.last_roll);
  };

  const syncState = async (newPlayers, newStalemate, newEpilogue, newRoll) => {
    // Optimistisk UI opdatering
    setPlayers(newPlayers);
    setStalemate(newStalemate);
    setEpilogueMode(newEpilogue);
    setLastRollRecord(newRoll);

    // Pak data ned i JSON
    const newState = {
      players: newPlayers,
      stalemate: newStalemate,
      epilogueMode: newEpilogue,
      last_roll: newRoll
    };

    // Send til Supabase
    await supabase
      .from('campaigns')
      .update({ active_state: newState })
      .eq('id', campaignId);
  };

  // --- ACTIONS ---
  const rollDice = (sides) => {
    setDiceOverlay({ active: true, value: 1, type: sides, finished: false });
    let counter = 0;
    const interval = setInterval(() => {
      const randomVal = Math.floor(Math.random() * sides) + 1;
      setDiceOverlay(prev => ({ ...prev, value: randomVal }));
      counter++;
      if (counter > 20) { 
        clearInterval(interval);
        const trueFinal = Math.floor(Math.random() * sides) + 1; 
        setDiceOverlay(prev => ({ ...prev, finished: true, value: trueFinal }));
        syncState(players, stalemate, epilogueMode, { type: sides, value: trueFinal });
        setTimeout(() => setDiceOverlay(prev => ({ ...prev, active: false })), 2000);
      }
    }, 50);
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const adjustValue = (index, field, amount) => {
    const newPlayers = [...players];
    let newVal = (newPlayers[index][field] || 0) + amount;
    // XP Cap kun hvis XP systemet er aktivt
    if (field === 'xp' && config?.mechanics?.use_xp) newVal = Math.max(0, Math.min(20, newVal));
    newPlayers[index][field] = newVal;
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  // --- RENDER HELPERS ---
  // Tjekker om en feature er slået til i databasen
  const useFeature = (featureName) => config?.mechanics?.[featureName] === true;

  // --- PLAYER CARD ---
  const PlayerCard = ({ player, index }) => {
    if (!player) return null;
    
    // Beregn Level kun hvis XP er slået til
    const level = useFeature('use_xp') ? (player.xp < 10 ? 1 : player.xp < 20 ? 2 : 3) : 0;

    return (
        <div className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative h-full">
            <div className={`h-1 w-full ${player.color || 'bg-gray-600'}`}></div>
            <div className="p-2 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center shrink-0">
                <span className="w-full font-black text-lg text-center text-gray-200" style={{ fontFamily: 'Cinzel, serif' }}>{player.name}</span>
            </div>
            
            <div className="flex-grow flex flex-col p-2 gap-2 overflow-hidden min-h-0">
                
                {/* --- RPG SECTION (Roles & Levels) --- */}
                {useFeature('use_roles') && (
                    <div className="grid grid-cols-[1fr_auto] gap-2 items-center shrink-0">
                        <select value={player.role} onChange={(e) => updatePlayer(index, 'role', e.target.value)} className="bg-black text-gray-300 border border-gray-700 text-xs rounded p-2 font-bold focus:outline-none focus:border-yellow-600 w-full appearance-none">
                            <option value="">-- No Role --</option>
                            {['Doctor','Monk','Smith','Knight','Fool','King'].map(r=><option key={r} value={r}>{r}</option>)}
                        </select>
                        {useFeature('use_xp') && (
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[8px] text-gray-600 uppercase">Lvl</span>
                                <span className="text-xl font-bold text-blue-500" style={{ fontFamily: 'Cinzel, serif' }}>{level}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* --- STATS ROW 1 (XP & VP) - Kun hvis relevant --- */}
                {(useFeature('use_xp') || player.vp !== undefined) && (
                    <div className="grid grid-cols-2 gap-2 shrink-0">
                        {useFeature('use_xp') && (
                            <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                <span className="text-[8px] text-blue-500 font-bold mb-1">XP</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => adjustValue(index, 'xp', -1)} className="p-1 rounded bg-gray-800"><Minus size={14} /></button>
                                    <span className="font-mono text-lg font-bold w-6 text-center">{player.xp}</span>
                                    <button onClick={() => adjustValue(index, 'xp', 1)} className="p-1 rounded bg-gray-800"><Plus size={14} /></button>
                                </div>
                            </div>
                        )}
                        {/* Hvis spillet bruger VP (Stagging) eller det er standard */}
                        <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                            <span className="text-[8px] text-green-500 font-bold mb-1">VP / SCORE</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => adjustValue(index, 'vp', -1)} className="p-1 rounded bg-gray-800"><Minus size={14} /></button>
                                <span className="font-mono text-lg font-bold text-green-400 w-6 text-center">{player.vp || 0}</span>
                                <button onClick={() => adjustValue(index, 'vp', 1)} className="p-1 rounded bg-gray-800"><Plus size={14} /></button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- RPG EXTRA (Marriage & Drunk) --- */}
                {(useFeature('use_marriage') || useFeature('use_drunk')) && (
                    <div className="flex-grow flex flex-col gap-2 justify-center">
                        {useFeature('use_marriage') && (
                            <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[9px] text-indigo-400 uppercase font-bold flex items-center gap-1"><Users size={10}/> Marriage</label>
                                </div>
                                <select value={player.spouse} onChange={(e) => updatePlayer(index, 'spouse', e.target.value)} className="w-full bg-black text-gray-300 border border-gray-700 rounded p-2 text-xs">
                                    <option value="">Single</option>
                                    {players.filter(p => p.name !== player.name).map((p, i) => <option key={i} value={p.name}>Married to {p.name}</option>)}
                                </select>
                            </div>
                        )}
                        {useFeature('use_drunk') && (
                            <div className="bg-purple-900/20 p-2 rounded border border-purple-500/30 flex justify-between items-center">
                                <span className="text-[9px] text-purple-400 font-bold uppercase">Drunk</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => adjustValue(index, 'drunk', -1)} className="p-1 rounded bg-gray-800"><Minus size={14} /></button>
                                    <span className="text-xl font-bold text-purple-400 w-6 text-center">{player.drunk}</span>
                                    <button onClick={() => adjustValue(index, 'drunk', 1)} className="p-1 rounded bg-gray-800"><Plus size={14} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- STANDARD STATS (Life & Hand) - Always visible if tracked --- */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-800 shrink-0">
                    {useFeature('track_life_total') && (
                        <div className="bg-red-900/10 rounded border border-red-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-red-600 font-bold uppercase mb-1">LIFE</span>
                            <div className="flex w-full justify-between px-2 items-center">
                                <button onClick={() => adjustValue(index, 'lt', -1)} className="p-1 rounded bg-gray-800"><Minus size={14} /></button>
                                <span className="text-xl font-mono font-bold text-red-500">{player.lt}</span>
                                <button onClick={() => adjustValue(index, 'lt', 1)} className="p-1 rounded bg-gray-800"><Plus size={14} /></button>
                            </div>
                        </div>
                    )}
                    {useFeature('track_hand_size') && (
                        <div className="bg-blue-900/10 rounded border border-blue-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-blue-600 font-bold uppercase mb-1">HAND</span>
                            <div className="flex w-full justify-between px-2 items-center">
                                <button onClick={() => adjustValue(index, 'hs', -1)} className="p-1 rounded bg-gray-800"><Minus size={14} /></button>
                                <span className="text-xl font-mono font-bold text-blue-500">{player.hs}</span>
                                <button onClick={() => adjustValue(index, 'hs', 1)} className="p-1 rounded bg-gray-800"><Plus size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  // --- SWIPE LOGIC ---
  const onTouchStart = (e) => { touchEnd.current = null; touchStart.current = e.targetTouches[0].clientX; };
  const onTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > minSwipeDistance) setActivePlayerIndex((prev) => (prev + 1) % players.length);
    if (distance < -minSwipeDistance) setActivePlayerIndex((prev) => (prev - 1 + players.length) % players.length);
  };

  // Hvis loading...
  if (!config) return <div className="text-white p-10">Loading Rules...</div>;

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#050505] text-gray-300 font-sans relative flex">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none nebula-bg"></div>
      
      {/* DICE OVERLAY */}
      {diceOverlay.active && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
            <div className={`font-black text-[20rem] text-amber-500`}>{diceOverlay.value}</div>
        </div>
      )}

      <div className={`flex-grow flex flex-col p-2 gap-2 relative z-10 transition-all duration-300 ${showRules ? 'w-full md:w-2/3' : 'w-full'}`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#111]/90 backdrop-blur border-b border-white/10 p-2 rounded-lg shrink-0 gap-2">
            <div className="flex flex-col shrink-0">
                {/* BACK TO LOBBY BUTTON */}
                <button onClick={onExit} className="flex items-center gap-1 text-[10px] uppercase text-stone-500 hover:text-white mb-1">
                    <LogOut size={10}/> Exit
                </button>
                <h1 className="text-sm md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-widest uppercase truncate max-w-[150px]" style={{ fontFamily: 'Cinzel, serif' }}>
                    {meta.title}
                </h1>
            </div>

            {/* STALEMATE COUNTER */}
            <div className="bg-black/60 border border-red-900/30 rounded flex items-center px-1 gap-1">
                <div className="flex items-center gap-1">
                    <button onClick={() => { setStalemate(Math.max(0, stalemate - 1)); syncState(players, Math.max(0, stalemate - 1), epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Minus size={14}/></button>
                    <span className="text-xl font-mono font-bold text-white w-6 text-center">{stalemate}</span>
                    <button onClick={() => { setStalemate(stalemate + 1); syncState(players, stalemate + 1, epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Plus size={14}/></button>
                </div>
            </div>

            {/* DICE */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    <button onClick={() => rollDice(6)} className="px-2 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 text-blue-200 rounded font-bold text-xs">D6</button>
                    <button onClick={() => rollDice(20)} className="px-2 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 text-blue-200 rounded font-bold text-xs">D20</button>
                </div>
            </div>

            <button onClick={() => setShowRules(!showRules)} className="p-2 bg-yellow-600 text-black rounded font-bold hover:bg-yellow-500"><BookOpen size={16}/></button>
        </div>

        {/* --- MOBILE CODEX BUTTON --- */}
        <div className="w-full px-0 mt-0 md:hidden">
            <button onClick={() => setShowRules(!showRules)} className="w-full bg-[#3d2b0f] border border-yellow-800/50 text-yellow-100 py-3 rounded-lg shadow-md flex items-center justify-center gap-2">
                <BookOpen size={18} className="text-yellow-500"/>
                <span className="font-bold uppercase tracking-widest text-sm" style={{ fontFamily: 'Cinzel, serif' }}>Codex</span>
            </button>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:grid grid-cols-4 gap-2 flex-grow min-h-0">
            {players.map((player, index) => <PlayerCard key={index} player={player} index={index} />)}
        </div>

        {/* MOBILE VIEW (SWIPE) */}
        <div className="md:hidden flex flex-grow items-center justify-center relative overflow-hidden select-none touch-pan-y" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className="w-full h-full p-1 transition-transform duration-200">
                <PlayerCard player={players[activePlayerIndex]} index={activePlayerIndex} />
            </div>
        </div>
      </div>

      {/* --- CODEX PANE (Dynamic Content) --- */}
      <div className={`fixed right-0 top-0 bottom-0 z-40 bg-[#0f0f13]/95 backdrop-blur-xl border-l border-yellow-900/30 shadow-2xl transition-all duration-300 flex flex-col ${showRules ? 'w-full md:w-1/3 translate-x-0' : 'w-full md:w-1/3 translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-yellow-500" style={{ fontFamily: 'Cinzel, serif' }}>Codex: {meta.title}</h2>
            <button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-2 space-y-2 text-sm text-gray-300 custom-scrollbar pb-20">
            {/* Genererer regler baseret på databasen */}
            {config.rules_text && config.rules_text.map((rule, i) => (
                <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                    <button onClick={() => setActiveRuleSection(activeRuleSection === `rule-${i}` ? null : `rule-${i}`)} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-blue-500">
                        <span><Info size={12} className="inline mr-2"/> {rule.title}</span>
                    </button>
                    {activeRuleSection === `rule-${i}` && (
                        <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{rule.desc}</div>
                    )}
                </div>
            ))}

            {/* Timeline */}
            {config.timeline && config.timeline.map((event, i) => (
                <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                    <button onClick={() => setActiveRuleSection(`event-${i}`)} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-red-500">
                        <span><Sword size={12} className="inline mr-2"/> {event.title}</span>
                    </button>
                    {activeRuleSection === `event-${i}` && (
                        <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{event.desc}</div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UniversalCampaignManager;
