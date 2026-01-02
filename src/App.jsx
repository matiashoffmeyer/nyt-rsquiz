import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, RefreshCw, Skull, Zap, Users, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost } from 'lucide-react';

const CampaignManager = () => {
  // --- STATE ---
  const [players, setPlayers] = useState([]);
  const [stalemate, setStalemate] = useState(0);
  const [epilogueMode, setEpilogueMode] = useState(false);
  const [currentBattle, setCurrentBattle] = useState('Heidi');
  
  // Dice State
  const [diceOverlay, setDiceOverlay] = useState({ active: false, value: 1, type: 20 });
  
  // Import State
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- INITIAL LOAD & AUTO-SAVE ---
  useEffect(() => {
    const saved = localStorage.getItem('staggingData_v3');
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
      localStorage.setItem('staggingData_v3', JSON.stringify({ players, stalemate, epilogueMode, currentBattle }));
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
    setDiceOverlay({ active: true, value: '-', type: sides });
    
    // Animation phases
    let counter = 0;
    const interval = setInterval(() => {
      setDiceOverlay(prev => ({ ...prev, value: Math.floor(Math.random() * sides) + 1 }));
      counter++;
      if (counter > 20) { // Run for ~1 second
        clearInterval(interval);
        setTimeout(() => setDiceOverlay(prev => ({ ...prev, active: false })), 1500); // Show result for 1.5s
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
  const getRoleText = (role, level) => {
    const abilities = {
        'Doctor': ["Creature enters: Remove counter.", "Gain Drunk: Target gets Metaxa.", "Creatures have Infect. End: Proliferate."],
        'Monk': ["Discard/Pay(2): Heresy logic.", "Activate OG abilities 2x.", "Tap 3: Summon random OG."],
        'Smith': ["Artifact spells cost (1) less/Lvl.", "Equip: Vigilance, Trample, Reach.", "Metalcraft: Copy artifact."],
        'Knight': ["(1) Discard: 1/2 Horse Haste.", "Equip: Mentor.", "Battalion: Fight target."],
        'Fool': ["Opp. turn spells cost (1) less.", "Creatures: Ninjutsu = CMC.", "Creatures: Ninjutsu = CMC."],
        'King': ["Creatures +1/+1 per Level.", "Extra land & fix mana.", "Draw extra card."]
    };
    return abilities[role] ? `Lvl ${level}: ${abilities[role][level-1]}` : "";
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
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-gray-300 font-sans relative">
      
      {/* --- ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <style>{`
          @keyframes nebula {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .nebula-bg {
            background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000);
            background-size: 400% 400%;
            animation: nebula 15s ease infinite;
          }
        `}</style>
        <div className="w-full h-full nebula-bg"></div>
      </div>

      {/* --- MEGA DICE OVERLAY --- */}
      {diceOverlay.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <style>{`
                @keyframes chaos {
                    0% { transform: rotate(0deg) scale(0.5) translate(0,0); color: #444; text-shadow: 0 0 0 #000; }
                    25% { transform: rotate(90deg) scale(1.5) translate(20px, -20px); color: #d00; text-shadow: 5px 5px 0 #000; }
                    50% { transform: rotate(-180deg) scale(0.8) translate(-20px, 20px); color: #f59e0b; text-shadow: -5px -5px 0 #000; }
                    75% { transform: rotate(270deg) scale(1.2) translate(10px, 10px); color: #fff; text-shadow: 0 0 20px #f00; }
                    100% { transform: rotate(360deg) scale(1) translate(0,0); color: #d4af37; text-shadow: 0 0 50px #d4af37; }
                }
                .mega-dice { animation: chaos 0.5s infinite linear; }
            `}</style>
            <div className="mega-dice font-black text-[20rem] fantasy-font leading-none">
                {diceOverlay.value}
            </div>
        </div>
      )}

      {/* --- MAIN LAYOUT --- */}
      <div className="relative z-10 h-full flex flex-col p-2 gap-2">
        
        {/* HEADER (Compact) */}
        <div className="flex justify-between items-center bg-[#111]/80 backdrop-blur border-b border-white/10 p-2 rounded-lg shrink-0">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                    STAGGING IT UP
                </h1>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                    <Zap size={10} /> Campaign Manager
                </div>
            </div>

            {/* DICE BUTTONS */}
            <div className="flex gap-2">
                {[6, 10, 20].map(sides => (
                    <button key={sides} onClick={() => rollDice(sides)} className="px-3 py-1 bg-gradient-to-br from-blue-900 to-black border border-blue-700/50 hover:border-blue-400 text-blue-200 rounded font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all active:scale-95">
                        D{sides}
                    </button>
                ))}
            </div>

            {/* CONTROLS */}
            <div className="flex gap-1">
                <button onClick={exportData} className="p-2 hover:bg-white/10 rounded text-green-500" title="Save"><Save size={16}/></button>
                <label className="p-2 hover:bg-white/10 rounded text-blue-500 cursor-pointer" title="Load">
                    <Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                </label>
                <button onClick={() => setEpilogueMode(!epilogueMode)} className={`p-2 hover:bg-white/10 rounded ${epilogueMode ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} title="Toggle Mode"><Crown size={16}/></button>
                <button onClick={() => resetData()} className="p-2 hover:bg-white/10 rounded text-red-500" title="Reset"><RefreshCw size={16}/></button>
            </div>
        </div>

        {/* GLOBAL BAR (Very Compact) */}
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

        {/* PLAYERS GRID (Fills remaining space) */}
        <div className="grid grid-cols-4 gap-2 flex-grow min-h-0">
            {players.map((player, index) => (
                <div key={index} className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative">
                    {/* Top Color Bar */}
                    <div className={`h-1 w-full ${['bg-red-600','bg-blue-600','bg-green-600','bg-yellow-600'][index]}`}></div>
                    
                    {/* Player Name */}
                    <div className="p-3 bg-gradient-to-b from-white/5 to-transparent">
                        <input value={player.name} onChange={(e) => updatePlayer(index, 'name', e.target.value)} className="bg-transparent text-center w-full font-black text-xl text-gray-200 focus:text-white focus:outline-none placeholder-gray-700" style={{ fontFamily: 'Cinzel, serif' }} placeholder="Name" />
                    </div>

                    {/* Stats Area */}
                    <div className="flex-grow flex flex-col p-2 gap-2 overflow-hidden">
                        
                        {!epilogueMode ? (
                            <>
                                {/* Role & Level Row */}
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

                                {/* XP / VP Controls */}
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

                                {/* Abilities Text Area (Fixed height, scroll if needed) */}
                                <div className="flex-grow bg-black/40 border border-gray-800 rounded p-2 overflow-y-auto no-scrollbar relative">
                                    <div className="absolute top-1 right-2 text-yellow-700">{getRoleIcon(player.role)}</div>
                                    {player.role ? (
                                        <div className="text-[10px] text-gray-400 leading-snug space-y-2">
                                            {[1, 2, 3].map(lvl => (
                                                <p key={lvl} className={getLevel(player.xp) >= lvl ? 'text-green-300' : 'text-gray-700 line-through'}>
                                                    {getRoleText(player.role, lvl)}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-[10px] text-gray-700 italic">Select Role</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            // EPILOGUE UI
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

                        {/* LIFE / HAND (Always at bottom) */}
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

        {/* CODEX FOOTER (Toggle) */}
        <details className="mt-2 bg-[#111] border border-gray-800 rounded shrink-0 group relative z-20">
            <summary className="p-2 text-center text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:text-gray-300">
                View Rules Codex
            </summary>
            <div className="p-4 grid grid-cols-2 gap-4 text-xs text-gray-400 absolute bottom-full left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 shadow-2xl">
                <div>
                    <h4 className="font-bold text-white mb-1">Standard</h4>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>XP Cap: 20. Lvl 1 (0-9), Lvl 2 (10-19), Lvl 3 (20).</li>
                        <li>Ranking: VP > Recent Win.</li>
                        <li>Mulligan: London (Draw 7, bottom X).</li>
                        <li>Stalemate: 2 players left -> Timer starts. Ends at 10.</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-1">Epilogue</h4>
                    <p className="mb-1"><span className="text-purple-400">Day After:</span> Drunk based on loss rank. Remove counter = Draw. Pay 1 (2 drunk) to remove.</p>
                    <p><span className="text-indigo-400">Big Day:</span> Marriage = Shared library, peace treaty. Divorce = Give hand.</p>
                </div>
            </div>
        </details>

      </div>
    </div>
  );
};

export default CampaignManager;
