import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Upload, RefreshCw, Skull, Zap, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost, BookOpen, X, Sword, Beer, Info, Clock, ChevronLeft, ChevronRight, Users, Wifi, WifiOff, Minus, Plus, LogOut } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UniversalCampaignManager = ({ campaignId, onExit }) => {
  // --- STATE ---
  const [players, setPlayers] = useState([]);
  const [config, setConfig] = useState(null); // Rules & Mechanics from DB
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

  // --- DATA ENGINE ---
  useEffect(() => {
    if (!campaignId) return;

    const loadCampaign = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (data) {
        setMeta({ title: data.title, engine: data.engine });
        setConfig(data.static_config);
        applyActiveState(data.active_state);
        setIsConnected(true);
      }
    };

    loadCampaign();

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
    setPlayers(newPlayers);
    setStalemate(newStalemate);
    setEpilogueMode(newEpilogue);
    setLastRollRecord(newRoll);

    const newState = {
      players: newPlayers,
      stalemate: newStalemate,
      epilogueMode: newEpilogue,
      last_roll: newRoll
    };

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
    if (field === 'xp' && config?.mechanics?.use_xp) newVal = Math.max(0, Math.min(20, newVal));
    newPlayers[index][field] = newVal;
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  // --- SPECIFIC GAME LOGIC (Marriage) ---
  const handleMarriage = (playerIndex, newSpouseName) => {
    const newPlayers = [...players];
    const currentPlayer = newPlayers[playerIndex];
    
    // Clear old spouse logic
    const oldSpouseName = currentPlayer.spouse;
    if (oldSpouseName) {
        const oldSpouseIndex = newPlayers.findIndex(p => p.name === oldSpouseName);
        if (oldSpouseIndex !== -1) newPlayers[oldSpouseIndex].spouse = "";
    }
    
    currentPlayer.spouse = newSpouseName;
    
    // Set new spouse logic
    if (newSpouseName) {
        const newSpouseIndex = newPlayers.findIndex(p => p.name === newSpouseName);
        if (newSpouseIndex !== -1) {
            const targetExName = newPlayers[newSpouseIndex].spouse;
            if (targetExName) {
                const targetExIndex = newPlayers.findIndex(p => p.name === targetExName);
                if (targetExIndex !== -1) newPlayers[targetExIndex].spouse = "";
            }
            newPlayers[newSpouseIndex].spouse = currentPlayer.name;
        }
    }
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  // --- CONTENT HELPERS ---
  const getLevel = (xp) => xp < 10 ? 1 : xp < 20 ? 2 : 3;
  
  const getRoleAbilities = (role) => {
    const data = {
        'Doctor': ["Creature enters: Remove counter.", "Gain Drunk: Target gets Metaxa.", "Creatures have Infect. End: Proliferate."],
        'Monk': ["Discard/Pay(2): Heresy logic.", "Activate OG abilities 2x.", "Tap 3: Summon random OG."],
        'Smith': ["Artifact spells cost (1) less/Lvl.", "Equip: Vigilance, Trample, Reach.", "Metalcraft: Copy artifact."],
        'Knight': ["(1) Discard: 1/2 Horse Haste.", "Equip: Mentor.", "Battalion: Fight target."],
        'Fool': ["Opp. turn spells cost (1) less.", "Creatures: Ninjutsu = CMC.", "Creatures: Ninjutsu = CMC."],
        'King': ["Creatures +1/+1 per Level.", "Extra land & fix mana.", "Draw extra card."]
    };
    return data[role] || [];
  };
  
  const getRoleReward = (role) => {
    const rewards = { 'Doctor': 'Creature dies on your turn -> +1 XP', 'Monk': 'Life total changes -> +1 XP', 'Smith': 'Artifact enters -> +1 XP', 'Knight': 'Creatures deal damage -> +1 XP', 'Fool': 'Target opponent/perm -> +1 XP', 'King': 'Every 3rd time another gains xp -> +1 XP' };
    return rewards[role] || '';
  };
  
  const getRoleIcon = (role) => {
      switch(role) { case 'Doctor': return <Heart size={12} />; case 'Monk': return <Scroll size={12} />; case 'Smith': return <Hammer size={12} />; case 'Knight': return <Shield size={12} />; case 'Fool': return <Ghost size={12} />; case 'King': return <Crown size={12} />; default: return null; }
  };

  // Feature Checker
  const useFeature = (featureName) => config?.mechanics?.[featureName] === true;

  // --- PLAYER CARD COMPONENT (RESTORED DESIGN) ---
  const PlayerCard = ({ player, index }) => {
    if (!player) return null;
    return (
        <div className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative h-full select-none">
            {/* Color Bar */}
            <div className={`h-1 w-full ${player.color || 'bg-gray-600'}`}></div>
            
            {/* Header */}
            <div className="p-2 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center shrink-0">
                <span className="w-full font-black text-lg text-center text-gray-200" style={{ fontFamily: 'Cinzel, serif' }}>{player.name}</span>
                {epilogueMode && <span className="text-[10px] text-gray-500 uppercase tracking-wide absolute right-2">Epilogue</span>}
            </div>
            
            <div className="flex-grow flex flex-col p-2 gap-2 overflow-hidden min-h-0">
                {!epilogueMode ? (
                    <>
                        {/* --- RPG: Roles & Level --- */}
                        {useFeature('use_roles') && (
                            <div className="grid grid-cols-[1fr_auto] gap-2 items-center shrink-0">
                                <select value={player.role} onChange={(e) => updatePlayer(index, 'role', e.target.value)} className="bg-black text-gray-300 border border-gray-700 text-xs rounded p-2 font-bold focus:outline-none focus:border-yellow-600 w-full appearance-none hover:border-gray-500 transition-colors">
                                    <option value="">-- No Role --</option>
                                    {['Doctor','Monk','Smith','Knight','Fool','King'].map(r=><option key={r} value={r}>{r}</option>)}
                                </select>
                                {useFeature('use_xp') && (
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="text-[8px] text-gray-600 uppercase">Lvl</span>
                                        <span className="text-xl font-bold text-blue-500" style={{ fontFamily: 'Cinzel, serif' }}>{getLevel(player.xp)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- RPG: XP & VP Grid --- */}
                        {(useFeature('use_xp') || useFeature('use_vp') || player.vp !== undefined) && (
                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                {useFeature('use_xp') && (
                                    <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                        <span className="text-[8px] text-blue-500 font-bold mb-1">XP</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => adjustValue(index, 'xp', -1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={16} /></button>
                                            <span className="font-mono text-lg font-bold w-6 text-center">{player.xp}</span>
                                            <button onClick={() => adjustValue(index, 'xp', 1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                    <span className="text-[8px] text-green-500 font-bold mb-1">VP</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => adjustValue(index, 'vp', -1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={16} /></button>
                                        <span className="font-mono text-lg font-bold text-green-400 w-6 text-center">{player.vp || 0}</span>
                                        <button onClick={() => adjustValue(index, 'vp', 1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- RPG: Role Info Box --- */}
                        {useFeature('use_roles') && (
                            <div className="flex-1 min-h-0 bg-black/40 border border-gray-800 rounded p-2 overflow-y-auto custom-scrollbar relative">
                                <div className="absolute top-1 right-2 text-yellow-700 opacity-50">{getRoleIcon(player.role)}</div>
                                {player.role ? (
                                    <div className="text-[10px] md:text-xs text-gray-400 leading-tight space-y-2">
                                        {getRoleAbilities(player.role).map((txt, i) => {
                                            const lvl = i + 1;
                                            const isUnlocked = useFeature('use_xp') ? getLevel(player.xp) >= lvl : true;
                                            return (
                                                <div key={i} className={`flex gap-1 ${isUnlocked ? 'text-green-300' : 'text-gray-600'}`}>
                                                    <span className="font-bold whitespace-nowrap mt-0.5">Lvl {lvl}:</span>
                                                    <span>{txt}</span>
                                                </div>
                                            )
                                        })}
                                        <div className="w-full h-px bg-gray-800 my-1"></div>
                                        <div className="text-yellow-600 italic text-[10px]">{getRoleReward(player.role)}</div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-700 italic">Select Role</div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    // --- EPILOGUE MODE (Simplified) ---
                    <div className="flex-grow flex flex-col gap-4 justify-center">
                        {useFeature('use_marriage') && (
                            <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[9px] text-indigo-400 uppercase font-bold flex items-center gap-1"><Users size={10}/> Marriage</label>
                                </div>
                                <select value={player.spouse} onChange={(e) => handleMarriage(index, e.target.value)} className="w-full bg-black text-gray-300 border border-gray-700 rounded p-2 text-xs focus:outline-none focus:border-indigo-500">
                                    <option value="">Single (Unmarried)</option>
                                    {players.filter(p => p.name !== player.name).map((p, i) => <option key={i} value={p.name}>Married to {p.name}</option>)}
                                </select>
                                {player.spouse && (
                                    <div className="mt-2 text-[10px] text-pink-300 italic bg-black/40 p-2 rounded border border-pink-500/20 leading-tight">
                                        ❤️ <strong>Rules:</strong> Shared Library. Cannot attack each other.<br/>💔 <strong>Divorce:</strong> Give hand to partner to leave.
                                    </div>
                                )}
                            </div>
                        )}
                        {useFeature('use_drunk') && (
                            <div className="bg-purple-900/20 p-2 rounded border border-purple-500/30 flex justify-between items-center">
                                <span className="text-[9px] text-purple-400 font-bold uppercase">Drunk</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => adjustValue(index, 'drunk', -1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={16} /></button>
                                    <span className="text-xl font-bold text-purple-400 w-6 text-center">{player.drunk}</span>
                                    <button onClick={() => adjustValue(index, 'drunk', 1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- STANDARD STATS (Always visible bottom) --- */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-800 shrink-0">
                    {useFeature('track_life_total') && (
                        <div className="bg-red-900/10 rounded border border-red-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-red-600 font-bold uppercase mb-1">LIFE</span>
                            <div className="flex w-full justify-between px-2 items-center">
                                <button onClick={() => adjustValue(index, 'lt', -1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={16} /></button>
                                <span className="text-xl font-mono font-bold text-red-500">{player.lt}</span>
                                <button onClick={() => adjustValue(index, 'lt', 1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={16} /></button>
                            </div>
                        </div>
                    )}
                    {useFeature('track_hand_size') && (
                        <div className="bg-blue-900/10 rounded border border-blue-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-blue-600 font-bold uppercase mb-1">HAND</span>
                            <div className="flex w-full justify-between px-2 items-center">
                                <button onClick={() => adjustValue(index, 'hs', -1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={16} /></button>
                                <span className="text-xl font-mono font-bold text-blue-500">{player.hs}</span>
                                <button onClick={() => adjustValue(index, 'hs', 1)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={16} /></button>
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

  if (!config) return <div className="text-white p-10 font-serif">Loading Rules...</div>;

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#050505] text-gray-300 font-sans relative flex">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <style>{`@keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .nebula-bg { background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000); background-size: 400% 400%; animation: nebula 15s ease infinite; }`}</style>
        <div className="w-full h-full nebula-bg"></div>
      </div>
      
      {/* DICE OVERLAY */}
      {diceOverlay.active && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
            <style>{`@keyframes chaos { 0% { transform: rotate(0deg) scale(0.5); } 100% { transform: rotate(360deg) scale(1); } } @keyframes landing { 0% { transform: scale(3); opacity: 0; } 50% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1); } } .rolling-anim { animation: chaos 0.1s infinite linear; opacity: 0.7; color: #444; } .landed-anim { animation: landing 0.4s ease-out forwards; text-shadow: 0 0 50px #d4af37; color: #d4af37; transform: scale(1.5); }`}</style>
            <div className={`font-black text-[20rem] leading-none ${diceOverlay.finished ? 'landed-anim' : 'rolling-anim'}`}>{diceOverlay.value}</div>
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
                {isConnected ? <div className="text-[8px] text-green-500 flex items-center gap-1 uppercase tracking-wider"><Wifi size={8}/> Connected</div> : <div className="text-[8px] text-gray-600 flex items-center gap-1 uppercase tracking-wider"><WifiOff size={8}/> Offline Mode</div>}
            </div>

            {/* STALEMATE COUNTER */}
            <div className="bg-black/60 border border-red-900/30 rounded flex items-center px-1 gap-1">
                <div className="hidden md:flex text-[10px] text-red-500 font-bold uppercase items-center gap-1"><Skull size={10} /> Stalemate</div>
                <div className="flex items-center gap-1">
                    <button onClick={() => { setStalemate(Math.max(0, stalemate - 1)); syncState(players, Math.max(0, stalemate - 1), epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Minus size={14}/></button>
                    <span className="text-xl font-mono font-bold text-white w-6 text-center">{stalemate}</span>
                    <button onClick={() => { setStalemate(stalemate + 1); syncState(players, stalemate + 1, epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Plus size={14}/></button>
                </div>
            </div>

            {/* DICE */}
            <div className="flex items-center gap-2">
                <div className="hidden md:flex gap-1">
                    {[4, 6, 8, 10, 12, 20].map(sides => (
                        <button key={sides} onClick={() => rollDice(sides)} className="px-2 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 hover:border-blue-400 text-blue-200 rounded font-bold text-[10px] active:scale-95">D{sides}</button>
                    ))}
                </div>
                <div className="flex md:hidden gap-1">
                    <button onClick={() => rollDice(6)} className="px-2 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 text-blue-200 rounded font-bold text-xs">D6</button>
                    <button onClick={() => rollDice(20)} className="px-2 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 text-blue-200 rounded font-bold text-xs">D20</button>
                </div>
                {/* Last Roll Display */}
                <div className="bg-black border border-yellow-600/50 rounded px-2 py-1 flex flex-col items-center justify-center min-w-[50px] shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                    <span className="text-[8px] text-gray-500 uppercase">D{lastRollRecord.type}</span>
                    <span className="text-lg font-bold text-yellow-500 leading-none">{lastRollRecord.value}</span>
                </div>
            </div>

            <button onClick={() => setShowRules(!showRules)} className="hidden md:block p-2 bg-yellow-600 text-black rounded font-bold hover:bg-yellow-500"><BookOpen size={16}/></button>
            <button onClick={() => setEpilogueMode(!epilogueMode)} className={`hidden md:block p-2 hover:bg-white/10 rounded ${epilogueMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`}><Crown size={16}/></button>
        </div>

        {/* --- MOBILE CODEX BUTTON --- */}
        <div className="w-full px-0 mt-0 md:hidden">
            <button 
                onClick={() => setShowRules(!showRules)} 
                className="w-full bg-[#3d2b0f] hover:bg-[#523812] active:bg-[#2e1f0a] border border-yellow-800/50 text-yellow-100 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors group"
            >
                <BookOpen size={18} className="text-yellow-500 group-hover:text-yellow-300"/>
                <span className="font-bold uppercase tracking-widest text-sm" style={{ fontFamily: 'Cinzel, serif' }}>Åbn Codex</span>
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
        
        {/* MOBILE CONTROLS IN PANE */}
        <div className="md:hidden grid grid-cols-4 gap-2 p-4 border-b border-gray-800">
            <button className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-green-500 text-[10px] font-bold"><Save size={16}/> SAVE</button>
            <button className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-blue-500 text-[10px] font-bold"><Upload size={16}/> LOAD</button>
            <button onClick={() => setEpilogueMode(!epilogueMode)} className={`flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-[10px] font-bold ${epilogueMode ? 'text-yellow-400' : 'text-gray-500'}`}><Crown size={16}/> MODE</button>
            <button className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-red-500 text-[10px] font-bold"><RefreshCw size={16}/> RESET</button>
        </div>

        <div className="flex-grow overflow-y-auto p-2 space-y-2 text-sm text-gray-300 custom-scrollbar pb-20">
            {/* Rules Text from DB */}
            {config.rules_text && config.rules_text.map((rule, i) => (
                <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                    <button onClick={() => setActiveRuleSection(activeRuleSection === `rule-${i}` ? null : `rule-${i}`)} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between hover:bg-white/5 transition-colors text-blue-500">
                        <span><Info size={12} className="inline mr-2"/> {rule.title}</span>
                        <span>{activeRuleSection === `rule-${i}` ? '−' : '+'}</span>
                    </button>
                    {activeRuleSection === `rule-${i}` && (
                        <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{rule.desc}</div>
                    )}
                </div>
            ))}

            {/* Timeline from DB */}
            {config.timeline && config.timeline.map((event, i) => (
                <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                    <button onClick={() => setActiveRuleSection(`event-${i}`)} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between hover:bg-white/5 transition-colors text-red-500">
                        <span><Sword size={12} className="inline mr-2"/> {event.title}</span>
                        <span>{activeRuleSection === `event-${i}` ? '−' : '+'}</span>
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
