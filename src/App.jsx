import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, RefreshCw, Dice5, Skull, Scroll, Heart, Shield, Crown, Zap, Users, Hammer, Ghost } from 'lucide-react';

const CampaignManager = () => {
  // --- STATE MANAGEMENT ---
  const [players, setPlayers] = useState([]);
  const [stalemate, setStalemate] = useState(0);
  const [epilogueMode, setEpilogueMode] = useState(false);
  const [currentBattle, setCurrentBattle] = useState('Heidi');
  
  // Dice State
  const [lastRoll, setLastRoll] = useState('-');
  const [isRolling, setIsRolling] = useState(false);
  
  // Import State
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- INITIAL LOAD & AUTO-SAVE ---
  useEffect(() => {
    const saved = localStorage.getItem('staggingData_v2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayers(data.players || []);
        setStalemate(data.stalemate || 0);
        setEpilogueMode(data.epilogueMode || false);
        setCurrentBattle(data.currentBattle || 'Heidi');
      } catch (e) {
        console.error("Save file corrupted, resetting...");
        resetData(true);
      }
    } else {
      resetData(true);
    }
  }, []);

  // Save whenever state changes (skip if importing)
  useEffect(() => {
    if (!isImporting && players.length > 0) {
      localStorage.setItem('staggingData_v2', JSON.stringify({
        players,
        stalemate,
        epilogueMode,
        currentBattle
      }));
    }
  }, [players, stalemate, epilogueMode, currentBattle, isImporting]);

  // --- ACTIONS ---

  const resetData = (force = false) => {
    if (!force && !window.confirm("This will reset all progress. Are you sure?")) return;

    setPlayers([
      { name: 'Repwich (Christian)', deck: '', role: '', vp: 2, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'MountainIsland (Andreas)', deck: '', role: '', vp: 1, xp: 13, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Repmance (Frederik)', deck: '', role: '', vp: 1, xp: 16, lt: 20, hs: 7, drunk: 0, spouse: '' },
      { name: 'Camp Badeferie (Matias)', deck: '', role: '', vp: 3, xp: 10, lt: 20, hs: 7, drunk: 0, spouse: '' }
    ]);
    setStalemate(0);
    setEpilogueMode(false);
    setCurrentBattle('Heidi');
  };

  const rollDice = (sides) => {
    if (isRolling) return;
    setIsRolling(true);
    let counter = 0;
    const interval = setInterval(() => {
      setLastRoll(Math.floor(Math.random() * sides) + 1);
      counter++;
      if (counter > 10) {
        clearInterval(interval);
        setIsRolling(false);
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
    const currentVal = newPlayers[index][field] || 0;
    let newVal = currentVal + amount;
    
    // XP limits
    if (field === 'xp') {
        if (newVal > 20) newVal = 20;
        if (newVal < 0) newVal = 0;
    }
    
    newPlayers[index][field] = newVal;
    setPlayers(newPlayers);
  };

  const getLevel = (xp) => {
    if (xp < 10) return 1;
    if (xp < 20) return 2;
    return 3;
  };

  // --- FILE SYSTEM ---
  const exportData = () => {
    const data = JSON.stringify({ players, stalemate, epilogueMode, currentBattle, timestamp: new Date().toISOString() }, null, 2);
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
          setTimeout(() => { setIsImporting(false); alert("Campaign Loaded!"); }, 100);
        } else {
          alert("Invalid file.");
          setIsImporting(false);
        }
      } catch (err) {
        alert("Error reading file.");
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- TEXT HELPERS ---
  const getRoleText = (role, level) => {
    const abilities = {
        'Doctor': ["Creature enters: Remove counter.", "Gain Drunk: Target gets Metaxa.", "Creatures have Infect. End: Proliferate."],
        'Monk': ["Discard & Pay (2): Heresy counter logic.", "Activate OG abilities twice.", "Tap 3 creatures: Summon random OG."],
        'Smith': ["Artifact spells cost (1) less/Lvl.", "Equipped: Vigilance, Trample, Reach.", "Metalcraft: Discard to copy artifact."],
        'Knight': ["(1) Discard: 1/2 Horse w/ Haste.", "Equipped creatures have Mentor.", "Battalion: Fight target creature."],
        'Fool': ["Opponent turn spells cost (1) less.", "Creature spells: Ninjutsu = CMC.", "Creature spells: Ninjutsu = CMC."],
        'King': ["Creatures +1/+1 per Level.", "Extra land & fix mana.", "Draw extra card."]
    };
    return abilities[role] ? `Lvl ${level}: ${abilities[role][level-1]}` : "";
  };

  const getRoleReward = (role) => {
    const rewards = {
        'Doctor': 'Reward: Creature dies on your turn -> +1 XP',
        'Monk': 'Reward: Life total changes -> +1 XP',
        'Smith': 'Reward: Artifact enters under control -> +1 XP',
        'Knight': 'Reward: Creatures deal damage -> +1 XP',
        'Fool': 'Reward: Target opponent/their perm -> +1 XP',
        'King': 'Reward: Every 3rd time another player gains XP -> +1 XP'
    };
    return rewards[role] || '';
  };

  const getRoleIcon = (role) => {
      switch(role) {
          case 'Doctor': return <Heart size={14} />;
          case 'Monk': return <Scroll size={14} />;
          case 'Smith': return <Hammer size={14} />;
          case 'Knight': return <Shield size={14} />;
          case 'Fool': return <Ghost size={14} />;
          case 'King': return <Crown size={14} />;
          default: return null;
      }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans p-4 md:p-8" 
         style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #2a1b1b 0%, transparent 70%), radial-gradient(circle at 0% 100%, #1a1a2e 0%, transparent 50%)' }}>
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col xl:flex-row justify-between items-center gap-6 border-b border-gray-800 pb-6">
        <div className="text-center xl:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 drop-shadow-lg" style={{ fontFamily: 'Cinzel, serif' }}>
            STAGGING IT UP
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mt-1">Campaign Manager</p>
        </div>

        {/* Dice Roller */}
        <div className="flex gap-3 bg-black/50 p-3 rounded-xl border border-gray-700 backdrop-blur-md items-center">
          {[6, 10, 20].map(sides => (
            <button key={sides} onClick={() => rollDice(sides)} className="px-4 py-2 bg-blue-900/40 border border-blue-600/50 hover:bg-blue-800 text-blue-200 rounded font-bold text-xs transition-all active:scale-95 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
              D{sides}
            </button>
          ))}
          <div className={`w-20 h-10 flex items-center justify-center font-mono text-2xl bg-black rounded text-yellow-500 border border-gray-700 shadow-inner transition-all ${isRolling ? 'text-red-500 border-red-500 scale-110' : ''}`}>
            {isRolling ? <Dice5 className="animate-spin" /> : lastRoll}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button onClick={exportData} className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-green-800 text-green-500 hover:text-green-300 rounded text-xs uppercase font-bold tracking-wider hover:bg-gray-800 transition-colors">
            <Save size={14} /> Save
          </button>
          <label className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-blue-800 text-blue-500 hover:text-blue-300 rounded text-xs uppercase font-bold tracking-wider hover:bg-gray-800 transition-colors cursor-pointer">
            <Upload size={14} /> Load
            <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
          </label>
          <button onClick={() => setEpilogueMode(!epilogueMode)} className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-yellow-800 text-yellow-500 hover:text-yellow-300 rounded text-xs uppercase font-bold tracking-wider hover:bg-gray-800 transition-colors">
            {epilogueMode ? 'Back to Main' : 'Epilogue Mode'}
          </button>
          <button onClick={() => resetData()} className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-red-900 text-red-700 hover:text-red-500 rounded text-xs uppercase font-bold tracking-wider hover:bg-gray-800 transition-colors">
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* --- GLOBAL STATS --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Stalemate Timer */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-gray-900 to-black border border-gray-800 flex justify-between items-center shadow-lg">
          <div>
            <h3 className="text-red-600 uppercase text-xs font-bold tracking-widest flex items-center gap-2">
              <Skull size={16} /> Stalemate Clock
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">Battle ends automatically at count 10</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setStalemate(Math.max(0, stalemate - 1))} className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-xl font-bold transition-all">-</button>
            <span className="text-4xl font-mono font-bold text-red-500 w-12 text-center drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{stalemate}</span>
            <button onClick={() => setStalemate(stalemate + 1)} className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-xl font-bold transition-all">+</button>
          </div>
        </div>

        {/* Battle Selector */}
        <div className="p-4 rounded-lg bg-[#141419] border border-gray-800 flex justify-between items-center shadow-lg">
          <span className="text-gray-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} /> Active Battle
          </span>
          <select 
            value={currentBattle} 
            onChange={(e) => setCurrentBattle(e.target.value)} 
            className="bg-black border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-1/2 p-2.5"
          >
            <option value="Dinner">Dinner a'la card</option>
            <option value="Heidi">Heidi's Bierbar</option>
            <option value="Epilogue1">Epilogue: The Day After</option>
            <option value="Epilogue2">Epilogue: The Big Day</option>
          </select>
        </div>
      </div>

      {/* --- PLAYERS GRID --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {players.map((player, index) => (
          <div key={index} className="relative bg-[#141419]/90 backdrop-blur-sm border border-gray-800 border-b-2 border-b-black rounded-lg p-5 shadow-xl hover:border-gray-600 transition-colors group">
            <div className={`absolute inset-x-0 top-0 h-1 rounded-t-lg ${index === 0 ? 'bg-red-900' : (index === 1 ? 'bg-blue-900' : (index === 2 ? 'bg-green-900' : 'bg-yellow-900'))}`}></div>
            
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-gray-700">
              <input 
                value={player.name} 
                onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                className="bg-transparent text-xl font-bold text-yellow-500 w-full focus:outline-none focus:border-b focus:border-yellow-500 mb-1" 
                placeholder="Player Name"
                style={{ fontFamily: 'Cinzel, serif' }}
              />
              <input 
                value={player.deck} 
                onChange={(e) => updatePlayer(index, 'deck', e.target.value)}
                className="bg-transparent text-xs text-gray-500 italic w-full focus:outline-none" 
                placeholder="Deck / Archetype"
              />
            </div>

            {/* CAMPAIGN STATS */}
            {!epilogueMode && (
              <div className="flex flex-col gap-4">
                {/* Role */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Role</label>
                    <span className="text-yellow-600">{getRoleIcon(player.role)}</span>
                  </div>
                  <select 
                    value={player.role} 
                    onChange={(e) => updatePlayer(index, 'role', e.target.value)}
                    className="w-full bg-black border border-gray-700 text-gray-300 text-sm rounded px-2 py-1 focus:border-yellow-600 focus:outline-none"
                  >
                    <option value="">-- No Role --</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Monk">Monk</option>
                    <option value="Smith">Smith</option>
                    <option value="Knight">Knight</option>
                    <option value="Fool">Fool</option>
                    <option value="King">King</option>
                  </select>
                </div>

                {/* XP */}
                <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-gray-800">
                  <div>
                    <span className="text-[10px] text-blue-500 font-bold uppercase block mb-1">Experience</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjustValue(index, 'xp', -1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-400">-</button>
                      <span className="text-xl font-bold text-white w-6 text-center font-mono">{player.xp}</span>
                      <button onClick={() => adjustValue(index, 'xp', 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-400">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase block">Level</span>
                    <span className="text-3xl font-bold text-blue-500" style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }}>
                      {getLevel(player.xp)}
                    </span>
                  </div>
                </div>

                {/* VP */}
                <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-gray-800">
                  <span className="text-[10px] text-green-500 font-bold uppercase">Victory Points</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustValue(index, 'vp', -1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-400">-</button>
                    <span className="text-xl font-bold text-green-500 w-6 text-center font-mono">{player.vp}</span>
                    <button onClick={() => adjustValue(index, 'vp', 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-400">+</button>
                  </div>
                </div>

                {/* Abilities */}
                <div className="mt-1 p-3 bg-black/60 rounded border border-gray-800 min-h-[140px] shadow-inner">
                  {player.role ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3].map(lvl => (
                        <p key={lvl} className={`text-xs leading-tight ${getLevel(player.xp) >= lvl ? 'text-green-300 font-medium' : 'text-gray-600 line-through'}`}>
                          {getRoleText(player.role, lvl)}
                        </p>
                      ))}
                      <div className="w-full h-px bg-gray-700 my-1"></div>
                      <p className="text-[10px] text-yellow-600 italic">{getRoleReward(player.role)}</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-700 italic">Select a role</div>
                  )}
                </div>
              </div>
            )}

            {/* EPILOGUE STATS */}
            {epilogueMode && (
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-indigo-950/30 rounded border border-indigo-900/50">
                  <label className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest mb-1 block">Marriage Status</label>
                  <select 
                    value={player.spouse} 
                    onChange={(e) => updatePlayer(index, 'spouse', e.target.value)}
                    className="w-full bg-black border border-gray-700 text-indigo-200 text-sm rounded px-2 py-1 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Single / Unmarried</option>
                    {players.filter(p => p.name !== player.name).map((p, i) => (
                      <option key={i} value={p.name}>Married to {p.name.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-950/20 rounded border border-purple-900/30">
                  <span className="text-[10px] text-purple-400 font-bold uppercase">Drunk Counters</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustValue(index, 'drunk', -1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-400">-</button>
                    <span className="text-xl font-bold text-purple-400 w-6 text-center font-mono">{player.drunk}</span>
                    <button onClick={() => adjustValue(index, 'drunk', 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-400">+</button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Stats */}
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-800">
              <div className="text-center">
                <label className="text-[9px] text-red-600 font-bold tracking-widest block mb-1">LIFE</label>
                <input 
                  type="number" 
                  value={player.lt} 
                  onChange={(e) => updatePlayer(index, 'lt', parseInt(e.target.value))}
                  className="bg-black/50 border border-gray-800 rounded text-center font-bold w-full text-2xl text-red-500 py-1 focus:border-red-900 focus:outline-none" 
                />
              </div>
              <div className="text-center">
                <label className="text-[9px] text-blue-600 font-bold tracking-widest block mb-1">HAND</label>
                <input 
                  type="number" 
                  value={player.hs} 
                  onChange={(e) => updatePlayer(index, 'hs', parseInt(e.target.value))}
                  className="bg-black/50 border border-gray-800 rounded text-center font-bold w-full text-2xl text-blue-500 py-1 focus:border-blue-900 focus:outline-none" 
                />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* --- CODEX --- */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800">
        <h3 className="text-lg font-bold text-gray-500 mb-4 uppercase" style={{ fontFamily: 'Cinzel, serif' }}>Campaign Codex</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <details className="bg-black/40 border border-gray-800 rounded group">
            <summary className="p-3 cursor-pointer font-bold text-xs text-gray-400 hover:text-white uppercase tracking-wider transition-colors flex justify-between">
              General Rules <span className="text-gray-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 text-sm text-gray-400 border-t border-gray-800 leading-relaxed">
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Levels:</strong> <span className="text-blue-400">Lvl 1</span> (&lt;10 XP), <span className="text-blue-400">Lvl 2</span> (10-19 XP), <span className="text-blue-400">Lvl 3</span> (20+ XP).</li>
                <li><strong>Ranking:</strong> Determined by VP. Tie-breaker: Most recent win.</li>
                <li><strong>Mulligan:</strong> Draw 7, put X cards on bottom (London Mulligan).</li>
                <li><strong>Stalemate:</strong> Starts when 2 players remain. Battle ends at count 10.</li>
              </ul>
            </div>
          </details>
          <details className="bg-black/40 border border-gray-800 rounded group">
            <summary className="p-3 cursor-pointer font-bold text-xs text-gray-400 hover:text-white uppercase tracking-wider transition-colors flex justify-between">
              Epilogue Rules <span className="text-gray-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 text-sm text-gray-400 border-t border-gray-800 leading-relaxed">
              <p className="mb-2"><strong className="text-purple-400">The Day After:</strong> Start with Drunk counters based on inverse placement. Remove counter = Draw card. Upkeep: Pay 1 (effectively 2) to remove Drunk counter.</p>
              <p><strong className="text-indigo-400">The Big Day:</strong> Winner proposes. Married players share library, cannot attack each other. Divorce: Sorcery speed, give hand to partner.</p>
            </div>
          </details>
        </div>
      </div>

    </div>
  );
};

export default CampaignManager;
