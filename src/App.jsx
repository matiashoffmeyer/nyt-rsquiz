import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Play, Trophy, Smartphone, Monitor, ChevronRight, CheckCircle2, Zap, Trash2, Timer, Star, RefreshCcw, Award, FlaskConical } from 'lucide-react';

// HUSK AT OPRETTE DIN .ENV FIL MED DISSE NØGLER!
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- LAYOUT KOMPONENT (Ligger UDENFOR QuizApp for at inputtet ikke mister fokus) ---
const MainLayout = ({ children, quizMode }) => (
  <div className={`min-h-screen text-slate-100 font-sans transition-colors duration-500 flex flex-col ${quizMode === 'test' ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900'}`}>
    {quizMode === 'test' && <div className="bg-amber-500 text-black font-black text-center text-xs py-1">TEST MODE (DEV)</div>}
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-4 md:p-6 flex-grow flex flex-col">
      {children}
    </div>
  </div>
);

const QuizApp = () => {
  const [view, setView] = useState('landing');
  const [role, setRole] = useState(null);
  const [roomCode] = useState('NYTÅR2025');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState({ status: 'lobby', current_question: 0, question_started_at: null, quiz_mode: 'real' });
  const [hasAnswered, setHasAnswered] = useState(false);

  // --- DATA: TEST MILJØ (2 SPG) ---
  const testQuestions = [
    { q: "TEST 1: Virker knapperne?", o: ["Ja", "Nej", "Måske", "Ved ikke"], a: 0 },
    { q: "TEST 2: Hvad hedder Matias' kat?", o: ["Plet", "Mina", "Speck", "Felix"], a: 2 }
  ];

  // --- DATA: NYTÅRS QUIZ 2025 (30 NYE SPØRGSMÅL) ---
  const realQuestions = [
    // SPORT & BEGIVENHEDER
    { q: "Hvem vandt Tour de France i sommeren 2025?", o: ["Jonas Vingegaard", "Tadej Pogacar", "Remco Evenepoel", "Primoz Roglic"], a: 0 },
    { q: "Hvilken dansk festival meldte 'Alt Udsolgt' på rekordtid (4 minutter) i 2025?", o: ["Roskilde Festival", "Smukfest", "NorthSide", "Copenhell"], a: 1 },
    { q: "Hvilket land vandt Eurovision Song Contest 2025?", o: ["Sverige", "Frankrig", "Italien", "Ukraine"], a: 2 },
    { q: "Hvad blev resultatet af den store 'Storebælts-lukning' i januar 2025?", o: ["Ingen mælk i Kbh", "Total trafikprop", "Færgerne kom tilbage", "Gratis bro i en uge"], a: 1 },
    
    // POLITIK & SAMFUND
    { q: "Hvilken ministerpost blev nedlagt i 2025 som led i 'effektivisering'?", o: ["Kirkeministeren", "Digitaliseringsministeren", "Ældreministeren", "Nordisk Samarbejde"], a: 1 },
    { q: "Hvad hedder den nye bydel i København, der officielt åbnede første etape i 2025?", o: ["Lynetteholm", "Jernbanebyen", "Nordhavn Vest", "Enghave Brygge"], a: 0 },
    { q: "Hvilken valuta ramte sin laveste kurs nogensinde overfor den danske krone i 2025?", o: ["Svenske kroner", "Norske kroner", "US Dollar", "Pund"], a: 0 },
    { q: "Hvem holdt årets mest omdiskuterede nytårstale ved indgangen til 2025?", o: ["Mette Frederiksen", "Kong Frederik X", "Lars Løkke", "Dronning Margrethe"], a: 1 },

    // KULTUR & GOSSIP
    { q: "Hvilket dansk kendis-par gik fra hinanden i foråret 2025 og skabte forside-storm?", o: ["Remee & Mathilde", "Christopher & Cecilie", "Medina & Malo", "Nicklas Bendtner & Ny flamme"], a: 1 },
    { q: "Hvad var årets mest streamede danske sang i 2025?", o: ["Stor Mand 2", "Tobias Rahim (Ny single)", "Gilli - 'Hjem'", "Artigeardit - 'Fri'"], a: 1 },
    { q: "Hvilken gammel dansk TV-serie fik et 'reboot' på Netflix i 2025?", o: ["Rejseholdet", "Matador", "Taxa", "Klovn"], a: 2 },
    { q: "Hvem vandt 'Vild med Dans' 2025?", o: ["En YouTuber", "En håndboldspiller", "En politiker", "En skuespiller"], a: 0 },

    // TECH & VIDENSKAB
    { q: "Hvilken funktion fjernede Apple fra iPhone 17 (2025-modellen)?", o: ["Ladeporten", "Volumeknapperne", "Frontkameraet", "Siri"], a: 0 },
    { q: "Hvad blev kåret som 'Årets Ord 2025' af Dansk Sprognævn?", o: ["AI-skam", "Klimatristhed", "Skærmfri", "Multiprise"], a: 0 },
    { q: "Hvilken planet sendte NASA succesfuldt en ny type drone til i 2025?", o: ["Mars", "Venus", "Jupiter", "Saturn"], a: 1 },
    { q: "Hvad kostede en liter benzin i gennemsnit i sommeren 2025?", o: ["11 kr.", "14 kr.", "17 kr.", "20 kr."], a: 2 },

    // BLANDET GODT
    { q: "Hvilken dansk supermarkedskæde annoncerede, at de stopper med at sælge tobak i 2025?", o: ["Netto", "Rema 1000", "Coop 365", "Lidl"], a: 1 },
    { q: "Hvilken farve var 'Årets Farve' i modebilledet 2025?", o: ["Limegrøn", "Elektrisk Blå", "Fersken", "Dyb Lilla"], a: 3 },
    { q: "Hvad skete der med Parken (stadion) i 2025?", o: ["Nyt navn", "Udvidelse godkendt", "Nyt græstæppe", "Taget blæste af"], a: 1 },
    { q: "Hvilken dansk by blev kåret til 'Europas Kulturhovedstad' (uformelt) af CNN?", o: ["Aarhus", "Odense", "Aalborg", "Esbjerg"], a: 1 },

    // AFSLUTTENDE SPØRGSMÅL
    { q: "Hvem scorede det afgørende mål i Champions League finalen 2025?", o: ["Haaland", "Mbappé", "Vinicius Jr.", "Højlund"], a: 1 },
    { q: "Hvad hed den storm, der ramte Danmark i oktober 2025?", o: ["Bodil", "Gorm", "Ingolf", "Jytte"], a: 2 },
    { q: "Hvilket socialt medie lukkede endegyldigt i 2025?", o: ["X (Twitter)", "Snapchat", "Threads", "Pinterest"], a: 0 },
    { q: "Hvor mange Michelin-stjerner fik restaurant 'Jordnær' i 2025 guiden?", o: ["1", "2", "3", "Mistede alle"], a: 2 },
    { q: "Hvem blev ny vært på 'X-Factor' i 2025?", o: ["Sofie Linde (retur)", "Melvin Kakooza", "Petra Nagel", "Martin Johannes Larsen"], a: 1 },
    { q: "Hvad blev den mest populære hunderace i Danmark i 2025?", o: ["Labrador", "Fransk Bulldog", "Golden Retriever", "Cocker Spaniel"], a: 3 },
    { q: "Hvor holdt Lukas Graham sin 'Comeback' koncert i 2025?", o: ["Royal Arena", "Boxen", "Christiania", "Refshaleøen"], a: 2 },
    { q: "Hvilken drik afløste 'Aperol Spritz' som sommerens hit i 2025?", o: ["Limoncello Spritz", "Hugo", "Espresso Tonic", "White Port & Tonic"], a: 0 },
    { q: "Hvad var navnet på DR's store julekalender i 2025?", o: ["Tidsrejsen 3", "Nissernes Ø", "Julefeber 2", "Gammel Jul"], a: 2 },
    { q: "Sidste spørgsmål: Hvem vinder denne quiz?", o: ["Mig!", "Værten", "Sidemanden", "Ingen ved det"], a: 0 }
  ];

  const activeData = gameState.quiz_mode === 'test' ? testQuestions : realQuestions;

  // --- SUPABASE & LOGIC ---
  useEffect(() => {
    if (!SUPABASE_URL) return;
    const fetchInitialData = async () => {
      const { data: pData } = await supabase.from('players').select('*').order('score', { ascending: false });
      if (pData) setPlayers(pData);
      const { data: rData } = await supabase.from('quiz_rooms').select('*').eq('room_code', roomCode).single();
      if (rData) setGameState({ 
        status: rData.status, 
        current_question: rData.current_question, 
        question_started_at: rData.question_started_at,
        quiz_mode: rData.quiz_mode || 'real' 
      });
    };
    fetchInitialData();

    const roomSub = supabase.channel('room_updates').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_rooms' }, (payload) => {
      setGameState({ 
        status: payload.new.status, 
        current_question: payload.new.current_question, 
        question_started_at: payload.new.question_started_at,
        quiz_mode: payload.new.quiz_mode || 'real' 
      });
      if (payload.new.status === 'active') setHasAnswered(false);
    }).subscribe();

    const playerSub = supabase.channel('player_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async (payload) => {
      if (payload.eventType === 'DELETE' && role === 'player') window.location.reload();
      const { data } = await supabase.from('players').select('*').order('score', { ascending: false });
      setPlayers(data || []);
    }).subscribe();

    return () => { supabase.removeChannel(roomSub); supabase.removeChannel(playerSub); };
  }, [roomCode, role]);

  const submitAnswer = async (idx) => {
    if (hasAnswered || gameState.status !== 'active') return;
    setHasAnswered(true);
    if (idx === activeData[gameState.current_question]?.a) {
      const secondsPassed = (new Date() - new Date(gameState.question_started_at)) / 1000;
      const speedBonus = Math.max(0, Math.floor(10 - secondsPassed));
      const me = players.find(p => p.name === playerName);
      if (me) await supabase.from('players').update({ score: (me.score || 0) + 10 + speedBonus, correct_count: (me.correct_count || 0) + 1, total_bonus: (me.total_bonus || 0) + speedBonus }).eq('id', me.id);
    }
  };

  const updateGameStatus = async (status, idx = 0) => {
    if (idx >= activeData.length && status === 'active') status = 'finished';
    const payload = { status, current_question: Math.min(idx, activeData.length - 1) };
    if (status === 'active') payload.question_started_at = new Date().toISOString();
    await supabase.from('quiz_rooms').update(payload).eq('room_code', roomCode);
  };

  const fullReset = async () => {
    if (!window.confirm("ER DU SIKKER? Sletter alt!")) return;
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    if (room) {
      await supabase.from('players').delete().eq('room_id', room.id);
      await updateGameStatus('lobby', 0);
    }
  };

  const toggleMode = async () => {
    const newMode = gameState.quiz_mode === 'real' ? 'test' : 'real';
    if (!window.confirm(`Skift til ${newMode === 'real' ? 'RIGTIG (30 spg)' : 'TEST (2 spg)'}?`)) return;
    await supabase.from('quiz_rooms').update({ quiz_mode: newMode, current_question: 0, status: 'lobby' }).eq('room_code', roomCode);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    if (room) { await supabase.from('players').insert([{ name: playerName, score: 0, room_id: room.id }]); setRole('player'); setView('game'); }
  };

  // --- UI VIEWS ---

  if (view === 'landing') {
    return (
      <MainLayout quizMode={gameState.quiz_mode}>
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-slate-900 rounded-full p-4 mb-6"><Zap className="text-amber-400" size={64} fill="currentColor" /></div>
          </div>
          <h1 className="text-6xl font-black mb-10 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 drop-shadow-lg">
  H. Schneekloths<br/>NYTÅRS<br/>BATTLE<br/>2025
</h1>
          <div className="w-full space-y-4">
            <button onClick={() => { setRole('host'); setView('game'); }} className="w-full bg-slate-800/50 text-indigo-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 transition-all">
              <Monitor size={20} /> Start som Vært
            </button>
            <div className="flex items-center gap-2">
               <input type="text" placeholder="Dit navn..." className="flex-grow p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-bold outline-none focus:border-amber-400 transition-colors" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
               <button onClick={handleJoin} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-emerald-900/50 active:scale-95 transition-all"><ChevronRight size={24} /></button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentQ = activeData[gameState.current_question];

  return (
    <MainLayout quizMode={gameState.quiz_mode}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
        <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">QUIZ'25</div>
        <div className="flex items-center gap-3">
          {role === 'host' && <button onClick={fullReset} className="text-rose-400 p-2"><Trash2 size={20} /></button>}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-bold text-sm border border-slate-700"><Users size={14} className="text-indigo-400" /> {players.length}</div>
        </div>
      </div>

      {/* LOBBY */}
      {gameState.status === 'lobby' && (
        <div className="flex-grow flex flex-col text-center">
          <h2 className="text-4xl font-black mb-2 text-white">Lobbyen er åben!</h2>
          <p className="text-slate-400 mb-8 text-sm">Find jeres pladser...</p>
          
          {role === 'host' && (
            <button onClick={toggleMode} className="mb-8 mx-auto text-xs font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-600 text-slate-400">{gameState.quiz_mode === 'test' ? "Skift til PROD" : "Skift til TEST"}</button>
          )}

          <div className="grid grid-cols-2 gap-3 mb-8 overflow-y-auto max-h-[50vh] p-2">
            {players.map((p, i) => (
              <div key={i} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between animate-in zoom-in">
                <span className="font-bold text-slate-200 truncate text-sm">{p.name}</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              </div>
            ))}
          </div>
          
          {role === 'host' && (
            <button onClick={() => updateGameStatus('active')} className="mt-auto w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-indigo-900/50 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3">
              START <Play fill="currentColor" size={24} />
            </button>
          )}
        </div>
      )}

      {/* GAME ACTIVE */}
      {gameState.status === 'active' && currentQ && (
        <div className="flex-grow flex flex-col">
          <div className="text-center mb-6">
            <span className="inline-block bg-slate-800 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-slate-700">Spørgsmål {gameState.current_question + 1} / {activeData.length}</span>
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-white drop-shadow-sm">{currentQ.q}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow content-center">
            {currentQ.o.map((opt, i) => (
              role === 'player' ? (
                <button 
                  key={i} 
                  disabled={hasAnswered} 
                  onClick={() => submitAnswer(i)} 
                  className={`relative p-6 rounded-2xl text-xl font-bold text-left transition-all border-b-4 active:border-b-0 active:translate-y-1 touch-manipulation ${hasAnswered ? 'bg-slate-800 border-slate-900 text-slate-500' : 'bg-slate-700 border-slate-900 hover:bg-slate-600 text-white active:bg-indigo-600'}`}
                >
                  {opt}
                </button>
              ) : (
                <div key={i} className="bg-slate-800 p-6 rounded-2xl text-xl font-bold text-center border-b-4 border-slate-900 text-slate-300">{opt}</div>
              )
            ))}
          </div>

          {role === 'host' && <button onClick={() => updateGameStatus('showing_answer', gameState.current_question)} className="mt-6 w-full bg-amber-500 text-black py-4 rounded-2xl font-black text-xl shadow-lg">SE SVAR</button>}
          {role === 'player' && hasAnswered && <div className="mt-4 text-center text-indigo-400 font-bold animate-pulse">Svar modtaget... 🤞</div>}
        </div>
      )}

      {/* SHOWING ANSWER */}
      {gameState.status === 'showing_answer' && currentQ && (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <div className="mb-8 relative">
             <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full"></div>
             <CheckCircle2 size={80} className="relative text-emerald-400 mx-auto mb-4" />
             <div className="bg-emerald-500 text-black p-8 rounded-3xl text-3xl font-black shadow-2xl rotate-1 mx-4">{currentQ.o[currentQ.a]}</div>
          </div>

          <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700 backdrop-blur-md">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-left">Top 3 lige nu</h3>
            {players.slice(0, 3).map((p, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
                 {/* FIX: Mellemrum i Top 3 */}
                 <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-bold text-slate-400 w-5">{i + 1}.</span>
                    <span className="font-bold text-slate-200 truncate">{p.name}</span>
                 </div>
                 <div className="font-black text-indigo-400 pl-4 whitespace-nowrap">
                    {p.score} pts
                 </div>
              </div>
            ))}
          </div>

          {role === 'host' && <button onClick={() => updateGameStatus('active', gameState.current_question + 1)} className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2">NÆSTE <ChevronRight /></button>}
        </div>
      )}

      {/* RESULTS */}
      {gameState.status === 'finished' && (
        <div className="flex-grow flex flex-col">
          <div className="text-center mb-8">
             <Trophy size={64} className="mx-auto text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
             <h2 className="text-4xl font-black text-white italic">RESULTATER</h2>
          </div>

          <div className="space-y-3 mb-8">
            {players.map((p, i) => (
              <div key={i} className={`relative flex flex-col p-4 rounded-2xl border-b-4 ${i===0 ? 'bg-amber-500 text-black border-amber-700' : 'bg-slate-800 border-slate-900 text-slate-200'}`}>
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-black ${i===0?'bg-black/20':'bg-slate-900'}`}>{i+1}</div>
                      <div className="text-xl font-black truncate">{p.name}</div>
                   </div>
                   <div className="text-3xl font-black">{p.score}</div>
                </div>
                <div className={`text-[11px] font-bold uppercase leading-tight ${i===0?'text-amber-900':'text-slate-500'}`}>
                    Svarede rigtigt på {p.correct_count || 0} spørgsmål og hentede {p.total_bonus || 0} point på hastighed.
                </div>
                {i===0 && <div className="absolute -top-2 -right-1 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">VINDER!</div>}
              </div>
            ))}
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl text-xs text-slate-400 border border-slate-700 mt-auto">
             <span className="block font-bold text-slate-300 mb-1">🤓 Sådan fik I point:</span>
             10 point pr. rigtigt svar + op til 10 bonuspoint for hastighed.
          </div>
          
          {role === 'host' && (
            <button onClick={fullReset} className="mt-6 text-rose-500 text-xs font-bold uppercase flex items-center justify-center gap-2 py-4">
               <RefreshCcw size={14} /> Nulstil alt
            </button>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default QuizApp;
