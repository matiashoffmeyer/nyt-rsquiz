import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Upload, RefreshCw, Skull, Zap, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost, BookOpen, X, Sword, Beer, Info, Clock, ChevronLeft, ChevronRight, Users, Wifi, WifiOff } from 'lucide-react';

// --- SUPABASE SETUP (SAFE MODE) ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
try {
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.warn("Supabase credentials missing. Running in Offline Mode.");
  }
} catch (error) {
  console.error("Supabase init error:", error);
}

const CampaignManager = () => {
  // --- STATE ---
  const [players, setPlayers] = useState([
      { name: 'Christian', role: '', vp: 2, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Andreas', role: '', vp: 1, xp: 13, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Frederik', role: '', vp: 1, xp: 16, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Matias', role: '', vp: 3, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' }
  ]);
  const [stalemate, setStalemate] = useState(0);
  const [epilogueMode, setEpilogueMode] = useState(false);
  const [lastRollRecord, setLastRollRecord] = useState({ type: '-', value: '-' });
  const [isConnected, setIsConnected] = useState(false);

  // UI State
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [activeRuleSection, setActiveRuleSection] = useState(null);
  
  // Dice Animation State
  const [diceOverlay, setDiceOverlay] = useState({ active: false, value: 1, type: 20, finished: false });

  // Import State
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- DATA ENGINE (HYBRID: CLOUD + LOCAL) ---
  useEffect(() => {
    // 1. Try Loading from Cloud
    const fetchCloudData = async () => {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('campaign_state')
        .select('game_data')
        .eq('id', 1)
        .single();

      if (data && data.game_data) {
        applyData(data.game_data);
        setIsConnected(true);
      }
    };

    // 2. Load from LocalStorage (Backup/Fast Load)
    const saved = localStorage.getItem('staggingData_v15');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.players) applyData(data);
      } catch(e) {}
    }

    fetchCloudData();

    // 3. Listen for Cloud Updates
    if (supabase) {
      const channel = supabase
        .channel('campaign_updates')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'campaign_state', filter: 'id=eq.1' }, 
          (payload) => {
            if (payload.new && payload.new.game_data) {
              applyData(payload.new.game_data);
            }
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  const applyData = (data) => {
    if (data.players) setPlayers(data.players);
    if (data.stalemate !== undefined) setStalemate(data.stalemate);
    if (data.epilogueMode !== undefined) setEpilogueMode(data.epilogueMode);
    if (data.lastRollRecord) setLastRollRecord(data.lastRollRecord);
  };

  // MAIN SAVE FUNCTION (Saves to both Cloud and Local)
  const syncState = async (newPlayers, newStalemate, newEpilogue, newRoll) => {
    // 1. Update React State (Instant UI)
    setPlayers(newPlayers);
    setStalemate(newStalemate);
    setEpilogueMode(newEpilogue);
    setLastRollRecord(newRoll);

    const gameData = { 
        players: newPlayers, 
        stalemate: newStalemate, 
        epilogueMode: newEpilogue, 
        lastRollRecord: newRoll 
    };

    // 2. Save to LocalStorage (Backup)
    localStorage.setItem('staggingData_v15', JSON.stringify(gameData));

    // 3. Send to Cloud (if online)
    if (supabase) {
        await supabase
          .from('campaign_state')
          .update({ game_data: gameData })
          .eq('id', 1);
    }
  };

  // --- GAME ACTIONS ---

  const resetData = async () => {
    if (!window.confirm("RESET CAMPAIGN FOR EVERYONE?")) return;
    const defaults = [
      { name: 'Christian', role: '', vp: 2, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Andreas', role: '', vp: 1, xp: 13, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Frederik', role: '', vp: 1, xp: 16, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Matias', role: '', vp: 3, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' }
    ];
    syncState(defaults, 0, false, { type: '-', value: '-' });
  };

  const rollDice = (sides) => {
    setDiceOverlay({ active: true, value: 1, type: sides, finished: false });
    let counter = 0;
    const interval = setInterval(() => {
      const randomVal = Math.floor(Math.random() * sides) + 1;
      setDiceOverlay(prev => ({ ...prev, value: randomVal }));
      counter++;
      
      if (counter > 20) { 
        clearInterval(interval);
        setDiceOverlay(prev => ({ ...prev, finished: true }));
        
        // Sync RESULT to everyone else
        const trueFinal = Math.floor(Math.random() * sides) + 1; 
        setDiceOverlay(prev => ({...prev, value: trueFinal}));
        
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

  const handleMarriage = (playerIndex, newSpouseName) => {
    const newPlayers = [...players];
    const currentPlayer = newPlayers[playerIndex];
    const oldSpouseName = currentPlayer.spouse;

    // Break old marriage
    if (oldSpouseName) {
        const oldSpouseIndex = newPlayers.findIndex(p => p.name === oldSpouseName);
        if (oldSpouseIndex !== -1) newPlayers[oldSpouseIndex].spouse = "";
    }

    // Set new marriage
    currentPlayer.spouse = newSpouseName;

    // Link target player
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

  const adjustValue = (index, field, amount) => {
    const newPlayers = [...players];
    let newVal = (newPlayers[index][field] || 0) + amount;
    if (field === 'xp') newVal = Math.max(0, Math.min(20, newVal));
    newPlayers[index][field] = newVal;
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const adjustStalemate = (amount) => {
    const newVal = Math.max(0, stalemate + amount);
    syncState(players, newVal, epilogueMode, lastRollRecord);
  };

  const toggleEpilogue = () => {
    syncState(players, stalemate, !epilogueMode, lastRollRecord);
  };

  // UI Helpers
  const nextPlayer = () => setActivePlayerIndex((prev) => (prev + 1) % players.length);
  const prevPlayer = () => setActivePlayerIndex((prev) => (prev - 1 + players.length) % players.length);
  const getLevel = (xp) => xp < 10 ? 1 : xp < 20 ? 2 : 3;
  const toggleRuleSection = (id) => setActiveRuleSection(activeRuleSection === id ? null : id);

  // --- FILE EXPORT (Backup) ---
  const exportData = () => {
    const data = JSON.stringify({ players, stalemate, epilogueMode, lastRollRecord }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stagging_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.players) {
            // CRITICAL: This pushes loaded data to the Cloud for everyone!
            syncState(
                data.players, 
                data.stalemate || 0, 
                data.epilogueMode || false, 
                data.lastRollRecord || { type: '-', value: '-' }
            );
            alert("File Loaded & Synced to Everyone!");
        }
      } catch (err) { alert("File error"); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- DATA HELPERS ---
  const getRoleAbilities = (role) => {
    const data = {
        'Doctor': ["When a creature enters play under your control, you may remove a counter from a permanent or player.", "Gain a Drunk counter: Target creature gains Metaxa until end of turn.", "Creatures under your control have Infect. At the end of your turn: Proliferate."],
        'Monk': ["Discard a card and pay (2) (sorcery speed) (max once pr turn): Place a Heresy counter on target player. Attacking creatures have +X/+0 where X is the number of Heresy counters on the defending player. When a player attacks a player with one or more Heresy counters, he draws a card.", "You may activate abilities of OGs and planeswalkers under your control twice per turn (as if the OG had two turns, so not the same ability twice if used on an OG).", "Tap 3 creatures under your control (sorcery speed): Put a random OG in play under your control. Sacrifice it if one or more of the tapped creatures become untapped. You can’t control more than one OG, this way, at a time."],
        'Smith': ["Artifact spells in your hand cost (1) less for every level you have.", "Equipped creatures under your control have Vigilance, Trample and Reach.", "Metalcraft (If you control 3 or more artifacts) you may discard a card to create a token that is a copy of target artifact. (Sorcery speed only and max once pr turn)."],
        'Knight': ["(1) discard a card to create a 1/2 Green horse creature token with Haste (Sorcery speed only).", "Equipped creatures you control have Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)", "Battalion (When you attack with 3 or more creatures): You may have a creature under your control fight target creature."],
        'Fool': ["Spells you cast on your opponent's turn cost (1) less. If you caused the King to die, you may gain his role for the rest of the battle.", "Creature spells in your hand have Ninjutsu equal to their CMC. (Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)", "(Same as Level 2) Creature spells in your hand have Ninjutsu equal to their CMC."],
        'King': ["Creatures under your control have +1/+1 for each of your levels.", "You may play an extra land during your turn and lands you control also have 'T: Add one mana of any colour.'", "You draw an extra card in your draw step."]
    };
    return data[role] || [];
  };

  const getRoleReward = (role) => {
    const rewards = { 'Doctor': 'Rewards: When one or more creatures die during your turn, gain 1 xp.', 'Monk': 'Rewards: Whenever your life total changes, gain 1 xp.', 'Smith': 'Rewards: When an artifact enters play under your control, gain 1 xp.', 'Knight': 'Rewards: Whenever one or more creatures under your control deal damage, gain 1 XP.', 'Fool': 'Rewards: Whenever you target an opponent or a permanent under his control with a spell or ability, gain 1 xp (max once pr turn)', 'King': 'Rewards: Every third time another player gains xp you gain 1 xp.' };
    return rewards[role] || '';
  };

  const getRoleIcon = (role) => {
      switch(role) { case 'Doctor': return <Heart size={12} />; case 'Monk': return <Scroll size={12} />; case 'Smith': return <Hammer size={12} />; case 'Knight': return <Shield size={12} />; case 'Fool': return <Ghost size={12} />; case 'King': return <Crown size={12} />; default: return null; }
  };

  const timelineData = [
      { title: "Battle 1: Repentance", type: "battle", desc: "All vs All, you may pay life instead of mana for your spells." },
      { title: "Post-Battle 1", type: "post", desc: "Bid i det sure løg #101 for each loser.\nQuilt draft a Booster." },
      { title: "Battle 2: Grand Melee", type: "battle", desc: "Creatures have haste and attack each turn if able." },
      { title: "Post-Battle 2", type: "post", desc: "Workout Session #114 (all buffs up).\nHousmann draft a booster. #107" },
      { title: "Battle 3: Hunters Loge", type: "battle", desc: "#59 Pre-battle, stack 3 OG’s facedown, when the top OG is defeated, the next OG is turned face up, it's cycle number (X) is equal to the cycle number of the defeated OG, and it becomes the new OG’s turn. The 3 OGs are treated as a single, combined OG.\n\nAs long as there is an OG in play, players may block for each other.\nUntil the first OG dies, players draw their cards from the library of the player to their left.\nAs long as the second OG is in play, players can’t pay mana for their own spells or abilities, but other players can transfer them mana from their manapools.\nAs long as the third OG is in play, each time the first player takes his turn, players must vote to skip their main phases or attack step until the first player's next turn. The top voted phases are skipped. If the vote is tied, both main phases and attack steps are skipped.\n\nIf the OG wins there is no King in the next battle.\nIf you cause an OG to die, gain a VP. If you die while an OG is in play, lose 5 XP and discard 3 random non-basic land cards." },
      { title: "Post-Battle 3", type: "post", desc: "Mobile Hammock: Minesweeper draft a land booster.\n#107" },
      { title: "Battle 4: Spikeball", type: "battle", desc: "All vs. All\nFlip a coin to decide the starting attack direction (left or right).\nStart of game: Shuffle 2 markers into each player's deck, when a marker is drawn, the attack direction changes. (The marker is shuffled back into the deck and the player draws another card).\nThe winner is the first player to eliminate the player in his attack direction (or when said player dies for another reason)." },
      { title: "Post-Battle 4", type: "post", desc: "Dinner a´la card: #105\nShuffle a booster, divide it into piles equal to the number of players. Reveal 1 pile. Players choose in turn (descending ranking order: 1, 2, 3, 4) to add one to their deck (you may skip your turn), until each player has had a turn. Then the pile is replaced with a new pile and the process is repeated with a new starting player (descending by rank: 2, 1, 3, 4, Then: 3, 1, 2, 4 and so on) until all players have had a turn with the starting pick.\nRemaining cards go in Skraldespanden.\nAny of the chosen cards may be added to your starting hand in the following battle. (Players draw cards for the starting hand, minus the number they chose to put in the starting hand)\nPlayers may, in ranking order, gain an available role or switch role with a non-King player of lower ranking." },
      { title: "Battle 5: Heidi's Bierbar", type: "battle", desc: "All vs All\nIn each player’s end step, he gains his choice of 2 Drunk- or 2 Poison counters.\nWhen a permanent, spell or ability you control causes a player to lose, you may gain his role.\nLast remaining player wins the campaign, if all the last players are killed at the same time (for example by a player-owned OG), the tie breaker is VP, then randomly." }
  ];

  // --- PLAYER CARD COMPONENT ---
  const PlayerCard = ({ player, index }) => {
    if (!player) return null;
    return (
        <div className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative h-full">
            <div className={`h-1 w-full ${['bg-red-600','bg-blue-600','bg-green-600','bg-yellow-600'][index]}`}></div>
            
            <div className="p-2 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center">
                <span className="w-full font-black text-lg text-center text-gray-200" style={{ fontFamily: 'Cinzel, serif' }}>{player.name}</span>
                {epilogueMode && <span className="text-[10px] text-gray-500 uppercase tracking-wide absolute right-2">Epilogue</span>}
            </div>

            <div className="flex-grow flex flex-col p-2 gap-2 overflow-hidden">
                {!epilogueMode ? (
                    <>
                        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                            <select value={player.role} onChange={(e) => updatePlayer(index, 'role', e.target.value)} className="bg-black text-gray-300 border border-gray-700 text-xs rounded p-2 font-bold focus:outline-none focus:border-yellow-600 w-full appearance-none hover:border-gray-500 transition-colors">
                                <option value="">-- No Role --</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Monk">Monk</option>
                                <option value="Smith">Smith</option>
                                <option value="Knight">Knight</option>
                                <option value="Fool">Fool</option>
                                <option value="King">King</option>
                            </select>
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[8px] text-gray-600 uppercase">Lvl</span>
                                <span className="text-xl font-bold text-blue-500" style={{ fontFamily: 'Cinzel, serif' }}>{getLevel(player.xp)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                <span className="text-[8px] text-blue-500 font-bold">XP</span>
                                <div className="flex items-center gap-1 w-full justify-between px-1">
                                    <button onClick={() => adjustValue(index, 'xp', -1)} className="text-gray-600 hover:text-white">-</button>
                                    <span className="font-mono text-lg font-bold">{player.xp}</span>
                                    <button onClick={() => adjustValue(index, 'xp', 1)} className="text-gray-600 hover:text-white">+</button>
                                </div>
                            </div>
                            <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                <span className="text-[8px] text-green-500 font-bold">VP</span>
                                <div className="flex items-center gap-1 w-full justify-between px-1">
                                    <button onClick={() => adjustValue(index, 'vp', -1)} className="text-gray-600 hover:text-white">-</button>
                                    <span className="font-mono text-lg font-bold text-green-400">{player.vp}</span>
                                    <button onClick={() => adjustValue(index, 'vp', 1)} className="text-gray-600 hover:text-white">+</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow bg-black/40 border border-gray-800 rounded p-2 overflow-y-auto custom-scrollbar relative">
                            <div className="absolute top-1 right-2 text-yellow-700 opacity-50">{getRoleIcon(player.role)}</div>
                            {player.role ? (
                                <div className="text-xs text-gray-400 leading-normal space-y-3">
                                    {getRoleAbilities(player.role).map((txt, i) => {
                                        const lvl = i + 1;
                                        const isUnlocked = getLevel(player.xp) >= lvl;
                                        return (
                                            <div key={i} className={`flex gap-2 ${isUnlocked ? 'text-green-300' : 'text-gray-600'}`}>
                                                <span className="font-bold whitespace-nowrap text-[10px] mt-0.5">Lvl {lvl}:</span>
                                                <span>{txt}</span>
                                            </div>
                                        )
                                    })}
                                    <div className="w-full h-px bg-gray-800 my-2"></div>
                                    <div className="text-yellow-600 italic text-[10px]">{getRoleReward(player.role)}</div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-gray-700 italic">Select Role</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col gap-4 justify-center">
                        <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[9px] text-indigo-400 uppercase font-bold flex items-center gap-1"><Users size={10}/> Marriage</label>
                            </div>
                            <select value={player.spouse} onChange={(e) => handleMarriage(index, e.target.value)} className="w-full bg-black text-gray-300 border border-gray-700 rounded p-2 text-xs focus:outline-none focus:border-indigo-500">
                                <option value="">Single (Unmarried)</option>
                                {players.filter(p => p.name !== player.name).map((p, i) => (
                                    <option key={i} value={p.name}>Married to {p.name}</option>
                                ))}
                            </select>
                            {player.spouse && (
                                <div className="mt-2 text-[10px] text-pink-300 italic bg-black/40 p-2 rounded border border-pink-500/20 leading-tight">
                                    ❤️ <strong>Rules:</strong> Shared Library. Cannot attack each other. 
                                    <br/>💔 <strong>Divorce (Sorcery):</strong> Give hand to partner to leave.
                                </div>
                            )}
                        </div>
                        <div className="bg-purple-900/20 p-2 rounded border border-purple-500/30 flex justify-between items-center">
                            <span className="text-[9px] text-purple-400 font-bold uppercase">Drunk</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => adjustValue(index, 'drunk', -1)} className="text-gray-500 hover:text-white">-</button>
                                <span className="text-xl font-bold text-purple-400 w-6 text-center">{player.drunk}</span>
                                <button onClick={() => adjustValue(index, 'drunk', 1)} className="text-gray-500 hover:text-white">+</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-800">
                    <div className="bg-red-900/10 rounded border border-red-900/30 flex flex-col items-center p-1">
                        <span className="text-[8px] text-red-600 font-bold uppercase mb-1">LIFE</span>
                        <div className="flex w-full justify-between px-2 items-center">
                            <button onClick={() => adjustValue(index, 'lt', -1)} className="text-gray-500 hover:text-white font-bold">-</button>
                            <span className="text-xl font-mono font-bold text-red-500">{player.lt}</span>
                            <button onClick={() => adjustValue(index, 'lt', 1)} className="text-gray-500 hover:text-white font-bold">+</button>
                        </div>
                    </div>
                    <div className="bg-blue-900/10 rounded border border-blue-900/30 flex flex-col items-center p-1">
                        <span className="text-[8px] text-blue-600 font-bold uppercase mb-1">HAND</span>
                        <div className="flex w-full justify-between px-2 items-center">
                            <button onClick={() => adjustValue(index, 'hs', -1)} className="text-gray-500 hover:text-white font-bold">-</button>
                            <span className="text-xl font-mono font-bold text-blue-500">{player.hs}</span>
                            <button onClick={() => adjustValue(index, 'hs', 1)} className="text-gray-500 hover:text-white font-bold">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-gray-300 font-sans relative flex">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <style>{`@keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .nebula-bg { background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000); background-size: 400% 400%; animation: nebula 15s ease infinite; }`}</style>
        <div className="w-full h-full nebula-bg"></div>
      </div>

      {/* Dice Overlay */}
      {diceOverlay.active && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
            <style>{`@keyframes chaos { 0% { transform: rotate(0deg) scale(0.5); } 100% { transform: rotate(360deg) scale(1); } } @keyframes landing { 0% { transform: scale(3); opacity: 0; } 50% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1); } } .rolling-anim { animation: chaos 0.1s infinite linear; opacity: 0.7; color: #444; } .landed-anim { animation: landing 0.4s ease-out forwards; text-shadow: 0 0 50px #d4af37; color: #d4af37; transform: scale(1.5); }`}</style>
            <div className={`font-black text-[20rem] fantasy-font leading-none ${diceOverlay.finished ? 'landed-anim' : 'rolling-anim'}`}>{diceOverlay.value}</div>
        </div>
      )}

      {/* MAIN APP AREA */}
      <div className={`flex-grow flex flex-col p-2 gap-2 relative z-10 transition-all duration-300 ${showRules ? 'w-full md:w-2/3' : 'w-full'}`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#111]/90 backdrop-blur border-b border-white/10 p-2 rounded-lg shrink-0 gap-2">
            <div className="flex flex-col shrink-0">
                <h1 className="text-sm md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>STAGGING IT UP</h1>
                {isConnected ? <div className="text-[8px] text-green-500 flex items-center gap-1 uppercase tracking-wider"><Wifi size={8}/> Connected</div> : <div className="text-[8px] text-gray-600 flex items-center gap-1 uppercase tracking-wider"><WifiOff size={8}/> Offline Mode</div>}
            </div>

            <div className="bg-black/60 border border-red-900/30 rounded flex items-center px-2 gap-2">
                <div className="hidden md:flex text-[10px] text-red-500 font-bold uppercase items-center gap-1"><Skull size={10} /> Stalemate</div>
                <div className="md:hidden text-red-500"><Skull size={14} /></div>
                <div className="flex items-center gap-1">
                    <button onClick={() => adjustStalemate(-1)} className="text-gray-500 hover:text-white font-bold w-4">-</button>
                    <span className="text-xl font-mono font-bold text-white w-6 text-center">{stalemate}</span>
                    <button onClick={() => adjustStalemate(1)} className="text-gray-500 hover:text-white font-bold w-4">+</button>
                </div>
            </div>

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
                <div className="bg-black border border-yellow-600/50 rounded px-2 py-1 flex flex-col items-center justify-center min-w-[50px] shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                    <span className="text-[8px] text-gray-500 uppercase">D{lastRollRecord.type}</span>
                    <span className="text-lg font-bold text-yellow-500 leading-none">{lastRollRecord.value}</span>
                </div>
            </div>

            <div className="flex gap-1">
                <button onClick={exportData} className="p-2 hover:bg-white/10 rounded text-green-500"><Save size={16}/></button>
                <label className="p-2 hover:bg-white/10 rounded text-blue-500 cursor-pointer" title="Load"><Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" /></label>
                <button onClick={toggleEpilogue} className={`p-2 hover:bg-white/10 rounded ${epilogueMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} title="Epilogue"><Crown size={16}/></button>
                <button onClick={resetData} className="p-2 hover:bg-white/10 rounded text-red-500" title="Reset"><RefreshCw size={16}/></button>
                <button onClick={() => setShowRules(!showRules)} className={`hidden md:block p-2 rounded border border-yellow-700/50 ${showRules ? 'bg-yellow-900/50 text-white' : 'hover:bg-white/10 text-yellow-600'}`} title="Rules"><BookOpen size={16}/></button>
            </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:grid grid-cols-4 gap-2 flex-grow min-h-0">
            {players.map((player, index) => <PlayerCard key={index} player={player} index={index} />)}
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-grow items-center justify-center relative overflow-hidden">
            <button onClick={prevPlayer} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-all border border-gray-700 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
            <div className="w-full h-full p-1"><PlayerCard player={players[activePlayerIndex]} index={activePlayerIndex} /></div>
            <button onClick={nextPlayer} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-all border border-gray-700 shadow-lg active:scale-95"><ChevronRight size={24} /></button>
        </div>
      </div>

      {/* --- CODEX PANE --- */}
      <div className={`fixed right-0 top-0 bottom-0 z-40 bg-[#0f0f13]/95 backdrop-blur-xl border-l border-yellow-900/30 shadow-2xl transition-all duration-300 flex flex-col ${showRules ? 'w-full md:w-1/3 translate-x-0' : 'w-full md:w-1/3 translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-yellow-500" style={{ fontFamily: 'Cinzel, serif' }}>Codex</h2>
            <button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-2 text-sm text-gray-300 custom-scrollbar pb-20">
            
            <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                <button onClick={() => toggleRuleSection('core')} className={`w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between hover:bg-white/5 transition-colors ${activeRuleSection === 'core' ? 'text-blue-300 bg-white/5' : 'text-blue-500'}`}>
                    <span><Info size={12} className="inline mr-2"/> Core Rules</span>
                    <span>{activeRuleSection === 'core' ? '−' : '+'}</span>
                </button>
                {activeRuleSection === 'core' && (
                    <div className="p-3 border-t border-gray-800 space-y-3 text-xs leading-relaxed text-gray-400">
                        <p><strong>Setup:</strong> 4-5 players, 5 battles, 6 boosters and a land booster. HS 6, LT 15. Dual land market is 2 x types (20) = 40 cards.</p>
                        <p><strong>Bidding & Roles:</strong> At the beginning of the campaign players secretly bid a number to subtract from their LT. Players choose a non-King-role to gain, starting with the highest bidder and then in descending order. Only one player can have a role at a time.</p>
                        <p><strong>King Role:</strong> When a player wins a battle, he gains the King role for the next battle.</p>
                        <p><strong>Role Selection:</strong> At the beginning of a battle, all non-King players may gain an available role, in descending ranking order.</p>
                        <p><strong>Dead Players:</strong> After a player is dead in battle 1-4 other players can’t gain more XP in that battle (except rewards based on the outcome of the battle).</p>
                        <p><strong>Levels:</strong> Level 1 (&lt; 10 xp), Level 2 (10 xp), Level 3 (20 xp). Players can’t have more than 20 xp or less than 0.</p>
                        <p><strong>Ranking:</strong> Player ranking is determined by the number of VPs, if tied, the most recent wins count highest. Gain a VP by winning a battle. The winner of the campaign is the winner of the final battle.</p>
                        <p><strong>Mulligans:</strong> If you want to mulligan your starting hand, you may shuffle your hand and draw a new hand, then, before looking at it, put one card from your hand on the bottom of your library. For each time you mulligan, put an extra card on the bottom of your library.</p>
                        <p><strong>Draw-out:</strong> If, at any point, you can’t draw a card from your library you may instead sacrifice a non-land permanent. If you don’t, you lose 2 life.</p>
                        <p><strong>Stalemate:</strong> The moment 2 players are left in any battle, put a timer dice to 1. Increase it at the beginning of turns. When it reaches 10 (in consensus only), the battle ends and the winner is the player with the most lives, if tied, the most non-land permanents in play, if tied, the most cards on hand, if tied, the most cards left in his library.</p>
                    </div>
                )}
            </div>

            <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                <button onClick={() => toggleRuleSection('roles')} className={`w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between hover:bg-white/5 transition-colors ${activeRuleSection === 'roles' ? 'text-green-300 bg-white/5' : 'text-green-500'}`}>
                    <span><Crown size={12} className="inline mr-2"/> Roles</span>
                    <span>{activeRuleSection === 'roles' ? '−' : '+'}</span>
                </button>
                {activeRuleSection === 'roles' && (
                    <div className="p-3 border-t border-gray-800 space-y-4 text-xs leading-relaxed text-gray-400">
                        {['Doctor','Monk','Smith','Knight','Fool','King'].map(r => (
                            <div key={r} className="border-b border-gray-800 last:border-0 pb-2">
                                <strong className="text-yellow-600 block mb-1 uppercase">{r}</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    {getRoleAbilities(r).map((ab, i) => <li key={i}>{ab}</li>)}
                                    <li className="text-yellow-500/80 italic">{getRoleReward(r)}</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {timelineData.map((event, i) => (
                <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                    <button onClick={() => toggleRuleSection(`event-${i}`)} className={`w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between hover:bg-white/5 transition-colors ${activeRuleSection === `event-${i}` ? (event.type === 'battle' ? 'text-red-300 bg-white/5' : 'text-blue-300 bg-white/5') : (event.type === 'battle' ? 'text-red-500' : 'text-blue-500')}`}>
                        <span>{event.type === 'battle' ? <Sword size={12} className="inline mr-2"/> : <Beer size={12} className="inline mr-2"/>} {event.title}</span>
                        <span>{activeRuleSection === `event-${i}` ? '−' : '+'}</span>
                    </button>
                    {activeRuleSection === `event-${i}` && (
                        <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{event.desc}</div>
                    )}
                </div>
            ))}

            <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                <button onClick={() => toggleRuleSection('epi')} className={`w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between hover:bg-white/5 transition-colors ${activeRuleSection === 'epi' ? 'text-indigo-300 bg-white/5' : 'text-indigo-500'}`}>
                    <span><Clock size={12} className="inline mr-2"/> Epilogue</span>
                    <span>{activeRuleSection === 'epi' ? '−' : '+'}</span>
                </button>
                {activeRuleSection === 'epi' && (
                    <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 space-y-2">
                        <p>The Role and XP system is abandoned. Booster draft a non mono booster #105.</p>
                        <strong className="text-white block mt-2">The Day After (All vs All)</strong>
                        <p>Players start with a number of Drunk counters corresponding to their inverse placement in the previous battle (Last place starts with 3 Drunk counter, second last with 4 Drunk counters and so on).</p>
                        <p>When a Drunk counter is removed from a player he draws a card.</p>
                        <p>Sober Up: At the beginning of your upkeep, you may pay 1 (so 2 because you’re Drunk) mana to remove a Drunk counter.</p>
                        <p>All spells have “Rather than cast this card from your hand, you must pay its mana cost and exile it with a time counter on it. At the beginning of your upkeep, remove a time counter. When the last is removed, cast it without paying its mana cost.“ and all creatures enter tapped.</p>
                        <p>Last place gains +1 LT, second last +2 LT and so on. LTs can exceed 20.</p>
                        <strong className="text-white block mt-2">The Big Day (All vs All)</strong>
                        <p>The winner of the previous battle proposes marriage to another player. That player may refuse. If a player accepts, the 2 become married. The winner continues asking other players until one accepts. The final player asked, can’t refuse.</p>
                        <p>The highest ranked remaining player repeats the proposal process with the remaining unmarried player(s).</p>
                        <p>The married players shuffle their decks and share a library (the library remains in play when one of the married players dies).</p>
                        <p>Married players can’t attack each other unless they are the only remaining players.</p>
                        <p>A player may end the marriage with his partner with sorcery speed by giving all cards in his hand to the abandoned partner.</p>
                        <p>2 unmarried players may marry with sorcery speed. As long as they remain married, they may draw from the other players library.</p>
                        <p>The final remaining player wins the Epilogue of Stagging It Up.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <button onClick={() => setShowRules(!showRules)} className="md:hidden fixed bottom-4 right-4 bg-yellow-600 text-black p-4 rounded-full shadow-2xl z-50 border-2 border-yellow-400 active:scale-95"><BookOpen size={24} /></button>
    </div>
  );
};

export default CampaignManager;
