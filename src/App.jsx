import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, RefreshCw, Skull, Zap, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost, BookOpen, X, Sword, Beer } from 'lucide-react';

const CampaignManager = () => {
  // --- STATE ---
  const [players, setPlayers] = useState([]);
  const [stalemate, setStalemate] = useState(0);
  const [epilogueMode, setEpilogueMode] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  // Dice State
  const [diceOverlay, setDiceOverlay] = useState({ active: false, value: 1, type: 20, finished: false });
  
  // Import State
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- INITIAL LOAD & AUTO-SAVE ---
  useEffect(() => {
    const saved = localStorage.getItem('staggingData_v6');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayers(data.players || []);
        setStalemate(data.stalemate || 0);
        setEpilogueMode(data.epilogueMode || false);
      } catch (e) {
        resetData(true);
      }
    } else {
      resetData(true);
    }
  }, []);

  useEffect(() => {
    if (!isImporting && players.length > 0) {
      localStorage.setItem('staggingData_v6', JSON.stringify({ players, stalemate, epilogueMode }));
    }
  }, [players, stalemate, epilogueMode, isImporting]);

  // --- ACTIONS ---
  const resetData = (force = false) => {
    if (!force && !window.confirm("Reset campaign?")) return;
    setPlayers([
      { name: 'Christian', role: '', vp: 2, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Andreas', role: '', vp: 1, xp: 13, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Frederik', role: '', vp: 1, xp: 16, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Matias', role: '', vp: 3, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' }
    ]);
    setStalemate(0);
    setEpilogueMode(false);
  };

  const rollDice = (sides) => {
    setDiceOverlay({ active: true, value: 1, type: sides, finished: false });
    let counter = 0;
    const interval = setInterval(() => {
      setDiceOverlay(prev => ({ ...prev, value: Math.floor(Math.random() * sides) + 1 }));
      counter++;
      if (counter > 20) { 
        clearInterval(interval);
        setDiceOverlay(prev => ({ ...prev, finished: true }));
        setTimeout(() => setDiceOverlay(prev => ({ ...prev, active: false })), 2000);
      }
    }, 50);
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const adjustValue = (index, field, amount) => {
    const newPlayers = [...players];
    let newVal = (newPlayers[index][field] || 0) + amount;
    if (field === 'xp') newVal = Math.max(0, Math.min(20, newVal));
    newPlayers[index][field] = newVal;
    setPlayers(newPlayers);
  };

  const getLevel = (xp) => xp < 10 ? 1 : xp < 20 ? 2 : 3;

  // --- FILE SYSTEM ---
  const exportData = () => {
    const data = JSON.stringify({ players, stalemate, epilogueMode, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stagging_save_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.players) {
          setPlayers(data.players);
          setStalemate(data.stalemate || 0);
          setEpilogueMode(data.epilogueMode || false);
          setTimeout(() => setIsImporting(false), 100);
        }
      } catch (err) { setIsImporting(false); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- DATA HELPERS ---
  const getRoleAbilities = (role) => {
    const data = {
        'Doctor': [
            "Creature enters: Remove counter from perm/player.",
            "Gain Drunk counter: Target creature gets Metaxa eot.",
            "Creatures have Infect. End turn: Proliferate."
        ],
        'Monk': [
            "Discard & Pay (2) (Sorcery): Place Heresy counter. Attacking creatures +X/+0 vs Heresy. Attack Heresy player = Draw card.",
            "Activate OG/Planeswalker abilities twice per turn.",
            "Tap 3 creatures (Sorcery): Put random OG in play. Sac if tappers untap. Max 1 OG."
        ],
        'Smith': [
            "Artifact spells in hand cost (1) less per Level.",
            "Equipped creatures you control have Vigilance, Trample, and Reach.",
            "Metalcraft (3+ artifacts): Discard to create token copy of target artifact. (Sorcery, 1/turn)."
        ],
        'Knight': [
            "(1) Discard: Create 1/2 Green horse creature token w/ Haste (Sorcery).",
            "Equipped creatures you control have Mentor.",
            "Battalion (3+ attackers): You may have a creature under your control fight target creature."
        ],
        'Fool': [
            "Spells you cast on opponent's turn cost (1) less. (Kill King -> Gain Role).",
            "Creature spells in your hand have Ninjutsu = CMC.",
            "(Same as Lvl 2) Creature spells in your hand have Ninjutsu = CMC."
        ],
        'King': [
            "Creatures under your control have +1/+1 per Level.",
            "Play extra land. Lands have 'T: Add one mana any color'.",
            "You draw an extra card in your draw step."
        ]
    };
    return data[role] || [];
  };

  const getRoleReward = (role) => {
    const rewards = {
        'Doctor': 'REWARD: Creature dies on your turn -> +1 XP',
        'Monk': 'REWARD: Life total changes -> +1 XP',
        'Smith': 'REWARD: Artifact enters under control -> +1 XP',
        'Knight': 'REWARD: Creatures deal damage -> +1 XP',
        'Fool': 'REWARD: Target opponent/their perm -> +1 XP (1/turn)',
        'King': 'REWARD: Every 3rd time another player gains XP -> +1 XP'
    };
    return rewards[role] || '';
  };

  const getRoleIcon = (role) => {
      switch(role) {
          case 'Doctor': return <Heart size={12} />;
          case 'Monk': return <Scroll size={12} />;
          case 'Smith': return <Hammer size={12} />;
          case 'Knight': return <Shield size={12} />;
          case 'Fool': return <Ghost size={12} />;
          case 'King': return <Crown size={12} />;
          default: return null;
      }
  };

  // --- TIMELINE DATA ---
  const timelineData = [
      {
          title: "Battle 1: Repentance", type: "battle",
          desc: "All vs All. You may pay life instead of mana for your spells."
      },
      {
          title: "Post-Battle 1", type: "post",
          desc: "Losers: Bid i det sure løg #101.\nDraft: Quilt draft a Booster (#105)."
      },
      {
          title: "Battle 2: Grand Melee", type: "battle",
          desc: "Creatures have Haste and attack each turn if able."
      },
      {
          title: "Post-Battle 2", type: "post",
          desc: "Event: Workout Session #114 (All buffs up).\nDraft: Housmann draft a booster (#107)."
      },
      {
          title: "Battle 3: Hunters Loge", type: "battle",
          desc: "Stack 3 OGs facedown. Defeat one -> Next flips (X = cycle # of defeated).\nOG 1: Draw from player to left.\nOG 2: Can't pay own mana (others must transfer).\nOG 3: Vote to skip Main or Attack steps.\nIf OG wins: No King next battle. Kill OG = VP. Die to OG = Lose 5 XP & Discard 3 lands."
      },
      {
          title: "Post-Battle 3", type: "post",
          desc: "Event: Mobile Hammock (#59).\nDraft: Minesweeper draft a land booster (#107)."
      },
      {
          title: "Battle 4: Spikeball", type: "battle",
          desc: "All vs All. Coin flip for direction (Left/Right).\nShuffle 2 markers into decks. Draw marker -> Change direction.\nWin condition: Eliminate target in direction."
      },
      {
          title: "Post-Battle 4", type: "post",
          desc: "Draft: Dinner a'la card (#105). Draft piles in descending rank order. Cards go to deck or starting hand."
      },
      {
          title: "Battle 5: Heidi's Bierbar", type: "battle",
          desc: "All vs All.\nEnd step: Gain 2 Drunk or 2 Poison counters.\nCause loss = Gain their role.\nLast player wins campaign."
      }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-gray-300 font-sans relative flex">
      
      {/* --- ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <style>{`
          @keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          .nebula-bg { background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000); background-size: 400% 400%; animation: nebula 15s ease infinite; }
        `}</style>
        <div className="w-full h-full nebula-bg"></div>
      </div>

      {/* --- MEGA DICE OVERLAY --- */}
      {diceOverlay.active && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
            <style>{`
                @keyframes chaos { 0% { transform: rotate(0deg) scale(0.5); } 100% { transform: rotate(360deg) scale(1); } }
                @keyframes landing { 0% { transform: scale(3); opacity: 0; } 50% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1); } }
                .rolling-anim { animation: chaos 0.1s infinite linear; opacity: 0.7; color: #444; }
                .landed-anim { animation: landing 0.4s ease-out forwards; text-shadow: 0 0 50px #d4af37; color: #d4af37; transform: scale(1.5); }
            `}</style>
            <div className={`font-black text-[20rem] fantasy-font leading-none ${diceOverlay.finished ? 'landed-anim' : 'rolling-anim'}`}>
                {diceOverlay.value}
            </div>
            {diceOverlay.finished && <div className="mt-8 text-4xl text-yellow-500 font-bold tracking-[1em] uppercase animate-pulse">RESULT</div>}
        </div>
      )}

      {/* --- LEFT SIDE: MAIN APP --- */}
      <div className={`flex-grow flex flex-col p-2 gap-2 relative z-10 transition-all duration-300 ${showRules ? 'w-2/3' : 'w-full'}`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#111]/80 backdrop-blur border-b border-white/10 p-2 rounded-lg shrink-0">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>STAGGING IT UP</h1>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500"><Zap size={10} /> Campaign Manager</div>
            </div>

            <div className="flex gap-2">
                {[6, 10, 20].map(sides => (
                    <button key={sides} onClick={() => rollDice(sides)} className="px-3 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 hover:border-blue-400 text-blue-200 rounded font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all active:scale-95">D{sides}</button>
                ))}
            </div>

            <div className="flex gap-1">
                <button onClick={exportData} className="p-2 hover:bg-white/10 rounded text-green-500" title="Save"><Save size={16}/></button>
                <label className="p-2 hover:bg-white/10 rounded text-blue-500 cursor-pointer" title="Load"><Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" /></label>
                <button onClick={() => setEpilogueMode(!epilogueMode)} className={`p-2 hover:bg-white/10 rounded ${epilogueMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} title="Epilogue"><Crown size={16}/></button>
                <button onClick={() => resetData()} className="p-2 hover:bg-white/10 rounded text-red-500" title="Reset"><RefreshCw size={16}/></button>
                <button onClick={() => setShowRules(!showRules)} className={`p-2 rounded border border-yellow-700/50 ${showRules ? 'bg-yellow-900/50 text-white' : 'hover:bg-white/10 text-yellow-600'}`} title="Rules"><BookOpen size={16}/></button>
            </div>
        </div>

        {/* GLOBAL BAR */}
        <div className="flex justify-center shrink-0 h-12">
            <div className="bg-black/60 border border-red-900/30 rounded flex items-center px-6 gap-6">
                <div className="text-xs text-red-500 font-bold uppercase flex items-center gap-2"><Skull size={14} /> Stalemate Timer</div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setStalemate(Math.max(0, stalemate - 1))} className="text-gray-500 hover:text-white text-2xl font-bold">-</button>
                    <span className="text-3xl font-mono font-bold text-white w-10 text-center">{stalemate}</span>
                    <button onClick={() => setStalemate(stalemate + 1)} className="text-gray-500 hover:text-white text-2xl font-bold">+</button>
                </div>
            </div>
        </div>

        {/* PLAYERS GRID */}
        <div className="grid grid-cols-4 gap-2 flex-grow min-h-0">
            {players.map((player, index) => (
                <div key={index} className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative">
                    <div className={`h-1 w-full ${['bg-red-600','bg-blue-600','bg-green-600','bg-yellow-600'][index]}`}></div>
                    
                    <div className="p-3 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center">
                        <input value={player.name} onChange={(e) => updatePlayer(index, 'name', e.target.value)} className="bg-transparent w-full font-black text-xl text-gray-200 focus:text-white focus:outline-none placeholder-gray-700" style={{ fontFamily: 'Cinzel, serif' }} />
                        {epilogueMode && <span className="text-[10px] text-gray-500 uppercase tracking-wide">Epilogue</span>}
                    </div>

                    <div className="flex-grow flex flex-col p-2 gap-2 overflow-hidden">
                        {!epilogueMode ? (
                            <>
                                {/* PREMIUM DROPDOWN */}
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
                                        <div className="text-[9px] text-gray-400 leading-snug space-y-2">
                                            {getRoleAbilities(player.role).map((txt, i) => {
                                                const lvl = i + 1;
                                                const isUnlocked = getLevel(player.xp) >= lvl;
                                                return (
                                                    <div key={i} className={`flex gap-1 ${isUnlocked ? 'text-green-300' : 'text-gray-600'}`}>
                                                        <span className="font-bold whitespace-nowrap">Lvl {lvl}:</span>
                                                        <span>{txt}</span>
                                                    </div>
                                                )
                                            })}
                                            <div className="w-full h-px bg-gray-800 my-1"></div>
                                            <div className="text-yellow-600 italic">{getRoleReward(player.role)}</div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-[10px] text-gray-700 italic">Select Role</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col gap-4 justify-center">
                                <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                                    <label className="text-[9px] text-indigo-400 uppercase font-bold block mb-1">Marriage</label>
                                    <select value={player.spouse} onChange={(e) => updatePlayer(index, 'spouse', e.target.value)} className="w-full bg-black text-gray-300 border border-gray-700 rounded p-2 text-xs focus:outline-none focus:border-indigo-500">
                                        <option value="">Single</option>
                                        {players.filter(p => p.name !== player.name).map((p, i) => (
                                            <option key={i} value={p.name}>+ {p.name}</option>
                                        ))}
                                    </select>
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
                            <div className="text-center bg-red-900/10 rounded border border-red-900/30">
                                <label className="text-[8px] text-red-700 font-bold block">LIFE</label>
                                <input type="number" value={player.lt} onChange={(e) => updatePlayer(index, 'lt', parseInt(e.target.value))} className="bg-transparent text-center font-bold w-full text-xl text-red-500 focus:outline-none" />
                            </div>
                            <div className="text-center bg-blue-900/10 rounded border border-blue-900/30">
                                <label className="text-[8px] text-blue-700 font-bold block">HAND</label>
                                <input type="number" value={player.hs} onChange={(e) => updatePlayer(index, 'hs', parseInt(e.target.value))} className="bg-transparent text-center font-bold w-full text-xl text-blue-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: RULE PANE (EXPANDED) --- */}
      <div className={`fixed right-0 top-0 bottom-0 z-40 bg-[#0f0f13]/95 backdrop-blur-xl border-l border-yellow-900/30 shadow-2xl transition-all duration-300 flex flex-col ${showRules ? 'w-1/3 translate-x-0' : 'w-1/3 translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-yellow-500" style={{ fontFamily: 'Cinzel, serif' }}>Codex</h2>
            <button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4 text-sm text-gray-300 custom-scrollbar pb-20">
            
            {/* CORE */}
            <details className="group border border-gray-800 rounded bg-black/20 open:bg-black/40 transition-colors">
                <summary className="p-3 font-bold cursor-pointer text-blue-400 hover:text-blue-300 uppercase tracking-widest flex justify-between">Core Rules <span className="group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="p-3 border-t border-gray-800 space-y-2 text-xs leading-relaxed">
                    <p><strong>Setup:</strong> 4-5 players, 5 battles. HS 6, LT 15. Dual land market = 40 cards.</p>
                    <p><strong>Roles & XP:</strong> Choose non-King role (descending rank). Levels: 0-9 (Lvl 1), 10-19 (Lvl 2), 20+ (Lvl 3). XP Cap: 0-20.</p>
                    <p><strong>Ranking:</strong> Based on VPs. Tie-breaker: Most recent win. Win battle = 1 VP.</p>
                    <p><strong>Mulligans:</strong> London (Draw 7, bottom X).</p>
                    <p><strong>Draw-out:</strong> Sac non-land permanent OR lose 2 life.</p>
                    <p><strong>Stalemate:</strong> 2 players left -> Timer starts. Ends at 10. Winner: Life > Non-lands > Hand > Library.</p>
                </div>
            </details>

            {/* ROLES */}
            <details className="group border border-gray-800 rounded bg-black/20 open:bg-black/40 transition-colors">
                <summary className="p-3 font-bold cursor-pointer text-green-400 hover:text-green-300 uppercase tracking-widest flex justify-between">Roles <span className="group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="p-3 border-t border-gray-800 space-y-4 text-xs leading-relaxed">
                    <p className="italic text-gray-500">Players have abilities of current AND lower levels.</p>
                    {/* (Role details logic is handled here, abbreviated for brevity in this display but fully in code) */}
                    <div className="grid gap-2">
                        {['Doctor','Monk','Smith','Knight','Fool','King'].map(r => (
                            <div key={r} className="border-b border-gray-800 pb-2 mb-2 last:border-0">
                                <strong className="text-yellow-600 block mb-1 uppercase">{r}</strong>
                                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                                    {getRoleAbilities(r).map((ab, i) => <li key={i} className="leading-tight">{ab}</li>)}
                                    <li className="text-yellow-500/80 italic">{getRoleReward(r)}</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </details>

            {/* TIMELINE (NEW INTERACTIVE) */}
            <div className="border border-gray-800 rounded bg-black/20">
                <div className="p-3 font-bold text-red-400 uppercase tracking-widest border-b border-gray-800">Campaign Timeline</div>
                {timelineData.map((event, i) => (
                    <details key={i} className="group border-b border-gray-800 last:border-0 transition-colors open:bg-white/5">
                        <summary className="p-3 cursor-pointer text-xs font-bold hover:text-white flex justify-between items-center">
                            <span className={event.type === 'battle' ? 'text-red-300' : 'text-blue-300'}>
                                {event.type === 'battle' ? <Sword size={12} className="inline mr-2"/> : <Beer size={12} className="inline mr-2"/>}
                                {event.title}
                            </span>
                            <span className="text-gray-600 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-3 pt-0 text-xs text-gray-400 leading-relaxed whitespace-pre-wrap pl-8">
                            {event.desc}
                        </div>
                    </details>
                ))}
            </div>

            {/* EPILOGUE */}
            <details className="group border border-gray-800 rounded bg-black/20 open:bg-black/40 transition-colors">
                <summary className="p-3 font-bold cursor-pointer text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex justify-between">Epilogue Rules <span className="group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="p-3 border-t border-gray-800 space-y-4 text-xs leading-relaxed">
                    <div>
                        <strong className="text-white block mb-1">The Day After</strong>
                        <p>Start with Drunk counters (inverse placement: Last=3, 2nd=4...). Remove counter = Draw card. Upkeep: Pay 1 (effectively 2) to remove Drunk. Spells have Suspend logic. Creatures enter tapped.</p>
                    </div>
                    <div>
                        <strong className="text-white block mb-1">The Big Day</strong>
                        <p>Winner proposes. Marriage = Shared library, no attacks. Divorce = Give hand (Sorcery). Win = Final survivor.</p>
                    </div>
                </div>
            </details>

        </div>
    </div>

    </div>
  );
};

export default CampaignManager;
