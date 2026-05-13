import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Upload, RefreshCw, Skull, Trophy, Crown, Heart, Shield, Scroll, Hammer, Ghost, BookOpen, X, Sword, Beer, Info, Clock, Users, Wifi, WifiOff, Minus, Plus, LogOut, Lock, PlayCircle, Map, Castle, FlaskConical, Palette, Check} from 'lucide-react';// IMPORT CAMPAIGN DATA
import { civData } from './civ_campaign.js';
import { staggingData } from './stagging_campaign.js';
import StressMode from './StressMode';
import ChessMode from './ChessMode';
import TrackerMode from './TrackerMode'; // <--- TILFØJ DENNE

import { stressData } from './stress_campaign';


// NYT: Importer lydfilen
import horseSound from './components/0001426.mp3'; 
import clickSound from './components/button-16a.mp3';
import dinoSound from './components/Vil Du Se Min Dino (Edit).mp3';
import bellSound from './components/bell-ringing-04.mp3';


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UniversalCampaignManager = ({ campaignId, onExit }) => {
  // --- STATE ---
  const [stressState, setStressState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [config, setConfig] = useState(null); 
    // ... dine andre states ...
  const [notFound, setNotFound] = useState(false); // <--- NY STATE
  
  const [meta, setMeta] = useState({ title: '', engine: '' });
  
  const [stalemate, setStalemate] = useState(0);
  const [epilogueMode, setEpilogueMode] = useState(false);
  const [lastRollRecord, setLastRollRecord] = useState({ type: '-', value: '-' });
  const [isConnected, setIsConnected] = useState(false);

  // Battle Tracking
  const [activeBattleIndex, setActiveBattleIndex] = useState(null);
  const [battleSnapshot, setBattleSnapshot] = useState(null);

  
  // --- DETERMINE ACTIVE CAMPAIGN DATA (SAFE VERSION) ---
  // Sikrer at appen ALDRIG crasher, selv hvis engine eller data mangler
  const activeData = (meta.engine === 'civ' ? civData : (meta.engine === 'stress' ? stressData : staggingData)) || {
      timeline: [], 
      coreRules: '', 
      roleData: {}, 
      defaults: { lt: 20, hs: 7, vp: 0 } 
  };

  // --- LOCAL MUTE STATE ---
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
      try {
          const stored = localStorage.getItem('local_mute');
          if (stored === 'true') setIsMuted(true);
      } catch (e) {}
  }, []);

  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      try { localStorage.setItem('local_mute', newState.toString()); } catch(e) {}
  };

  // UI State
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [activeRuleSection, setActiveRuleSection] = useState(null);
  const [diceOverlay, setDiceOverlay] = useState({ active: false, value: 1, type: 20, finished: false });
  
  // RANKING VISUALS STATE
  const [rankingProcess, setRankingProcess] = useState({ 
      mode: 'idle', rolls: {}, decimals: {}, tiedIndices: [], rpsHands: {} 
  });

    // Refs
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const audioRefs = useRef({});
  const debounceTimer = useRef(null); // <--- NY: Styrer forsinkelsen på save
  // --- SAFE SYNC REFS ---
    const pendingChanges = useRef({}); // Gemmer kliks: { "0-xp": 2, "1-life": -1 }

  
  // --- AUDIO ENGINE ---
  const soundUrls = {
      click: clickSound,
      dice_shake: 'https://www.soundjay.com/misc_c2026/sounds/pill-bottle-1.mp3',
      dice_land: 'https://www.soundjay.com/misc_c2026/sounds/pill-bottle-1.mp3',
      page: 'https://www.soundjay.com/misc/sounds/page-flip-01a.mp3',
      swish: 'https://www.soundjay.com/misc/sounds/slide-1.mp3',
      clash: 'https://www.soundjay.com/misc/sounds/whistle-flute-1.mp3',
      high: 'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3',
      low: 'https://www.soundjay.com/misc/sounds/fail-trombone-02.mp3',
      battle: horseSound,
      bell: bellSound,
      win: dinoSound,
      horse: horseSound
  };

useEffect(() => {
      const loadAudio = () => {
          try {
              Object.keys(soundUrls).forEach(key => {
                  const audio = new Audio(soundUrls[key]);
                  audio.preload = 'auto'; 
                  audioRefs.current[key] = audio;
              });
          } catch (e) { console.warn("Audio init failed", e); }
      };
      loadAudio();
  }, []);

  const playSound = (type) => {
    if (isMuted) return;
    try {
        const audio = audioRefs.current[type];
        if (audio) {
            audio.currentTime = 0;
            switch (type) {
                case 'click': audio.volume = 0.5; break;
                case 'dice_shake': audio.volume = 1.0; break; 
                case 'dice_land': audio.volume = 0.0; break;
                case 'swish': audio.volume = 0.3; break;
                case 'clash': audio.volume = 0.7; break;
                case 'page': audio.volume = 0.6; break;
                case 'high': audio.volume = 0.8; break;
                case 'low': audio.volume = 0.8; break;
                default: audio.volume = 0.5;
            }
            const promise = audio.play();
            if (promise !== undefined) promise.catch(() => {}); 
        }
    } catch (e) {}
  };

  // --- DATA ENGINE ---
  useEffect(() => {
    if (!campaignId) return;
    
       const loadCampaign = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .maybeSingle(); // Bruger maybeSingle for ikke at crashe ved 0 resultater
        
        if (error) throw error;

        if (!data) {
          // VIGTIGT: Hvis spillet ikke findes (f.eks. slettet), så sig det!
          console.warn("Kampagne ikke fundet (måske slettet?)");
          setNotFound(true);
          return;
        }

        // Hvis data findes, load det som normalt
        setMeta({ title: data.title || '', engine: data.engine || '' });
        setConfig(data.static_config || { mechanics: {}, rules_text: [] });
        applyActiveState(data.active_state);
        setIsConnected(true);

      } catch (err) {
        console.error("Fejl ved load:", err);
        // Vi kan vælge at vise notFound eller en error state her
        setNotFound(true); 
      }
    };

    loadCampaign();

    const channel = supabase.channel(`campaign_update_${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` }, (payload) => {
            if (payload.new && payload.new.active_state) applyActiveState(payload.new.active_state);
        }
      )
      .subscribe((status) => {
          if (status === 'SUBSCRIBED') setIsConnected(true);
          else setIsConnected(false);
      });

    return () => { supabase.removeChannel(channel); };
  }, [campaignId]);

  const applyActiveState = (state) => {
    if (!state) return;
    if (state.players) setPlayers(state.players);
    if (state.stalemate !== undefined) setStalemate(state.stalemate);
    if (state.epilogueMode !== undefined) setEpilogueMode(state.epilogueMode);
    if (state.last_roll) setLastRollRecord(state.last_roll);
    if (state.activeBattleIndex !== undefined) setActiveBattleIndex(state.activeBattleIndex);
    if (state.battleSnapshot) setBattleSnapshot(state.battleSnapshot);
    if (state.stress_state) setStressState(state.stress_state);
  };

  const syncState = async (newPlayers, newStalemate, newEpilogue, newRoll, newBattleIdx = activeBattleIndex, newSnapshot = battleSnapshot, newStressState = stressState) => {
    setPlayers(newPlayers);
    setStalemate(newStalemate);
    setEpilogueMode(newEpilogue);
    setLastRollRecord(newRoll);
    setActiveBattleIndex(newBattleIdx);
    setBattleSnapshot(newSnapshot);
    setStressState(newStressState); // Opdater lokal state

    await supabase.from('campaigns').update({ 
        active_state: { 
            players: newPlayers, stalemate: newStalemate, epilogueMode: newEpilogue, last_roll: newRoll,
            activeBattleIndex: newBattleIdx, battleSnapshot: newSnapshot,
            stress_state: newStressState // GEMMER NU STRESS DATA I DB!
        } 
    }).eq('id', campaignId);
  };

  // --- RESET LOGIC ---
  const resetData = async () => {
      playSound('click');
      if (!window.confirm("RESET CAMPAIGN STATE?")) return;

      const defs = activeData.defaults || { lt: 20, hs: 7, vp: 0 };

      if (meta.engine === 'rpg') {
          const savePoint = [
              { name: 'Christian', vp: 2, xp: 10, role: 'Smith' },
              { name: 'Andreas', vp: 1, xp: 13, role: 'Knight' },
              { name: 'Frederik', vp: 1, xp: 16, role: 'Monk' },
              { name: 'Matias', vp: 3, xp: 10, role: 'King' }
          ];
          const newPlayers = players.map(p => {
              if (!p.name) return p;
              const pName = p.name.toLowerCase();
              const save = savePoint.find(s => pName.includes(s.name.toLowerCase()) || (s.name === 'Frederik' && pName.includes('freddy')));
              if (save) {
                  return { ...p, lt: defs.lt, hs: defs.hs, vp: save.vp, xp: save.xp, role: save.role, spouse: '', drunk: 0, rank: null, ranking_roll: null };
              }
              return { ...p, lt: defs.lt, hs: defs.hs, vp: 0, xp: 0, role: '', spouse: '', drunk: 0, rank: null, ranking_roll: null };
          });
          syncState(newPlayers, 0, false, { type: '-', value: '-' }, null, null);
      } else {
          const resetPlayers = players.map(p => ({
              ...p, vp: 0, xp: 0, 
              lt: defs.lt, hs: defs.hs, 
              role: '', spouse: '', drunk: 0, rank: null, ranking_roll: null,
              // Reset Civ Stats
              nbl: 0, acmc: 0, colors: [] 
          }));
          syncState(resetPlayers, 0, false, { type: '-', value: '-' }, null, null);
      }
  };

  // --- START BATTLE ---
  const startBattle = (index) => {
      playSound('battle');
      const snapshot = JSON.parse(JSON.stringify(players));
      syncState(players, stalemate, epilogueMode, lastRollRecord, index, snapshot);
      if (!showRules) setShowRules(true);
      setActiveRuleSection(`event-${index}`);
  };

  // --- ACTIONS ---
  const exportData = () => {
    playSound('click');
    const data = JSON.stringify({ campaignId, timestamp: new Date().toISOString(), players, stalemate, epilogueMode, last_roll: lastRollRecord, activeBattleIndex, battleSnapshot }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${(meta.title || 'campaign').replace(/\s+/g, '_')}_backup.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
            syncState(data.players, data.stalemate || 0, data.epilogueMode || false, data.last_roll || { type: '-', value: '-' }, data.activeBattleIndex || null, data.battleSnapshot || null);
            alert("Spillet er loadet!"); setShowRules(false);
        }
      } catch (err) { alert("Fejl i filen."); }
    };
    reader.readAsText(file); event.target.value = ''; 
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
        if (trueFinal === sides) setTimeout(() => playSound('high'), 200);
        else if (trueFinal === 1) setTimeout(() => playSound('low'), 200);
        setDiceOverlay(prev => ({ ...prev, finished: true, value: trueFinal }));
        syncState(players, stalemate, epilogueMode, { type: sides, value: trueFinal });
        setTimeout(() => setDiceOverlay(prev => ({ ...prev, active: false })), 2000);
      }
    }, 50);
  };

  // --- RPS RANKING ---
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const rpsOptions = ['🪨', '📄', '✂️']; 
  const beats = (a, b) => (a === '🪨' && b === '✂️') || (a === '📄' && b === '🪨') || (a === '✂️' && b === '📄');

  const handleDramaticRankingRoll = async () => {
    if (rankingProcess.mode !== 'idle' && rankingProcess.mode !== 'finished') return;
    playSound('dice_shake');
    setRankingProcess({ mode: 'shuffling', rolls: {}, decimals: {}, tiedIndices: [], rpsHands: {} });
    const shuffleInterval = setInterval(() => {
        const noise = {}; players.forEach((_, i) => noise[i] = Math.floor(Math.random() * 100) + 1);
        setRankingProcess(prev => ({ ...prev, rolls: noise }));
    }, 50);
    await delay(1500); clearInterval(shuffleInterval); playSound('dice_land');
    let currentRolls = {}; let currentDecimals = {};
    players.forEach((_, i) => { currentRolls[i] = Math.floor(Math.random() * 100) + 1; currentDecimals[i] = 0.0; });
    setRankingProcess({ mode: 'show_rolls', rolls: currentRolls, decimals: currentDecimals, tiedIndices: [], rpsHands: {} });
    await delay(1500);

    let hasConflict = true;
    while (hasConflict) {
        const groups = {};
        Object.keys(currentRolls).forEach(idx => {
            const score = currentRolls[idx] + currentDecimals[idx];
            const key = score.toFixed(1); if (!groups[key]) groups[key] = []; groups[key].push(Number(idx));
        });
        const ties = Object.values(groups).filter(g => g.length > 1);
        if (ties.length === 0) hasConflict = false;
        else {
            const combatants = ties.flat();
            setRankingProcess(prev => ({ ...prev, mode: 'rps_animate', tiedIndices: combatants }));
            let frames = 0;
            const anim = setInterval(() => {
                const hands = {}; combatants.forEach(idx => hands[idx] = rpsOptions[frames % 3]);
                setRankingProcess(prev => ({ ...prev, rpsHands: hands }));
                if (frames % 2 === 0) playSound('swish'); frames++;
            }, 150); 
            await delay(2000); clearInterval(anim);
            const battleHands = {}; combatants.forEach(idx => battleHands[idx] = rpsOptions[Math.floor(Math.random() * 3)]);
            setRankingProcess(prev => ({ ...prev, mode: 'rps_result', rpsHands: battleHands })); playSound('clash');
            ties.forEach(group => {
                group.forEach(playerIdx => {
                    const myHand = battleHands[playerIdx]; let didWin = false;
                    const opponents = group.filter(p => p !== playerIdx);
                    opponents.forEach(oppIdx => { if (beats(myHand, battleHands[oppIdx])) didWin = true; });
                    if (didWin) currentDecimals[playerIdx] = parseFloat((currentDecimals[playerIdx] + 0.1).toFixed(1));
                });
            });
            setRankingProcess(prev => ({ ...prev, decimals: {...currentDecimals} })); await delay(2500); 
        }
    }
    const getScore = (idx) => currentRolls[idx] + currentDecimals[idx];
    const sortedIndices = Object.keys(currentRolls).sort((a, b) => getScore(b) - getScore(a));
    const hasNatOne = Object.values(currentRolls).includes(1);
    const hasNatHundred = Object.values(currentRolls).includes(100);
    if (hasNatOne) setTimeout(() => playSound('low'), 500); else if (hasNatHundred) setTimeout(() => playSound('high'), 500);
    const newPlayers = [...players];
    sortedIndices.forEach((playerIdx, rankOrder) => {
        newPlayers[playerIdx].rank = rankOrder + 1;
        const roll = currentRolls[playerIdx]; const dec = currentDecimals[playerIdx];
        newPlayers[playerIdx].ranking_roll = dec > 0 ? `${roll},${Math.round(dec * 10)}` : `${roll}`;
    });
    setRankingProcess({ mode: 'idle', rolls: {}, decimals: {}, tiedIndices: [], rpsHands: {} });
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const updatePlayer = (index, field, value) => {
    playSound('click'); const newPlayers = [...players]; newPlayers[index][field] = value;
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };
 // --- LOGIC ENGINE (Reusabel logik til både Local UI og Server Merge) ---
    const calculatePlayerChange = (currentPlayers, index, field, amount, snapshot) => {
        // Lav dyb kopi for at undgå mutation fejl
        let newPlayers = JSON.parse(JSON.stringify(currentPlayers));
        
        // Sikkerheds-konvertering
        const idx = parseInt(index);
        const val = Number(amount);
        let currentVal = Number(newPlayers[idx][field]) || 0;
        let newVal = currentVal + val;

        // Regler / Bounds
        if (field === 'xp' && config?.mechanics?.use_xp) newVal = Math.max(0, Math.min(20, newVal));
        if (['nbl', 'acmc'].includes(field)) newVal = Math.max(0, newVal);

        // Opdater værdien
        newPlayers[idx][field] = newVal;

        // --- KING TAX LOGIC (Kører også herinde nu) ---
        if (meta.engine === 'rpg' && field === 'xp' && activeBattleIndex !== null && snapshot) {
            const kingIndex = newPlayers.findIndex(p => p.role === 'King');
            // Kun hvis det ikke er Kongen selv
            if (kingIndex !== -1 && idx !== kingIndex) {
                const getXP = (p) => Number(p.xp) || 0;
                
                // Beregn før/efter totaler baseret på input listerne
                const snapshotNonKing = snapshot.reduce((sum, p) => p.role !== 'King' ? sum + getXP(p) : sum, 0);
                
                // Vi skal bruge "oldPlayers" (currentPlayers) til før-beregning
                const oldNonKing = currentPlayers.reduce((sum, p) => p.role !== 'King' ? sum + getXP(p) : sum, 0);
                const newNonKing = newPlayers.reduce((sum, p) => p.role !== 'King' ? sum + getXP(p) : sum, 0);

                const oldGain = Math.max(0, oldNonKing - snapshotNonKing);
                const newGain = Math.max(0, newNonKing - snapshotNonKing);
                
                const taxDiff = Math.floor(newGain / 3) - Math.floor(oldGain / 3);

                if (taxDiff !== 0) {
                    const kXP = getXP(newPlayers[kingIndex]);
                    newPlayers[kingIndex].xp = Math.max(0, Math.min(20, kXP + taxDiff));
                    // Bemærk: Vi kan ikke spille lyd herinde, da denne kører på server-data også
                }
            }
        }
        return newPlayers;
    };

  
   // --- ADJUST VALUE & CIV LOGIC (OPTIMIZED) ---
  // --- SAFE ADJUST VALUE (ZOMBIE PROOF) ---
    const adjustValue = (index, field, amount) => {
        // Tjek for King restrictions (kun RPG)
        if (meta.engine === 'rpg' && field === 'xp' && players[index].role === 'King') { 
            playSound('low'); return; 
        }

        playSound('click');

        // 1. OPTIMISTISK UI OPDATERING (Opdater skærmen med det samme baseret på hvad vi ser)
        // Vi bruger battleSnapshot fra state til UI beregning
        const optimisticPlayers = calculatePlayerChange(players, index, field, amount, battleSnapshot);
        setPlayers(optimisticPlayers); 

        // 2. KØ-HÅNDTERING (Hvis man trykker hurtigt)
        const key = `${index}-${field}`;
        pendingChanges.current[key] = (pendingChanges.current[key] || 0) + amount;

        // 3. DEBOUNCE SAVE (Vent 500ms før vi snakker med serveren)
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        debounceTimer.current = setTimeout(async () => {
            // Nulstil køen og gem hvad vi skal ændre
            const changesToApply = { ...pendingChanges.current };
            pendingChanges.current = {}; 

            try {
                // A. HENT SANDHEDEN (Fetch Fresh Source of Truth)
                const { data, error } = await supabase
                    .from('campaigns')
                    .select('active_state')
                    .eq('id', campaignId)
                    .single();

                if (error || !data) throw new Error("Fetch failed");

                let serverState = data.active_state;
                let serverPlayers = serverState.players;
                let serverSnapshot = serverState.battleSnapshot;

                // B. PÅFØR ÆNDRINGER PÅ SANDHEDEN (Replay changes on fresh data)
                Object.keys(changesToApply).forEach(changeKey => {
                    const [idx, f] = changeKey.split('-');
                    const val = changesToApply[changeKey];
                    // Kør logikken igen, men denne gang på serverens data!
                    serverPlayers = calculatePlayerChange(serverPlayers, idx, f, val, serverSnapshot);
                });

                // C. GEM DEN NYE SANDHED
                const newState = { ...serverState, players: serverPlayers };
                
                await supabase
                    .from('campaigns')
                    .update({ active_state: newState })
                    .eq('id', campaignId);
                
                // D. SYNKRONISER LOKALT (Så vi er 100% enige med serveren)
                // Dette retter eventuelle fejl, hvis vores telefon var "out of sync"
                setPlayers(serverPlayers); 
                setStressState(serverState.stress_state); // God ide at få det hele med

            } catch (err) {
                console.error("Safe Save Failed:", err);
                // Hvis det fejler, prøv igen eller giv besked (valgfrit)
            }

        }, 500);
    };

  // --- CIV: TOGGLE COLOR ---
  const toggleCivColor = (playerIndex, colorCode) => {
      playSound('click');
      const newPlayers = [...players];
      const player = newPlayers[playerIndex];
      const colors = player.colors || [];
      if (colors.includes(colorCode)) {
          player.colors = colors.filter(c => c !== colorCode);
      } else {
          player.colors = [...colors, colorCode];
      }
      syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const handleMarriage = (playerIndex, newSpouseName) => {
    playSound('click'); const newPlayers = [...players]; const currentPlayer = newPlayers[playerIndex];
    if (currentPlayer.spouse) { const oldIdx = newPlayers.findIndex(p => p.name === currentPlayer.spouse); if (oldIdx !== -1) newPlayers[oldIdx].spouse = ""; }
    currentPlayer.spouse = newSpouseName;
    if (newSpouseName) {
        const newIdx = newPlayers.findIndex(p => p.name === newSpouseName);
        if (newIdx !== -1) {
            const exName = newPlayers[newIdx].spouse;
            if (exName) { const exIdx = newPlayers.findIndex(p => p.name === exName); if (exIdx !== -1) newPlayers[exIdx].spouse = ""; }
            newPlayers[newIdx].spouse = currentPlayer.name;
        }
    }
    syncState(newPlayers, stalemate, epilogueMode, lastRollRecord);
  };

  const toggleEpilogue = () => { playSound('click'); syncState(players, stalemate, !epilogueMode, lastRollRecord); setShowRules(false); };
  const getLevel = (xp) => xp < 10 ? 1 : xp < 20 ? 2 : 3;
  const toggleRuleSection = (id) => { playSound('page'); setActiveRuleSection(activeRuleSection === id ? null : id); };
  const useFeature = (featureName) => config?.mechanics?.[featureName] === true;

  // --- DOM DIRECT SWIPE ---
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const currentTranslate = useRef(0);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false; currentTranslate.current = 0; if (cardRef.current) cardRef.current.style.transition = 'none';
  };

  const onTouchMove = (e) => {
    const currentX = e.touches[0].clientX; const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current; const diffY = currentY - touchStartY.current;
    if (!isSwiping.current) { if (Math.abs(diffY) > Math.abs(diffX)) return; if (Math.abs(diffX) > 10) isSwiping.current = true; }
    if (isSwiping.current) {
        if (e.cancelable) e.preventDefault(); currentTranslate.current = diffX;
        if (cardRef.current) { cardRef.current.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.05}deg)`; cardRef.current.style.opacity = `${1 - Math.abs(diffX) / 500}`; }
    }
  };

  const onTouchEnd = () => {
    if (!cardRef.current) return;
    const movedBy = currentTranslate.current; const threshold = 75; const screenW = window.innerWidth;
    if (isSwiping.current) {
        if (movedBy < -threshold) {
            playSound('swish'); cardRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s';
            cardRef.current.style.transform = `translateX(-${screenW}px) rotate(-20deg)`; cardRef.current.style.opacity = '0';
            setTimeout(() => {
                setActivePlayerIndex((prev) => (prev + 1) % players.length);
                cardRef.current.style.transition = 'none'; cardRef.current.style.transform = `translateX(${screenW}px) rotate(20deg)`;
                requestAnimationFrame(() => { requestAnimationFrame(() => { cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s'; cardRef.current.style.transform = 'translateX(0) rotate(0deg)'; cardRef.current.style.opacity = '1'; }); });
            }, 200);
        } else if (movedBy > threshold) {
            playSound('swish'); cardRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s';
            cardRef.current.style.transform = `translateX(${screenW}px) rotate(20deg)`; cardRef.current.style.opacity = '0';
            setTimeout(() => {
                setActivePlayerIndex((prev) => (prev - 1 + players.length) % players.length);
                cardRef.current.style.transition = 'none'; cardRef.current.style.transform = `translateX(-${screenW}px) rotate(-20deg)`;
                requestAnimationFrame(() => { requestAnimationFrame(() => { cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s'; cardRef.current.style.transform = 'translateX(0) rotate(0deg)'; cardRef.current.style.opacity = '1'; }); });
            }, 200);
        } else {
            cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s';
            cardRef.current.style.transform = 'translateX(0px) rotate(0deg)'; cardRef.current.style.opacity = '1';
        }
    }
    isSwiping.current = false; currentTranslate.current = 0;
  };

  // --- HELPERS (ROLE/RULES) ---
  const getRoleAbilities = (role) => {
    if (activeData.roleData && activeData.roleData[role]) { return activeData.roleData[role].abilities; }
    return [];
  };
  const getRoleReward = (role) => {
    if (activeData.roleData && activeData.roleData[role]) { return `Reward: ${activeData.roleData[role].reward}`; }
    return '';
  };
  const getRoleIcon = (role) => {
      switch(role) { case 'Doctor': return <Heart size={12} />; case 'Monk': return <Scroll size={12} />; case 'Smith': return <Hammer size={12} />; case 'Knight': return <Shield size={12} />; case 'Fool': return <Ghost size={12} />; case 'King': return <Crown size={12} />; default: return null; }
  };
  const getReminders = () => {
      if (activeData && activeData.defaults) {
          const { lt, hs } = activeData.defaults;
          const reminders = [
              { l: "Start", v: `HS ${hs}, LT ${lt}` },
              { l: "Mulligan", v: "New hand -> put 1 bottom. (+1 per mulligan)" },
              { l: "Draw-out", v: "Sac non-land permanent or Lose 2 life" },
              { l: "Stalemate", v: "Dice to 10." }
          ];
          if (meta.engine === 'civ') {
              reminders.push({ l: "Move", v: "Pay X mana for X moves." });
              reminders.push({ l: "Attack", v: "Adjacent only." });
          }
          return reminders;
      }
      return [];
  };
  // --- HELPER: CIV DECK SIZE ---
  const getCivDeckSize = (battleIdx) => {
      // Basis er 20. For hver battle (index) stiger den med 3.
      // Index 0 (Battle 1) = 20 + 0 = 20
      // Index 1 (Battle 2) = 20 + 3 = 23
      const idx = battleIdx !== null ? battleIdx : 0;
      return 20 + (idx * 3);
  };

 // --- PLAYER CARD COMPONENT ---
  const PlayerCard = ({ player, index }) => {
    if (!player) return null;
    const reminders = getReminders();
    const isKing = player.role === 'King';
    const { mode, rolls, tiedIndices, rpsHands, decimals } = rankingProcess;
    const isActive = mode !== 'idle';
    const isTied = tiedIndices.includes(index);
    const showRPS = (mode === 'rps_animate' || mode === 'rps_result') && isTied;
    const displayValue = isActive ? (rolls[index] !== undefined ? rolls[index] : '?') : (player.ranking_roll || '-');
    const decimalValue = isActive && decimals[index] > 0 ? `,${Math.round(decimals[index]*10)}` : '';

    // --- SNIPPET 1: SPLIT LOGIC (DIODER vs BANNERE) ---
    
    // A. DIODER (Kun for denne spiller - vises KUN på Landscape Mobile)
    const getCivDiodes = () => {
        if (meta.engine !== 'civ') return null;
        
        const nbl = player.nbl || 0;
        const acmc = player.acmc || 0;
        const colors = player.colors?.length || 0;

        const showEco = nbl >= 4;     
        const showSci = acmc >= 8;    
        const showCult = colors >= 4; 

        if (!showEco && !showSci && !showCult) return null;

        // VISNING: 'hidden' som standard. 'landscape:flex' tænder den på liggende mobil. 'lg:hidden' slukker den på desktop.
        return (
            <div className="hidden landscape:flex lg:hidden absolute top-1.5 right-1.5 z-50 gap-1 pointer-events-none">
                {showEco && <div className={`w-2.5 h-2.5 rounded-full bg-amber-500 border border-white/30 shadow-[0_0_8px_rgba(245,158,11,1)] ${nbl >= 6 ? 'animate-bounce' : 'animate-pulse'}`} />}
                {showSci && <div className={`w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white/30 shadow-[0_0_8px_rgba(6,182,212,1)] ${acmc >= 10 ? 'animate-bounce' : 'animate-pulse'}`} />}
                {showCult && <div className={`w-2.5 h-2.5 rounded-full bg-purple-500 border border-white/30 shadow-[0_0_8px_rgba(168,85,247,1)] ${colors >= 5 ? 'animate-bounce' : 'animate-pulse'}`} />}
            </div>
        );
    };

    // B. BANNERE (Global status for alle - vises på Vertical Mobile & Desktop)
    const getAllCivBanners = () => {
        if (meta.engine !== 'civ') return null;
        const msgs = [];

        // Tjek ALLE spillere, ikke kun den aktuelle
        players.forEach(p => {
            const pName = p.name ? p.name.split(' ')[0].toUpperCase() : '???';
            
            // Eco
            const nbl = p.nbl || 0;
            if (nbl >= 6) msgs.push({ txt: `${pName} HAS WON (ECO)!`, col: 'bg-amber-600', border: 'border-amber-800' });
            else if (nbl >= 4) msgs.push({ txt: `${pName} IS ${6 - nbl} PTS FROM ECO WIN`, col: 'bg-amber-700', border: 'border-amber-900' });

            // Sci
            const acmc = p.acmc || 0;
            if (acmc >= 10) msgs.push({ txt: `${pName} HAS WON (SCI)!`, col: 'bg-cyan-600', border: 'border-cyan-800' });
            else if (acmc >= 8) msgs.push({ txt: `${pName} IS ${10 - acmc} CMC FROM SCI WIN`, col: 'bg-cyan-700', border: 'border-cyan-900' });

            // Cult
            const cols = p.colors?.length || 0;
            if (cols >= 5) msgs.push({ txt: `${pName} HAS WON (CULT)!`, col: 'bg-purple-600', border: 'border-purple-800' });
            else if (cols === 4) msgs.push({ txt: `${pName} IS 1 COLOR FROM CULT WIN`, col: 'bg-purple-700', border: 'border-purple-900' });
        });

        if (msgs.length === 0) return null;

        // VISNING: 'flex' som standard (Vertical). 'landscape:hidden' skjuler den på liggende mobil. 'lg:flex' viser den igen på desktop.
        return (
            <div className="flex flex-col gap-1 mb-1 shrink-0 w-full landscape:hidden lg:flex">
                {msgs.map((m, i) => (
                    <div key={i} className={`${m.col} text-white text-[9px] font-black uppercase tracking-widest text-center py-1 animate-pulse rounded border ${m.border} shadow-sm`}>
                        {m.txt}
                    </div>
                ))}
            </div>
        );
    };

    // --- SNIPPET 2: RETURN MED KORREKT PLACERING ---
    return (
        <div className="flex flex-col bg-[#111]/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden shadow-2xl relative h-full select-none group transition-all duration-300">
            
            {/* 1. DIODER (Ligger absolute/svævende - Kun Landscape) */}
            {getCivDiodes()}
            
            <div className={`h-1 w-full ${player.color || 'bg-gray-600'}`}></div>
            
            {/* Header */}
            <div className="p-1 md:p-2 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center shrink-0">
                <button onClick={() => { handleDramaticRankingRoll(); }} className="text-left flex-grow focus:outline-none hover:opacity-80 transition-opacity flex items-center gap-2 overflow-hidden">
                    <span className="font-black text-xs md:text-lg text-gray-200 truncate" style={{ fontFamily: 'Cinzel, serif' }}>{player.name}</span>
                    {showRPS ? (
                        <div className="bg-red-900/50 border border-red-500 rounded px-1.5 py-0.5 flex items-center justify-center min-w-[34px] h-[28px] animate-pulse"><span className="text-xl leading-none filter drop-shadow-md">{rpsHands[index] || '✊'}</span></div>
                    ) : (
                        <div className={`border rounded px-1.5 py-0.5 flex items-center gap-0.5 shadow-md min-w-[34px] h-[20px] md:h-[28px] justify-center transition-colors duration-300 ${isTied && !showRPS ? 'bg-red-900 border-red-500' : 'bg-black border-yellow-600/50'}`}>
                            <span className={`text-xs md:text-sm font-bold leading-none ${isTied ? 'text-red-200' : 'text-yellow-500'}`}>{displayValue}{isActive && <span className="text-[9px] text-yellow-300 opacity-90">{decimalValue}</span>}</span>
                            {!isActive && player.rank && (<><div className="h-2 md:h-3 w-px bg-yellow-900/50 mx-1"></div><span className="text-[10px] md:text-xs font-bold text-yellow-500 leading-none">#{player.rank}</span></>)}
                        </div>
                    )}
                </button>
            </div>
            
           {/* Body: Scroll aktiveret KUN på landscape phone */}
            <div className="flex-grow flex flex-col p-1.5 md:p-2 gap-1.5 md:gap-2 min-h-0 overflow-hidden landscape:overflow-y-auto lg:overflow-hidden custom-scrollbar">
                
                {/* 2. BANNERE (Ligger herinde, så de skubber indholdet ned - Kun Vertical/Desktop) */}
                {getAllCivBanners()}

                {!epilogueMode ? (
                    <>
                        {useFeature('use_roles') && (
                            <div className="grid grid-cols-[1fr_auto] gap-2 items-center shrink-0">
                                <select value={player.role || ""} onChange={(e) => updatePlayer(index, 'role', e.target.value)} className="bg-black text-gray-300 border border-gray-700 text-xs rounded p-1 font-bold focus:outline-none focus:border-yellow-600 w-full appearance-none hover:border-gray-500 transition-colors">
                                    <option value="">-- No Role --</option>
                                    {Object.keys(activeData.roleData || {}).map(r=><option key={r} value={r}>{r}</option>)}
                                </select>
                                {useFeature('use_xp') && (
                                    <div className="flex flex-col items-center leading-none"><span className="text-[8px] text-gray-600 uppercase">Lvl</span><span className="text-xl font-bold text-blue-500" style={{ fontFamily: 'Cinzel, serif' }}>{getLevel(player.xp)}</span></div>
                                )}
                            </div>
                        )}
                        
                        {/* XP & VP SECTION - FULL WIDTH IF NO XP */}
                        {(useFeature('use_xp') || useFeature('use_vp') || player.vp !== undefined) && (
                            <div className={`grid gap-2 shrink-0 ${useFeature('use_xp') ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {useFeature('use_xp') && (
                                    <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                        <span className="text-[8px] text-blue-500 font-bold mb-1">XP</span>
                                        <div className="flex items-center gap-1 w-full justify-between">
                                            {isKing && meta.engine === 'rpg' ? (<div className="w-8 h-8 flex items-center justify-center rounded bg-gray-900/50 border border-gray-800 text-gray-600 cursor-not-allowed"><Lock size={12}/></div>) : (<button onClick={() => { playSound('click'); adjustValue(index, 'xp', -1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button>)}
                                            <span className={`font-mono text-lg font-bold w-6 text-center ${isKing ? 'text-yellow-500' : ''}`}>{player.xp}</span>
                                            {isKing && meta.engine === 'rpg' ? (<div className="w-8 h-8 flex items-center justify-center rounded bg-gray-900/50 border border-gray-800 text-gray-600 cursor-not-allowed"><Lock size={12}/></div>) : (<button onClick={() => { playSound('click'); adjustValue(index, 'xp', 1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button>)}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-black/30 rounded p-1 border border-gray-800 flex flex-col items-center">
                                    <span className="text-[8px] text-green-500 font-bold mb-1">VP</span>
                                    <div className="flex items-center gap-1 w-full justify-between">
                                        <button onClick={() => { playSound('click'); adjustValue(index, 'vp', -1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button>
                                        <span className="font-mono text-lg font-bold text-green-400 w-6 text-center">{player.vp || 0}</span>
                                        <button onClick={() => { playSound('click'); adjustValue(index, 'vp', 1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- CIV SPECIFIC TRACKERS --- */}
                        {meta.engine === 'civ' && (
                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                {/* Economic */}
                                <div className="bg-amber-900/10 rounded p-1 border border-amber-800/30 flex flex-col items-center relative overflow-hidden">
                                    {player.nbl >= 6 && <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>}
                                    <span className="text-[8px] text-amber-600 font-bold mb-1 flex items-center gap-1"><Castle size={8}/> ECO</span>
                                    <div className="flex items-center gap-1 w-full justify-between relative z-10">
                                        <button onClick={() => { playSound('click'); adjustValue(index, 'nbl', -1); }} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700"><Minus size={10} /></button>
                                        <span className={`font-mono text-base font-bold w-4 text-center ${player.nbl >= 6 ? 'text-amber-400' : 'text-amber-700'}`}>{player.nbl || 0}</span>
                                        <button onClick={() => { playSound('click'); adjustValue(index, 'nbl', 1); }} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700"><Plus size={10} /></button>
                                    </div>
                                </div>

                                {/* Scientific */}
                                <div className="bg-cyan-900/10 rounded p-1 border border-cyan-800/30 flex flex-col items-center relative overflow-hidden">
                                    {player.acmc >= 10 && <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>}
                                    <span className="text-[8px] text-cyan-600 font-bold mb-1 flex items-center gap-1"><FlaskConical size={8}/> SCI</span>
                                    <div className="flex items-center gap-1 w-full justify-between relative z-10">
                                        <button onClick={() => { playSound('click'); adjustValue(index, 'acmc', -1); }} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700"><Minus size={10} /></button>
                                        <span className={`font-mono text-base font-bold w-4 text-center ${player.acmc >= 10 ? 'text-cyan-400' : 'text-cyan-700'}`}>{player.acmc || 0}</span>
                                        <button onClick={() => { playSound('click'); adjustValue(index, 'acmc', 1); }} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700"><Plus size={10} /></button>
                                    </div>
                                </div>

                                {/* Cultural: Updated with Checkmark */}
                                <div className="col-span-2 bg-purple-900/10 rounded p-1 border border-purple-800/30 flex flex-col items-center relative overflow-hidden">
                                    {(player.colors && player.colors.length >= 5) && <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>}
                                    <span className="text-[8px] text-purple-600 font-bold mb-1 flex items-center gap-1"><Palette size={8}/> CULTURE</span>
                                    <div className="flex gap-2 relative z-10">
                                        {[
                                            {c: 'W', hex: '#fdf6e3'}, 
                                            {c: 'U', hex: '#3b82f6'}, 
                                            {c: 'B', hex: '#111'}, 
                                            {c: 'R', hex: '#ef4444'}, 
                                            {c: 'G', hex: '#22c55e'}
                                        ].map((col) => {
                                            const hasColor = (player.colors || []).includes(col.c);
                                            // Sort checkmark på hvid knap, hvid checkmark på alle andre
                                            const checkColor = col.c === 'W' ? 'text-black' : 'text-white';
                                            return (
                                                <button 
                                                    key={col.c}
                                                    onClick={() => toggleCivColor(index, col.c)}
                                                    className={`w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center transition-all ${
                                                        hasColor 
                                                        ? 'opacity-100 scale-110 ring-2 ring-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                                                        : 'opacity-20 hover:opacity-50'
                                                    }`}
                                                    style={{ backgroundColor: col.hex }}
                                                >
                                                    {hasColor && <Check size={14} className={`${checkColor} stroke-[4] drop-shadow-sm`} />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-h-0 bg-black/40 border border-gray-800 rounded p-2 overflow-y-auto custom-scrollbar relative flex flex-col landscape:hidden lg:landscape:flex">
                            {useFeature('use_roles') && player.role && meta.engine === 'rpg' && (
                                <div className="mb-3 shrink-0">
                                    <div className="absolute top-1 right-2 text-yellow-700 opacity-50">{getRoleIcon(player.role)}</div>
                                    <div className="text-[10px] md:text-xs text-gray-400 leading-tight space-y-2">
                                        {getRoleAbilities(player.role).map((txt, i) => {
                                            const lvl = i + 1; const isUnlocked = useFeature('use_xp') ? getLevel(player.xp) >= lvl : true;
                                            return (<div key={i} className={`flex gap-1 ${isUnlocked ? 'text-green-300' : 'text-gray-600'}`}><span className="font-bold whitespace-nowrap">Lvl {lvl}:</span><span>{txt}</span></div>)
                                        })}
                                        <div className="w-full h-px bg-gray-800 my-1"></div>
                                        <div className="text-yellow-600 italic text-[10px]">{getRoleReward(player.role)}</div>
                                    </div>
                                    <div className="w-full h-px bg-stone-800 my-3"></div>
                                </div>
                            )}
                            <div className="h-full flex flex-col gap-2 shrink-0">
                                <div className="text-stone-600 font-bold uppercase text-[9px] tracking-widest border-b border-stone-800 pb-1 flex justify-between">
                                    <span>{activeBattleIndex !== null ? 'ACTIVE BATTLE RULES' : 'CAMPAIGN RULES'}</span>
                                    {activeBattleIndex !== null && <span className="text-red-500 animate-pulse">● LIVE</span>}
                                </div>
                                <div className="space-y-2 pb-2">
                                    {activeBattleIndex !== null ? (
                                        <div className="text-[10px] text-gray-400 leading-tight space-y-3">
                                            {/* NYT: VIS DECK SIZE I CIV MODE */}
                                            {meta.engine === 'civ' && (
                                                <div className="bg-blue-900/20 text-blue-300 px-2 py-1 rounded border border-blue-800/50 font-bold text-center uppercase tracking-widest text-[9px]">
                                                    Min Deck Size: {getCivDeckSize(activeBattleIndex)}
                                                </div>
                                            )}
                                            
                                            <div>
                                                <strong className="text-red-400 block mb-1">{activeData.timeline[activeBattleIndex].title}</strong>
                                                <span className="italic opacity-90 whitespace-pre-wrap">{activeData.timeline[activeBattleIndex].desc}</span>
                                            </div>
                                            {activeData.timeline[activeBattleIndex + 1] && activeData.timeline[activeBattleIndex + 1].type === 'post' && (
                                                <div className="pt-2 border-t border-gray-800">
                                                    <strong className="text-blue-400 block mb-1">{activeData.timeline[activeBattleIndex + 1].title}</strong>
                                                    <span className="italic opacity-80 whitespace-pre-wrap">{activeData.timeline[activeBattleIndex + 1].desc}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>{reminders.map((rem, i) => (<div key={i} className="text-[10px] text-gray-400 leading-tight"><span className="text-stone-500 font-bold mr-1">{rem.l}:</span><span className="italic opacity-80">{rem.v}</span></div>))}</>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col gap-2 min-h-0">
                        <div className="shrink-0 flex flex-col gap-2">
                            {useFeature('use_marriage') && (
                                <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                                    <div className="flex justify-between items-center mb-1"><label className="text-[9px] text-indigo-400 uppercase font-bold flex items-center gap-1"><Users size={10}/> Marriage</label></div>
                                    <select value={player.spouse || ""} onChange={(e) => handleMarriage(index, e.target.value)} className="w-full bg-black text-gray-300 border border-gray-700 rounded p-2 text-xs focus:outline-none focus:border-indigo-500"><option value="">Single (Unmarried)</option>{players.filter(p => p.name !== player.name).map((p, i) => <option key={i} value={p.name}>Married to {p.name}</option>)}</select>
                                </div>
                            )}
                            {useFeature('use_drunk') && (
                                <div className="bg-purple-900/20 p-2 rounded border border-purple-500/30 flex justify-between items-center">
                                    <span className="text-[9px] text-purple-400 font-bold uppercase">Drunk</span>
                                    <div className="flex items-center gap-2"><button onClick={() => { playSound('click'); adjustValue(index, 'drunk', -1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={16} /></button><span className="text-xl font-bold text-purple-400 w-6 text-center">{player.drunk}</span><button onClick={() => { playSound('click'); adjustValue(index, 'drunk', 1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={16} /></button></div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-h-0 bg-black/40 border border-gray-800 rounded p-2 overflow-y-auto custom-scrollbar relative flex flex-col landscape:hidden lg:landscape:flex">
                             <div className="text-stone-600 font-bold uppercase text-[9px] tracking-widest border-b border-stone-800 pb-1 mb-2 shrink-0">Epilogue Rules</div>
                            <div className="space-y-3 text-[10px] text-gray-400 leading-tight">
                                <p className="italic opacity-80">The Role and XP system is abandoned. Booster draft a non mono booster #105.</p>
                                <div className="border-l-2 border-purple-500/50 pl-2"><strong className="text-purple-400 block uppercase tracking-widest text-[9px] mb-1">The Day After (All vs All)</strong><ul className="list-disc pl-3 space-y-1 opacity-90"><li>Players start with a number of Drunk counters corresponding to their inverse placement in the previous battle.</li><li>When a Drunk counter is removed from a player he draws a card.</li><li><strong>Sober Up:</strong> At the beginning of your upkeep, you may pay 1 (so 2 because you’re Drunk) mana to remove a Drunk counter.</li><li>All spells have Suspend. Creatures enter tapped.</li><li>Last place gains +1 LT, second last +2 LT and so on. LTs can exceed 20.</li></ul></div>
                                <div className="border-l-2 border-indigo-500/50 pl-2"><strong className="text-indigo-400 block uppercase tracking-widest text-[9px] mb-1">The Big Day (All vs All)</strong><ul className="list-disc pl-3 space-y-1 opacity-90"><li>The winner of the previous battle proposes marriage.</li><li>The married players shuffle their decks and share a library.</li><li>Married players can’t attack each other unless they are the only remaining players.</li></ul><p className="text-indigo-300 font-bold italic mt-2 text-center">The final remaining player wins the Epilogue.</p></div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-800 shrink-0">
                    {useFeature('track_life_total') && (
                        <div className="bg-red-900/10 rounded border border-red-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-red-600 font-bold uppercase mb-1">LIFE</span>
                            <div className="flex w-full justify-between px-1 items-center"><button onClick={() => { playSound('click'); adjustValue(index, 'lt', -1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button><span className="text-xl font-mono font-bold text-red-500">{player.lt}</span><button onClick={() => { playSound('click'); adjustValue(index, 'lt', 1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button></div>
                        </div>
                    )}
                    {useFeature('track_hand_size') && (
                        <div className="bg-blue-900/10 rounded border border-blue-900/30 flex flex-col items-center p-1">
                            <span className="text-[8px] text-blue-600 font-bold uppercase mb-1">HAND</span>
                            <div className="flex w-full justify-between px-1 items-center"><button onClick={() => { playSound('click'); adjustValue(index, 'hs', -1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Minus size={14} /></button><span className="text-xl font-mono font-bold text-blue-500">{player.hs}</span><button onClick={() => { playSound('click'); adjustValue(index, 'hs', 1); }} className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-gray-400 active:bg-gray-600 border border-gray-700"><Plus size={14} /></button></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

    // ---------------------------------------------------------
  // 1. GAME NOT FOUND (Safety Screen)
  // ---------------------------------------------------------
  if (notFound) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-red-600 font-serif gap-6">
            <h1 className="text-4xl font-bold">Timeline Pruned</h1>
            <p className="text-stone-500">This campaign no longer exists.</p>
            <button 
                onClick={onExit} 
                className="px-6 py-3 border border-red-800 text-red-500 rounded hover:bg-red-900/20 uppercase tracking-widest text-xs font-bold transition-all"
            >
                Return to Lobby
            </button>
        </div>
      );
  }

  // ---------------------------------------------------------
  // 2. LOADING SCREEN (Nu med "ABORT" knap!)
  // ---------------------------------------------------------
  if (!config) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-yellow-600 font-serif gap-8 relative">
            <div className="text-2xl animate-pulse">Loading Chronicles...</div>
            
            {/* SAFETY HATCH: Hvis den hænger, kan man altid klikke her */}
            <button 
                onClick={onExit}
                className="absolute bottom-10 text-stone-600 text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
            >
                <LogOut size={14}/> Cancel / Back to Lobby
            </button>
        </div>
      );
  }

  // ---------------------------------------------------------
  // 3. STRESS MODE HIJACK
  // ---------------------------------------------------------
  if (meta.engine === 'stress') {
      return (
          <StressMode 
              players={players} 
              activeBattleIndex={activeBattleIndex} 
              updatePlayer={updatePlayer} // Bruges til at SETTE (f.eks. minutter)
              adjustPlayer={adjustValue} // Bruges til at JUSTERE (f.eks. liv/drunk)
              syncState={syncState}
              gameConfig={activeData}
              playSound={playSound}
              onExit={onExit} // Sikrer at vi bruger den rigtige exit prop
              remoteStressState={stressState}
          />
      );
  }

 // --- HER INDSÆTTER DU TRACKER MODE ---
else if (meta.engine === 'tracker') {
    return (
        <TrackerMode
            players={players}
            updatePlayer={updatePlayer}
            syncState={syncState}
            playSound={playSound}
            onExit={onExit}
            campaignId={campaignId}
        />
    );
}

  // ---------------------------------------------------------
  // 4. CHESS MODE HIJACK (NY)
  // ---------------------------------------------------------
  if (meta.engine === 'chess') {
      return (
          <ChessMode 
              players={players} 
              activeBattleIndex={activeBattleIndex} 
              updatePlayer={updatePlayer}
              adjustPlayer={adjustValue}
              syncState={syncState}
              gameConfig={activeData}
              playSound={playSound}
              onExit={onExit}
              remoteStressState={stressState}
          />
      );
  }
 

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#050505] text-gray-300 font-sans relative flex">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"><style>{`@keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .nebula-bg { background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000); background-size: 400% 400%; animation: nebula 15s ease infinite; }`}</style><div className="w-full h-full nebula-bg"></div></div>
      {diceOverlay.active && (<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"><div className={`font-black text-[20rem] text-amber-500 animate-pulse`}>{diceOverlay.value}</div></div>)}
      <div className={`flex-grow flex flex-col p-2 gap-2 relative z-10 transition-all duration-300 ${showRules ? 'w-full md:w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center bg-[#111]/90 backdrop-blur border-b border-white/10 p-2 rounded-lg shrink-0 gap-2">
            <div className="flex flex-col shrink-0"><button onClick={() => { playSound('click'); onExit(); }} className="flex items-center gap-1 text-[10px] uppercase text-stone-500 hover:text-white mb-1"><LogOut size={10}/> Exit</button><h1 className="text-sm md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-widest uppercase truncate max-w-[150px]" style={{ fontFamily: 'Cinzel, serif' }}>{meta.title}</h1><div className="flex items-center gap-2 mt-1">{isConnected ? <div className="text-[8px] text-green-500 flex items-center gap-1 uppercase tracking-wider"><Wifi size={8}/> Connected</div> : <div className="text-[8px] text-gray-600 flex items-center gap-1 uppercase tracking-wider"><WifiOff size={8}/> Offline Mode</div>}<button onClick={toggleMute} className={`text-[8px] uppercase font-bold text-stone-500 hover:text-stone-300 ml-2`}>{isMuted ? "SOUND IS OFF" : "SOUND IS ON"}</button></div></div>
            <div className="flex items-center gap-2"><div className="bg-black/60 border border-red-900/30 rounded flex items-center px-1 gap-1"><button onClick={() => { playSound('click'); setStalemate(Math.max(0, stalemate - 1)); syncState(players, Math.max(0, stalemate - 1), epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Minus size={14}/></button><span className="text-xl font-mono font-bold text-white w-6 text-center">{stalemate}</span><button onClick={() => { playSound('click'); setStalemate(stalemate + 1); syncState(players, stalemate + 1, epilogueMode, lastRollRecord); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 font-bold"><Plus size={14}/></button></div><div className="bg-black border border-yellow-600/50 rounded px-2 py-1 flex flex-col items-center justify-center min-w-[50px] shadow-[0_0_10px_rgba(234,179,8,0.2)] flex-shrink-0"><span className="text-[8px] text-gray-500 uppercase">D{lastRollRecord.type}</span><span className="text-lg font-bold text-yellow-500 leading-none">{lastRollRecord.value}</span></div></div>
            <div className="flex items-center gap-1"><button onClick={() => rollDice(4)} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold hidden md:block landscape:block">D4</button><button onClick={() => rollDice(6)} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold">D6</button><button onClick={() => rollDice(8)} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold hidden md:block landscape:block">D8</button><button onClick={() => rollDice(10)} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold hidden md:block landscape:block">D10</button><button onClick={() => rollDice(20)} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold">D20</button><button onClick={() => rollDice(100)} className="px-2 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded text-xs font-bold hidden md:block landscape:block">D100</button></div>
            <div className="hidden md:flex gap-1">
                <button onClick={exportData} className="p-2 hover:bg-white/10 rounded text-green-500"><Save size={16}/></button>
                <label className="p-2 hover:bg-white/10 rounded text-blue-500 cursor-pointer"><Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" /></label>
                <button onClick={() => { playSound('page'); setShowRules(!showRules); }} className="p-2 bg-yellow-600 text-black rounded font-bold hover:bg-yellow-500"><BookOpen size={16}/></button>
                
                {/* KUN VIS EPILOG KNAP I RPG */}
                {meta.engine === 'rpg' && (
                    <button onClick={toggleEpilogue} className={`p-2 hover:bg-white/10 rounded ${epilogueMode ? 'text-yellow-400' : 'text-gray-500'}`}><Crown size={16}/></button>
                )}
                
                <button onClick={resetData} className="p-2 hover:bg-white/10 rounded text-red-500"><RefreshCw size={16}/></button>
            </div>
        </div>
        <div className="w-full px-0 mt-0 md:hidden landscape:hidden"><button onClick={() => { playSound('page'); setShowRules(!showRules); }} className="w-full bg-[#3d2b0f] hover:bg-[#523812] active:bg-[#2e1f0a] border border-yellow-800/50 text-yellow-100 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors group"><BookOpen size={18} className="text-yellow-500 group-hover:text-yellow-300"/><span className="font-bold uppercase tracking-widest text-sm" style={{ fontFamily: 'Cinzel, serif' }}>Open Rule Pane</span></button></div>
        {/* --- MAIN GAME VIEW --- */}
        {/* LOGIK: Hvis <= 4 spillere, brug fast Grid (pænest). Hvis > 4, brug Horizontal Scroll (fleksibelt) */}
        {/* --- MAIN GAME VIEW --- */}
        {/* RETTELSE: Vi har fjernet 'md:flex' fra start-strengen, så den ikke konflikter med grid */}
        <div className={`hidden flex-grow min-h-0 gap-2 landscape:flex ${
            players.length > 4 
            ? 'md:flex overflow-x-auto snap-x snap-mandatory px-2 pb-2' // Scroll mode (Flex)
            : 'md:grid md:grid-cols-4' // Fixed grid mode (Låst bredde)
        }`}>
            {(players || []).map((player, index) => (
                <div key={index} className={`${players.length > 4 ? 'min-w-[300px] snap-center h-full' : 'h-full w-full overflow-hidden'}`}>
                    <PlayerCard player={player} index={index} />
                </div>
            ))}
        </div>
        <div className="md:hidden landscape:hidden flex flex-grow items-center justify-center relative overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ touchAction: 'pan-y' }}><div ref={cardRef} className="w-full h-full p-1 will-change-transform"><PlayerCard player={players[activePlayerIndex]} index={activePlayerIndex} /></div></div>
      </div>
      <div className={`fixed right-0 top-0 bottom-0 z-40 bg-[#0f0f13]/95 backdrop-blur-xl border-l border-yellow-900/30 shadow-2xl transition-all duration-300 flex flex-col ${showRules ? 'w-full md:w-1/3 translate-x-0' : 'w-full md:w-1/3 translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800"><h2 className="text-xl font-bold text-yellow-500" style={{ fontFamily: 'Cinzel, serif' }}>Codex: {meta.title}</h2><button onClick={() => { playSound('click'); setShowRules(false); }} className="text-gray-500 hover:text-white"><X size={20}/></button></div>
        <div className="md:hidden grid grid-cols-4 gap-2 p-4 border-b border-gray-800"><button onClick={exportData} className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-green-500 text-[10px] font-bold"><Save size={16}/> SAVE</button><label className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-blue-500 text-[10px] font-bold cursor-pointer"><Upload size={16}/><input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" /> LOAD</label><button onClick={toggleEpilogue} className={`flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-[10px] font-bold ${epilogueMode ? 'text-yellow-400' : 'text-gray-500'}`}><Crown size={16}/> MODE</button><button onClick={resetData} className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded text-red-500 text-[10px] font-bold"><RefreshCw size={16}/> RESET</button></div>
        <div className="flex-grow overflow-y-auto p-2 space-y-2 text-sm text-gray-300 custom-scrollbar pb-20">
            {meta.engine === 'rpg' || meta.engine === 'civ' ? (
                <>
                    {/* CORE RULES */}
                    <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                        <button onClick={() => toggleRuleSection('core')} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-blue-500 hover:bg-white/5">
                            <span><Info size={12} className="inline mr-2"/> Core Rules</span>
                            <span>{activeRuleSection === 'core' ? '−' : '+'}</span>
                        </button>
                        {activeRuleSection === 'core' && (
                            <div className="p-3 border-t border-gray-800 space-y-3 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">
                                {activeData.coreRules}
                            </div>
                        )}
                    </div>

                    {/* ROLES (ONLY RPG) */}
                    {meta.engine === 'rpg' && (
                        <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                            <button onClick={() => toggleRuleSection('roles')} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-green-500 hover:bg-white/5">
                                <span><Crown size={12} className="inline mr-2"/> Roles</span>
                                <span>{activeRuleSection === 'roles' ? '−' : '+'}</span>
                            </button>
                            {activeRuleSection === 'roles' && (
                                <div className="p-3 border-t border-gray-800 space-y-4 text-xs leading-relaxed text-gray-400">
                                    {Object.keys(activeData.roleData || {}).map(r => (
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
                    )}

                    {/* TIMELINE (BOTH) */}
                    {activeData.timeline.map((event, i) => (
                        <div key={i} className={`border border-gray-800 rounded overflow-hidden ${event.type === 'battle' ? (activeBattleIndex === i ? 'bg-red-900/20 border-red-500' : 'bg-black/20') : 'bg-black/20'}`}>
                            <div className="flex w-full">
                                {event.type === 'battle' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); startBattle(i); }} 
                                        className={`px-3 py-3 border-r border-gray-800 hover:bg-red-900/50 flex items-center justify-center transition-colors ${activeBattleIndex === i ? 'bg-red-900/30 text-white' : 'text-stone-500'}`}
                                    >
                                        <PlayCircle size={16} className={activeBattleIndex === i ? 'animate-pulse' : ''} />
                                    </button>
                                )}
                                <button onClick={() => toggleRuleSection(`event-${i}`)} className="flex-grow p-3 font-bold text-left uppercase tracking-widest flex justify-between items-center text-red-500 hover:bg-white/5">
                                    <span className="flex items-center">
                                        <Sword size={12} className="inline mr-2"/> 
                                        {event.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {/* NYT: VIS DECK SIZE BADGE I CODEX FOR CIV */}
                                        {meta.engine === 'civ' && event.type === 'battle' && (
                                            <span className="text-[8px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">
                                                {getCivDeckSize(i)} Cards
                                            </span>
                                        )}
                                        <span>{activeRuleSection === `event-${i}` ? '−' : '+'}</span>
                                    </div>
                                </button>
                            </div>
                            {activeRuleSection === `event-${i}` && <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">{event.desc}</div>}
                        </div>
                    ))}

                    {/* EPILOGUE (ONLY RPG) */}
                    {meta.engine === 'rpg' && (
                        <div className="border border-gray-800 rounded bg-black/20 overflow-hidden">
                            <button onClick={() => toggleRuleSection('epi')} className="w-full p-3 font-bold text-left uppercase tracking-widest flex justify-between text-indigo-500 hover:bg-white/5">
                                <span><Clock size={12} className="inline mr-2"/> Epilogue</span>
                                <span>{activeRuleSection === 'epi' ? '−' : '+'}</span>
                            </button>
                            {activeRuleSection === 'epi' && (
                                <div className="p-3 border-t border-gray-800 text-xs leading-relaxed text-gray-400 space-y-5">
                                    
                                    {/* INTRO */}
                                    <div className="italic opacity-80 text-[10px] border-b border-gray-800 pb-2 space-y-2">
                                        <p>New mini-campaign built on top of Stagging It Up.</p>
                                        <p>The winner of the previous battle (Heidi's Bierbar) may gain ownership of one permanent controlled by each losing player.</p>
                                        <p>Reset the VPs, players gain VPs equal to their placement in Heidi’s Bierbar, 1st place gains VPs equal to the number of players, 2nd place gains one less and so forth.</p>
                                    </div>
                                    
                                    {/* BATTLE 1: THE DAY AFTER */}
                                    <div className="border-l-2 border-purple-500/50 pl-2">
                                        <strong className="text-purple-400 block uppercase tracking-widest text-[9px] mb-2">Battle: The Day After (All vs. All)</strong>
                                        <ul className="list-disc pl-3 space-y-2 opacity-90 marker:text-purple-700">
                                            <li>Players start with a number of Drunk counters corresponding to their inverse placement in the previous battle (Last place starts with 3 Drunk counters, second last with 4 Drunk counters and so on).</li>
                                            <li>When a Drunk counter is removed from a player he draws a card.</li>
                                            <li><strong>Sober Up:</strong> At the beginning of your upkeep, you may pay 1 (so 2 because you’re Drunk) mana to remove a Drunk counter.</li>
                                            <li>All spells have “Rather than cast this card from your hand, you must pay its mana cost and exile it with a time counter on it. At the beginning of your upkeep, remove a time counter. When the last is removed, cast it without paying its mana cost.“ and all creatures enter tapped.</li>
                                        </ul>
                                        <div className="mt-2 text-[10px] text-purple-300 bg-purple-900/10 p-1.5 rounded border border-purple-900/30">
                                            <strong>Post Combat:</strong> Last place loses 4 LT, second last 3 LT and so on. Booster draft the Unsealed Dual Booster booster from Stagging It Up, then #105. (Booster Draft Rules: Divide the booster into a number of piles equal to the number of players. Each player looks at his pile and may add up to one card to his deck. Then he sends the pile to the left, this process continues until no one adds a card. Remaining cards go in the Skraldespanden.)
                                        </div>
                                    </div>

                                    {/* BATTLE 2: TRANSPORTATION CHAOS */}
                                    <div className="border-l-2 border-red-500/50 pl-2">
                                        <strong className="text-red-400 block uppercase tracking-widest text-[9px] mb-2">Battle: Big Day Transportation Chaos</strong>
                                        <div className="bg-red-900/10 p-2 rounded border border-red-900/30 mb-2">
                                            <p className="text-[9px] font-mono text-red-300 border-b border-red-900/30 pb-1 mb-1">STRESS MODE STATS:</p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono opacity-90">
                                                <span>Starting Time: 5min</span>
                                                <span>Slow Mode bonus: 0s</span>
                                                <span>Phase Change: 1s</span>
                                                <span>Turn Bonus: 10s</span>
                                                <span>Phase Step Delay: 20s</span>
                                                <span>Penalty Freq: 120s</span>
                                            </div>
                                            <div className="text-[9px] font-mono text-red-400 mt-2 font-bold">Penalty: 5 life or 3 drunk counters</div>
                                        </div>
                                        <div className="text-[10px] text-red-300 bg-red-900/10 p-1.5 rounded border border-red-900/30">
                                            <strong>Post Combat:</strong> Reward #106 and the winner gains HS = 8. Take a walk. You may seduce and make nonbinding promises to other players.
                                        </div>
                                    </div>

                                    {/* OUTFIT SELECTION */}
                                    <div className="border-l-2 border-yellow-500/50 pl-2">
                                        <strong className="text-yellow-600 block uppercase tracking-widest text-[9px] mb-1">Choosing Your Outfit</strong>
                                        <p className="opacity-90">Players may choose any non-King role secretly (the winner of the previous battle may keep the King role). More players can have the same role. The Roles are revealed at the beginning of the next battle.</p>
                                    </div>

                                    {/* BATTLE 3: THE BIG DAY */}
                                    <div className="border-l-2 border-indigo-500/50 pl-2">
                                        <strong className="text-indigo-400 block uppercase tracking-widest text-[9px] mb-2">Battle: The Big Day (All vs. All)</strong>
                                        <ul className="list-disc pl-3 space-y-2 opacity-90 marker:text-indigo-700">
                                            <li>The winner of the previous battle proposes marriage to another player. That player may refuse. If a player accepts, the 2 become married. The winner continues asking other players until one accepts. The final player asked, can’t refuse.</li>
                                            <li>The highest ranked remaining player repeats the proposal process with the remaining unmarried player(s). If both decline they may marry each other.</li>
                                            <li>The married players shuffle their decks and share a library (the library remains in play when one of the married players dies).</li>
                                            <li>Married players can’t attack each other unless they are the only remaining players.</li>
                                            <li>A player may end the marriage with his partner with sorcery speed by giving all cards in his hand to the abandoned partner.</li>
                                            <li>2 unmarried players may marry with sorcery speed. As long as they remain married, they may draw from the other players library.</li>
                                        </ul>
                                        <p className="text-indigo-300 font-bold italic mt-4 text-center border-t border-indigo-900/50 pt-2">The final remaining player wins the Epilogue of Stagging It Up.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                // STANDARD FALLBACK
                <>
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
