import React, { useState, useEffect, useRef } from 'react';
import { XCircle, Undo, Crown, Clock, Menu, Heart, Beer, Swords, LogOut, CheckCircle, Lock, Zap, X, Dices, Settings, AlertTriangle, Skull, User, Plus, RotateCcw, Timer, Shield, Shuffle, Hand, Mic, Coffee, Crosshair, Snowflake, Flame, Bomb, Martini, Droplet, Hourglass, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

// --- STYLES & ANIMATIONS ---
const styles = `
body, html { background-color: #050505; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.tabular-nums { font-variant-numeric: tabular-nums; }

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }

@keyframes panic-mode {
  0% { box-shadow: inset 0 0 0 rgba(0,0,0,0); background-color: rgba(20,0,0,0); }
  10% { box-shadow: inset 0 0 50px rgba(255,0,0,0.3); }
  50% { box-shadow: inset 0 0 300px rgba(220,38,38,0.7); background-color: rgba(50,0,0,0.4); backdrop-filter: contrast(1.4) sepia(0.3) hue-rotate(-10deg); transform: scale(1.02); }
  90% { box-shadow: inset 0 0 50px rgba(255,0,0,0.3); }
  100% { box-shadow: inset 0 0 0 rgba(0,0,0,0); background-color: rgba(20,0,0,0); }
}
.animate-panic { animation: panic-mode 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.5); }
  50% { box-shadow: 0 0 80px rgba(220, 38, 38, 1); filter: brightness(1.2); }
}
.animate-pulse-red { animation: pulse-red 1.0s infinite; }

@keyframes heartbeat-violent {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); filter: brightness(1); }
  10% { transform: scale(1.15); box-shadow: 0 0 150px rgba(255,50,50,0.9); filter: brightness(1.6); border-color: #fff; } 
  25% { transform: scale(1); box-shadow: 0 0 40px rgba(255,50,50,0.4); filter: brightness(1); }
  40% { transform: scale(1.08); box-shadow: 0 0 80px rgba(255,50,50,0.7); filter: brightness(1.3); border-color: #ffcccc; }
  60% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
  100% { transform: scale(1); }
}
.animate-violent { animation: heartbeat-violent 0.8s infinite cubic-bezier(0.2, 0.8, 0.2, 1); }

/* TilfÃ¸j denne til din styles streng */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.11); }
}
.animate-heartbeat {
  animation: heartbeat 0.2s infinite ease-in-out;
}

@keyframes scanline {
    0% { background-position: 0% 0%; }
    100% { background-position: 0% 100%; }
}
.bg-scanline {
    background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 50%);
    background-size: 100% 4px;
}

@keyframes float-up-center {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    20% { transform: translate(-50%, -60%) scale(1.2); opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
}
.animate-float-up { animation: float-up-center 2.5s ease-out forwards; }

/* --- MAGICAL BUTTON STYLES --- */
@keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes glare-sweep {
  0% { transform: translateX(-300%) skewX(-25deg); opacity: 0; }
  25% { opacity: 1; } 
  95% { opacity: 0; } 
  100% { transform: translateX(300%) skewX(-25deg); opacity: 0; }
}
@keyframes click-shockwave {
  0% { transform: scale(0.8); opacity: 0.8; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  100% { transform: scale(1.5); opacity: 0; box-shadow: 0 0 0 50px rgba(255, 255, 255, 0); }
}

.magic-ring {
  background: conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.1) 20%, transparent 40%, rgba(255,255,255,0.1) 60%, transparent 80%);
  animation: spin-slow 10s linear infinite;
}
.magic-glare {
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 5%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 95%, transparent 100%);
  animation: glare-sweep 6s ease-in-out infinite;
}
.magic-click-effect:active::after {
  content: ''; position: absolute; inset: 0; border-radius: 9999px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 60%);
  animation: click-shockwave 0.4s ease-out; pointer-events: none;
}
#rotate-warning { display: none; }

/* Hvis skÃ¦rmen er landscape OG hÃ¸jden er under 600px (typisk mobil pÃ¥ siden), sÃ¥ aktiver lÃ¥s */
@media screen and (orientation: landscape) and (max-height: 600px) {
  #rotate-warning { display: flex !important; z-index: 9999; }
  #game-root { display: none !important; }
}



/* Hvis skÃ¦rmen er landscape OG hÃ¸jden er under 600px (typisk mobil pÃ¥ siden), sÃ¥ aktiver lÃ¥s */
@media screen and (orientation: landscape) and (max-height: 600px) {
  #rotate-warning { display: flex !important;
  z-index: 9999; }
  #game-root { display: none !important; }
}




/* --- ELEGANT CASINO SHUFFLE --- */
@keyframes fold-in {
    0% { transform: perspective(500px) rotateX(0deg) scale(1) translateY(0); opacity: 1; filter: blur(0); }
    100% { transform: perspective(500px) rotateX(90deg) scale(0.9) translateY(10px); opacity: 0; filter: blur(2px); }
}
/* HER ER RETTELSEN: backwards/both sikrer at de bliver holdt skjult under ventetiden */
.animate-fold-in { animation: fold-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both; }

@keyframes deal-out {
    0% { transform: perspective(500px) rotateX(-90deg) scale(0.8) translateY(-15px); opacity: 0; filter: blur(2px); }
    100% { transform: perspective(500px) rotateX(0deg) scale(1) translateY(0); opacity: 1; filter: blur(0); }
}
/* HER ER RETTELSEN: both sikrer at den ikke flasher inden faldet starter */
.animate-deal-out { animation: deal-out 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }


@keyframes elegant-spin {
    0% { transform: rotate(0deg) scale(1); box-shadow: inset 0 0 0 rgba(255,255,255,0); }
    50% { transform: rotate(180deg) scale(1.02); box-shadow: inset 0 0 40px rgba(255,255,255,0.3); }
    100% { transform: rotate(360deg) scale(1); box-shadow: inset 0 0 0 rgba(255,255,255,0); }
}
.animate-elegant-spin { animation: elegant-spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }




`; // <--- HER LUKKES STYLES-STRENGEN!





// --- COMPONENT: STEPPER (LEFT CONTROLS) ---
const Stepper = ({ label, value, onChange, min = 0, suffix = "", icon: Icon, color = "text-white" }) => {
    const [localValue, setLocalValue] = useState(value);
    const debounceTimer = useRef(null);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => { 
        if (!debounceTimer.current) setLocalValue(value); 
    }, [value]);

    const handleChange = (delta) => {
        setLocalValue(prev => {
            const newValue = Math.max(min, prev + delta);
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => { 
                onChange(newValue); 
                debounceTimer.current = null; 
            }, 600);
            return newValue;
        });
        if (navigator.vibrate) navigator.vibrate(5);
    };

    const startPress = (delta) => {
        handleChange(delta);
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                handleChange(delta);
            }, 30); 
        }, 400); 
    };

    const stopPress = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

  

    return (
        <div className="bg-stone-900/80 border border-white/5 p-3 rounded-none skew-x-[-10deg] flex items-center justify-between group hover:border-white/20 transition-all select-none">
            
            {/* VENSTRE SIDE: KNAPPER & VÃ†RDI */}
            <div className="flex items-center gap-3 skew-x-[10deg]">
                <button 
                    onPointerDown={() => startPress(-1)} 
                    onPointerUp={stopPress} 
                    onPointerLeave={stopPress}
                    onPointerCancel={stopPress}
                    className="w-10 h-10 bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 flex items-center justify-center font-bold transition-all active:scale-90 active:bg-stone-600 touch-pan-y"
                >
                    -
                </button>
                
                <span className={`font-mono font-bold text-lg w-12 text-center ${color}`}>{localValue}{suffix}</span>
                
                <button 
                    onPointerDown={() => startPress(1)} 
                    onPointerUp={stopPress} 
                    onPointerLeave={stopPress}
                    onPointerCancel={stopPress}
                    className="w-10 h-10 bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 flex items-center justify-center font-bold transition-all active:scale-90 active:bg-stone-600 touch-pan-y"
                >
                    +
                </button>
            </div>

            {/* HÃ˜JRE SIDE: TEKST & IKON */}
            <div className="flex items-center gap-2 skew-x-[10deg]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">{label}</span>
                {Icon && <Icon size={16} className={color} />}
            </div>
        </div>
    );
};


// --- COMPONENT: BUBBLE GRID (GHOST CLICK FIXED) ---
const NumberBubbleGrid = ({ isOpen, onClose, onSelect, onLongPress, max, title, colorClass, startFrom = 0 }) => {
    const pressTimer = useRef(null);
    const isLongPressHandled = useRef(false);

    const numbers = React.useMemo(() => {
        if (!isOpen) return [];
        return Array.from({ length: max - startFrom + 1 }, (_, i) => startFrom + i);
    }, [isOpen, max, startFrom]);

    if (!isOpen) return null;

    const handlePointerDown = (num) => {
        isLongPressHandled.current = false;
        pressTimer.current = setTimeout(() => {
            isLongPressHandled.current = true;
            if (navigator.vibrate) navigator.vibrate(50);
            if (onLongPress) onLongPress(num); 
        }, 600);
    };

    // HER ER FIXET: Vi tager eventet 'e' med ind
    const handlePointerUp = (e, num) => {
        if (e) {
            e.preventDefault();  // Stop browserens standard klik
            e.stopPropagation(); // Stop eventet fra at boble ned
        }
        
        if (pressTimer.current) clearTimeout(pressTimer.current);
        
        if (!isLongPressHandled.current) {
            if (navigator.vibrate) navigator.vibrate(5);
            onSelect(num);
        }
    };

    const handleCancel = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-scanline pointer-events-none opacity-20"></div>
            
            <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-6 text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] italic px-4 leading-tight shrink-0">
                {title}
            </h2>

            <div className="grid grid-cols-4 gap-4 w-full max-w-lg place-items-center overflow-y-auto p-4 hide-scrollbar overscroll-contain flex-grow min-h-0">
                {numbers.map((num) => (
                    <button 
                        key={num} 
                        onPointerDown={() => handlePointerDown(num)}
                        // Sender 'e' med videre her:
                        onPointerUp={(e) => handlePointerUp(e, num)}
                        onPointerLeave={handleCancel}
                        onPointerCancel={handleCancel}
                        className="relative w-16 h-16 flex items-center justify-center bg-stone-800/80 border border-white/10 text-2xl font-black text-white italic transition-transform duration-100 hover:scale-110 hover:border-white hover:z-10 active:scale-95 group touch-pan-y select-none will-change-transform" 
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}
                    >
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${colorClass}`}></div>
                        <span className="z-10">{num}</span>
                    </button>
                ))}
            </div>
            
            <button onClick={onClose} className="mt-6 px-10 py-4 shrink-0 bg-transparent border border-stone-600 text-stone-500 font-bold uppercase tracking-[0.2em] hover:text-white hover:border-white hover:bg-white/5 transition-all">
                Cancel Protocol
            </button>
        </div>
    );
};


// --- COMPONENT: DIRECT ROTARY KNOB (FUTURISTIC OVERLAY) ---
const DirectRotaryKnob = ({ value, onChange, onCommit, size = 160, icon: Icon = Heart, color = "text-red-500", ringColor = "border-stone-700" }) => {
    const wheelRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [isTouching, setIsTouching] = useState(false);
    const lastAngleRef = useRef(null);
    const accumRef = useRef(0);

    // --- FUTURISTIC GLOW LOGIC ---
    const isRed = color.includes('red');
    const overlayGlowStyle = isRed
        ? "border-red-500 shadow-[0_0_70px_rgba(239,68,68,0.6),inset_0_0_30px_rgba(239,68,68,0.3)]"
        : "border-purple-500 shadow-[0_0_70px_rgba(168,85,247,0.6),inset_0_0_30px_rgba(168,85,247,0.3)]";

    // --- DYNAMIC SIZE CALCULATION ---
    let dynamicScale = 1;
    if (isRed) {
        // LIFE: Bliver mindre tÃ¦t pÃ¥ 0. 
        // Ved 0 liv = 0.6x (lille). Ved 20 liv = 1.0x (normal). Max loft pÃ¥ 1.3x.
        dynamicScale = Math.min(1.3, 0.6 + (Math.max(0, value) * 0.02));
    } else {
        // DRUNK: Bliver stÃ¸rre tÃ¦t pÃ¥ 10.
        // FIX: Vi lÃ¥ser inputtet til max 10 i beregningen.
        // Alt over 10 (f.eks. 12, 15) behandles som 10 rent stÃ¸rrelsesmÃ¦ssigt.
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
            if (navigator.vibrate) navigator.vibrate([15, 15, 25]); // Skruet lidt op for vibrationen her
        }
        lastAngleRef.current = currentAngle;
    };

    const handlePointerUp = (e) => {
        e.target.releasePointerCapture(e.pointerId);
        lastAngleRef.current = null;
        accumRef.current = 0;
        setIsTouching(false);
        if (onCommit) onCommit();
    };

    return (
        <>
            {/* BIG CENTER OVERLAY (FUTURISTIC STYLE) */}
            {isTouching && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all"
                        style={{
                            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                        }}
                    ></div>
                    
                    {/* Y-AXIS ELEVATOR WRAPPER */}
                    {/* Vi skubber den op her i en separat div, så inline-scale ikke overskriver det */}
                    <div className="relative -translate-y-[10vh]">
                        {/* Den futuristiske ring med DYNAMISK SKALERING og KULSORT fyld */}
                        <div 
                            className={`relative w-[min(20rem,60vw)] h-[min(20rem,60vw)] rounded-full bg-black border-[3px] ${overlayGlowStyle} flex items-center justify-center transition-all duration-200 ease-out`}
                            style={{ transform: `scale(${dynamicScale})` }} 
                        >
                            <Icon className={`absolute opacity-20 ${color} w-2/3 h-2/3`} />
                            
                            <span className={`text-[min(10rem,25vw)] font-black font-mono ${color} drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10 tabular-nums leading-none tracking-tighter`}>
                                {value}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* SELVE HJULET (Lille version i bunden) */}
            <div 
                className="relative flex items-center justify-center select-none touch-none"
                style={{ width: size, height: size }}
            >
                {/* 1. DET ROTERENDE HJUL */}
                {/* Symmetrisk border-[4px] sikrer at det ikke "humper". 3D effekten laves via lys/skygge */}
                <div 
                    ref={wheelRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br from-stone-600 via-stone-800 to-stone-900 border-[4px] border-stone-800 touch-none shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_4px_8px_rgba(255,255,255,0.15),inset_0_-5px_15px_rgba(0,0,0,0.8)] active:brightness-95`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* Taktisk indre rille for ekstra detaljegrad */}
                    <div className="absolute inset-1 rounded-full border border-stone-900/50 shadow-[inset_0_0_10px_rgba(0,0,0,1)] pointer-events-none"></div>

                   {/* Indikator "Dimple" - Nu som et dybt boret hul med en lille lysende LED i bunden */}
                    {/* Vi tilføjer ${color} her, så den sætter tekstfarven til rød eller lilla */}
                    <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-stone-950 rounded-full shadow-[inset_0_3px_5px_rgba(0,0,0,1),0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center ${color}`}>
                        {/* bg-current sørger for, at baggrunden automatisk bliver rød eller lilla */}
                        <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] opacity-80"></div>
                    </div>
                </div>

                {/* 2. DET STATISKE CENTER (Tallet står stille) */}
                {/* Nedsunket center (inset-6) gør den ydre ring tykkere og skaber massiv dybde */}
                <div className="absolute inset-6 bg-gradient-to-br from-stone-950 to-black rounded-full flex items-center justify-center pointer-events-none border border-black shadow-[inset_0_10px_25px_rgba(0,0,0,1),0_2px_4px_rgba(255,255,255,0.05)]">
                    
                    {/* Fælles wrapper der tvinger optisk midte og løfter det hele lidt */}
                    <div className="flex flex-col items-center justify-center -translate-y-1.5">
                        {/* Ikonet har fået mb-1.5 for at skubbe det lidt længere op fra tallet */}
                        <Icon size={22} className={`${color} opacity-60 mb-1.5 drop-shadow-md`} fill="currentColor"/>
                        <span className="text-[2.5rem] font-black text-white font-mono leading-none tracking-tighter drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                            {value}
                        </span>
                    </div>
                  </div>
                </div>
        </>
    );
};









// --- COMPONENT: IPOD ROTARY KNOB ---
const RotaryKnob = ({ value, onChange, size = 220, label = "LIFE" }) => {
    const wheelRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    
    // Vi gemmer den sidste vinkel for at kunne regne forskellen (delta) ud
    const lastAngleRef = useRef(null);
    const accumRef = useRef(0); // Opsamler smÃ¥ bevÃ¦gelser indtil vi har et hel "step"

    // Matematikken: Beregn vinkel (grader) fra center til finger
    const getAngle = (e) => {
        if (!wheelRef.current) return 0;
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        // Math.atan2 giver os vinklen i radianer, vi laver den om til grader
        return Math.atan2(y, x) * (180 / Math.PI);
    };

    const handlePointerDown = (e) => {
        e.preventDefault(); // Stop scroll
        lastAngleRef.current = getAngle(e);
    };

    const handlePointerMove = (e) => {
        // Kun kÃ¸r hvis vi har en start-vinkel (altsÃ¥ fingeren er nede)
        if (lastAngleRef.current === null) return;
        e.preventDefault();

        const currentAngle = getAngle(e);
        
        // Beregn forskellen fra sidste frame
        let delta = currentAngle - lastAngleRef.current;

        // HÃ¥ndter overgangen mellem -180 og 180 grader (nÃ¥r man krydser kl. 9 positionen)
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        // Opdater visuel rotation
        setRotation(prev => prev + delta);
        
        // Opsaml bevÃ¦gelsen til logik
        accumRef.current += delta;

        // Hvor mange grader skal man dreje for at Ã¦ndre tallet med 1?
        // 15 grader fÃ¸les godt (hurtigt men prÃ¦cist)
        const stepSize = 15; 

        if (Math.abs(accumRef.current) >= stepSize) {
            const steps = Math.floor(Math.abs(accumRef.current) / stepSize);
            const direction = accumRef.current > 0 ? 1 : -1;
            
            // Opdater vÃ¦rdien
            onChange(value + (steps * direction));
            
            // Reset opsamler (men behold resten, sÃ¥ bevÃ¦gelsen fÃ¸les flydende)
            accumRef.current = accumRef.current % stepSize;

            // Click-wheel feel!
            if (navigator.vibrate) navigator.vibrate(5);
        }

        lastAngleRef.current = currentAngle;
    };

    const handlePointerUp = () => {
        lastAngleRef.current = null;
        accumRef.current = 0;
    };

    return (
        <div 
            className="relative flex items-center justify-center select-none touch-none"
            style={{ width: size, height: size }}
        >
            {/* BAGGRUNDS HJULET (Den der drejer visuelt) */}
            <div 
                ref={wheelRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="absolute inset-0 rounded-full bg-stone-800 border-4 border-stone-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] touch-none"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {/* En lille "dimple" sÃ¥ man kan se hjulet drejer */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-stone-500 rounded-full shadow-inner"></div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-stone-600/30 rounded-full"></div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-stone-600/30 rounded-full"></div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-stone-600/30 rounded-full"></div>
            </div>

            {/* DET STATISKE CENTER (Tallet stÃ¥r stille) */}
            <div className="absolute inset-0 m-12 bg-stone-900 rounded-full border border-stone-600 flex flex-col items-center justify-center shadow-inner pointer-events-none">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</span>
                <span className="text-5xl font-black text-white font-mono tracking-tighter">{value}</span>
            </div>
        </div>
    );
};

// --- COMPONENT: TACTICAL MODAL (REPLACES WINDOW.CONFIRM & PROMPT) ---
const TacticalModal = ({ isOpen, title, message, type = 'confirm', onConfirm, onCancel, confirmText = "CONFIRM", cancelText = "CANCEL", isDanger = false }) => {
    const [inputValue, setInputValue] = useState("");
    
    // Reset input nÃ¥r den Ã¥bner
    useEffect(() => { if (isOpen) setInputValue(""); }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={onCancel}>
            <div 
                className={`relative w-full max-w-sm bg-stone-900 border ${isDanger ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'border-stone-600 shadow-2xl'} p-6 rounded-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center gap-2">
                    {isDanger ? <Skull size={40} className="text-red-500 animate-pulse" /> : <Shield size={40} className="text-stone-400" />}
                    <h3 className={`text-2xl font-black uppercase tracking-widest ${isDanger ? 'text-red-500' : 'text-white'}`}>{title}</h3>
                    <p className="text-stone-400 font-bold text-xs uppercase tracking-wider leading-relaxed">{message}</p>
                </div>

                {type === 'prompt' && (
                    <input 
                        autoFocus
                        type="text" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="TYPE HERE..."
                        className="w-full bg-black/50 border border-stone-700 text-white text-center font-bold p-3 uppercase tracking-widest focus:outline-none focus:border-yellow-500 transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && onConfirm(inputValue)}
                    />
                )}

                <div className="grid grid-cols-2 gap-3 mt-2">
                    <button 
                        onClick={onCancel}
                        className="py-3 border border-stone-700 text-stone-500 font-bold uppercase tracking-widest hover:bg-stone-800 hover:text-white transition-colors rounded"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => type === 'prompt' ? onConfirm(inputValue) : onConfirm()}
                        className={`py-3 font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity rounded ${isDanger ? 'bg-red-600 text-white' : 'bg-white'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: DICE ROLLER (HD REMASTER) ---
const DiceRoller = ({ isOpen, onClose, result, results, sides, count, rollerName }) => {
    const [displayNum, setDisplayNum] = useState(1);
    const [isAnimating, setIsAnimating] = useState(true);
    const [canClose, setCanClose] = useState(false); 

    const resultRef = useRef(result);
    const sidesRef = useRef(sides);
    const countRef = useRef(count || 1);

    useEffect(() => { resultRef.current = result; }, [result]);
    useEffect(() => { sidesRef.current = sides; }, [sides]);
    useEffect(() => { countRef.current = count || 1; }, [count]);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setCanClose(false);
            
            const initialMax = (sidesRef.current * countRef.current);
            setDisplayNum(Math.floor(Math.random() * initialMax) + countRef.current);

            const closeTimer = setTimeout(() => setCanClose(true), 800);

            let steps = 0;
            const interval = setInterval(() => {
                const s = sidesRef.current;
                const c = countRef.current;
                
                const randomPreview = Math.floor(Math.random() * (s * c)) + c; 
                setDisplayNum(randomPreview);
                steps++;
                
                if (steps > 15 && resultRef.current !== null) {
                    clearInterval(interval);
                    setDisplayNum(resultRef.current);
                    setIsAnimating(false);
                    if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
                }
            }, 50); // Lidt hurtigere (50ms) for mere flydende animation

            return () => {
                clearInterval(interval);
                clearTimeout(closeTimer);
            };
        }
    }, [isOpen]); 

    if (!isOpen) return null;

    // --- AGGRESSIVE SIZING (HD LOOK) ---
    const getFontSizeClass = (val) => {
        const str = String(val);
        if (str.length >= 3) return 'text-8xl';      // 100+ (Stort)
        if (str.length >= 2) return 'text-[10rem]';  // 10-99 (KÃ¦mpe)
        return 'text-[12rem]';                       // 1-9 (Massivt)
    };

    return (
        <div 
            className="fixed inset-0 z-[160] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200" 
            onClick={(e) => { e.stopPropagation(); if (canClose) onClose(); }}
        >
            <div className="relative w-full max-w-sm h-[32rem] bg-stone-900 border border-stone-700 flex flex-col items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden p-8 rounded-xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-2 h-6 flex items-center shrink-0">
                    {(countRef.current || 1) > 1 ? `ROLLING ${countRef.current}x D${sides}` : `ROLLING D${sides}...`}
                </div>
                
                {/* MAIN NUMBER DISPLAY - Flex Grow tager al pladsen */}
                <div className="flex-grow flex items-center justify-center w-full overflow-visible relative z-10">
                    <div className={`
                        ${getFontSizeClass(displayNum)} 
                        font-black text-white tabular-nums tracking-tighter leading-none transition-all duration-100
                        ${isAnimating 
                            ? 'opacity-80 scale-95' // Ingen blur, bare let scale/opacity
                            : 'opacity-100 scale-110 drop-shadow-[0_0_50px_rgba(59,130,246,0.6)] text-white'
                        }
                    `}>
                        {displayNum}
                    </div>
                </div>

                {/* RESULTS LIST (Ligger fast i bunden) */}
                <div className="w-full h-16 flex items-center justify-center shrink-0 mb-4 relative z-20">
                    {!isAnimating && (results || []).length > 1 ? (
                        <div className="flex flex-wrap justify-center gap-2 animate-in slide-in-from-bottom duration-500">
                            {(results || []).map((r, i) => (
                                <div key={i} className="w-10 h-10 flex items-center justify-center bg-stone-800 border border-stone-600 rounded text-stone-300 font-bold font-mono text-lg shadow-inner">
                                    {r}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Placeholder der sikrer layoutet ikke hopper
                        <div className="h-10"></div>
                    )}
                </div>

                <div className="text-stone-600 text-[10px] font-bold uppercase tracking-widest mb-4 shrink-0">Rolled by {rollerName}</div>
                
                <button 
                    onClick={onClose} 
                    disabled={isAnimating}
                    className={`
                        w-full px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-lg border shrink-0
                        ${isAnimating 
                            ? 'bg-stone-800/50 border-stone-800 text-stone-600 cursor-not-allowed opacity-50' 
                            : 'bg-blue-900/30 border-blue-500/50 text-blue-200 hover:bg-blue-500 hover:text-white cursor-pointer shadow-lg active:scale-95'
                        }
                    `}
                >
                    {isAnimating ? 'ROLLING...' : 'CLOSE'}
                </button>
            </div>
        </div>
    );
};



const ChessMode = ({ players, updatePlayer, syncState, playSound: parentPlaySound, onExit, remoteStressState }) => {
     
    const [pendingShuffle, setPendingShuffle] = useState(false);
  
    const dragJustFinishedRef = useRef(false); // Holder styr pÃ¥, om vi lige har "givet slip"
  

  
    // STACK STATE:
    const stackState = remoteStressState?.stackState || 'none';
    const stackOwnerIdx = remoteStressState?.stackOwnerIdx ?? -1;
    
    // NYT: Hent listen af folk der er "Forced GIMME"
    const stackHolders = remoteStressState?.stackHolders || []; 

      
    // NYT: Hent tur-tallet
    const turnCount = remoteStressState?.turnCount || 0;
  
  
  // --- MODAL STATE ---
    const [modalConfig, setModalConfig] = useState({ 
        isOpen: false, 
        type: 'confirm', // 'confirm' | 'prompt'
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        isDanger: false 
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
 
  // --- DRUNK WHEEL STATE ---
    const [optimisticDrunk, setOptimisticDrunk] = useState(null);
    const pendingDrunkRef = useRef(null);
  
  // --- STATE SETUP ---
  const [isBigButtonPressed, setIsBigButtonPressed] = useState(false);
  
  
 // --- UNDO HOLD STATE & DEMOCRACY ---
    const undoPressTimer = useRef(null);
    const [isUndoPressing, setIsUndoPressing] = useState(false);
    const [showUndoRejected, setShowUndoRejected] = useState(false); 
    const [showUndoAuthorized, setShowUndoAuthorized] = useState(false);



  
    // THE WATCHER: Fyrer tidsmaskinen af ØJEBLIKKELIGT når en anden trykker Confirm
    useEffect(() => {
        if (isUndoPressing && remoteStressState?.undoConfirmations?.length > 0) {
            // Godkendt! Stop 10-sekunders timeren
            if (undoPressTimer.current) clearTimeout(undoPressTimer.current);
            setIsUndoPressing(false);

            // Tung vibration og grøn succes-bar
            if (navigator.vibrate) handleVibrate([300, 50, 300]); 
            setShowUndoAuthorized(true);
            setTimeout(() => setShowUndoAuthorized(false), 2000);

            // Kør tidsmaskinen!
            handleUndo(); 
        }
    }, [isUndoPressing, remoteStressState?.undoConfirmations]);

    // --- UNDO HOLD HANDLERS ---
    const handleUndoPointerDown = (e) => {
        if (!(remoteStressState?.undoHistory?.length > 0)) return;
        
        setIsUndoPressing(true);
        if (navigator.vibrate) handleVibrate(15); 

        // Send alarm til bordet
        commitAction({ 
            globalUndoPressing: true, 
            undoInitiator: seatIdx,
            undoConfirmations: [], 
            _isSilentSave: true 
        });

        // 10 SEKUNDERS TIMEOUT (Hvis ingen reagerer)
        undoPressTimer.current = setTimeout(() => {
            setIsUndoPressing(false);
            
            // Afvist på tid!
            playSound('low');
            if (navigator.vibrate) handleVibrate([50, 100, 50]);
            
            setShowUndoRejected(true);
            setTimeout(() => setShowUndoRejected(false), 2000);

            commitAction({ 
                globalUndoPressing: false, 
                undoInitiator: -1, 
                undoConfirmations: [], 
                _isSilentSave: true 
            });
        }, 10000); // Sat op til 10 sekunder
    };

    const handleUndoPointerCancel = () => {
        if (undoPressTimer.current) clearTimeout(undoPressTimer.current);
        setIsUndoPressing(false);
        
        // Afblæs alarmen, hvis fingeren slippes før nogen godkender
        commitAction({ 
            globalUndoPressing: false, 
            undoInitiator: -1, 
            undoConfirmations: [], 
            _isSilentSave: true 
        });
    };

    
  

// Sikrer at baggrundskameraet altid har adgang til nyeste server-data
    const cameraStateRef = useRef(remoteStressState);
    useEffect(() => {
        cameraStateRef.current = remoteStressState;
    }, [remoteStressState]);


  
  
    // Gemmer tallet visuelt mens du drejer
    const [optimisticLife, setOptimisticLife] = useState(null); 
    // Gemmer tallet sikkert til beregning (overlever re-renders)
    const pendingLifeRef = useRef(null);



  
  // --- BOOT SAFETY ---
    // Forhindrer fejl-straffe lige nÃ¥r siden loader
    const isBooted = useRef(false);
    useEffect(() => {
        const timer = setTimeout(() => { isBooted.current = true; }, 1500);
        return () => clearTimeout(timer);
    }, []);
  
const hasPlayedVictorySound = useRef(false);
  // --- SHAKE MEMORY ---
const lastUsedDiceSides = useRef(6); // Default til D6
const lastShakeTime = useRef(0);     // For at undgÃƒÂ¥ dobbelt-rul

// --- NY REF: Tracking af lokal modtagelse ---
    const localReceiptTime = useRef(Date.now());
    

  
  // --- SETUP ---
    const containerClass = "fixed inset-y-0 left-0 right-0 mx-auto z-50 bg-[#080808] text-gray-200 overflow-hidden flex flex-col h-dvh w-full max-w-md font-sans touch-manipulation select-none sm:border-x sm:border-stone-800 sm:shadow-[0_0_150px_rgba(0,0,0,0.8)] translate-x-0";
    const [dragOffset, setDragOffset] = useState(0);
   
    // --- LOCAL CHILL MODE (PERSISTENT) ---
    const [isChillMode, setIsChillMode] = useState(() => localStorage.getItem('stress_chill_mode') === 'true');
    const toggleChillMode = () => {
        const newState = !isChillMode;
        setIsChillMode(newState);
        localStorage.setItem('stress_chill_mode', newState);
    };
  
    // --- MUTE & VIBRATION CONTROL ---
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('chess_mute') === 'true');

    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        localStorage.setItem('chess_mute', newState);
    };

    // VIGTIGT: Brug denne i stedet for navigator.vibrate() i hele filen!
    const handleVibrate = (pattern) => {
        if (isMuted) return; // Hvis muted -> INGEN vibration
        if (navigator.vibrate) navigator.vibrate(pattern);
    };

    const playSound = (key) => { 
        if (isMuted) return; // Hvis muted -> INGEN lyd
        if (parentPlaySound) parentPlaySound(key); 
    };

    const [deviceId] = useState(() => {
        let id = localStorage.getItem('stress_device_id');
        if (!id) { id = crypto.randomUUID(); localStorage.setItem('stress_device_id', id); }
        return id;
    });
    const [localSeat, setLocalSeat] = useState(() => localStorage.getItem('stress_seat'));
    const seatIdx = localSeat !== null ? parseInt(localSeat) : -1;
    const isMe = seatIdx !== -1;
    const me = isMe ? players?.[seatIdx] : null; 

    // --- STATE ---
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const [isGearOpen, setIsGearOpen] = useState(false); 

  // Lyt efter Browser Back / Swipe
    useEffect(() => {
        const handlePopState = () => {
            // Hvis URL'en ikke lÃ¦ngere slutter pÃ¥ #gearmenu (fordi man swipede tilbage), sÃ¥ luk
            if (window.location.hash !== '#gearmenu') {
                setIsGearOpen(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        
        // Safety: Hvis man reloader siden mens #gearmenu stÃ¥r i URL'en, sÃ¥ start Ã¥ben
        if (window.location.hash === '#gearmenu') {
            setIsGearOpen(true);
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Brug denne nÃ¥r du Ã¥bner (pÃ¥ tandhjul-ikonet)
    const openGear = () => {
        playSound('click');
        
        // 1. BEVAR DIN PAUSE LOGIK:
        // Hvis spillet kÃ¸rer, skal vi pause det og beregne buffer
        if (isGameStarted && !isPaused) { 
            const now = Date.now(); 
            const elapsed = now - lastActionAt; 
            const used = Math.min(elapsed, (activeConfig.turnDelaySec || 0) * 1000); 
            commitAction({ isPaused: true, usedDelayBuffer: used }); 
        }

        // 2. NY SWIPE LOGIK:
        // TilfÃ¸j #gearmenu til URL'en sÃ¥ "Back" knappen virker
        window.history.pushState(null, '', '#gearmenu');
        setIsGearOpen(true);
    };

    // Brug denne nÃ¥r du lukker (pÃ¥ "Close Protocol" knappen)
    const closeGear = () => {
        playSound('click'); // Husk lyden
        // Tjek om vi er i "menu-mode" i URL'en
        if (window.location.hash === '#gearmenu') {
            window.history.back(); // Dette trigger useEffecten, som lukker menuen
        } else {
            setIsGearOpen(false); // Fallback hvis URL'en er ren
        }
    };
    
    // RETTELSE 1: Vi starter med 0. 
    // Hvis vi starter med Date.now(), tror browseren at spillet genstarter ved hver refresh.
    const [localLastActionAt, setLocalLastActionAt] = useState(0); 
    
    const [, setTick] = useState(0); 
    const [selectorType, setSelectorType] = useState(null); 
    const [multiRollCount, setMultiRollCount] = useState(null); // <--- NY STATE
    const [bonusFloat, setBonusFloat] = useState(null); 
    const [deathCheckReason, setDeathCheckReason] = useState(null); 
    const [victoryDismissed, setVictoryDismissed] = useState(false);
    const [joinName, setJoinName] = useState("");

    // --- NYE STATES TIL ROULETTE ---
    const [isRouletteSpinning, setIsRouletteSpinning] = useState(false); // KÃƒÂ¸rer animationen?
    const [rouletteHighlightIdx, setRouletteHighlightIdx] = useState(null); // Hvem peger den pÃƒÂ¥ lige nu?

    // ... dine andre refs
    const seatLongPressTimer = useRef(null);
    const isSeatKickHandled = useRef(false);
  
    const prevLt = useRef(me?.lt);
    const prevDrunk = useRef(me?.drunk);
    const actionLock = useRef(false);
    const longPressTimer = useRef(null);
    const isLongPressHandled = useRef(false);
    const prevActivePlayerRef = useRef(remoteStressState?.activePlayerIdx ?? 0); 




       // --- SYNCED DATA MERGE (FIXED) ---
    // Vi bruger kun lokal tid midlertidigt. Ellers stoler vi pÃƒÆ’Ã‚Â¥ remote.
    // Hvis remote er tom, bruger vi 0 (sÃƒÆ’Ã‚Â¥ vi ikke gÃƒÆ’Ã‚Â¦tter og laver fejl).
    const lastActionAt = localLastActionAt > 0 
        ? localLastActionAt 
        : (remoteStressState?.lastActionAt || 0);

    
    // Opdater den hver gang lastActionAt Ã¦ndrer sig (ny tur/pause)
    useEffect(() => {
        localReceiptTime.current = Date.now();
    }, [lastActionAt]);
  
    const priorityPlayerIdx = remoteStressState?.priorityPlayerIdx ?? 0;
   
    const activePlayerIdx = remoteStressState?.activePlayerIdx ?? 0;
    const isPaused = remoteStressState?.isPaused ?? true; 
    const isGameStarted = remoteStressState?.isGameStarted ?? false;
    const diceState = remoteStressState?.dice || { active: false, sides: 6, result: null, roller: null };
    const penaltyPending = remoteStressState?.penaltyPending || false;
    const usedDelayBuffer = remoteStressState?.usedDelayBuffer || 0;
    
    // TARGET & STACK LOGIC
    const targetingPlayerIdx = remoteStressState?.targetingPlayerIdx ?? -1; 
    const pendingTargets = remoteStressState?.pendingAttacks || []; 
    const defenders = remoteStressState?.defenders || [];

  // HER ER DEN MANGLENDE VARIABEL:
    const isDamagePhase = remoteStressState?.isDamagePhase || false;
    


    const isMyTurn = seatIdx === activePlayerIdx;
    const hasPriority = seatIdx === priorityPlayerIdx;
    const drunkLevel = me?.drunk || 0;
    
    

    // --- GLOBAL ENTROPY VARIABLES ---
    const globalPenaltyPending = remoteStressState?.globalPenaltyPending || false;
    const globalPenaltyPaidBy = remoteStressState?.globalPenaltyPaidBy || []; // Liste af indexes der har betalt
    // Vi gemmer den globale tid i sekunder. Default er config-vÃƒÆ’Ã‚Â¦rdien * 60
    const globalTimeBank = remoteStressState?.globalTimeBank; 

    // --- CONFIG PERSISTENCE FIX ---
    // 1. PrÃ¸v at hente backup fra telefonen, hvis serveren er langsom
    const [localConfigBackup] = useState(() => {
        try {
            const saved = localStorage.getItem('chess_config_backup');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

   // Hent Breather state
    const isBreatherActive = remoteStressState?.isBreatherActive || false;
    const breatherEndsAt = remoteStressState?.breatherEndsAt || 0;

    // Opdateret Config med 'breatherSec' default 0
    const activeConfig = remoteStressState?.config || localConfigBackup || { 
        startTimeMin: 10, bonusSec: 0, penaltyIntervalSec: 60, penaltyLife: 2, penaltyDrinks: 1, turnDelaySec: 0,
        globalTimerStartMin: 0,
        breatherSec: 0 // <--- NY: Default slÃ¥et fra
    };

    const blurAmount = activeConfig.disableBlur ? 0 : (drunkLevel * 0.7);

    // Opdateret Global Timer Logic: Stop uret hvis vi holder Breather
    const activeSurvivorsCount = players ? players.filter(p => p.is_seated && !p.name.startsWith("Open Seat") && !p.is_dead).length : 0;
    const isGlobalTimerRunning = isGameStarted && 
                                 activeConfig.globalTimerStartMin > 0 && 
                                 (isPaused || stackState === 'frozen') &&
                                 activeSurvivorsCount > 1 &&
                                 !isBreatherActive; // <--- NY: Breather pauser Global Time

    




    const calculateGlobalTime = () => {
        if (activeConfig.globalTimerStartMin <= 0) return 0;

        // --- PRE-GAME SYNC ---
        // Tvinger Debt-uret til at vise config-tiden i lobbyen
        if (!isGameStarted) return activeConfig.globalTimerStartMin * 60;
        // ---------------------

        const currentBank = globalTimeBank ?? (activeConfig.globalTimerStartMin * 60);

        if (!isGlobalTimerRunning) return Math.floor(currentBank);

        const now = Date.now();
        const safeLastAction = (lastActionAt && !isNaN(lastActionAt)) ? lastActionAt : now;
        const elapsedSec = (now - safeLastAction) / 1000;
        return Math.floor(currentBank - elapsedSec);
    };
  






  
  
    

  
    // SNIPPET: Beregn Nemesis tidligt, sÃƒÆ’Ã‚Â¥ funktionerne kan bruge den
    let nemesisIdx = -1;
    if (isMe && me && me.grudges) {
        let maxGrudgeScore = 0;
        Object.entries(me.grudges).forEach(([pIdx, stats]) => {
            const idx = parseInt(pIdx);
            const targetPlayer = players[idx];
            
            // FIX: Vi tjekker om spilleren eksisterer, har et navn, IKKE er Open Seat, og IKKE er dÃƒÆ’Ã‚Â¸d
            if (targetPlayer && targetPlayer.name && !targetPlayer.name.startsWith("Open Seat") && !targetPlayer.is_dead) {
                const score = (stats.damage || 0) + (stats.drinks || 0);
                if (score > maxGrudgeScore) {
                    maxGrudgeScore = score;
                    nemesisIdx = idx;
                }
            }
        });
    }

    




  
    // --- AUTO-UPDATE SEAT ---
    useEffect(() => {
        if (!players) return;
        const myActualIndex = players.findIndex(p => p.seated_by === deviceId);
        const currentSeat = localSeat !== null ? parseInt(localSeat) : -1;
        if (myActualIndex !== -1 && myActualIndex !== currentSeat) {
            setLocalSeat(String(myActualIndex));
            localStorage.setItem('stress_seat', myActualIndex);
        }
        if (currentSeat !== -1) {
             const seatOwner = players[currentSeat]?.seated_by;
             if (seatOwner !== deviceId && myActualIndex === -1) {
                 setLocalSeat(null);
                 localStorage.removeItem('stress_seat');
             }
        }
    }, [players, deviceId, localSeat]);

     // --- SAFETY VALVE: ACTION LOCK ---
    // Hvis knappen hÃƒÆ’Ã‚Â¦nger fast i "pressed" state i mere end 2 sekunder, resetter vi lÃƒÆ’Ã‚Â¥sen.
    useEffect(() => {
        const safetyInterval = setInterval(() => {
            if (actionLock.current) {
                const now = Date.now();
                // Hvis der er gÃƒÆ’Ã‚Â¥et mere end 2 sekunder siden sidste handling, men lÃƒÆ’Ã‚Â¥sen stadig er pÃƒÆ’Ã‚Â¥
                if (now - localLastActionAt > 2000) {
                    console.log("Auto-releasing stuck action lock");
                    actionLock.current = false;
                }
            }
        }, 1000);
        return () => clearInterval(safetyInterval);
    }, [localLastActionAt]);




    // --- FAILSAFE: AUTO-RESOLVE ENTROPY (ULTIMATE FIX) ---
    useEffect(() => {
        // Vi kÃ¸rer kun dette tjek, hvis vi er midt i en straf-runde
        if (!globalPenaltyPending || !isGameStarted) return;

        const activeSurvivors = players.filter(p => 
            p.is_seated && !p.name.startsWith("Open Seat") && !p.is_dead
        );

        // Tjek 1: Er alle dÃ¸de? (Double KO) -> Luk straffen, sÃ¥ Victory kan vise "No Survivors"
        const isEveryoneDead = activeSurvivors.length === 0;

        // Tjek 2: Er der kun Ã©n tilbage, og er han gÃ¦ldfri? -> Luk straffen, sÃ¥ Victory kan kÃ¥re vinderen
        const isLastManSafe = activeSurvivors.length === 1 && (activeSurvivors[0].global_debt || 0) <= 0;

        if (isEveryoneDead || isLastManSafe) {
            console.log("Entropy Failsafe: Conditions met. Ending Penalty Phase.");
            
            // Vi tvinger straffen vÃ¦k. 
            // Dette fjerner Penalty Overlayet og opfylder betingelsen (!globalPenaltyPending) for Victory Screen.
            commitAction({ 
                globalPenaltyPending: false,
                isPaused: true,
                // Vi opdaterer timestamp for at sikre at alle klienter opfanger Ã¦ndringen
                lastActionAt: Date.now() 
            });
        }
    }, [globalPenaltyPending, players, isGameStarted]);





  

      
  // --- WAKE LOCK (GREEDY: ACTIVE IN LOBBY) ---
    useEffect(() => {
        let wakeLock = null;

        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await navigator.wakeLock.request('screen');
                    console.log("Wake Lock Active");
                } catch (err) {
                    console.log("Wake Lock rejected (waiting for interaction):", err);
                }
            }
        };

        // 1. PrÃ¸v med det samme (virker sjÃ¦ldent uden interaktion, men vi prÃ¸ver)
        requestWakeLock();

        // 2. Lyt efter synlighed (hvis man tabber ud og ind igen)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') requestWakeLock();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 3. THE FIX: Lyt efter ALLE klik/touch for at tvinge Wake Lock igennem
        // (Dette sikrer at skÃ¦rmen holdes tÃ¦ndt, sÃ¥ snart man rÃ¸rer skÃ¦rmen i lobbyen)
        const forceEnable = () => {
            requestWakeLock();
            // NÃ¥r vi har prÃ¸vet Ã©n gang ved touch, behÃ¸ver vi ikke spamme det, 
            // men Wake Lock kan "falde af", sÃ¥ vi lader den bare kÃ¸re.
        };
        window.addEventListener('click', forceEnable);
        window.addEventListener('touchstart', forceEnable);

        return () => {
            if (wakeLock) wakeLock.release();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('click', forceEnable);
            window.removeEventListener('touchstart', forceEnable);
        };
    }, []); // Tomt array = KÃ¸rer altid, ikke kun nÃ¥r spillet starter


  
// --- SYNC FIX (UPDATED) ---
    useEffect(() => {
        if (optimisticLife !== null && me?.lt === optimisticLife) {
            setOptimisticLife(null);
        }
        if (optimisticDrunk !== null && me?.drunk === optimisticDrunk) {
            setOptimisticDrunk(null);
        }
    }, [me?.lt, me?.drunk, optimisticLife, optimisticDrunk]);


   // --- DEATH CHECK (Modified) ---
    useEffect(() => {
        if (!me || me.is_dead) return;
        
        // FIX: Do not trigger manual death check during Entropy/Global Penalty. 
        // We let handleGlobalPay decide who dies at the end.
        if (globalPenaltyPending) return; 

        const ltChanged = me.lt !== prevLt.current;
        const drunkChanged = me.drunk !== prevDrunk.current;
        if (me.lt <= 0 && deathCheckReason !== 'life' && ltChanged) setDeathCheckReason('life');
        else if (me.drunk >= 10 && deathCheckReason !== 'drunk' && drunkChanged) setDeathCheckReason('drunk');
        prevLt.current = me.lt;
        prevDrunk.current = me.drunk;
    }, [me?.lt, me?.drunk, me?.is_dead, deathCheckReason, globalPenaltyPending]); // Add dependency


    // --- AUTO VICTORY / GAME OVER REFEREE ---
    useEffect(() => {
        // 1. KÃ¸r kun hvis spillet er i gang (eller lige slut)
        if (!isGameStarted || (remoteStressState?.turnCount || 0) === 0) {
            hasPlayedVictorySound.current = false;
            return;
        }

        // 2. VIGTIGT: Vent til gÃ¦ldsboksen er VÃ†K. 
        // Vi dÃ¸mmer ikke vinderen, fÃ¸r regnskabet er gjort op.
        if (globalPenaltyPending) return;

        const survivors = players.filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open Seat"));
        
        // 3. Tjek for slut-tilstand (1 eller 0 tilbage)
        if (survivors.length <= 1) {
            
            // Hvis vi ikke allerede har spillet lyden...
            if (!hasPlayedVictorySound.current && !victoryDismissed) {
                
                // SCENARIE A: NO SURVIVORS (Alle dÃ¸de)
                if (survivors.length === 0) {
                    console.log("Referee: NO SURVIVORS. Playing Fail Sound.");
                    playSound('low'); 
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                }
                
                // SCENARIE B: VI HAR EN VINDER
                else {
                    const winner = survivors[0];
                    // Er JEG vinderen?
                    const amITheWinner = winner && players[seatIdx] && winner.name === players[seatIdx].name;

                    if (amITheWinner) {
                        console.log("Referee: I WON! Playing Victory Sound.");
                        playSound('win'); 
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300]);
                    } else {
                        console.log("Referee: Someone else won. Silence.");
                    }
                }
                
                // LÃ¥s lyden sÃ¥ den ikke kÃ¸rer igen
                hasPlayedVictorySound.current = true; 
            }
        } else {
            // Hvis der pludselig er flere i live (f.eks. ved genoplivning/reset), sÃ¥ reset lÃ¥sen
            hasPlayedVictorySound.current = false;
        }
    }, [players, isGameStarted, remoteStressState?.turnCount, victoryDismissed, seatIdx, globalPenaltyPending]); // <--- Husk globalPenaltyPending i dependency array!



  

    // --- SHAKE TO ROLL (OR ROULETTE START) ---
    useEffect(() => {
      const handleMotion = (event) => {
            // FIX: Vi fjerner 'diceState.active' herfra. Nu kan du ryste, 
            // selvom en anden persons terninger ruller over skÃ¦rmen!
            if (penaltyPending || isRouletteSpinning) return;

            const current = event.accelerationIncludingGravity;
            // ... (resten af acceleration checket er uÃ¦ndret indtil commitAction)
            if (!current) return;
            const { x, y, z } = current;
            const acceleration = Math.sqrt(x*x + y*y + z*z);
            const sensitivity = 40; 

            if (acceleration > sensitivity) {
                const now = Date.now();
                if (now - lastShakeTime.current > 1500) {
                    lastShakeTime.current = now;
                    
                    // Udskift scenarie 0 og 1 ned til [1541]
                    // --- SCENARIE 0: LOBBY ROULETTE (WHO STARTS?) ---
                    if (!isGameStarted) {
                        const validPlayers = players.map((p,i) => ({...p, idx:i})).filter(p => p.is_seated && !p.name.startsWith("Open Seat"));
                        if (validPlayers.length >= 2) {
                            const winnerIdx = validPlayers[Math.floor(Math.random() * validPlayers.length)].idx;
                            commitAction({
                                activePlayerIdx: winnerIdx,
                                priorityPlayerIdx: winnerIdx,
                                globalAnim: { id: Date.now(), type: 'ROULETTE', candidates: validPlayers.map(p=>p.idx), winnerIdx: winnerIdx }
                            });
                        }
                    }
                    
                    // --- SCENARIE 1: ATTACK ROULETTE ---
                    else if (pendingTargets.length > 0) {
                        const winnerIdx = pendingTargets[Math.floor(Math.random() * pendingTargets.length)];
                        commitAction({
                            defenders: [winnerIdx],
                            priorityPlayerIdx: -1,
                            pendingAttacks: [],
                            targetingPlayerIdx: -1,
                            isPaused: false,
                            usedDelayBuffer: 0,
                            globalAnim: { id: Date.now(), type: 'ROULETTE', candidates: pendingTargets, winnerIdx: winnerIdx }
                        });
                    }
                    
                    // --- SCENARIE 2: STANDARD DICE ROLL ---
                    else {
                        const sides = lastUsedDiceSides.current;
                        const result = Math.floor(Math.random() * sides) + 1;
                        playSound('dice_shake');
                        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                        
                        // FIX: TilfÃ¸j rollId: Date.now()
                        commitAction({ 
                            isPaused: true, 
                            usedDelayBuffer: Math.min(now - lastActionAt, (activeConfig.turnDelaySec || 0) * 1000), 
                            dice: { 
                                active: true, 
                                sides: sides, 
                                result: result, 
                                roller: me?.name || 'Unknown',
                                rollId: Date.now() 
                            } 
                        });
                    }
                }
            }
        };
        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [isGameStarted, isPaused, diceState.active, penaltyPending, me?.name, lastActionAt, activeConfig, pendingTargets, isRouletteSpinning, players]); // Husk 'players' i deps
    
  
// --- POST-PENALTY VICTORY CHECK (THE AUTHORITARIAN REFEREE) ---
    useEffect(() => {
        // 1. GrundlÃ¦ggende tjek: Er vi overhovedet i gang?
        if (!isGameStarted) return;

        const survivors = players.filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open Seat"));
        
        // 2. VICTORY CONDITION: Kun 1 (eller 0) tilbage, og gÃ¦ldsboksen er vÃ¦k
        if (survivors.length <= 1 && !globalPenaltyPending) {
            
            // Hvis spilleren manuelt har lukket skÃ¦rmen, skal vi ikke gÃ¸re mere
            if (victoryDismissed) return;

            // Vent 500ms for at lade animationer/lyde fra dÃ¸dsfaldet kÃ¸re fÃ¦rdig
            const timer = setTimeout(() => {
                // Dobbelttjek status (i tilfÃ¦lde af "Race Condition")
                const currentSurvivors = players.filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open Seat"));
                
                if (currentSurvivors.length <= 1) {
                    
                    // --- A. LYD (KÃ¸r kun Ã©n gang) ---
                    if (!hasPlayedVictorySound.current) {
                        console.log("Referee: VICTORY! Playing Sound.");
                        playSound('win');
                        hasPlayedVictorySound.current = true;
                    }

                    // --- B. STATE ENFORCEMENT (LOOP BREAKER) ---
                    // Vi tvinger kun en opdatering, hvis spillet IKKE er i den korrekte slut-tilstand.
                    // Korrekt slut-tilstand er: Pauset OG Ingen Penalty Boks.
                    
                    // Hvis spillet IKKE er pauset, ELLER hvis penaltyPending stadig spÃ¸ger:
                    if (!isPaused || penaltyPending) {
                        console.log("Referee: Enforcing Victory State.");
                        commitAction({ 
                            isPaused: true,           // Stop tiden
                            penaltyPending: false,    // Fjern evt. smÃ¥ straffe
                            globalPenaltyPending: false // Fjern evt. store straffe
                        });
                    }
                    // Hvis isPaused ALLEREDE er true, gÃ¸r vi INTET. 
                    // Det stopper loopet, men Render-logikken (nedenfor) vil stadig vise skÃ¦rmen, 
                    // fordi 'survivors.length <= 1'.
                }
            }, 1000); 
            
            return () => clearTimeout(timer);
        }
    }, [globalPenaltyPending, isGameStarted, players, isPaused, victoryDismissed, penaltyPending]);






  
// --- UNIVERSAL ANIMATION ENGINE (GLOBAL SYNC) ---
    const [localAnimId, setLocalAnimId] = useState(null);
    const globalAnim = remoteStressState?.globalAnim || null;
    const [shufflePhase, setShufflePhase] = useState('idle'); // 'idle', 'suck', 'swirl', 'drop'

    // --- BULLETPROOF SNAPSHOT LOGIK ---
    const prevPlayersRef = useRef(players);
    const [frozenSnapshot, setFrozenSnapshot] = useState(null);

    // Opdater kun vores historik, nÃ¥r der er HEEEELT ro pÃ¥
    useEffect(() => {
        if (shufflePhase === 'idle' && globalAnim?.id === localAnimId) {
            prevPlayersRef.current = players;
        }
    }, [players, shufflePhase, globalAnim?.id, localAnimId]);

    // FAILSAFE: Hvis noget hÃ¦nger, rydder vi op
    useEffect(() => {
        if (shufflePhase !== 'idle') {
            const safetyTimer = setTimeout(() => {
                setShufflePhase('idle');
                setFrozenSnapshot(null);
            }, 8000);
            return () => clearTimeout(safetyTimer);
        }
    }, [shufflePhase]);



      useEffect(() => {
        if (globalAnim && globalAnim.id !== localAnimId) {
            setLocalAnimId(globalAnim.id);

            // --- FIX: GHOST ANIMATION KILLER ---
            // Hvis animationen blev oprettet for mere end 5 sekunder siden (5000 ms),
            // er det et levn fra fÃ¸r vi refreshede siden. Afbryd!
            const isStaleAnimation = (Date.now() - globalAnim.id) > 5000;
            if (isStaleAnimation) {
                console.log("Skipping old animation on load");
                return; 
            }

            if (globalAnim.type === 'ROULETTE') {
                // ... Din eksisterende roulette logic (behold den prÃ¦cis som den er) ...
              

    
                // ... Din eksisterende roulette logic (behold den prÃ¦cis som den er) ...
                setIsRouletteSpinning(true);
                playSound('dice_shake');
                if (navigator.vibrate) handleVibrate(50);

                let steps = 0;
                let pointer = 0;
                const candidates = globalAnim.candidates || [];
                if (candidates.length === 0) return;

                const interval = setInterval(() => {
                    setRouletteHighlightIdx(candidates[pointer]);
                    pointer = (pointer + 1) % candidates.length;
                    steps++;
                    
                    if (steps >= 20) {
                        clearInterval(interval);
                        setRouletteHighlightIdx(globalAnim.winnerIdx);
                        setIsRouletteSpinning(false);
                        
                        setTimeout(() => {
                            playSound('horse');
                            if (navigator.vibrate) handleVibrate([50, 100, 50]);
                            setRouletteHighlightIdx(null); 
                        }, 500);
                    }
                }, 100);
            }

            // THE ELEGANT CASINO SHUFFLE
            else if (globalAnim.type === 'SHUFFLE') {
                setFrozenSnapshot(prevPlayersRef.current); // FRYS DET GAMLE BOARD!
                setShufflePhase('suck');
                playSound('click'); 
                if (navigator.vibrate) handleVibrate([30, 50, 30]);

                // Suck tager op til 1.2s at fuldfÃ¸re pga stagger delay
                setTimeout(() => {
                    setShufflePhase('swirl');
                    playSound('dice_shake'); 
                }, 1200); 

                // Swirl spinner i 1.2s
                setTimeout(() => {
                    setFrozenSnapshot(null); // FRIGIV BOARDET! (Nu tegner React de nye spillere skjult)
                    setShufflePhase('drop');
                    
                    if (navigator.vibrate) handleVibrate([20, 30, 20, 50]);
                    
                    // Drop tager op til 2.4s at lande helt
                    setTimeout(() => setShufflePhase('idle'), 2400); 
                }, 2400); // 1200 + 1200
            }
        }
    }, [globalAnim, localAnimId]);





  
        
   // --- TURN RECEIVED (SOUND & BONUS) ---
    // Vi bruger en ny ref til at huske, om spillet var i gang i forrige frame
    const prevGameStartedRef = useRef(isGameStarted);

    useEffect(() => {
        // Er det min tur lige nu?
        const isMyTurnNow = isMe && activePlayerIdx === seatIdx;
        
        if (isMyTurnNow) {
            // SCENARIE 1: Spillet er LIGE startet
            const gameJustStarted = isGameStarted && !prevGameStartedRef.current;
            
            // SCENARIE 2: Turen skiftede lige til mig
            const turnJustChanged = isGameStarted && prevActivePlayerRef.current !== seatIdx;

            // FIX: Vi spiller KUN lyd/bonus, hvis vi IKKE er i Breather-mode
            if ((gameJustStarted || turnJustChanged) && !isBreatherActive) {
                
                // 1. SPIL LYD
                playSound('bell'); 
                if (navigator.vibrate) handleVibrate([80, 80, 80]); 

                // 2. VIS BONUS ANIMATION
               if (activeConfig.bonusSec > 0 && !isChillMode) {
                    setBonusFloat(activeConfig.bonusSec);
                    
                    const timer = setTimeout(() => setBonusFloat(null), 2500); 
                    return () => clearTimeout(timer);
                }
            }
        }
        
        // Opdater refs til nÃ¦ste render
        prevActivePlayerRef.current = activePlayerIdx;
        prevGameStartedRef.current = isGameStarted;
        
    }, [activePlayerIdx, isMe, isGameStarted, activeConfig.bonusSec, seatIdx, isBreatherActive]); // <--- VIGTIGT: isBreatherActive tilfÃ¸jet her

  

 // --- DEFENDER SHOCK VIBRATION (IMPERIAL MARCH DEBUG) ---
    const wasDefendingRef = useRef(false);

    useEffect(() => {
        const amIDefending = defenders.includes(seatIdx);

        // Debugging: Se om logikken overhovedet trigger
        if (amIDefending && !wasDefendingRef.current) {
            console.log("VIBRATION TRIGGERED: Defender status changed!");
            
            if (isGameStarted && !isPaused) {
                console.log("GAME IS LIVE - ATTEMPTING VIBRATE");
                
                // Tjek om browseren overhovedet understÃ¸tter vibration
                if (navigator.vibrate) {
                    // Star Wars Imperial March (Lidt kortere version)
                    const success = navigator.vibrate([
                        50, 100, 50, 100, 600
                    ]);
                    console.log("Vibrate command sent. Success?", success);
                } else {
                    console.error("Navigator.vibrate is NOT supported on this device.");
                }
            } else {
                console.log("Vibration skipped: Game paused or not started");
            }
        }

        wasDefendingRef.current = amIDefending;
    }, [defenders, seatIdx, isGameStarted, isPaused]);
  




// --- THE HIVE-MIND BACKGROUND CAMERA (20 SECONDS) ---
    const [cameraTick, setCameraTick] = useState(0);

    // Det stumme ur der tæller op i baggrunden for ALLE
    useEffect(() => {
        if (!isGameStarted || isPaused) return;
        // Kører lynhurtigt hvert 2. sekund for at tjekke, om nogen skal tage et billede
        const interval = setInterval(() => setCameraTick(t => t + 1), 2000);
        return () => clearInterval(interval);
    }, [isGameStarted, isPaused]);

    // Fotografen
    useEffect(() => {
        if (!isGameStarted || isPaused || penaltyPending || globalPenaltyPending || isBreatherActive) return;

        const now = Date.now();
        const lastSnapTime = remoteStressState?.lastSnapshotAt || 0;
        const timeSinceLastSnap = now - lastSnapTime;

        // Er der gået under 60 sekunder? Så gør vi intet.
        if (timeSinceLastSnap < 60000) return;

        // 1. Find ud af, om JEG er den, der sveder lige nu (Hosten)
        let amITheHost = false;
        if (stackState === 'open') amITheHost = isMe && seatIdx === stackOwnerIdx;
        else if (defenders.length > 0) amITheHost = isMe && seatIdx === defenders[0];
        else amITheHost = isMe && seatIdx === priorityPlayerIdx;

        // HIVE-MIND SIKKERHEDSNETTET:
        // Hvis hosten har minimeret appen og skærmen er sort, tager the hive-mind over. 
        // Hvis der er gået 63 sekunder, og intet er sket, tager en vågen medspiller billedet!
        if (!amITheHost && timeSinceLastSnap < 63000) return;

        // 2. Aflæs de RIGTIGE levende ure direkte (ingen gætterier)
        const livePlayerTimes = players.map((p, i) => {
            const pCalc = calculateTimeForPlayer(i);
            
            // Udregn præcis hvor meget warmup der er tilbage i dette splitsekund
            let exactWarmup = 0;
            const currentWarmup = p.warmup_remaining !== undefined ? p.warmup_remaining : activeConfig.turnDelaySec;
            const elapsedSec = (now - lastActionAt) / 1000;
            
            const isBurning = (defenders.includes(i)) || 
                              (stackState === 'open' && (stackHolders.includes(i) || (i === stackOwnerIdx && stackHolders.length === 0))) ||
                              (stackState === 'none' && i === priorityPlayerIdx && defenders.length === 0);

            if (isBurning) exactWarmup = Math.max(0, currentWarmup - elapsedSec);
            else exactWarmup = currentWarmup; 

            return {
                saved_time: pCalc, 
                warmup_remaining: exactWarmup, 
                turns_played: p.turns_played || 0,
                last_warmup_turn: p.last_warmup_turn || -1,
                turn_start_lt: p.turn_start_lt, // <--- HUSK START LIV (TIL GRUDGES)
                turn_start_drunk: p.turn_start_drunk // <--- HUSK START PROMILLE
            };
        });

        // 3. Frys brættet og læg det i historikken
        const snapshot = {
            activePlayerIdx, priorityPlayerIdx, isPaused,
            defenders: [...defenders], pendingAttacks: [...pendingTargets],
            targetingPlayerIdx, stackState, stackOwnerIdx,
            stackHolders: [...stackHolders], turnCount: remoteStressState?.turnCount || 0,
            globalTimeBank: calculateGlobalTime(), playerTimes: livePlayerTimes
        };

        const currentHistory = remoteStressState?.undoHistory || [];
        const newHistory = [snapshot, ...currentHistory].slice(0, 3); // Max 60 sekunders historik

        commitAction({ 
            undoHistory: newHistory, 
            lastSnapshotAt: now, // <--- STEMPLET! Fortæller the hive-mind, at billedet er taget
            _isSilentSave: true 
        });

    }, [cameraTick]); // Lytter på 2-sekunders uret





  



  
       // --- ENGINE & TIMER ---
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
            
            // 1. INDIVIDUAL TIMERS
            // RETTELSE: Vi tilfÃ¸jer "&& isBooted.current"
            // Nu kan engine ALDRIG udlÃ¸se en straf i det sekund siden loader/opdaterer
            if (isBooted.current && isGameStarted && !isPaused && !penaltyPending && lastActionAt > 0) {
                
                if (defenders.length > 0) {
                     if (defenders.includes(seatIdx)) {
                         if (calculateTimeForPlayer(seatIdx) <= 0) { playSound('low'); commitAction({ isPaused: true, penaltyPending: true, priorityPlayerIdx: seatIdx }); }
                     }
                } 
                else if (stackState === 'open' && stackOwnerIdx === seatIdx) {
                    if (calculateTimeForPlayer(seatIdx) <= 0) { playSound('low'); commitAction({ isPaused: true, penaltyPending: true, priorityPlayerIdx: seatIdx }); }
                }
                else if (stackState === 'none' && seatIdx === priorityPlayerIdx) {
                    if (calculateTimeForPlayer(seatIdx) <= 0) { playSound('low'); commitAction({ isPaused: true, penaltyPending: true }); }
                }
            }
          

  
    
            // 2. GLOBAL TIMER CHECK (DEBT ACCUMULATION MODE)
            if (isGlobalTimerRunning) {
                const timeLeft = calculateGlobalTime();
                
                if (timeLeft <= 0) {
                    const isPrimaryResponsible = isMe && (seatIdx === activePlayerIdx || seatIdx === priorityPlayerIdx);
                    // Failover logic
                    const isFailover = isMe && timeLeft <= -2;

                    if (isPrimaryResponsible || isFailover) {
                        playSound('low'); 
                        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

                        // OPRETTER GÃƒÆ’Ã¢â‚¬ LD TIL ALLE LEVENDE SPILLERE
                        const debtPlayers = players.map(p => {
                            if (p.is_seated && !p.name.startsWith("Open Seat") && !p.is_dead) {
                                // LÃƒÆ’Ã‚Â¦gger 1 til eksisterende gÃƒÆ’Ã‚Â¦ld (eller starter pÃƒÆ’Ã‚Â¥ 1)
                                return { ...p, global_debt: (p.global_debt || 0) + 1 };
                            }
                            return p;
                        });

                        commitAction({ 
                            globalPenaltyPending: true, 
                            isPaused: true, 
                            globalTimeBank: activeConfig.penaltyIntervalSec 
                        }, debtPlayers); // Sender de opdaterede spillere med gÃƒÆ’Ã‚Â¦ld
                    }
                }
            }

        }, 100);
        return () => clearInterval(interval);
    }, [isGameStarted, isPaused, penaltyPending, seatIdx, priorityPlayerIdx, defenders, stackState, stackOwnerIdx, isGlobalTimerRunning, isMe, activePlayerIdx, globalPenaltyPending, activeConfig, players]);

      // --- FIX: STOP STUCK LOCAL TIME ---
    // NÃƒÆ’Ã‚Â¥r serveren sender en opdatering (uanset hvem der trykkede),
    // skal vi nulstille vores lokale optimistiske tid, sÃƒÆ’Ã‚Â¥ vi er synkrone.
    useEffect(() => {
        if (remoteStressState?.lastActionAt) {
             setLocalLastActionAt(0);
        }
    }, [remoteStressState?.lastActionAt]);

  

  // --- HELPER: BURN LOGIC (DEFENSIVE & ROBUST) ---
    const calculateBurnState = (p, elapsedMS) => {
        // 1. Fallbacks (hvis data er undefined/NaN)
        const defaultWarmup = activeConfig?.turnDelaySec || 0;
        const currentWarmup = (typeof p.warmup_remaining === 'number') ? p.warmup_remaining : defaultWarmup;
        const currentSaved = (typeof p.saved_time === 'number') ? p.saved_time : (activeConfig?.startTimeMin || 20) * 60;

        // 2. Sikkerhed: Vi konverterer alt til sekunder og sikrer os mod minus
        const elapsedSec = Math.max(0, (elapsedMS || 0) / 1000);

        // 3. Logikken
        if (elapsedSec <= currentWarmup) {
            // Vi er stadig i warm-up
            return {
                newTime: currentSaved,
                newWarmup: Math.max(0, currentWarmup - elapsedSec)
            };
        } else {
            // Warm-up er slut, vi brÃ¦nder tid
            const burnAmount = elapsedSec - currentWarmup;
            return {
                newTime: Math.max(0, currentSaved - burnAmount), // Kan aldrig gÃ¥ under 0
                newWarmup: 0
            };
        }
    };


    const calculateTimeForPlayer = (playerIdx) => {
        const p = players[playerIdx];
        if (!p) return 0;
        
        const startSec = (activeConfig?.startTimeMin || 20) * 60;
        
        // --- PRE-GAME SYNC ---
        // Tvinger ALLE ure til at vise config-tiden, mens vi er i lobbyen.
        if (!isGameStarted) return startSec;
        // ---------------------

        let bankTime = p.saved_time;
        if (typeof bankTime !== 'number' || isNaN(bankTime)) bankTime = startSec;

        if (!lastActionAt || lastActionAt === 0) return Math.floor(bankTime);
        if (isPaused || !isGameStarted || penaltyPending) return Math.floor(bankTime);
        if (isBreatherActive) return Math.floor(bankTime);
        if (stackState === 'frozen') return Math.floor(bankTime);

        // ... MATH ...
        const now = Date.now();
        let elapsedMS = now - lastActionAt;
        if (elapsedMS > 86400000) elapsedMS = 0;
        
        const isObservingOthers = players[seatIdx]?.seated_by !== p.seated_by;
        if (isObservingOthers) {
            const localElapsedMS = now - localReceiptTime.current;
            const gracePeriod = (activeConfig.turnDelaySec + 5) * 1000; 
            if (elapsedMS < gracePeriod) {
                elapsedMS = Math.max(0, Math.min(elapsedMS, localElapsedMS));
            }
        }
        
        let isBurning = false;
        if (defenders.includes(playerIdx)) {
            isBurning = true;
        }
        else if (stackState === 'open') {
            if (stackHolders.includes(playerIdx)) {
                isBurning = true;
            }
            else if (playerIdx === stackOwnerIdx && stackHolders.length === 0) {
                isBurning = true;
            }
        } 
        else if (stackState === 'none') {
            if (playerIdx === priorityPlayerIdx && defenders.length === 0) isBurning = true;
        }

        if (isBurning) {
            const { newTime } = calculateBurnState(p, elapsedMS);
            return isNaN(newTime) ? Math.floor(bankTime) : Math.floor(newTime);
        }

        return Math.floor(bankTime);
    };
  
    
  
    
  
    
  

    const isInsideDelayBuffer = () => {
       // STRENG REGEL: Hvis Breather er aktiv, eller uret er 0 -> INGEN WARMUP.
        if (!isGameStarted || isPaused || activeConfig.turnDelaySec <= 0 || isBreatherActive || lastActionAt === 0) return false;
        
        // Tjek den relevante spiller
        let targetIdx = priorityPlayerIdx;
        if (stackState === 'open') targetIdx = stackOwnerIdx;
        if (defenders.length > 0) targetIdx = defenders[0]; // Tjek fÃ¸rste defender

        const p = players[targetIdx];
        if (!p) return false;

        // Hvis vi har warm-up tilbage i databasen
        const currentWarmup = p.warmup_remaining !== undefined ? p.warmup_remaining : activeConfig.turnDelaySec;
        
        // Vi er i buffer, hvis vi ikke har opbrugt den endnu. 
        // Vi skal dog trÃ¦kke den tid fra, der er gÃ¥et siden lastActionAt, for at se om vi LIGE NU er i buffer.
        const elapsedSec = (Date.now() - lastActionAt) / 1000;
        
        return elapsedSec < currentWarmup;
    };
    const formatTime = (sec) => {
        const val = Math.floor(sec);
        const m = Math.floor(Math.abs(val) / 60);
        const s = Math.abs(val) % 60;
        return `${val < 0 ? "-" : ""}${m}:${s < 10 ? '0' : ''}${s}`;
    };

   const commitAction = (updates = {}, newPlayers = null) => {
        const now = Date.now();
        
        // 1. Hent den absolut nyeste state direkte fra serveren
        let currentServerPlayers = remoteStressState?.players || players;



// --- 1. THE REAL SNAPSHOT CAMERA ---
        // Vi tager kun et billede, hvis spillets gang reelt ændrer sig (ikke bare time-ticks eller undo)
        const isSignificant = Object.keys(updates).some(k => 
            ['activePlayerIdx', 'priorityPlayerIdx', 'stackState', 'defenders', 'isPaused', 'isBreatherActive'].includes(k)
        );

        if (isSignificant && !updates._isUndo && !updates.penaltyPending && !updates.globalPenaltyPending) {
            // Gem præcis hvordan urene står for alle
            const timeSnapshot = currentServerPlayers.map(p => ({
                saved_time: p.saved_time,
                warmup_remaining: p.warmup_remaining,
                turns_played: p.turns_played,
                last_warmup_turn: p.last_warmup_turn
            }));

            // Tag et hard-copy af turen
            const snapshot = {
                activePlayerIdx: remoteStressState?.activePlayerIdx ?? activePlayerIdx,
                priorityPlayerIdx: remoteStressState?.priorityPlayerIdx ?? priorityPlayerIdx,
                isPaused: remoteStressState?.isPaused ?? isPaused,
                defenders: remoteStressState?.defenders ?? defenders,
                pendingAttacks: remoteStressState?.pendingAttacks ?? pendingTargets,
                targetingPlayerIdx: remoteStressState?.targetingPlayerIdx ?? targetingPlayerIdx,
                stackState: remoteStressState?.stackState ?? stackState,
                stackOwnerIdx: remoteStressState?.stackOwnerIdx ?? stackOwnerIdx,
                stackHolders: remoteStressState?.stackHolders ?? stackHolders,
                turnCount: remoteStressState?.turnCount || 0,
                isBreatherActive: remoteStressState?.isBreatherActive || false,
                globalTimeBank: remoteStressState?.globalTimeBank ?? calculateGlobalTime(),
                playerTimes: timeSnapshot
            };

            const currentHistory = remoteStressState?.undoHistory || [];
            updates.undoHistory = [snapshot, ...currentHistory].slice(0, 6); // Max 6 skridt tilbage

            // NY SIKKERHED 
            // Nulstil baggrundskameraets timer! 
            // Så går der mindst 60 sekunder fra turskiftet, før the Hive-Mind gemmer et midtvejs-billede.
            updates.lastSnapshotAt = now;
        }
        // --- END OF SNAPSHOT ---



     
        let updatedPlayers;

        // 2. HYBRID STATE MERGE: Er det et array (legacy) eller et objekt (delta)?
        if (Array.isArray(newPlayers)) {
            // Gammel logik: Overskriv alt (bruges af Shuffle, Reset, etc.)
            updatedPlayers = [...newPlayers];
        } else if (newPlayers !== null && typeof newPlayers === 'object') {
            // Delta logik: Flet kun specifikke Ã¦ndringer ind i den friske server-state
            updatedPlayers = [...currentServerPlayers];
            Object.keys(newPlayers).forEach(idxStr => {
                const idx = parseInt(idxStr);
                if (updatedPlayers[idx]) {
                    updatedPlayers[idx] = { ...updatedPlayers[idx], ...newPlayers[idxStr] };
                }
            });
        } else {
            // Ingen Ã¦ndringer i spillere, behold de nuvÃ¦rende
            updatedPlayers = [...currentServerPlayers];
        }

    
     
     const isValidTime = lastActionAt && lastActionAt > 0;
        
        // THE FIX: Undo og baggrunds-snapshots må IKKE brænde tid!
        const shouldBurn = isGameStarted && !isPaused && !penaltyPending && stackState !== 'frozen' && isValidTime && !updates._isUndo && !updates._isSilentSave;

        // --- STEP 1: AFREGN TID (BURN) ---
        if (shouldBurn) {
            let elapsedMS = now - lastActionAt;

            // Sanity Check
            if (elapsedMS > 86400000) elapsedMS = 0;

            const burnForPlayer = (idx) => {
                if (!updatedPlayers[idx]) return;
                const { newTime, newWarmup } = calculateBurnState(updatedPlayers[idx], elapsedMS);
                updatedPlayers[idx] = {
                    ...updatedPlayers[idx],
                    saved_time: newTime,
                    warmup_remaining: newWarmup
                };
            };

             // ... inde i commitAction under "STEP 1: AFREGN TID (BURN)" ...

            // RETTELSE: NY PRIORITERING HER
            
            // 1. Defenders (HÃ¸jest prioritet)
            if (defenders.length > 0) {
                defenders.forEach(idx => burnForPlayer(idx));
            } 
            
            // 2. Stack Holders (Forced GIMME)
            else if (stackState === 'open' && stackHolders && stackHolders.length > 0) {
                stackHolders.forEach(idx => burnForPlayer(idx));
            }
            
            // 3. Stack Owner (Kun hvis han er alene om det)
            else if (stackState === 'open' && stackOwnerIdx !== -1) {
                burnForPlayer(stackOwnerIdx);
            }
            
            // 4. Active Player / Priority (Normal tur)
            else if (stackState === 'none' && activePlayerIdx !== -1 && priorityPlayerIdx !== -1) {
                burnForPlayer(priorityPlayerIdx);
            }
            
            // ... (resten af commitAction er uÃ¦ndret) ...
            
        }


  // --- SNAPSHOT TIL UNDO-HISTORIK ---
        // Vi tager et præcist billede af tiden, LIGE EFTER den er brændt, men FØR turen skifter.
        const timeSnapshot = updatedPlayers.map((p, i) => ({ 
            saved_time: p.saved_time, 
            warmup_remaining: p.warmup_remaining, 
            // FIX: Vi trækker de gamle counters fra serveren, så vi ikke lækker fremtiden ind i fortiden!
            turns_played: currentServerPlayers[i]?.turns_played || 0, 
            last_warmup_turn: currentServerPlayers[i]?.last_warmup_turn || -1
        }));

        const globalTimeSnapshot = calculateGlobalTime();
        const currentTurnCount = remoteStressState?.turnCount || 0;

        // NYT: OPDATER SNAPSHOT MED BRÆNDT TID
        if (updates.undoHistory && updates.undoHistory.length > 0 && !updates._isSilentSave && !updates._isUndo) {
            updates.undoHistory[0].playerTimes = timeSnapshot;
            updates.undoHistory[0].globalTimeBank = globalTimeSnapshot;
        }

        // --- STEP 2: REFILL WARM-UP (UÆNDRET) ---

        // --- STEP 2: REFILL WARM-UP (UÆNDRET) ---
        const nextActiveIdx = updates.activePlayerIdx !== undefined ? updates.activePlayerIdx : activePlayerIdx;
        const nextStackOwner = updates.stackOwnerIdx !== undefined ? updates.stackOwnerIdx : stackOwnerIdx;
        const currentTurn = updates.turnCount !== undefined ? updates.turnCount : (remoteStressState?.turnCount || 0);

        // THE FIX: Hvis vi spoler i tiden, må maskinrummet IKKE dele frisk warmup ud!
        if (!updates._isUndo && !updates._isSilentSave) {
            
            // A. Active Player Change
            const activePlayerChanged = updates.activePlayerIdx !== undefined && updates.activePlayerIdx !== activePlayerIdx;
            if (activePlayerChanged && updatedPlayers[nextActiveIdx]) {
                updatedPlayers[nextActiveIdx] = { 
                    ...updatedPlayers[nextActiveIdx], 
                    warmup_remaining: activeConfig.turnDelaySec,
                    last_warmup_turn: currentTurn 
                };
            }

            // B. Stack Owner Change
            const stackOwnerChanged = updates.stackOwnerIdx !== undefined && updates.stackOwnerIdx !== stackOwnerIdx;
            if (stackOwnerChanged && nextStackOwner !== -1 && updatedPlayers[nextStackOwner]) {
                 const p = updatedPlayers[nextStackOwner];
                 if (p.last_warmup_turn !== currentTurn) {
                     updatedPlayers[nextStackOwner] = { 
                         ...p, 
                         warmup_remaining: activeConfig.turnDelaySec,
                         last_warmup_turn: currentTurn 
                     };
                 }
            }

            // C. Defenders
            if (updates.defenders && updates.defenders.length > 0) {
                updates.defenders.forEach(defIdx => {
                    const p = updatedPlayers[defIdx];
                    if (p && p.last_warmup_turn !== currentTurn) {
                        updatedPlayers[defIdx] = {
                            ...p,
                            warmup_remaining: activeConfig.turnDelaySec,
                            last_warmup_turn: currentTurn
                        };
                    }
                });
            }
        }

       // --- STEP 3: SYNC (UÆNDRET) ---
        if (isGlobalTimerRunning && updates.globalTimeBank === undefined) {
            updates.globalTimeBank = calculateGlobalTime();
        }

        // Nulstil kun vores lokale sync-ur, hvis det er en rigtig handling fra en spiller
        if (!updates._isSilentSave && !updates._isUndo) {
            setLocalLastActionAt(now);
        }

        syncState(updatedPlayers, 0, false, { type: '-', value: '-' }, null, null, {
            ...remoteStressState, 
            players: updatedPlayers, 
            isGameStarted: updates.isGameStarted !== undefined ? updates.isGameStarted : isGameStarted,
            isPaused: updates.isPaused ?? isPaused,
            activePlayerIdx: nextActiveIdx,
            priorityPlayerIdx: updates.priorityPlayerIdx !== undefined ? updates.priorityPlayerIdx : priorityPlayerIdx,
            // BEVAR serverens ur intakt ved snapshots og Undo
            lastActionAt: (updates._isSilentSave || updates._isUndo) ? (remoteStressState?.lastActionAt || now) : (updates.lastActionAt ?? now), 
            
            config: activeConfig, 
            dice: updates.dice ?? diceState,
            penaltyPending: updates.penaltyPending ?? penaltyPending, 
            pendingAttacks: updates.pendingAttacks ?? pendingTargets, 
            isDamagePhase: updates.isDamagePhase !== undefined ? updates.isDamagePhase : isDamagePhase,
            targetingPlayerIdx: updates.targetingPlayerIdx !== undefined ? updates.targetingPlayerIdx : targetingPlayerIdx,
            defenders: updates.defenders !== undefined ? updates.defenders : defenders,
            stackState: updates.stackState !== undefined ? updates.stackState : stackState,
            stackOwnerIdx: nextStackOwner,
            stackHolders: updates.stackHolders !== undefined ? updates.stackHolders : stackHolders,
            usedDelayBuffer: 0,
            ...updates
        });
        setTimeout(() => { actionLock.current = false; }, 300);
    };


                

    const addGrudge = (victimIdx, perpetratorIdx, type, amount, currentPlayers) => {
        if (victimIdx === perpetratorIdx || perpetratorIdx === -1 || !currentPlayers[victimIdx]) return currentPlayers;
        const playersCopy = [...currentPlayers];
        const victim = { ...playersCopy[victimIdx] };
        victim.grudges = { ...(victim.grudges || {}) };
        const currentStats = victim.grudges[perpetratorIdx] || { damage: 0, drinks: 0 };
        const newStats = { ...currentStats };
        if (type === 'damage') newStats.damage += amount;
        if (type === 'drinks') newStats.drinks += amount;
        victim.grudges[perpetratorIdx] = newStats;
        playersCopy[victimIdx] = victim;
        return playersCopy;
    };

      // --- NY LOGIK: REGNESKABETS TIME ---
    const resolveTurnGrudges = (currentPlayers, activeIdx) => {
        let updated = [...currentPlayers];
        
        // 1. GÃ¸r regnebrÃ¦ttet op
        updated.forEach((p, vIdx) => {
            if (!p.is_seated || p.name.startsWith("Open Seat")) return;

            // Hvad havde vi da turen startede? (Fallback til nuvÃ¦rende hvis data mangler)
            const startLt = p.turn_start_lt !== undefined ? p.turn_start_lt : p.lt;
            const startDrunk = p.turn_start_drunk !== undefined ? p.turn_start_drunk : p.drunk;

            // Beregn netto forskel (Kun hvis det er blevet vÃ¦rre)
            const dmg = Math.max(0, startLt - p.lt); 
            const drk = Math.max(0, p.drunk - startDrunk);

            // Synderen er den Aktive Spiller (medmindre man skader sig selv)
            if (activeIdx !== -1 && activeIdx !== vIdx && (dmg > 0 || drk > 0)) {
                 const victim = updated[vIdx];
                 const newGrudges = { ...(victim.grudges || {}) };
                 const currentStats = newGrudges[activeIdx] || { damage: 0, drinks: 0 };
                 
                 newGrudges[activeIdx] = {
                     damage: currentStats.damage + dmg,
                     drinks: currentStats.drinks + drk
                 };
                 
                 updated[vIdx] = { ...victim, grudges: newGrudges };
            }
        });

        // 2. Tag nyt snapshot til NÃ†STE tur
        updated = updated.map(p => ({
            ...p,
            turn_start_lt: p.lt,
            turn_start_drunk: p.drunk
        }));

        return updated;
    };
  

    const updateConfig = (key, val) => {
        // FIX: Hent seneste config direkte fra server-staten, 
        // sÃ¥ vi ikke smadrer modstanderens Ã¦ndring med vores forÃ¦ldede lokale cache.
        const latestConfig = remoteStressState?.config || activeConfig;
        const newConfig = { ...latestConfig, [key]: val };
        
        localStorage.setItem('chess_config_backup', JSON.stringify(newConfig));
        commitAction({ config: newConfig });
    };

 // --- DRUNK HANDLERS ---
    const handleLocalDrunkChange = (delta) => {
        const currentBase = pendingDrunkRef.current !== null 
            ? pendingDrunkRef.current 
            : (optimisticDrunk !== null ? optimisticDrunk : (me?.drunk || 0));
            
        // Man kan ikke have negativ promille, men der er intet loft (fÃ¸r dÃ¸den rammer)
        const newVal = Math.max(0, currentBase + delta);

        pendingDrunkRef.current = newVal;
        setOptimisticDrunk(newVal);
    };

      const handleDrunkCommit = () => {
        if (pendingDrunkRef.current === null) return;
        const finalVal = pendingDrunkRef.current;
        
        if (seatIdx !== -1) {
             // Ingen is_dead tjek her heller. Bare opdater promillen.
            commitAction({ lastActionAt: Date.now() }, { [seatIdx]: { drunk: finalVal } });
        }
        pendingDrunkRef.current = null;
    };


  
    
   // --- DIRECT WHEEL HANDLERS (VISUAL ONLY) ---
    const handleLocalLifeChange = (delta) => {
        // Start med at finde ud af, hvad tallet er LIGE NU (enten fra ref, optimistic eller rigtigt liv)
        const currentBase = pendingLifeRef.current !== null 
            ? pendingLifeRef.current 
            : (optimisticLife !== null ? optimisticLife : (me?.lt || 0));
            
        const newVal = currentBase + delta;

        // 1. Gem i Ref (Sikkerhedsboksen)
        pendingLifeRef.current = newVal;
        
        // 2. Opdater skÃ¦rmen (sÃ¥ du kan se tallet skifte)
        setOptimisticLife(newVal);
    };

  

    const handleLifeCommit = () => {
        if (pendingLifeRef.current === null) return;
        const finalVal = pendingLifeRef.current;
        
        if (seatIdx !== -1) {
            // Vi opdaterer KUN tallet via vores nye delta-system.
            // NÃ¥r serveren svarer, popper "ARE YOU DEAD" modalen automatisk!
            commitAction({ lastActionAt: Date.now() }, { [seatIdx]: { lt: finalVal } });
        }
        pendingLifeRef.current = null;
    };
    

    const handleKickPlayer = (targetIndex) => {
        const p = players[targetIndex];
        if (!p || !p.is_seated || p.name.startsWith("Open Seat")) return;

        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'KICK PLAYER',
            message: `Execute Order 66 on ${p.name}? Data will be wiped.`,
            isDanger: true,
            onConfirm: () => {
                const updatedPlayers = [...players];
                updatedPlayers[targetIndex] = {
                    ...updatedPlayers[targetIndex],
                    is_seated: false,
                    seated_by: null,
                    name: `Open Seat ${targetIndex + 1}`,
                    lt: 20, 
                    drunk: 0, 
                    is_dead: false, 
                    grudges: {}, 
                    global_debt: 0, 
                    turns_played: 0,
                    saved_time: activeConfig.startTimeMin * 60
                };

                let updates = { isPaused: isPaused };

                if (activePlayerIdx === targetIndex || priorityPlayerIdx === targetIndex) {
                    let nextIdx = (targetIndex + 1) % players.length;
                    let loops = 0;
                    while ((!updatedPlayers[nextIdx].is_seated || updatedPlayers[nextIdx].name.startsWith("Open Seat")) && loops < players.length) {
                        nextIdx = (nextIdx + 1) % players.length;
                        loops++;
                    }
                    updates.activePlayerIdx = nextIdx;
                    updates.priorityPlayerIdx = nextIdx;
                    updates.isPaused = true; 
                }

              
              // ... (inde i handleKickPlayer, efter updates objektet er lavet) ...

                if (targetingPlayerIdx === targetIndex) updates.targetingPlayerIdx = -1;
                
                // NYT: Opdateret Stack Logic ved Kick
                if (stackOwnerIdx === targetIndex) { 
                    // Hvis ejeren kickes: Luk stacken og frigiv alle holders
                    updates.stackState = 'none'; 
                    updates.stackOwnerIdx = -1; 
                    updates.stackHolders = []; 
                } else {
                    // Hvis en holder kickes: Fjern kun ham fra listen
                    // Vi bruger updates.stackHolders hvis den findes, ellers den nuvÃ¦rende liste
                    const currentHolders = updates.stackHolders || stackHolders;
                    if (currentHolders.includes(targetIndex)) {
                        updates.stackHolders = currentHolders.filter(h => h !== targetIndex);
                    }
                }

                if (defenders.includes(targetIndex)) updates.defenders = defenders.filter(d => d !== targetIndex);

                playSound('click');
                commitAction(updates, updatedPlayers);
              

                
            }
        });
    };

   const handleSmartJoin = (nameToUse) => {
        if (!nameToUse || !nameToUse.trim()) return;
        const safeName = nameToUse.trim().toUpperCase();
        let newPlayers = [...players];
        let myNewSeatIdx = seatIdx;
        let updates = { isGameStarted: isGameStarted };

        if (isMe) {
            newPlayers[seatIdx] = { ...newPlayers[seatIdx], name: safeName };
        } else {
            const freeIndex = newPlayers.findIndex(p => !p.seated_by);
            if (freeIndex === -1) { alert("SQUAD FULL"); return; }
            newPlayers = newPlayers.map((pl, i) => pl.seated_by === deviceId ? { ...pl, is_seated: false, seated_by: null, name: `Open Seat ${i + 1}` } : pl);
            newPlayers[freeIndex] = { ...newPlayers[freeIndex], is_seated: true, seated_by: deviceId, name: safeName, lt: newPlayers[freeIndex].lt || 20, drunk: 0 };
            myNewSeatIdx = freeIndex;
            setLocalSeat(String(freeIndex)); 
            localStorage.setItem('stress_seat', freeIndex);
        }

        const realPlayersIndices = newPlayers.map((p, i) => ({ ...p, originalIdx: i })).filter(p => p.is_seated && p.name && !p.name.startsWith("Open Seat")).map(p => p.originalIdx);
        if (realPlayersIndices.length === 1 && realPlayersIndices[0] === myNewSeatIdx) {
            updates.activePlayerIdx = myNewSeatIdx;
            updates.priorityPlayerIdx = myNewSeatIdx;
        }
        playSound('click');
        commitAction(updates, newPlayers);
    };

    const handleSeatClaim = (targetIndex) => {
        if (!players[targetIndex]) return;

        const performClaim = (customName = null) => {
             // ... (Din originale claim logik, bare flyttet ind her) ...
             // OBS: SÃ¸rg for at 'targetIndex' er tilgÃ¦ngelig her (closure)
             // Kopier logikken fra din oprindelige handleSeatClaim, 
             // men hvor du brugte `window.prompt`, bruger du nu `customName`.
            
            let newPlayers = [...players];
            const oldSeatIdx = newPlayers.findIndex(p => p.seated_by === deviceId);

            if (oldSeatIdx !== -1) {
                newPlayers[oldSeatIdx] = { 
                    ...newPlayers[oldSeatIdx], is_seated: false, seated_by: null, 
                    name: `Open Seat ${oldSeatIdx + 1}`, lt: 10, drunk: 0, is_dead: false, grudges: {}, saved_time: activeConfig.startTimeMin * 60
                };
            }

            const targetIsRealPlayer = newPlayers[targetIndex].name && !newPlayers[targetIndex].name.startsWith("Open Seat");

            if (targetIsRealPlayer) {
                // Inherit logic (no prompt needed here really, unless confirm)
                 newPlayers[targetIndex] = { ...newPlayers[targetIndex], is_seated: true, seated_by: deviceId };
            } else {
                const newName = customName ? customName.trim().toUpperCase() : `PLAYER ${targetIndex + 1}`;
                newPlayers[targetIndex] = { 
                    ...newPlayers[targetIndex], is_seated: true, seated_by: deviceId, 
                    name: newName, is_dead: false, grudges: {} 
                };
            }




            // ... (inde i performClaim, i bunden fÃ¸r commitAction) ...

            let updates = { isGameStarted: isGameStarted };
            
            if (isGameStarted) {
                 const currentAP = newPlayers[activePlayerIdx];
                 if (!currentAP.is_seated || currentAP.name.startsWith("Open Seat")) {
                     // ... find next player logic (uÃ¦ndret) ...
                 }
            }
            
            // NYT: Hvis man flytter sig fra et sÃ¦de, skal det gamle sÃ¦de fjernes fra Stack Holders
            if (oldSeatIdx !== -1 && stackHolders.includes(oldSeatIdx)) {
                updates.stackHolders = stackHolders.filter(h => h !== oldSeatIdx);
            }
            
            setLocalSeat(String(targetIndex));
            localStorage.setItem('stress_seat', targetIndex);
            playSound('click');
            commitAction(updates, newPlayers);
          



          

            
            
        };

        // UI Logic
        if (players[targetIndex].is_seated && players[targetIndex].seated_by && players[targetIndex].seated_by !== deviceId) {
            setModalConfig({
                isOpen: true,
                type: 'confirm',
                title: 'STEAL SEAT?',
                message: `Do you want to take over ${players[targetIndex].name}'s seat and stats?`,
                isDanger: true,
                onConfirm: () => performClaim(null)
            });
        } else {
            // Fresh seat -> Prompt for name
            const isTakenSeat = players[targetIndex].name && !players[targetIndex].name.startsWith("Open Seat");
            if (!isTakenSeat) {
                 setModalConfig({
                    isOpen: true,
                    type: 'prompt',
                    title: 'IDENTIFY',
                    message: 'Enter your callsign:',
                    onConfirm: (name) => performClaim(name)
                });
            } else {
                performClaim(null);
            }
        }
    };

    const toggleTarget = (targetIdx) => {
        if (targetIdx === seatIdx) return; 
        playSound('click');
        let newTargets = [...pendingTargets];
        if (newTargets.includes(targetIdx)) newTargets = newTargets.filter(i => i !== targetIdx);
        else newTargets.push(targetIdx);
        const newTargetingPlayer = newTargets.length > 0 ? seatIdx : -1;
        commitAction({ pendingAttacks: newTargets, targetingPlayerIdx: newTargetingPlayer });
    };

    const handleOpenStack = () => {
        // Kun NAPs kan ÃƒÆ’Ã‚Â¥bne stack, og kun hvis spillet kÃƒÆ’Ã‚Â¸rer
        if (isMe && !isMyTurn && isGameStarted && !isPaused && stackState === 'none') {
            
            commitAction({ 
                stackState: 'open', 
                stackOwnerIdx: seatIdx, 
                usedDelayBuffer: 0,
                // Ryd evt. targets hvis man starter stack
                pendingAttacks: [],
                targetingPlayerIdx: -1
            });
        }
    };
    
    const resetPenaltyTimer = (updatedPlayers) => {
        updatedPlayers[priorityPlayerIdx].saved_time = activeConfig.penaltyIntervalSec;
        commitAction({ isPaused: false, penaltyPending: false, usedDelayBuffer: 0 }, updatedPlayers);
    };







const handleGlobalPay = (type) => {
        if (!isMe || (me.global_debt || 0) <= 0) return;

        // 1. LOCKSTEP CHECK (FÃ¸r betaling)
        // Vi finder alle, der sidder ved bordet (levende OG dem med gÃ¦ld)
        const activeSeats = players.filter(p => p.is_seated && !p.name.startsWith("Open Seat"));
        const currentMaxDebt = Math.max(...activeSeats.map(p => p.global_debt || 0));

        // Hvis jeg er "foran" (lavere gÃ¦ld end maks), skal jeg vente pÃ¥ de andre
        if (me.global_debt < currentMaxDebt) {
            if (navigator.vibrate) navigator.vibrate(50);
            return; 
        }
        
        // 2. UDFÃ˜R BETALING (LOKALT)
        let updatedPlayers = [...players];
        const penaltyAmount = type === 'life' ? activeConfig.penaltyLife : activeConfig.penaltyDrinks;
        const myIdx = seatIdx;
        const oldMe = updatedPlayers[myIdx];

        // FIX: Beregn de nye vÃ¦rdier ud fra det gamle objekt
        const newLt = type === 'life' ? (oldMe.lt || 0) - penaltyAmount : (oldMe.lt || 0);
        const newDrunk = type === 'drink' ? (oldMe.drunk || 0) + penaltyAmount : (oldMe.drunk || 0);
        
        // Tjek om jeg dÃ¸r NU
        const isNowDead = newLt <= 0 || newDrunk >= 10 || oldMe.is_dead;

        // Kobl det hele sammen i et NYT objekt, sÃ¥ skÃ¦rmen opdaterer fejlfrit
        updatedPlayers[myIdx] = {
            ...oldMe,
            lt: newLt,
            drunk: newDrunk,
            is_dead: isNowDead,
            global_debt: Math.max(0, (oldMe.global_debt || 0) - 1)
        };
        
        let updates = {};

        // 3. TJEK OM VI SKAL VENTE PÃ… ANDRE
        // Vi kigger pÃ¥ HELE bordet. Er der nogen (mig eller andre), der stadig har gÃ¦ld > 0?
        const anyoneStillOwes = updatedPlayers.some(p => p.is_seated && !p.name.startsWith("Open Seat") && (p.global_debt || 0) > 0);

        if (anyoneStillOwes) {
            // A: Vi er ikke fÃ¦rdige. Hold boksen Ã¥ben.
            console.log("Debt remains on the table. Waiting...");
            updates.globalPenaltyPending = true;
            updates.isPaused = true;
            playSound('click'); // Kun klik-lyd, ingen victory
        } else {
            // B: Alt gÃ¦ld er betalt. NU tÃ¦ller vi ligene.
            const survivors = updatedPlayers.filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open Seat"));

            if (survivors.length === 0) {
                // SCENARIE: ALLE DÃ˜DE (No Survivors)
                console.log("Entropy Result: NO SURVIVORS.");
                updates.globalPenaltyPending = false; 
                updates.isPaused = true; // Stop spillet
                playSound('low'); // Trist lyd
            } 
            else if (survivors.length === 1) {
                // SCENARIE: VICTORY
                console.log("Entropy Result: WE HAVE A WINNER.");
                updates.globalPenaltyPending = false; 
                updates.isPaused = true; // Stop spillet
                
                // VIGTIGT: Vi spiller IKKE 'win' lyd her manuelt!
                // Vi lader din useEffect "Auto Victory Sound" opdage, at survivors.length === 1.
                // Det sikrer, at lyden kun spilles pÃ¥ vinderens telefon.
            } 
            else {
                // SCENARIE: FLERE OVERLEVEDE -> Spillet fortsÃ¦tter
                console.log("Entropy Result: SURVIVORS DETECTED. RESUMING.");
                updates.globalPenaltyPending = false;
                updates.globalTimeBank = activeConfig.penaltyIntervalSec; 
                updates.isPaused = true; // Paus til nogen trykker resume/dice
                playSound('bell'); // Kampen fortsÃ¦tter-lyd
            }
        }

        commitAction(updates, updatedPlayers);
    };








  


  
  const handlePayLife = () => {
        let updatedPlayers = [...players];
        // TilfÃ¸j grudge fÃ¸rst
        updatedPlayers = addGrudge(priorityPlayerIdx, activePlayerIdx, 'damage', activeConfig.penaltyLife, updatedPlayers);
        
        // FIX: Lav et HELT NYT objekt til spilleren, sÃ¥ React fanger opdateringen!
        updatedPlayers[priorityPlayerIdx] = {
            ...updatedPlayers[priorityPlayerIdx],
            lt: Math.max(0, updatedPlayers[priorityPlayerIdx].lt - activeConfig.penaltyLife)
        };
        
        resetPenaltyTimer(updatedPlayers);
    };

    const handlePayDrink = () => {
        let updatedPlayers = [...players];
        // TilfÃ¸j grudge fÃ¸rst
        updatedPlayers = addGrudge(priorityPlayerIdx, activePlayerIdx, 'drinks', activeConfig.penaltyDrinks, updatedPlayers);
        
        // FIX: Helt nyt objekt her ogsÃ¥!
        updatedPlayers[priorityPlayerIdx] = {
            ...updatedPlayers[priorityPlayerIdx],
            drunk: (updatedPlayers[priorityPlayerIdx].drunk || 0) + activeConfig.penaltyDrinks
        };
        
        resetPenaltyTimer(updatedPlayers);
    };
  
    const handleConfirmDeath = () => {
        let updatedPlayers = [...players];
        
        // 1. SlÃ¥ spilleren ihjel i dataen med det samme
        updatedPlayers[seatIdx] = { ...updatedPlayers[seatIdx], is_dead: true };
        
        let updates = {};
        
        // 2. TÃ†L OVERLEVENDE (Baseret pÃ¥ den nye data)
        const survivors = updatedPlayers.filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open Seat"));

        // 3. GAME OVER CHECK
        if (survivors.length <= 1) {
            console.log("Victory Condition Met: Stopping Game Loop.");

            // --- FIX: AFSLUT REGNSKABET FOR DENNE TUR ---
            // Da vi aldrig nÃ¥r at trykke "Pass Turn", tvinger vi skade-opgÃ¸relsen igennem nu.
            // Dette sikrer, at det "drÃ¦bende stÃ¸d" tÃ¦ller med i statistikken pÃ¥ Victory Screen.
            updatedPlayers = resolveTurnGrudges(updatedPlayers, activePlayerIdx);
            // ---------------------------------------------
          
            // STOP! Flyt ikke turen. SÃ¦t spillet pÃ¥ pause.
            updates.isPaused = true;
            setDeathCheckReason(null);
            commitAction(updates, updatedPlayers);
            return;
        }

        // 4. HVIS SPILLET FORTSÃ†TTER: Flyt turen sikkert
        if (activePlayerIdx === seatIdx) {
            // Hvis det var Active Player der dÃ¸de, skal vi finde den nÃ¦ste LEVENDE spiller
            let nextIdx = (activePlayerIdx + 1) % players.length;
            let loops = 0;
            // Loop indtil vi finder en, der er seated, har navn, og IKKE er dÃ¸d
            while ((!updatedPlayers[nextIdx].is_seated || updatedPlayers[nextIdx].name.startsWith("Open Seat") || updatedPlayers[nextIdx].is_dead) && loops < players.length) {
                nextIdx = (nextIdx + 1) % players.length;
                loops++;
            }
            updates.activePlayerIdx = nextIdx; 
            updates.priorityPlayerIdx = nextIdx;
        } else if (priorityPlayerIdx === seatIdx) {
             // Hvis en NAP (Non-Active Player) dÃ¸de, gÃ¥r turen tilbage til AP
             updates.priorityPlayerIdx = activePlayerIdx;
        }
        
        playSound('low'); 
        setDeathCheckReason(null);
        commitAction(updates, updatedPlayers);
    };

    const handlePenaltyElimination = () => {
        let updatedPlayers = [...players];
        // 1. SlÃƒÆ’Ã‚Â¥ spilleren ihjel
        updatedPlayers[priorityPlayerIdx] = { ...updatedPlayers[priorityPlayerIdx], is_dead: true };
        
        // Default updates (vi antager spillet fortsÃƒÆ’Ã‚Â¦tter, medmindre vi beviser det modsatte)
        let updates = { 
            isPaused: false, 
            penaltyPending: false, 
            usedDelayBuffer: 0 
        };

        // 2. TÃƒÆ’Ã¢â‚¬ L OVERLEVENDE
        const survivors = updatedPlayers.filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open Seat"));
        
        // 3. GAME OVER CHECK
        if (survivors.length <= 1) {
            console.log("Victory Condition Met via Elimination.");
            
            // --- FIX: AFSLUT REGNSKABET ---
            updatedPlayers = resolveTurnGrudges(updatedPlayers, activePlayerIdx);
            // ------------------------------

            updates.isPaused = true; 
        } else {
            // 4. FIND NÃƒÆ’Ã¢â‚¬ STE SPILLER (Kun hvis spillet fortsÃƒÆ’Ã‚Â¦tter)
            // Da den der dÃƒÆ’Ã‚Â¸de var 'priorityPlayerIdx' (som typisk er AP i denne situation), sender vi turen videre.
            let nextIdx = (priorityPlayerIdx + 1) % players.length;
            let loops = 0;
            while ((!updatedPlayers[nextIdx].is_seated || updatedPlayers[nextIdx].name.startsWith("Open Seat") || updatedPlayers[nextIdx].is_dead) && loops < players.length) { 
                const p = updatedPlayers[nextIdx];
                nextIdx = (nextIdx + 1) % players.length; 
                loops++; 
            }
            updates.activePlayerIdx = nextIdx; 
            updates.priorityPlayerIdx = nextIdx;
        }

        commitAction(updates, updatedPlayers);
    };

    const openStatSelector = (type) => setSelectorType(type);




  
      const handleStatSelect = (val) => {
        if (selectorType === 'life') {
            commitAction({ lastActionAt: Date.now() }, { [seatIdx]: { lt: val } });
            setTimeout(() => setSelectorType(null), 50);
        }
        else if (selectorType === 'drunk') {
            commitAction({ lastActionAt: Date.now() }, { [seatIdx]: { drunk: val } });
            setTimeout(() => setSelectorType(null), 50);
        }
        else { 
            // FIX: Generics sendes nu direkte ind i The Hive-Mind (delta-update), 
            // så de overlever, næste gang der tages et snapshot eller ændres liv!
            if (selectorType === 'generic1') {
                commitAction({ _isSilentSave: true }, { [seatIdx]: { generic1: val } });
            }
            else if (selectorType === 'generic2') {
                commitAction({ _isSilentSave: true }, { [seatIdx]: { generic2: val } });
            }
            setTimeout(() => setSelectorType(null), 50);
        }
    };



  
    

   
    const handleDiceLongPress = (num) => {
    // Kun tillad multi-roll for rimelige tal (f.eks. max 10 terninger)
    if (num > 6) return; 
    setMultiRollCount(num);
    playSound('click');
    // Vi beholder selectorType som 'dice', men UI opdateres pga. state Ã¦ndring
    };

    const openDiceSelector = () => { playSound('click'); setSelectorType('dice'); };
    
     // --- WHEEL HANDLERS ---
    const handleWheelChange = (delta) => {
        // Opdaterer kun lokalt og visuelt (for performance)
        const myIndex = players.findIndex(p => p.seat === seatIdx);
        if (myIndex === -1) return;

        const newPlayers = [...players];
        // Vi opdaterer tallet direkte
        newPlayers[myIndex].lt = (newPlayers[myIndex].lt || 0) + delta; 
        setPlayers(newPlayers);
    };

    const closeWheelAndSave = () => {
        // Nu gemmer vi til serveren/databasen nÃ¥r man lukker
        commitAction({ players: players });
        setSelectorType(null); // Luk overlayet
        playSound('click');
    };
    
const handleDiceSelect = (sides) => {
        setSelectorType(null); 
        lastUsedDiceSides.current = sides; 

        const count = multiRollCount || 1;
        let total = 0;
        let resultsArray = [];

        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * sides) + 1;
            resultsArray.push(r);
            total += r;
        }

        playSound('dice_shake');
        setMultiRollCount(null); 

        commitAction({ 
            isPaused: true, 
            usedDelayBuffer: Math.min(Date.now() - lastActionAt, (activeConfig.turnDelaySec || 0) * 1000), 
            dice: { 
                active: true, 
                sides: sides, 
                count: count,          
                result: total,         
                results: resultsArray, 
                roller: me?.name || 'Unknown',
                rollId: Date.now() // FIX: Smid et timestamp med her ogsÃ¥
            } 
        });
    };

  
    const closeDice = () => commitAction({ isPaused: true, dice: { active: false, sides: 6, result: null, roller: null, rollId: null } });

    const applyPreset = (mode) => {
        let newConfig = { ...activeConfig };
        
        if (mode === 'chill') {
            newConfig = { ...newConfig, startTimeMin: 10, bonusSec: 20, turnDelaySec: 120, penaltyLife: 3, penaltyDrinks: 2, penaltyIntervalSec: 180, globalTimerStartMin: 0, breatherSec: 0 };
        } 
        else if (mode === 'concentrate') {
            newConfig = { ...newConfig, startTimeMin: 1, bonusSec: 30, turnDelaySec: 60, penaltyLife: 4, penaltyDrinks: 3, penaltyIntervalSec: 120, globalTimerStartMin: 0, breatherSec: 15};
        } 
        else if (mode === 'russian') {
            newConfig = { ...newConfig, startTimeMin: 1, bonusSec: 5, turnDelaySec: 40, penaltyLife: 5, penaltyDrinks: 4, penaltyIntervalSec: 60, globalTimerStartMin: 6, breatherSec: 20};
        }
        else if (mode === 'caped') {
            // Cap'ed: HÃƒÆ’Ã‚Â¸j start tid, men INGEN hjÃƒÆ’Ã‚Â¦lp og DÃƒÆ’Ã‹Å“DELIG straf
            newConfig = { ...newConfig, startTimeMin: 15, bonusSec: 0, turnDelaySec: 0, penaltyLife: 40, penaltyDrinks: 16, penaltyIntervalSec: 600, globalTimerStartMin: 10, breatherSec: 0};
        }

        // --- NEW CREATIVE MODES ---
        else if (mode === 'sudden_death') {
            // 1 Minut start. 0 Delay. 20 Skade (Instant Kill).
            newConfig = { ...newConfig, startTimeMin: 5, bonusSec: 10, turnDelaySec: 2, penaltyLife: 30, penaltyDrinks: 15, penaltyIntervalSec: 30, globalTimerStartMin: 0, breatherSec: 20};
        }
        else if (mode === 'pub_crawl') {
            // Masser af tid. Lille skade. STOR tÃ¸rst.
            newConfig = { ...newConfig, startTimeMin: 4, bonusSec: 0, turnDelaySec: 5, penaltyLife: 40, penaltyDrinks: 3, penaltyIntervalSec: 300, globalTimerStartMin: 7, breatherSec: 15 };
        }
        else if (mode === 'vampire') {
            // 2 minutter start. KÃ†MPE bonus (45s). Du skal spille for at leve.
            newConfig = { ...newConfig, startTimeMin: 1, bonusSec: 60, turnDelaySec: 1, penaltyLife: 5, penaltyDrinks: 3, penaltyIntervalSec: 60, globalTimerStartMin: 0, breatherSec: 10 };
        }
        else if (mode === 'entropy') {
            newConfig = { ...newConfig, startTimeMin: 1000, bonusSec: 0, turnDelaySec: 0, penaltyLife: 0, penaltyDrinks: 0, penaltyIntervalSec: 0, globalTimerStartMin: 0, breatherSec: 0 };
        }

        playSound('click');
        if (navigator.vibrate) navigator.vibrate(50);
        commitAction({ config: newConfig });
    };







    const handleResetGame = () => {
        // Bruger nu vores custom modal
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'SYSTEM RESET',
            message: 'Are you sure you want to wipe the board? All progress will be lost.',
            isDanger: true,
            onConfirm: () => {
                const newPlayers = players.map(p => {
                    if (p.is_seated && !p.name.startsWith("Open Seat")) {
                        return { 
                            ...p, lt: 20, drunk: 0, generic1: 0, generic2: 0, grudges: {}, 
                            saved_time: activeConfig.startTimeMin * 60, 
                            is_dead: false,
                            global_debt: 0,
                            warmup_remaining: activeConfig.turnDelaySec,
                            last_warmup_turn: -1,
                            turns_played: 0
                        };
                    }
                    return { ...p, global_debt: 0 };
                });
                
                
                setVictoryDismissed(false);
                setDeathCheckReason(null);
                setSelectorType(null);

              // --- NYT: DRÃ†B ALLE KÃ˜RENDE ANIMATIONER ---
                setShufflePhase('idle');
                setLocalAnimId(null);
                setIsRouletteSpinning(false);
                setRouletteHighlightIdx(null);
                setPendingShuffle(false);
                // -------------------------------------------

                // NYE LINJER HER:
                hasPlayedVictorySound.current = false; // SÃ¥ vi kan hÃ¸re win-lyd igen i nÃ¦ste spil
                prevGameStartedRef.current = false;    // SÃ¥ "Game Start" klokken ringer igen
          
                // ---------------------------------------
                // --- FIX: TVING RESET AF SYNC CLOCKS ---
                localReceiptTime.current = Date.now(); // Nulstil "modtagelses-uret" til NU
                lastShakeTime.current = 0;             // Nulstil shake-spam filteret
                setLocalLastActionAt(0);               // DrÃ¦b den lokale tids-optimist
                // ---------------------------------------
              
                // NYE TILFÃ˜JELSER HER:
                prevActivePlayerRef.current = -1; // Sikrer at start-klokken ringer, selvom samme spiller starter igen
                actionLock.current = false;       // LÃ¥ser interfacet op hvis det hang
                wasDefendingRef.current = false;  // Nulstiller vibrations-hukommelsen
                
                // OPTIMISTISK UI CLEANUP (God stil):
                pendingLifeRef.current = null;
                pendingDrunkRef.current = null;
                setOptimisticLife(null);
                setOptimisticDrunk(null);
                // ---------------------------------------

               commitAction({
                    turnCount: 0, 
                    isGameStarted: false, 
                    isPaused: true, 
                    defenders: [], 
                    pendingAttacks: [], 
                    penaltyPending: false, 
                    usedDelayBuffer: 0,
                    activePlayerIdx: priorityPlayerIdx, 
                    targetingPlayerIdx: -1, 
                    stackState: 'none', 
                    stackOwnerIdx: -1,
                    globalPenaltyPending: false, 
                    globalPenaltyPaidBy: [],
                    globalTimeBank: activeConfig.globalTimerStartMin * 60,
                    isBreatherActive: false,
                    breatherEndsAt: 0,
                    globalAnim: null,
                    stackHolders: [],
                    undoHistory: [], // <--- DRÆB ALT FORTID HER
                    config: activeConfig
                }, newPlayers);

              
                
                // --- FIX: LUK MENU KORREKT ---
                // Vi tjekker om vi er inde i menuen (via URL hash) og gÃ¥r tilbage i history
                // Dette sikrer at "Back"-knappen pÃ¥ telefonen virker rigtigt bagefter.
                if (window.location.hash === '#gearmenu') {
                    window.history.back();
                } else {
                    setIsGearOpen(false);
                }
            }
        });
    };






// --- THE TRUE TIME MACHINE (PERFECT COPY) ---
    const handleUndo = () => {
        const currentHistory = remoteStressState?.undoHistory || [];
        if (currentHistory.length === 0) return;

        // THE FIX: Vi tager ALTID det allernyeste snapshot i historikken (index 0). 
        // Snapshottet tages nemlig altid LIGE FØR en handling, så index 0 ER fortiden.
        const targetIndex = 0;
        const pastState = currentHistory[targetIndex];
        
        // HARD LIMIT SIKKERHED: UNDO må maks kaste os én tur tilbage!
        // Hvis vi prøver at hoppe længere tilbage end til starten af forrige tur, blokerer vi.
        const currentTurnCount = remoteStressState?.turnCount || 0;
        if (pastState.turnCount < currentTurnCount - 1) {
             console.log("UNDO REJECTED: Cannot rewind beyond the previous turn.");
             playSound('low');
             if (navigator.vibrate) handleVibrate([50, 100, 50]);
             return; 
        }

        // Vi fjerner det snapshot fra historikken, som vi lige har spolet tilbage til
        const newHistory = currentHistory.slice(1);

        playSound('click'); 
        if (navigator.vibrate) handleVibrate(50);









      

        // ... resten af funktionen (let updatedPlayers = [...players]; osv.) fortsætter præcis som før!

        let updatedPlayers = [...players];
        
     
        // 1. KUN DATA KOPIERING. INGEN MANUEL MATH.
        pastState.playerTimes.forEach((pt, i) => {
            if (updatedPlayers[i]) {
                updatedPlayers[i] = {
                    ...updatedPlayers[i],
                    saved_time: pt.saved_time,
                    warmup_remaining: pt.warmup_remaining, // Er 0 for den der sveder
                    turns_played: pt.turns_played, // <--- SIKRER KORREKT ROUND COUNT
                    last_warmup_turn: pt.last_warmup_turn,
                    turn_start_lt: pt.turn_start_lt !== undefined ? pt.turn_start_lt : updatedPlayers[i].lt,
                    turn_start_drunk: pt.turn_start_drunk !== undefined ? pt.turn_start_drunk : updatedPlayers[i].drunk
                };
            }
        });
        // 2. Skyd os direkte tilbage i fortiden
        commitAction({
            activePlayerIdx: pastState.activePlayerIdx,
            priorityPlayerIdx: pastState.priorityPlayerIdx,
            isPaused: pastState.isPaused,
            defenders: pastState.defenders,
            pendingAttacks: pastState.pendingAttacks,
            targetingPlayerIdx: pastState.targetingPlayerIdx,
            stackState: pastState.stackState,
            stackOwnerIdx: pastState.stackOwnerIdx,
            stackHolders: pastState.stackHolders,
            turnCount: pastState.turnCount,
            globalTimeBank: pastState.globalTimeBank,
            usedDelayBuffer: 0, 
            undoHistory: newHistory,
            globalUndoPressing: false, 
            undoInitiator: -1,         
            undoConfirmations: [],     
            
            // SIKKERHEDS-FIX: Tving alle straffe-alarmer til at slukke!
            penaltyPending: false,
            globalPenaltyPending: false,
            
            _isUndo: true,
            lastActionAt: Date.now() 
        }, updatedPlayers);
    };



  
  
    
  
  // --- 1. HJERNEN: UdfÃ¸rer selve blandingen (KÃ¸res direkte af Big Button) ---
    const executeShuffle = () => {
        // A. Find de stole, der er i brug (Indices)
        const occupiedIndices = [];
        players.forEach((p, i) => {
            if (p.is_seated && p.name && !p.name.startsWith("Open Seat")) {
                occupiedIndices.push(i);
            }
        });

        // Sikkerhed: Vi skal bruge mindst 2 spillere
        if (occupiedIndices.length < 2) return;

        // --- FIX DEL 1: HUSK HVEM DER HAR KRONEN ---
        // Vi gemmer ID'et pÃ¥ den nuvÃ¦rende Active Player fÃ¸r vi blander kortene
        const currentStarterId = players[activePlayerIdx]?.seated_by;

        // B. Tag spillerne UD af stolene (Kopier objekterne)
        const playersInBag = occupiedIndices.map(i => ({...players[i]}));

        // C. Bland posen (Fisher-Yates Shuffle)
        for (let i = playersInBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playersInBag[i], playersInBag[j]] = [playersInBag[j], playersInBag[i]];
        }

        // D. SÃ¦t spillerne tilbage pÃ¥ stolene i den nye rÃ¦kkefÃ¸lge
        const newPlayers = [...players];
        
        // Vi bruger 'occupiedIndices' til at vide HVILKE stole vi mÃ¥ sÃ¦tte folk pÃ¥.
        // Vi bruger 'playersInBag' (som nu er blandet) til at vide HVEM der skal sidde der.
        occupiedIndices.forEach((seatIdx, i) => {
            newPlayers[seatIdx] = playersInBag[i];
        });

        // E. Reparer Grudges (Det svÃ¦re regnestykke)
        // For at vide hvem der slog hvem, skal vi vide hvor folk sad FÃ˜R, og hvor de sidder NU.
        
        // 1. Lav et kort over: DeviceID -> Nyt Index
        const deviceToNewIndex = {};
        newPlayers.forEach((p, i) => {
            if (p.seated_by) deviceToNewIndex[p.seated_by] = i;
        });

        // 2. Opdater alle spilleres grudge-lister
        const fixedPlayers = newPlayers.map(p => {
            // Hvis spilleren ikke har nogen fjender, eller er et tomt sÃ¦de, sÃ¥ spring over
            if (!p.grudges || !p.seated_by) return p;

            const fixedGrudges = {};
            
            // GennemgÃ¥ gamle fjender
            Object.entries(p.grudges).forEach(([oldAttackerIdx, stats]) => {
                // Hvem sad pÃ¥ 'oldAttackerIdx' i det GAMLE spil?
                const originalAttacker = players[oldAttackerIdx];
                
                // Hvad er den persons ID?
                const attackerDevice = originalAttacker?.seated_by;

                // Hvor sidder det ID henne NU?
                if (attackerDevice && deviceToNewIndex[attackerDevice] !== undefined) {
                    const newAttackerIdx = deviceToNewIndex[attackerDevice];
                    // Gem stats pÃ¥ den nye plads
                    fixedGrudges[newAttackerIdx] = stats;
                }
            });

            return { ...p, grudges: fixedGrudges };
        });

        // --- FIX DEL 2: FIND DEN OPRINDELIGE STARTSPILLER PÃ… DERES NYE PLADS ---
        let newStartIdx = fixedPlayers.findIndex(p => p.seated_by === currentStarterId);
        
        // Fallback: Hvis noget gik galt (f.eks. hvis Active Player var en spÃ¸gelsesspiller), sÃ¥ tag en tilfÃ¦ldig
        if (newStartIdx === -1) {
             newStartIdx = occupiedIndices[Math.floor(Math.random() * occupiedIndices.length)];
        }
        
        
        // G. Send det hele til serveren
        commitAction({ 
            activePlayerIdx: newStartIdx, 
            priorityPlayerIdx: newStartIdx, 
            defenders: [], 
            isPaused: true, 
            pendingAttacks: [], 
            turnCount: 0, 
            targetingPlayerIdx: -1, 
            stackState: 'none', 
            stackOwnerIdx: -1,
            globalAnim: { id: Date.now(), type: 'SHUFFLE' } 
        }, fixedPlayers);
    };


  

    // --- 2. KNAPPEN: SpÃ¸rger om lov fÃ¸rst (Bruges i Gear Menu) ---
    const handleShufflePlayers = () => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'SHUFFLE SEATS',
            message: 'This will randomize who the player order.',
            onConfirm: () => executeShuffle() // <--- Her kalder vi hjernen
        });
    };


       
  
      // --- REFACTORED BIG BUTTON LOGIC ---
    const handleBigButton = () => {
        // TilfÃ¸j shufflePhase beskyttelsen i Big Button safety valve
        if (!isMe || actionLock.current || penaltyPending || me?.is_dead || isRouletteSpinning || isBreatherActive || shufflePhase !== 'idle') return;
        // ... resten af funktionen

        actionLock.current = true;


     
      // 0. GLOBAL ANIMATION OVERRIDES (TRUMFER ALT!)
    if (shufflePhase !== 'idle') {
        if (shufflePhase === 'suck') {
            btnText = "COLLECTING"; btnSub = "GATHERING PLAYERS";
            btnColorClass = "border-blue-500 text-blue-100 bg-blue-900/80";
            glow = "shadow-[0_0_40px_rgba(59,130,246,0.6)]";
        } else if (shufflePhase === 'swirl') {
            btnText = "SHUFFLING"; btnSub = "RANDOMIZING ORDER";
            btnColorClass = "border-white text-white bg-white/10 animate-elegant-spin"; 
            glow = "shadow-[0_0_60px_rgba(255,255,255,0.4)]";
        } else if (shufflePhase === 'drop') {
            btnText = "DEALING"; btnSub = "NEW POSITIONS";
            btnColorClass = "border-emerald-400 text-emerald-100 bg-emerald-900/80 animate-pulse";
            glow = "shadow-[0_0_60px_rgba(52,211,153,0.6)]";
        }
    } 
    
        else if (isRouletteSpinning) {
            btnText = "ROULETTE";
            btnSub = "SPINNING...";
            btnColorClass = `${colorPurple} animate-pulse`;
        }

      
        // 1. GAME STATE CONTROL
        if (!isGameStarted) { 
            const validPlayerCount = players.filter(p => p.is_seated && p.name && !p.name.startsWith("Open Seat")).length;
            if (validPlayerCount < 2) {
                alert("GET SOME FRIENDS");
                actionLock.current = false; 
                return;
            }

            playSound('bell'); 
            if (navigator.vibrate) navigator.vibrate(50); 
          
            // --- FIX: BRUG DEN VALGTE SPILLER ---
            // Vi stoler pÃ¥, at activePlayerIdx er sat korrekt (enten default eller via klik/roulette)
            // Men vi laver lige et sikkerhedstjek for at sikre at den peger pÃ¥ et menneske.
            let startIdx = activePlayerIdx;
            const p = players[startIdx];
            
            // Hvis den valgte er ugyldig (tomt sÃ¦de), find den fÃ¸rste menneske-spiller
            if (!p || !p.is_seated || p.name.startsWith("Open Seat")) {
                 const firstHuman = players.findIndex(p => p.seated_by);
                 if (firstHuman !== -1) startIdx = firstHuman;
            }
            // --- FIX: START BONUS TIL STARTSPILLEREN ---
            const baseStartSeconds = (activeConfig.startTimeMin || 20) * 60;

            const initializedPlayers = players.map((p, i) => {
                // Er det denne spiller der starter?
                const isStarter = i === startIdx;
                
                // Beregn start tid: Base tid + Bonus (KUN hvis man starter)
                const startBonus = (isStarter && activeConfig.bonusSec > 0) ? activeConfig.bonusSec : 0;
                
                return {
                    ...p,
                    // Vi sÃ¦tter tiden hÃ¥rdt her for at sikre at bonussen kommer med
                    saved_time: baseStartSeconds + startBonus,
                    
                    // Snapshots til statistik
                    turn_start_lt: p.lt,
                    turn_start_drunk: p.drunk,
                    // Den der starter, er nu igang med tur 1. Andre er pÃ¥ 0.
                    turns_played: 0 // <--- Alle starter pÃ¥ 0. Vi tÃ¦ller fÃ¸rst op, nÃ¥r man er FÃ†RDIG.
                };
            });

            commitAction({ 
        isPaused: false, 
        isGameStarted: true, 
        usedDelayBuffer: 0, 
        activePlayerIdx: startIdx, 
        priorityPlayerIdx: startIdx,

        globalTimeBank: activeConfig.globalTimerStartMin * 60,
        globalPenaltyPending: false,
        turnCount: 0 
        
    }, initializedPlayers); // Vi sender de opdaterede tider med
    return;
        }
        
        if (isPaused) { 
            // FIX: Kun Active Player mÃƒÆ’Ã‚Â¥ trykke RESUME
            if (!isMyTurn) return;

            
            
            // AP unpauser og fÃƒÆ’Ã‚Â¥r automatisk priority (Reclaim)
            const updates = { 
                isPaused: false, 
                lastActionAt: Date.now() - (usedDelayBuffer || 0),
                priorityPlayerIdx: seatIdx 
            };

            commitAction(updates); 
            return; 
        }

        // 2. BLOCKING (HIGHEST PRIORITY) - FIX: Always allows blocking if defending
        const amIDefending = defenders.includes(seatIdx);
        if (amIDefending) {
            playSound('click');
            const myTime = calculateTimeForPlayer(seatIdx);
            const updatedPlayers = [...players];
            updatedPlayers[seatIdx].saved_time = myTime;
            
            const newDefenders = defenders.filter(d => d !== seatIdx);
            
            // FIX: Tjek om angrebet er slut (ingen defenders tilbage)
            const isAttackOver = newDefenders.length === 0;

            commitAction({ 
                defenders: newDefenders, 
                lastActionAt: lastActionAt,
                // Hvis angrebet er slut, tvinger vi spillet i PAUSE (BlÃƒÆ’Ã‚Â¥ mode)
                // Det fjerner Reclaim (gul) og Speak (grÃƒÆ’Ã‚Â¥) indtil nogen trykker Resume
                isPaused: isAttackOver 
            }, updatedPlayers);
            return;
        }


        // 3. TARGETING COMMIT
        if (pendingTargets.length > 0) {
            if (seatIdx === targetingPlayerIdx) {
                
                // --- NY STACK ATTACK LOGIK (Forced GIMME) ---
                // Hvis stack er Ã¥ben, og jeg er stack owner (og ikke selv er defender/holder)
                if (stackState === 'open' && seatIdx === stackOwnerIdx && !defenders.includes(seatIdx)) {
                    playSound('horse'); 
                    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

                    // GÃ¸r targets til Stack Holders (undgÃ¥ dubletter)
                    // Vi spreder den eksisterende liste og de nye targets ind i et Set
                    const currentHolders = stackHolders || [];
                    const newHolders = [...new Set([...currentHolders, ...pendingTargets])];

                    commitAction({ 
                        stackHolders: newHolders, // Opdater listen af ofre
                        pendingAttacks: [],       // Ryd markering
                        targetingPlayerIdx: -1, 
                        usedDelayBuffer: 0
                    });
                    return;
                }
                // --------------------------

                // NORMAL COMBAT LOGIC (Hvis stack ikke er Ã¥ben, eller jeg forsvarer mig)
                playSound('horse');
                commitAction({ defenders: pendingTargets, priorityPlayerIdx: -1, pendingAttacks: [], targetingPlayerIdx: -1, usedDelayBuffer: 0 });
                return;
            }
            // Reclaim if AP and not targeting (UÃ¦ndret)
            if (isMyTurn && seatIdx !== targetingPlayerIdx) {
                playSound('click');
                commitAction({ pendingAttacks: [], targetingPlayerIdx: -1 });
                return;
            }
        }
      

      
        // 4. STACK LOGIC (GROUP 3 - UPDATED)
        if (stackState !== 'none') {
            if (stackState === 'open') {
                
                // A. Er jeg Stack Owner?
                if (seatIdx === stackOwnerIdx) {
                    // Hvis der er holders ude (elastikken er spÃ¦ndt), kan jeg ikke lukke stacken.
                    // Jeg venter bare pÃ¥, at den kommer tilbage.
                    if (stackHolders && stackHolders.length > 0) {
                        return; 
                    }

                    // "THAT'S ALL" -> Freeze (Normal lukning, kun nÃ¥r elastikken er hjemme)
                    playSound('click');
                    commitAction({ stackState: 'frozen' });
                    return;
                } 
                
                // B. Er jeg en Stack Holder (Offer)? -> YIELD
                if (stackHolders && stackHolders.includes(seatIdx)) {
                    playSound('click');
                    // Fjern mig selv fra listen
                    const newHolders = stackHolders.filter(id => id !== seatIdx);
                    
                    commitAction({
                        stackHolders: newHolders,
                        usedDelayBuffer: 0
                    });
                    return;
                }
            } 
            
            // Frosset Stack (UÃ¦ndret logik)
            else if (stackState === 'frozen') {
                if (seatIdx === stackOwnerIdx) {
                    // "RESUME GAME" (Original owner closes it) -> Resume to AP
                    
                    commitAction({ stackState: 'none', stackOwnerIdx: -1, usedDelayBuffer: 0, stackHolders: [] });
                    return;
                } else {
                    // "YES, GIMME" (Another NAP takes the floor)
                    playSound('click');
                    commitAction({ 
                        stackState: 'open', 
                        stackOwnerIdx: seatIdx, 
                        usedDelayBuffer: 0,
                        stackHolders: []
                    });
                    return;
                }
            }
            return; 
        }
      

        



        // 5. NORMAL TURN LOGIC
        if (isMyTurn) {
            if (hasPriority && defenders.length === 0) {
                
                let nextIdx = (activePlayerIdx + 1) % players.length;
                let attempts = 0;
                while (attempts < players.length) {
                    const p = players[nextIdx];
                    if (p.name && !p.name.startsWith("Open Seat") && !p.is_dead) break;
                    nextIdx = (nextIdx + 1) % players.length;
                    attempts++;
                }

                if (attempts < players.length) {
                    // 1. BEREGN GRUDGES (UÃ¦ndret)
                    let updatedPlayers = resolveTurnGrudges(players, activePlayerIdx);

                    // 2. Drunk Relief (UÃ¦ndret)
                    if ((updatedPlayers[nextIdx].drunk || 0) > 0) updatedPlayers[nextIdx].drunk -= 1;
                    
                    // 3. Bonus Tid (UÃ¦ndret)
                    if (activeConfig.bonusSec > 0) {
                        updatedPlayers[nextIdx].saved_time = (updatedPlayers[nextIdx].saved_time ?? (activeConfig.startTimeMin * 60)) + activeConfig.bonusSec;
                    }

                    // --- NY "FLOOR" BREATHER LOGIK ---
                    
                    // A. Find de levende spillere (Vi er ligeglade med dÃ¸de og tomme sÃ¦der)
                    const getLivingIndices = (list) => list
                        .map((p, i) => ({ ...p, idx: i }))
                        .filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open"))
                        .map(p => p.idx);

                    const livingIndices = getLivingIndices(players);

                    // B. Hvad er "Gulvet" (det laveste antal ture) LIGE NU?
                    const currentFloor = Math.min(...livingIndices.map(i => players[i].turns_played || 0));

                    // C. Opdater AFSENDERENS (din) tur-tÃ¦ller
                    // Vi tÃ¦ller op nu, fordi du har gennemfÃ¸rt din tur.
                    const myOldCount = updatedPlayers[activePlayerIdx].turns_played || 0;
                    updatedPlayers[activePlayerIdx].turns_played = myOldCount + 1;

                    // D. Hvad bliver "Gulvet" EFTER du har afleveret?
                    // Nu tjekker vi: Har ALLE (inklusive dig selv og den sidste mand) nÃ¥et det nye niveau?
                    const futureFloor = Math.min(...livingIndices.map(i => updatedPlayers[i].turns_played || 0));

                    // E. Har vi lÃ¸ftet gulvet? 
                    // Hvis gulvet stiger fra 0 til 1, betyder det at SIDSTE mand lige har klikket "Pass".
                    const isRoundComplete = futureFloor > currentFloor;

                    // Aktiver KUN breather hvis config er sat OG runden er komplet
                    const nextIsBreather = activeConfig.breatherSec > 0 && isRoundComplete;
                    
                    // Beregn sluttidspunktet (Sender Authority + SKEW BUFFER)
                    // Vi lÃ¦gger 2.5 sekunder til for at sikre, at selv enheter med hurtige ure
                    // fÃ¥r den fulde visuelle oplevelse.
                    const CLOCK_SKEW_BUFFER = 2500; 
                    
                    const breatherEndParams = nextIsBreather 
                        ? Date.now() + (activeConfig.breatherSec * 1000) + CLOCK_SKEW_BUFFER
                        : 0;

                    commitAction({ 
                        activePlayerIdx: nextIdx, 
                        priorityPlayerIdx: nextIdx, 
                        isPaused: false, 
                        
                        isBreatherActive: nextIsBreather,
                        breatherEndsAt: breatherEndParams,
                        
                        turnCount: (remoteStressState?.turnCount || 0) + 1,
                        
                        // Stop uret (0) hvis Breather, ellers kÃ¸r videre
                        lastActionAt: nextIsBreather ? 0 : 0 
                    }, updatedPlayers);

                } else {
                    commitAction({ isPaused: false });
                }
            } else { 
                // Reclaim (UÃ¦ndret)
                playSound('click'); 
                commitAction({ priorityPlayerIdx: seatIdx, defenders: [], isPaused: false }); 
            }
        }


      
        




        
        
        else {
             // NAP LOGIC (UPDATED: Interrupt is now SPEAK)
            if (hasPriority) {
                 // Hvis jeg allerede har prioritet (f.eks. efter en normal interrupt), sÃƒÆ’Ã‚Â¥ afslut
                 playSound('click'); 
                 commitAction({ priorityPlayerIdx: activePlayerIdx, isPaused: false, usedDelayBuffer: 0 }); 
            } else { 
                // NYT: I stedet for "INTERRUPT" -> "OPEN STACK"
                if (stackState === 'none') {
                    
                    commitAction({ 
                        stackState: 'open', 
                        stackOwnerIdx: seatIdx, 
                        usedDelayBuffer: 0,
                        pendingAttacks: [],
                        targetingPlayerIdx: -1
                    });
                }
            }
        }
    };



  // --- DRAG & DROP STATE (LOBBY ONLY - INSERTION LOGIC) ---
    // Vi tilfÃ¸jer 'hoverIdx' for at kunne vise visuel feedback mens man trÃ¦kker
    const [dragState, setDragState] = useState({ active: false, idx: null, x: 0, y: 0, hoverIdx: null, isHoveringBigButton: false });
    const dragTimeout = useRef(null);

        // LOGIK: Flyt spiller (Insert/Squeeze) i stedet for Swap
    const movePlayer = (fromIdx, toIdx) => {
        if (fromIdx === toIdx || fromIdx === null || toIdx === null) return;
        
        // FIX: Tag altid den friskeste liste direkte fra serveren
        const currentPlayers = remoteStressState?.players || players;
        let newPlayers = [...currentPlayers];
        
        // 1. Tag spilleren UD af listen
        const [movedPlayer] = newPlayers.splice(fromIdx, 1);
        
        // 2. SÃ¦t spilleren IND pÃ¥ den nye plads
        newPlayers.splice(toIdx, 0, movedPlayer);

        if (fromIdx === seatIdx) {
            const myNewIndex = newPlayers.indexOf(movedPlayer);
            if (myNewIndex !== -1) {
                setLocalSeat(String(myNewIndex));
                localStorage.setItem('stress_seat', myNewIndex);
            }
        }

        const currentActiveName = currentPlayers[activePlayerIdx]?.name; 
        const newActiveIdx = newPlayers.findIndex(p => p.name === currentActiveName);
        
        let updates = { 
            activePlayerIdx: newActiveIdx !== -1 ? newActiveIdx : activePlayerIdx,
            priorityPlayerIdx: newActiveIdx !== -1 ? newActiveIdx : priorityPlayerIdx
        };

        playSound('click');
        if (navigator.vibrate) handleVibrate(50);
        
        commitAction(updates, newPlayers);
    };


   // Global Move Listener (Skudsikker til Desktop & Mobile)
    useEffect(() => {
        if (!dragState.active) return;

        const handleMove = (e) => {
            // Sikkerhed: Hvis det ER et pointer event, og ID'et ikke matcher, sÃ¥ ignorer (Multi-touch safe)
            if (e.pointerId !== undefined && dragState.pointerId !== null && e.pointerId !== dragState.pointerId) return;

            // Find koordinater uanset om det er TouchEvent eller PointerEvent
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            // Juster for appens centrering pÃ¥ store skÃ¦rme (Ghost offset)
            let ghostX = clientX;
            let ghostY = clientY;
            const container = document.getElementById('app-container');
            if (container) {
                const rect = container.getBoundingClientRect();
                ghostX -= rect.left;
                ghostY -= rect.top;
            }
            
            dragJustFinishedRef.current = true; 

            const ghost = document.getElementById('drag-ghost');
            if (ghost) ghost.style.visibility = 'hidden';
            
            // elementFromPoint SKAL bruge de absolutte viewport-koordinater (clientX/Y)
            const element = document.elementFromPoint(clientX, clientY);
            if (ghost) ghost.style.visibility = 'visible';
            
            const targetBubble = element?.closest('[data-seat-idx]');
            const newHoverIdx = targetBubble ? parseInt(targetBubble.getAttribute('data-seat-idx')) : null;

            const isOverBigButton = !!element?.closest('#big-button-hitbox');

            setDragState(prev => ({ 
                ...prev, 
                x: ghostX, 
                y: ghostY, 
                hoverIdx: newHoverIdx,
                isHoveringBigButton: isOverBigButton
            }));
        };

        const handleUp = (e) => {
            if (e.pointerId !== undefined && dragState.pointerId !== null && e.pointerId !== dragState.pointerId) return;

            const finalHoverIdx = dragState.hoverIdx;
            
            // Nede i Drag-lytteren 'handleUp'
            if (dragState.isHoveringBigButton && !isGameStarted) {
                executeShuffle(); // Hjernen klarer det hele!
            }
            else if (finalHoverIdx !== null && dragState.idx !== null) {
                movePlayer(dragState.idx, finalHoverIdx);
            }

            setDragState({ active: false, idx: null, x: 0, y: 0, hoverIdx: null, isHoveringBigButton: false, pointerId: null });

            dragJustFinishedRef.current = true;
            setTimeout(() => { dragJustFinishedRef.current = false; }, 100);
        };

        // Lytter pÃ¥ BÃ…DE pointer og touch for at undgÃ¥ at browseren afbryder trÃ¦kket
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [dragState.active, dragState.hoverIdx, dragState.isHoveringBigButton, dragState.pointerId, players, activePlayerIdx]);



  


  

    // --- NEMESIS SLIDER LOGIC (RESTORED) ---
    const sliderRef = useRef(null);
    const startY = useRef(0);
    const isDragging = useRef(false);

    const handleSlideStart = (e) => {
        // Stop evt. scroll eller andre kliks
        e.stopPropagation(); 
        isDragging.current = true;
        // Support for bÃƒÆ’Ã‚Â¥de Touch og Mouse
        startY.current = e.touches ? e.touches[0].clientY : e.clientY;
    };

    const handleSlideMove = (e) => {
        if (!isDragging.current) return;
        
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - startY.current;
        const maxDrag = 180; 

        // BegrÃƒÆ’Ã‚Â¦ns trÃƒÆ’Ã‚Â¦kket
        const newOffset = Math.max(0, Math.min(deltaY, maxDrag));
        setDragOffset(newOffset);
    };

    const handleSlideEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const maxDrag = 180; 
        const threshold = maxDrag * 0.90; 

        if (dragOffset > threshold) {
            // Sikkerhedscheck: Har vi en nemesis?
            if (nemesisIdx !== -1) {
                if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
                playSound('horse'); 
                
                commitAction({ 
                    defenders: [nemesisIdx], 
                    priorityPlayerIdx: -1, 
                    pendingAttacks: [], 
                    usedDelayBuffer: 0, 
                    isPaused: false 
                });
            }
        }
        setDragOffset(0);
    };
  
   // --- NY POINTER & KEEP ALIVE LOGIK ---
    const isPointerDownRef = useRef(false);
    
    // Feature: Keep Alive (Heartbeat hvert 5. sekund)
    useEffect(() => {
        const keepAliveTimer = setInterval(() => {
            // FIX: Vi SKAL ændre værdien for at tvinge en re-render
            setTick(t => t + 1); 
        }, 5000);
        return () => clearInterval(keepAliveTimer);
    }, []);

    const handlePointerDown = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        isPointerDownRef.current = true; 
        isLongPressHandled.current = false;
        
        // 1. Kør state for den visuelle 3D-nedtrykning
        setIsBigButtonPressed(true);
        
        // 2. Kør en lille, skarp vibration HVER gang man rører knappen (15ms er perfekt til et "klik")
        handleVibrate(35); 
        
        if (!isMe || !isGameStarted || penaltyPending || isPaused) return; 
        
        longPressTimer.current = setTimeout(() => {
            if (isPointerDownRef.current) {
                isLongPressHandled.current = true; 
                actionLock.current = true;
                if (navigator.vibrate) handleVibrate(200); // Den tunge vibration til long press
                
                const now = Date.now();
                const elapsed = now - lastActionAt;
                const used = Math.min(elapsed, (activeConfig.turnDelaySec || 0) * 1000);
                
                commitAction({ isPaused: true, usedDelayBuffer: used }); 
                
                setTimeout(() => { actionLock.current = false; }, 500);
            }
        }, 600); 
    };

    const handlePointerUp = (e) => {
        setIsBigButtonPressed(false); // Giv slip visuelt
        
        if (!isPointerDownRef.current) return;
        isPointerDownRef.current = false; 
        
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        
        if (!isLongPressHandled.current) {
            handleBigButton();
        }
    };

    const handlePointerCancel = () => {
        setIsBigButtonPressed(false); // Giv slip visuelt, hvis fingeren glider af
        isPointerDownRef.current = false;
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    

  // --- BREATHER ENGINE (ROBUST SYNC) ---
    useEffect(() => {
        // KÃ¸r kun hvis vi faktisk er i breather mode
        if (isGameStarted && isBreatherActive && breatherEndsAt > 0) {
            
            const interval = setInterval(() => {
                const now = Date.now();
                
                // Er tiden gÃ¥et?
                if (now >= breatherEndsAt) {
                    clearInterval(interval);
                    
                    // FAILSAFE LOGIK:
                    // Normalt lader vi Active Player lÃ¥se op.
                    // Men hvis der er gÃ¥et 2 sekunder over tiden (spillet hÃ¦nger), 
                    // sÃ¥ mÃ¥ HVEM SOM HELST lÃ¥se op.
                    const isLagging = now > (breatherEndsAt + 2000);
                    const amIAuth = seatIdx === activePlayerIdx || seatIdx === priorityPlayerIdx;

                    if (amIAuth || isLagging) {
                        console.log("Breather finished. Starting Turn Clock.");
                        playSound('bell'); 
                        if (navigator.vibrate) handleVibrate([50, 50, 50]);
                        
                        commitAction({
                            isBreatherActive: false,
                            breatherEndsAt: 0,
                            // HER starter vi uret! FÃ¸rst nu begynder Warmup.
                            lastActionAt: Date.now() 
                        });
                    }
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isGameStarted, isBreatherActive, breatherEndsAt, seatIdx, activePlayerIdx, priorityPlayerIdx]);






  


    // --- AUTO-START CLOCK (FIX FOR CLOCK SKEW) ---
    useEffect(() => {
        // Hvis spillet kÃ¸rer, og det er MIN tur (eller jeg er stack owner), men tiden er "0"
        // SÃ¥ betyder det, at turen lige er blevet sendt til mig, og jeg skal starte mit ur.
        if (isGameStarted && !isPaused && !penaltyPending && lastActionAt === 0) {
            const amIActive = (stackState === 'none' && isMe && hasPriority) || 
                              (stackState === 'open' && isMe && seatIdx === stackOwnerIdx);
            
            if (amIActive) {
                console.log("Auto-starting clock to fix skew");
                // Vi sender kun en tids-opdatering, ingen logik Ã¦ndringer.
                // Det tvinger uret i gang pÃ¥ denne enhed.
                commitAction({ lastActionAt: Date.now() });
            }
        }
    }, [isGameStarted, isPaused, penaltyPending, lastActionAt, isMe, hasPriority, stackState, seatIdx, stackOwnerIdx]);

    // --- SIKKERHEDS-TJEK: PRE-RENDER ---
    // Hvis vi ikke har modtaget spillere fra serveren endnu, stopper vi alt her for at undgÃ¥ et fatalt crash.
    if (!players || players.length === 0) {
        return (
            <div className="fixed inset-0 bg-[#080808] flex items-center justify-center z-[999]">
                <div className="text-white p-10 font-bold uppercase tracking-widest animate-pulse drop-shadow-lg">
                    Loading Battle Data...
                </div>
            </div>
        );
    }

    // --- RENDER LOGIC ---
    const myTime = isMe ? calculateTimeForPlayer(seatIdx) : 0;
    const inBuffer = isInsideDelayBuffer() && !isPaused && !penaltyPending;
    
    // Determine active name
    let nextValidIdx = (activePlayerIdx + 1) % players.length;
    let checkAttempts = 0;
    while (checkAttempts < players.length) {
        const p = players[nextValidIdx];
        if (p && p.name && !p.name.startsWith("Open Seat") && !p.is_dead) break;
        nextValidIdx = (nextValidIdx + 1) % players.length;
        checkAttempts++;
    }
    const nextPlayerName = players[nextValidIdx]?.name || "Next";
    const activePlayerName = players[activePlayerIdx]?.name || "Unknown";

    // DEFINE isCountingDownForMe HERE
    const isCountingDownForMe = !isPaused && isGameStarted && !penaltyPending && !isBreatherActive && // <--- NY: Tving ro pÃ¥ under Breather
  
        (
            // 1. Combat (HÃ¸jest)
            defenders.includes(seatIdx) || 
            
            // 2. Stack Holder (Jeg er offer for forced gimme)
            (stackState === 'open' && stackHolders && stackHolders.includes(seatIdx)) ||
            
            // 3. Stack Owner (TÃ¦ller KUN hvis jeg er alene - ingen holders)
            (stackState === 'open' && stackOwnerIdx === seatIdx && (!stackHolders || stackHolders.length === 0)) || 
            
            // 4. Normal tur (AP)
            (stackState === 'none' && defenders.length === 0 && seatIdx === priorityPlayerIdx) 
        );

    const isEerie = isMe && myTime <= 30 && myTime > 0 && isGameStarted && !isPaused && !penaltyPending;

   // --- GLOBAL DOOM CALCULATION (SECOND BEST LOGIC) ---
    const DOOM_THRESHOLD = 0.3; // Start fade nÃƒÆ’Ã‚Â¥r nr. 2 falder under 50% styrke

    let doomFactor = 0;
    let tableHealthDebug = 100;
    let debugError = "";

    try {
        if (isGameStarted && Array.isArray(players)) {
            const activeSurvivorIndices = players
                .map((p, i) => ({ ...p, originalIdx: i }))
                // Vi kigger pÃƒÆ’Ã‚Â¥ alle der sidder ved bordet (ogsÃƒÆ’Ã‚Â¥ zombier med 1 HP)
                .filter(p => p && p.is_seated && p.name && !p.name.startsWith("Open Seat"))
                .map(p => p.originalIdx);
            
            // Vi skal bruge mindst 2 spillere for at vurdere en "kamp"
            if (activeSurvivorIndices.length > 1) {
                 const startMin = activeConfig?.startTimeMin || 20;
                 const startSec = startMin * 60;

                 // 1. Beregn Score for HVER spiller individuelt
                 const playerScores = activeSurvivorIndices.map(idx => {
                     const p = players[idx];
                     const currentHP = Math.max(0, p.lt || 0);
                     const hpScore = Math.min(1, currentHP / 20);
                     
                     const timeLeft = calculateTimeForPlayer(idx);
                     const timeScore = startSec > 0 ? Math.min(1, Math.max(0, timeLeft / startSec)) : 1;
                     
                     const drunkPenalty = (p.drunk || 0) * 0.04; // 4% straf pr genstand

                     // VÃƒÆ’Ã‚Â¦gtning: 85% Liv, 15% Tid - minus Sprit
                     let score = (hpScore * 0.85) + (timeScore * 0.15) - drunkPenalty;
                     return Math.max(0, score);
                 });

                 // 2. Sorter: StÃƒÆ’Ã‚Â¦rkeste ÃƒÆ’Ã‚Â¸verst -> Svageste nederst
                 // Eks: [0.95 (King), 0.10 (DÃƒÆ’Ã‚Â¸ende), 0.05 (Zombie)]
                 playerScores.sort((a, b) => b - a);

                 // 3. KIG PÃƒÆ’Ã¢â‚¬Â¦ NR. 2 (Index 1)
                 // Dette er "Barrieren". SÃƒÆ’Ã‚Â¥ lÃƒÆ’Ã‚Â¦nge Nr. 2 er stÃƒÆ’Ã‚Â¦rk, kÃƒÆ’Ã‚Â¸rer spillet videre.
                 // Hvis Nr. 2 falder, er der snart kun 1 tilbage (Nr. 1).
                 const secondBestScore = playerScores[1]; 
                 
                 tableHealthDebug = secondBestScore; // Vis i debug boksen

                 // 4. Beregn Doom baseret pÃƒÆ’Ã‚Â¥ Nr. 2's tilstand
                 if (secondBestScore > DOOM_THRESHOLD) {
                     doomFactor = 0; 
                 } else {
                     // Jo tÃƒÆ’Ã‚Â¦ttere Nr. 2 er pÃƒÆ’Ã‚Â¥ 0, jo mere Doom
                     const progress = (DOOM_THRESHOLD - secondBestScore) / DOOM_THRESHOLD;
                     doomFactor = 0.2 + (0.8 * progress);
                 }

                 doomFactor = Math.min(1, Math.max(0, doomFactor));
            }
        }
    } catch (err) {
        console.error("Doom calc error:", err);
        doomFactor = 0;
        debugError = err.message;
    }



    // --- New color scheme --- 

  // --- BUTTON TEXT LOGIC (HIERARCHY FIXED) ---
    let btnText = "SOMETHING'S AFOOT...", btnSub = "", btnColorClass = "border-stone-700 text-stone-500", glow = "";
    
    // Check if time is explicitly stopped/frozen logic
    const isGlobalFreeze = isPaused || stackState === 'frozen' || isDamagePhase;

    
    
    // COLOR PALETTE
    const colorBlue = "border-cyan-400 text-cyan-50 bg-cyan-900/80 shadow-[0_0_60px_rgba(34,211,238,0.4)]";
    const colorRed = "border-red-500 text-red-50 bg-red-900/40";
    const colorGreen = "border-emerald-400 text-emerald-50 bg-emerald-500/10";
    const colorPurple = "border-purple-500 text-purple-50 bg-purple-900/40";
    const colorGray = "border-stone-600 text-stone-400 bg-stone-900/40 hover:text-white hover:border-stone-500 animate-none";

    // 1. NOT STARTED (WHITE)
    if (!isGameStarted) { 
        // --- DRAG MODE OVERRIDE ---
        if (dragState.active) {
            if (dragState.isHoveringBigButton) {
                // HOVER STATE: GÃ¸r den helt vildt tydelig (Gul/Hvid + Scale)
                btnText = "RELEASE TO SHUFFLE"; 
                btnSub = "RANDOMIZE ORDER"; 
                btnColorClass = "border-yellow-400 text-black bg-yellow-500 shadow-[0_0_50px_rgba(250,204,21,0.6)] scale-105 animate-pulse";
            } else {
                // DRAG STATE (Men ikke over knappen): GrÃ¥ og stiplet
                btnText = "SHUFFLE PLAYERS"; 
                btnSub = "DROP HERE"; 
                btnColorClass = "border-dashed border-stone-600 text-stone-500 bg-black/40"; 
            }
        } else {
            // NORMAL START KNAP
            btnText = "START"; btnSub = ""; btnColorClass = "border-white text-white bg-white/10 animate-pulse"; 
        }
    }
    
    // 2. GLOBAL FREEZE (BLÃ…) - Tiden stÃ¥r stille for ALLE
    else if (isGlobalFreeze) {
        btnColorClass = colorBlue; 

        if (isPaused) { 
           if (isMyTurn) { 
                // Det er DIN tur til at unpause
                btnText = "PAUSED"; btnSub = "RESUME GAME"; 
                btnColorClass += " animate-heartbeat"; 
            } else { 
                // Det er en andens tur. Vi finder ud af hvem vi venter pÃ¥.
                // Vi prioriterer Stack Owner. Hvis ingen ejer stacken (-1), venter vi pÃ¥ Active Player.
                const targetIdx = stackOwnerIdx !== -1 ? stackOwnerIdx : activePlayerIdx;
                
                // Hent navnet sikkert. Hvis det fejler, brug "PLAYER"
                const targetName = players[targetIdx]?.name?.toUpperCase() || "SOMEONE";

                btnText = "PAUSED & WAITING"; 
                btnSub = `FOR ${targetName} TO RESUME THE GAME`; 
            }
        }
        else if (isDamagePhase) {
            if (isMe && isMyTurn) { btnText = "SOMETHING'S AFOOT...", btnSub = "", btnColorClass = "border-stone-700 text-stone-500", glow = ""; } 
            else { btnText = "WAITING"; btnSub = ""; }
        }
        else if (stackState === 'frozen') {
            if (seatIdx === stackOwnerIdx) { btnText = "ANYONE ELSE?"; btnSub = "PRESS TO RESUME THE GAME"; 
                // RETTELSE: PrÃ¦cis samme animation som PAUSE (animate-heartbeat)
                btnColorClass += " animate-heartbeat"; 
            } 
            else { btnText = "YES, GIMME!"; btnSub = "TAKE THE TORCH"; }
        }
    } 


      
      
 


    // BREATHER MODE (PINK)
    else if (isBreatherActive) {
        // Beregn tiden der er tilbage
        const targetTime = breatherEndsAt > 0 ? breatherEndsAt : Date.now() + (activeConfig.breatherSec * 1000);
        const timeLeftMS = Math.max(0, targetTime - Date.now());
        
        // SKEW FIX: Vi capper visningen.
        // Selvom der er 7 sekunder tilbage (pga. buffer), viser vi kun 5 (config max).
        // Dette fÃ¥r tÃ¦lleren til at "hÃ¦nge" lidt pÃ¥ 5-tallet i starten, hvilket sikrer sync.
        const rawSec = Math.ceil(timeLeftMS / 1000);
        const displaySec = Math.min(activeConfig.breatherSec, rawSec);
        
        btnText = "BREATH";
        btnSub = `Resuming game in ${activeConfig.breatherSec} sec`;
        // KUN farver og skygge. INGEN animationer.
        btnColorClass = "border-pink-500 text-pink-50 bg-pink-900/40 shadow-[0_0_50px_rgba(236,72,153,0.3)]";
    }  


      


    // 3. ACTIVE GAMEPLAY (isMe check)
    else if (isMe) {
        
        // --- PRIORITY 1: COMBAT (DEFENDING) ---
        // Trumfer alt. Hvis du bliver angrebet, skal du forsvare dig.
        if (defenders.includes(seatIdx)) {
             btnText = "ALL EYES ON YOU!"; btnSub = "PRESS TO PASS TORCH";
             btnColorClass = `${colorRed} animate-violent`;
        }

        // --- PRIORITY 2: TARGETING (DECLARE) ---
        // Hvis du har valgt nogen, skal du se "DECLARE" (ogsÃ¥ i stack mode)
        else if (pendingTargets.length > 0) {
            if (seatIdx === targetingPlayerIdx) {
                btnText = "DECLARE"; btnSub = `${pendingTargets.length} TARGETS`; 
                btnColorClass = `${colorRed} shadow-[0_0_60px_rgba(220,38,38,0.4)] animate-violent`;
            } else if (isMyTurn) {
                btnText = "WAITING"; btnSub = ""; 
                btnColorClass = colorGray; 
            }
        }

        // --- PRIORITY 3: OPEN STACK ---
        else if (stackState === 'open') {
            
            // A. Er jeg Stack Owner?
            if (seatIdx === stackOwnerIdx) {
                // Hvis elastikken er ude (nogen holder stacken), venter jeg
                if (stackHolders && stackHolders.length > 0) {
                    const holderName = players[stackHolders[0]]?.name || "VICTIM";
                    btnText = "WAITING"; btnSub = `${holderName} HAS THE FLOOR`; 
                    btnColorClass = colorGray; // GrÃ¥ = Min tid brÃ¦nder IKKE
                } else {
                    // Ingen holders = Min tid brÃ¦nder
                    btnText = "THAT'S ALL"; btnSub = "PRESS TO OPEN THE FLOOR"; 
                    btnColorClass = `${colorPurple} animate-pulse`; 
                }
            } 
            
            // B. Er jeg en Stack Holder (Offer)?
            else if (stackHolders && stackHolders.includes(seatIdx)) {
                btnText = "DONE"; btnSub = "PRESS TO RETURN THE TORCH";
                // Lilla + Violent, fordi det er stack mode, men du brÃ¦nder tid!
                btnColorClass = `${colorPurple} animate-violent`; 
            }
            
            // C. Tilskuer
            else {
                btnText = "WAITING"; btnSub = `${players[stackOwnerIdx]?.name} IS DOING STUFF`; 
                btnColorClass = colorGray; 
            }
        }

        // --- PRIORITY 4: MY TURN (ACTIVE PLAYER) ---
        else if (isMyTurn) {
            if (hasPriority) {
                 btnText = "PASS TURN"; btnSub = "" ; 
                 btnColorClass = colorGreen; 
                 glow = "shadow-[0_0_80px_rgba(16,185,129,0.2)]"; 
            } else { 
                btnText = "RECLAIM TORCH"; btnSub = "IT IS YOUR TURN, PRESS TO TAKE BACK THE TORCH"; 
                btnColorClass = colorGray; 
                glow = "shadow-[0_0_80px_rgba(120,113,108,0.2)]"; 
            }
        } 
        
        // --- PRIORITY 5: NAP (PASSIVE) ---
        else {
            if (hasPriority) {
                 btnText = "DONE"; btnSub = `RETURN TORCH TO ${activePlayerName.toUpperCase()}`; 
                 btnColorClass = colorGray; 
            } else { 
                btnText = "OPEN STACK"; btnSub = "PRESS TO TAKE THE TORCH"; 
                btnColorClass = colorGray;
            }
        }
    }
      


 // --- NYT: CHILL THE FUCK DOWN PROTOCOL (LOCAL) ---
    if (isChillMode || isBigButtonPressed) { // <--- TILFØJET isBigButtonPressed
        btnColorClass = btnColorClass.replace(/\banimate-[\w-]+\b/g, '');
        if (isChillMode) glow = ""; // Fjern kun glow permanent, hvis vi faktisk er i chill mode
    }
    
    

    // --- SAFETY VALVE: HARD RULE ---
    // Hvis teksten er WAITING, fjerner vi ALT andet og tvinger den til statisk grÃ¥.
    // Dette sikrer, at animationer fra tidligere states (violent/pulse) dÃ¸r med det samme.
    if (btnText === "WAITING") {
        btnColorClass = colorGray;
    }
    

    // --- SIKKER ONBOARDING LOGIK ---
// Tvinger IDENTIFY-skÃ¦rmen frem, hvis man ikke har en plads, pladsen er slettet, eller man blev kicket.
const showJoinScreen = !isMe || !me || !me.is_seated || (me.name && me.name.startsWith("Open Seat"));


 // --- RENDER PREP: EXPANSION PROTOCOL ---
    // Vi fanger signalet om en ny animation FÃ˜R useEffect overhovedet er kÃ¸rt, sÃ¥ vi forhindrer et 1ms flash!
    const isIncomingShuffle = globalAnim?.id !== localAnimId && globalAnim?.type === 'SHUFFLE';
    
    // Hvis vi har et frosset snapshot ELLER er i millisekundet fÃ¸r animationen starter, sÃ¥ brug de gamle spillere
    const renderPlayers = (frozenSnapshot || isIncomingShuffle) ? prevPlayersRef.current : players;

    const targetBubbles = renderPlayers.map((p, i) => ({ ...p, originalIdx: i })).filter(p => {
        // SCENARIE 1: Vi er i gang med at dragge (Lobby) -> VIS ALT
        if (dragState.active) return true;

       // SCENARIE 2: Normal visning -> Skjul Open Seats OG DÃ˜DE SPILLERE
        return p.is_seated && !p.name.startsWith("Open Seat") && !p.is_dead;
    });
  

      return (
        // TILFÃ˜JET: id="app-container" sÃ¥ vi kan mÃ¥le pÃ¥ den senere
        <div id="app-container" className={containerClass}>
            <style>{styles}</style>

            {/* --- 1. ROTATION WARNING OVERLAY (Skjult som standard via CSS) --- */}
            <div id="rotate-warning" className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-300">
                <div className="bg-stone-900 border-2 border-red-600 p-8 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center gap-6">
                    <RotateCcw size={60} className="text-red-500 animate-spin-slow" /> {/* Brug evt. 'Smartphone' ikon hvis du har */}
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Portrait Mode Only</h2>
                        <p className="text-stone-400 font-bold text-sm uppercase tracking-wider">Please rotate your device<br/>to continue battle</p>
                    </div>
                </div>
            </div>

            {/* --- 2. THE ACTUAL GAME (Wrapped in ID for toggle) --- */}
            <div id="game-root" className="contents">

           
            {/* 1. EERIE BACKGROUND LAYER (Ligger bagved alt - z-0) */}
                {/* Vi fjerner backdrop-filter herfra, sÃ¥ den kun stÃ¥r for farve/lys */}
                <div className={`absolute inset-0 pointer-events-none transition-all duration-500 z-0 ${isEerie && !isChillMode ? 'animate-panic' : ''}`}></div>

            {/* 2. TURN/ROUND COUNTERS (Ligger ovenpÃ¥ Eerie, men under Blur) */}
            <div className="absolute top-5 left-4 z-0 pointer-events-none select-none flex flex-col items-center opacity-40">
                <span className="text-[9px] font-bold text-stone-700 uppercase tracking-[0.3em] mb-[-2px]">TURN</span>
                <span className="text-5xl font-black text-stone-800 font-mono tracking-tighter tabular-nums leading-none">
                    {turnCount + 1}
                </span>
            </div>

           {(() => {
                // NY LOGIK: Vi kigger kun pÃ¥ den aktive spiller.
                // Hvis han har gennemfÃ¸rt 0 ture fÃ¸r, er han i gang med sin 1. tur (Runde 1).
                // Hvis han har gennemfÃ¸rt 1 tur fÃ¸r, er han i gang med sin 2. tur (Runde 2).
                const activeP = players[activePlayerIdx];
                
                const currentRound = (isGameStarted && activeP)
                    ? (activeP.turns_played || 0) + 1
                    : 1;
                
                return (
                    <div className="absolute top-5 right-4 z-0 pointer-events-none select-none flex flex-col items-center opacity-40">
                        <span className="text-[9px] font-bold text-stone-700 uppercase tracking-[0.3em] mb-[-2px]">ROUND</span>
                        <span className="text-5xl font-black text-stone-800 font-mono tracking-tighter tabular-nums leading-none">
                            {currentRound}
                        </span>
                    </div>
                );
            })()}

            {/* 3. DRUNK BLUR LAYER (Ligger foran alt - z-45) */}
            {/* Denne har KUN ansvaret for at slÃ¸re skÃ¦rmen */}
            <div 
                className="absolute inset-0 pointer-events-none transition-all duration-500 z-[345]" 
                style={{ backdropFilter: `blur(${blurAmount}px)` }}
            ></div>
            
            {/* ... Herfra kommer dine overlays (Global Penalty, etc) ... */}

          
          

            
            

            {/* ... Overlays start here ... */}



            {/* GLOBAL PENALTY OVERLAY (DEBT MODE) */}
            {globalPenaltyPending && (
            <div className="fixed inset-0 z-[210] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300"
             // ... resten af dine styles ...
                     // VISUAL FIX: Gradient baggrund der fader ud i bunden, sÃ¥ man kan se sine stats hjul
                     style={{ background: 'linear-gradient(to bottom, rgba(69, 10, 10, 0.95) 0%, rgba(69, 10, 10, 0.95) 70%, rgba(69, 10, 10, 0) 100%)' }}
                >
                    <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-2 text-center animate-pulse">GLOBAL PAUSE TIME RAN OUT</h1>
                    
                    {/* EVIL TIMER DISPLAY */}
                    <div className="text-6xl font-mono font-black text-red-500 mb-4 animate-violent tabular-nums">
                        {formatTime(Math.max(0, calculateGlobalTime()))}
                    </div>

                    <p className="text-stone-400 font-bold uppercase tracking-widest mb-8 text-center">Clear your debt to survive</p>
                    
                    <div className="w-full max-w-md bg-black/50 border border-red-900/50 rounded-xl p-4 mb-8">
                        {players.map((p, i) => {
                            if (!p.is_seated || p.name.startsWith("Open Seat") || p.is_dead) return null;
                            const debt = p.global_debt || 0;
                            const isClear = debt <= 0;
                            
                            return (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                                    <span className={isClear ? "text-emerald-500 line-through opacity-50" : "text-white font-bold"}>{p.name}</span>
                                    {isClear ? (
                                        <div className="flex items-center gap-2 text-emerald-500"><CheckCircle size={20}/><span className="text-xs font-bold">PAID</span></div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-500 animate-pulse font-black">
                                            <span className="text-xs uppercase mr-2">OWES</span>
                                            <span className="text-xl bg-red-900/50 px-2 rounded">{debt}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ACTION BUTTONS LOGIC */}
                    {(() => {
                        if (!isMe || !me) return null;
                        const myDebt = me.global_debt || 0;
                        
                        // Beregn om jeg venter pÃ¥ andre (LOCKSTEP LOGIC)
                        const livingPlayers = players.filter(p => p.is_seated && !p.name.startsWith("Open Seat") && !p.is_dead);
                        const maxDebt = Math.max(...livingPlayers.map(p => p.global_debt || 0));
                        const isWaitingForOthers = myDebt < maxDebt && myDebt > 0;

                        if (myDebt > 0) {
                            return (
                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm relative">
                                    {/* WAITING OVERLAY (Hvis jeg er foran) */}
                                    {isWaitingForOthers && (
                                        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl border border-stone-600">
                                            <span className="text-white font-black uppercase tracking-widest animate-pulse">WAITING FOR OTHERS...</span>
                                        </div>
                                    )}
                                    
                                     <button disabled={isWaitingForOthers} onClick={() => handleGlobalPay('life')} className="py-6 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl shadow-xl active:scale-95 flex flex-col items-center gap-1"><Heart size={24}/> <span>PAY {activeConfig.penaltyLife} LIFE</span></button>
                                     <button disabled={isWaitingForOthers} onClick={() => handleGlobalPay('drink')} className="py-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl shadow-xl active:scale-95 flex flex-col items-center gap-1"><Beer size={24}/> <span>PAY {activeConfig.penaltyDrinks} DRINK</span></button>
                                </div>
                            );
                        } else {
                             return (
                                <div className="text-emerald-400 font-bold uppercase tracking-widest animate-pulse bg-emerald-900/20 px-6 py-4 rounded-xl border border-emerald-500/30">
                                    YOU HAVE PAID YOUR DEBTS
                                </div>
                            );
                        }
                    })()}

                    {/* RESET KNAP */}
                    <button 
                        onClick={handleResetGame} 
                        className="mt-12 px-6 py-3 bg-stone-900/50 border border-stone-800 text-stone-600 font-bold uppercase tracking-widest rounded-lg hover:bg-red-900/20 hover:text-red-500 hover:border-red-900 transition-all flex items-center gap-2 text-xs"
                    >
                        <RotateCcw size={14} /> Reset Game
                    </button>
                </div>
            )}



          


          
            
          
            {penaltyPending && (
                <div className="fixed inset-0 z-[200] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-pulse-red text-center">
                    <AlertTriangle size={80} className="text-red-500 mb-6 animate-bounce"/>
                    <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-2">TIME EXPIRED</h1>
                    <p className="text-xl text-red-300 font-bold uppercase tracking-widest mb-8">{players[priorityPlayerIdx]?.name} must pay the price</p>
                    {isMe && seatIdx === priorityPlayerIdx ? (
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                             <button onClick={handlePayLife} className="col-span-1 py-6 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl shadow-xl active:scale-95 flex flex-col items-center gap-2"><Heart size={24}/> <span>Lose {activeConfig.penaltyLife} Life</span></button>
                             <button onClick={handlePayDrink} className="col-span-1 py-6 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-xl shadow-xl active:scale-95 flex flex-col items-center gap-2"><Beer size={24}/> <span>Drink {activeConfig.penaltyDrinks}</span></button>
                             <button onClick={handlePenaltyElimination} className="col-span-2 py-4 bg-stone-800 text-stone-400 font-bold uppercase tracking-widest rounded-xl border border-stone-600 active:scale-95 hover:text-white flex items-center justify-center gap-2"><Skull size={18}/> Eliminate Me</button>
                        </div>
                    ) : ( <div className="text-stone-400 animate-pulse">Waiting for player decision...</div> )}
                {/* NY RESET KNAP - Placeres i bunden af Penalty Overlay */}
                    <button 
                        onClick={handleResetGame} 
                        className="mt-8 px-6 py-3 bg-transparent border border-stone-800 text-stone-600 font-bold uppercase tracking-widest rounded-lg hover:bg-stone-900 hover:text-stone-400 transition-all flex items-center gap-2 text-xs"
                    >
                         <RotateCcw size={14} /> Reset Game
                    </button>
                </div>
            )}
          
            {deathCheckReason && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                    <Skull size={80} className="text-stone-700 mb-6 animate-pulse"/>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 text-center">{deathCheckReason === 'life' ? 'ARE YOU... ARE YOU DEAD?' : 'YOU DEAD?'}</h1>
                    <div className="flex flex-col gap-4 w-full max-w-sm mt-10">
                        <button onClick={handleConfirmDeath} className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.2em] rounded-sm">YES, I AM DEAD</button>
                        <button onClick={() => setDeathCheckReason(null)} className="w-full py-4 border border-stone-700 text-stone-500 font-bold uppercase">NO, I MAGICALLY SURVIVE</button>
                    </div>
                </div>
            )}
             {showJoinScreen && (
                <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
                    <Crown size={60} className="text-stone-700 mb-8 animate-pulse" />
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 text-center">IDENTIFY YOURSELF</h1>
                    <div className="w-full max-w-xs flex flex-col gap-4 mt-8">
                        <input type="text" value={joinName} onChange={(e) => setJoinName(e.target.value)} placeholder="CALLSIGN" className="w-full bg-stone-900/50 border border-stone-700 text-white text-center font-black text-2xl uppercase tracking-widest py-4 focus:outline-none focus:border-yellow-500" />
                        <button onClick={() => handleSmartJoin(joinName)} disabled={!joinName.trim()} className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-yellow-400 disabled:opacity-50">CONFIRM</button>
                    </div>
                </div>
            )}
            
  

  
           {/* --- ULTIMATE VICTORY SCREEN (DETAILED STATS) --- */}
           {isGameStarted && !victoryDismissed && (remoteStressState?.turnCount || 0) > 0 && 
              // 1. STRENG REGEL: Vi viser KUN victory, nÃ¥r straf-runden er HELT slut.
              !globalPenaltyPending && 
              (
                  // 2. Og der er 1 eller 0 survivors tilbage
                  players.filter(p => p.is_seated && !p.is_dead && !p.name.startsWith("Open Seat")).length <= 1
              ) && (() => {


             



          

            
          
           
                // 1. DATA CRUNCHING
                const totalGameTime = activeConfig.startTimeMin * 60;
                
                const statsMap = players.map((p, myIdx) => {
                    if (!p.is_seated || p.name.startsWith("Open Seat")) return null;
                    
                    // A. OUTGOING (Hvem har JEG smadret?)
                    // Vi kigger i alle andres "grudges" for at se, om JEG stÃƒÂ¥r der.
                    let damageDealt = 0;
                    let drinksServed = 0;
                    let victims = []; 

                    players.forEach((victim, vIdx) => {
                        if (myIdx === vIdx || !victim.grudges) return;
                        const grudge = victim.grudges[myIdx]; // Har offeret et grudge mod mig (myIdx)?
                        if (grudge) {
                            const d = grudge.damage || 0;
                            const dr = grudge.drinks || 0;
                            if (d > 0 || dr > 0) {
                                damageDealt += d;
                                drinksServed += dr;
                                victims.push({ name: victim.name, dmg: d, drk: dr });
                            }
                        }
                    });

                    // B. INCOMING (Hvem har smadret MIG?)
                    // Vi kigger i MINE egne "grudges".
                    let nemeses = [];
                    if (p.grudges) {
                        Object.entries(p.grudges).forEach(([attackerIdx, stats]) => {
                            const aIdx = parseInt(attackerIdx);
                            const attacker = players[aIdx];
                            if (attacker && ((stats.damage || 0) > 0 || (stats.drinks || 0) > 0)) {
                                nemeses.push({
                                    name: attacker.name,
                                    dmg: stats.damage || 0,
                                    drk: stats.drinks || 0,
                                    score: (stats.damage || 0) + (stats.drinks || 0)
                                });
                            }
                        });
                        // Sorter efter hvem der var vÃƒÂ¦rst mod mig
                        nemeses.sort((a, b) => b.score - a.score);
                    }

                    const timeUsed = Math.max(0, totalGameTime - (p.saved_time || totalGameTime));
                    
                    return { ...p, damageDealt, drinksServed, victims, nemeses, timeUsed, originalIdx: myIdx };
                }).filter(Boolean);

                // Find vinder og sorter resten
                const winner = statsMap.find(p => !p.is_dead);
                const sortedStats = statsMap.sort((a, b) => {
                    if (!a.is_dead && b.is_dead) return -1; 
                    if (a.is_dead && !b.is_dead) return 1;
                    return b.damageDealt - a.damageDealt; 
                });

                return (
                 <div className="fixed inset-0 z-[300] bg-stone-950 flex flex-col items-center justify-center p-4 animate-in zoom-in duration-500 overflow-y-auto">
                      

                      {/* Baggrunds grid/effekt (valgfri, men ser godt ud pÃ¥ solid baggrund) */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                      <div className="absolute inset-0 bg-yellow-500/5 animate-pulse pointer-events-none"></div>
                   
                      {/* HEADER */}
                      <div className="flex flex-col items-center mb-6 shrink-0 pt-10">
                          <Crown size={80} className="text-yellow-500 mb-4 animate-bounce drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"/>
                          <h1 className="text-5xl font-black text-white text-center tracking-tighter drop-shadow-2xl uppercase">
                              {winner ? winner.name : "NO SURVIVORS"}
                          </h1>
                          
                      </div>

                      {/* STATS GRID */}
                      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 overflow-y-auto pb-20 px-2">
                          {sortedStats.map((p, i) => (
                              <div key={i} className={`relative p-4 rounded-xl border flex flex-col gap-3 ${p.is_dead ? 'bg-stone-900/50 border-stone-800 opacity-80' : 'bg-stone-900 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]'}`}>
                                  
                                  {/* Player Header */}
                                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                      <div className="flex items-center gap-2">
                                          {p.is_dead ? <Skull size={18} className="text-stone-500"/> : <Crown size={18} className="text-yellow-500"/>}
                                          <span className={`font-black text-lg ${p.is_dead ? 'text-stone-400 line-through' : 'text-white'}`}>{p.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-stone-500">
                                          <Clock size={10}/> {formatTime(p.timeUsed)}
                                      </div>
                                  </div>

                                  {/* Big Stats */}
                                  <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-red-900/10 border border-red-900/30 p-2 rounded flex flex-col items-center">
                                          <span className="text-[9px] text-red-500 uppercase tracking-widest">Gave Dmg</span>
                                          <span className="text-xl font-black text-white tabular-nums">{p.damageDealt}</span>
                                      </div>
                                      <div className="bg-purple-900/10 border border-purple-900/30 p-2 rounded flex flex-col items-center">
                                          <span className="text-[9px] text-purple-500 uppercase tracking-widest">Served</span>
                                          <span className="text-xl font-black text-white tabular-nums">{p.drinksServed}</span>
                                      </div>
                                  </div>

                                  {/* COMBAT REPORT (Dual Columns) */}
                                  {(p.victims.length > 0 || p.nemeses.length > 0) && (
                                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                                        
                                        {/* Left Col: Who I hurt */}
                                        <div className="flex flex-col gap-1">
                                            {p.victims.length > 0 && <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-0.5">Bullied</span>}
                                            {p.victims.map((v, vIdx) => (
                                                <div key={vIdx} className="text-[10px] flex flex-wrap items-center gap-1 leading-tight opacity-80">
                                                    <span className="text-stone-300 font-bold">{v.name}</span>
                                                    <span className="text-stone-500 text-[9px]">:</span>
                                                    {v.dmg > 0 && <span className="text-red-400 font-mono">-{v.dmg}</span>}
                                                    {v.drk > 0 && <span className="text-purple-400 font-mono">+{v.drk}</span>}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right Col: Who hurt me */}
                                        <div className="flex flex-col gap-1">
                                            {p.nemeses.length > 0 && <span className="text-[9px] text-red-900 font-bold uppercase tracking-widest mb-0.5 text-right">Haunted By</span>}
                                            {p.nemeses.map((n, nIdx) => (
                                                <div key={nIdx} className="text-[10px] flex flex-wrap items-center justify-end gap-1 leading-tight opacity-80">
                                                    {n.dmg > 0 && <span className="text-red-500 font-mono">-{n.dmg}</span>}
                                                    {n.drk > 0 && <span className="text-purple-500 font-mono">+{n.drk}</span>}
                                                    <span className="text-stone-500 text-[9px]">:</span>
                                                    <span className="text-red-300 font-bold">{n.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                  )}
                              </div>
                          ))}
                      </div>

                      {/* ACTIONS FOOTER */}
                      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent flex flex-col gap-3 items-center z-50">
                          <button 
                            onClick={handleResetGame} 
                            className="w-full max-w-sm py-4 bg-yellow-600 text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-yellow-500 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2"
                          >
                             <RotateCcw size={20} className="text-black" /> NEW BATTLE
                          </button>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); setVictoryDismissed(true); }} 
                            className="text-stone-500 text-xs font-bold uppercase tracking-widest hover:text-white"
                          >
                            Dismiss
                          </button>
                      </div>
                  </div>
                );
            })()}









              
          {/* --- TACTICAL MODAL --- */}
            <TacticalModal 
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                onCancel={closeModal}
                onConfirm={(val) => {
                    modalConfig.onConfirm(val);
                    closeModal();
                }}
            />

          

          
           <DiceRoller 
                // FIX: Brug rollId som key. Det tvinger React til at re-mounte komponenten 
                // og genstarte animationen hver gang der kommer et NYT rul.
                key={diceState.active && diceState.rollId ? `dice-${diceState.rollId}` : "dice-closed"}
                isOpen={diceState.active} 
                onClose={closeDice} 
                result={diceState.result} 
                results={diceState.results} 
                sides={diceState.sides} 
                count={diceState.count}     
                rollerName={diceState.roller} 
            />
              
            {/* --- OVERLAYS SECTION (I BUNDEN AF FILEN) --- */}
            
            

            
            
            <NumberBubbleGrid isOpen={selectorType === 'generic1'} onClose={() => setSelectorType(null)} onSelect={handleStatSelect} max={40} title="Counter 1" colorClass="bg-stone-600" />
            <NumberBubbleGrid isOpen={selectorType === 'generic2'} onClose={() => setSelectorType(null)} onSelect={handleStatSelect} max={40} title="Counter 2" colorClass="bg-stone-600" />
            
            <NumberBubbleGrid 
              isOpen={selectorType === 'dice'} 
              onClose={() => { setSelectorType(null); setMultiRollCount(null); }} // Husk at resette ved luk
              onSelect={handleDiceSelect} 
              onLongPress={handleDiceLongPress} // Ny prop
              max={100} 
              startFrom={2} 
              // Dynamisk titel!
              title={multiRollCount ? `ROLLING ${multiRollCount}x... CHOOSE TYPE` : "Choose dice type"} 
              colorClass={multiRollCount ? "bg-orange-500" : "bg-blue-600"} // Skift farve nÃ¥r vi er i multi-mode
          />

           {/* --- TOP BAR --- */}
            <div className="absolute top-4 left-0 right-0 z-40 flex justify-center px-2">
                <div className="flex items-center gap-0 bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-xl overflow-hidden p-1">
                
                    {/* MENU */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-4 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <Menu size={20}/>
                    </button>
                    
                    {/* Divider */}
                    <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

               {/* UNDO (10 Second Max Hold - Instant Trigger) */}
                    <button 
                        onPointerDown={handleUndoPointerDown}
                        onPointerUp={handleUndoPointerCancel}
                        onPointerLeave={handleUndoPointerCancel}
                        onPointerCancel={handleUndoPointerCancel}
                        disabled={!(remoteStressState?.undoHistory?.length > 0)}
                        className={`p-4 rounded-full transition-all group touch-none select-none relative ${
                            remoteStressState?.undoHistory?.length > 0 
                                ? 'text-stone-400 cursor-pointer' 
                                : 'text-stone-700 cursor-not-allowed opacity-50'
                        }`}
                    >
                        <Undo 
                            size={20} 
                            className={`relative z-10 transition-all ${
                                (isUndoPressing || remoteStressState?.globalUndoPressing)
                                    ? 'text-white animate-pulse -rotate-180 duration-[10000ms] ease-linear' 
                                    : (remoteStressState?.undoHistory?.length > 0 ? 'group-hover:-rotate-45 duration-300' : '')
                            }`} 
                        />
                    </button>

                    {/* Divider */}
                    <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                    {/* DICE */}
                    <button onClick={openDiceSelector} className="p-4 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <Dices size={20}/>
                    </button>

                    {/* Divider */}
                    <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                    {/* SETTINGS */}
                    <button onClick={openGear} className="p-4 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <Settings size={20}/>
                    </button>
                </div>
            </div>


              {/* --- UNDO AUTHORIZED TOAST (Kun for Initiator) --- */}
            {showUndoAuthorized && (
                <div className="absolute top-24 left-0 right-0 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-emerald-900/90 backdrop-blur-md border border-emerald-500/50 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3">
                        <CheckCircle size={18} className="text-emerald-400" />
                        <span className="text-emerald-100 font-bold text-xs uppercase tracking-widest mt-0.5">
                            Rewind Authorized
                        </span>
                    </div>
                </div>
            )}

            {/* --- UNDO PROGRESS BAR & DATA READOUT (Kun for den der trykker) --- */}
            {isUndoPressing && !showUndoAuthorized && !showUndoRejected && (() => {
                const history = remoteStressState?.undoHistory || [];
                if (history.length === 0) return null;
                
                // Vi tager ALTID index 0
                const targetIndex = 0;
                const pastState = history[targetIndex];
                
                // HARD LIMIT CHECK TIL UI
                const currentTurnCount = remoteStressState?.turnCount || 0;
                if (pastState.turnCount < currentTurnCount - 1) return null;

                // Hvem sveder lige NU?
                let currentTurnIdx = priorityPlayerIdx !== -1 ? priorityPlayerIdx : activePlayerIdx;
                if (defenders && defenders.length > 0) currentTurnIdx = defenders[0];
                else if (stackState === 'open' && stackOwnerIdx !== -1) currentTurnIdx = stackOwnerIdx;
                
                // Hvem svedte i FORTIDEN?
                let pastTurnIdx = pastState.priorityPlayerIdx !== -1 ? pastState.priorityPlayerIdx : pastState.activePlayerIdx;
                if (pastState.defenders && pastState.defenders.length > 0) pastTurnIdx = pastState.defenders[0];
                else if (pastState.stackState === 'open' && pastState.stackOwnerIdx !== -1) pastTurnIdx = pastState.stackOwnerIdx;
                
                const currentTurnName = players[currentTurnIdx]?.name || "Unknown";
                const pastTurnName = players[pastTurnIdx]?.name || "Unknown";

                // Hvem får ændret deres tid markant? (Mere end 2 sekunders ryk)
                const timeAlteredDetails = [];
                players.forEach((p, i) => {
                    if (!p.is_seated || !pastState.playerTimes[i]) return;
                    const pastTime = pastState.playerTimes[i].saved_time;
                    const currentTime = calculateTimeForPlayer(i);
                    
                    if (Math.abs(pastTime - currentTime) > 2) {
                        // Lynhurtig formatering fra sekunder til MM:SS
                        const fmt = (t) => {
                            const m = Math.floor(Math.max(0, t) / 60);
                            const s = Math.floor(Math.max(0, t) % 60);
                            return `${m}:${s.toString().padStart(2, '0')}`;
                        };
                        
                        timeAlteredDetails.push({
                            name: p.name,
                            now: fmt(currentTime),
                            then: fmt(pastTime)
                        });
                    }
                });

                return (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[320] flex flex-col items-center justify-center gap-4 pointer-events-none animate-in fade-in zoom-in duration-200">
                        
                        {/* HACKER DATA READOUT */}
                        <div className="bg-stone-900/95 backdrop-blur-xl border border-emerald-500/40 p-5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col items-center gap-3 min-w-[300px]">
                            <h3 className="text-emerald-500 font-black text-xs uppercase tracking-[0.2em] animate-pulse mb-1">
                                Requesting Time Warp  
                            </h3>
                            
                            <div className="w-full flex justify-between items-center text-[11px] uppercase tracking-wider font-bold">
                                <span className="text-stone-500">AP changing:</span>
                                <span className="text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
                                    {currentTurnName === pastTurnName ? "Same AP" : `${currentTurnName} ➔ ${pastTurnName}`}
                                </span>
                            </div>
                            
                            <div className="w-full h-px bg-emerald-500/20 my-0.5"></div>
                            
                            <div className="w-full flex flex-col gap-1.5 mt-0.5">
                                <span className="text-stone-500 text-[10px] uppercase tracking-wider font-black mb-0.5 text-left">
                                    Time shift (Now ➔ Before):
                                </span>
                                {timeAlteredDetails.length > 0 ? (
                                    timeAlteredDetails.map((detail, idx) => (
                                        <div key={idx} className="w-full flex justify-between items-center text-[11px] font-bold">
                                            <span className="text-stone-400">{detail.name}</span>
                                            <span className="text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
                                                {detail.now} ➔ {detail.then}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-emerald-300 text-[11px] font-bold">No change</span>
                                )}
                            </div>
                        </div>

                       {/* PROGRESS TRACK */}
                        <div className="w-72 h-3 bg-stone-900/80 backdrop-blur-md border border-emerald-900/50 rounded-full overflow-hidden p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full w-full transition-all duration-[10000ms] ease-linear origin-left scale-x-0 animate-[grow-width_10s_linear_forwards]">
                                <style jsx>{`
                                    @keyframes grow-width {
                                        from { transform: scaleX(0); }
                                        to { transform: scaleX(1); }
                                    }
                                `}</style>
                            </div>
                        </div>
                    </div>
                );
            })()}
              
              {/* --- UNDO REJECTED TOAST (Kun for Initiator) --- */}
            {showUndoRejected && (
                <div className="absolute top-24 left-0 right-0 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-900/90 backdrop-blur-md border border-red-500/50 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-3">
                        <XCircle size={18} className="text-red-400" />  
                        <span className="text-red-100 font-bold text-xs uppercase tracking-widest">
                            Rewind Not Authorized
                        </span>
                    </div>
                </div>
            )}

            
          {/* --- MAIN CONTENT --- */}
            <div className={`flex-grow flex flex-col items-center justify-evenly pt-16 pb-[150px] relative z-10 w-full overflow-hidden transition-all ease-in-out ${(isUndoPressing || remoteStressState?.globalUndoPressing) ? 'blur-xl scale-[0.98] opacity-60 duration-4000' : 'blur-none scale-100 opacity-100 duration-4000'}`}>
                <div className="relative">
                    {!isPaused && !isMe && <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>}
                    {/* Opdateret Bonus Tekst: Bruger text-[12vw] i stedet for 8xl for at skalere med skÃ¦rmen */}
                    {bonusFloat && ( 
                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[12vw] md:text-8xl font-black text-emerald-400 animate-float-up pointer-events-none z-[200] whitespace-nowrap drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]">
                            + {bonusFloat} SEC
                        </div> 
                    )}
                    {/* Snippet 1: Failsafe events added to BigButton */}
                    <button
                      id="big-button-hitbox"
                      onPointerDown={handlePointerDown} 
                      onPointerUp={handlePointerUp} 
                      onPointerLeave={handlePointerCancel}    
                      onPointerCancel={handlePointerCancel}  
                      className={`
                        relative w-[min(22rem,35vh)] h-[min(22rem,35vh)] aspect-square rounded-full flex flex-col items-center justify-center
                        transition-all duration-150 ease-out select-none touch-none magic-click-effect p-0
                        ${isBigButtonPressed ? 'scale-[0.98] translate-y-[12px]' : 'scale-100 translate-y-0'}
                        ${isCountingDownForMe && !isChillMode && !isBigButtonPressed ? 'animate-violent' : ''}
                      `}
                  >
                        {/* 1. Base Background (Glow bagved knappen) */}
                        <div className={`absolute inset-0 rounded-full transition-all duration-150 ${isBigButtonPressed ? 'opacity-10 blur-md' : 'opacity-40 blur-xl'} ${btnColorClass.includes('border-white') ? 'bg-white' : btnColorClass.includes('red') ? 'bg-red-600' : btnColorClass.includes('orange') ? 'bg-orange-500' : btnColorClass.includes('emerald') ? 'bg-emerald-500' : btnColorClass.includes('blue') ? 'bg-blue-500' : 'bg-stone-500'}`}></div>
                        
                        {/* 2. Magic Ring */}
                        <div className={`absolute inset-[-4px] rounded-full magic-ring opacity-50 ${activeConfig.chillMode ? 'animate-none' : ''}`}></div>
                        
                        {/* 3. Main Button Container (Massiv 3D Dome) */}
                        <div className={`absolute inset-0 rounded-full border-[2px] backdrop-blur-2xl overflow-hidden bg-gradient-to-br from-white/10 via-black/40 to-black/90 ${btnColorClass} ${glow} 
                            transition-all duration-150
                            ${isBigButtonPressed 
                                ? 'shadow-[0_10px_20px_rgba(0,0,0,0.95),inset_0_4px_10px_rgba(255,255,255,0.1),inset_0_-5px_15px_rgba(0,0,0,0.9)]' 
                                : 'shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_8px_20px_rgba(255,255,255,0.3),inset_0_-15px_30px_rgba(0,0,0,0.9)]'
                            }
                        `}>
                            {/* Blød, naturlig 3D-refleksion, der dækker hele toppen */}
                            <div className={`absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none mix-blend-overlay transition-opacity duration-150 ${isBigButtonPressed ? 'opacity-50' : 'opacity-100'}`}></div>
                            
                            {!isChillMode && (
                                <div className="absolute inset-0 w-full h-full magic-glare opacity-100 pointer-events-none"></div>
                            )}
                        </div>
                      
                      
                      
                      {/* 4. GLOBAL DOOM LAYER */}
                        <div 
                            className="absolute inset-0 z-25 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000 ease-in-out rounded-full overflow-hidden"
                            style={{ 
                                // NU KUN VARIABLEN: Vi ganger med 0.95 for at den ikke bliver 100% kulsort (lidt struktur bevares)
                                opacity: doomFactor * 0.95, 
                                backgroundColor: 'rgba(0,0,0,0.95)' // NÃƒÆ’Ã‚Â¦sten helt sort
                            }} 
                        >
                            <Skull strokeWidth={1.5} className="w-[80%] h-[80%] text-stone-800 absolute animate-pulse scale-110 -translate-y-6" />
                            

                                                 

                          
                        </div>


                        {/* 5. Standard Text Content (Bulletproof Sizing) */}
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none p-4">
                            {/* Ã†NDRINGER FOR SIKKERHED:
                                1. 'break-words': KnÃ¦kker lange sÃ¦tninger.
                                2. 'max-w-[90%]': Holder teksten vÃ¦k fra cirklens absolutte kant.
                                3. 'leading-tight': Lidt luft mellem linjerne hvis den wrapper.
                            */}
                            {/* SMART TEXT SIZE LOGIC */}
{/* Vi tjekker lÃ¦ngden af teksten:
    > 15 tegn: Meget lille (2.5vh) - f.eks. "SOMETHING'S AFOOT..."
    > 8 tegn:  Mellem (3.5vh)      - f.eks. "YOUR TURN"
    < 8 tegn:  Stor (4.5vh)        - f.eks. "PAUSED" 
*/}
<span className={`
    ${btnText.length > 15 ? 'text-[min(1.5rem,2.5vh)]' : btnText.length > 8 ? 'text-[min(1.8rem,3.5vh)]' : 'text-[min(2.2rem,4.5vh)]'}
    font-black leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center w-full max-w-[95%] break-words scale-100 group-active:scale-95 transition-transform duration-100 ${doomFactor > 0.6 ? 'text-stone-200' : ''}
`}>
    
     {btnText}
                            </span>
                            
                            <span className="text-[min(10px,1.5vh)] font-bold opacity-80 uppercase tracking-[0.2em] mt-2 drop-shadow-md text-center w-full max-w-[90%] break-words">
                                {btnSub}
                            </span>
                        </div>
                    </button>

                  
                  


                </div>

                <div className="flex flex-col items-center">
                    {isMe && ( <div className="mb-1 inline-flex items-center gap-0.5 px-4 py-1.5 rounded-full bg-stone-900/80 border border-white/10 text-stone-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        <User size={10} /> {me.name}
                        
                    </div> )}
                    
                    <div className={`text-6xl font-mono font-bold tracking-tighter tabular-nums transition-all ${inBuffer ? 'text-blue-500' : (myTime < 30 ? 'text-red-500 animate-pulse' : 'text-stone-300')}`}>
                     {/* VIS KUN HVIS MINDRE END 100 MIN (6000 SEK) */}
                    {myTime <= 6000 && (
                        <div className={`text-6xl font-mono font-bold tracking-tighter tabular-nums transition-all ${inBuffer ? 'text-blue-500' : (myTime < 30 ? 'text-red-500 animate-pulse' : 'text-stone-300')}`}>
                            {formatTime(myTime)}
                        </div>
                    )}
                    </div>
                    {isGlobalTimerRunning && (
                    <div className="mt-2 text-red-500/80 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
                        {/* Brug Math.max(0, ...) for at undgÃƒÆ’Ã‚Â¥ negative tal visuelt */}
                        GLOBAL PAUSE TIME: {formatTime(Math.max(0, calculateGlobalTime()))}
                    </div>
                )}
                </div>

               <div className="w-full px-12 mt-1">
                    {/* Husk pointer-events-none tilfÃ¸jelsen fra tidligere her: */}
                    <div className={`grid grid-cols-3 gap-2 ${shufflePhase !== 'idle' ? 'pointer-events-none' : ''}`}>
                        {targetBubbles.map((p, i) => {
                             const isSelected = pendingTargets.includes(p.originalIdx);
                             const isRouletteActive = rouletteHighlightIdx === p.originalIdx;

          
                             const isAP = p.originalIdx === activePlayerIdx;
                             const timeLeft = calculateTimeForPlayer(p.originalIdx);
                             const isLowTime = timeLeft < 60;
                             
                             // DRAG LOGIC:
                             const isBeingDragged = dragState.active && dragState.idx === p.originalIdx;
                             // Er vi ved at lande pÃ¥ denne boble?
                             const isDropTarget = dragState.active && dragState.hoverIdx === p.originalIdx && !isBeingDragged;

                            return (
                             <button 
                                key={p.originalIdx}
                                data-seat-idx={p.originalIdx}
                                
                                // 1. HER SKAL STYLES IND! Lige under data-seat-idx
                                style={
                                    shufflePhase === 'suck' ? { animationDelay: `${i * 0.05}s` } : 
                                    shufflePhase === 'drop' ? { animationDelay: `${i * 0.1}s` } : 
                                    {}
                                }
                                
                                onPointerDown={(e) => {
                                    if (isRouletteSpinning || shufflePhase !== 'idle') return;
                                    if (!isGameStarted) {
                                        const clientX = e.clientX;
                                        const clientY = e.clientY;
                                        const pointerId = e.pointerId; 
                                        
                                        let ghostX = clientX;
                                        let ghostY = clientY;
                                        const container = document.getElementById('app-container');
                                        if (container) {
                                            const rect = container.getBoundingClientRect();
                                            ghostX -= rect.left;
                                            ghostY -= rect.top;
                                        }

                                        dragTimeout.current = setTimeout(() => {
                                            if (navigator.vibrate) handleVibrate(100);
                                            setDragState({ 
                                                active: true, 
                                                idx: p.originalIdx, 
                                                x: ghostX, 
                                                y: ghostY, 
                                                hoverIdx: null, 
                                                isHoveringBigButton: false, 
                                                pointerId: pointerId 
                                            });
                                        }, 500);
                                    }
                                }}
                                onPointerUp={() => clearTimeout(dragTimeout.current)}
                                onPointerLeave={() => clearTimeout(dragTimeout.current)}
                                onClick={(e) => {
                                    if (dragJustFinishedRef.current) return;
                                    if (isRouletteSpinning || shufflePhase !== 'idle' || dragState.active) return;
                                    
                                    if (p.name.startsWith("Open Seat")) return;
                                    if (!isGameStarted) {
                                        playSound('click');
                                        commitAction({ activePlayerIdx: p.originalIdx, priorityPlayerIdx: p.originalIdx });
                                        return;
                                    }
                                    if (stackState === 'frozen') return;
                                    if (stackState === 'open' && stackOwnerIdx !== seatIdx) return; 
                                    toggleTarget(p.originalIdx);
                                }}
                                
                               
                               
                               


                                 className={(() => {
                                  const isOpenSeat = p.name.startsWith("Open Seat");
                                  const isAnimating = shufflePhase !== 'idle';
                                  
                                  // Vi tilføjer en dyb drop-shadow og en generel overgang for 3D faldet
                                  let classes = `relative h-20 rounded-xl flex flex-col items-center justify-center px-1 touch-none overflow-hidden select-none ${isAnimating ? '' : 'transition-all duration-200'} `;
                                  
                                  const isTargeted = isSelected && !isRouletteSpinning;
                                  const isRealAP = isAP && !isRouletteSpinning;
                              
                                  // Her pumper vi gradients og inset-skygger ind for at skabe 3D "bevel" (en forhøjet kant)
                                  if (isBeingDragged) classes += " opacity-0 scale-90 ";
                                  else if (isDropTarget) classes += " border-t-[2px] border-b-[4px] border-emerald-600 bg-gradient-to-b from-emerald-700 to-emerald-950 scale-105 z-10 shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] ";
                                  else if (isOpenSeat) classes += " border-2 border-dashed border-stone-800 bg-stone-900/40 text-stone-600 opacity-50 scale-95 shadow-inner ";
                                  else if (isRouletteActive) classes += " border-t-[2px] border-b-[4px] border-yellow-500 bg-gradient-to-b from-yellow-500 to-yellow-700 text-black scale-105 z-20 shadow-[0_10px_25px_rgba(0,0,0,0.9),inset_0_2px_5px_rgba(255,255,255,0.6)] ";
                                  else if (isTargeted) classes += " border-t-[2px] border-b-[4px] border-red-600 bg-gradient-to-b from-red-800 to-red-950 text-white shadow-[0_8px_15px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] ";
                                  else if (isRealAP) classes += " border-t-[2px] border-b-[4px] border-emerald-700 bg-gradient-to-b from-stone-800 to-stone-900 text-stone-300 ring-2 ring-emerald-500/30 shadow-[0_8px_15px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] ";
                                  else classes += " border-t-[2px] border-b-[4px] border-stone-700 bg-gradient-to-b from-stone-800 to-stone-950 text-stone-400 shadow-[0_8px_15px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] active:border-b-[2px] active:translate-y-[2px] "; 
                                  
                                  if (shufflePhase === 'suck') classes += " animate-fold-in ";
                                  else if (shufflePhase === 'swirl') classes += " invisible "; 
                                  else if (shufflePhase === 'drop') classes += " animate-deal-out ";
                              
                                  return classes;
                              })()}
                             >




                               
                                 {/* CONTENT (Skjul indhold hvis det er Open Seat, ellers vis normalt) */}
                                 {!p.name.startsWith("Open Seat") ? (
                                     <>
                                         {isAP && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-lg"></div>}
                                         <span className="text-xs font-black uppercase tracking-widest truncate w-full text-center text-stone-200 leading-none mb-1">{p.name}</span>
                                         <div className={`text-sm font-mono font-bold tabular-nums tracking-tight mb-1 ${isLowTime ? 'text-orange-400' : 'text-stone-500'}`}>
                                         {/* VIS KUN TID HVIS MINDRE END 100 MIN (6000 SEK) */}
                                         {timeLeft <= 6000 ? (
                                             <div className={`text-sm font-mono font-bold tabular-nums tracking-tight mb-1 ${isLowTime ? 'text-orange-400' : 'text-stone-500'}`}>
                                                 {formatTime(timeLeft)}
                                             </div>
                                         ) : (
                                             // Valgfrit: Vis en lille spacer eller intet, hvis tiden er skjult
                                             <div className="h-5 mb-1"></div> 
                                         )}
                                         
                                         </div>
                                         <div className="flex items-center justify-center gap-3 opacity-90">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-400"><Heart size={10} fill="currentColor" /><span>{p.lt || 0}</span></div>
                                            {(p.drunk || 0) > 0 && (<div className="flex items-center gap-1 text-[10px] font-bold text-purple-400"><Beer size={10} fill="currentColor" /><span>{p.drunk}</span></div>)}
                                         </div>
                                     </>
                                 ) : (
                                     // Indhold for Open Seat (Bare et lille ikon eller tekst)
                                     <div className="text-[9px] font-black uppercase tracking-widest opacity-50 flex flex-col items-center gap-1">
                                         <div className="w-1 h-1 bg-stone-500 rounded-full"></div>
                                         OPEN
                                     </div>
                                 )}
                             </button>
                         );
                        })}
                    </div>
                    {/* --- DRAG GHOST (FÃ¸lger fingeren) --- */}
                {/* --- DRAG GHOST (FÃ¸lger fingeren) --- */}
                {dragState.active && (
                    <div 
                        id="drag-ghost"
                        // Ã†NDRET: Fra fixed til absolute
                        className="absolute z-[999] w-24 h-24 bg-stone-800/90 border-2 border-emerald-500 rounded-xl flex flex-col items-center justify-center shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm"
                        style={{ left: dragState.x, top: dragState.y }}
                    >
                        <User size={32} className="text-emerald-500 mb-2"/>
                        <span className="text-xs font-black text-white uppercase tracking-widest">
                            {players[dragState.idx]?.name}
                        </span>
                        <div className="text-[9px] text-emerald-400 font-bold uppercase mt-1">MOVING...</div>
                    </div>
                )}
                </div>

               {/* --- NEMESIS SLIDER (RESTORED) --- */}
                {isMe && isMyTurn && !isPaused && !isBreatherActive && nemesisIdx !== -1 && players[nemesisIdx] && !players[nemesisIdx].is_dead && (
                      <div
                        className="absolute bottom-44 right-4 z-[40] w-16 h-[240px] flex flex-col items-center justify-end select-none touch-none bg-white/0"
                        onTouchStart={handleSlideStart}
                        onTouchMove={handleSlideMove}
                        onTouchEnd={handleSlideEnd}
                        onMouseDown={handleSlideStart}
                        onMouseMove={handleSlideMove}
                        onMouseUp={handleSlideEnd}
                        onMouseLeave={handleSlideEnd}
                      >
                        <div className="mb-1 flex flex-col items-center z-10 pointer-events-none">
                            <div className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">NEMESIS</div>
                            <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest max-w-[60px] truncate text-center leading-tight">
                                {players[nemesisIdx].name}
                            </div>
                        </div>

                        <div className="relative w-full flex-grow mb-2 flex flex-col items-center">
                            {/* Track */}
                            <div className={`
                                absolute inset-0 w-10 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300
                                ${dragOffset > 0 ? 'bg-gradient-to-b from-transparent via-red-900/10 to-red-600/20' : 'bg-transparent'}
                            `}></div>

                            {/* Arrow hints */}
                            {dragOffset < 100 && (
                                <div className="absolute top-16 flex flex-col items-center gap-4 opacity-20 pointer-events-none">
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-75"></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-150"></div>
                                </div>
                            )}

                            {/* Drag Line */}
                            {dragOffset > 0 && (
                                <div 
                                    className="absolute top-4 left-1/2 w-[1px] bg-red-500/40 -translate-x-1/2 pointer-events-none origin-top"
                                    style={{ height: `${dragOffset}px` }}
                                ></div>
                            )}

                            {/* The Handle */}
                            <div 
                                style={{ transform: `translateY(${dragOffset}px)` }}
                                className={`
                                    relative top-0 z-20 w-12 h-12 rounded-full flex items-center justify-center text-xl backdrop-blur-sm
                                    transition-colors duration-100
                                    ${dragOffset === 0 ? 'transition-transform duration-300' : 'transition-none'}
                                    
                                    ${dragOffset > 150 
                                        ? 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,1)] scale-110' 
                                        : dragOffset > 0 
                                            ? 'bg-stone-900/40 text-red-400 border border-red-500/20' 
                                            : 'bg-white/5 text-stone-600 border border-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                <span className={dragOffset > 150 ? 'animate-ping absolute opacity-50' : 'hidden'}>🎯</span>
                                <span className="relative z-10">🎯</span>
                            </div>
                        </div>
                      </div>
                )}



              

         {isMe && (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-220 pointer-events-none">
        
        {/* VENSTRE: LIFE WHEEL */}
        <div className="pointer-events-auto mb-1"> 
            <DirectRotaryKnob 
                value={optimisticLife !== null ? optimisticLife : (me.lt || 0)} 
                onChange={handleLocalLifeChange} 
                onCommit={handleLifeCommit}
                size={145} // Opjusteret fra 130 til 145
                icon={Heart}
                color="text-red-500"
                ringColor="border-stone-700"
            />
        </div>

        {/* MIDTEN: GENERIC COUNTERS */}
        <div className="pointer-events-auto flex flex-col gap-3 mb-2 items-center justify-center">
            
            {/* COUNTER 1 */}
            <button onClick={() => openStatSelector('generic1')} className="flex flex-col-reverse items-center group active:scale-95 transition-transform opacity-60 hover:opacity-100">
                <Shield size={10} className="text-stone-500 mt-1" />
                <span className="text-2xl font-black font-mono text-stone-400 tabular-nums leading-none drop-shadow-md">{me.generic1 || 0}</span>
            </button>
            
            {/* Divider */}
            <div className="w-8 h-[1px] bg-white/10"></div>
            
            {/* COUNTER 2 */}
            <button onClick={() => openStatSelector('generic2')} className="flex flex-col-reverse items-center group active:scale-95 transition-transform opacity-60 hover:opacity-100">
                <Zap size={10} className="text-stone-500 mt-1" />
                <span className="text-2xl font-black font-mono text-stone-400 tabular-nums leading-none drop-shadow-md">{me.generic2 || 0}</span>
            </button>
        </div>

        {/* HÃ˜JRE: DRUNK WHEEL */}
        <div className="pointer-events-auto mb-1">
                <DirectRotaryKnob 
                value={optimisticDrunk !== null ? optimisticDrunk : (me.drunk || 0)} 
                onChange={handleLocalDrunkChange} 
                onCommit={handleDrunkCommit}
                size={145} // Opjusteret fra 130 til 145
                icon={Beer} 
                color="text-purple-500"
                ringColor="border-purple-900/50"
            />
        </div>

    </div>
)}




              
            </div>

            {/* --- MENUS --- */}
            {/* --- RESTORED ORIGINAL MENU OVERLAY --- */}
            <div 
                // FIX 1: Klik pÃƒÆ’Ã‚Â¥ baggrunden lukker menuen
                onClick={() => setIsMenuOpen(false)}
                className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-md transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                 <div 
                    // FIX 2: Stop klik inde i menuen fra at boble op til baggrunden (ellers lukker den nÃƒÆ’Ã‚Â¥r man bruger menuen)
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full bg-stone-900 border-b border-white/10 p-4 pt-24 transition-transform duration-300 ${isMenuOpen ? 'translate-y-0' : '-translate-y-10'}`}
                 >
                     
                     <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                        {players.map((p, i) => {
                            if (!p || p.name.startsWith("Open Seat")) return null;
                            
                            const isSelected = pendingTargets.includes(i); 
                            const isDead = p.is_dead;
                            const isMyNemesis = isMe && isMyTurn && i === nemesisIdx && !isDead;
          
                             return (
                                <div key={i} 
                                    onClick={() => {
                                      if (isDead) {
                                          // HER ER Ã†NDRINGEN:
                                          setModalConfig({
                                              isOpen: true,
                                              title: 'REVIVE PROTOCOL',
                                              message: `Bring ${p.name} back to the land of the living?`,
                                              onConfirm: () => {
                                                  const updatedPlayers = [...players];
                                                  updatedPlayers[i] = { ...updatedPlayers[i], is_dead: false };
                                                  if ((updatedPlayers[i].lt || 0) <= 0) updatedPlayers[i].lt = 1;
                                                  
                                                  commitAction({ isPaused: true }, updatedPlayers);
                                              }
                                          });
                                      } else {
                                          toggleTarget(i);
                                      }
                                  }}
                                    className={`relative p-3 rounded-xl border transition-all 
                                    ${isDead ? 'bg-stone-950 border-stone-900 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 cursor-help' : 'active:scale-95 cursor-pointer'} 
                                    ${!isDead && isSelected ? 'bg-red-900/30 border-red-500 shadow-md' : (!isDead ? 'bg-black border-stone-800' : '')} 
                                    ${!isDead && i === activePlayerIdx ? 'ring-1 ring-inset ring-yellow-500/50' : ''}
                                    ${isMyNemesis ? 'animate-pulse ring-2 ring-inset ring-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : ''} 
                                    `}
                                >
                                  {isMyNemesis && <div className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg z-20 animate-bounce">YOUR NEMESIS</div>}

                                  {isDead && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Skull size={40} className="text-stone-800"/></div>}
                                    
                                    <div className="flex justify-between items-center mb-1 relative z-10">
                                        <span className={`font-bold text-sm ${isDead ? 'line-through text-stone-600' : (i === activePlayerIdx ? 'text-yellow-500' : 'text-white')}`}>{p.name}</span>
                                        {!isDead && isSelected && <Swords size={14} className="text-red-500"/>}
                                    </div>

                                    <div className="flex justify-between items-end relative z-10 mb-1">
                                        <div className="flex gap-2 text-xs font-mono">
                                            <span className="text-red-400 flex gap-1"><Heart size={10}/>{p.lt}</span>
                                            <span className="text-purple-400 flex gap-1"><Beer size={10}/>{p.drunk}</span>
                                        </div>
                                        <span className={`text-xs font-mono font-bold ${calculateTimeForPlayer(i) < 60 ? 'text-red-500' : 'text-stone-500'}`}>{isDead ? '---' : formatTime(calculateTimeForPlayer(i))}</span>
                                    </div>

                                    {!isDead && p.grudges && (
                                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider relative z-10">
                                            {Object.entries(p.grudges).map(([attackerIdx, stats]) => {
                                                const attackerName = players[attackerIdx]?.name || "Unknown";
                                                return (
                                                    <div key={attackerIdx} className="flex flex-col">
                                                        {(stats.damage || 0) > 0 && (
                                                            <span className="text-red-500 flex items-center justify-between opacity-80">
                                                                <span>HIT BY {attackerName.toUpperCase()}</span> <span>-{stats.damage}</span>
                                                            </span>
                                                        )}
                                                        {(stats.drinks || 0) > 0 && (
                                                            <span className="text-purple-500 flex items-center justify-between opacity-80">
                                                                <span>FED BY {attackerName.toUpperCase()}</span> <span>+{stats.drinks}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                     </div>

                     {isMyTurn && pendingTargets.length > 0 && (
                        <button onClick={() => { 
                            playSound('horse'); 
                            commitAction({ 
                                defenders: pendingTargets, 
                                priorityPlayerIdx: -1, 
                                pendingAttacks: [], // Clear pending
                                targetingPlayerIdx: -1, // Reset targeting
                                usedDelayBuffer: 0,
                                isPaused: false 
                            }); 
                            setIsMenuOpen(false); 
                        }} className="w-full mt-4 bg-red-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg active:scale-95">
                            ATTACK! ({pendingTargets.length})
                        </button>
                     )}
                     <button onClick={() => setIsMenuOpen(false)} className="w-full mt-4 py-4 text-stone-500 font-bold uppercase tracking-widest text-xs">Close Menu</button>
                 </div>
            </div>

            {isGearOpen && (
                 <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col p-6 pt-24 animate-in slide-in-from-top duration-300 overflow-y-auto">
                    {/* LUK KNAP (FIXED: Bruger nu closeGear for at rydde URL) */}
                    <button 
                         onPointerDown={(e) => { 
                             e.preventDefault(); 
                             closeGear(); // <--- Ã†NDRET: Kalder closeGear() i stedet for setIsGearOpen(false)
                         }} 
                         className="absolute top-6 right-6 p-2 bg-stone-800 rounded-full text-white active:scale-90 transition-transform"
                    >
                        <X size={24}/>
                    </button>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6">Tactical Config</h2>


                    

                   
                    
                   {/* SEAT CLAIM SECTION */}
                    <div className="mb-8">
                        <h3 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><User size={14}/> Claim Seat (Live)</h3>
                        <div className="text-[10px] text-stone-600 mb-2 italic">Tap to claim a seat || Long press to kick a player</div>
                        <div className="grid grid-cols-2 gap-3">
                            {players && players.map((p, i) => {
                                if (!p || !p.name) return null;
                                const isTaken = p.is_seated && p.seated_by !== deviceId; 
                                const isMe = p.seated_by === deviceId;
                                const isOpen = !p.is_seated || p.name.startsWith("Open Seat");
                    
                                return ( 
                                    <button 
                                        key={i} 
                                        onPointerDown={() => {
                                            isSeatKickHandled.current = false;
                                            if (!isOpen) {
                                                seatLongPressTimer.current = setTimeout(() => {
                                                    isSeatKickHandled.current = true;
                                                    handleKickPlayer(i);
                                                }, 800);
                                            }
                                        }}
                                        onPointerUp={() => { if (seatLongPressTimer.current) clearTimeout(seatLongPressTimer.current); }}
                                        onPointerLeave={() => { if (seatLongPressTimer.current) clearTimeout(seatLongPressTimer.current); }}
                                        onPointerCancel={() => { if (seatLongPressTimer.current) clearTimeout(seatLongPressTimer.current); }}
                                        onClick={(e) => { 
                                            if (isSeatKickHandled.current) { e.preventDefault(); return; }
                                            handleSeatClaim(i); 
                                        }} 
                                        // HER ER DEN NYE STYLING:
                                        className={`
                                            relative w-full h-14 rounded-lg border flex flex-col items-center justify-center transition-all touch-none select-none active:scale-95
                                            ${isMe 
                                                ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.4)]' // GOLD GLOW
                                                : (isTaken ? 'bg-stone-900/50 border-stone-800' : 'bg-stone-900 border-stone-700 hover:border-white')
                                            }
                                        `}
                                    > 
                                        <span className={`text-sm font-bold uppercase truncate w-full px-2 ${isMe ? 'text-yellow-500' : (isTaken ? 'text-stone-300' : 'text-stone-500')}`}>
                                            {p.name}
                                        </span> 
                                        {/* "Current" teksten er fjernet herfra */}
                                    </button> 
                                )
                            })}
                        </div>
                    </div>


                   
                    {/* LIVE ADJUSTMENTS SECTION */}
                    <div className="mb-8">
                        <h3 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Settings size={14}/> Live Adjustments
                        </h3>

                
                        {/* PRESET BUTTONS */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <button onClick={() => applyPreset('chill')} className="flex-1 py-3 bg-emerald-900/20 border border-emerald-600/50 text-emerald-500 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-emerald-900/40">
                                <Coffee size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Chill</span>
                            </button>
                            
                            <button onClick={() => applyPreset('concentrate')} className="flex-1 py-3 bg-yellow-900/20 border border-yellow-600/50 text-yellow-500 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-yellow-900/40">
                                <Crosshair size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Focus</span>
                            </button>

                            <button onClick={() => applyPreset('russian')} className="flex-1 py-3 bg-blue-900/20 border border-blue-600/50 text-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-blue-900/40">
                                <Flame size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Russian</span>
                            </button>

                            <button onClick={() => applyPreset('caped')} className="flex-1 py-3 bg-stone-800/50 border border-stone-500/50 text-stone-400 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-stone-800 hover:text-white">
                                <Skull size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Cap'ed</span>
                            </button>

                          {/* ROW 2: New Creative Modes */}
                            <button onClick={() => applyPreset('sudden_death')} className="py-3 bg-stone-950 border border-red-600 text-red-600 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-red-600 hover:text-black">
                                <Bomb size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Sudden Death</span>
                            </button>

                            <button onClick={() => applyPreset('pub_crawl')} className="py-3 bg-purple-900/20 border border-purple-500 text-purple-400 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-purple-900/40">
                                <Martini size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Pub Crawl</span>
                            </button>

                            <button onClick={() => applyPreset('vampire')} className="py-3 bg-pink-900/20 border border-pink-500 text-pink-500 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-pink-900/40">
                                <Droplet size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Vampire</span>
                            </button>
                             
                            <button onClick={() => applyPreset('entropy')} className="py-3 bg-orange-900/20 border border-orange-500 text-orange-500 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-orange-900/40">
                              <Hourglass size={18} className="rotate-90" />
                              <span className="text-[9px] font-black uppercase tracking-widest">No Timer</span>
                          </button>
                          
                        </div>

                        {/* STEPPERS */}
                        <div className="space-y-3">
                            <Stepper label="Start Time (MIN)" value={activeConfig.startTimeMin} onChange={(v) => updateConfig('startTimeMin', v)} icon={Clock} color="text-yellow-500"/>
                            <Stepper label="Turn Delay (SEC)" value={activeConfig.turnDelaySec || 0} onChange={(v) => updateConfig('turnDelaySec', v)} icon={Timer} color="text-blue-500"/>
                            <Stepper label="Bonus per Turn (SEC)" value={activeConfig.bonusSec} onChange={(v) => updateConfig('bonusSec', v)} icon={Plus} color="text-emerald-500"/>
                            <Stepper label="Penalty Refresh Time (SEC)" value={activeConfig.penaltyIntervalSec} onChange={(v) => updateConfig('penaltyIntervalSec', v)} icon={RotateCcw} color="text-orange-500"/>
                            <Stepper label="Penalty Life" value={activeConfig.penaltyLife} onChange={(v) => updateConfig('penaltyLife', v)} icon={Heart} color="text-red-500"/>
                            <Stepper label="Penalty Drinks" value={activeConfig.penaltyDrinks} onChange={(v) => updateConfig('penaltyDrinks', v)} icon={Beer} color="text-purple-500"/>
                            <Stepper label="Round Breather (SEC)" value={activeConfig.breatherSec || 0} onChange={(v) => updateConfig('breatherSec', v)} icon={Coffee} color="text-pink-500"/>  
                            <Stepper label="Global Pause Time (MIN)" value={activeConfig.globalTimerStartMin} onChange={(v) => updateConfig('globalTimerStartMin', v)} icon={Lock} color="text-stone-400" suffix={activeConfig.globalTimerStartMin === 0 ? "" : ""}/>  
                            
                        </div>
                    </div>


                   {/* ACTION BUTTONS */}
                    {!isGameStarted && (
                        <button onClick={handleShufflePlayers} className="w-full py-4 mb-4 bg-stone-800 border border-stone-600 text-stone-300 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-stone-700 flex items-center justify-center gap-2">
                            <Shuffle size={20} /> Shuffle Table Order
                        </button>
                    )}
                   

                    
                    {/* IOS SHAKE PERMISSION BUTTON */}
                    <button 
                        onClick={() => {
                            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                                DeviceMotionEvent.requestPermission()
                                    .then(response => {
                                        if (response === 'granted') {
                                            setModalConfig({
                                                isOpen: true,
                                                title: 'SENSORS ONLINE',
                                                message: 'Motion sensors engaged. Shake to roll enabled.',
                                                confirmText: 'ROGER',
                                                onConfirm: () => {}
                                            });
                                        } else {
                                            setModalConfig({
                                                isOpen: true,
                                                title: 'ACCESS DENIED',
                                                message: 'Motion sensor permission was refused by the OS.',
                                                isDanger: true,
                                                onConfirm: () => {}
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        setModalConfig({
                                            isOpen: true,
                                            title: 'SENSOR ERROR',
                                            message: 'Could not access motion sensors.',
                                            isDanger: true,
                                            onConfirm: () => {}
                                        });
                                    });
                            } else {
                                setModalConfig({
                                    isOpen: true,
                                    title: 'SENSORS ACTIVE',
                                    message: 'Shake detection is natively active (Android/Desktop mode). No extra permission needed.',
                                    confirmText: 'COPY THAT',
                                    onConfirm: () => {}
                                });
                            }
                        }}
                        className="w-full py-4 mb-4 bg-stone-800 border border-stone-600 text-stone-300 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-stone-700 flex items-center justify-center gap-2"
                    >
                        <Dices size={20} /> Enable Ryst-n-Roll on iOS
                    </button>

                    <button onClick={handleResetGame} className="w-full py-4 mb-4 bg-amber-900/20 border border-amber-700 text-amber-500 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-amber-900/40 flex items-center justify-center gap-2">
                        <RotateCcw size={20} /> Reset Game
                    </button> 

                    {/* GLOBAL MUTE TOGGLE */}
                    <button 
                        onClick={toggleMute}
                        className={`w-full py-4 mb-4 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border shadow-lg ${isMuted ? 'bg-red-900/20 border-red-600 text-red-500' : 'bg-emerald-900/20 border-emerald-500 text-emerald-500'}`}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        {isMuted ? "SILENT MODE (ACTIVE)" : "AUDIO & HAPTICS ON"}
                    </button>

                   {/* GLOBAL BLUR TOGGLE */}
                    <button 
                        onClick={() => updateConfig('disableBlur', !activeConfig.disableBlur)}
                        className={`w-full py-4 mb-4 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border shadow-lg ${activeConfig.disableBlur ? 'bg-stone-800/50 border-stone-600 text-stone-500' : 'bg-purple-900/20 border-purple-500 text-purple-400'}`}
                    >
                        {activeConfig.disableBlur ? <EyeOff size={20} /> : <Eye size={20} />}
                        {activeConfig.disableBlur ? "BLUR IS OFF" : "BLUR IS ON"}
                    </button>

                   {/* CHILL MODE TOGGLE (LOCAL) */}
                    <button 
                        onClick={toggleChillMode}
                        className={`w-full py-4 mb-4 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border shadow-lg ${!isChillMode ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' : 'bg-stone-800/50 border-stone-600 text-stone-500'}`}
                    >
                        <Snowflake size={20} />
                        {isChillMode ? "ANIMATIONS ARE OFF" : "ANIMATIONS ARE ON"}
                    </button>
                   
                   <button 
                      onClick={() => { 
                          setModalConfig({
                              isOpen: true,
                              type: 'confirm',
                              title: 'ABORT BATTLE?',
                              message: 'Are you sure you want to leave the battle?',
                              isDanger: true,
                              onConfirm: () => {
                                  // 1. Vask URL'en ren, sÃ¥ nÃ¦ste spil starter uden #gearmenu
                                  if (window.location.hash === '#gearmenu') {
                                      window.history.replaceState(null, '', window.location.pathname + window.location.search);
                                  }
                                  // 2. Luk menuen lokalt for en sikkerheds skyld
                                  setIsGearOpen(false);
                                  // 3. Forlad spillet
                                  onExit();
                              }
                          });
                      }} 
                      className="w-full py-4 bg-red-900/20 border border-red-900 text-red-500 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-red-900/40 flex items-center justify-center gap-2"
                   >
                       <Hand size={20} /> Abandon Battle
                   </button>
                 </div>
            )}

              
      
            </div> {/* End of #game-root */}


          {/* --- UNDO CONFIRMATION OVERLAY --- */}
            {remoteStressState?.globalUndoPressing && remoteStressState?.undoInitiator !== seatIdx && (() => {
                const history = remoteStressState?.undoHistory || [];
                if (history.length === 0) return null;
                
                // Vi tager ALTID index 0
                const targetIndex = 0;
                const pastState = history[targetIndex];
                
                // HARD LIMIT CHECK TIL UI
                const currentTurnCount = remoteStressState?.turnCount || 0;
                if (pastState.turnCount < currentTurnCount - 1) return null;

                // Hvem sveder lige NU?
                let currentTurnIdx = priorityPlayerIdx !== -1 ? priorityPlayerIdx : activePlayerIdx;
                if (defenders && defenders.length > 0) currentTurnIdx = defenders[0];
                else if (stackState === 'open' && stackOwnerIdx !== -1) currentTurnIdx = stackOwnerIdx;
                
                let pastTurnIdx = pastState.priorityPlayerIdx !== -1 ? pastState.priorityPlayerIdx : pastState.activePlayerIdx;
                if (pastState.defenders && pastState.defenders.length > 0) pastTurnIdx = pastState.defenders[0];
                else if (pastState.stackState === 'open' && pastState.stackOwnerIdx !== -1) pastTurnIdx = pastState.stackOwnerIdx;
                
                const currentTurnName = players[currentTurnIdx]?.name || "Unknown";
                const pastTurnName = players[pastTurnIdx]?.name || "Unknown";

                const timeAlteredDetails = [];
                players.forEach((p, i) => {
                    if (!p.is_seated || !pastState.playerTimes[i]) return;
                    const pastTime = pastState.playerTimes[i].saved_time;
                    const currentTime = calculateTimeForPlayer(i);
                    
                    if (Math.abs(pastTime - currentTime) > 2) {
                        const fmt = (t) => {
                            const m = Math.floor(Math.max(0, t) / 60);
                            const s = Math.floor(Math.max(0, t) % 60);
                            return `${m}:${s.toString().padStart(2, '0')}`;
                        };
                        timeAlteredDetails.push({
                            name: p.name,
                            now: fmt(currentTime),
                            then: fmt(pastTime)
                        });
                    }
                });


                return (
                    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 animate-in zoom-in duration-200 pointer-events-auto">
                        <div className="bg-stone-900/95 backdrop-blur-xl border border-emerald-500/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col items-center text-center gap-5 max-w-sm w-full">
                            <RotateCcw size={48} className="text-emerald-500 animate-spin-slow mt-2" />
                         

                            {/* HACKER DATA READOUT FOR THE VOTERS */}
                            <div className="w-full bg-stone-950/50 border border-emerald-500/30 p-4 rounded-xl flex flex-col items-center gap-2 mb-2">
                                <div className="w-full flex justify-between items-center text-[11px] uppercase tracking-wider font-bold">
                                    <span className="text-stone-500">AP changing:</span>
                                    <span className="text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
                                        {currentTurnName === pastTurnName ? "Same AP" : `${currentTurnName} ➔ ${pastTurnName}`}
                                    </span>
                                </div>
                                
                                <div className="w-full h-px bg-emerald-500/20 my-1"></div>
                                
                                <div className="w-full flex flex-col gap-1.5 mt-0.5">
                                    <span className="text-stone-500 text-[10px] uppercase tracking-wider font-black mb-0.5 text-left">
                                        Time shift (Now ➔ Before):
                                    </span>
                                    {timeAlteredDetails.length > 0 ? (
                                        timeAlteredDetails.map((detail, idx) => (
                                            <div key={idx} className="w-full flex justify-between items-center text-[11px] font-bold">
                                                <span className="text-stone-400">{detail.name}</span>
                                                <span className="text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
                                                    {detail.now} ➔ {detail.then}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-emerald-300 text-[11px] font-bold">No change</span>
                                    )}
                                </div>
                            </div>

                            {/* BUTTONS */}
                            {(remoteStressState?.undoConfirmations || []).includes(seatIdx) ? (
                                <div className="w-full py-4 bg-emerald-900/40 text-emerald-500 font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 border border-emerald-500/30">
                                    <CheckCircle size={20} /> AUTHORIZED
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        playSound('click');
                                        if (navigator.vibrate) handleVibrate(50);
                                        const currentConf = remoteStressState?.undoConfirmations || [];
                                        commitAction({
                                            undoConfirmations: [...currentConf, seatIdx],
                                            _isSilentSave: true
                                        });
                                    }}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
                                >
                                    CONFIRM REWIND
                                </button>
                            )}
                        </div>
                    </div>
                );
            })()}


        </div> // End of containerClass
    );
};

export default ChessMode;
