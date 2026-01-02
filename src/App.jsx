import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, RefreshCw, Skull, Zap, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost, BookOpen, X } from 'lucide-react';

const CampaignManager = () => {
  // --- STATE ---
  const [players, setPlayers] = useState([]);
  const [stalemate, setStalemate] = useState(0);
  const [epilogueMode, setEpilogueMode] = useState(false);
  const [currentBattle, setCurrentBattle] = useState('Heidi');
  const [showRules, setShowRules] = useState(false);
  
  // Dice State
  const [diceOverlay, setDiceOverlay] = useState({ active: false, value: 1, type: 20, finished: false });
  
  // Import State
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- INITIAL LOAD & AUTO-SAVE ---
  useEffect(() => {
    const saved = localStorage.getItem('staggingData_v5');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayers(data.players || []);
        setStalemate(data.stalemate || 0);
        setEpilogueMode(data.epilogueMode || false);
        setCurrentBattle(data.currentBattle || 'Heidi');
      } catch (e) {
        resetData(true);
      }
    } else {
      resetData(true);
    }
  }, []);

  useEffect(() => {
    if (!isImporting && players.length > 0) {
      localStorage.setItem('staggingData_v5', JSON.stringify({ players, stalemate, epilogueMode, currentBattle }));
    }
  }, [players, stalemate, epilogueMode, currentBattle, isImporting]);

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
    setCurrentBattle('Heidi');
  };

  const rollDice = (sides) => {
    setDiceOverlay({ active: true, value: 1, type: sides, finished: false });
    
    let counter = 0;
    const interval = setInterval(() => {
      // Random numbers showing while rolling
      setDiceOverlay(prev => ({ ...prev, value: Math.floor(Math.random() * sides) + 1 }));
      counter++;
      
      if (counter > 20) { // Stop after approx 1 second
        clearInterval(interval);
        // Set finished state to show result clearly
        setDiceOverlay(prev => ({ ...prev, finished: true }));
        
        // Hide overlay after 2 seconds
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
    const data = JSON.stringify({ players, stalemate, epilogueMode, currentBattle }, null, 2);
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
          setCurrentBattle(data.currentBattle || 'Heidi');
          setTimeout(() => setIsImporting(false), 100);
        }
      } catch (err) { setIsImporting(false); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- CONTENT HELPERS ---
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
                @keyframes chaos {
                    0% { transform: rotate(0deg) scale(0.5) translate(0,0); color: #444; }
                    25% { transform: rotate(90deg) scale(1.5) translate(20px, -20px); color: #800; }
                    50% { transform: rotate(-180deg) scale(0.8) translate(-20px, 20px); color: #d00; }
                    75% { transform: rotate(270deg) scale(1.2) translate(10px, 10px); color: #f00; }
                    100% { transform: rotate(360deg) scale(1) translate(0,0); color: #444; }
                }
                @keyframes landing {
                    0% { transform: scale(3); opacity: 0; }
                    50% { transform: scale(0.8); opacity: 1; }
                    75% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .rolling-anim { animation: chaos 0.1s infinite linear; opacity: 0.7; }
                .landed-anim { animation: landing 0.4s ease-out forwards; text-shadow: 0 0 50px #d4af37, 0 0 100px #f59e0b; color: #d4af37; transform: scale(1.5); }
            `}</style>
            
            <div className={`font-black text-[20rem] fantasy-font leading-none ${diceOverlay.finished ? 'landed-anim' : 'rolling-anim'}`}>
                {diceOverlay.value}
            </div>
            {diceOverlay.finished && (
                <div className="mt-8 text-4xl text-yellow-500 font-bold tracking-[1em] uppercase animate-pulse">
                    RESULT
                </div>
            )}
        </div>
      )}

      {/* --- LEFT SIDE: MAIN APP --- */}
      <div className={`flex-grow flex flex-col p-2 gap-2 relative z-10 transition-all duration-300 ${showRules ? 'w-2/3' : 'w-full'}`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#111]/80 backdrop-blur border-b border-white/10 p-2 rounded-lg shrink-0">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                    STAGGING IT UP
                </h1>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                    <Zap size={10} /> Campaign Manager
                </div>
            </div>

            <div className="flex gap-2">
                {[6, 10, 20].map(sides => (
                    <button key={sides} onClick={() => rollDice(sides)} className="px-3 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 hover:border-blue-400 text-blue-200 rounded font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all active:scale-95">
                        D{sides}
                    </button>
                ))}
            </div>

            <div className="flex gap-1">
                <button onClick={exportData} className="p-2 hover:bg-white/10 rounded text-green-500" title="Save"><Save size={16}/></button>
                <label className="p-2 hover:bg-white/10 rounded text-blue-500 cursor-pointer" title="Load">
                    <Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                </label>
                <button onClick={() => setEpilogueMode(!epilogueMode)} className={`p-2 hover:bg-white/10 rounded ${epilogueMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} title="Toggle Mode"><Crown size={16}/></button>
                <button onClick={() => resetData()} className="p-2 hover:bg-white/10 rounded text-red-500" title="Reset"><RefreshCw size={16}/></button>
                <button onClick={() => setShowRules(!showRules)} className={`p-2 rounded border border-yellow-700/50 ${showRules ? 'bg-yellow-900/50 text-white' : 'hover:bg-white/10 text-yellow-600'}`} title="Rules"><BookOpen size={16}/></button>
            </div>
        </div>

        {/* GLOBAL BAR */}
        <div className="grid grid-cols-[auto_1fr] gap-2 shrink-0 h-12">
            <div className="bg-black/60 border border-red-900/30 rounded flex items-center px-4 gap-4">
                <div className="text-xs text-red-500 font-bold uppercase flex items-center gap-1"><Skull size={12} /> Stalemate</div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setStalemate(Math.max(0, stalemate - 1))} className="text-gray-500 hover:text-white">-</button>
                    <span className="text-2xl font-mono font-bold text-white w-8 text-center">{stalemate}</span>
                    <button onClick={() => setStalemate(stalemate + 1)} className="text-gray-500 hover:text-white">+</button>
                </div>
            </div>
            <div className="bg-black/60 border border-gray-800 rounded flex items-center px-4 justify-between">
                <span className="text-xs text-gray-500 uppercase font-bold">Battle</span>
                <select value={currentBattle} onChange={(e) => setCurrentBattle(e.target.value)} className="bg-transparent text-yellow-500 font-bold text-sm focus:outline-none text-right w-full">
                    <option value="Dinner">Dinner a'la card</option>
                    <option value="Heidi">Heidi's Bierbar</option>
                    <option value="Epilogue1">Epilogue: The Day After</option>
                    <option value="Epilogue2">Epilogue: The Big Day</option>
                </select>
            </div>
        </div>

        {/* PLAYERS GRID */}
        <div className="grid grid-cols-4 gap-2 flex-grow min-h-0">
            {players.map((player, index) => (
                <div key={index} className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative">
                    <div className={`h-1 w-full ${['bg-red-600','bg-blue-600','bg-green-600','bg-yellow-600'][index]}`}></div>
                    
                    <div className="p-3 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center">
                        <span className="font-black text-xl text-gray-200" style={{ fontFamily: 'Cinzel, serif' }}>{player.name}</span>
                        {epilogueMode && <span className="text-[10px] text-gray-500">EPILOGUE</span>}
                    </div>

                    <div className="flex-grow flex flex-col p-2 gap-2 overflow-hidden">
                        {!epilogueMode ? (
                            <>
                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                    <select value={player.role} onChange={(e) => updatePlayer(index, 'role', e.target.value)} className="bg-black/40 border border-gray-800 text-xs rounded p-1 text-yellow-600 font-bold focus:outline-none w-full">
                                        <option value="">No Role</option>
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

                                {/* FULL ABILITIES LIST (SCROLLABLE) */}
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
                                            <div className="text-yellow-600 italic">
                                                {getRoleReward(player.role)}
                                            </div>
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
                                    <select value={player.spouse} onChange={(e) => updatePlayer(index, 'spouse', e.target.value)} className="w-full bg-black text-xs text-indigo-200 border-none outline-none">
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

      {/* --- RIGHT SIDE: RULE PANE --- */}
      <div className={`fixed right-0 top-0 bottom-0 z-40 bg-[#0f0f13]/95 backdrop-blur-xl border-l border-yellow-900/30 shadow-2xl transition-all duration-300 flex flex-col ${showRules ? 'w-1/3 translate-x-0' : 'w-1/3 translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-yellow-500" style={{ fontFamily: 'Cinzel, serif' }}>Campaign Codex</h2>
            <button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4 text-sm text-gray-300 custom-scrollbar">
            
            {/* 1. CORE RULES */}
            <details className="group border border-gray-800 rounded bg-black/20 open:bg-black/40 transition-colors">
                <summary className="p-3 font-bold cursor-pointer text-blue-400 hover:text-blue-300 uppercase tracking-widest flex justify-between">Core Rules <span className="group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="p-3 border-t border-gray-800 space-y-2 text-xs leading-relaxed">
                    <p><strong>Setup:</strong> 4-5 players, 5 battles. HS 6, LT 15. Dual land market = 40 cards.</p>
                    <p><strong>Roles & XP:</strong> Choose non-King role (descending rank). Levels based on XP: 0-9 (Lvl 1), 10-19 (Lvl 2), 20+ (Lvl 3). Cap at 0 and 20.</p>
                    <p><strong>Ranking:</strong> Based on VPs. Tie-breaker: Most recent win. Win battle = 1 VP.</p>
                    <p><strong>Mulligans:</strong> London Mulligan (Draw 7, put X on bottom). Shuffle hand, draw new, put cards away.</p>
                    <p><strong>Draw-out:</strong> If you can't draw, sacrifice non-land permanent OR lose 2 life.</p>
                    <p><strong>Stalemate:</strong> Starts when 2 players left. Timer increases at turn start. At 10, battle ends. Winner: Life > Non-lands > Hand > Library.</p>
                </div>
            </details>

            {/* 2. ROLES */}
            <details className="group border border-gray-800 rounded bg-black/20 open:bg-black/40 transition-colors">
                <summary className="p-3 font-bold cursor-pointer text-green-400 hover:text-green-300 uppercase tracking-widest flex justify-between">Roles <span className="group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="p-3 border-t border-gray-800 space-y-4 text-xs leading-relaxed">
                    <div>
                        <strong className="text-red-400 block mb-1">DOCTOR</strong>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Lvl 1:</strong> Creature enters: Remove counter from perm/player.</li>
                            <li><strong>Lvl 2:</strong> Gain Drunk counter: Target creature gains Metaxa eot.</li>
                            <li><strong>Lvl 3:</strong> Creatures have Infect. End of turn: Proliferate.</li>
                            <li className="italic text-gray-500">Reward: Creature dies on your turn -> +1 XP.</li>
                        </ul>
                    </div>
                    <div>
                        <strong className="text-yellow-400 block mb-1">MONK</strong>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Lvl 1:</strong> Discard & Pay (2) (Sorcery, 1/turn): Place Heresy counter on player. Attackers get +X/+0 vs Heresy player. Attack Heresy player = Draw card.</li>
                            <li><strong>Lvl 2:</strong> Activate OG/Planeswalker abilities twice per turn.</li>
                            <li><strong>Lvl 3:</strong> Tap 3 creatures (Sorcery): Put random OG in play. Sac if tappers untap. Max 1 OG this way.</li>
                            <li className="italic text-gray-500">Reward: Life total changes -> +1 XP.</li>
                        </ul>
                    </div>
                    <div>
                        <strong className="text-blue-400 block mb-1">SMITH</strong>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Lvl 1:</strong> Artifact spells cost (1) less per Level.</li>
                            <li><strong>Lvl 2:</strong> Equipped creatures have Vigilance, Trample, Reach.</li>
                            <li><strong>Lvl 3:</strong> Metalcraft (3+ artifacts): Discard to copy target artifact (token). Sorcery speed, 1/turn.</li>
                            <li className="italic text-gray-500">Reward: Artifact enters under control -> +1 XP.</li>
                        </ul>
                    </div>
                    <div>
                        <strong className="text-gray-200 block mb-1">KNIGHT</strong>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Lvl 1:</strong> (1) Discard: Create 1/2 Green horse w/ Haste (Sorcery).</li>
                            <li><strong>Lvl 2:</strong> Equipped creatures have Mentor.</li>
                            <li><strong>Lvl 3:</strong> Battalion (3+ attackers): Fight target creature.</li>
                            <li className="italic text-gray-500">Reward: Creatures deal damage -> +1 XP.</li>
                        </ul>
                    </div>
                    <div>
                        <strong className="text-purple-400 block mb-1">FOOL</strong>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Lvl 1:</strong> Spells on opponent's turn cost (1) less. (Kill King -> Gain Role).</li>
                            <li><strong>Lvl 2:</strong> Creature spells have Ninjutsu = CMC.</li>
                            <li><strong>Lvl 3:</strong> (Same as Lvl 2).</li>
                            <li className="italic text-gray-500">Reward: Target opponent/their perm -> +1 XP (1/turn).</li>
                        </ul>
                    </div>
                    <div>
                        <strong className="text-yellow-600 block mb-1">KING</strong>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Lvl 1:</strong> Creatures +1/+1 per Level.</li>
                            <li><strong>Lvl 2:</strong> Play extra land. Lands have 'T: Add one mana any color'.</li>
                            <li><strong>Lvl 3:</strong> Draw extra card in draw step.</li>
                            <li className="italic text-gray-500">Reward: Every 3rd time another player gains XP -> +1 XP.</li>
                        </ul>
                    </div>
                </div>
            </details>

            {/* 3. TIMELINE */}
            <details className="group border border-gray-800 rounded bg-black/20 open:bg-black/40 transition-colors">
                <summary className="p-3 font-bold cursor-pointer text-red-400 hover:text-red-300 uppercase tracking-widest flex justify-between">Campaign Timeline <span className="group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="p-3 border-t border-gray-800 space-y-4 text-xs leading-relaxed">
                    <div>
                        <strong className="text-white block">Battle 1: Repentance</strong>
                        <p>All vs All. Pay life instead of mana for spells.</p>
                        <p className="text-gray-500 mt-1">POST: Bid i det sure løg #101 for losers. Quilt draft a Booster.</p>
                    </div>
                    <div>
                        <strong className="text-white block">Battle 2: Grand Melee</strong>
                        <p>Creatures have Haste and attack each turn if able.</p>
                        <p className="text-gray-500 mt-1">POST: Workout Session #114. Housmann draft a booster.</p>
                    </div>
                    <div>
                        <strong className="text-white block">Battle 3: Hunters Loge</strong>
                        <p>Stack 3 OGs facedown. Defeat one -> Next flips (X = cycle # of defeated). Players can block for each other.</p>
                        <ul className="list-disc pl-4 mt-1 text-gray-400">
                            <li>OG 1: Draw from player to left.</li>
                            <li>OG 2: Can't pay own mana (others must transfer).</li>
                            <li>OG 3: Vote to skip Main or Attack steps.</li>
                        </ul>
                        <p className="text-gray-500 mt-1">POST: Mobile Hammock (Minesweeper draft land booster).</p>
                    </div>
                    <div>
                        <strong className="text-white block">Battle 4: Spikeball</strong>
                        <p>All vs All. Coin flip for direction (Left/Right). Markers in deck change direction. Win by eliminating target.</p>
                        <p className="text-gray-500 mt-1">POST: Dinner a'la card (Draft piles from booster, descending rank).</p>
                    </div>
                    <div>
                        <strong className="text-white block">Battle 5: Heidi's Bierbar</strong>
                        <p>End step: Gain 2 Drunk or 2 Poison counters. Cause loss = Steal role. Last player wins campaign.</p>
                    </div>
                </div>
            </details>

            {/* 4. EPILOGUE */}
            <details className="group border border-gray-800 rounded bg-black/20 open:bg-black/40 transition-colors">
                <summary className="p-3 font-bold cursor-pointer text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex justify-between">Epilogue <span className="group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="p-3 border-t border-gray-800 space-y-4 text-xs leading-relaxed">
                    <p className="text-gray-500 italic">Role & XP system abandoned.</p>
                    <div>
                        <strong className="text-white block">The Day After</strong>
                        <p>Start with Drunk counters (inverse placement: Last=3, 2nd Last=4...). Remove counter = Draw card.</p>
                        <p><strong>Sober Up:</strong> Upkeep, pay 1 (effectively 2) to remove Drunk counter.</p>
                        <p><strong>Spells:</strong> All spells have Suspend logic (pay cost, exile with time counters, remove at upkeep, cast for free).</p>
                    </div>
                    <div>
                        <strong className="text-white block">The Big Day</strong>
                        <p>Winner proposes marriage. If accepted -> Married.</p>
                        <p><strong>Marriage:</strong> Shared library. Cannot attack each other.</p>
                        <p><strong>Divorce:</strong> Sorcery speed. Give hand to partner to leave.</p>
                        <p><strong>Win:</strong> Final remaining player.</p>
                    </div>
                </div>
            </details>

        </div>
      </div>

    </div>
  );
};

export default CampaignManager;
