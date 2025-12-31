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
    const colors = ['#FF0000', '#FF00ea', '#800080', '#000000', '#FFC700']; 
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
  <div className={`min-h-[100dvh] text-slate-100 font-sans transition-colors duration-500 flex flex-col ${quizMode.includes('test') ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#1a0505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/40 via-slate-950 to-black'}`}>
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

  // --- DATA: RUNDE 1 (FAKTA: STATISTIK & REKORDER) ---
  const realQuestions1 = [
    { q: "Hvad er gennemsnitsvarigheden for selve samlejet (penetration til udløsning) ifølge studier?", o: ["3-7 minutter", "15-20 minutter", "30-40 minutter", "Over en time"], a: 0, c: "Mellem 3 og 7 minutter. Pornofilm lyver! Hvis han holder i 40 minutter, tænker han på Excel-ark." },
    { q: "Hvilken måned på året bliver der undfanget flest børn i Danmark (født 9 mdr senere)?", o: ["December (Julefrokost)", "Juli (Sommerferie)", "Februar (Vinter)", "Oktober (Efterår)"], a: 0, c: "December! Julefrokoster og kulde får folk til at rykke sammen. September er den største fødselsmåned." },
    { q: "Hvor mange procent af kvinder får orgasme udelukkende ved penetration (uden klitoris-stimulering)?", o: ["Ca. 18%", "Ca. 50%", "Ca. 75%", "Næsten alle"], a: 0, c: "Kun ca. 18%. Så gutter: Hvis I glemmer 'knappen', glemmer I succesen. Det er ren biologi." },
    { q: "Hvad er verdensrekorden for flest orgasmer på en time (for en kvinde)?", o: ["16", "52", "134", "220"], a: 2, c: "134! Det blev målt i et laboratorie-studie i 60'erne. Mandens rekord i samme studie? 16. Kvinder vinder." },
    { q: "Hvilken aldersgruppe er ifølge Sundhedsstyrelsen dårligst til at bruge kondom?", o: ["15-19 år", "20-29 år", "30-39 år", "50+ år"], a: 3, c: "Folk over 50! De er 'generation fri sex', og graviditet er ikke en risiko, så de glemmer sygdommene. Gummi er for alle!" },
    { q: "Hvad er den hyppigste seksuelle fantasi på tværs af køn ifølge store surveys?", o: ["Gruppe-sex", "BDSM", "Sex et offentligt sted", "Sex med en kendt"], a: 0, c: "Gruppe-sex (trekant eller flere). Mange tænker på det, færre gør det. Det er logistikken, der dræber drømmen." },
    { q: "Hvor meget sæd producerer en gennemsnitlig mand i løbet af sit liv?", o: ["1 liter", "14 liter", "50 liter", "En swimmingpool"], a: 1, c: "Ca. 14 liter. Det svarer til omkring 28 store fadøl... hvis man altså ser sådan på det." },
    { q: "Hvad er gennemsnitslængden på en erigeret penis på verdensplan?", o: ["10-12 cm", "13-14 cm", "16-18 cm", "20+ cm"], a: 1, c: "13,12 cm for at være præcis. Alt over 15 cm er teknisk set 'over gennemsnittet'. Størrelsen på egoet tæller ikke med." },
    { q: "Hvor mange kalorier forbrænder man gennemsnitligt ved en halv times sex?", o: ["50 kcal", "100 kcal", "300 kcal", "500 kcal"], a: 1, c: "Ca. 85-100 kcal. Det svarer til et æble eller et glas vin. Det erstatter desværre ikke fitness-abonnementet." },
    { q: "Hvilket land i verden har ifølge Durex-undersøgelser sex oftest?", o: ["Frankrig", "Brasilien", "Grækenland", "USA"], a: 2, c: "Grækerne! De topper listen med 164 gange om året. Danskere ligger og roder nede omkring 100-120." }
  ];

  // --- DATA: RUNDE 2 (VIDEN: SYGDOMME & BIOLOGI) ---
  const realQuestions2 = [
    { q: "Hvad er den mest udbredte kønssygdom i Danmark?", o: ["Klamydia", "Gonorré", "Syfilis", "Herpes"], a: 0, c: "Klamydia. Over 30.000 tilfælde om året. Det er 'folkesygdommen' i underlivet. Husk nu at tisse i koppen!" },
    { q: "Hvor stor en del af klitoris er synlig udefra?", o: ["Det hele", "50%", "Ca. 10%", "Ingen ved det"], a: 2, c: "Kun 'isbjergets top' (ca. 10%). Resten (crura og bulbi) ligger inde i kroppen og er ca. 9-11 cm stort. Det er et helt orgel!" },
    { q: "Hvad er 'Blue Balls' (medicinsk set)?", o: ["En myte", "Blodophobning i testiklerne", "Betændelse", "Koldbrand"], a: 1, c: "Det er epididymal hypertension. Blodet løber til, men ikke fra, hvis man ikke får udløsning. Det gør ondt, men man dør ikke." },
    { q: "Hvilken kønssygdom kaldes 'Den franske syge'?", o: ["Gonorré", "Syfilis", "Herpes", "Fnat"], a: 1, c: "Syfilis. Franskmændene kaldte den 'Den italienske syge'. Ingen ville tage æren for den." },
    { q: "Hvad sker der med vagina, når en kvinde bliver opstemt?", o: ["Den bliver kortere", "Den udvider sig og bliver længere", "Den lukker sig", "Intet"], a: 1, c: "Den udvider sig (telt-effekt) og bliver dybere. Naturen gør plads til festen." },
    { q: "Hvor lang tid lever sædceller typisk inde i kvindens krop?", o: ["1 time", "24 timer", "Op til 5 dage", "2 uger"], a: 2, c: "Op til 5 dage! Så sex lørdag kan blive til en baby onsdag. De er nogle små, stædige svømmere." },
    { q: "Hvad er 'Phimosis'?", o: ["Forhudsforsnevring", "Skæv penis", "Mangel på lyst", "En sexstilling"], a: 0, c: "Når forhuden er for stram og ikke kan trækkes tilbage. Det kan gøre ondt, men kan heldigvis fikses." },
    { q: "Kan mænd få brystkræft?", o: ["Ja", "Nej", "Kun hvis de tager hormoner", "Kun over 80 år"], a: 0, c: "Ja. Mænd har også brystvæv. Det er sjældent, men det sker. Så mærk efter, gutter!" },
    { q: "Hvad er symptomerne på klamydia hos mænd?", o: ["Altid svie", "Altid udflåd", "Ofte ingen symptomer", "Røde pletter"], a: 2, c: "Ofte ingen! Det er det farlige. Man kan være smittebærer uden at ane det. 'Det svier ikke' er ingen garanti." },
    { q: "Hvad er det gennemsnitlige volumen af en udløsning?", o: ["En teske (3-5 ml)", "En spiseske (15 ml)", "Et snapseglas (20 ml)", "En halv kop"], a: 0, c: "Kun ca. en teskefuld (3-5 ml). I pornofilm snyder de ofte med 'fake cum' for effekten." }
  ];

  // --- DATA: RUNDE 3 (HISTORIE & MYTER) ---
  const realQuestions3 = [
    { q: "Hvad blev vibratoren oprindeligt opfundet til i 1800-tallet?", o: ["At røre kagedej", "At kurere 'hysteri' hos kvinder", "Som rygmassage", "Til mænds prostata"], a: 1, c: "Læger brugte den til at give kvinder 'paroxysmer' (orgasmer) for at kurere hysteri. Det var en medicinsk behandling!" },
    { q: "Hvilken fødevare troede man i 1700-tallet var et farligt afrodisiakum?", o: ["Kartoflen", "Tomaten", "Agurken", "Chokoladen"], a: 0, c: "Kartoflen! Man mente, den gav lystige tanker og spedalskhed. I dag er det bare pomfritter." },
    { q: "Hvad betyder ordet 'pornografi' oprindeligt på græsk?", o: ["Krops-billeder", "Skøge-skrift (Skriveri om prostituerede)", "Nøgen-kunst", "Lyst-lære"], a: 1, c: "'Porne' betyder skøge/prostitueret og 'graphein' betyder at skrive. Altså 'beskrivelse af prostituerede'." },
    { q: "Hvilket dyr har det største lem i forhold til sin kropsstørrelse?", o: ["Hesten", "Elefanten", "Ruren (Et lille krebsdyr)", "Blåhvalen"], a: 2, c: "Ruren! Dens penis kan blive 8 gange så lang som dens krop. Den sidder fast på en sten og skal nå naboen." },
    { q: "Hvad var Casanovas foretrukne prævention?", o: ["Fåretarme", "En halv citron", "At trække sig ud", "Bønner"], a: 1, c: "En halv citron sat op som et pessar (livmoderhalskappe). Syren dræbte sæden... men av, det må have svedet!" },
    { q: "Hvad er 'Priapisme'?", o: ["Lyst til fødder", "En erektion der varer mere end 4 timer", "Mangel på testikler", "Angst for sex"], a: 1, c: "En smertefuld, langvarig erektion der ikke går væk. Det er en medicinsk nødsituation (og ikke sjovt)." },
    { q: "Hvilket land legaliserede som det første i verden pornografi (i 1969)?", o: ["USA", "Sverige", "Holland", "Danmark"], a: 3, c: "Danmark! Vi frigav billedpornoen i 1969. Hele verdenspressen kom til København for at se 'syndens hule'." },
    { q: "Hvad er 'Kegel-øvelser' godt for?", o: ["Større bryster", "Stærkere bækkenbund (bedre sex)", "Længere penis", "Bedre ånde"], a: 1, c: "At stramme op 'down under'. Det giver bedre kontrol, stærkere orgasmer og hjælper mod inkontinens." },
    { q: "Myte eller fakta: Stopper mænds penisvækst helt efter puberteten?", o: ["Fakta (den vokser ikke mere)", "Myte (den vokser hele livet)", "Den krymper med alderen", "Den vokser kun ved træning"], a: 0, c: "Fakta. Når puberteten slutter, er festen forbi vækstmæssigt. Til gengæld kan den *virke* mindre, hvis man tager på i vægt." },
    { q: "SIDSTE SPØRGSMÅL: Hvad er det latinske ord for 'samleje'?", o: ["Coitus", "Fellatio", "Cunnilingus", "Intercourse"], a: 0, c: "Coitus. Det lyder meget formelt, men det er det, vi alle er herre/dame gode til (eller øver os på). Godt nytår!" }
  ];

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
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-900 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-slate-900 rounded-full p-4 mb-6"><Zap className="text-red-500" size={64} fill="currentColor" /></div>
          </div>
          <h1 className="text-6xl font-black mb-10 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 drop-shadow-lg">H. Schneekloths<br/>NYTÅRS<br/>XXX<br/>2025</h1>
          <div className="w-full space-y-4">
            <button onClick={() => { setRole('host'); setView('game'); }} className="w-full bg-slate-800/50 text-red-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 transition-all"><Monitor size={20} /> Start som Vært</button>
            <div className="flex items-center gap-2">
               <input type="text" placeholder="Dit navn..." className="flex-grow p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-bold outline-none focus:border-red-500 transition-colors" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
               <button onClick={handleJoin} className="bg-gradient-to-r from-red-600 to-purple-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-red-900/50 active:scale-95 transition-all"><ChevronRight size={24} /></button>
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
      if (gameState.quiz_mode.includes('3')) return "RUNDE 3 🍑";
      if (gameState.quiz_mode.includes('2')) return "RUNDE 2 🍆";
      return "QUIZ XXX";
  };

  return (
    <MainLayout quizMode={gameState.quiz_mode}>
      <div className="flex justify-between items-center mb-4 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
        <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400">{getRoundTitle()}</div>
        <div className="flex items-center gap-3">
          {role === 'host' && <button onClick={fullReset} className="text-red-400 p-2"><Trash2 size={20} /></button>}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-bold text-sm border border-slate-700"><Users size={14} className="text-red-400" /> {players.length}</div>
        </div>
      </div>

      {gameState.status === 'lobby' && (
        <div className="flex-grow flex flex-col text-center">
          <h2 className="text-4xl font-black mb-2 text-white">{gameState.quiz_mode.includes('3') ? "Klar til FINALEN? 🍑" : (gameState.quiz_mode.includes('2') ? "Klar til Runde 2? 🍆" : "Lobbyen er åben! 😈")}</h2>
          <p className="text-slate-400 mb-8 text-sm">Find jeres pladser...</p>
          {role === 'host' && ( <button onClick={toggleMode} className="mb-8 mx-auto text-xs font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-600 text-slate-400">{gameState.quiz_mode.includes('test') ? "Skift til PROD" : "Skift til TEST"}</button> )}
          <div className="grid grid-cols-2 gap-3 mb-8 overflow-y-auto max-h-[50vh] p-2">
            {players.map((p, i) => (
              <div key={i} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between animate-in zoom-in">
                <span className="font-bold text-slate-200 truncate text-sm">{p.name}</span>
                <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              </div>
            ))}
          </div>
          {role === 'host' && ( <button onClick={() => updateGameStatus('active')} className="mt-auto w-full bg-gradient-to-r from-red-600 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-red-900/50 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3"> START <Play fill="currentColor" size={24} /> </button> )}
        </div>
      )}

      {gameState.status === 'active' && currentQ && (
        <div className="flex-grow flex flex-col">
          <div className="text-center mb-4">
            <span className="inline-block bg-slate-800 text-red-300 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-slate-700">Spørgsmål {gameState.current_question + 1} / {activeData.length}</span>
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-white drop-shadow-sm">{currentQ.q}</h2>
          </div>
          <div key={gameState.current_question} className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow content-center">
            {currentQ.o.map((opt, i) => (
              role === 'player' ? (
                <button key={i} disabled={iHaveAnsweredThisSpecificQuestion} onClick={() => submitAnswer(i)} className={`relative p-6 rounded-2xl text-xl font-bold text-left transition-all border-b-4 active:border-b-0 active:translate-y-1 touch-manipulation ${iHaveAnsweredThisSpecificQuestion ? 'bg-slate-800 border-slate-900 text-slate-500' : 'bg-slate-700 border-slate-900 hover:bg-slate-600 text-white active:bg-red-600'}`}>{opt}</button>
              ) : (
                <div key={i} className="bg-slate-800 p-6 rounded-2xl text-xl font-bold text-center border-b-4 border-slate-900 text-slate-300 flex flex-col justify-center items-center"><span>{opt}</span>
                    <div className="mt-2 flex gap-1 flex-wrap justify-center">{players.filter(p => p.last_q_index === gameState.current_question).length > 0 && <span className="text-[10px] text-slate-500 animate-pulse">Venter på svar...</span>}</div>
                </div>
              )
            ))}
          </div>
          {role === 'host' && <button onClick={() => updateGameStatus('showing_answer', gameState.current_question)} className="mt-6 w-full bg-amber-500 text-black py-4 rounded-2xl font-black text-xl shadow-lg">SE SVAR</button>}
          {role === 'player' && iHaveAnsweredThisSpecificQuestion && <div className="mt-4 text-center text-red-400 font-bold animate-pulse">Svar modtaget... 🤞</div>}
        </div>
      )}

      {gameState.status === 'showing_answer' && currentQ && (
        <div className="flex-grow flex flex-col items-center justify-start text-center overflow-y-auto">
          {(() => {
            const playersWhoAnswered = players.filter(p => p.last_q_index === gameState.current_question);
            const everyoneWrong = playersWhoAnswered.length > 0 && playersWhoAnswered.every(p => p.last_answer !== currentQ.a);
            if (everyoneWrong) return (<div className="w-full bg-rose-600 text-white p-6 rounded-3xl mb-6 animate-bounce shadow-2xl border-4 border-rose-800"><div className="flex justify-center mb-2"><AlertTriangle size={48} className="text-yellow-300" /></div><h2 className="text-3xl font-black uppercase mb-2">STRAF!</h2><p className="text-xl font-bold">Alle drikker! Bund eller strip!</p></div>);
            return null;
          })()}
          <div className="mb-6 w-full max-w-2xl mx-auto">
             <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-red-500/20"><CheckCircle2 size={14} /> Det "rigtige" svar</div>
             <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{currentQ.o[currentQ.a]}</h2>
             {currentQ.c && (<div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-slate-300 text-sm md:text-base italic leading-relaxed shadow-sm max-w-lg mx-auto">" {currentQ.c} "</div>)}
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
             {currentQ.o.map((opt, i) => {
                const isCorrect = i === currentQ.a;
                const votedHere = players.filter(p => p.last_q_index === gameState.current_question && p.last_answer === i);
                return (
                    <div key={i} className={`p-3 rounded-xl border-2 flex flex-col ${isCorrect ? 'bg-red-900/30 border-red-500/50' : 'bg-slate-800/50 border-slate-800'}`}>
                        <div className="flex justify-between items-center mb-2"><span className={`font-bold text-sm ${isCorrect ? 'text-red-400' : 'text-slate-400'}`}>{opt}</span>{isCorrect && <CheckCircle2 size={16} className="text-red-500" />}</div>
                        <div className="flex flex-wrap gap-1 mt-auto">{votedHere.map((p, idx) => (<span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md font-bold truncate max-w-[100px] ${isCorrect ? 'bg-red-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{p.name}</span>))}</div>
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
                {i===0 && <div className="absolute -top-2 -right-1 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">SEXGUD!</div>}
              </div>
            ))}
          </div>
          {role === 'host' && (
            <div className="mt-auto space-y-4 relative z-10">
                {!gameState.quiz_mode.includes('3') && (
                    <button onClick={startMoreQuestions} className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl animate-pulse hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">{gameState.quiz_mode.includes('2') ? "FINALEN 🍑" : "MERE SEX 🔥"} <Flame fill="currentColor" /></button>
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
