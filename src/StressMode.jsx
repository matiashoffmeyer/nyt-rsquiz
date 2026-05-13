import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Clock, Shield, Zap, Skull, RotateCcw, Play, Pause, Hand, Hourglass, Heart, ArrowRight, LogOut, CheckCircle, Loader, XCircle, Trophy, AlertTriangle, Settings, Plus, Timer, Activity, Infinity, Beer, Crown, MapPin, User, ListOrdered, FastForward, SkipForward, LogIn, Swords, Turtle, Star, Minus, Lock } from 'lucide-react';

// --- STYLES ---
const styles = `
@keyframes floatUp {
    0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; }
    20% { transform: translate(-50%, 0px) scale(1.2); opacity: 1; text-shadow: 0 0 10px rgba(74, 222, 128, 0.8); }
    100% { transform: translate(-50%, -60px) scale(1); opacity: 0; }
}
.anim-float { animation: floatUp 2s ease-out forwards; }

/* SKJUL STANDARD BROWSER PILE PÅ INPUTS */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none !important; 
  margin: 0 !important; 
  display: none !important;
}
input[type=number] {
  -moz-appearance: textfield !important;
  appearance: none !important;
}

/* CUSTOM SCROLLBAR styling (Tynd og mørk) */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2); 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #44403c; /* Stone-700 */
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a29e; /* Stone-400 */
}
`;

// --- MTG STEP DATA ---
const STEP_INFO = [
    { id: 'UNTAP',  label: 'UNTAP',         group: 'BEGINNING',   burnsClock: true }, 
    { id: 'UPKEEP', label: 'UPKEEP',        group: 'BEGINNING',   burnsClock: true },
    { id: 'DRAW',   label: 'DRAW STEP',     group: 'BEGINNING',   burnsClock: true },
    { id: 'MAIN1',  label: 'MAIN 1',        group: 'PRE-COMBAT',  burnsClock: true },
    { id: 'BEC',    label: 'BEGIN CMBT',    group: 'COMBAT',      burnsClock: true },
    { id: 'ATK',    label: 'ATTACKERS',     group: 'COMBAT',      burnsClock: true },
    { id: 'BLK',    label: 'BLOCKERS',      group: 'COMBAT',      burnsClock: true },
    { id: 'DMG',    label: 'DAMAGE',        group: 'COMBAT',      burnsClock: false }, 
    { id: 'EC',     label: 'END CMBT',      group: 'COMBAT',      burnsClock: true },
    { id: 'MAIN2',  label: 'MAIN 2',        group: 'POST-COMBAT', burnsClock: true },
    { id: 'END',    label: 'END STEP',      group: 'ENDING',      burnsClock: true },
    { id: 'CLEAN',  label: 'CLEANUP',       group: 'ENDING',      burnsClock: false } 
];

// Steps skipped in "Lazy Mode"
const LAZY_SKIPS = ['UPKEEP', 'DRAW', 'BEC', 'EC', 'END', 'CLEAN'];

// --- SAFE STEPPER COMPONENT (Fixes String Concatenation Issue) ---
const Stepper = ({ label, value, onChange, min = 0, suffix = "", icon: Icon, color = "text-white" }) => {
    // Helper to ensure we always math on numbers
    const safeChange = (delta) => {
        const current = Number(value) || 0; // Force to number
        const next = Math.max(min, current + delta);
        onChange(next);
    };

    return (
        <div className="bg-black/40 p-2 rounded border border-stone-800 flex flex-col items-center justify-between h-20">
            <label className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1 mb-1 select-none whitespace-nowrap">
                {Icon && <Icon size={10} />}
                {label}
            </label>
            <div className="flex items-center w-full justify-between gap-1">
                <button 
                    onClick={() => safeChange(-1)}
                    className="w-8 h-8 bg-stone-800 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 active:scale-95 transition-all shadow-md border border-stone-700 shrink-0 touch-manipulation select-none"
                >
                    -
                </button>
                <div className="flex-grow flex items-center justify-center relative min-w-0">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value) || 0)}
                        className={`font-mono text-lg font-black ${color} bg-transparent text-center w-full outline-none focus:bg-white/10 rounded px-1 transition-colors appearance-none`}
                    />
                    {suffix && <span className="text-[10px] text-stone-600 absolute right-0 pointer-events-none select-none hidden sm:inline">{suffix}</span>}
                </div>
                <button 
                    onClick={() => safeChange(1)}
                    className="w-8 h-8 bg-stone-800 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 active:scale-95 transition-all shadow-md border border-stone-700 shrink-0 touch-manipulation select-none"
                >
                    +
                </button>
            </div>
        </div>
    );
};

    const StressMode = ({ players, activeBattleIndex, updatePlayer, syncState, gameConfig, playSound: parentPlaySound, onExit, remoteStressState }) => {

    // --- 1. LOCAL SOUND CONTROL (INDEPENDENT) ---
    const [isMuted, setIsMuted] = useState(() => {
        if (typeof window === 'undefined') return false;
        // Vi bruger en unik key 'stress_mute' så den ikke konflikter med Stagging
        return localStorage.getItem('stress_mute') === 'true';
    });

    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        localStorage.setItem('stress_mute', newState);
    };

    // WRAPPER: Vi bruger denne funktion i hele filen. 
    // Den tjekker VORES lokale knap før den spiller lyden.
    const playSound = (key) => {
        if (!isMuted && parentPlaySound) {
            parentPlaySound(key);
        }
    };

    
    
    
    // --- 1. SHARED CONSTANTS ---
    const containerClass = "fixed inset-0 z-50 bg-[#0a0a0a] text-gray-200 overflow-hidden flex flex-col h-dvh w-screen font-sans";

    // --- 2. HOOKS & STATE ---
    const [deviceId] = useState(() => {
        if (typeof window === 'undefined') return null;
        let id = localStorage.getItem('stress_device_id');
        if (!id) {
            id = crypto.randomUUID(); 
            localStorage.setItem('stress_device_id', id);
        }
        return id;
    });

    const [localSeat, setLocalSeat] = useState(() => {
        if (typeof window === 'undefined') return null;
        const storedSeat = localStorage.getItem('stress_seat');
        const storedId = localStorage.getItem('stress_device_id'); 
        if (storedSeat !== null && storedId) {
            const idx = parseInt(storedSeat);
            const player = players[idx];
            if (player && player.is_seated && player.seated_by === storedId) {
                return storedSeat;
            }
        }
        return null;
    });

    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    

    const [pendingProgress, setPendingProgress] = useState(0);
    const [alertMessage, setAlertMessage] = useState(null); 
    const [isReleasingSeat, setIsReleasingSeat] = useState(false);
    const [, setTick] = useState(0); 
    const [bonusAnimations, setBonusAnimations] = useState([]);
    const [showSmartStepSelector, setShowSmartStepSelector] = useState(false);

    const modeKey = gameConfig?.mode || 'sudden_death';
    const rules = gameConfig?.modes?.[modeKey] || {};

    // --- 3. CONFIG & SYNCED STATE ---
    const activeConfig = remoteStressState?.config || {
        startTimeMin: (rules.start_time_sec || 180) / 60,
        bonusSec: rules.turn_bonus_sec ?? 60,      
        pendingSec: rules.pending_time_sec ?? 1,   
        penaltyIntervalSec: rules.overtime_penalty_sec || 60,
        penaltyLife: rules.penalty_life ?? 2,      
        penaltyDrinks: rules.penalty_drinks ?? 1,
        slowModeBonusSec: rules.slow_mode_bonus_sec ?? 5,
        
        phaseDelaySec: 0
    };

  

        // --- STABLE TIME REFERENCE ---
    // Fix: Ensures time doesn't reset to Date.now() on every render if remote state is missing
        // --- STATE FIX: STABLE TIME REFERENCE ---
    const [localLastActionAt, setLocalLastActionAt] = useState(Date.now());
    const lastActionAt = remoteStressState?.lastActionAt || localLastActionAt;
    


    const updateLocalTime = () => setLocalLastActionAt(Date.now());

    // --- LOCAL STATE FALLBACKS (Memory for Test Mode) ---
    // 1. DEFINER DISSE FØRST!
    const [localGameStarted, setLocalGameStarted] = useState(false);
    const [localPaused, setLocalPaused] = useState(true);
    const [localPriorityIdx, setLocalPriorityIdx] = useState(0);
    const [localActiveIdx, setLocalActiveIdx] = useState(0); 
    const [localPhase, setLocalPhase] = useState(STEP_INFO[0].id);
    
    // NYE STATES (Skal stå her, FØR de bruges nedenfor):
    const [localPendingPhase, setLocalPendingPhase] = useState(null);
    const [localPendingStartTime, setLocalPendingStartTime] = useState(0);
    const [localPenaltyPending, setLocalPenaltyPending] = useState(false);


   // --- SIMPLE STATE MERGE (Ingen aggressive tidsrejser) ---
    const serverSaysStarted = remoteStressState?.isGameStarted;
    // Vi bruger kun lokal state, hvis vi har startet spillet, men serveren ikke ved det endnu.
    // Ellers stoler vi 100% på serveren (remoteStressState).
    const useLocal = (localGameStarted && !serverSaysStarted);
    
    // Hent serverens tid. Hvis den mangler, er den 0.
    const remoteTime = remoteStressState?.lastActionAt || 0;
    
    // --- CLOCK SKEW FIX: Autoritets-Buffer ---
    // Hvis JEG er den aktive spiller, giver vi mig en fordel i tids-kampen.
    // Serveren skal være mere end 5 sekunder "foran" mig, før jeg tror på, at min handling er forældet.
    // Dette løser problemet, hvis forrige spillers ur var hurtigere end mit.
    const amIPriority = localSeat !== null && parseInt(localSeat) === localPriorityIdx;
    const skewTolerance = amIPriority ? 5000 : 0; 

    // Er vores lokale ur foran serveren (med tolerance)?
    const isLocalNewer = localLastActionAt > (remoteTime - skewTolerance);

  
    

    const isGameStarted = useLocal ? localGameStarted : (remoteStressState?.isGameStarted ?? localGameStarted);
    // ... (resten af variablerne følger herunder som normalt)

        
    // NY STATE: Holder styr på brugt delay lokalt
    const [localUsedDelayBuffer, setLocalUsedDelayBuffer] = useState(0);
   
    // Vi betragter serveren som "stale" (forældet/bagud), hvis:
    // 1. Vi har startet spillet lokalt, men serveren siger nej.
    


    
    // Her er magien: Hvis useLocal er true, tvinger vi den lokale 'localPaused' værdi igennem
    const isPaused = useLocal ? localPaused : (remoteStressState?.isPaused ?? localPaused);
    
    const priorityPlayerIdx = useLocal ? localPriorityIdx : (remoteStressState?.priorityPlayerIdx ?? localPriorityIdx);
    const activePlayerIdx = useLocal ? localActiveIdx : (remoteStressState?.activePlayerIdx ?? localActiveIdx);
    const currentStepId = useLocal ? localPhase : (remoteStressState?.phase || localPhase);
    
    const pendingPhase = useLocal ? localPendingPhase : (remoteStressState?.pendingPhase ?? localPendingPhase);
    const pendingStartTime = useLocal ? localPendingStartTime : (remoteStressState?.pendingStartTime ?? localPendingStartTime);
    const penaltyPending = useLocal ? localPenaltyPending : (remoteStressState?.penaltyPending ?? localPenaltyPending);

    const usedDelayBuffer = useLocal ? localUsedDelayBuffer : (remoteStressState?.usedDelayBuffer ?? localUsedDelayBuffer);


    
    const interruptQueue = remoteStressState?.interruptQueue || [];
    const lastBonusEvent = remoteStressState?.lastBonusEvent || null; 
    
    const isSlowMotion = remoteStressState?.isSlowMotion || false;
    const hasReceivedSlowBonus = remoteStressState?.hasReceivedSlowBonus || false;
    
    // NY: Hent låse-tilstanden fra serveren, så vi kan huske den
    const shortcutsLocked = remoteStressState?.shortcutsLocked || false;

    const pendingDurationOverride = remoteStressState?.pendingDurationOverride || null;
    const shortcutTarget = remoteStressState?.shortcutTarget || null;
    const interruptersPendingSelection = remoteStressState?.interruptersPendingSelection || [];
    const smartInterruptRequests = remoteStressState?.smartInterruptRequests || [];
    
    // --- NYT: Listen over folk der bliver angrebet ---
    const pendingAttacks = remoteStressState?.pendingAttacks || [];

    const validPlayers = players.filter(p => p && p.name);
    const allPlayersSeated = validPlayers.length > 0 && validPlayers.every(p => p.is_seated);
    const livingPlayers = players.filter(p => p && p.name && !p.is_dead);
    const winner = allPlayersSeated && isGameStarted && validPlayers.length > 1 && livingPlayers.length === 1 ? livingPlayers[0] : null;
    const playerCount = validPlayers.length;
    const isManyPlayers = playerCount > 4;
    // --- START BETINGELSE (STRICT) ---
    // 1. Der skal være mindst 2 spillere.
    // 2. ALLE skal sidde ned.
    // (Test Mode fjernet herfra - det kan kun aktiveres inde i spillet nu)
    const canStartGame = allPlayersSeated && playerCount > 1;

    const prevTimesRef = useRef({});
    const prevBonusEventIdRef = useRef(null);

    const isFirstRender = useRef(true); // Holder styr på om det er page load

    // --- SOUND MANAGER (Global Events) ---
    const prevActivePlayerRef = useRef(activePlayerIdx);
    const prevWinnerRef = useRef(null);

            // --- SUPER DEBUG LOG (SLADDERHANK 2.0) ---
    useEffect(() => {
        // Vi logger hvis:
        // 1. Der er uenighed mellem server og klient
        // 2. Vi har "Lokal Magt" (isLocalNewer)
        // 3. ELLER hvis der foregår noget med shortcuts/pending (VIGTIGT!)
        const isInteresting = remoteStressState?.phase !== localPhase || isLocalNewer || pendingPhase || shortcutTarget;

        if (isInteresting) {
            // Tjek om Ref'en (som uret bruger) stemmer overens med Staten (som du ser)
            const refMismatch = latestState.current?.phase !== currentStepId 
                || latestState.current?.shortcutTarget !== shortcutTarget;

            console.log("🕵️‍♀️ SUPER STATE:", {
                "1. AUTORITET": useLocal ? "🔴 MIG (Lokal)" : "🔵 SERVER",
                "   Forskel (ms)": localLastActionAt - remoteTime,
                
                "2. FLOW": {
                    "Nuværende Fase": currentStepId,
                    "På vej til (Pending)": pendingPhase || "Ingen",
                    "Shortcut Mål": shortcutTarget || "Ingen",
                    "Er i SlowMotion?": isSlowMotion
                },

                "3. SPILLERE": {
                    "Mig (Sæde)": localSeat,
                    "Aktiv Spiller": activePlayerIdx,
                    "Prioritet": priorityPlayerIdx,
                    "Kø Længde": interruptQueue.length
                },

                "4. INTERN SIKKERHED": {
                    "Ref vs State Sync": refMismatch ? "⚠️ KRITISK FEJL (Mismatch)" : "✅ Synkroniseret",
                    "Ref Target": latestState.current?.shortcutTarget
                }
            });
        }
    }, [
        localLastActionAt, remoteStressState, useLocal, localPhase, isSlowMotion, 
        pendingPhase, shortcutTarget, activePlayerIdx, priorityPlayerIdx, interruptQueue, localSeat
    ]);
    // ------------------------------------------

    useEffect(() => {
        // 1. VICTORY SOUND
        if (winner && !prevWinnerRef.current) {
            if (playSound) playSound('win'); // Eller 'fanfare' hvis du har den
            prevWinnerRef.current = winner;
        }

        // 2. TURN CHANGE BELL (Ny spiller starter tid/delay)
        if (activePlayerIdx !== prevActivePlayerRef.current) {
            const currentStepObj = STEP_INFO.find(s => s.id === currentStepId);
            const burnsClock = currentStepObj ? currentStepObj.burnsClock : true;
            
            // Spil kun klokken hvis spillet er i gang, og vi ikke er i en Safe Zone
            if (isGameStarted && burnsClock && !winner) {
                if (playSound) playSound('bell'); // "Ding!" - Klokken
            }
            prevActivePlayerRef.current = activePlayerIdx;
        }
    }, [activePlayerIdx, currentStepId, isGameStarted, winner]);
    
    // --- 4. EFFECTS & WATCHDOGS ---

    // Reality Check
    useEffect(() => {
        if (localSeat !== null) {
            const idx = parseInt(localSeat);
            const p = players[idx];
            if (!p || (p.is_seated && p.seated_by !== deviceId) || (!p.is_seated)) {
                setLocalSeat(null);
                localStorage.removeItem('stress_seat');
            }
        }
    }, [players, deviceId, localSeat]);

    // UI Reset
    useEffect(() => {
        if (!shortcutTarget) {
            setShowSmartStepSelector(false);
        }
    }, [shortcutTarget, priorityPlayerIdx]);

    // Animation Logic (Nu med refresh-beskyttelse)
    useEffect(() => {
        // 1. Ved Page Load / Refresh:
        if (isFirstRender.current) {
            // Vi "noterer" det gamle event ID, men starter IKKE animationen
            if (lastBonusEvent) prevBonusEventIdRef.current = lastBonusEvent.id;
            isFirstRender.current = false; // Dørmanden går hjem
            return; 
        }

        // 2. Ved Live Updates (Nye events mens man spiller):
        if (lastBonusEvent && lastBonusEvent.id !== prevBonusEventIdRef.current) {
            prevBonusEventIdRef.current = lastBonusEvent.id;
            const newAnim = {
                id: Date.now(),
                seatIdx: lastBonusEvent.seatIdx,
                amount: lastBonusEvent.amount
            };
            setBonusAnimations(prev => [...prev, newAnim]);
            setTimeout(() => {
                setBonusAnimations(prev => prev.filter(a => a.id !== newAnim.id));
            }, 2000);
        }
    }, [lastBonusEvent]);

        // --- CRITICAL: REF TO HOLD LATEST STATE FOR INTERVAL ---
    const latestState = useRef({
        players, activeConfig, priorityPlayerIdx, activePlayerIdx, localSeat, 
        pendingPhase, pendingStartTime, pendingDurationOverride, shortcutTarget, penaltyPending, isPaused, isGameStarted, lastActionAt, phase: currentStepId
    });

    
    // --- CRITICAL: REF TO HOLD LATEST STATE FOR INTERVAL ---
    useEffect(() => {
        latestState.current = {
            players, 
            activeConfig, 
            priorityPlayerIdx, 
            activePlayerIdx, 
            localSeat, 
            pendingPhase, 
            pendingStartTime, 
            pendingDurationOverride, 
            shortcutTarget,
            penaltyPending, 
            isPaused, 
            isGameStarted, 
            lastActionAt, 
            phase: currentStepId,
            usedDelayBuffer,
            interruptQueue,
            // Sørg for at disse også er med, hvis du bruger dem i watchdoggen
            interruptersPendingSelection,
            isSlowMotion
        };
    });
    
    const actionsRef = useRef({});
    useEffect(() => {
        actionsRef.current = {
            commitStepChange: () => commitStepChange(),
            resolveShortcut: () => resolveShortcut(),
            triggerPenalty: (updates) => commitTimeAndState(updates),
            updatePlayerPenalty: (i, count) => updatePlayer(i, 'penalties', count),
            triggerAlert: (msg) => triggerAlert(msg),
            playSound: (key) => { if(playSound) playSound(key) }
        };
    });

        // --- WATCHDOG (THE TIMEKEEPER) ---
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1); 
            
            const current = latestState.current;
            if (!current.isGameStarted) return;

            const now = Date.now();
            
            // --- 1. PENDING PHASE LOGIC (Shortcuts & Transitions) ---
            if (current.pendingPhase && !current.isPaused) {
                const elapsed = now - current.pendingStartTime;
                const confTime = current.pendingDurationOverride ?? (current.activeConfig.pendingSec ?? 5); 
                const maxTime = confTime * 1000;
                
                const progress = maxTime > 0 ? Math.min(100, (elapsed / maxTime) * 100) : 100;
                setPendingProgress(progress);
                
                // Hvem skal eksekvere skiftet? Normalt kun den ansvarlige.
                let amIResponsible = (current.localSeat !== null && parseInt(current.localSeat) === current.priorityPlayerIdx);

                // --- SIKKERHEDSVENTIL (Anti-Stuck) ---
                if (current.pendingPhase === 'SHORTCUT_BUFFER' && elapsed > (maxTime + 3000)) {
                    // HVIS vi er låst (Easy Cowboy), så lad være med at trigger safety valve
                    if (current.shortcutsLocked) {
                        return; 
                    }

                    console.warn("⚠️ SAFETY VALVE TRIGGERED: Forcing Shortcut Resolution!");
                    amIResponsible = true;
                }
                // -------------------------------------

                if (amIResponsible) {
                    if (elapsed > maxTime) {
                        // --- SIKKERHED 1 SLETTET HERFRA ---
                        // Før blokerede vi her hvis isSlowMotion var true.
                        // Nu giver vi lov til at køre shortcutten færdig, 
                        // fordi "Easy Cowboy" er den nye sikkerhed.
                        
                        // SIKKERHED 2: Valg menu er åben
                        if (current.interruptersPendingSelection && current.interruptersPendingSelection.length > 0) {
                             return;
                        }

                        // EKSEKVER HANDLING
                        if (current.shortcutTarget) {
                            // Vi logger for at se, at den faktisk prøver
                            if (elapsed > maxTime + 1000 && Math.floor(elapsed/100) % 10 === 0) console.log("Watchdog calling resolveShortcut...");
                            
                            if (actionsRef.current.resolveShortcut) actionsRef.current.resolveShortcut();
                        } else {
                            // Vi har INTET mål. Er vi i bufferen? (Sker hvis Cowboy har slettet målet)
                            if (current.pendingPhase === 'SHORTCUT_BUFFER') {
                                // Kald commitStepChange som nu har "Redningsaktion" indbygget
                                if (actionsRef.current.commitStepChange) actionsRef.current.commitStepChange();
                            } else {
                                // Normalt faseskift
                                if (actionsRef.current.commitStepChange) actionsRef.current.commitStepChange();
                            }
                        }
                    }
                }
            } else {
                setPendingProgress(0);
            }
            
            // ... (Behold resten af Penalty logikken herunder uændret) ...
            if (!current.isPaused || current.penaltyPending) {
                 // Kopier din eksisterende penalty logik herind (den fra din fil)
                 // Den behøver ingen ændringer lige nu.
                 current.players.forEach((p, i) => {
                    // ... (samme kode som før) ...
                    if (!p || !p.name || p.is_dead) return;
                    let bankTime = p.saved_time;
                    if (bankTime === undefined || bankTime === null) { bankTime = (current.activeConfig.startTimeMin * 60); }
                    const currentStepObj = STEP_INFO.find(s => s.id === current.phase);
                    const burnsClock = currentStepObj ? currentStepObj.burnsClock : true;
                    const isActiveClock = i === current.priorityPlayerIdx && !current.pendingPhase && !winner && burnsClock && !current.isPaused;
                    let pTime = Math.floor(bankTime);
                    if (isActiveClock) {
                        const elapsedSeconds = (now - current.lastActionAt) / 1000;
                        const delay = current.activeConfig.phaseDelaySec || 0;
                        const actualBurn = Math.max(0, elapsedSeconds - delay);
                        pTime = Math.floor(bankTime - actualBurn);
                    }
                    if (pTime <= 0) {
                        // ... (resten af din penalty logik) ...
                        const threshold = current.activeConfig.penaltyIntervalSec || 60;
                        const timeBelowZero = Math.abs(pTime);
                        const expectedPenalties = Math.floor(timeBelowZero / threshold) + 1;
                        const actualPenalties = p.penalties || 0; 
                        if (expectedPenalties > actualPenalties) {
                            const isPriorityPlayer = i === current.priorityPlayerIdx;
                            const amIResponsible = (current.localSeat !== null && parseInt(current.localSeat) === i);
                            if (isPriorityPlayer) {
                                const canITrigger =  (current.localSeat !== null && parseInt(current.localSeat) === current.priorityPlayerIdx);
                                if (canITrigger && !current.penaltyPending) {
                                    if (actionsRef.current.playSound) actionsRef.current.playSound('low');
                                    actionsRef.current.triggerPenalty({ isPaused: true, penaltyPending: true });
                                }
                            } else {
                                if (amIResponsible) {
                                    if (actionsRef.current.triggerAlert) actionsRef.current.triggerAlert(`PENALTY! ${p.name} lost time!`);
                                    if (actionsRef.current.playSound) actionsRef.current.playSound('low');
                                    if (actionsRef.current.updatePlayerPenalty) actionsRef.current.updatePlayerPenalty(i, expectedPenalties);
                                }
                            }
                        }
                    }
                 });
            }

        }, 100); 
        return () => clearInterval(interval);
    }, []);


    // --- 5. HELPER FUNCTIONS & LOGIC ---
        const getPhaseColorClass = (stepId) => {
        const step = STEP_INFO.find(s => s.id === stepId);
        if (!step) return 'bg-stone-900/50 border-stone-800'; // Default

        switch (step.group) {
            case 'BEGINNING': return 'bg-green-900/80 border-green-700';
            case 'PRE-COMBAT': return 'bg-yellow-900/80 border-yellow-700';
            case 'COMBAT': return 'bg-red-900/80 border-red-700';
            case 'POST-COMBAT': return 'bg-orange-900/80 border-orange-700';
            case 'ENDING': return 'bg-stone-950 border-stone-600';
            default: return 'bg-stone-900/50 border-stone-800';
        }
    };

    // FIX: FORMAT TIME HELPER ADDED
    const formatTime = (sec) => {
        const val = Math.floor(sec);
        const m = Math.floor(Math.abs(val) / 60);
        const s = Math.abs(val) % 60;
        const sign = val < 0 ? "-" : "";
        return `${sign}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const calculateTimeForPlayer = (playerIdx, nowInput = Date.now()) => {
        const p = players[playerIdx];
        if (!p) return 0;

        let bankTime = p.saved_time;
        if (bankTime === undefined || bankTime === null) {
            bankTime = (activeConfig.startTimeMin * 60);
        }
        const currentStepObj = STEP_INFO.find(s => s.id === currentStepId);
        const burnsClock = currentStepObj ? currentStepObj.burnsClock : true;

        if (isPaused || playerIdx !== priorityPlayerIdx || pendingPhase || winner || !burnsClock || !isGameStarted) {
            return Math.floor(bankTime);
        }

        // Sikker beregning af tid
        const safeLastAction = (lastActionAt && !isNaN(lastActionAt)) ? lastActionAt : nowInput;
        const elapsedSeconds = Math.max(0, (nowInput - safeLastAction) / 1000);
        
        // Hent delay sikkert
        const delay = activeConfig.phaseDelaySec || 0;
        
        // Beregn burn (kan ikke være negativ)
        const actualBurn = Math.max(0, elapsedSeconds - delay);

        // Returner, og sikr mod NaN
        const result = bankTime - actualBurn;
        return isNaN(result) ? Math.floor(bankTime) : Math.floor(result);
    };

    const getDisplayTime = (i) => calculateTimeForPlayer(i);

    const triggerAlert = (msg) => {
        setAlertMessage(msg);
        setTimeout(() => setAlertMessage(null), 5000); 
    };

    const getNextAlivePlayer = (startIdx) => {
        let nextIdx = (startIdx + 1) % players.length;
        let attempts = 0;
        while ((!players[nextIdx] || !players[nextIdx].name || players[nextIdx].is_dead) && attempts < players.length) {
            nextIdx = (nextIdx + 1) % players.length;
            attempts++;
        }
        return nextIdx;
    };

        const syncAll = (newPlayers, extraUpdates = {}) => {
        // --- FIX: Update Local State immediately ---
        if (extraUpdates.isGameStarted !== undefined) setLocalGameStarted(extraUpdates.isGameStarted);
        if (extraUpdates.isPaused !== undefined) setLocalPaused(extraUpdates.isPaused);
        if (extraUpdates.priorityPlayerIdx !== undefined) setLocalPriorityIdx(extraUpdates.priorityPlayerIdx);
        if (extraUpdates.activePlayerIdx !== undefined) setLocalActiveIdx(extraUpdates.activePlayerIdx);
        if (extraUpdates.phase !== undefined) setLocalPhase(extraUpdates.phase);
        
        if (extraUpdates.pendingPhase !== undefined) setLocalPendingPhase(extraUpdates.pendingPhase);
        if (extraUpdates.pendingStartTime !== undefined) setLocalPendingStartTime(extraUpdates.pendingStartTime);
        if (extraUpdates.penaltyPending !== undefined) setLocalPenaltyPending(extraUpdates.penaltyPending);

            // NYT: Gem buffer lokalt
        if (extraUpdates.usedDelayBuffer !== undefined) setLocalUsedDelayBuffer(extraUpdates.usedDelayBuffer);

        // VIGTIGT: Opdater tids-ankeret hvis det er med (f.eks. ved Start Game)
        // Dette manglede før, og fik tiden til at "stå stille" eller hoppe
        if (extraUpdates.lastActionAt !== undefined) setLocalLastActionAt(extraUpdates.lastActionAt);

        const effectiveLastActionAt = extraUpdates.lastActionAt || lastActionAt;
        
        const newState = {
            isGameStarted, 
            activePlayerIdx, priorityPlayerIdx, phase: currentStepId, isPaused,
            pendingPhase, pendingStartTime, interruptQueue, 
            lastActionAt: effectiveLastActionAt, 
            config: activeConfig,
            lastBonusEvent,
            penaltyPending,
            pendingDurationOverride,
            shortcutTarget,
            interruptersPendingSelection,
            smartInterruptRequests,
            isSlowMotion,
            hasReceivedSlowBonus,
            usedDelayBuffer: remoteStressState?.usedDelayBuffer || 0, // NYT: Hent eksisterende værdi
            combatLifeSnapshot: remoteStressState?.combatLifeSnapshot || null, // NYT: Gemmer liv ved start af combat
            // HER ER RETTELSEN: Vi sikrer at shortcutsLocked overlever opdateringer
            shortcutsLocked: shortcutsLocked,
            ...extraUpdates 
        };

        // --- NEW: FORCE UPDATE REF IMMEDIATELY (Fixer Start Game i Test Mode) ---
        // Vi tvinger hjernen til at forstå at spillet er startet NU
        latestState.current = {
            ...latestState.current,
            ...newState,
            players: newPlayers
        };

        syncState(newPlayers, 0, false, { type: '-', value: '-' }, null, null, newState);
    };

    const updateConfig = (key, value) => {
        const newConfig = { ...activeConfig, [key]: value };
        const newState = {
            isGameStarted, activePlayerIdx, priorityPlayerIdx, phase: currentStepId, isPaused, pendingPhase, pendingStartTime, interruptQueue, lastActionAt, lastBonusEvent, penaltyPending, pendingDurationOverride, shortcutTarget, interruptersPendingSelection, smartInterruptRequests, isSlowMotion, hasReceivedSlowBonus,
            config: newConfig
        };
        syncState(players, 0, false, { type: '-', value: '-' }, null, null, newState);
    };

        const commitTimeAndState = (updates = {}) => {
        let updatedPlayers = [...players];
        const now = Date.now(); 

        const currentStepObj = STEP_INFO.find(s => s.id === currentStepId);
        const burnsClock = currentStepObj ? currentStepObj.burnsClock : true;
        const isOnlySelection = Object.keys(updates).length === 1 && updates.pendingAttacks;

        // --- THE BLAME GAME LOGIC ---
        let currentSnapshot = latestState.current?.combatLifeSnapshot || remoteStressState?.combatLifeSnapshot;
        const nextPhase = updates.phase || currentStepId;
        const combatSteps = ['BEC','ATK','BLK','DMG','EC'];
        
        const isEnteringCombat = !combatSteps.includes(currentStepId) && combatSteps.includes(nextPhase);
        const isLeavingCombat = combatSteps.includes(currentStepId) && !combatSteps.includes(nextPhase);

        if (isEnteringCombat) {
            currentSnapshot = updatedPlayers.map(p => parseInt(p.life || 0, 10));
            updates.combatLifeSnapshot = currentSnapshot; 
        }

        if (isLeavingCombat && currentSnapshot && Array.isArray(currentSnapshot)) {
            const culprit = activePlayerIdx; 
            updatedPlayers = updatedPlayers.map((p, victimIdx) => {
                if (victimIdx === culprit) return p;
                const startLife = currentSnapshot[victimIdx];
                if (startLife === undefined) return p;
                const currentLife = parseInt(p.life || 0, 10);
                const lifeLost = Math.max(0, startLife - currentLife);

                if (lifeLost > 0) {
                    const oldHistory = p.combat_history || {};
                    const oldVal = parseInt(oldHistory[culprit] || 0, 10);
                    return { ...p, combat_history: { ...oldHistory, [culprit]: oldVal + lifeLost } };
                }
                return p;
            });
            updates.combatLifeSnapshot = null; 
            currentSnapshot = null; 
        }

        // -----------------------------------------------------------
        // VIGTIGT: OPDATER TIDSSTEMPEL
        // -----------------------------------------------------------
        const isFlowChange = updates.phase || updates.pendingPhase || 
                             updates.activePlayerIdx !== undefined || 
                             updates.priorityPlayerIdx !== undefined ||
                             updates.isPaused !== undefined;

        if (isFlowChange) {
            updates.lastActionAt = now;
            setLocalLastActionAt(now); 
            if (updates.phase || updates.activePlayerIdx !== undefined) {
                updates.usedDelayBuffer = 0;
            }
        }

        if (updates.isPaused === true && !isPaused) {
             const currentTimeLeft = calculateTimeForPlayer(priorityPlayerIdx, now);
             updatedPlayers[priorityPlayerIdx] = { ...updatedPlayers[priorityPlayerIdx], saved_time: currentTimeLeft };
             const delay = activeConfig.phaseDelaySec || 0;
             const oldUsed = latestState.current?.usedDelayBuffer || remoteStressState?.usedDelayBuffer || 0;
             const safeLastAction = (lastActionAt && !isNaN(lastActionAt)) ? lastActionAt : now;
             const elapsed = Math.max(0, (now - safeLastAction) / 1000);
             updates.usedDelayBuffer = Math.min(delay, elapsed + oldUsed);
        }

        if (updates.isPaused === false && isPaused) {
            const usedBuffer = latestState.current?.usedDelayBuffer || remoteStressState?.usedDelayBuffer || 0;
            const newTime = now - (usedBuffer * 1000);
            updates.lastActionAt = newTime;
            setLocalLastActionAt(newTime);
        }

        // --- BURN CLOCK (FIXED) ---
        // Vi skal gemme tiden hvis:
        // 1. Vi ikke allerede er i gang med at vente (pendingPhase)
        // 2. Spillet kører
        // 3. Vi laver en handling der ændrer flowet (Fase, Prioritet ELLER starter en Pending Phase)
        if (!pendingPhase && !winner && !isPaused && !updates.isPaused && isGameStarted && !isOnlySelection) {
             if (updates.priorityPlayerIdx !== undefined || updates.phase || updates.pendingPhase) { // <--- FIX HER (tilføjet updates.pendingPhase)
                const currentTimeLeft = calculateTimeForPlayer(priorityPlayerIdx, now); 
                updatedPlayers[priorityPlayerIdx] = {
                    ...updatedPlayers[priorityPlayerIdx],
                    saved_time: currentTimeLeft
                };
             }
        }

        // UPDATE LOCAL REF
        if (latestState.current) {
             latestState.current = {
                ...latestState.current,
                ...updates,
                players: updatedPlayers 
            };
        }

        syncAll(updatedPlayers, updates);
    };

    

    // --- 6. HANDLERS ---
    // --- LONG PRESS LOGIC FOR SLOW MODE ---
    const slowBtnTimer = useRef(null);
    const slowBtnIgnoreClick = useRef(false);

    const handleSlowDown = () => {
        slowBtnIgnoreClick.current = false;
        slowBtnTimer.current = setTimeout(() => {
            // 2 sekunder er gået -> Long Press aktiveret!
            slowBtnIgnoreClick.current = true;
            if (seatIdx !== -1) {
                const newVal = !players[seatIdx].auto_slow;
                const newPlayers = [...players];
                newPlayers[seatIdx] = { ...newPlayers[seatIdx], auto_slow: newVal };
                
                syncAll(newPlayers);
                
                if (playSound) playSound(newVal ? 'high' : 'high');
                // triggerAlert er fjernet herfra
            }
        }, 2000); 
    };


    const handleSlowUp = () => {
        if (slowBtnTimer.current) clearTimeout(slowBtnTimer.current);
    };

    const handleSlowClick = (e) => {
        // Hvis vi lige har lavet et long press, skal vi ikke også klikke
        if (slowBtnIgnoreClick.current) {
            e.preventDefault();
            return;
        }
        toggleSlowMotion();
    };
 
    const handleExit = () => { if(window.confirm("Leave Stress Mode?")) onExit(); };

    const handleFastForward = () => {
        if ( isPaused) return;

        if (pendingPhase) {
            const newStartTime = pendingStartTime - 10000;
            // Force update Ref
            latestState.current.pendingStartTime = newStartTime;
            syncAll(players, { pendingStartTime: newStartTime });
        } else {
            const currentTime = getDisplayTime(priorityPlayerIdx);
            const newTime = currentTime - 10;

            let updatedPlayers = [...players];
            updatedPlayers[priorityPlayerIdx] = {
                ...updatedPlayers[priorityPlayerIdx],
                saved_time: newTime
            };
            
            // Force update Ref with new players array
            latestState.current.players = updatedPlayers;
            
            syncAll(updatedPlayers, { lastActionAt: Date.now() });
        }
    };

    const toggleSlowMotion = () => {
        let extraUpdates = { isSlowMotion: !isSlowMotion };
        let updatedPlayers = [...players];
        let bonusEvent = lastBonusEvent;

        // Kun hvis vi tænder den (!isSlowMotion), og ikke har fået bonus endnu
        if (!isSlowMotion && !hasReceivedSlowBonus && activeConfig.slowModeBonusSec > 0) {
            
            // --- FIX START: Tjek om det er for sent ---
            const isLatePhase = currentStepId === 'MAIN2' || currentStepId === 'END';

            if (!isLatePhase) {
                // GIV BONUS (Normal adfærd)
                let currentSaved = updatedPlayers[activePlayerIdx].saved_time;
                if (currentSaved === undefined || currentSaved === null) {
                    currentSaved = activeConfig.startTimeMin * 60;
                }
                const now = Date.now();
                const pTime = calculateTimeForPlayer(activePlayerIdx, now); 
                const newTime = pTime + activeConfig.slowModeBonusSec; 

                updatedPlayers[activePlayerIdx] = {
                    ...updatedPlayers[activePlayerIdx],
                    saved_time: newTime
                };

                bonusEvent = { id: crypto.randomUUID(), seatIdx: activePlayerIdx, amount: activeConfig.slowModeBonusSec };
                
                extraUpdates.lastActionAt = now; 
                setLocalLastActionAt(now); 
            } else {
                // NÆGT BONUS (For sent) - Send tekst-event i stedet for alert
                bonusEvent = { id: crypto.randomUUID(), seatIdx: activePlayerIdx, amount: "TOO LATE!" };
            }
            // --- FIX END ---

            extraUpdates.lastBonusEvent = bonusEvent;
            extraUpdates.hasReceivedSlowBonus = true;
        }

        syncAll(updatedPlayers, extraUpdates);
    };

    const setStartingPlayer = (index) => {
        if (isGameStarted) return;
        syncAll(players, { activePlayerIdx: index, priorityPlayerIdx: index });
    };

    const handlePenaltyTaken = () => {
        const i = priorityPlayerIdx;
        const now = Date.now();
        const pTime = calculateTimeForPlayer(i, now);
        const threshold = activeConfig.penaltyIntervalSec || 60;
        const timeBelowZero = Math.abs(pTime);
        const expectedPenalties = Math.floor(timeBelowZero / threshold) + 1;
        
        const updatedPlayers = [...players];
        updatedPlayers[i] = {
            ...updatedPlayers[i],
            penalties: expectedPenalties 
        };

        setLocalPenaltyPending(false);
        setLocalPaused(false);
        
        // NYT: Vi "snyder" og siger vi allerede har brugt hele delayet
        const fullDelay = activeConfig.phaseDelaySec || 0;
        const newLastAction = now - (fullDelay * 1000); // Start uret "delay sekunder" i fortiden
        
        setLocalLastActionAt(newLastAction); 

        if (latestState.current) {
            latestState.current.players = updatedPlayers; 
            latestState.current.penaltyPending = false;
            latestState.current.isPaused = false;
            latestState.current.lastActionAt = newLastAction; 
            latestState.current.usedDelayBuffer = fullDelay; // VIGTIGT: Gem at bufferen er brugt
        }

        // Send 'usedDelayBuffer' med updates
        syncAll(updatedPlayers, { 
            isPaused: false, 
            penaltyPending: false, 
            lastActionAt: newLastAction,
            usedDelayBuffer: fullDelay 
        });
    };

    
    const handlePenaltyElimination = () => {
        const pIdx = priorityPlayerIdx;
        const updatedPlayers = [...players];
        updatedPlayers[pIdx] = { ...updatedPlayers[pIdx], is_dead: true };
        let nextPlayerIdx = (pIdx + 1) % players.length;
        let attempts = 0;
        while ((!updatedPlayers[nextPlayerIdx] || !updatedPlayers[nextPlayerIdx].name || updatedPlayers[nextPlayerIdx].is_dead) && attempts < players.length) {
            nextPlayerIdx = (nextPlayerIdx + 1) % players.length;
            attempts++;
        }
        syncAll(updatedPlayers, {
            activePlayerIdx: nextPlayerIdx, 
            priorityPlayerIdx: nextPlayerIdx, 
            phase: STEP_INFO[0].id, 
            isPaused: false, 
            penaltyPending: false,
            lastActionAt: Date.now()
        });
    };

    const handleShortcut = (type) => {
        // Tjek om shortcuts er låst for denne tur
        if (isPaused || penaltyPending || remoteStressState?.shortcutsLocked) return;


        // ... (Resten af funktionen er uændret - den med SHORTCUT_BUFFER) ...
        // Tjek om nogen står i køen først
        if (interruptQueue.length > 0) {
             // ...
             return;
        }
        
        let target = null;
        if (type === 'NO_ATTACKS') target = 'MAIN2';
        else if (type === 'END_TURN') target = 'NEXT_TURN';

        if (target) {
            const now = Date.now();
            if (latestState.current) {
                latestState.current.pendingPhase = 'SHORTCUT_BUFFER';
                latestState.current.shortcutTarget = target;
                latestState.current.pendingStartTime = now;
                latestState.current.lastActionAt = now;
            }
            commitTimeAndState({
                pendingPhase: 'SHORTCUT_BUFFER',
                shortcutTarget: target,
                pendingStartTime: now,
                pendingDurationOverride: 5,
                interruptersPendingSelection: [],
                smartInterruptRequests: [],
                lastActionAt: now
            });
            setLocalLastActionAt(now);
        }
    };

    // --- NY FUNKTION: EASY COWBOY (Med Bonus + Time Calc) ---
    const handleEasyCowboy = () => {
        if (localSeat === null) return;
        const seatIdx = parseInt(localSeat);
        if (pendingPhase !== 'SHORTCUT_BUFFER') return;

        if (playSound) playSound('horse'); 
        const now = Date.now();

        // 1. FASTHOLD NUVÆRENDE FASE
        let safePhase = currentStepId;
        const isValidPhase = STEP_INFO.some(s => s.id === safePhase);
        if (!isValidPhase) safePhase = 'MAIN1'; 

        // 2. BEREGN TID & BONUS TIL AP
        let updatedPlayers = [...players];
        let bonusEvent = lastBonusEvent;
        let newHasReceivedSlowBonus = hasReceivedSlowBonus;

        // Beregn AP's tid lige nu (Vi "brænder" tiden ned til nu)
        let currentTimeLeft = calculateTimeForPlayer(activePlayerIdx, now);

        // Tjek om vi skal give bonus (hvis ikke allerede modtaget)
        if (!hasReceivedSlowBonus && activeConfig.slowModeBonusSec > 0) {
            currentTimeLeft += activeConfig.slowModeBonusSec;
            newHasReceivedSlowBonus = true;
            bonusEvent = { id: crypto.randomUUID(), seatIdx: activePlayerIdx, amount: activeConfig.slowModeBonusSec };
        }

        // Gem den nye tid på AP
        updatedPlayers[activePlayerIdx] = {
            ...updatedPlayers[activePlayerIdx],
            saved_time: currentTimeLeft
        };

        // 3. Opdater Ref Lokalt (Tvangsfodring)
        if (latestState.current) {
            latestState.current.pendingPhase = null;
            latestState.current.shortcutTarget = null;
            latestState.current.isSlowMotion = true;
            latestState.current.shortcutsLocked = true;
            latestState.current.phase = safePhase; 
            latestState.current.lastActionAt = now;
            latestState.current.players = updatedPlayers; // Vigtigt: Opdater spillere i ref
        }

        // 4. Send direkte til syncAll
        // Vi bruger syncAll direkte her for at sikre at vores tidsberegning og bonus kommer med
        syncAll(updatedPlayers, {
            priorityPlayerIdx: seatIdx, // NAP markerer sig
            phase: safePhase,           
            
            isPaused: false,            
            isSlowMotion: true,         
            shortcutsLocked: true,      
            hasReceivedSlowBonus: newHasReceivedSlowBonus, // Gem at bonus er givet
            
            pendingPhase: null,         
            pendingStartTime: 0,
            shortcutTarget: null,       
            
            lastBonusEvent: bonusEvent, // Vis animation
            interruptersPendingSelection: [],
            lastActionAt: now
        });
        setLocalLastActionAt(now);
    };
    // ---------------------------------------------------------------------

    const resolveShortcut = () => {
        const currentRef = latestState.current || {};
        
        // SIKKERHED 1: Hvis Easy Cowboy er trykket (Låst), så GØR INTET!
        if (currentRef.shortcutsLocked) return;

        // SIKKERHED 2: Kun Pause skal blokere her. 
        // RETTELSE: Vi har fjernet 'currentRef.isSlowMotion' herfra.
        // Hvis en genvej er startet (vi er i bufferen), SKAL den have lov at resolvere,
        // selvom vi er i Slow Mode.
        if (currentRef.isPaused) return;

        // Tjek at vi faktisk er i bufferen
        if (pendingPhase !== 'SHORTCUT_BUFFER' && currentRef.pendingPhase !== 'SHORTCUT_BUFFER') return;

        console.log("🚀 RESOLVING SHORTCUT NOW ->", shortcutTarget);

        if (shortcutTarget === 'NEXT_TURN') {
            passTurnToNextPlayer();
        } else if (shortcutTarget) {
            commitTimeAndState({
                phase: shortcutTarget,
                pendingPhase: null,
                pendingStartTime: 0,
                pendingDurationOverride: null,
                shortcutTarget: null,
                smartInterruptRequests: [],
                interruptersPendingSelection: [],
                lastActionAt: Date.now() 
            });
            setLocalLastActionAt(Date.now());
        }
    };

    const commitStepChange = () => {
        // Hent den nyeste pendingPhase direkte fra ref'en
        const currentRef = latestState.current || {};
        const pending = currentRef.pendingPhase || pendingPhase;

        // SIKKERHEDS-CHECK: Hvis vi er ved at gøre "Venteværelset" til en rigtig fase, så STOP!
        // Dette sker, hvis Safety Valve trigger mens Easy Cowboy rydder op.
        if (pending === 'SHORTCUT_BUFFER') {
            console.warn("⚠️ commitStepChange prevented SHORTCUT_BUFFER from becoming active phase!");
            
            // Redningsaktion: Annuller alt og bliv i den nuværende fase
            // Vi forsøger at finde den fase vi kom fra, ellers fallback til MAIN1
            const rescuePhase = STEP_INFO.some(s => s.id === currentRef.phase) ? currentRef.phase : 'MAIN1';

            commitTimeAndState({
                pendingPhase: null,
                pendingStartTime: 0,
                phase: rescuePhase, // BLIV HER!
                
                // Sørg for at straffen gælder, da tiden løb ud i et shortcut forsøg
                isSlowMotion: true, 
                shortcutsLocked: true,
                
                shortcutTarget: null,
                interruptersPendingSelection: [],
                smartInterruptRequests: [],
                lastActionAt: Date.now()
            });
            setLocalLastActionAt(Date.now());
            return;
        }

        // Normal logik (hvis det er et rigtigt hop)
        if (pending === 'NEXT_TURN') { 
            passTurnToNextPlayer(); 
        } 
        else { 
            commitTimeAndState({ 
                phase: pending, 
                pendingPhase: null, 
                pendingStartTime: 0, 
                priorityPlayerIdx: activePlayerIdx,
                pendingDurationOverride: null,
                shortcutTarget: null,
                interruptersPendingSelection: [],
                smartInterruptRequests: [],
                lastActionAt: Date.now() 
            }); 
            setLocalLastActionAt(Date.now());
        }
    };
    
        
    const toggleAttackTarget = (targetIdx) => {
        // Må kun bruges i Attack Step af den aktive spiller
        if (currentStepId !== 'ATK' || seatIdx !== activePlayerIdx) return;
        // Man kan ikke angribe sig selv eller døde
        if (targetIdx === activePlayerIdx || players[targetIdx].is_dead) return;

        if (playSound) playSound('click');

        let newTargets = [...pendingAttacks];
        if (newTargets.includes(targetIdx)) {
            newTargets = newTargets.filter(t => t !== targetIdx); // Fjern
        } else {
            newTargets.push(targetIdx); // Tilføj
        }

        // Send til serveren med det samme, så alle kan se sværdene
        commitTimeAndState({ pendingAttacks: newTargets });
    };
    
    const handlePassButton = () => {
        if (isPaused || penaltyPending) return;

        // 1. HÅNDTER KØEN
        if (interruptQueue.length > 0) {
            const nextInLine = interruptQueue[0];
            const remainingQueue = interruptQueue.slice(1);
             
            commitTimeAndState({ 
                priorityPlayerIdx: nextInLine, 
                interruptQueue: remainingQueue,
                pendingPhase: null, 
                pendingStartTime: 0 
            });
            return;
        }

        // 2. BLOCKERS
        if (currentStepId === 'BLK' && interruptQueue.length === 0) {
             commitTimeAndState({ pendingPhase: 'DMG', pendingStartTime: Date.now() });
             return;
        }

        // 3. HANDBACK TO ACTIVE PLAYER
        if (priorityPlayerIdx !== activePlayerIdx) {
            
            const now = Date.now(); 
            commitTimeAndState({ 
                priorityPlayerIdx: activePlayerIdx,
                pendingPhase: null,
                pendingStartTime: 0,
                shortcutTarget: null, 
                lastActionAt: now     
            });
            setLocalLastActionAt(now); 
            return;
        }

        // --- HERFRA KUN ACTIVE PLAYER ---

        // 4. ATTACK DECLARATION
        if (currentStepId === 'ATK') {
            if (pendingAttacks.length === 0) {
               
                commitTimeAndState({ phase: 'MAIN2', pendingPhase: null, pendingStartTime: 0, pendingAttacks: [] });
            } else {
                if (playSound) playSound('battle');
                const playerCount = players.length;
                const sortedDefenders = [...pendingAttacks].sort((a, b) => {
                    const distA = (a - activePlayerIdx + playerCount) % playerCount;
                    const distB = (b - activePlayerIdx + playerCount) % playerCount;
                    return distA - distB;
                });
                const firstDefender = sortedDefenders[0];
                const newQueue = sortedDefenders.slice(1);
                commitTimeAndState({ phase: 'BLK', priorityPlayerIdx: firstDefender, interruptQueue: newQueue, pendingPhase: null, pendingStartTime: 0 });
            }
            return;
        }

        // 5. MAIN 2 AUTO-SHORTCUT
        if (currentStepId === 'MAIN2' && !isSlowMotion) {
            handleShortcut('END_TURN');
            return;
        }

        // 6. STANDARD PHASE CHANGE (STABILISERET)
        const currentIndex = STEP_INFO.findIndex(p => p.id === currentStepId);
        let targetStepId = 'NEXT_TURN';
        
        for (let i = currentIndex + 1; i < STEP_INFO.length; i++) {
            const step = STEP_INFO[i];
            if (isSlowMotion || !LAZY_SKIPS.includes(step.id)) {
                targetStepId = step.id;
                break;
            }
        }

        const now = Date.now();

        // --- VIGTIGT: TVANGSFODR REF FOR NORMALE HOP ---
        if (latestState.current) {
            latestState.current.pendingPhase = targetStepId;
            latestState.current.pendingStartTime = now;
            latestState.current.shortcutTarget = null;
            latestState.current.lastActionAt = now;
        }

        commitTimeAndState({ 
            pendingPhase: targetStepId, 
            pendingStartTime: now,
            shortcutTarget: null, 
            pendingDurationOverride: null,
            interruptersPendingSelection: [], 
            smartInterruptRequests: [],
            lastActionAt: now
        });
        setLocalLastActionAt(now);
    };

    

        const passTurnToNextPlayer = () => {
        const nextPlayerIdx = getNextAlivePlayer(activePlayerIdx);
        let playersWithBonus = [...players];
        
        // --- FIX: SAVE TIME FOR CURRENT PLAYER ---
        // Vi skal huske at trække tiden fra den spiller der slutter turen NU,
        // ellers får han sin tid tilbage fra starten af turen.
        const now = Date.now();
        const currentActorTimeLeft = calculateTimeForPlayer(activePlayerIdx, now);
        
        playersWithBonus[activePlayerIdx] = {
            ...playersWithBonus[activePlayerIdx],
            saved_time: currentActorTimeLeft
        };
        // -----------------------------------------

        // 1. Standard Turn Bonus
        let totalBonus = (activeConfig.bonusSec || 0);
        
        // 2. Auto Slow Mode Logic
        const nextPlayer = playersWithBonus[nextPlayerIdx];
        const autoSlow = nextPlayer.auto_slow || false;
        let nextIsSlow = false;
        let nextHasReceivedSlowBonus = false;

        if (autoSlow) {
            nextIsSlow = true;
            const slowBonus = activeConfig.slowModeBonusSec ?? 5;
            if (slowBonus > 0) {
                totalBonus += slowBonus;
                nextHasReceivedSlowBonus = true;
            }
        }

        // 3. Påfør bonus til NÆSTE spiller
        let bonusEvent = lastBonusEvent;
        if (totalBonus > 0) {
            let currentSaved = playersWithBonus[nextPlayerIdx].saved_time;
            if (currentSaved === undefined || currentSaved === null) {
                currentSaved = activeConfig.startTimeMin * 60;
            }
            playersWithBonus[nextPlayerIdx] = {
                ...playersWithBonus[nextPlayerIdx],
                saved_time: currentSaved + totalBonus
            };
            bonusEvent = { id: crypto.randomUUID(), seatIdx: nextPlayerIdx, amount: totalBonus };
        }

        syncAll(playersWithBonus, {
            activePlayerIdx: nextPlayerIdx, 
            priorityPlayerIdx: nextPlayerIdx, 
            phase: STEP_INFO[0].id, 
            isPaused: false, 
            pendingPhase: null, 
            pendingStartTime: 0, 
            interruptQueue: [], 
            lastActionAt: now, 
            lastBonusEvent: bonusEvent,
            penaltyPending: false,
            pendingDurationOverride: null,
            shortcutTarget: null,
            interruptersPendingSelection: [], 
            smartInterruptRequests: [],
            
            // NYT: Nulstil lås og tilstand for den nye tur
            isSlowMotion: nextIsSlow, 
            hasReceivedSlowBonus: nextHasReceivedSlowBonus,
            shortcutsLocked: false // <--- LÅS OP FOR DEN NYE SPILLER
        });
    };


    const handleInterruption = () => {
        // 1. Basic Safety Checks
        if (isPaused && !shortcutTarget) return; 
        if (localSeat === null) return;
        const seatIdx = parseInt(localSeat);
        
        if (seatIdx === activePlayerIdx || players[seatIdx].is_dead) return; 
        
        if (playSound) playSound('battle'); 

        const now = Date.now();

        // --- SLETTET KODE: "DETECT SHORTCUT INTERRUPTION" BLOKKEN ER FJERNET HERFRA ---
        // (Vi bruger handleEasyCowboy til at stoppe shortcuts nu)

        // 3. NORMAL INTERRUPTION (Priority Hold) - Dette er det eneste den skal gøre nu
        let newQueue = [...interruptQueue];
        let newPriority = priorityPlayerIdx;
        let clearPending = false;

        // Hvis vi afbryder et NORMALT faseskift (ikke shortcut), skal vi stadig stoppe uret
        if (pendingPhase) {
            clearPending = true;
            newPriority = seatIdx;
            newQueue = newQueue.filter(id => id !== seatIdx);
        } else {
            if (!newQueue.includes(seatIdx) && seatIdx !== priorityPlayerIdx) { 
                newQueue.push(seatIdx); 
            }
        }

        commitTimeAndState({
            priorityPlayerIdx: newPriority, 
            interruptQueue: newQueue,
            pendingPhase: clearPending ? null : pendingPhase, 
            pendingStartTime: clearPending ? 0 : pendingStartTime,
            pendingDurationOverride: clearPending ? null : pendingDurationOverride,
            lastActionAt: now
        });
        setLocalLastActionAt(now);
    };

    const resolveInterruption = () => {
        // Denne bruges når AP har afbrudt nogen, og giver turen tilbage.
        // Hvis der stadig er folk i køen, får den næste i køen turen.
        // Hvis køen er tom, får AP turen tilbage.
        
        let nextPriority = activePlayerIdx;
        let newQueue = [...interruptQueue]; // Vi ændrer ikke køen her, vi kigger bare i den

        if (newQueue.length > 0) {
            nextPriority = newQueue[0];
            // OBS: Vi fjerner dem IKKE her. Det gør handlePassButton når de er færdige.
            // Men vent... hvis AP brød ind, skal den oprindelige person vel have lov igen?
            // Jo. Så vi beholder dem i køen.
        }

        commitTimeAndState({ priorityPlayerIdx: nextPriority, pendingPhase: null, pendingStartTime: 0 });
    };

    const togglePause = () => { if (!pendingPhase && !penaltyPending) commitTimeAndState({ isPaused: !isPaused }); };

    // FIX: ADDED TOGGLE DEAD HANDLER
    const toggleDead = () => {
        if (!window.confirm("ARE YOU DEAD? This will skip your turns.")) return;
        const seat = parseInt(localSeat);
        if (playSound) playSound('low');
        if (seat === activePlayerIdx) {
            const updatedPlayers = [...players];
            updatedPlayers[seat] = { ...updatedPlayers[seat], is_dead: true };
            let nextPlayerIdx = (activePlayerIdx + 1) % players.length;
            let attempts = 0;
            while ((!updatedPlayers[nextPlayerIdx] || !updatedPlayers[nextPlayerIdx].name || updatedPlayers[nextPlayerIdx].is_dead) && attempts < players.length) {
                nextPlayerIdx = (nextPlayerIdx + 1) % players.length;
                attempts++;
            }
            syncAll(updatedPlayers, {
                activePlayerIdx: nextPlayerIdx, priorityPlayerIdx: nextPlayerIdx, phase: STEP_INFO[0].id, isPaused: false, lastActionAt: Date.now()
            });
        } else {
            updatePlayer(seat, 'is_dead', true);
        }
    };

    // FIX: RESTORED ORIGINAL SEAT SELECTION
    const selectSeat = (targetIndex) => {
        if (!players[targetIndex] || !players[targetIndex].name) return;
        const p = players[targetIndex];
        const isTaken = p.is_seated && p.seated_by !== deviceId;

        // --- RETTELSE: Vi fjerner denne linje! ---
        // FØR: if (isTaken && !isGameStarted) return; 
        // NU: Vi tillader altid reclaim, men spørger om lov.

        if (isTaken) {
            // Vi advarer altid hvis man stjæler et sæde - både før og under spillet
            if(!window.confirm(`Reclaim ${p.name}'s seat?`)) return;
        }

        if (p.is_seated && p.seated_by === deviceId) {
            setLocalSeat(String(targetIndex));
            localStorage.setItem('stress_seat', targetIndex);
            if (playSound) playSound('click');
            return;
        }

        // ... resten af funktionen er uændret ...

        const newPlayers = players.map(pl => {
            if (pl && pl.seated_by === deviceId) return { ...pl, is_seated: false, seated_by: null };
            return pl;
        });
        newPlayers[targetIndex] = { ...newPlayers[targetIndex], is_seated: true, seated_by: deviceId };
        setLocalSeat(String(targetIndex));
        localStorage.setItem('stress_seat', targetIndex);
        if (playSound) playSound('click');
        syncAll(newPlayers);
    };

    const handleReselect = () => { 
        if (localSeat !== null) {
            setIsReleasingSeat(true); 
            const idx = parseInt(localSeat);
            const newPlayers = [...players];
            if (newPlayers[idx]) {
                newPlayers[idx] = { ...newPlayers[idx], is_seated: false, seated_by: null };
                syncAll(newPlayers);
            }
            setTimeout(() => {
                setLocalSeat(null);
                localStorage.removeItem('stress_seat');
                setIsReleasingSeat(false);
            }, 1000);
        } else {
            setLocalSeat(null);
            localStorage.removeItem('stress_seat');
        }
    };

    const seatIdx = localSeat !== null ? parseInt(localSeat) : -1;
    const me = players[seatIdx];

    const isMyTurn = seatIdx === activePlayerIdx;
    const isMyPriority = seatIdx === priorityPlayerIdx;
    const isInterrupter = isMyPriority && !isMyTurn; 
    const isBlocking = currentStepId === 'BLK' && isMyPriority && !isMyTurn;

    const currentStepObj = STEP_INFO.find(p => p.id === currentStepId) || STEP_INFO[0];
    // --- 4. UI FIX: Håndter visningen af vores nye 'Venteværelse' ---
    let nextStepLabel = null;

    if (pendingPhase === 'NEXT_TURN') {
        nextStepLabel = 'ENDING TURN...';
    } 
    else if (pendingPhase === 'SHORTCUT_BUFFER') {
        // Vi er i bufferen! Vis hvor vi ender, hvis tiden løber ud.
        if (shortcutTarget === 'NEXT_TURN') {
            nextStepLabel = 'JUMPING STEPS, IF I MAY?...'; 
        } else {
            // F.eks. hvis vi skipper til MAIN 2
            const targetLabel = STEP_INFO.find(s => s.id === shortcutTarget)?.label;
            nextStepLabel = `SKIPPING TO ${targetLabel}`;
        }
    } 
    else if (pendingPhase) {
        // Standard fase-skift (f.eks. Main 1 -> Combat)
        nextStepLabel = STEP_INFO.find(p => p.id === pendingPhase)?.label;
    }

    const isSafeZone = !currentStepObj.burnsClock;

    let displayLabel = currentStepObj.label;
    if (!isSlowMotion) {
        if (currentStepId === 'UNTAP') displayLabel = "BEGINNING";
        if (currentStepId === 'END') displayLabel = "ENDING";
    }

    // --- 7. RENDER VIEWS ---

    if (isPortrait) return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-red-600 p-10 text-center animate-pulse">
            <RotateCcw size={64} className="mb-4"/>
            <h1 className="text-4xl font-black uppercase font-serif">Flip Your Phone</h1>
            <p className="text-white mt-4 font-mono text-sm">...and refresh the page!</p>
        </div>
    );

    if (isReleasingSeat) return (
        <div className={`${containerClass} flex-col items-center justify-center gap-6 bg-black`}>
            <Loader size={48} className="text-red-500 animate-spin"/>
            <h2 className="text-xl font-bold text-stone-300 uppercase tracking-widest">Releasing Seat...</h2>
        </div>
    );

    if (winner) {
        return (
            <div className={`${containerClass} flex-col items-center justify-center gap-8 relative bg-black`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,215,0,0.3)_0%,rgba(0,0,0,1)_70%)] animate-pulse"></div>
                <Trophy size={120} className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] animate-bounce" />
                <div className="z-10 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-400 tracking-widest uppercase">The Victor is</h2>
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-800 font-serif drop-shadow-2xl">{winner.name}</h1>
                </div>
                <div className="flex gap-4 z-10 mt-10">
                    <button onClick={handleExit} className="bg-stone-800 hover:bg-stone-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest border border-stone-600">Back to Lobby</button>
                </div>
            </div>
        );
    }

    if (localSeat === null || (!isGameStarted)) return (
        <div className={`${containerClass} flex-col relative`}>
            <style>{styles}</style>

            {/* TOP BAR - FIXED Z-INDEX */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900/50 shrink-0 relative z-[100]">
                <div className="flex gap-4">
                    <button onClick={handleExit} className="flex items-center gap-2 text-stone-500 hover:text-white uppercase font-bold text-xs"><LogOut size={16}/> Exit</button>
                    
                </div>

                <h1 className="text-lg font-serif text-yellow-500">Lobby</h1>
                <div className="w-16"></div> 
            </div>

                                    {/* SPLIT VIEW - Nu med Tydeligere Blur Effect */}
            <div className={`flex-grow flex flex-col landscape:flex-row md:flex-row h-full overflow-hidden transition-all duration-1000 ${parseInt(me?.drunk ?? 0, 10) > 0 ? 'blur-sm saturate-150 contrast-125' : ''}`}>

                {/* SEAT GRID AREA */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start relative z-[60]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
                        {players.map((p, i) => {
                            if (!p || !p.name) return null;
                            const isTaken = p.is_seated && p.seated_by !== deviceId;
                            const isStarting = activePlayerIdx === i; 

                            return (
                                <button 
                                    key={i} 
                                    onClick={() => selectSeat(i)} 
                                    className={`p-4 border-2 rounded-xl transition-all relative overflow-hidden aspect-video flex flex-col items-center justify-center touch-manipulation ${
                                        p.is_seated && p.seated_by === deviceId 
                                            ? 'bg-blue-900/30 border-blue-500 hover:bg-blue-900/50' 
                                            : (isTaken 
                                                ? 'bg-stone-800 border-stone-600 hover:border-red-500 hover:bg-red-900/20' 
                                                : 'bg-stone-800 border-stone-600 hover:border-yellow-500 hover:bg-stone-700')
                                    } ${isStarting ? 'ring-2 ring-yellow-500' : ''}`}
                                >
                                    <span className="text-xl font-bold block truncate w-full text-center">{p.name}</span>
                                    {isTaken && <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-green-500 font-bold uppercase tracking-widest text-[10px]"><CheckCircle className="mr-1" size={14}/> TAKEN</div>}
                                    {p.is_seated && p.seated_by === deviceId && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-blue-300 font-bold uppercase tracking-widest animate-pulse text-[10px]">
                                            <Play size={24} className="mb-1"/> READY
                                        </div>
                                    )}
                                    {isStarting && <div className="absolute top-2 right-2 text-yellow-500"><Crown size={16}/></div>}
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={() => {
                            syncAll(players, { 
                                isGameStarted: true, 
                                isPaused: true,        
                                lastActionAt: Date.now(), 
                                phase: 'UNTAP',        
                                priorityPlayerIdx: activePlayerIdx 
                            });
                        }}
                        disabled={!canStartGame}
                        className={`w-full max-w-md py-6 rounded-xl font-black text-2xl uppercase tracking-widest transition-all shadow-xl ${
                            canStartGame 
                            ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse' 
                            : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                        }`}
                    >
                        {canStartGame ? "START GAME" : `Waiting for players... (${validPlayers.filter(p => p.is_seated).length}/${validPlayers.length})`}
                    </button>

                    {/* MANUAL TIME OVERRIDE & STARTER SELECTION */}
                    <div className="w-full max-w-2xl mt-8 pt-4 border-t border-stone-800">
                        <h3 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings size={12}/> Game Setup (Time & Starter)
                        </h3>
                        <div className="space-y-2">
                            {players.map((p, i) => {
                                if (!p || !p.name) return null;

                                const currentSaved = p.saved_time !== undefined ? p.saved_time : (activeConfig.startTimeMin * 60);
                                const m = Math.floor(currentSaved / 60);
                                const s = Math.abs(currentSaved % 60); 
                                const isStarting = activePlayerIdx === i;

                                return (
                                    <div key={i} className={`flex items-center justify-between p-2 rounded border transition-colors ${isStarting ? 'bg-yellow-900/20 border-yellow-700' : 'bg-stone-900/50 border-stone-800'}`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <button 
                                                onClick={() => setStartingPlayer(i)}
                                                className={`w-8 h-8 flex items-center justify-center rounded transition-all ${isStarting ? 'bg-yellow-600 text-black shadow-lg scale-110' : 'bg-stone-800 text-stone-600 hover:bg-stone-700 hover:text-stone-400'}`}
                                                title="Set as Starting Player"
                                            >
                                                <Crown size={14} />
                                            </button>

                                            <span className={`font-bold text-xs truncate w-24 ${isStarting ? 'text-yellow-500' : 'text-stone-400'}`}>
                                                {p.name} {isStarting && <span className="opacity-50 ml-1">(1st)</span>}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-black/40 rounded border border-stone-700">
                                                <input 
                                                    type="number" 
                                                    className="bg-transparent w-12 text-center font-mono text-white text-sm py-1 outline-none"
                                                    value={m}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        const newTotal = (val * 60) + (currentSaved % 60);
                                                        updatePlayer(i, 'saved_time', newTotal);
                                                    }}
                                                />
                                                <span className="text-stone-600 text-xs">:</span>
                                                <input 
                                                    type="number" 
                                                    className="bg-transparent w-12 text-center font-mono text-white text-sm py-1 outline-none"
                                                    value={s}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        const currentM = Math.floor(currentSaved / 60);
                                                        const newTotal = (currentM * 60) + val;
                                                        updatePlayer(i, 'saved_time', newTotal);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* SETTINGS SIDEBAR */}
                {modeKey === 'sudden_death' && (
                    <div className="w-full landscape:w-80 md:w-80 bg-stone-900 border-t landscape:border-t-0 landscape:border-l md:border-t-0 md:border-l border-stone-700 p-4 shrink-0 flex flex-col overflow-y-auto max-h-[40vh] landscape:max-h-full md:max-h-full shadow-2xl z-20">
                        <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest mb-4 sticky top-0 bg-stone-900 pb-2 border-b border-stone-800">
                            <Settings size={14}/> Game Settings
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-1 landscape:grid-cols-1 gap-3 pb-4">
                            <Stepper label="Time at Start (MIN)" value={activeConfig.startTimeMin} onChange={(val) => updateConfig('startTimeMin', Math.max(1, val))} color="text-yellow-500"/>
                            <Stepper label="Start of Turn Bonus (SEC)" value={activeConfig.bonusSec} onChange={(val) => updateConfig('bonusSec', Math.max(0, val))} color="text-green-400"/>
                            <Stepper label="Phase Change (SEC)" value={activeConfig.pendingSec} onChange={(val) => updateConfig('pendingSec', Math.max(0, val))} color="text-orange-400"/>
                            <Stepper label="Phase/Step Delay (SEC)" value={activeConfig.phaseDelaySec} onChange={(val) => updateConfig('phaseDelaySec', Math.max(0, val))} icon={Hourglass} color="text-cyan-400"/>
                            
                            <div className="h-px bg-stone-800 my-2 col-span-2 md:col-span-1 landscape:col-span-1"></div>
                            
                            <Stepper label="Penalty Frequency" value={activeConfig.penaltyIntervalSec} onChange={(val) => updateConfig('penaltyIntervalSec', Math.max(10, val))} color="text-red-400"/>
                            <Stepper label="Life Penalty" value={activeConfig.penaltyLife} onChange={(val) => updateConfig('penaltyLife', Math.max(0, val))} icon={Heart} color="text-red-500"/>
                            <Stepper label="Drunk Penalty" value={activeConfig.penaltyDrinks} onChange={(val) => updateConfig('penaltyDrinks', Math.max(0, val))} icon={Beer} color="text-yellow-500"/>
                            
                            <div className="h-px bg-stone-800 my-2 col-span-2 md:col-span-1 landscape:col-span-1"></div>

                            <Stepper label="Slow Mode Compensation (SEC)" value={activeConfig.slowModeBonusSec} onChange={(val) => updateConfig('slowModeBonusSec', Math.max(0, val))} icon={Plus} color="text-purple-400"/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // FIX FOR CRASH: Check if 'me' exists.
    if (!me && isGameStarted && localSeat !== null) {
        return <div className="fixed inset-0 bg-black flex items-center justify-center text-stone-500 font-mono animate-pulse">Loading seat data...</div>;
    }

    // --- GAMEPLAY RENDER ---
    return (
        <div className={`${containerClass} relative`}>
            <style>{styles}</style>

            {/* PENALTY OVERLAY (FIXED Z-INDEX) */}
            {penaltyPending && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300 p-4">
                    <div className="bg-stone-900 border-4 border-red-600 p-8 landscape:p-4 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] max-w-lg w-full text-center flex flex-col gap-6 landscape:gap-2 relative overflow-hidden max-h-full overflow-y-auto">
                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(220,38,38,0.2)_0%,rgba(0,0,0,0)_70%)] animate-pulse pointer-events-none"></div>
                        <div className="z-10 flex flex-col justify-center min-h-0">
                            <h2 className="text-red-500 text-sm font-bold uppercase tracking-[0.3em] mb-2 landscape:mb-1 landscape:text-[10px]">Time Limit Reached</h2>
                            <h1 className="text-4xl md:text-5xl landscape:text-2xl font-black text-white uppercase mb-4 landscape:mb-1 leading-none truncate">
                                {players[priorityPlayerIdx]?.name}
                            </h1>
                            <div className="text-6xl landscape:text-3xl mb-6 landscape:mb-2 animate-bounce">☠️</div>
                            <p className="text-stone-300 text-lg landscape:text-sm mb-2 landscape:mb-1">You must pay the penalty:</p>
                            <div className="bg-red-950/50 border border-red-500/50 p-4 landscape:p-2 rounded-xl mb-6 landscape:mb-2">
                                <p className="text-2xl landscape:text-lg font-bold text-white uppercase flex items-center justify-center gap-2">
                                    <Heart size={24} className="text-red-500 fill-red-500"/> -{activeConfig.penaltyLife} <span className="text-sm text-stone-500 mx-2">OR</span> <Beer size={24} className="text-yellow-500 fill-yellow-500"/> +{activeConfig.penaltyDrinks}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 landscape:grid-cols-2 gap-3">
                                <button onClick={handlePenaltyTaken} className="bg-green-700 hover:bg-green-600 text-white font-bold py-4 landscape:py-2 px-4 rounded-xl uppercase tracking-widest transition-all hover:scale-105 shadow-lg border border-green-500 landscape:text-xs">Penalty Taken</button>
                                <button onClick={handlePenaltyElimination} className="bg-stone-800 hover:bg-red-900/80 text-stone-400 hover:text-red-200 font-bold py-3 landscape:py-2 px-4 rounded-xl uppercase tracking-widest transition-colors border border-stone-700 hover:border-red-500 text-xs">Eliminate Player</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERT OVERLAY */}
            {alertMessage && (
                <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 animate-in zoom-in duration-300 pointer-events-none">
                    <div className="bg-red-900 border-4 border-red-500 p-6 px-10 py-8 mx-4 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.6)] flex flex-col items-center gap-4 text-center transform scale-125 max-w-[90vw]">
                        <AlertTriangle size={64} className="text-yellow-400 animate-bounce"/>
                        <h2 className="text-3xl font-black text-white uppercase drop-shadow-xl leading-tight">{alertMessage}</h2>
                    </div>
                </div>
            )}

            {/* TOP BAR - PHASE INDICATOR & CONTROLS */}
            <div className={`flex items-center justify-between p-1 px-2 border-b shrink-0 relative z-[100] h-12 transition-colors duration-500 overflow-hidden ${getPhaseColorClass(currentStepId)}`}>
                
                {/* --- INTEGRERET PROGRESS BAR --- */}
                {pendingPhase && (
                    <div 
                        className="absolute inset-0 bg-yellow-500/30 transition-all ease-linear duration-100 z-0 border-r-2 border-yellow-400" 
                        style={{ width: `${pendingProgress}%` }}
                    ></div>
                )}
                {/* ------------------------------------ */}

                {/* Left: System Controls */}
                <div className="flex gap-2 items-center w-1/3 relative z-10">
                    <button onClick={handleExit} className="flex items-center gap-1 text-stone-300 hover:text-white uppercase font-bold text-[10px] bg-black/40 px-2 py-1 rounded border border-white/10"><LogOut size={12}/> Exit</button>
                    
                    {/* NY: INDEPENDENT MUTE BUTTON */}
                    <button 
                        onClick={toggleMute} 
                        className={`flex items-center justify-center w-8 h-6 rounded border transition-all ${
                            !isMuted 
                            ? 'bg-yellow-900/30 border-yellow-600/50 text-yellow-500 hover:bg-yellow-900/50' // ON (GUL)
                            : 'bg-stone-900 text-stone-600 border-stone-800 hover:text-stone-500' // OFF (GRÅ)
                        }`}
                    >
                        <Megaphone size={14} className={!isMuted ? "drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" : ""}/>
                    </button>
                    
                </div>

                {/* Center: PHASE INDICATOR (Nu med z-10) */}
                <div className="flex flex-col items-center justify-center w-1/3 relative z-10">
                    {!pendingPhase && !penaltyPending && <div className="text-[8px] text-white/70 font-bold uppercase tracking-[0.2em] leading-none mb-0.5">{currentStepObj.group}</div>}
                    <div className="font-black text-sm md:text-lg text-white tracking-widest uppercase flex items-center gap-2 drop-shadow-md whitespace-nowrap">
                        {penaltyPending ? (
                            <span className="text-red-300 animate-pulse">PENALTY!</span>
                        ) : (pendingPhase ? (
                            /* Her viser vi "Going to..." teksten mens baren fyldes */
                            <span className="text-yellow-100 animate-pulse flex items-center gap-2">
                                <ArrowRight size={14}/> {nextStepLabel}
                            </span>
                        ) : (
                            displayLabel
                        ))}
                    </div>
                </div>
                
                {/* Right: LIFE & DRUNK COUNTERS (Paranoid Fix) */}
                <div className="w-1/3 flex justify-end items-center gap-2 pr-1 relative z-10">
                    {me && (
                        <>
                            {/* LIFE CONTROL */}
                            <div className="flex items-center bg-black/60 rounded border border-red-900/50 overflow-hidden h-8">
                                <button 
                                    onClick={() => {
                                        const current = Number(me.life) || 0;
                                        updatePlayer(seatIdx, 'life', current - 1);
                                    }} 
                                    className="h-full px-2 hover:bg-red-900/30 text-red-500 active:bg-red-900/50 flex items-center justify-center font-bold"
                                >
                                    -
                                </button>
                                <div className="flex flex-col items-center justify-center px-1 min-w-[30px] border-x border-red-900/30 h-full">
                                    <Heart size={8} className="text-red-500 fill-red-500 mb-0.5"/>
                                    <span className="text-[10px] font-black text-white leading-none">{me.life ?? 0}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        const current = Number(me.life) || 0;
                                        updatePlayer(seatIdx, 'life', current + 1);
                                    }} 
                                    className="h-full px-2 hover:bg-red-900/30 text-red-500 active:bg-red-900/50 flex items-center justify-center font-bold"
                                >
                                    +
                                </button>
                            </div>

                            {/* DRUNK CONTROL */}
                            <div className={`flex items-center bg-black/60 rounded border overflow-hidden h-8 transition-colors ${me.drunk > 0 ? 'border-yellow-700/50' : 'border-stone-800 opacity-60 hover:opacity-100'}`}>
                                <button 
                                    onClick={() => {
                                        const current = Number(me.drunk) || 0;
                                        updatePlayer(seatIdx, 'drunk', Math.max(0, current - 1));
                                    }} 
                                    className="h-full px-2 hover:bg-yellow-900/30 text-yellow-500 active:bg-yellow-900/50 flex items-center justify-center font-bold"
                                >
                                    -
                                </button>
                                <div className={`flex flex-col items-center justify-center px-1 min-w-[30px] border-x h-full ${me.drunk > 0 ? 'border-yellow-900/30' : 'border-stone-800'}`}>
                                    <Beer size={8} className={me.drunk > 0 ? "text-yellow-500 fill-yellow-500 mb-0.5" : "text-stone-600 mb-0.5"}/>
                                    <span className={`text-[10px] font-black leading-none ${me.drunk > 0 ? "text-yellow-100" : "text-stone-600"}`}>{me.drunk ?? 0}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        const current = Number(me.drunk) || 0;
                                        updatePlayer(seatIdx, 'drunk', current + 1);
                                    }} 
                                    className="h-full px-2 hover:bg-yellow-900/30 text-yellow-500 active:bg-yellow-900/50 flex items-center justify-center font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>


                        {/* SPLIT VIEW - Nu med Tydeligere Blur Effect */}
            <div className={`flex-grow flex flex-col landscape:flex-row md:flex-row h-full overflow-hidden transition-all duration-1000 ${parseInt(me?.drunk ?? 0, 10) > 0 ? 'blur-sm saturate-150 contrast-125' : ''}`}>

                {/* LEFT COLUMN - SCROLLABLE LIST & FIXED BUTTONS */}
                <div className="w-1/4 h-full border-r border-gray-800 p-2 flex flex-col relative z-[60]">
                    
                    {/* TABLE ORDER LIST (Flexible Height + Scroll) */}
                    <div className="w-full bg-black/40 rounded-xl border border-stone-800/50 flex flex-col flex-1 min-h-0 mb-2 overflow-hidden">
                        {/* Header (Fast) */}
                        <div className="text-[9px] uppercase tracking-widest text-stone-500 text-center font-bold border-b border-stone-800 py-2 shrink-0 bg-black/20">
                            Table Order
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {validPlayers.map((p, i) => {
                                const isMe = i === seatIdx;
                                const isActive = i === activePlayerIdx;
                                const hasPriority = i === priorityPlayerIdx;
                                const queuePos = interruptQueue.indexOf(i); 
                                                                                return (
                                <div key={i} className={`flex items-center gap-2 p-1.5 rounded transition-colors ${isMe ? 'bg-blue-900/20 border border-blue-900/50' : (hasPriority ? 'bg-red-900/10' : 'hover:bg-white/5')}`}>
                                    <div className="w-4 h-4 flex items-center justify-center shrink-0">{isActive && <Crown size={14} className="text-yellow-500 fill-yellow-500 animate-pulse"/>}</div>
                                    
                                    {/* NAME & STATS COLUMN */}
                                    <div className="flex-grow min-w-0 flex flex-col justify-center">
                                        <div className={`text-xs font-bold truncate leading-tight ${isActive ? 'text-yellow-500' : (hasPriority ? 'text-red-400' : 'text-stone-400')}`}>
                                            {i+1}. {p.name}
                                        </div>
                                        
                                        {/* STATS ROW */}
                                        <div className="flex items-center gap-3 mt-1">
                                            {/* Life */}
                                            <div className="flex items-center gap-1 bg-black/40 px-1.5 rounded border border-white/5">
                                                <Heart size={8} className="text-red-500 fill-red-500"/>
                                                <span className="text-[10px] font-mono text-stone-300 font-bold">{parseInt(p.life ?? 10, 10)}</span>
                                            </div>
                                            
                                            {/* Drunk (Viser kun hvis > 0) */}
                                            {parseInt(p.drunk ?? 0, 10) > 0 && (
                                                <div className="flex items-center gap-1 bg-black/40 px-1.5 rounded border border-yellow-900/30">
                                                    <Beer size={8} className="text-yellow-500 fill-yellow-500"/>
                                                    <span className="text-[10px] font-mono text-yellow-200 font-bold">{parseInt(p.drunk, 10)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* STATUS INDICATOR (Queue / Me dot) */}
                                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                        {queuePos !== -1 ? (
                                            <div className="bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-lg animate-bounce">#{queuePos + 1}</div>
                                        ) : (isMe && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>)}
                                    </div>
                                </div>
                            );

                            })}
                        </div>
                    </div>

                    {/* BOTTOM BUTTONS (Fixed) */}
                    <div className="mt-auto w-full flex flex-col gap-2 shrink-0">
                       <button 
                            onMouseDown={handleSlowDown} 
                            onMouseUp={handleSlowUp} 
                            onMouseLeave={handleSlowUp}
                            onTouchStart={handleSlowDown}
                            onTouchEnd={handleSlowUp}
                            onClick={handleSlowClick}
                            disabled={isSlowMotion}
                            className={`w-full p-2 rounded text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all relative overflow-hidden select-none touch-manipulation 
                                ${isSlowMotion 
                                    ? 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed opacity-75' // LÅST (Grå)
                                    : 'bg-purple-900/20 text-purple-300 border border-purple-500/50 hover:bg-purple-900/40 hover:text-white hover:border-purple-400' // KLAR (Lilla)
                                }`}
                        >
                            {isSlowMotion ? <Lock size={16}/> : <Turtle size={16}/>}
                            {isSlowMotion ? 'Slow: ON' : 'Slow Mode'}
                            
                            {me?.auto_slow && (
                                <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_8px_rgba(34,197,94,1)] ${!isSlowMotion ? 'animate-pulse' : 'opacity-50'}`}></div>
                            )}
                        </button>


                        {!me.is_dead ? (
                            <button onClick={toggleDead} className="w-full bg-red-900/10 border border-red-900/30 p-2 rounded text-red-800 hover:bg-red-900/30 hover:text-red-500 text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all">
                                <Skull size={16}/> I AM DEAD
                            </button>
                        ) : (
                            <div className="w-full bg-black border border-stone-800 p-2 rounded text-stone-600 text-[9px] uppercase font-bold text-center">
                                You are dead
                            </div>
                        )}
                    </div>
                </div>

                {/* MIDDLE COLUMN - PURE PLAYERS */}
                <div className="w-1/2 h-full flex flex-col p-1 relative">
                    {/* INGEN FASE BOKS HER MERE - DEN ER NU I TOP BAR */}
                    
                    <div className="flex-1 min-h-0 grid grid-cols-2 auto-rows-fr gap-1 pb-1 mt-1">
                        {players.map((p, i) => {
                            if (!p || !p.name) return null;
                            const isActive = i === activePlayerIdx;
                            const hasPrio = i === priorityPlayerIdx;
                            const timeLeft = getDisplayTime(i);
                            const isDanger = timeLeft < 30; 
                            const isLastAndOdd = validPlayers.length % 2 !== 0 && i === validPlayers.length - 1;
                            const colSpanClass = isLastAndOdd ? 'col-span-2' : '';
                            const activeBonus = bonusAnimations.find(a => a.seatIdx === i);
                            const queuePos = interruptQueue.indexOf(i); 

                            // --- NYT: Angrebs-logik ---
                            const isAttacked = pendingAttacks.includes(i);
                            const canAttack = currentStepId === 'ATK' && isMyTurn && !p.is_dead && i !== seatIdx;

                            if (p.is_dead) {
                                return <div key={i} className={`${colSpanClass} rounded-lg border border-stone-800/50 bg-black/40 flex flex-col justify-center items-center opacity-40 grayscale`}><Skull size={20} className="text-stone-700"/><div className="text-[9px] font-bold uppercase text-stone-700">Eliminated</div></div>;
                            }
                            
                            return (
                                <div 
                                    key={i} 
                                    // --- NYT: Klik for at angribe ---
                                    onClick={() => {
                                        if (canAttack) {
                                            if (isMyTurn && playSound) playSound('click');
                                            toggleAttackTarget(i);
                                        }
                                    }}
                                    className={`${colSpanClass} rounded-lg p-0.5 flex flex-col justify-center items-center transition-all relative overflow-hidden 
                                    ${isActive ? 'bg-stone-800/90 border-2 border-yellow-600/50' : 'bg-stone-900/80 border border-stone-800/30'} 
                                    ${hasPrio ? 'ring-1 ring-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)] z-20' : 'z-0'}
                                    ${isAttacked ? 'ring-2 ring-red-600 bg-red-900/20' : ''} 
                                    ${canAttack ? 'cursor-pointer hover:bg-red-900/10 active:scale-95' : ''}
                                    `}
                                >
                                    {/* --- NYT: Attack Indicator (Swords) --- */}
                                    {isAttacked && (
                                        <div className="absolute top-1 right-1 text-red-500 animate-pulse z-30 drop-shadow-md">
                                            <Swords size={20} />
                                        </div>
                                    )}

                                    {/* --- NYT: Tap to Attack Overlay (Hint) --- */}
                                    {canAttack && !isAttacked && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 z-40 transition-opacity">
                                            <Swords size={32} className="text-stone-500/50"/>
                                        </div>
                                    )}

                                    <div className="absolute top-0.5 w-full flex justify-between px-1.5 opacity-70 z-20">
                                        {isActive ? <Crown size={9} className="text-yellow-500"/> : <div></div>}
                                        <div className="text-[7px] text-stone-600 font-mono">#{i+1}</div>
                                    </div>
                                    
                                                                    <div className="flex flex-col items-center justify-center w-full z-10">
                                    {/* NAVN: Nu meget større og federe */}
                                    <div className={`font-black uppercase tracking-widest text-center truncate w-full px-1 mb-0 leading-none ${playerCount > 4 ? 'text-xs' : 'text-sm md:text-base'} ${isActive ? 'text-white drop-shadow-md' : 'text-stone-500'}`}>
                                        {p.name}
                                    </div>
                                    
                                    {/* TID: Nu med Delay Indikator Farve */}
                                    <div className={`font-mono font-black tabular-nums tracking-tighter leading-none 
                                        ${isDanger && !isSafeZone ? 'text-red-500 animate-pulse' : 
                                            (isSafeZone ? 'text-cyan-400' : 
                                                // Tjek om vi er i Delay-perioden (Tid er ikke trukket fra banken endnu)
                                                (isActive && !isPaused && (players[i].saved_time - timeLeft) < 1 ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-white')
                                            )}`} 
                                       style={{ 
                                           fontSize: `clamp(1.8rem, ${playerCount > 4 ? '6vh' : (playerCount > 2 ? '10vh' : '14vh')}, 8rem)`,
                                           textShadow: '0 2px 10px rgba(0,0,0,0.5)' 
                                       }}>
                                        {formatTime(timeLeft)}
                                    </div>
                                    
                                    {hasPrio && !isPaused && !pendingPhase && !isSafeZone && <div className="text-[7px] text-red-400 font-bold uppercase animate-bounce bg-black/60 px-1.5 rounded mt-0.5 border border-red-900/30">Thinking</div>}
                                    {isSafeZone && <div className="text-[7px] text-cyan-500 font-bold uppercase bg-cyan-900/20 px-1.5 rounded flex items-center gap-0.5 mt-0.5"><Infinity size={8}/> Safe</div>}
                                </div>


                                    {interruptQueue.includes(i) && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30"><div className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded animate-bounce shadow-lg">WAITING</div></div>}
                                    
                                                                    {/* BONUS / PENALTY ANIMATION (Perfect Center Fix) */}
                                    {activeBonus && (
                                        <div className={`absolute bottom-12 left-1/2 font-black anim-float flex items-center justify-center pointer-events-none z-50 whitespace-nowrap ${typeof activeBonus.amount === 'number' ? 'text-green-400 text-4xl' : 'text-red-500 text-xl uppercase tracking-widest'}`}>
                                            {typeof activeBonus.amount === 'number' ? (
                                                <><Plus size={32} strokeWidth={4}/> {activeBonus.amount}s</>
                                            ) : (
                                                activeBonus.amount
                                            )}
                                        </div>
                                    )}
                                    {/* NEMESIS STATS (Kun synlig i Attack Step) */}
                                    {currentStepId === 'ATK' && i !== seatIdx && (
                                        <div className="absolute top-4 left-1 flex flex-col gap-1 z-40 pointer-events-none">
                                            {/* SKADE JEG HAR GIVET HAM (Blod på mine hænder) */}
                                            {(p.combat_history?.[seatIdx] || 0) > 0 && (
                                                <div className="flex items-center gap-1 bg-red-900/90 px-1.5 py-0.5 rounded border border-red-500/50 shadow-md">
                                                    <Swords size={12} className="text-red-300"/>
                                                    <span className="text-[10px] font-black text-white">{p.combat_history[seatIdx]}</span>
                                                </div>
                                            )}
                                            
                                            {/* SKADE HAN HAR GIVET MIG (Nemesis Score) */}
                                            {(me?.combat_history?.[i] || 0) > 0 && (
                                                <div className="flex items-center gap-1 bg-stone-800/90 px-1.5 py-0.5 rounded border border-stone-600 shadow-md">
                                                    <Skull size={12} className="text-stone-400"/>
                                                    <span className="text-[10px] font-black text-red-500">-{me.combat_history[i]}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* RIGHT COLUMN */}
                <div className="w-1/4 h-full border-l border-gray-800 p-2 flex flex-col gap-3">
                      
                    {/* SHORTCUT BUTTONS */}
                    {/* Vi viser KUN knapperne hvis:
                        1. Jeg har prioritet og det er min tur
                        2. Ingen pending phase (buffer)
                        3. Ikke pauset
                        4. Shortcuts IKKE er låst (Easy Cowboy) 
                    */}
                    {isMyPriority && isMyTurn && !pendingPhase && !isPaused && !shortcutsLocked && (
                        <>
                            {/* Vises i MAIN1, DRAW (altid) OG i UNTAP/UPKEEP (kun i Normal Mode) */}
                            {(currentStepId === 'MAIN1' || currentStepId === 'DRAW' || (!isSlowMotion && ['UNTAP', 'UPKEEP'].includes(currentStepId))) && (
                                <div className={`grid gap-2 shrink-0 h-14 ${currentStepId === 'MAIN1' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {currentStepId === 'MAIN1' && (
                                        <button 
                                            onClick={() => {
                                                if (isMyTurn && playSound) playSound('click');
                                                handleShortcut('NO_ATTACKS');
                                            }} 
                                            className="bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-600 hover:from-stone-600 hover:to-stone-700 hover:border-yellow-600 text-stone-300 hover:text-yellow-500 rounded-lg font-bold uppercase flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 text-[9px] leading-tight px-1 w-full"
                                        >
                                            <SkipForward size={14} className="mb-1 opacity-80"/> SKIP CMBT
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => {
                                            if (isMyTurn && playSound) playSound('click');
                                            handleShortcut('END_TURN');
                                        }} 
                                        className="bg-gradient-to-b from-blue-900/40 to-blue-950/60 border border-blue-700/50 hover:border-blue-500 hover:from-blue-800/60 hover:to-blue-900/80 text-blue-300 hover:text-white rounded-lg font-bold uppercase flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 text-[9px] leading-tight px-1 w-full"
                                    >
                                        <LogIn size={14} className="mb-1 opacity-80"/> END TURN
                                    </button>
                                </div>
                            )}

                            {/* MAIN 2 har sin egen knap som før */}
                            {currentStepId === 'MAIN2' && (
                                <button 
                                    onClick={() => {
                                        if (isMyTurn && playSound) playSound('click');
                                        handleShortcut('END_TURN');
                                    }} 
                                    className="bg-gradient-to-b from-blue-900/40 to-blue-950/60 border border-blue-700/50 hover:border-blue-500 hover:from-blue-800/60 hover:to-blue-900/80 text-blue-300 hover:text-white rounded-lg font-bold uppercase flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 text-[9px] leading-tight px-1 h-14 shrink-0 w-full"
                                >
                                    <LogIn size={14} className="mb-1 opacity-80"/> END TURN
                                </button>
                            )}
                        </>
                    )}

                    {isMyPriority && !me.is_dead ? (
                        <button 
                            onClick={() => {
                                // Kun klik-lyd hvis jeg er Active Player (AP)
                                if (isMyTurn && playSound) playSound('click'); 
                                handlePassButton();
                            }} 
                            disabled={(isMyTurn && pendingPhase) || isPaused} 
                            className={`flex-grow rounded-xl flex flex-col items-center justify-center border-b-8 transition-all shadow-xl active:border-b-0 active:translate-y-2 group ${isPaused ? 'bg-gray-800 border-gray-600 cursor-not-allowed opacity-50' : (isBlocking ? 'bg-red-700 hover:bg-red-600 border-red-900' : (isMyTurn && pendingPhase ? 'bg-gray-700 border-gray-900 cursor-wait opacity-50' : (isInterrupter ? 'bg-orange-700 hover:bg-orange-600 border-orange-900' : 'bg-green-700 hover:bg-green-600 border-green-900'))) }`}
                        >
                            {isMyTurn && pendingPhase ? (
                                <><Loader size={48} className="mb-2 text-gray-400 animate-spin"/><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Waiting...</span></>
                            ) : (
                                <><Play size={56} className={`mb-2 ${isPaused ? 'text-gray-500' : 'text-white group-hover:scale-110'} transition-transform`}/><span className={`font-black text-2xl lg:text-3xl uppercase ${isPaused ? 'text-gray-500' : 'text-white'} tracking-wider`}>PASS</span><span className={`text-[10px] lg:text-xs font-bold ${isPaused ? 'text-gray-600' : 'text-white/70'} uppercase tracking-widest mt-1`}>{isInterrupter ? "Done" 
 : (isBlocking ? "Done Blocking" 
 : (currentStepId === 'ATK' && isMyTurn 
    ? (pendingAttacks.length > 0 ? `DECLARE (${pendingAttacks.length})` : "NO ATTACKS") 
    : (isMyTurn && currentStepId === 'BLK' ? "To Damage" 
    : (currentStepId === 'CLEAN' ? "End Turn" : "Next Step"))))
}</span></>
                            )}
                        </button>
                    ) : (
                        <>
                            {/* HER ER DEN NYE KNAP FOR NAP */}
                            {pendingPhase === 'SHORTCUT_BUFFER' && !isMyTurn && !me.is_dead ? (
                                <button 
                                    onClick={handleEasyCowboy} 
                                    className="flex-grow rounded-xl flex flex-col items-center justify-center transition-all bg-orange-600 hover:bg-orange-500 border-b-8 border-orange-800 active:border-b-0 active:translate-y-2 shadow-xl animate-pulse"
                                >
                                    <Shield size={48} className="mb-2 text-white"/>
                                    <span className="font-black text-2xl lg:text-3xl uppercase text-white tracking-wider">EASY COWBOY!</span>
                                    <span className="text-[10px] lg:text-xs font-bold text-white/80 uppercase tracking-widest mt-1">Block Shortcut</span>
                                </button>
                            ) : (
                                <button onClick={handleInterruption} disabled={interruptQueue.includes(seatIdx) || me.is_dead || isPaused || (isSafeZone && !shortcutTarget)} className={`flex-grow rounded-xl flex flex-col items-center justify-center transition-all group active:scale-95 border-2 ${interruptQueue.includes(seatIdx) || me.is_dead || isPaused ? 'bg-stone-800 border-stone-600 cursor-not-allowed opacity-50' : (pendingPhase ? 'bg-red-600 hover:bg-red-500 border-red-800 animate-pulse' : 'bg-red-900/20 hover:bg-red-900/80 border-red-900/50 hover:border-red-500')}`}>
                                    {interruptQueue.includes(seatIdx) ? (<><Hourglass size={48} className="mb-2 text-stone-500"/><span className="font-black text-xl uppercase text-stone-500">QUEUED</span></>) : (<><Hand size={48} className={`mb-2 transition-colors ${pendingPhase ? 'text-white' : 'text-red-800 group-hover:text-red-200'}`}/><span className={`font-black text-2xl uppercase transition-colors ${pendingPhase ? 'text-white' : 'text-red-900 group-hover:text-white'}`}>{pendingPhase ? "STOP!" : "HOLD!"}</span><span className={`text-[10px] uppercase tracking-widest ${pendingPhase ? 'text-white/80' : 'text-red-800/50 group-hover:text-red-300'}`}>{pendingPhase ? "Interrupt Phase" : "I have response"}</span></>)}
                                </button>
                            )}
                        </>
                    )}

                    <button onClick={togglePause} disabled={!!pendingPhase || me.is_dead} className={`h-12 rounded-lg flex items-center justify-center transition-colors ${pendingPhase || me.is_dead ? 'bg-gray-900 text-gray-700 cursor-not-allowed' : (isPaused ? 'bg-yellow-600 text-black animate-pulse' : 'bg-gray-800 text-gray-400 hover:text-white')}`}>
                        {isPaused ? <span className="font-bold flex items-center gap-2"><Play size={16}/> START / RESUME</span> : <Pause size={20}/>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StressMode;
