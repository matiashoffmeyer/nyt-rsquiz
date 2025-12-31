import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Play, Trophy, Monitor, ChevronRight, CheckCircle2, Zap, Trash2, RefreshCcw, Heart, Flame, Sparkles, Wine } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFETTI (ROMANTIC EDITION) ---
const SimpleConfetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#ff0000', '#ff69b4', '#ffffff', '#800080']; // Rød, Pink, Hvid, Lilla
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
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
            borderRadius: '50%', // Hearts/Circles vibes
          }}
        />
      ))}
    </div>
  );
};

const MainLayout = ({ children, quizMode }) => (
  // Romantisk baggrund: Mørk lilla/pink gradient
  <div className={`min-h-[100dvh] text-pink-50 font-sans transition-colors duration-500 flex flex-col ${quizMode.includes('test') ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#1a0510] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/60 via-purple-950 to-black'}`}>
    {quizMode.includes('test') && <div className="bg-amber-500 text-black font-black text-center text-xs py-1">TEST MODE {quizMode.includes('3') ? '3' : (quizMode.includes('2') ? '2' : '1')} (DEV)</div>}
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-3 md:p-6 flex-grow flex flex-col justify-between relative z-10">
      {children}
    </div>
  </div>
);

const QuizApp = () => {
  const [view, setView] = useState('landing');
  const [role, setRole] = useState(null);
  // FIX: Vi bruger 'NYTÅR2025' igen, da det er den kode, databasen kender!
  const [roomCode] = useState('NYTÅR2025'); 
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState({ status: 'lobby', current_question: 0, quiz_mode: 'real' });
  const [localStartTime, setLocalStartTime] = useState(null);
  
  // --- PROFIL: CHRISTINA ---
  // Christina: 34 år, Marketing Manager. Elsker god vin, hader arrogance. Er klar på sjov, men vil tages seriøst.

  // --- RUNDE 1: FØRSTE DATE (ISBRYDEREN) ---
  const datingQuestions1 = [
    { q: "Vi mødes på vinbaren. Hvad bestiller du til Christina for at starte aftenen godt?", o: ["En fadøl", "Et glas kølig Sancerre (Hvidvin)", "Et shot Tequila", "En kop te"], a: 1, c: "Klasse! Christina elsker hvidvin. Øl er for bodega-agtigt til første date, og tequila er for desperat." },
    { q: "Samtalen går lidt i stå. Hvad spørger du om for at få hende til at åbne op?", o: ["Hvorfor er du single?", "Hvad er din passion?", "Hvor meget tjener du?", "Kan du lide min skjorte?"], a: 1, c: "Passion! Det tænder en ild i hendes øjne. At spørge til eks-kærester eller løn er totalt turn-off." },
    { q: "Tjeneren spilder lidt vin på bordet. Hvordan reagerer du?", o: ["Bliver sur og kræver rabat", "Laver en joke og tørrer det op", "Ignorerer det", "Får Christina til at tørre det op"], a: 1, c: "Humor og overskud er sexet. At blive sur på servicepersonale er det største røde flag for en kvinde på 34." },
    { q: "Hun nævner, at hun elsker reality-tv. Hvad siger du?", o: ["Ad, det er for dumt", "Jeg ser det også! (Løgn)", "Det er min guilty pleasure!", "Vi skal se Paradise sammen"], a: 2, c: "Ærlighed + fælles sjov. 'Guilty pleasure' viser, at du ikke er en snob, men heller ikke dum." },
    { q: "Regningen kommer. Hvad er det rigtige træk i 2025?", o: ["Du betaler diskret det hele", "Du foreslår at splitte 50/50", "Du venter på hun betaler", "Du siger 'jeg glemte pungen'"], a: 0, c: "Selvom vi er moderne, elsker Christina en gentleman på første date. Betal diskret – ingen store armbevægelser." },
    { q: "I går en tur bagefter. Hun fryser lidt. Hvad gør du?", o: ["Siger 'løb lidt, så får du varmen'", "Lægger armen om hende", "Tilbyder din jakke", "Ignorerer det"], a: 2, c: "Jakken! Det er den klassiske film-manøvre. Det viser omsorg og offervilje. Armen er for tidligt, løb er for dumt." },
    { q: "Hun spørger: 'Hvad søger du egentlig?' Hvad svarer du?", o: ["Bare noget sjovt", "Jeg leder efter 'The One'", "Jeg tager det som det kommer, men er åben", "En der kan vaske mit tøj"], a: 2, c: "Det perfekte svar. Ikke for desperat, ikke for useriøst. Du er åben, men mystisk." },
    { q: "Date slut. Hvordan siger du farvel?", o: ["Kysser hende på munden", "Giver hånd", "Krammer og siger 'vi ses'", "Går bare"], a: 2, c: "Krammet er sikkert. Et kys kan virke for pågående på første date, medmindre hun læner sig ind. Spil 'hard to get'." }
  ];

  // --- RUNDE 2: DET DYBERE LAG (FØLELSER & KEMI) ---
  const datingQuestions2 = [
    { q: "Date nr. 2: I er hjemme hos dig. Hvad laver du til middag?", o: ["Bestiller pizza", "Laver en 3-retters menu fra bunden", "En lækker, men simpel pasta og god rødvin", "Rugbrødsmadder"], a: 2, c: "Pasta og vin! Det er romantisk, men ikke 'jeg-prøver-for-hårdt' som en 3-retters. Pizza er for dovent." },
    { q: "I sidder i sofaen. Musikken skal sættes på. Hvad vælger du?", o: ["Heavy Metal", "Top 20 Hits", "Noget lækkert Soul/R&B (Frank Ocean/Sade)", "Dansktop"], a: 2, c: "Soul/R&B. Det sætter stemningen uden at larme. Det er 'bukse-smider-musik' på den stilfulde måde." },
    { q: "Hun fortæller om en svær dag på jobbet. Hvad gør du?", o: ["Kommer med løsninger på problemet", "Lytter og hælder mere vin op", "Skifter emne", "Fortæller om din egen dag"], a: 1, c: "LYT! Kvinder vil høres, ikke fixes (lige nu). Vin hjælper også." },
    { q: "Stemningen er god. Du vil gerne rykke tættere på. Hvad er trækket?", o: ["Rykker helt hen med det samme", "Lægger hånden på hendes lår", "Fanger hendes blik og smiler", "Spørger 'må jeg røre dig?'"], a: 2, c: "Øjenkontakten først! Det bygger spændingen op. Hvis hun smiler tilbage, er der grønt lys." },
    { q: "Hun spørger om din eks. Hvad er strategien?", o: ["Sviner eksen til", "Rosser eksen til skyerne", "Svarer kort, respektfuldt og flytter fokus til NU", "Begynder at græde"], a: 2, c: "Kort og respektfuldt. Ingen gider høre drama, men du må heller ikke virke bitter." },
    { q: "Hun driller dig med din musiksmag. Hvordan reagerer du?", o: ["Bliver fornærmet", "Driller hende tilbage (flirtende)", "Skifter musikken", "Undskylder"], a: 1, c: "Banter! Drillerier er forspil for hjernen. Giv igen af samme skuffe." },
    { q: "I taler om drømme. Hun vil gerne rejse. Hvad siger du?", o: ["Det er dyrt", "Jeg elsker også at rejse!", "Hvor vil du hen? Fortæl mig om det.", "Jeg vil hellere blive hjemme"], a: 2, c: "Spørg ind! Vis interesse for hendes indre verden. Det er vejen til hendes hjerte." },
    { q: "Klokken er mange. Hun siger 'Jeg burde nok tage hjem'. Hvad siger du?", o: ["Ja, ses", "Bliv lidt endnu...", "Jeg ringer efter en taxa", "Du kan sove her (i gæsteværelset)"], a: 1, c: "'Bliv lidt endnu...' Det viser, du nyder hendes selskab, men presser ikke på sex." }
  ];

  // --- RUNDE 3: THE END GAME (3RD BASE & INTIMITET) ---
  const datingQuestions3 = [
    { q: "I har kysset. Det går godt. Hvordan eskalerer du til soveværelset?", o: ["Bærer hende derind (Hulemand)", "Spørger 'Vil du se min samling af frimærker?'", "Hvisker 'skal vi gå ind i seng?'", "Tager tøjet af i stuen"], a: 2, c: "Den hviskende invitation er frækkest. Det er intimt og giver hende muligheden for at sige ja (eller nej) elegant." },
    { q: "I sengen: Hvad er vigtigst for Christina (34 år)?", o: ["At du bliver hurtigt færdig", "At du tager styringen men er opmærksom", "At du spørger om lov til alt", "At lyset er slukket"], a: 1, c: "Dominans med empati. Hun vil gerne føres, men du skal læse hendes signaler. Selvtillid er nøglen!" },
    { q: "Efter akten (The Aftermath). Hvad gør du?", o: ["Vender dig om og sover", "Tjekker din telefon", "Holder om hende (Spoon)", "Går ud og ryger"], a: 2, c: "Spoon! Oxytocin-hormonet skal plejes. Nussetid er lige så vigtigt som selve akten for at sikre date nr. 3." },
    { q: "Morgenen efter. Hun vågner hos dig. Hvad er det første move?", o: ["Sex igen med det samme", "Tilbyder kaffe/morgenmad", "Lader som om du sover", "Beder hende smutte"], a: 1, c: "Kaffe! Vejen til en kvindes hjerte om morgenen går gennem koffein og en frisk bolle (fra bageren!)." },
    { q: "Hun har glemt en ørering hos dig. Hvad betyder det?", o: ["Det var en fejl", "Hun markerer sit territorium", "Hun vil se dig igen", "Hun er glemsom"], a: 2, c: "Det er et klassisk 'Leave-behind'. Hun vil have en undskyldning for at komme tilbage. Du er inde!" },
    { q: "Du skal sende en besked senere på dagen. Hvad skriver du?", o: ["Tak for i går", "Hvornår ses vi?", "Jeg kan stadig dufte dig...", "Sender bare en emoji"], a: 2, c: "'Jeg kan stadig dufte dig...' er risky, men hvis I har været i seng, er den MEGA fræk og intim. Det holder gnisten i live." },
    { q: "Christina spørger: 'Hvad er vi to nu?'", o: ["Kærester", "Bollevenner", "Vi dater eksklusivt", "Jeg ved det ikke"], a: 2, c: "'Vi dater eksklusivt'. Det er det voksne stadie før kærester. Det giver tryghed uden at være for pres." },
    { q: "SIDSTE SPØRGSMÅL: Har du vundet Christinas hjerte (og krop)?", o: ["Ja, jeg er en Don Juan!", "Måske", "Nej, jeg failede", "Jeg er mere til mænd"], a: 0, c: "Tillykke, Casanova! Du har gennemført spillet. Nu er det op til dig at holde den kørende i virkeligheden! ❤️🔥" }
  ];

  let activeData = [];
  if (gameState.quiz_mode === 'test') activeData = testQuestions1;
  else if (gameState.quiz_mode === 'test_2') activeData = testQuestions2;
  else if (gameState.quiz_mode === 'test_3') activeData = testQuestions3;
  else if (gameState.quiz_mode === 'real') activeData = datingQuestions1;
  else if (gameState.quiz_mode === 'real_2') activeData = datingQuestions2;
  else if (gameState.quiz_mode === 'real_3') activeData = datingQuestions3;
  else activeData = datingQuestions1;

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

    if (gameState.quiz_mode === currentBase) { nextMode = currentBase + '_2'; promptText = "Klar til RUNDE 2: Følelser & Kemi?"; }
    else if (gameState.quiz_mode === currentBase + '_2') { nextMode = currentBase + '_3'; promptText = "Klar til RUNDE 3: The End Game (3rd Base)?"; }
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
    if (!window.confirm(`Skift til ${newMode === 'real' ? 'DATING (Real)' : 'TEST (Dev)'}?`)) return;
    await supabase.from('quiz_rooms').update({ quiz_mode: newMode, current_question: 0, status: 'lobby' }).eq('room_code', roomCode);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    
    if (room) {
        // Tjek om navnet allerede findes i dette rum
        const { data: existingPlayer } = await supabase.from('players').select('id').eq('room_id', room.id).eq('name', playerName).single();
        
        if (existingPlayer) {
            alert("Navnet er taget! Vælg et andet.");
            return;
        }

        await supabase.from('players').insert([{ name: playerName, score: 0, room_id: room.id, last_q_index: -1 }]);
        setRole('player');
        setView('game');
    } else {
        alert("Kunne ikke finde rummet! Tjek din internetforbindelse.");
    }
  };

  if (view === 'landing') {
    return (
      <MainLayout quizMode={gameState.quiz_mode}>
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-900 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-slate-900 rounded-full p-4 mb-6"><Heart className="text-pink-500" size={64} fill="currentColor" /></div>
          </div>
          <h1 className="text-5xl font-black mb-10 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-lg">
            THE DATING GAME<br/><span className="text-2xl not-italic font-normal text-white">Christina Edition</span>
          </h1>
          <div className="w-full space-y-4">
            <button onClick={() => { setRole('host'); setView('game'); }} className="w-full bg-pink-900/50 text-pink-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-pink-700 hover:bg-pink-800 transition-all"><Monitor size={20} /> Start som Vært</button>
            {/* Added Form wrapper for Enter key support */}
            <form onSubmit={handleJoin} className="flex items-center gap-2 w-full">
               <input type="text" placeholder="Dit navn..." className="flex-grow p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-bold outline-none focus:border-pink-500 transition-colors" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
               <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-pink-900/50 active:scale-95 transition-all"><ChevronRight size={24} /></button>
            </form>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentQ = activeData[gameState.current_question];
  const myData = players.find(p => p.name === playerName);
  const iHaveAnsweredThisSpecificQuestion = myData && myData.last_q_index === gameState.current_question;

  const getRoundTitle = () => {
      if (gameState.quiz_mode.includes('3')) return "3RD BASE 💋";
      if (gameState.quiz_mode.includes('2')) return "DEEP DIVE 🌹";
      return "FIRST DATE 🥂";
  };

  return (
    <MainLayout quizMode={gameState.quiz_mode}>
      <div className="flex justify-between items-center mb-4 bg-purple-900/30 p-4 rounded-2xl backdrop-blur-sm border border-purple-700/50">
        <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{getRoundTitle()}</div>
        <div className="flex items-center gap-3">
          {role === 'host' && <button onClick={fullReset} className="text-pink-400 p-2"><Trash2 size={20} /></button>}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-bold text-sm border border-slate-700"><Users size={14} className="text-pink-400" /> {players.length}</div>
        </div>
      </div>

      {gameState.status === 'lobby' && (
        <div className="flex-grow flex flex-col text-center">
          <h2 className="text-3xl font-black mb-2 text-white">
             {gameState.quiz_mode.includes('3') ? "Klar til Finalen? 💋" : (gameState.quiz_mode.includes('2') ? "Klar til Runde 2? 🌹" : "Velkommen til Datingspillet!")}
          </h2>
          {!gameState.quiz_mode.includes('2') && !gameState.quiz_mode.includes('3') && (
              <div className="bg-slate-800/80 p-4 rounded-xl mb-4 border border-slate-700 text-sm text-slate-300">
                  <strong>Mød Christina (34):</strong><br/>
                  Marketing Manager. Elsker hvidvin, rejser og ærlighed.<br/>
                  Hader nærighed og arrogance.<br/>
                  <em>Mål: Vind hendes hjerte (og kom i bukserne).</em>
              </div>
          )}
          <p className="text-slate-400 mb-4 text-sm">Find jeres pladser...</p>
          {role === 'host' && ( <button onClick={toggleMode} className="mb-8 mx-auto text-xs font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-600 text-slate-400">{gameState.quiz_mode.includes('test') ? "Skift til PROD" : "Skift til TEST"}</button> )}
          <div className="grid grid-cols-2 gap-3 mb-8 overflow-y-auto max-h-[40vh] p-2">
            {players.map((p, i) => (
              <div key={i} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between animate-in zoom-in">
                <span className="font-bold text-pink-200 truncate text-sm">{p.name}</span>
                <span className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"></span>
              </div>
            ))}
          </div>
          {role === 'host' && ( <button onClick={() => updateGameStatus('active')} className="mt-auto w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-pink-900/50 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3"> START <Play fill="currentColor" size={24} /> </button> )}
        </div>
      )}

      {gameState.status === 'active' && currentQ && (
        <div className="flex-grow flex flex-col">
          <div className="text-center mb-4">
            <span className="inline-block bg-purple-900/50 text-pink-300 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-purple-700">Situation {gameState.current_question + 1} / {activeData.length}</span>
            <h2 className="text-xl md:text-3xl font-bold leading-tight text-white drop-shadow-sm mb-2">{currentQ.q}</h2>
          </div>
          <div key={gameState.current_question} className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow content-center">
            {currentQ.o.map((opt, i) => (
              role === 'player' ? (
                <button key={i} disabled={iHaveAnsweredThisSpecificQuestion} onClick={() => submitAnswer(i)} className={`relative p-5 rounded-2xl text-lg font-bold text-left transition-all border-b-4 active:border-b-0 active:translate-y-1 touch-manipulation ${iHaveAnsweredThisSpecificQuestion ? 'bg-slate-800 border-slate-900 text-slate-500' : 'bg-purple-800 border-purple-950 hover:bg-purple-700 text-white active:bg-pink-600'}`}>{opt}</button>
              ) : (
                <div key={i} className="bg-purple-900/40 p-5 rounded-2xl text-lg font-bold text-center border-b-4 border-purple-950 text-purple-100 flex flex-col justify-center items-center"><span>{opt}</span>
                    <div className="mt-2 flex gap-1 flex-wrap justify-center">{players.filter(p => p.last_q_index === gameState.current_question).length > 0 && <span className="text-[10px] text-pink-300 animate-pulse">Svarer...</span>}</div>
                </div>
              )
            ))}
          </div>
          {role === 'host' && <button onClick={() => updateGameStatus('showing_answer', gameState.current_question)} className="mt-6 w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg">SE REAKTION</button>}
          {role === 'player' && iHaveAnsweredThisSpecificQuestion && <div className="mt-4 text-center text-pink-400 font-bold animate-pulse">Venter på Christina... 🤞</div>}
        </div>
      )}

      {gameState.status === 'showing_answer' && currentQ && (
        <div className="flex-grow flex flex-col items-center justify-start text-center overflow-y-auto">
          {(() => {
            const playersWhoAnswered = players.filter(p => p.last_q_index === gameState.current_question);
            const everyoneWrong = playersWhoAnswered.length > 0 && playersWhoAnswered.every(p => p.last_answer !== currentQ.a);
            if (everyoneWrong) return (<div className="w-full bg-rose-600 text-white p-6 rounded-3xl mb-6 animate-bounce shadow-2xl border-4 border-rose-800"><div className="flex justify-center mb-2"><AlertTriangle size={48} className="text-yellow-300" /></div><h2 className="text-3xl font-black uppercase mb-2">TURN-OFF!</h2><p className="text-xl font-bold">Hun gik hjem! Alle drikker!</p></div>);
            return null;
          })()}
          <div className="mb-6 w-full max-w-2xl mx-auto">
             <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-pink-500/30"><Sparkles size={14} /> Det rigtige træk</div>
             <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">{currentQ.o[currentQ.a]}</h2>
             {currentQ.c && (<div className="bg-purple-900/60 p-4 rounded-xl border border-purple-700 text-purple-100 text-sm md:text-base italic leading-relaxed shadow-sm max-w-lg mx-auto">" {currentQ.c} "</div>)}
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
             {currentQ.o.map((opt, i) => {
                const isCorrect = i === currentQ.a;
                const votedHere = players.filter(p => p.last_q_index === gameState.current_question && p.last_answer === i);
                return (
                    <div key={i} className={`p-3 rounded-xl border-2 flex flex-col ${isCorrect ? 'bg-pink-900/40 border-pink-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                        <div className="flex justify-between items-center mb-2"><span className={`font-bold text-sm ${isCorrect ? 'text-pink-300' : 'text-slate-400'}`}>{opt}</span>{isCorrect && <Heart size={16} className="text-pink-500" fill="currentColor" />}</div>
                        <div className="flex flex-wrap gap-1 mt-auto">{votedHere.map((p, idx) => (<span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md font-bold truncate max-w-[100px] ${isCorrect ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{p.name}</span>))}</div>
                    </div>
                )
             })}
          </div>
          {role === 'host' && <button onClick={() => updateGameStatus('active', gameState.current_question + 1)} className="mt-auto w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50">NÆSTE <ChevronRight /></button>}
        </div>
      )}

      {gameState.status === 'finished' && (
        <div className="flex-grow flex flex-col relative">
          <SimpleConfetti />
          <div className="text-center mb-8 relative z-10">
             <Trophy size={64} className="mx-auto text-pink-500 mb-2 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
             <h2 className="text-4xl font-black text-white italic">SCORE-LISTE</h2>
             <div className="text-pink-300 font-bold mt-2 uppercase">{getRoundTitle()} AFSLUTTET</div>
          </div>
          <div className="space-y-3 mb-8 relative z-10">
            {players.map((p, i) => (
              <div key={i} className={`relative flex flex-col p-4 rounded-2xl border-b-4 ${i===0 ? 'bg-pink-600 text-white border-pink-800' : 'bg-slate-800 border-slate-900 text-slate-200'}`}>
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-3"><div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-black ${i===0?'bg-black/20':'bg-slate-900'}`}>{i+1}</div><div className="text-xl font-black truncate">{p.name}</div></div>
                   <div className="text-3xl font-black">{p.score}</div>
                </div>
                <div className={`text-[11px] font-bold uppercase leading-tight ${i===0?'text-pink-200':'text-slate-500'}`}>Forstod Christina {p.correct_count || 0} gange. Charmede sig til {p.total_bonus || 0} bonuspoint.</div>
                {i===0 && <div className="absolute -top-2 -right-1 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">DON JUAN!</div>}
              </div>
            ))}
          </div>
          {role === 'host' && (
            <div className="mt-auto space-y-4 relative z-10">
                {!gameState.quiz_mode.includes('3') && (
                    <button onClick={startMoreQuestions} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl animate-pulse hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">{gameState.quiz_mode.includes('2') ? "GÅ TIL 3. BASE! 💋" : "GÅ DYBERE... 🌹"} <Flame fill="currentColor" /></button>
                )}
                <button onClick={fullReset} className="w-full text-pink-400 text-xs font-bold uppercase flex items-center justify-center gap-2 py-4"><RefreshCcw size={14} /> Genstart Datingen</button>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default QuizApp;
