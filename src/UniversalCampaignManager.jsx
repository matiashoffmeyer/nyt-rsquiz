import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Upload, RefreshCw, Skull, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost, BookOpen, X, Sword, Beer, Info, Clock, Users, Wifi, WifiOff, Minus, Plus, LogOut } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UniversalCampaignManager = ({ campaignId, onExit }) => {
  // --- STATE ---
  const [players, setPlayers] = useState([]);
  const [config, setConfig] = useState(null); 
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
  
  // RANKING VISUALS STATE
  const [rankingProcess, setRankingProcess] = useState({ 
      mode: 'idle', 
      rolls: {}, 
      decimals: {}, 
      tiedIndices: [], 
      rpsHands: {} 
  });

  // Refs
  const fileInputRef = useRef(null);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;
  
  // Audio Refs (For Instant Playback)
  const audioRefs = useRef({});

  // --- ONLINE AUDIO ENGINE (PRELOADED) ---
  const soundUrls = {
      click: 'https://www.soundjay.com/buttons/sounds/button-30.mp3',
      dice_shake: 'https://raw.githubusercontent.com/keepeye/d20/master/dist/dice-roll.mp3',
      dice_land: 'https://www.soundjay.com/misc/sounds/dice-throw-2.mp3',
      page: 'https://www.soundjay.com/misc/sounds/page-flip-01a.mp3',
      swish: 'https://www.soundjay.com/nature/sounds/whoosh-02.mp3',
      clash: 'https://www.soundjay.com/misc/sounds/sword-clash-1.mp3',
      high: 'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3',
      low: 'https://www.soundjay.com/misc/sounds/fail-trombone-02.mp3'
  };

  // Preload sounds on mount
  useEffect(() => {
      Object.keys(soundUrls).forEach(key => {
          const audio = new Audio(soundUrls[key]);
          audio.preload = 'auto'; // Tvinger browseren til at hente filen med det samme
          audioRefs.current[key] = audio;
      });
  }, []);

  const playSound = (type) => {
    const audio = audioRefs.current[type];
    if (audio) {
        audio.currentTime = 0; // Reset for at kunne spamme lyden
        
        // Volumen justering
        switch (type) {
            case 'click': audio.volume = 0.3; break;
            case 'dice_shake': audio.volume = 0.5; break;
            case 'dice_land': audio.volume = 0.6; break;
            case 'swish': audio.volume = 0.3; break;
            case 'clash': audio.volume = 0.5; break;
            case 'high': audio.volume = 0.4; break;
            case 'low': audio.volume = 0.4; break;
            default: audio.volume = 0.5;
        }
        
        audio.play().catch(() => {}); // Ignorer fejl (f.eks. før brugerinteraktion)
    }
  };

  // --- CONTENT DATA ---
  const staggingTimeline = [
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

  const getRoleAbilities = (role) => {
    const data = {
        'Doctor': ["Whenever a creature enters the battlefield under your control, you may remove a counter from target permanent.", "Whenever you gain a Drunk counter, you may put a Metaxa counter on target player.", "Creatures you control have Infect. At the beginning of your end step, Proliferate."],
        'Monk': ["Discard a card or Pay (2): Counter target spell unless its controller pays (1).", "If an ability of an OG source you control is activated, copy it. You may choose new targets for the copy.", "Tap 3 untapped creatures you control: Create a token that is a copy of a random OG card."],
        'Smith': ["Artifact spells you cast cost (1) less to cast for each Level you have.", "Equipped creatures you control have Vigilance, Trample, and Reach.", "Metalcraft — At the beginning of combat, if you control 3+ artifacts, you may create a token that's a copy of target artifact."],
        'Knight': ["(1), Discard a card: Create a 1/2 white Horse creature token with Haste.", "Equipped creatures you control have Mentor (When attacking, put a +1/+1 counter on target attacking creature with lesser power).", "Battalion — Whenever you attack with 3+ creatures, you may have target creature you control fight target creature you don't control."],
        'Fool': ["Spells you cast during an opponent's turn cost (1) less to cast.", "Creature cards in your hand have Ninjutsu [X], where X is their CMC.", "Creature cards in your hand have Ninjutsu [X-1], where X is their CMC."],
        'King': ["Creatures you control get +1/+1 for each Level you possess.", "You may play an additional land on each of your turns. Lands you control have 'Tap: Add one mana of any color'.", "At the beginning of your upkeep, draw an additional card."]
    };
    return data[role] || [];
  };
  
  const getRoleReward = (role) => {
    const rewards = { 
        'Doctor': 'When one or more creatures die during your turn, gain 1 xp.', 
        'Monk': 'Whenever your life total changes, gain 1 xp.', 
        'Smith': 'When an artifact enters play under your control, gain 1 xp.', 
        'Knight': 'Whenever one or more creatures under your control deal damage, gain 1 XP.', 
        'Fool': 'Whenever you target an opponent or a permanent under his control with a spell or ability, gain 1 xp (max once pr turn)', 
        'King': 'Every third time another player gains xp you gain 1 xp.' 
    };
    return rewards[role] ? `Reward: ${rewards[role]}` : '';
  };
  
  const getRoleIcon = (role) => {
      switch(role) { case 'Doctor': return <Heart size={12} />; case 'Monk': return <Scroll size={12} />; case 'Smith': return <Hammer size={12} />; case 'Knight': return <Shield size={12} />; case 'Fool': return <Ghost size={12} />; case 'King': return <Crown size={12} />; default: return null; }
  };

  // --- DATA ENGINE ---
  useEffect(() => {
    if (!campaignId) return;
    const loadCampaign = async () => {
      const { data, error } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();
      if (error) return;
      if (data) {
        setMeta({ title: data.title, engine: data.engine });
        setConfig(data.static_config || { mechanics: {}, rules_text: [] });
        applyActiveState(data.active_state);
        setIsConnected(true);
      }
    };
    loadCampaign();
    const channel = supabase.channel(`campaign_${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` }, (payload) => {
        if (payload.new && payload.new.active_state) applyActiveState(payload.new.active_state);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [campaignId]);

  const applyActiveState = (state) => {
    if (!state) return;
    if (state.players && Array.isArray(state.players)) setPlayers(state.players);
    if (state.stalemate !== undefined) setStalemate(state.stalemate);
    if (state.epilogueMode !== undefined) setEpilogueMode(state.epilogueMode);
    if (state.last_roll) setLastRollRecord(state.last_roll);
  };

  const syncState = async (newPlayers, newStalemate, newEpilogue, newRoll) => {
    setPlayers(newPlayers);
    setStalemate(newStalemate);
    setEpilogueMode(newEpilogue);
    setLastRollRecord(newRoll);
    await supabase.from('campaigns').update({ active_state: { players: newPlayers, stalemate: newStalemate, epilogueMode: newEpilogue, last_roll: newRoll } }).eq('id', campaignId);
  };

  // --- ACTIONS ---
  const exportData = () => {
    playSound('click');
    const data = JSON.stringify({ 
      campaignId, 
      timestamp: new Date().toISOString(),
      players, 
      stalemate, 
      epilogueMode, 
      last_roll: lastRollRecord 
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.title.replace(/\s+/g, '_')}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importData = (event) => {
    playSound('click');
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.campaignId && String(data.campaignId) !== String(campaignId)) {
            if (!window.confirm(`ADVARSEL: ID match ikke. Vil du overskrive?`)) return;
        }
        if (Array.isArray(data.players)) {
            syncState(data.players, data.stalemate || 0, data.epilogueMode || false, data.last_roll || { type: '-', value: '-' });
            alert("Spillet er loadet!");
            setShowRules(false);
        }
      } catch (err) { alert("Fejl i filen."); }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const resetData = async () => {
      playSound('click');
      if (!window.confirm("RESET CAMPAIGN?")) return;
      window.location.reload(); 
  };

  const rollDice = (sides) => {
    playSound('dice_shake');
    setDiceOverlay({ active: true, value: 1, type: sides, finished: false });
    let counter = 0;
    const interval = setInterval(() => {
      setDiceOverlay(prev => ({ ...prev, value: Math.floor(Math.random() * sides) + 1 }));
      counter++;
      if (counter > 20) { 
        clearInterval(interval);
        const trueFinal = Math.floor(Math.random() * sides) + 1; 
        playSound('dice_land');
        setDiceOverlay(prev => ({ ...prev, finished: true, value: trueFinal }));
        syncState(players, stalemate, epilogueMode, { type: sides, value: trueFinal });
        setTimeout(() => setDiceOverlay(prev => ({ ...prev, active: false })), 2000);
      }
    }, 50);
  };

  // --- RPS RANKING ENGINE ---
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const rpsOptions = ['🪨', '📄', '✂️']; 

  const beats = (a, b) => {
      if (a === '🪨' && b === '✂️') return true;
      if (a === '📄' && b === '🪨') return true;
      if (a === '✂️' && b === '📄') return true;
      return false;
  };

  const handleDramaticRankingRoll = async () => {
    if (rankingProcess.mode !== 'idle' && rankingProcess.mode !== 'finished') return;

    // 1. INITIAL SHUFFLE
    playSound('dice_shake');
    setRankingProcess({ mode: 'shuffling', rolls: {}, decimals: {}, tiedIndices: [], rpsHands: {} });
    const shuffleInterval = setInterval(() => {
        const noise = {};
        players.forEach((_, i) => noise[i] = Math.floor(Math.random() * 100) + 1);
        setRankingProcess(prev => ({ ...prev, rolls: noise }));
    }, 50);

    await delay(1500);
    clearInterval(shuffleInterval);

    // 2. LAND INITIAL INTEGERS
    playSound('dice_land');
    let currentRolls = {};
    let currentDecimals = {};
    players.forEach((_, i) => {
        currentRolls[i] = Math.floor(Math.random() * 100) + 1;
        currentDecimals[i] = 0.0;
    });
    setRankingProcess({ mode: 'show_rolls', rolls: currentRolls, decimals: currentDecimals, tiedIndices: [], rpsHands: {} });

    await delay(1500);

    // 3. RESOLVE TIES WITH BATTLE ROYALE
    let hasConflict = true;
    while (hasConflict) {
        const groups = {};
        Object.keys(currentRolls).forEach(idx => {
            const score = currentRolls[idx] + currentDecimals[idx];
            const key = score.toFixed(1); 
            if (!groups[key]) groups[key] = [];
            groups[key].push(Number(idx));
        });

        const ties = Object.values(groups).filter(g => g.length > 1);

        if (ties.length === 0) {
            hasConflict = false;
        } else {
            const combatants = ties.flat();
            setRankingProcess(prev => ({ ...prev, mode: 'rps_animate', tiedIndices: combatants }));

            let frames = 0;
            const anim = setInterval(() => {
                const hands = {};
                combatants.forEach(idx => hands[idx] = rpsOptions[frames % 3]);
                setRankingProcess(prev => ({ ...prev, rpsHands: hands }));
                if (frames % 4 === 0) playSound('swish');
                frames++;
            }, 200); 

            await delay(2000);
            clearInterval(anim);

            const battleHands = {};
            combatants.forEach(idx => battleHands[idx] = rpsOptions[Math.floor(Math.random() * 3)]);
            
            setRankingProcess(prev => ({ ...prev, mode: 'rps_result', rpsHands: battleHands }));
            playSound('clash'); 
            
            ties.forEach(group => {
                group.forEach(playerIdx => {
                    const myHand = battleHands[playerIdx];
                    let didWin = false;
                    const opponents = group.filter(p => p !== playerIdx);
                    opponents.forEach(oppIdx => {
                        if (beats(myHand, battleHands[oppIdx])) didWin = true;
                    });
                    if (didWin) {
                        currentDecimals[playerIdx] = parseFloat((currentDecimals[playerIdx] + 0.1).toFixed(1));
                    }
                });
            });

            setRankingProcess(prev => ({ ...prev, decimals: {...currentDecimals} }));
            await delay(2500); 
        }
    }

    // 4. FINALIZE
    const getScore = (idx) => currentRolls[idx] + currentDecimals[idx];
    const sortedIndices = Object.keys(currentRolls).sort((a, b) => getScore(b) - getScore(a));
    
    if (getScore(sortedIndices[0]) >= 90) playSound('high');
    else if (getScore(sortedIndices[0]) <= 20) playSound('low');

    const newPlayers = [...players];
    sortedIndices.forEach((playerIdx, rankOrder) => {
        newPlayers[playerIdx].rank = rankOrder + 1;
        const roll = currentRolls[playerIdx];
        const dec = currentDecimals[playerIdx];
        newPlayers[playerIdx].ranking_roll = dec > 0 ? `${roll},${Math.round(dec * 10)}` : `${roll}`;
    });

    setRankingProcess({ mode: 'idle', rolls: {}, decimals: {}, tiedIndices: [], rpsHands: {} });
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const updatePlayer = (index, field, value) => {
    playSound('click');
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const adjustValue = (index, field, amount) => {
    playSound('click');
    const newPlayers = [...players];
    let newVal = (newPlayers[index][field] || 0) + amount;
    if (field === 'xp' && config?.mechanics?.use_xp) newVal = Math.max(0, Math.min(20, newVal));
    newPlayers[index][field] = newVal;
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const handleMarriage = (playerIndex, newSpouseName) => {
    playSound('click');
    const newPlayers = [...players];
    const currentPlayer = newPlayers[playerIndex];
    if (currentPlayer.spouse) {
        const oldIdx = newPlayers.findIndex(p => p.name === currentPlayer.spouse);
        if (oldIdx !== -1) newPlayers[oldIdx].spouse = "";
    }
    currentPlayer.spouse = newSpouseName;
    if (newSpouseName) {
        const newIdx = newPlayers.findIndex(p => p.name === newSpouseName);
        if (newIdx !== -1) {
            const exName = newPlayers[newIdx].spouse;
            if (exName) {
                 const exIdx = newPlayers.findIndex(p => p.name === exName);
                 if (exIdx !== -1) newPlayers[exIdx].spouse = "";
            }
            newPlayers[newIdx].spouse = currentPlayer.name;
        }
    }
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const toggleEpilogue = () => {
    playSound('click');
    syncState(players, stalemate, !epilogueMode, lastRollRecord);
    setShowRules(false); 
  };

  const getLevel = (xp) => xp < 10 ? 1 : xp < 20 ? 2 : 3;
  
  const toggleRuleSection = (id) => {
      playSound('page');
      setActiveRuleSection(activeRuleSection === id ? null : id);
  };
  
  const useFeature = (featureName) => config?.mechanics?.[featureName] === true;

  const getReminders = () => {
      if (meta.engine === 'rpg') {
          return [
              { l: "Start", v: "HS 6, LT 15" },
              { l: "Mulligan", v: "New hand -> put 1 bottom. (+1 per mulligan)" },
              { l: "Draw-out", v: "Sac non-land permanent or Lose 2 life" },
              { l: "Stalemate", v: "Dice to 10. Tiebreaker: Life > Perms > Cards" }
          ];
      }
      if (config?.rules_text && Array.isArray(config.rules_text)) {
          return config.rules_text
            .filter(r => r && r.title && ["Setup", "Ranking", "Mulligans"].includes(r.title))
            .map(r => ({ l: r.title, v: r.desc ? r.desc.split('\n')[0] : '' }));
      }
      return [];
  };

  // --- PLAYER CARD ---
  const PlayerCard = ({ player, index }) => {
    if (!player) return null;
    const reminders = getReminders();
    
    const { mode, rolls, tiedIndices, rpsHands, decimals } = rankingProcess;
    const isActive = mode !== 'idle';
    const isTied = tiedIndices.includes(index);
    const showRPS = (mode === 'rps_animate' || mode === 'rps_result') && isTied;
    const displayValue = isActive ? (rolls[index] !== undefined ? rolls[index] : '?') : (player.ranking_roll || '-');
    const decimalValue = isActive && decimals[index] > 0 ? `,${Math.round(decimals[index]*10)}` : '';

    return (
        <div className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative h-full select-none">
            <div className={`h-1 w-full ${player.color || 'bg-gray-600'}`}></div>
            <div className="p-2 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center shrink-0">
                <button onClick={handleDramaticRankingRoll} className="text-left flex-grow focus:outline-none hover:opacity-80 transition-opacity flex items-center gap-2 overflow-hidden">
                    <span className="font-black text-lg text-gray-200 truncate" style={{ fontFamily: 'Cinzel, serif' }}>{player.name}</span>
                    {showRPS ? (
                        <div className="bg-red-900/50 border border-red-500 rounded px-1.5 py-0.5 flex items-center justify-center min-w-[34px] h-[28px] animate-pulse">
                            <span className="text-xl leading-none filter drop-shadow-md">{rpsHands[index] || '✊'}</span>
                        </div>
                    ) : (
                        <div className={`border rounded px-1.5 py-0.5 flex items-center gap-0.5 shadow-md min-w-[34px] h-[28px] justify-center transition-colors duration-300 ${isTied && !showRPS ? 'bg-red-900 border-red-500' : 'bg-black border-yellow-600/50'}`}>
                            <span className={`text-sm font-bold leading-none ${isTied ? 'text-red-200' : 'text-yellow-500'}`}>
                                {displayValue}
                                {isActive && <span className="text-xs text-yellow-300 opacity-90">{decimalValue}</span>}
                            </span>
                            {!isActive && player.rank && (
                                <>
                                    <div className="h-3 w-px bg-yellow-900/50 mx-1"></div>
                                    <span className="text-xs font-bold text-yellow-500 leading-none">#{player.rank}</span>
                                </>
                            )}
                        </div>
                    )}
                </button>
                {epilogueMode && <span className="text-[10px] text-gray-500 uppercase tracking-wide absolute right-2">Epilogue</span>}
            </div>
            
            <div className="flex-grow flex flex-col p-2 gap-2 overflow-hidden min-h-0">
                {!epilogueMode ? (
                    <>
                        {useFeature('use_roles') && (
                            <div className="grid grid-cols-[1fr_auto] gap-2 items-center shrink-0">
                                <select value={player.role || ""} onChange={(e) => updatePlayer(index, 'role', e.target.value)} className="bg-black text-gray-300 border border-gray-700 text-xs rounded p-1 font-bold focus:outline-none focus:border-yellow-600 w-full appearance-none hover:border-gray-500 transition-colors">
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

                        {(useFeature('use_xp') || useFeature('use_vp') || player.vp !== undefined) && (
                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                {useFeature('use_xp') && (
                                    <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                        <span className="text-[8px] text-blue-500 font-bold mb-1">XP</span>
                                        <div className="flex items-center gap-1 w-full justify-between">
                                            <button onClick={() => adjustValue(index, 'xp', -1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button>
                                            <span className="font-mono text-lg font-bold w-6 text-center">{player.xp}</span>
                                            <button onClick={() => adjustValue(index, 'xp', 1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                    <span className="text-[8px] text-green-500 font-bold mb-1">VP</span>
                                    <div className="flex items-center gap-1 w-full justify-between">
                                        <button onClick={() => adjustValue(index, 'vp', -1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button>
                                        <span className="font-mono text-lg font-bold text-green-400 w-6 text-center">{player.vp || 0}</span>
                                        <button onClick={() => adjustValue(index, 'vp', 1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-h-0 bg-black/40 border border-gray-800 rounded p-2 overflow-y-auto custom-scrollbar relative landscape:hidden">
                            {useFeature('use_roles') && player.role && (
                                <div className="mb-3">
                                    <div className="absolute top-1 right-2 text-yellow-700 opacity-50">{getRoleIcon(player.role)}</div>
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
                                    <div className="w-full h-px bg-stone-800 my-3"></div>
                                </div>
                            )}

                            <div className="h-full flex flex-col gap-2">
                                <div className="text-stone-600 font-bold uppercase text-[9px] tracking-widest border-b border-stone-800 pb-1">
                                    Campaign Rules
                                </div>
                                <div className="space-y-2 pb-2">
                                    {reminders.map((rem, i) => (
                                        <div key={i} className="text-[10px] text-gray-400 leading-tight">
                                            <span className="text-stone-500 font-bold mr-1">{rem.l}:</span>
                                            <span className="italic opacity-80">{rem.v}</span>
                                        </div>
                                    ))}
                                    {reminders.length === 0 && <div className="text-gray-600 italic text-[10px]">No specific rules loaded.</div>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col gap-4 justify-center">
                        {useFeature('use_marriage') && (
                            <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[9px] text-indigo-400 uppercase font-bold flex items-center gap-1"><Users size={10}/> Marriage</label>
                                </div>
                                <select value={player.spouse || ""} onChange={(e) => handleMarriage(index, e.target.value)} className="w-full bg-black text-gray-300 border border-gray-700 rounded p-2 text-xs focus:outline-none focus:border-indigo-500">
                                    <option value="">Single (Unmarried)</option>
                                    {players.filter(p => p.name !== player.name).map((p, i) => <option key={i} value={p.name}>Married to {p.name}</option>)}
                                </select>
                            </div>
                        )}
                        {useFeature('use_drunk') && (
                            <div className="bg-purple-900/20 p-2 rounded border border-purple-500/30 flex justify-between items-center">
                                <span className="text-[9px] text-purple-400 font-bold uppercase">Drunk</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => adjustValue(index, 'drunk', -1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={16} /></button>
                                    <span className="text-xl font-bold text-purple-400 w-6 text-center">{player.drunk}</span>
                                    <button onClick={() => adjustValue(index, 'drunk', 1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-800 shrink-0">
                    {useFeature('track_life_total') && (
                        <div className="bg-red-900/10 rounded border border-red-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-red-600 font-bold uppercase mb-1">LIFE</span>
                            <div className="flex w-full justify-between px-1 items-center">
                                <button onClick={() => adjustValue(index, 'lt', -1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button>
                                <span className="text-xl font-mono font-bold text-red-500">{player.lt}</span>
                                <button onClick={() => adjustValue(index, 'lt', 1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button>
                            </div>
                        </div>
                    )}
                    {useFeature('track_hand_size') && (
                        <div className="bg-blue-900/10 rounded border border-blue-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-blue-600 font-bold uppercase mb-1">HAND</span>
                            <div className="flex w-full justify-between px-1 items-center">
                                <button onClick={() => adjustValue(index, 'hs', -1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button>
                                <span className="text-xl font-mono font-bold text-blue-500">{player.hs}</span>
                                <button onClick={() => adjustValue(index, 'hs', 1)} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button>
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

  if (!config) return <div className="text-white p-10 font-serif">Loading Chronicles...</div>;

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#050505] text-gray-300 font-sans relative flex">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <style>{`@keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .nebula-bg { background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000); background-size: 400% 400%; animation: nebula 15s ease infinite; }`}</style>
        <div className="w-full h-full nebula-bg"></div>
      </div>
      
      {diceOverlay.active && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
            <div className={`font-black text-[20rem] text-amber-500 animate-pulse`}>{diceOverlay.value}</div>
        </div>
      )}

      <div className={`flex-grow flex flex-col p-2 gap-2 relative z-10 transition-all duration-300 ${showRules ? 'w-full md:w-2/3' : 'w-full'}`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#111]/90 backdrop-blur border-b border-white/10 p-2 rounded-lg shrink-0 gap-2">
            <div className="flex flex-col shrink-0">
                <button onClick={() => { playSound('click'); onExit(); }} className="flex items-center gap-1 text-[10px] uppercase text-stone-500 hover:text-white mb-1">
                    <LogOut size={10}/> Exit
                </button>
                <h1 className="text-sm md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-widest uppercase truncate max-w-[150px]" style={{ fontFamily: 'Cinzel, serif' }}>
                    {meta.title}
                </h1>
                {isConnected ? <div className="text-[8px] text-green-500 flex items-center gap-1 uppercase tracking-wider"><Wifi size={8}/> Connected</div> : <div className="text-[8px] text-gray-600 flex items-center gap-1 uppercase tracking-wider"><WifiOff size={8}/> Offline Mode</div>}
            </div>

            {/* STALEMATE & LAST ROLL (Visible on mobile landscape now) */}
            <div className="flex items-center gap-2">
                <div className="bg-black/60 border border-red-900/30 rounded flex items-center px-1 gap-1">
                    <button onClick={() => { playSound('click'); setStalemate(Math.max(0, stalemate - 1)); syncState(players, Math.max(0, stalemate - 1), epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Minus size={14}/></button>
                    <span className="text-xl font-mono font-bold text-white w-6 text-center">{stalemate}</span>
                    <button onClick={() => { playSound('click'); setStalemate(stalemate + 1); syncState(players, stalemate + 1, epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Plus size={14}/></button>
                </div>

                {/* LAST ROLL DISPLAY - Now always visible in a flexible container */}
                <div className="bg-black border border-yellow-600/50 rounded px-2 py-1 flex flex-col items-center justify-center min-w-[50px] shadow-[0_0_10px_rgba(234,179,8,0.2)] flex-shrink-0">
                    <span className="text-[8px] text-gray-500 uppercase">D{lastRollRecord.type}</span>
                    <span className="text-lg font-bold text-yellow-500 leading-none">{lastRollRecord.value}</span>
                </div>
            </div>

            {/* DICE BUTTONS */}
            <div className="flex items-center gap-1">
                <button onClick={() => { playSound('click'); rollDice(6); }} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold">D6</button>
                <button onClick={() => { playSound('click'); rollDice(20); }} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold">D20</button>
            </div>

            {/* DESKTOP MENU BTNS */}
            <div className="hidden md:flex gap-1">
                <button onClick={exportData} className="p-2 hover:bg-white/10 rounded text-green-500"><Save size={16}/></button>
                <label className="p-2 hover:bg-white/10 rounded text-blue-500 cursor-pointer"><Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" /></label>
                <button onClick={() => setShowRules(!showRules)} className="p-2 bg-yellow-600 text-black rounded font-bold hover:bg-yellow-500"><BookOpen size={16}/></button>
                <button onClick={toggleEpilogue} className={`p-2 hover:bg-white/10 rounded ${epilogueMode ? 'text-yellow-400' : 'text-gray-500'}`}><Crown size={16}/></button>
                <button onClick={resetData} className="p-2 hover:bg-white/10 rounded text-red-500"><RefreshCw size={16}/></button>
            </div>
        </div>

        {/* MOBILE CODEX BUTTON (Hidden on landscape) */}
        <div className="w-full px-0 mt-0 md:hidden landscape:hidden">
            <button onClick={() => setShowRules(!showRules)} className="w-full bg-[#3d2b0f] hover:bg-[#523812] active:bg-[#2e1f0a] border border-yellow-800/50 text-yellow-100 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors group">
                <BookOpen size={18} className="text-yellow-500 group-hover:text-yellow-300"/>
                <span className="font-bold uppercase tracking-widest text-sm" style={{ fontFamily: 'Cinzel, serif' }}>Åbn Codex</span>
            </button>
        </div>

        {/* --- MAIN GAME VIEW --- */}
        <div className="hidden md:grid grid-cols-4 gap-2 flex-grow min-h-0 landscape:grid landscape:grid-cols-4 landscape:gap-2">
            {players.map((player, index) => <PlayerCard key={index} player={player} index={index} />)}
        </div>

        <div className="md:hidden landscape:hidden flex flex-grow items-center justify-center relative overflow-hidden touch-pan-y" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className="w-full h-full p-1 transition-transform duration-200">
                <PlayerCard player={players[activePlayerIndex]} index={activePlayerIndex} />
            </div>
        </div>
      </div>

      {/* --- CODEX PANE --- */}
      <div className={`fixed right-0 top-0 bottom-0 z-40 bg-[#0f0f13]/95 backdrop-blur-xl border-l border-yellow-900/30 shadow-2xl transition-all duration-300 flex flex-col ${showRules ? 'w-full md:w-1/3 translate-x-0' : 'w-full md:w-1/3 translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-yellow-500" style={{ fontFamily: 'Cinzel, serif' }}>Codex: {meta.title}</h2>
            <button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="md:hidden grid grid-cols-4 gap-2 p-4 border-b border-gray-800">
            <button onClick={exportData} className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-green-500 text-[10px] font-bold"><Save size={16}/> SAVE</button>
            <label className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-blue-500 text-[10px] font-bold cursor-pointer"><Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" /> LOAD</label>
            <button onClick={toggleEpilogue} className={`flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-[10px] font-bold ${epilogueMode ? 'text-yellow-400' : 'text-gray-500'}`}><Crown size={16}/> MODE</button>
            <button onClick={resetData} className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-red-500 text-[10px] font-bold"><RefreshCw size={16}/> RESET</button>
        </div>

        <div className="flex-grow overflow-y-auto p-2 space-y-2 text-sm text-gray-300 custom-scrollbar pb-20">
            {meta.engine === 'rpg' ? (
                <>
                    <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                        <button onClick={() => toggleRuleSection('core')} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-blue-500 hover:bg-white/5">
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
                    {/* Roles & Timeline for RPG */}
                    <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                        <button onClick={() => toggleRuleSection('roles')} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-green-500 hover:bg-white/5">
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
                    {staggingTimeline.map((event, i) => (
                        <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                            <button onClick={() => toggleRuleSection(`event-${i}`)} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-red-500 hover:bg-white/5">
                                <span><Sword size={12} className="inline mr-2"/> {event.title}</span>
                                <span>{activeRuleSection === `event-${i}` ? '−' : '+'}</span>
                            </button>
                            {activeRuleSection === `event-${i}` && <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{event.desc}</div>}
                        </div>
                    ))}
                    {/* Epilogue for RPG */}
                    <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                        <button onClick={() => toggleRuleSection('epi')} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-indigo-500 hover:bg-white/5">
                            <span><Clock size={12} className="inline mr-2"/> Epilogue</span>
                            <span>{activeRuleSection === 'epi' ? '−' : '+'}</span>
                        </button>
                        {activeRuleSection === 'epi' && (
                            <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 space-y-2">
                                <p>The Role and XP system is abandoned. Booster draft a non mono booster #105.</p>
                                <strong className="text-white block mt-2">The Day After (All vs All)</strong>
                                <p>Players start with a number of Drunk counters corresponding to their inverse placement in the previous battle.</p>
                                <p>When a Drunk counter is removed from a player he draws a card.</p>
                                <p>Sober Up: At the beginning of your upkeep, you may pay 1 (so 2 because you’re Drunk) mana to remove a Drunk counter.</p>
                                <p>All spells have “Rather than cast this card from your hand, you must pay its mana cost and exile it with a time counter on it.“</p>
                                <strong className="text-white block mt-2">The Big Day (All vs All)</strong>
                                <p>The winner of the previous battle proposes marriage to another player. That player may refuse.</p>
                                <p>The married players shuffle their decks and share a library.</p>
                                <p>Married players can’t attack each other unless they are the only remaining players.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Standard Rules */}
                    {config?.rules_text && config.rules_text.map((rule, i) => (
                        <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                            <button onClick={() => toggleRuleSection(`rule-${i}`)} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-blue-500 hover:bg-white/5">
                                <span><Info size={12} className="inline mr-2"/> {rule.title}</span>
                                <span>{activeRuleSection === `rule-${i}` ? '−' : '+'}</span>
                            </button>
                            {activeRuleSection === `rule-${i}` && <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{rule.desc}</div>}
                        </div>
                    ))}
                    {config?.timeline && config.timeline.map((event, i) => (
                        <div key={i} className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                            <button onClick={() => toggleRuleSection(`event-${i}`)} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-red-500 hover:bg-white/5">
                                <span><Sword size={12} className="inline mr-2"/> {event.title}</span>
                                <span>{activeRuleSection === `event-${i}` ? '−' : '+'}</span>
                            </button>
                            {activeRuleSection === `event-${i}` && <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{event.desc}</div>}
                        </div>
                    ))}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default UniversalCampaignManager;

