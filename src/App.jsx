import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Play, Trophy, Monitor, ChevronRight, CheckCircle2, Zap, Trash2, RefreshCcw, AlertTriangle, FastForward, Flame } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFETTI COMPONENT ---
const SimpleConfetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#73ff00', '#ff00ea'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, 
      delay: Math.random() * 2, 
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.8,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
};

const MainLayout = ({ children, quizMode }) => (
  <div className={`min-h-[100dvh] text-slate-100 font-sans transition-colors duration-500 flex flex-col ${quizMode.includes('test') ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900'}`}>
    {quizMode.includes('test') && <div className="bg-amber-500 text-black font-black text-center text-xs py-1">TEST MODE {quizMode.includes('3') ? '3' : (quizMode.includes('2') ? '2' : '1')} (DEV)</div>}
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-3 md:p-6 flex-grow flex flex-col justify-between relative z-10">
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
  const [gameState, setGameState] = useState({ status: 'lobby', current_question: 0, quiz_mode: 'real' });
  const [localStartTime, setLocalStartTime] = useState(null);
  
  // --- DATA: TEST RUNDER ---
  const testQuestions1 = [
    { q: "TEST 1: Virker knapperne?", o: ["Ja", "Nej", "Måske", "Ved ikke"], a: 0, c: "Knapperne virker! Det er lige til at trykke på." },
    { q: "TEST 2: Hvad hedder Matias' kat?", o: ["Plet", "Mina", "Speck", "Felix"], a: 2, c: "Speck. En kat med respekt." }
  ];
  const testQuestions2 = [
    { q: "RUNDE 2 TEST: Er vi videre?", o: ["Ja da", "Nej", "Hvad?", "Måske"], a: 0, c: "Vi ruller videre. Ingen slinger i valsen her." },
    { q: "RUNDE 2 TEST: Hvad drikker vi?", o: ["Vand", "Mælk", "Champagne", "Gift"], a: 2, c: "Bobler! Det er brusende godt." }
  ];
  const testQuestions3 = [
    { q: "RUNDE 3 TEST (SPICY): Er du fuld?", o: ["Lidt", "Meget", "Nej", "Måske"], a: 1, c: "Skål! Du sejler, men skibet er ladet med fest." },
    { q: "RUNDE 3 TEST (SPICY): Skal vi i seng?", o: ["Nu", "Aldrig", "Om lidt", "I morgen"], a: 0, c: "Sengen kalder, men festen larmer. Godnat!" }
  ];

  // --- DATA: RUNDE 1 (ANDREAS' VERSION: SEKSY VIBES) ---
  const realQuestions1 = [
    { q: "Hvad er ifølge datingsider den mest attraktive egenskab i 2025?", o: ["Humor", "Muskler", "Penge", "Emotionel intelligens"], a: 3, c: "Følelser er det nye sixpack. Kan du tale om dem, kan du også få dem." },
    { q: "Hvilken emoji bliver oftest brugt som flirt uden at sige det direkte?", o: ["🍆", "🔥", "😉", "💦"], a: 2, c: "Blinket siger: 'Jeg mener det… men måske ikke… men jo'." },
    { q: "Hvad svarer flest, når de bliver spurgt om deres største turn-on?", o: ["Selvtillid", "Højde", "Stemmen", "Hænder"], a: 0, c: "Ikke for meget, ikke for lidt. Bare nok til at fylde rummet." },
    { q: "Hvad er den mest almindelige løgn i en dating-bio?", o: ["Jeg elsker at rejse", "Jeg er spontan", "Jeg elsker naturen", "Jeg er klar til noget seriøst"], a: 3, c: "Alle er klar… lige indtil det bliver seriøst." },
    { q: "Hvad bliver oftest beskrevet som det mest erotiske ved en person?", o: ["Øjne", "Duft", "Smil", "Stemme"], a: 3, c: "En stemme kan klæde én helt af uden at røre." },
    { q: "Hvornår føler folk sig mest sexede?", o: ["Efter træning", "Når de er forelskede", "Når de får komplimenter", "Når de er fulde"], a: 2, c: "Et ægte kompliment slår både spejle og shots." },
    { q: "Hvad er mest sandsynligt at føre til et kys?", o: ["Øjenkontakt", "En joke", "En drink mere", "En dans"], a: 0, c: "Blikket gør arbejdet før læberne tør." },
    { q: "Hvad er den mest delte 'dirty little secret'?", o: ["Fantasier", "Gamle flirts", "Stalking på Instagram", "Screenshots"], a: 2, c: "Alle kigger. Ingen indrømmer det." },
    { q: "Hvad bliver oftest beskrevet som 'overraskende frækt'?", o: ["Intelligens", "At lave mad", "At lytte", "At tage initiativ"], a: 1, c: "Når nogen kan noget med hænderne… og krydderier." },
    { q: "BONUS: Er stemningen blevet lidt varm?", o: ["Ja 🔥", "Meget", "Jeg sveder", "Skru ned"], a: 0, c: "Perfekt. Så er vi kun lige begyndt." }
  ];

  // --- DATA: RUNDE 2 (ANDREAS' VERSION: CONFESSIONS & FLIRT FAILS) ---
  const realQuestions2 = [
    { q: "Hvad er den mest almindelige flirt-fejl?", o: ["For meget snap", "For lidt svar", "For meget selvtillid", "At være for sød"], a: 0, c: "Mystik er hot. Spam er ikke." },
    { q: "Hvad er mest sandsynligt at ødelægge en god flirt?", o: ["Dårlig ånde", "En eks-historie", "Telefonen fremme", "Alle tre"], a: 3, c: "Kys kræver nærvær. Ikke notifikationer." },
    { q: "Hvad svarer flest, hvis de bliver ghostet?", o: ["Intet", "En joke", "Et langt afsnit", "Et selfie"], a: 0, c: "Stilhed er den koldeste afslutning." },
    { q: "Hvad er den mest sexy besked at få?", o: ["'Tænker på dig'", "'Er du vågen?'", "'Kom over'", "'Savner dig'"], a: 0, c: "Kort. Ærligt. Effektivt." },
    { q: "Hvad bliver oftest nævnt som det mest akavede øjeblik?", o: ["Forkert navn", "Lyde", "Forældre", "Alle ovenstående"], a: 3, c: "Der findes ingen værdighed efter punktet." },
    { q: "Hvad tænder flest mere end udseende?", o: ["Humor", "Tryghed", "Selvsikkerhed", "At blive valgt"], a: 3, c: "At føle sig valgt slår alt." },
    { q: "Hvad er mest sandsynligt at føre til en gentagelse?", o: ["God kemi", "God sex", "God samtale", "God timing"], a: 0, c: "Når det klikker, klikker det." },
    { q: "Hvad indrømmer folk oftest efter et glas vin?", o: ["Crushes", "Fantasier", "Fortrydelser", "Alt"], a: 3, c: "Vin er sandhedsserum med prop." },
    { q: "Hvad er mest attraktivt i sengen ifølge flest?", o: ["Kommunikation", "Erfaring", "Passion", "Overraskelser"], a: 0, c: "Spørg hellere end at gætte." },
    { q: "BONUS: Er vi klar til den SPICY runde?", o: ["JA 😈", "Måske", "Jeg er rød i hovedet", "Hvad?"], a: 0, c: "Godt. Nu bliver det spicy." }
  ];

  // --- DATA: RUNDE 3 (ANDREAS' VERSION: SPICY & LEGESYG) ---
  const realQuestions3 = [
    { q: "Hvad er den mest almindelige frække tanke i hverdagen?", o: ["Kollegaen", "Eks'en", "En fremmed", "Alle tre"], a: 3, c: "Hjernen stopper aldrig. Den hvisker bare." },
    { q: "Hvad bliver oftest beskrevet som 'uventet frækt'?", o: ["Hvisken", "Langsomhed", "Initiativ", "Øjenkontakt"], a: 1, c: "Det er ikke tempoet. Det er pausen." },
    { q: "Hvad er mest sandsynligt at tænde en gnist igen?", o: ["Et blik", "En besked sent", "Et minde", "Berøring"], a: 0, c: "Nogle blikke glemmer man aldrig." },
    { q: "Hvad siger flest ja til, hvis stemningen er rigtig?", o: ["Noget nyt", "Noget forbudt", "Noget spontant", "Alt"], a: 3, c: "Stemning slår regler." },
    { q: "Hvad er det mest sexy at høre?", o: ["'Jeg vil have dig'", "'Du er smuk'", "'Kom her'", "'Jeg stoler på dig'"], a: 3, c: "Tillid er det frækkeste ord." },
    { q: "Hvad er den største turn-off midt i det hele?", o: ["Usikkerhed", "Stress", "Telefonen", "Tvivl"], a: 2, c: "Ingen vil konkurrere med en skærm." },
    { q: "Hvad husker folk bedst bagefter?", o: ["Stemningen", "Detaljerne", "Følelsen", "Lydene"], a: 2, c: "Kroppen husker, selv når hjernen glemmer." },
    { q: "Hvad er mest sandsynligt at føre til grin på den gode måde?", o: ["Ærlighed", "Klodsethed", "Improvisation", "Alt"], a: 3, c: "Hvis I kan grine, kan I alt." },
    { q: "Hvad er den største hemmelige fantasi?", o: ["At blive valgt igen", "At slippe kontrollen", "At blive set", "Alle"], a: 3, c: "Vi vil bare gerne mærkes." },
    { q: "SIDSTE SPØRGSMÅL: Hvem har styret festen i aften?", o: ["Vi har! 🔥", "Naboen", "Politiet", "Ingen"], a: 0, c: "Tak for legen. Husk: Det er kun et spil… måske." }
  ];

  // Logik til at vælge spørgsmål
  let activeData = [];
  if (gameState.quiz_mode === 'test') activeData = testQuestions1;
  else if (gameState.quiz_mode === 'test_2') activeData = testQuestions2;
  else if (gameState.quiz_mode === 'test_3') activeData = testQuestions3;
  else if (gameState.quiz_mode === 'real') activeData = realQuestions1;
  else if (gameState.quiz_mode === 'real_2') activeData = realQuestions2;
  else if (gameState.quiz_mode === 'real_3') activeData = realQuestions3;
  else activeData = realQuestions1;

  useEffect(() => {
    if (!SUPABASE_URL) return;
    const fetchInitialData = async () => {
      const { data: pData } = await supabase.from('players').select('*').order('score', { ascending: false });
      if (pData) setPlayers(pData);
      const { data: rData } = await supabase.from('quiz_rooms').select('*').eq('room_code', roomCode).single();
      if (rData) setGameState({ 
        status: rData.status, 
        current_question: rData.current_question, 
        quiz_mode: rData.quiz_mode || 'real' 
      });
    };
    fetchInitialData();

    const roomSub = supabase.channel('room_updates').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_rooms' }, (payload) => {
      setGameState({ 
        status: payload.new.status, 
        current_question: payload.new.current_question, 
        quiz_mode: payload.new.quiz_mode || 'real' 
      });
    }).subscribe();

    const playerSub = supabase.channel('player_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async (payload) => {
      if (payload.eventType === 'DELETE' && role === 'player') window.location.reload();
      const { data } = await supabase.from('players').select('*').order('score', { ascending: false });
      setPlayers(data || []);
    }).subscribe();

    return () => { supabase.removeChannel(roomSub); supabase.removeChannel(playerSub); };
  }, [roomCode, role]);

  useEffect(() => {
    if (gameState.status === 'active') {
        setLocalStartTime(Date.now());
    }
  }, [gameState.current_question, gameState.status]);

  useEffect(() => {
    if (role === 'host' && gameState.status === 'active' && players.length > 0) {
        const allAnswered = players.every(p => p.last_q_index === gameState.current_question);
        if (allAnswered) {
            const timer = setTimeout(() => {
                updateGameStatus('showing_answer', gameState.current_question);
            }, 500);
            return () => clearTimeout(timer);
        }
    }
  }, [players, gameState.status, role, gameState.current_question]);

  const submitAnswer = async (idx) => {
    const me = players.find(p => p.name === playerName);
    
    if (me && me.last_q_index === gameState.current_question) return;
    if (gameState.status !== 'active') return;

    if (me) {
        let updateData = { last_answer: idx, last_q_index: gameState.current_question };
        
        let speedBonus = 0;
        if (localStartTime && idx === activeData[gameState.current_question]?.a) {
            const now = Date.now();
            const secondsPassed = (now - localStartTime) / 1000;
            speedBonus = Math.min(10, Math.max(0, Math.floor(10 - secondsPassed)));
        }

        if (idx === activeData[gameState.current_question]?.a) {
            updateData.score = (me.score || 0) + 10 + speedBonus;
            updateData.correct_count = (me.correct_count || 0) + 1;
            updateData.total_bonus = (me.total_bonus || 0) + speedBonus;
        }
        await supabase.from('players').update(updateData).eq('id', me.id);
    }
  };

  const updateGameStatus = async (status, idx = 0) => {
    if (idx >= activeData.length && status === 'active') status = 'finished';
    const payload = { status, current_question: Math.min(idx, activeData.length - 1) };
    await supabase.from('quiz_rooms').update(payload).eq('room_code', roomCode);
  };

  const fullReset = async () => {
    if (!window.confirm("ER DU SIKKER? Sletter alt!")) return;
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    if (room) {
      await supabase.from('players').delete().eq('room_id', room.id);
      await supabase.from('quiz_rooms').update({ status: 'lobby', current_question: 0, quiz_mode: 'real' }).eq('room_code', roomCode);
    }
  };

  const startMoreQuestions = async () => {
    const currentBase = gameState.quiz_mode.includes('test') ? 'test' : 'real';
    let nextMode = '';
    let promptText = '';

    if (gameState.quiz_mode === currentBase) { nextMode = currentBase + '_2'; promptText = "Klar til RUNDE 2? Pointene nulstilles!"; }
    else if (gameState.quiz_mode === currentBase + '_2') { nextMode = currentBase + '_3'; promptText = "Klar til RUNDE 3 (FINALEN)? Pointene nulstilles!"; }
    else return;

    if (!window.confirm(promptText)) return;
    
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    if (room) {
        await supabase.from('players').update({ score: 0, correct_count: 0, total_bonus: 0, last_answer: null, last_q_index: -1 }).eq('room_id', room.id);
    }
    await supabase.from('quiz_rooms').update({ quiz_mode: nextMode, current_question: 0, status: 'lobby' }).eq('room_code', roomCode);
  };

  const toggleMode = async () => {
    const newMode = gameState.quiz_mode.includes('real') ? 'test' : 'real';
    if (!window.confirm(`Skift til ${newMode === 'real' ? 'RIGTIG (Runde 1)' : 'TEST (Runde 1)'}?`)) return;
    await supabase.from('quiz_rooms').update({ quiz_mode: newMode, current_question: 0, status: 'lobby' }).eq('room_code', roomCode);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    if (room) { await supabase.from('players').insert([{ name: playerName, score: 0, room_id: room.id, last_q_index: -1 }]); setRole('player'); setView('game'); }
  };

  if (view === 'landing') {
    return (
      <MainLayout quizMode={gameState.quiz_mode}>
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-slate-900 rounded-full p-4 mb-6"><Zap className="text-amber-400" size={64} fill="currentColor" /></div>
          </div>
          <h1 className="text-6xl font-black mb-10 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 drop-shadow-lg">H. Schneekloths<br/>NYTÅRS<br/>BATTLE<br/>2025</h1>
          <div className="w-full space-y-4">
            <button onClick={() => { setRole('host'); setView('game'); }} className="w-full bg-slate-800/50 text-indigo-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 transition-all"><Monitor size={20} /> Start som Vært</button>
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
  const myData = players.find(p => p.name === playerName);
  const iHaveAnsweredThisSpecificQuestion = myData && myData.last_q_index === gameState.current_question;

  const getRoundTitle = () => {
      if (gameState.quiz_mode.includes('3')) return "RUNDE 3 🔥";
      if (gameState.quiz_mode.includes('2')) return "RUNDE 2 🚀";
      return "QUIZ'25";
  };

  return (
    <MainLayout quizMode={gameState.quiz_mode}>
      <div className="flex justify-between items-center mb-4 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
        <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{getRoundTitle()}</div>
        <div className="flex items-center gap-3">
          {role === 'host' && <button onClick={fullReset} className="text-rose-400 p-2"><Trash2 size={20} /></button>}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-bold text-sm border border-slate-700"><Users size={14} className="text-indigo-400" /> {players.length}</div>
        </div>
      </div>

      {gameState.status === 'lobby' && (
        <div className="flex-grow flex flex-col text-center">
          <h2 className="text-4xl font-black mb-2 text-white">{gameState.quiz_mode.includes('3') ? "Klar til SPICY runde? 🌶️" : (gameState.quiz_mode.includes('2') ? "Klar til Runde 2?" : "Lobbyen er åben!")}</h2>
          <p className="text-slate-400 mb-8 text-sm">Find jeres pladser...</p>
          {role === 'host' && ( <button onClick={toggleMode} className="mb-8 mx-auto text-xs font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-600 text-slate-400">{gameState.quiz_mode.includes('test') ? "Skift til PROD" : "Skift til TEST"}</button> )}
          <div className="grid grid-cols-2 gap-3 mb-8 overflow-y-auto max-h-[50vh] p-2">
            {players.map((p, i) => (
              <div key={i} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between animate-in zoom-in">
                <span className="font-bold text-slate-200 truncate text-sm">{p.name}</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              </div>
            ))}
          </div>
          {role === 'host' && ( <button onClick={() => updateGameStatus('active')} className="mt-auto w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-indigo-900/50 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3"> START <Play fill="currentColor" size={24} /> </button> )}
        </div>
      )}

      {gameState.status === 'active' && currentQ && (
        <div className="flex-grow flex flex-col">
          <div className="text-center mb-4">
            <span className="inline-block bg-slate-800 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-slate-700">Spørgsmål {gameState.current_question + 1} / {activeData.length}</span>
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-white drop-shadow-sm">{currentQ.q}</h2>
          </div>
          <div key={gameState.current_question} className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow content-center">
            {currentQ.o.map((opt, i) => (
              role === 'player' ? (
                <button key={i} disabled={iHaveAnsweredThisSpecificQuestion} onClick={() => submitAnswer(i)} className={`relative p-6 rounded-2xl text-xl font-bold text-left transition-all border-b-4 active:border-b-0 active:translate-y-1 touch-manipulation ${iHaveAnsweredThisSpecificQuestion ? 'bg-slate-800 border-slate-900 text-slate-500' : 'bg-slate-700 border-slate-900 hover:bg-slate-600 text-white active:bg-indigo-600'}`}>{opt}</button>
              ) : (
                <div key={i} className="bg-slate-800 p-6 rounded-2xl text-xl font-bold text-center border-b-4 border-slate-900 text-slate-300 flex flex-col justify-center items-center"><span>{opt}</span>
                    <div className="mt-2 flex gap-1 flex-wrap justify-center">{players.filter(p => p.last_q_index === gameState.current_question).length > 0 && <span className="text-[10px] text-slate-500 animate-pulse">Venter på svar...</span>}</div>
                </div>
              )
            ))}
          </div>
          {role === 'host' && <button onClick={() => updateGameStatus('showing_answer', gameState.current_question)} className="mt-6 w-full bg-amber-500 text-black py-4 rounded-2xl font-black text-xl shadow-lg">SE SVAR</button>}
          {role === 'player' && iHaveAnsweredThisSpecificQuestion && <div className="mt-4 text-center text-indigo-400 font-bold animate-pulse">Svar modtaget... 🤞</div>}
        </div>
      )}

      {gameState.status === 'showing_answer' && currentQ && (
        <div className="flex-grow flex flex-col items-center justify-start text-center overflow-y-auto">
          {(() => {
            const playersWhoAnswered = players.filter(p => p.last_q_index === gameState.current_question);
            const everyoneWrong = playersWhoAnswered.length > 0 && playersWhoAnswered.every(p => p.last_answer !== currentQ.a);
            if (everyoneWrong) return (<div className="w-full bg-rose-600 text-white p-6 rounded-3xl mb-6 animate-bounce shadow-2xl border-4 border-rose-800"><div className="flex justify-center mb-2"><AlertTriangle size={48} className="text-yellow-300" /></div><h2 className="text-3xl font-black uppercase mb-2">KATASTROFE!</h2><p className="text-xl font-bold">Alle drikker! Bund eller resten i håret!</p></div>);
            return null;
          })()}
          <div className="mb-6 w-full max-w-2xl mx-auto">
             <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-500/20"><CheckCircle2 size={14} /> Det rigtige svar</div>
             <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{currentQ.o[currentQ.a]}</h2>
             {currentQ.c && (<div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-slate-300 text-sm md:text-base italic leading-relaxed shadow-sm max-w-lg mx-auto">" {currentQ.c} "</div>)}
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
             {currentQ.o.map((opt, i) => {
                const isCorrect = i === currentQ.a;
                const votedHere = players.filter(p => p.last_q_index === gameState.current_question && p.last_answer === i);
                return (
                    <div key={i} className={`p-3 rounded-xl border-2 flex flex-col ${isCorrect ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-slate-800/50 border-slate-800'}`}>
                        <div className="flex justify-between items-center mb-2"><span className={`font-bold text-sm ${isCorrect ? 'text-emerald-400' : 'text-slate-400'}`}>{opt}</span>{isCorrect && <CheckCircle2 size={16} className="text-emerald-500" />}</div>
                        <div className="flex flex-wrap gap-1 mt-auto">{votedHere.map((p, idx) => (<span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md font-bold truncate max-w-[100px] ${isCorrect ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{p.name}</span>))}</div>
                    </div>
                )
             })}
          </div>
          {role === 'host' && <button onClick={() => updateGameStatus('active', gameState.current_question + 1)} className="mt-auto w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50">NÆSTE <ChevronRight /></button>}
        </div>
      )}

      {gameState.status === 'finished' && (
        <div className="flex-grow flex flex-col relative">
          <SimpleConfetti />
          <div className="text-center mb-8 relative z-10">
             <Trophy size={64} className="mx-auto text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
             <h2 className="text-4xl font-black text-white italic">RESULTATER</h2>
             <div className="text-amber-300 font-bold mt-2 uppercase">{getRoundTitle()} AFSLUTTET</div>
          </div>
          <div className="space-y-3 mb-8 relative z-10">
            {players.map((p, i) => (
              <div key={i} className={`relative flex flex-col p-4 rounded-2xl border-b-4 ${i===0 ? 'bg-amber-500 text-black border-amber-700' : 'bg-slate-800 border-slate-900 text-slate-200'}`}>
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-3"><div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-black ${i===0?'bg-black/20':'bg-slate-900'}`}>{i+1}</div><div className="text-xl font-black truncate">{p.name}</div></div>
                   <div className="text-3xl font-black">{p.score}</div>
                </div>
                <div className={`text-[11px] font-bold uppercase leading-tight ${i===0?'text-amber-900':'text-slate-500'}`}>Svarede rigtigt på {p.correct_count || 0} spørgsmål og hentede {p.total_bonus || 0} point på hastighed.</div>
                {i===0 && <div className="absolute -top-2 -right-1 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">VINDER!</div>}
              </div>
            ))}
          </div>
          {role === 'host' && (
            <div className="mt-auto space-y-4 relative z-10">
                {!gameState.quiz_mode.includes('3') && (
                    <button onClick={startMoreQuestions} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl animate-pulse hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">{gameState.quiz_mode.includes('2') ? "SPICY RUNDE 3!!!" : "MERE!!!"} <Flame fill="currentColor" /></button>
                )}
                <button onClick={fullReset} className="w-full text-rose-500 text-xs font-bold uppercase flex items-center justify-center gap-2 py-4"><RefreshCcw size={14} /> Nulstil alt</button>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default QuizApp;
