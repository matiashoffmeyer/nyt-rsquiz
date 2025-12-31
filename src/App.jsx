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

  // --- DATA: RUNDE 1 (HELT NYE 2025 FACTS - ORDSPILS EDITION) ---
  const realQuestions1 = [
    // 1. KONGEHUSET
    { q: "Hvilken stor dag fejrede Kongehuset d. 21. april 2025?", o: ["Marys jubilæum", "Prinsesse Isabellas 18 års fødselsdag", "Frederiks tron-dag", "Margrethes flytning"], a: 1, c: "Isabella blev myndig! Nu må hun køre bil og købe shots. Mon ikke Frederik gav en omgang? Det var i hvert fald en **prinsesse-fin** fest." },
    
    // 2. SPORT (CYKLING)
    { q: "Hvor blev VM i Landevejscykling afholdt i september 2025 (Historisk!)?", o: ["Frankrig", "Rwanda (Afrika)", "Kina", "USA"], a: 1, c: "For første gang i Afrika! Det kørte på skinner... eller dæk. Det var en historisk **kæde-reaktion**, og Rwanda viste sig som en **bjergtagende** vært." },
    
    // 3. FILM
    { q: "Hvilken længe ventet James Cameron-film fik premiere i december 2025?", o: ["Titanic 2", "Avatar 3: Fire and Ash", "Terminator 7", "Alien: Romulus"], a: 1, c: "Vi ventede i 100 år, men den kom! Det var en **blå** stempling af biografen. Cameron har virkelig **dykket** dybt i effekterne denne gang." },
    
    // 4. BEGIVENHED (JAPAN)
    { q: "Hvilken kæmpe verdensbegivenhed åbnede i Osaka, Japan i april 2025?", o: ["OL", "Verdensudstillingen (Expo 2025)", "VM i Fodbold", "PlayStation Festival"], a: 1, c: "Expo 2025! Hele verden var samlet. Det var en **udstillet** succes. Hvis man var der, fik man nok **sushi** på opleveren." },
    
    // 5. POLITIK (TYSKLAND)
    { q: "Hvad skulle vores naboer i Tyskland til i september 2025?", o: ["Oktoberfest (tidligt)", "Forbundsdagsvalg", "Fodbold EM", "Klimatopmøde"], a: 1, c: "Scholz var presset. Det var en rigtig **pølse-snak** i Berlin. Valget var ikke nogen **bratwurst**-overraskelse, men det ændrede balancen i Europa." },
    
    // 6. TOG (DANMARK)
    { q: "Hvilke nye togsæt begyndte DSB endelig at testkøre med passagerer i 2025?", o: ["IC4 (igen)", "IC5 (Coradia Stream)", "Damplokomotiver", "Hyperloop"], a: 1, c: "IC5 er fremtiden! Vi håber ikke, de kører af **sporet** tidsmæssigt som de gamle. Det er på **høje tid**, vi fik strøm på skinnerne." },
    
    // 7. RUMMET
    { q: "Hvilken mission sendte NASA afsted i september 2025 med fire astronauter?", o: ["Artemis II (Rundt om månen)", "Mars One", "ISS Nedrivning", "Star Wars"], a: 0, c: "De fløj rundt om månen og hjem igen. Det var en **stjerne-god** præstation. Der var ingen, der var lunatic - det var ren videnskab." },
    
    // 8. REJSE (ROM)
    { q: "Hvorfor var der ekstra mange turister i Rom i hele 2025?", o: ["Gratis pizza", "Paven holdt 'Jubelår' (Holy Year)", "Colosseum genåbnede", "Varmen var væk"], a: 1, c: "Det katolske Jubelår! Paven åbnede Den Hellige Dør. Det var en **velsignet** god forretning for hotellerne, men en **synd** for trængslen." },
    
    // 9. FILM (SPIL)
    { q: "Hvilken film med Jack Black baseret på et spil udkom i april 2025?", o: ["A Minecraft Movie", "Roblox: The Movie", "Sims", "Tetris 2"], a: 0, c: "Minecraft-filmen. Det så lidt **firkantet** ud med rigtige mennesker. Anmelderne syntes måske, plottet var lidt **blok-eret**." },
    
    // 10. SOCIALE MEDIER
    { q: "Hvilken app stod til at blive forbudt i USA i januar 2025, hvis den ikke blev solgt?", o: ["TikTok", "Instagram", "Temu", "Snapchat"], a: 0, c: "TikTok var i modvind. Amerikanerne mente, det var en **kina-krig** om data. Det var lige før, tiden **løb ud** for dansevideoerne." },
    
    // 11. SPORT (FORMEL 1)
    { q: "Hvilket team kørte Kevin Magnussen IKKE for i 2025 (fordi han stoppede der)?", o: ["Ferrari", "Haas", "McLaren", "Red Bull"], a: 1, c: "Han og Haas sagde farvel efter '24. Det var en **bremseklods** for karrieren, men han gav den gas så længe det varede. En **d
