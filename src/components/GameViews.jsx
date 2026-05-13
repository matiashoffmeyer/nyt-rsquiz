import React from 'react';
import { RotateCcw, Loader, Trophy, CheckCircle, Play, Crown, Settings, LogOut, Activity, Heart, Beer, Plus, Star } from 'lucide-react';
import { containerClass, styles } from '../constants';
import Stepper from './Stepper';

export const PortraitView = () => (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-red-600 p-10 text-center animate-pulse">
        <RotateCcw size={64} className="mb-4"/>
        <h1 className="text-4xl font-black uppercase font-serif">Flip Your Phone</h1>
        <p className="text-white mt-4 font-mono text-sm">...and refresh the page!</p>
    </div>
);

export const ReleasingSeatView = () => (
    <div className={`${containerClass} flex-col items-center justify-center gap-6 bg-black`}>
        <Loader size={48} className="text-red-500 animate-spin"/>
        <h2 className="text-xl font-bold text-stone-300 uppercase tracking-widest">Releasing Seat...</h2>
    </div>
);

export const WinnerView = ({ winner, onExit }) => (
    <div className={`${containerClass} flex-col items-center justify-center gap-8 relative bg-black`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,215,0,0.3)_0%,rgba(0,0,0,1)_70%)] animate-pulse"></div>
        <Trophy size={120} className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] animate-bounce" />
        <div className="z-10 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-400 tracking-widest uppercase">The Victor is</h2>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-800 font-serif drop-shadow-2xl">{winner.name}</h1>
        </div>
        <div className="flex gap-4 z-10 mt-10">
            <button onClick={onExit} className="bg-stone-800 hover:bg-stone-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest border border-stone-600">Back to Lobby</button>
        </div>
    </div>
);

export const LoadingSeatView = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-stone-500 font-mono animate-pulse">Loading seat data...</div>
);

export const LobbyView = ({ 
    players, 
    activePlayerIdx, 
    activeConfig, 
    deviceId, 
    isTestMode, 
    isGameStarted,
    canStartGame, 
    modeKey,
    // Actions
    onExit, 
    setIsTestMode, 
    selectSeat, 
    updatePlayer, 
    setStartingPlayer, 
    updateConfig, 
    startGame 
}) => {
    return (
        <div className={`${containerClass} flex-col relative`}>
            <style>{styles}</style>

            {/* TOP BAR */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900/50 shrink-0 relative z-[100]">
                <div className="flex gap-4">
                    <button onClick={onExit} className="flex items-center gap-2 text-stone-500 hover:text-white uppercase font-bold text-xs"><LogOut size={16}/> Exit</button>
                    <button 
                        onClick={() => {
                            const newVal = !isTestMode;
                            setIsTestMode(newVal);
                            localStorage.setItem('stress_test_mode', newVal);
                        }} 
                        className={`flex items-center gap-2 uppercase font-bold text-xs px-2 py-1 rounded transition-colors ${isTestMode ? 'bg-purple-900/50 text-purple-300 border border-purple-500' : 'text-stone-600 hover:text-purple-400'}`}
                    >
                        <Activity size={16}/> {isTestMode ? 'Test Mode: ON' : 'Test Mode'}
                    </button>
                </div>
                <h1 className="text-lg font-serif text-yellow-500">Lobby</h1>
                <div className="w-16"></div> 
            </div>

            {/* SPLIT VIEW */}
            <div className="flex-grow flex flex-col landscape:flex-row md:flex-row h-full overflow-hidden">
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
                                        isTaken && !isGameStarted
                                        ? 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed' 
                                        : (p.is_seated && p.seated_by === deviceId ? 'bg-blue-900/30 border-blue-500 hover:bg-blue-900/50' : 'bg-stone-800 border-stone-600 hover:border-yellow-500 hover:bg-stone-700')
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
                        onClick={startGame}
                        disabled={!canStartGame}
                        className={`w-full max-w-md py-6 rounded-xl font-black text-2xl uppercase tracking-widest transition-all shadow-xl ${
                            canStartGame 
                            ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse' 
                            : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                        }`}
                    >
                        {canStartGame ? "START GAME" : "Waiting for players..."}
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
                            <Stepper label="Start (Min)" value={activeConfig.startTimeMin} onChange={(val) => updateConfig('startTimeMin', Math.max(1, val))} color="text-yellow-500"/>
                            <Stepper label="Bonus (Sec)" value={activeConfig.bonusSec} onChange={(val) => updateConfig('bonusSec', Math.max(0, val))} color="text-green-400"/>
                            <Stepper label="React (Sec)" value={activeConfig.pendingSec} onChange={(val) => updateConfig('pendingSec', Math.max(0, val))} color="text-orange-400"/>
                            <Stepper label="PEN. FRQ." value={activeConfig.penaltyIntervalSec} onChange={(val) => updateConfig('penaltyIntervalSec', Math.max(10, val))} color="text-red-400"/>
                            <Stepper label="LIFE PEN." value={activeConfig.penaltyLife} onChange={(val) => updateConfig('penaltyLife', Math.max(0, val))} icon={Heart} color="text-red-500"/>
                            <Stepper label="DRINK PEN." value={activeConfig.penaltyDrinks} onChange={(val) => updateConfig('penaltyDrinks', Math.max(0, val))} icon={Beer} color="text-yellow-500"/>
                            <Stepper label="SLOW BONUS" value={activeConfig.slowModeBonusSec} onChange={(val) => updateConfig('slowModeBonusSec', Math.max(0, val))} icon={Plus} color="text-purple-400"/>
                            <Stepper label="TURN BONUS" value={activeConfig.turnBonusSec || 0} onChange={(val) => updateConfig('turnBonusSec', Math.max(0, val))} icon={Star} color="text-blue-400"/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
