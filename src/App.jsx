import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const PlayerTracker = () => {
  // 1. Dummy Data (Erstat med dit rigtige data-feed)
  const players = [
    { id: 1, name: "Matias", class: "Data Wizard", hp: 45, maxHp: 50, color: "bg-blue-600" },
    { id: 2, name: "Camilla", class: "Healer", hp: 38, maxHp: 40, color: "bg-green-600" },
    { id: 3, name: "Ella", class: "Rogue", hp: 25, maxHp: 30, color: "bg-red-600" },
    { id: 4, name: "Mina", class: "Tiny Bard", hp: 10, maxHp: 10, color: "bg-purple-600" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCodex, setShowCodex] = useState(false);

  // --- SWIPE LOGIC SETUP ---
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50; // Hvor langt skal man swipe før det gælder?

  const nextPlayer = () => {
    setCurrentIndex((prev) => (prev === players.length - 1 ? 0 : prev + 1));
  };

  const prevPlayer = () => {
    setCurrentIndex((prev) => (prev === 0 ? players.length - 1 : prev - 1));
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextPlayer();
    if (isRightSwipe) prevPlayer();
  };
  // -------------------------

  const currentPlayer = players[currentIndex];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col">
      
      {/* --- TOP BAR (Placeholder) --- */}
      <header className="p-4 flex justify-between items-center bg-stone-950 shadow-md border-b border-stone-800">
        <h1 className="text-xl font-bold tracking-widest text-amber-500">DM SCREEN</h1>
        <div className="text-xs text-stone-500">Runde 4</div>
      </header>

      {/* --- MELLEM HYLDE: CODEX KNAP --- */}
      {/* Dette er den nye hylde. Fuld bredde knap, nem at ramme på mobil. */}
      <div className="px-4 mt-4 mb-2">
        <button 
          onClick={() => setShowCodex(!showCodex)}
          className="w-full bg-amber-800 hover:bg-amber-700 active:bg-amber-900 
                     text-amber-100 py-3 rounded-lg shadow-lg border border-amber-600/50
                     flex items-center justify-center gap-2 transition-all"
        >
          <BookOpen size={20} />
          <span className="font-bold uppercase tracking-wider text-sm">
            {showCodex ? 'Luk Bogen' : 'Åbn Codex'}
          </span>
        </button>
      </div>

      {/* --- PLAYER AREA (SWIPE ZONE) --- */}
      <main className="flex-1 flex flex-col justify-center px-4 pb-8 relative overflow-hidden">
        
        {/* Codex Overlay (Simpel visning) */}
        {showCodex && (
          <div className="absolute inset-0 z-20 bg-stone-900/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center animate-in fade-in duration-200">
            <h2 className="text-2xl text-amber-500 mb-4">Codex Knowledge</h2>
            <p className="text-center text-stone-300">Her er dine regler og noter...</p>
            <button onClick={() => setShowCodex(false)} className="mt-8 text-stone-500 underline">Luk</button>
          </div>
        )}

        {/* Swipe Container wrapper */}
        <div 
          className="relative w-full max-w-md mx-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          
          {/* Card Display */}
          <div className="bg-stone-800 border border-stone-700 rounded-2xl shadow-2xl p-6 min-h-[300px] flex flex-col items-center justify-between relative select-none">
            
            {/* Header info */}
            <div className="w-full flex justify-between items-start mb-4">
              <span className="text-xs uppercase text-stone-500 tracking-wider">Spiller {currentIndex + 1}/{players.length}</span>
              <div className={`w-3 h-3 rounded-full ${currentPlayer.color}`}></div>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-stone-100">{currentPlayer.name}</h2>
              <p className="text-amber-500 font-serif italic text-lg">{currentPlayer.class}</p>
            </div>

            {/* Stats (HP) */}
            <div className="w-full mt-6">
              <div className="flex justify-between text-sm mb-1 font-mono text-stone-400">
                <span>HP</span>
                <span>{currentPlayer.hp} / {currentPlayer.maxHp}</span>
              </div>
              <div className="w-full bg-stone-900 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full ${currentPlayer.color} transition-all duration-500`} 
                  style={{ width: `${(currentPlayer.hp / currentPlayer.maxHp) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Mobile Hint (Only visible on small screens) */}
            <div className="absolute bottom-2 left-0 right-0 text-center md:hidden">
              <p className="text-[10px] text-stone-600 uppercase tracking-widest opacity-50">Swipe for at skifte</p>
            </div>

          </div>

          {/* --- DESKTOP NAVIGATION (Skjult på mobil) --- */}
          {/* Vises kun på skærme større end 'md' breakpoint */}
          <button 
            onClick={prevPlayer}
            className="hidden md:flex absolute top-1/2 -left-16 -translate-y-1/2 
                       w-12 h-12 bg-stone-800 hover:bg-stone-700 rounded-full 
                       items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={nextPlayer}
            className="hidden md:flex absolute top-1/2 -right-16 -translate-y-1/2 
                       w-12 h-12 bg-stone-800 hover:bg-stone-700 rounded-full 
                       items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>

        </div>
      </main>
    </div>
  );
};

export default PlayerTracker;
