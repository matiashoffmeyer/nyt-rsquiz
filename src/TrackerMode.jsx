import React, { useState, useEffect, useRef } from 'react';
import { Heart, Beer, Skull, Zap, Shield, RotateCcw, Dices, X, Target, Sword, Droplet, Flame, ArrowDown, Menu, Settings, LogOut, CheckCircle, Lock, AlertTriangle, User } from 'lucide-react';

// --- STYLES & ANIMATIONS ---
const styles = `
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.tabular-nums { font-variant-numeric: tabular-nums; }

@keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes click-shockwave { 
  0% { transform: scale(0.8); opacity: 0.8; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); } 
  100% { transform: scale(1.5); opacity: 0; box-shadow: 0 0 0 50px rgba(255, 255, 255, 0); } 
}
@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }

.magic-ring { 
  background: conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.1) 20%, transparent 40%, rgba(255,255,255,0.1) 60%, transparent 80%); 
  animation: spin-slow 10s linear infinite; 
}
.magic-click-effect:active::after {
  content: ''; position: absolute; inset: 0; border-radius: 9999px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 60%);
  animation: click-shockwave 0.4s ease-out; pointer-events: none;
}
.animate-float { animation: float 4s ease-in-out infinite; }
`;

// --- COMPONENT: TACTICAL MODAL (THE DOC FEATURE) ---
const TacticalModal = ({ isOpen, onClose, title, children, actions, type = 'default' }) => {
    if (!isOpen) return null;

    const isDanger = type === 'danger';
    const borderColor = isDanger ? 'border-red-500' : 'border-stone-700';
    const glowColor = isDanger ? 'shadow-red-900/50' : 'shadow-stone-900/50';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <div 
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-sm bg-[#0A0A0A] border ${borderColor} ${glowColor} shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className={`p-4 border-b ${isDanger ? 'border-red-900/30 bg-red-900/10' : 'border-stone-800 bg-stone-900/30'} flex justify-between items-center`}>
                    <h2 className={`font-black uppercase tracking-widest text-sm flex items-center gap-2 ${isDanger ? 'text-red-500' : 'text-stone-300'}`}>
                        {isDanger && <AlertTriangle size={16} />} {title}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto text-stone-300 text-sm leading-relaxed">
                    {children}
                </div>

                {/* Footer / Actions */}
                {actions && (
                    <div className="p-4 border-t border-stone-800 bg-stone-900/20 flex gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT: DIRECT ROTARY KNOB (1:1 KOPI FRA CHESSMODE) ---
const DirectRotaryKnob = ({ value, onChange, onCommit, size = 160, icon: Icon = Heart, color = "text-red-500", ringColor = "border-stone-700" }) => {
    const wheelRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [isTouching, setIsTouching] = useState(false);
    const lastAngleRef = useRef(null);
    const accumRef = useRef(0);

    const isRed = color.includes('red');
    const overlayGlowStyle = isRed
        ? "border-red-500 shadow-[0_0_70px_rgba(239,68,68,0.6),inset_0_0_30px_rgba(239,68,68,0.3)]"
        : "border-purple-500 shadow-[0_0_70px_rgba(168,85,247,0.6),inset_0_0_30px_rgba(168,85,247,0.3)]";

    let dynamicScale = 1;
    if (isRed) {
        dynamicScale = Math.min(1.3, 0.6 + (Math.max(0, value) * 0.02));
    } else {
        const cappedValue = Math.min(10, Math.max(0, value));
        dynamicScale = 0.8 + (cappedValue * 0.06); 
    }

    const getAngle = (e) => {
        if (!wheelRef.current) return 0;
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        return Math.atan2(y, x) * (180 / Math.PI);
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        lastAngleRef.current = getAngle(e);
        setIsTouching(true);
    };

    const handlePointerMove = (e) => {
        if (lastAngleRef.current === null) return;
        e.preventDefault();
        const currentAngle = getAngle(e);
        let delta = currentAngle - lastAngleRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        setRotation(prev => prev + delta);
        accumRef.current += delta;

        const stepSize = 70; 
        if (Math.abs(accumRef.current) >= stepSize) {
            const steps = Math.floor(Math.abs(accumRef.current) / stepSize);
            const direction = accumRef.current > 0 ? 1 : -1;
            onChange(steps * direction);
            accumRef.current = accumRef.current % stepSize;
            if (navigator.vibrate) navigator.vibrate(20); 
        }
        lastAngleRef.current = currentAngle;
    };

    const handlePointerUp = (e) => {
        // pointerLeave + pointerUp kan begge fyre — release må ikke crashe og må aldrig blokere commit.
        if (lastAngleRef.current === null) return;
        try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
        lastAngleRef.current = null;
        accumRef.current = 0;
        setIsTouching(false);
        if (onCommit) onCommit();
    };

    return (
        <>
            {isTouching && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all"></div>
                    <div 
                        className={`relative w-[min(20rem,60vw)] h-[min(20rem,60vw)] rounded-full bg-black/80 border-[3px] ${overlayGlowStyle} flex items-center justify-center transition-all duration-200 ease-out`}
                        style={{ transform: `scale(${dynamicScale})` }} 
                    >
                        <Icon className={`absolute opacity-20 ${color} w-2/3 h-2/3`} />
                        <span className={`text-[min(10rem,25vw)] font-black font-mono ${color} drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10 tabular-nums leading-none tracking-tighter`}>
                            {value}
                        </span>
                    </div>
                </div>
            )}

            <div 
                className="relative flex items-center justify-center select-none touch-none"
                style={{ width: size, height: size }}
            >
                <div 
                    ref={wheelRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`absolute inset-0 rounded-full bg-stone-900 border-[6px] ${ringColor} shadow-2xl touch-none active:border-stone-500 active:bg-stone-700 transition-colors`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-stone-500 rounded-full shadow-inner"></div>
                </div>
                <div className="absolute inset-4 bg-stone-900 rounded-full flex flex-col items-center justify-center pointer-events-none border border-white/10 shadow-inner">
                    <Icon size={24} className={`${color} mb-1 drop-shadow-md`} fill="currentColor"/>
                    <span className="text-5xl font-black text-white font-mono leading-none tracking-tighter drop-shadow-xl">{value}</span>
                </div>
            </div>
        </>
    );
};

// --- COMPONENT: DICE ROLLER (HD REMASTER) ---
const DiceRoller = ({ isOpen, onClose, sides, count = 1 }) => {
    const [displayNum, setDisplayNum] = useState(1);
    const [isAnimating, setIsAnimating] = useState(true);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setCanClose(false);
            setTimeout(() => setCanClose(true), 800);

            let steps = 0;
            const interval = setInterval(() => {
                let total = 0;
                for(let i=0; i<count; i++) total += Math.floor(Math.random() * sides) + 1;
                setDisplayNum(total);
                steps++;
                if (steps > 15) {
                    clearInterval(interval);
                    setIsAnimating(false);
                    if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isOpen, sides, count]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200" 
            onClick={() => canClose && onClose()}
        >
            <div className="text-stone-500 font-bold uppercase tracking-widest mb-8 animate-pulse">ROLLING {count}x D{sides}</div>
            <div className={`text-[12rem] font-black text-white tabular-nums tracking-tighter leading-none transition-all duration-100 ${isAnimating ? 'opacity-80 scale-95' : 'opacity-100 scale-110 drop-shadow-[0_0_50px_rgba(59,130,246,0.6)]'}`}>
                {displayNum}
            </div>
            <div className={`mt-12 px-8 py-3 rounded-full border border-stone-800 text-stone-500 font-bold text-xs uppercase tracking-widest ${canClose ? 'opacity-100' : 'opacity-0'}`}>
                Tap to Close
            </div>
        </div>
    );
};

// --- COMPONENT: TRACKER WIDGET ---
const TrackerCounter = ({ label, value, onChange, colorClass, icon: Icon, isDecaying }) => {
    const handlePress = (delta) => {
        if (navigator.vibrate) navigator.vibrate(10);
        onChange(delta);
    };

    return (
        <div className={`relative flex flex-col items-center justify-between p-2 rounded-xl border bg-stone-900/60 backdrop-blur-sm ${colorClass} h-[90px] active:scale-95 transition-transform select-none touch-manipulation`}>
            <div className="flex items-center gap-1.5 w-full justify-center opacity-70 mb-1">
                <Icon size={10} />
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                {isDecaying && <div className="ml-1 px-1 py-0.5 rounded bg-red-900/50 border border-red-500/30 text-[7px] text-red-400 font-mono">DECAY</div>}
            </div>
            
            <div className="flex items-center justify-between w-full gap-1 mt-1">
                <button onPointerDown={() => handlePress(-1)} className="w-10 h-full flex items-center justify-center bg-black/20 rounded-lg hover:bg-white/10 text-stone-400 active:bg-white/20 active:text-white transition-colors">
                    <span className="font-bold text-xl mb-1">-</span>
                </button>
                <span className="text-3xl font-black tabular-nums tracking-tighter">{value}</span>
                <button onPointerDown={() => handlePress(1)} className="w-10 h-full flex items-center justify-center bg-black/20 rounded-lg hover:bg-white/10 text-stone-400 active:bg-white/20 active:text-white transition-colors">
                    <span className="font-bold text-xl mb-1">+</span>
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: TRACKER MODE ---
const COUNTER_DEFS = [
    { id: 'cmd', label: 'CMD DMG', icon: Sword, color: 'border-red-900/50 text-red-400', decay: false },
    { id: 'poison', label: 'HAND SIZE', icon: Droplet, color: 'border-emerald-900/50 text-emerald-400', decay: false },
    { id: 'tax', label: 'TAX/MANA', icon: Shield, color: 'border-yellow-900/50 text-yellow-400', decay: true },
    { id: 'storm', label: 'STORM', icon: Zap, color: 'border-blue-900/50 text-blue-400', decay: true },
    { id: 'exp', label: 'VICTORY POINTS', icon: Flame, color: 'border-orange-900/50 text-orange-400', decay: false },
];

const TrackerMode = ({ players, updatePlayer, syncState, playSound, onExit, campaignId }) => {

    // Single Player Setup: Vi arbejder altid på players[0].
    // localStorage er PRIMÆR source of truth pr. campaign — Supabase er en best-effort backup-sync.
    // Stats må aldrig nulstilles uden at brugeren eksplicit trykker RESET → CONFIRM.
    const myIndex = 0;
    const storageKey = `tracker_state_${campaignId || 'default'}`;

    const loadSavedState = () => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (e) {
            return null;
        }
    };
    const initialSaved = useRef(loadSavedState()).current;
    const hadLocalData = initialSaved !== null;

    // Lokal state er den eneste kilde til hvad der vises. Remote kan kun seed'e første gang
    // hvis localStorage var tomt — derefter ignoreres remote, så et stale Supabase-push
    // aldrig kan resette spillerens stats.
    const [persistedLife, setPersistedLife] = useState(
        initialSaved && typeof initialSaved.lt === 'number' ? initialSaved.lt : 40
    );
    const [persistedDrunk, setPersistedDrunk] = useState(
        initialSaved && typeof initialSaved.drunk === 'number' ? initialSaved.drunk : 0
    );
    const [counters, setCounters] = useState(() => {
        const savedVals = (initialSaved && initialSaved.counters) || {};
        return COUNTER_DEFS.map(def => ({
            ...def,
            value: typeof savedVals[def.id] === 'number' ? savedVals[def.id] : 0,
        }));
    });

    // --- STATE ---
    const [optimisticLife, setOptimisticLife] = useState(null);
    const pendingLifeRef = useRef(null);
    const [optimisticDrunk, setOptimisticDrunk] = useState(null);
    const pendingDrunkRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false });
    const [diceState, setDiceState] = useState({ active: false, sides: 20, count: 1 });
    const lastShakeTime = useRef(0);

    // ÉN-GANGS seeding fra remote: kun hvis vi IKKE allerede har data lokalt.
    // Når flagget er sat, må intet remote-event mere ændre lokal state.
    const hydratedRef = useRef(hadLocalData);
    useEffect(() => {
        if (hydratedRef.current) return;
        if (!Array.isArray(players)) return;
        const remote = players[myIndex];
        if (!remote) return;
        const hasLt = typeof remote.lt === 'number';
        const hasDrunk = typeof remote.drunk === 'number';
        if (!hasLt && !hasDrunk) return;
        if (hasLt) setPersistedLife(remote.lt);
        if (hasDrunk) setPersistedDrunk(remote.drunk);
        hydratedRef.current = true;
    }, [players]);

    // Persistens: skriv altid til localStorage når noget ændres.
    useEffect(() => {
        try {
            const counterValues = {};
            counters.forEach(c => { counterValues[c.id] = c.value; });
            localStorage.setItem(storageKey, JSON.stringify({
                lt: persistedLife,
                drunk: persistedDrunk,
                counters: counterValues,
            }));
        } catch (e) {}
    }, [storageKey, persistedLife, persistedDrunk, counters]);

    // Ryd optimistic display når committed værdi matcher.
    useEffect(() => {
        if (optimisticLife !== null && persistedLife === optimisticLife) setOptimisticLife(null);
        if (optimisticDrunk !== null && persistedDrunk === optimisticDrunk) setOptimisticDrunk(null);
    }, [persistedLife, persistedDrunk, optimisticLife, optimisticDrunk]);

    // Best-effort spejling til Supabase. En fejl her må ALDRIG koste lokal state.
    const mirrorToSupabase = (nextLife, nextDrunk) => {
        try {
            const newPlayers = Array.isArray(players) ? [...players] : [];
            const base = newPlayers[myIndex] || {};
            newPlayers[myIndex] = { ...base, lt: nextLife, drunk: nextDrunk };
            const result = syncState(newPlayers);
            if (result && typeof result.catch === 'function') result.catch(() => {});
        } catch (e) {}
    };

    // --- HANDLERS ---
    const handleLocalLifeChange = (delta) => {
        const currentBase = pendingLifeRef.current !== null ? pendingLifeRef.current : (optimisticLife !== null ? optimisticLife : persistedLife);
        const newVal = currentBase + delta;
        pendingLifeRef.current = newVal;
        setOptimisticLife(newVal);
    };

    const handleLifeCommit = () => {
        if (pendingLifeRef.current === null) return;
        const newVal = pendingLifeRef.current;
        setPersistedLife(newVal);
        mirrorToSupabase(newVal, persistedDrunk);
        pendingLifeRef.current = null;
    };

    const handleLocalDrunkChange = (delta) => {
        const currentBase = pendingDrunkRef.current !== null ? pendingDrunkRef.current : (optimisticDrunk !== null ? optimisticDrunk : persistedDrunk);
        const newVal = Math.max(0, currentBase + delta);
        pendingDrunkRef.current = newVal;
        setOptimisticDrunk(newVal);
    };

    const handleDrunkCommit = () => {
        if (pendingDrunkRef.current === null) return;
        const newVal = pendingDrunkRef.current;
        setPersistedDrunk(newVal);
        mirrorToSupabase(persistedLife, newVal);
        pendingDrunkRef.current = null;
    };

    const updateCounter = (id, delta) => {
        setCounters(prev => prev.map(c => c.id === id ? { ...c, value: Math.max(0, c.value + delta) } : c));
    };

    const handleUpkeep = () => {
        playSound('bell');
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

        let didChange = false;
        const newCounters = counters.map(c => {
            if (c.decay && c.value > 0) {
                didChange = true;
                return { ...c, value: Math.max(0, c.value - 1) };
            }
            return c;
        });
        if (didChange) setCounters(newCounters);
    };

    // Kun denne funktion må nulstille stats — og den kaldes kun fra CONFIRM-knappen i modal.
    const handleReset = () => {
        setPersistedLife(40);
        setPersistedDrunk(0);
        setCounters(prev => prev.map(c => ({ ...c, value: 0 })));
        mirrorToSupabase(40, 0);
        setOptimisticLife(null);
        setOptimisticDrunk(null);
        pendingLifeRef.current = null;
        pendingDrunkRef.current = null;
        setModalConfig({ isOpen: false });
        playSound('click');
    };

    // --- SHAKE DETECTION ---
    useEffect(() => {
        const handleMotion = (event) => {
            if (diceState.active) return;
            const current = event.accelerationIncludingGravity;
            if (!current) return;
            const { x, y, z } = current;
            const acceleration = Math.sqrt(x*x + y*y + z*z);
            if (acceleration > 30) { 
                const now = Date.now();
                if (now - lastShakeTime.current > 1000) {
                    lastShakeTime.current = now;
                    playSound('dice_shake');
                    setDiceState({ active: true, sides: 20, count: 1 });
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            }
        };
        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [diceState.active]);


    // --- RENDER ---
    return (
        <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            <style>{styles}</style>

            {/* --- HEADER --- */}
            <div className="flex justify-between items-center px-4 pt-4 pb-2 z-10 shrink-0">
                {/* MENU BUTTON (Doc Feature) */}
                <button 
                    onClick={() => setMenuOpen(true)}
                    className="w-10 h-10 flex items-center justify-center bg-stone-900 border border-stone-700 rounded-full text-stone-400 hover:text-white transition-all active:scale-95"
                >
                    <Menu size={20} />
                </button>

                <div className="flex items-center gap-2 px-3 py-1 bg-stone-900/50 rounded-full border border-stone-800 backdrop-blur-sm">
                    <Target size={14} className="text-emerald-500 animate-pulse" />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-stone-400">Tracker Mode</span>
                </div>

                {/* EXIT BUTTON (STANDARD ONCLICK) */}
                <button 
                    onClick={() => {
                        if (typeof onExit === 'function') onExit();
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-stone-900 border border-stone-700 rounded-full text-stone-400 hover:text-red-500 hover:border-red-500 transition-all active:scale-95"
                >
                    <X size={20} />
                </button>
            </div>

            {/* --- SCROLLABLE CONTENT (Counters Grid) --- */}
            <div className="flex-grow overflow-y-auto overflow-x-hidden pt-2 px-4 pb-[420px] hide-scrollbar">
                <div className="text-center mb-4 opacity-50 text-[9px] uppercase tracking-widest text-stone-600">Secondary Trackers</div>
                <div className="grid grid-cols-2 gap-2">
                    {counters.map(c => (
                        <TrackerCounter 
                            key={c.id}
                            label={c.label}
                            value={c.value}
                            icon={c.icon}
                            colorClass={c.color}
                            isDecaying={c.decay}
                            onChange={(delta) => updateCounter(c.id, delta)}
                        />
                    ))}
                </div>
            </div>

            {/* --- BOTTOM COCKPIT (Fixed - Wheels Down) --- */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]">
                
                {/* GRADIENT FADE UP */}
                <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>

                <div className="px-4 pb-6 pt-2 flex flex-col gap-4">
                    
                    {/* WHEELS ROW */}
                    <div className="flex justify-between items-end gap-2 px-2">
                        {/* PRIMARY LIFE */}
                        <div className="flex flex-col items-center">
                             <DirectRotaryKnob
                                value={optimisticLife !== null ? optimisticLife : persistedLife}
                                onChange={handleLocalLifeChange}
                                onCommit={handleLifeCommit}
                                size={150}
                                icon={Heart}
                                color="text-red-500"
                                ringColor="border-stone-800"
                            />
                            <div className="mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Life</div>
                        </div>

                        {/* SECONDARY RESOURCE (Drunk/Mana) */}
                        <div className="flex flex-col items-center mb-1">
                            <DirectRotaryKnob
                                value={optimisticDrunk !== null ? optimisticDrunk : persistedDrunk}
                                onChange={handleLocalDrunkChange}
                                onCommit={handleDrunkCommit}
                                size={120}
                                icon={Zap}
                                color="text-purple-500"
                                ringColor="border-purple-900/20"
                            />
                             <div className="mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Energy</div>
                        </div>
                    </div>

                    {/* UPKEEP BUTTON */}
                    <button 
                        onClick={handleUpkeep}
                        className="group relative w-full h-20 rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden flex items-center justify-between px-6 active:scale-[0.98] transition-all shadow-lg magic-click-effect"
                    >
                        <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors duration-500"></div>
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600"></div>
                        <div className="flex flex-col items-start z-10">
                            <span className="text-2xl font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Upkeep</span>
                            <span className="text-[9px] font-bold text-emerald-600/80 uppercase tracking-widest flex items-center gap-1">
                                <ArrowDown size={10} /> Auto-Decay Counters
                            </span>
                        </div>
                        <RotateCcw size={28} className="text-stone-600 group-hover:text-emerald-400 group-hover:rotate-180 transition-all duration-500" />
                    </button>

                    {/* TOOLS ROW */}
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => { playSound('click'); setDiceState({ active: true, sides: 20, count: 1 }); }} 
                            className="h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center gap-2 text-stone-400 hover:text-white hover:bg-stone-800 transition-all active:scale-95"
                        >
                            <Dices size={16} /> <span className="text-[10px] font-bold">D20</span>
                        </button>
                        <button
                            onClick={() => { playSound('click'); setDiceState({ active: true, sides: 6, count: 1 }); }}
                            className="h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center gap-2 text-stone-400 hover:text-white hover:bg-stone-800 transition-all active:scale-95"
                        >
                            <Dices size={16} /> <span className="text-[10px] font-bold">D6</span>
                        </button>
                        <button 
                            onClick={() => setModalConfig({ 
                                isOpen: true, 
                                type: 'danger', 
                                title: 'RESET GAME?', 
                                message: 'This will reset Life to 40 and all counters to 0.',
                                onConfirm: handleReset
                            })}
                            className="h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center gap-2 text-stone-500 hover:text-red-500 hover:bg-red-900/10 hover:border-red-900/30 transition-all active:scale-95"
                        >
                            <RotateCcw size={16} /> <span className="text-[10px] font-bold">RESET</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MENU MODAL (THE DOC FEATURE) --- */}
            <TacticalModal 
                isOpen={menuOpen} 
                onClose={() => setMenuOpen(false)} 
                title="MENU"
            >
                <div className="space-y-2">
                    <button className="w-full p-4 bg-stone-800/50 rounded-xl flex items-center gap-3 hover:bg-stone-800 transition-colors border border-stone-700/50">
                        <Settings size={20} className="text-stone-400" />
                        <span className="font-bold text-stone-300">Settings</span>
                    </button>
                    
                    <button 
                        onClick={() => {
                            setMenuOpen(false);
                            setModalConfig({ 
                                isOpen: true, 
                                type: 'danger', 
                                title: 'EXIT TRACKER?', 
                                message: 'Are you sure you want to leave?',
                                onConfirm: () => onExit()
                            });
                        }}
                        className="w-full p-4 bg-red-900/10 border border-red-900/30 rounded-xl flex items-center gap-3 hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={20} className="text-red-500" />
                        <span className="font-bold text-red-500">Exit Tracker</span>
                    </button>
                </div>
            </TacticalModal>

            {/* --- CONFIRMATION MODAL --- */}
            <TacticalModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false })}
                title={modalConfig.title}
                type={modalConfig.type}
                actions={
                    <>
                        <button onClick={() => setModalConfig({ isOpen: false })} className="flex-1 py-3 bg-stone-800 rounded-lg font-bold text-stone-400">CANCEL</button>
                        <button onClick={() => {
                            if (typeof modalConfig.onConfirm === 'function') modalConfig.onConfirm();
                            else setModalConfig({ isOpen: false });
                        }} className="flex-1 py-3 bg-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-900/50">CONFIRM</button>
                    </>
                }
            >
                <p className="text-stone-400">{modalConfig.message}</p>
            </TacticalModal>

            {/* --- DICE OVERLAY --- */}
            <DiceRoller 
                isOpen={diceState.active} 
                onClose={() => setDiceState({ ...diceState, active: false })} 
                sides={diceState.sides} 
                count={diceState.count} 
            />
        </div>
    );
};

export default TrackerMode;


