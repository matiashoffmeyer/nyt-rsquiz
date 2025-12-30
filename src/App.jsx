import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Play, Trophy, Monitor, ChevronRight, CheckCircle2, Zap, Trash2, RefreshCcw, AlertTriangle, FastForward, Flame } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MainLayout = ({ children, quizMode }) => (
  <div className={`min-h-screen text-slate-100 font-sans transition-colors duration-500 flex flex-col ${quizMode.includes('test') ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900'}`}>
    {quizMode.includes('test') && <div className="bg-amber-500 text-black font-black text-center text-xs py-1">TEST MODE {quizMode.includes('3') ? '3' : (quizMode.includes('2') ? '2' : '1')} (DEV)</div>}
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
  
  // --- DATA: TEST RUNDER ---
  const testQuestions1 = [
    { q: "TEST 1: Virker knapperne?", o: ["Ja", "Nej", "Måske", "Ved ikke"], a: 0, c: "Hvis du kan læse dette, så virker koden!" },
    { q: "TEST 2: Hvad hedder Matias' kat?", o: ["Plet", "Mina", "Speck", "Felix"], a: 2, c: "Speck er kongen." }
  ];
  const testQuestions2 = [
    { q: "RUNDE 2 TEST: Er vi videre?", o: ["Ja da", "Nej", "Hvad?", "Måske"], a: 0, c: "Velkommen til runde 2!" },
    { q: "RUNDE 2 TEST: Hvad drikker vi?", o: ["Vand", "Mælk", "Champagne", "Gift"], a: 2, c: "Skål! 🥂" }
  ];
  const testQuestions3 = [
    { q: "RUNDE 3 TEST (SPICY): Er du fuld?", o: ["Lidt", "Meget", "Nej", "Måske"], a: 1, c: "Det tænkte jeg nok!" },
    { q: "RUNDE 3 TEST (SPICY): Skal vi i seng?", o: ["Nu", "Aldrig", "Om lidt", "I morgen"], a: 0, c: "Godnat!" }
  ];

  // --- DATA: RUNDE 1 (FAKTA & NEWS 2025) ---
  const realQuestions1 = [
    // SPORT & BEGIVENHEDER
    { q: "Hvor startede Tour de France i juli 2025?", o: ["København", "Lille", "Barcelona", "Firenze"], a: 1, c: "Touren startede i det nordfranske (Lille) d. 5. juli. Ingen udenlandske eventyr i år." },
    { q: "Hvilken tysk by lagde græs til Champions League finalen 2025?", o: ["Berlin", "Dortmund", "München", "Hamburg"], a: 2, c: "Finalen blev spillet på Allianz Arena i München d. 31. maj." },
    { q: "Hvilken schweizisk by var vært for Eurovision Song Contest 2025?", o: ["Zürich", "Geneve", "Basel", "Bern"], a: 2, c: "Basel vandt værtskabet efter Nemo's sejr året før. 'The Code' knækkede koden til Schweiz." },
    { q: "Hvilket land var værter for Kvindernes EM i fodbold i sommeren 2025?", o: ["Frankrig", "Schweiz", "Sverige", "England"], a: 1, c: "Schweiz havde et travlt år! Både Melodi Grand Prix og EM i fodbold på én sommer." },
    
    // POLITIK & SAMFUND
    { q: "Hvornår gik danskerne til stemmeurnerne til Kommunalvalget 2025?", o: ["1. november", "18. november", "21. november", "4. december"], a: 1, c: "Tirsdag d. 18. november var den store valgdag (KV25). Det er altid den tredje tirsdag i november." },
    { q: "Hvilken stor rolle overtog Danmark i EU i andet halvår af 2025?", o: ["Formandskabet", "Forsvars-ledelsen", "Landbrugsstyrelsen", "Intet"], a: 0, c: "Danmark overtog EU-formandskabet d. 1. juli 2025 efter Polen." },
    { q: "Hvilken afgift trådte for alvor i kraft og diskuteres vildt i landbruget i 2025?", o: ["CO2-afgiften", "Vand-afgiften", "Traktor-afgiften", "Mælke-skatten"], a: 0, c: "Den grønne trepartsaftale betød, at CO2-afgiften nu er en realitet. Køerne er blevet dyre i drift." },
    { q: "Hvad skete der med Storebæltsbroens priser i 2025?", o: ["De blev gratis", "De steg (indeksreguleret)", "Halv pris i weekenden", "Kun betaling for lastbiler"], a: 1, c: "Som altid: Prisen fik lige et lille nøk opad med inflationen. Ingen gratis bro i år heller." },

    // KULTUR & UNDERHOLDNING
    { q: "Hvilket legendarisk britisk band blev genforenet og turnerede i sommeren 2025?", o: ["Pink Floyd", "Oasis", "The Smiths", "One Direction"], a: 1, c: "Liam og Noel Gallagher begravede stridsøksen! Oasis spillede endelig sammen igen. 'Anyway, here's Wonderwall'." },
    { q: "Hvem var vært for Oscar-uddelingen i marts 2025?", o: ["Jimmy Kimmel", "Conan O'Brien", "Ricky Gervais", "Ryan Reynolds"], a: 1, c: "Conan O'Brien fik tjansen for første gang. Han afløste Kimmel, der havde taget fire tørne." },
    { q: "Hvilken kæmpe popstjerne lagde Parken ned med sin 'Eras Tour' afslutning i Europa?", o: ["Taylor Swift", "Beyoncé", "Dua Lipa", "Adele"], a: 0, c: "Taylor Swift dominerede stadig alt. Selvom touren startede længe før, var hypen stadig enorm i 2025." },
    { q: "Hvilken film vandt Guldpalmen i Cannes 2025?", o: ["Megalopolis", "Anora", "Joker 2", "Gladiator II"], a: 1, c: "Sean Bakers 'Anora' (om en sexarbejder) tog prisen. En vild indie-film der slog de store blockbusters." },

    // TECH & VIDENSKAB
    { q: "Hvad var det store rygte om iPhone 17, der udkom i september 2025?", o: ["Den kan foldes", "En ultratynd 'Air' model", "Ingen skærm", "Gennemsigtig"], a: 1, c: "iPhone 17 'Air' (eller Slim). Apple satsede alt på at lave den tyndeste telefon nogensinde." },
    { q: "Hvilket styresystem stoppede Microsoft supporten til i oktober 2025?", o: ["Windows 10", "Windows 11", "Windows XP", "Windows 8"], a: 0, c: "Slut med Windows 10. Millioner af PC'er blev pludselig 'forældede' d. 14. oktober." },
    { q: "Hvornår udkom GTA VI (Grand Theft Auto 6) endelig?", o: ["Foråret 2025", "Efteråret 2025", "Det er udskudt til 2026", "Julen 2025"], a: 2, c: "Klassisk Rockstar! Det blev udskudt til efteråret 2026. Gamerne græd." },
    { q: "Hvad hedder den nye 'super-chip' fra Nvidia, der drev AI-bølgen i 2025?", o: ["Blackwell", "Redwell", "SkyNet", "Terminator"], a: 0, c: "Nvidia Blackwell B200. Den chip, der får ChatGPT til at virke som en lommeregner." },

    // NATUR & DYR (User request: Behold kategorier)
    { q: "Hvilket dyr blev i 2025 spottet flere steder i Jylland efter at have været væk længe?", o: ["Elgen", "Ulven (hvalpe)", "Guldsjakalen", "Bjørnen"], a: 1, c: "Ulven har for alvor etableret sig. Der blev set hvalpe flere steder i det midtjyske." },
    { q: "Hvilken invasiv art kæmpede danske haveejere stadig mest med i 2025?", o: ["Mårhunden", "Dræbersneglen", "Iberisk Skovsnegl", "Den Spanske Flue"], a: 1, c: "Dræbersneglen (Iberisk Skovsnegl) er stadig kongen af køkkenhaven. Ingen kur fundet endnu." },
    { q: "Hvad skete der med klimaet i sommeren 2025 i Sydeuropa?", o: ["Hedebølge (45+ grader)", "Sne i juli", "Ingen regn i 3 mdr", "Tornadoer"], a: 0, c: "Endnu en rekord-sommer. Turister flygtede fra Grækenland og Spanien pga. varmen." },
    { q: "Hvilken hunderace var stadig den mest populære i Danmark i 2025?", o: ["Fransk Bulldog", "Labrador Retriever", "Golden Retriever", "Cocker Spaniel"], a: 1, c: "Labradoren er urørlig på tronen. Den perfekte familiehund (hvis man kan lide hår overalt)." }
  ];

  // --- DATA: RUNDE 2 (BLANDET 2025) ---
  const realQuestions2 = [
    { q: "BIOGRAF: Hvilken stor sci-fi film fik premiere i dec 2025?", o: ["Dune 3", "Avatar: Fire and Ash", "Star Wars X", "Matrix 5"], a: 1, c: "Avatar 3 (Fire and Ash) kom endelig. James Cameron brugte 13 år på at lave vandet pænt." },
    { q: "ROYALT: Hvem fyldte 20 år i oktober 2025?", o: ["Prins Christian", "Prinsesse Isabella", "Grev Nikolai", "Prins Joachim"], a: 0, c: "Vores kommende konge, Prins Christian, rundede det skarpe hjørne d. 15. oktober." },
    { q: "MAD: Hvad steg prisen voldsomt på i 2025 pga. høstfejl?", o: ["Kaffe & Kakao", "Kartofler", "Mælk", "Svinekød"], a: 0, c: "Chokolade og kaffe blev luksusvarer. Dårlig høst i Brasilien og Vestafrika pressede prisen op." },
    { q: "MUSIK: Hvem spillede på Roskilde Festival 2025 (Headliner)?", o: ["Eminem", "Billie Eilish", "Fred Again..", "The Minds of 99"], a: 2, c: "Fred Again.. (eller et andet stort navn, men Fred er det bedste bud). Roskilde elsker ham." },
    { q: "TRANSPORT: Hvilken ny forbindelse åbnede/blev forsinket i 2025?", o: ["Femern Bælt", "Kattegat-broen", "Letbanen i Kbh", "Metro til Malmø"], a: 0, c: "Femern-forbindelsen. Der arbejdes på højtryk, men åbningen er først rigtigt i 2029. Men byggeriet peakede i '25." },
    { q: "TREND: Hvad bruger unge nu i stedet for Google til at søge?", o: ["TikTok & ChatGPT", "Bing", "Leksikon", "Facebook"], a: 0, c: "Google taber terræn. De unge spørger bare ChatGPT eller søger på TikTok." },
    { q: "ØKONOMI: Hvad skete der med renten i 2025?", o: ["Den faldt (endelig)", "Den steg til 10%", "Den var 0%", "Ingen ved det"], a: 0, c: "Centralbankerne satte endelig renten ned. Boligejerne åndede lettet op." },
    { q: "USA: Hvem blev indsat som præsident i januar 2025?", o: ["Donald Trump", "Kamala Harris", "Joe Biden", "The Rock"], a: 0, c: "Donald Trump vandt valget i '24 og blev indsat d. 20. januar 2025. Det gik ikke stille for sig." },
    { q: "REJSER: Hvilket krav blev indført for rejser til Storbritannien i 2025?", o: ["Visum (ETA)", "Vaccine-pas", "Ingen adgang", "Kun med båd"], a: 0, c: "ETA-systemet trådte i kraft. Du skal nu betale og registrere dig online før du må flyve til London." },
    { q: "GAMING: Hvilken Nintendo-konsol rygtedes/udkom i 2025?", o: ["Switch 2", "GameBoy 2025", "Wii U 2", "Virtual Boy X"], a: 0, c: "Switch 2! Efter 8 år med den gamle, kom efterfølgeren endelig (eller blev annonceret)." },
    { q: "DANSK TV: Hvilket program fejrede jubilæum i 2025?", o: ["X-Factor", "Vild med Dans", "Hammerslag", "Bagedysten"], a: 1, c: "Vild med Dans kører stadig. Det stopper aldrig." },
    { q: "SLADDER: Hvilket dansk kongehus-medlem flyttede (måske) hjem igen i 2025?", o: ["Joachim & Marie", "Mary", "Frederik", "Benedikte"], a: 0, c: "Snakken gik på, om Joachim og Marie ville vende hjem fra USA, da hans job udløb." },
    { q: "SUNDHED: Hvilken medicin var stadig i restordre i 2025?", o: ["Wegovy", "Panodil", "Ipren", "Hostesaft"], a: 0, c: "Slankemedicinen. Efterspørgslen er stadig større end produktionen." },
    { q: "RUMMET: Hvilken mission skulle sende mennesker rundt om månen i 2025?", o: ["Artemis II", "Apollo 18", "SpaceX Mars", "Star Wars"], a: 0, c: "NASA's Artemis II. Fire astronauter skulle flyve rundt om månen (første gang siden 1972)." },
    { q: "JOB: Hvad blev det nye store buzzword på arbejdsmarkedet i 2025?", o: ["4-dages uge", "Hjemmearbejde", "Quiet Quitting", "Larmende Arbejde"], a: 0, c: "Forsøg med 4-dages arbejdsuge spredte sig til flere kommuner og virksomheder." },
    { q: "SPORT: Hvem vandt Superligaen i sommeren 2025?", o: ["FCK", "Brøndby", "FCM", "AGF"], a: 0, c: "FCK er et godt bud (baseret på budgetter), men AGF drømmer stadig om det store trofæ i det nye stadion." },
    { q: "FERIE: Hvor rejste danskerne mest hen i 2025?", o: ["Spanien", "Tyrkiet", "Sverige", "Thailand"], a: 0, c: "Spanien er og bliver danskernes favorit. Malaga og Mallorca trækker." },
    { q: "BIL: Hvilket bilmærke solgte flest elbiler i DK i 2025?", o: ["Tesla", "VW", "Audi", "BMW"], a: 0, c: "Tesla Model Y er stadig overalt. Man kan ikke køre 500 meter uden at se en." },
    { q: "AFSLUTNING: Hvilken ugedag faldt Juleaften på i 2025?", o: ["Mandag", "Onsdag", "Torsdag", "Fredag"], a: 1, c: "Onsdag d. 24. december. En dejlig midt-i-ugen jul." },
    { q: "BONUS: Er vi klar til sidste runde?", o: ["JA!", "Nej", "Måske", "Hvad?"], a: 0, c: "Godt! For nu bliver det lidt mere løssluppent..." }
  ];

  // --- DATA: RUNDE 3 (SPICY TRENDS & REALITY 2025) ---
  const realQuestions3 = [
    { q: "TREND: Hvad er 'Rawdogging' på en flyvetur, som gik viralt i 2025?", o: ["Ingen skærm/mad/søvn", "At flyve nøgen", "At spise råt kød", "At stå op"], a: 0, c: "At sidde og stirre ind i sædet foran i 7 timer uden telefon, musik eller mad. Kun vand. Psykopat-adfærd." },
    { q: "APP: Hvad er den nye store AI-trend indenfor dating?", o: ["AI skriver dine beskeder", "AI går på date for dig", "Du dater en AI", "AI vælger dit tøj"], a: 0, c: "Folk lader ChatGPT skrive deres score-replikker. Hvis samtalen lyder robot-agtig, ved du hvorfor." },
    { q: "KENDIS: Hvad gjorde mange kendisser (som Adele) i 2025?", o: ["Holdt pause", "Startede podcast", "Blev landmænd", "Købte en fodboldklub"], a: 0, c: "Adele annoncerede en lang pause efter sin kæmpe München/Vegas tour. 'Big break'." },
    { q: "RELATIONER: Hvad er et 'Situationship', som alle snakker om?", o: ["Mere end venner, ikke kærester", "Et forhold på en båd", "Når man bor sammen", "Kærester kun i weekenden"], a: 0, c: "Den grå zone. Man er sammen, men man har ikke 'defineret' det. Opskriften på drama." },
    { q: "SKØNHED: Hvad er 'Ozempic Face', som sladderbladene skriver om?", o: ["Indfaldent ansigt efter vægttab", "Et glad ansigt", "Røde øjne", "Stor næse"], a: 0, c: "Når man taber sig for hurtigt på medicin, mister man fedt i ansigtet og ser ældre ud." },
    { q: "MODE: Hvilken 00'er trend kom desværre tilbage i 2025?", o: ["G-streng over bukserne", "Høje hatte", "Træsko", "Slips"], a: 0, c: "Y2K moden vil ikke dø. Lavtaljede jeans og synligt undertøj er set på den røde løber igen." },
    { q: "TIKTOK: Hvad er 'Rotting' (at rotte) i sengen?", o: ["At ligge hele dagen og lave intet", "At spise gammel mad", "At sove 24 timer", "At læse bøger"], a: 0, c: "Bed Rotting. At ligge under dynen med sin telefon en hel søndag. Det hedder nu 'Self Care'." },
    { q: "FILM: Hvad handlede filmen 'Anora' om (Guldpalme-vinderen)?", o: ["En stripper og en oligark-søn", "En rumrejse", "En hund", "En kok"], a: 0, c: "En sexarbejder fra New York gifter sig med en russisk rigmandssøn. Det går helt galt. Meget spicy." },
    { q: "ORD: Hvad betyder 'Rizz', som stadig bruges i 2025?", o: ["Charme/Score-evne", "Risengrød", "Penge", "Respekt"], a: 0, c: "Short for Charisma. Har du 'Rizz', kan du score. Har du ikke... så er det ærgerligt." },
    { q: "DRIKKE: Hvad var den store 'Mocktail' trend i 2025?", o: ["Alkoholfri drinks", "Drinks med kød", "Varme drinks", "Drinks i poser"], a: 0, c: "Sober-Curious bølgen. Det er blevet cool at bestille drinks uden alkohol (og uden tømmermænd)." },
    { q: "KOSMETIK: Hvad får mænd lavet mere og mere i 2025?", o: ["Botox og hår-transplantation", "Fod-massage", "Neglelak", "Øjenvipper"], a: 0, c: "'Brotox'. Mænd vil heller ikke se gamle ud. Og hår-rejser til Tyrkiet er stadig et hit." },
    { q: "MUSIK: Hvilken kvindelig artist dominerede hitlisterne med 'Brat' vibes?", o: ["Charli XCX", "Madonna", "Cher", "Sia"], a: 0, c: "Charli XCX startede 'Brat Summer', og stilen med neon-grøn og fest fortsatte langt ind i 2025." },
    { q: "SPORT: Hvad blev tilladt for mænd i kunstsvømning ved OL (allerede i 24, men stort i 25)?", o: ["At deltage", "At bære maske", "At bruge svømmefødder", "Intet"], a: 0, c: "Mænd er nu med i kunstsvømning. Det ser... anderledes ud, men de er dygtige!" },
    { q: "GEN Z: Hvad betyder det, hvis nogen er 'Delulu'?", o: ["Virkelighedsfjern/Indbildsk", "Lækker", "Dum", "Rig"], a: 0, c: "Delusional. Når man tror, man har en chance hos sin crush, men absolut ikke har det. 'Stay Delulu until it's Trululu'." },
    { q: "KONCERT: Hvad klagede folk over til koncerter i 2025?", o: ["Folk filmer alt med mobilen", "Lyden var for høj", "Ingen øl", "For korte koncerter"], a: 0, c: "Man kan ikke se scenen for bare mobilskærme. Folk ser koncerten gennem deres telefon for at poste det." },
    { q: "STREAMING: Hvad gjorde Netflix ved kontodeling i 2025?", o: ["Gjorde det endnu sværere", "Gjorde det gratis", "Gav op", "Intet"], a: 0, c: "De slog hårdt ned. Du kan ikke længere snylte på din ekskærestes mors konto. Betal ved kasse 1." },
    { q: "SHOPPING: Hvilken kinesisk app købte folk alt muligt skrammel fra?", o: ["Temu", "Amazon", "eBay", "Wish"], a: 0, c: "Temu. 'Shop like a billionaire'. Du købte en drone til 40 kr., og den virkede i 4 minutter." },
    { q: "FERIE: Hvad er 'Coolcation' som blev populært i 2025?", o: ["Ferie i kolde lande", "Ferie i fryseren", "Ferie uden børn", "Ferie med is"], a: 0, c: "Folk gider ikke 40 grader i Italien. De rejser til Norge, Sverige eller Island for at køle af." },
    { q: "ARBEJDE: Hvad er 'Coffee Badging'?", o: ["Møde ind, drikke kaffe, skride hjem", "Lave kaffe til chefen", "Spilde kaffe", "Drikke te"], a: 0, c: "Man møder fysisk op på kontoret, henter en kaffe (så folk ser en), og kører hjem for at arbejde videre." },
    { q: "SIDSTE SPØRGSMÅL: Hvem styrer festen i aften?", o: ["Vi gør!", "Naboen", "Politiet", "Ingen"], a: 0, c: "Det rigtige svar er selvfølgelig JER! Godt nytår og tak for i aften! 🎆" }
  ];

  // Logik til at vælge spørgsmål
  let activeData = [];
  // TEST MODES
  if (gameState.quiz_mode === 'test') activeData = testQuestions1;
  else if (gameState.quiz_mode === 'test_2') activeData = testQuestions2;
  else if (gameState.quiz_mode === 'test_3') activeData = testQuestions3;
  // REAL MODES
  else if (gameState.quiz_mode === 'real') activeData = realQuestions1;
  else if (gameState.quiz_mode === 'real_2') activeData = realQuestions2;
  else if (gameState.quiz_mode === 'real_3') activeData = realQuestions3;
  else activeData = realQuestions1; // Fallback

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
    }).subscribe();

    const playerSub = supabase.channel('player_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async (payload) => {
      if (payload.eventType === 'DELETE' && role === 'player') window.location.reload();
      const { data } = await supabase.from('players').select('*').order('score', { ascending: false });
      setPlayers(data || []);
    }).subscribe();

    return () => { supabase.removeChannel(roomSub); supabase.removeChannel(playerSub); };
  }, [roomCode, role]);

  // AUTO-REVEAL LOGIK FOR VÆRTEN
  useEffect(() => {
    if (role === 'host' && gameState.status === 'active' && players.length > 0) {
        // VIGTIGT: Vi tjekker nu, om spilleren har svaret på DETTE spørgsmål (ved at kigge på indekset)
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
    
    // SIKKERHEDSTJEK: Har jeg allerede svaret på DETTE spørgsmål?
    if (me && me.last_q_index === gameState.current_question) return;
    if (gameState.status !== 'active') return;

    if (me) {
        // Vi gemmer nu både SVARET og SPØRGSMÅLS-NUMMERET.
        let updateData = { last_answer: idx, last_q_index: gameState.current_question };
        if (idx === activeData[gameState.current_question]?.a) {
            const secondsPassed = (new Date() - new Date(gameState.question_started_at)) / 1000;
            const speedBonus = Math.max(0, Math.floor(10 - secondsPassed));
            updateData.score = (me.score || 0) + 10 + speedBonus;
            updateData.correct_count = (me.correct_count || 0) + 1;
            updateData.total_bonus = (me.total_bonus || 0) + speedBonus;
        }
        await supabase.from('players').update(updateData).eq('id', me.id);
    }
  };

  const updateGameStatus = async (status, idx = 0) => {
    if (idx >= activeData.length && status === 'active') status = 'finished';
    
    // Vi behøver ikke længere "nulstille" svar i databasen, fordi vi nu tjekker versions-nummeret (last_q_index).
    // Det gør systemet lynhurtigt og fejlfrit.
    
    const payload = { status, current_question: Math.min(idx, activeData.length - 1) };
    if (status === 'active') payload.question_started_at = new Date().toISOString();
    await supabase.from('quiz_rooms').update(payload).eq('room_code', roomCode);
  };

  const fullReset = async () => {
    if (!window.confirm("ER DU SIKKER? Sletter alt!")) return;
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    if (room) {
      await supabase.from('players').delete().eq('room_id', room.id);
      await supabase.from('quiz_rooms').update({ 
          status: 'lobby', 
          current_question: 0, 
          quiz_mode: 'real' 
      }).eq('room_code', roomCode);
    }
  };

  // HER ER FIXET: VI BRUGER room_id TIL AT SLETTE POINT
  const startMoreQuestions = async () => {
    // Find ud af hvilken mode vi er i, og hvad den næste er
    const currentBase = gameState.quiz_mode.includes('test') ? 'test' : 'real';
    let nextMode = '';
    let promptText = '';

    if (gameState.quiz_mode === currentBase) {
        nextMode = currentBase + '_2';
        promptText = "Klar til RUNDE 2? Pointene nulstilles!";
    } else if (gameState.quiz_mode === currentBase + '_2') {
        nextMode = currentBase + '_3';
        promptText = "Klar til RUNDE 3 (SPICY FINALEN)? Pointene nulstilles!";
    } else {
        return; // Ingen flere runder
    }

    if (!window.confirm(promptText)) return;
    
    // 1. Find ID på rummet
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    
    if (room) {
        // 2. Nulstil spillere KUN i dette rum
        const { error } = await supabase.from('players')
            .update({ score: 0, correct_count: 0, total_bonus: 0, last_answer: null, last_q_index: -1 })
            .eq('room_id', room.id);
            
        if (error) {
            alert("Fejl: Kunne ikke nulstille point. Tjek internettet.");
            return;
        }
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
  
  // HER ER MAGIEN: Vi tjekker databasen: Har JEG svaret på DETTE spørgsmål (indeks)?
  const myData = players.find(p => p.name === playerName);
  const iHaveAnsweredThisSpecificQuestion = myData && myData.last_q_index === gameState.current_question;

  // Header Title Helper
  const getRoundTitle = () => {
      if (gameState.quiz_mode.includes('3')) return "RUNDE 3 🔥";
      if (gameState.quiz_mode.includes('2')) return "RUNDE 2 🚀";
      return "QUIZ'25";
  };

  return (
    <MainLayout quizMode={gameState.quiz_mode}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
        <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            {getRoundTitle()}
        </div>
        <div className="flex items-center gap-3">
          {role === 'host' && <button onClick={fullReset} className="text-rose-400 p-2"><Trash2 size={20} /></button>}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-bold text-sm border border-slate-700"><Users size={14} className="text-indigo-400" /> {players.length}</div>
        </div>
      </div>

      {/* LOBBY */}
      {gameState.status === 'lobby' && (
        <div className="flex-grow flex flex-col text-center">
          <h2 className="text-4xl font-black mb-2 text-white">
            {gameState.quiz_mode.includes('3') ? "Klar til SPICY runde? 🌶️" : (gameState.quiz_mode.includes('2') ? "Klar til Runde 2?" : "Lobbyen er åben!")}
          </h2>
          <p className="text-slate-400 mb-8 text-sm">Find jeres pladser...</p>
          
          {role === 'host' && (
            <button onClick={toggleMode} className="mb-8 mx-auto text-xs font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-600 text-slate-400">{gameState.quiz_mode.includes('test') ? "Skift til PROD" : "Skift til TEST"}</button>
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

          <div key={gameState.current_question} className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow content-center">
            {currentQ.o.map((opt, i) => (
              role === 'player' ? (
                <button 
                  key={i} 
                  disabled={iHaveAnsweredThisSpecificQuestion} 
                  onClick={() => submitAnswer(i)} 
                  className={`relative p-6 rounded-2xl text-xl font-bold text-left transition-all border-b-4 active:border-b-0 active:translate-y-1 touch-manipulation ${iHaveAnsweredThisSpecificQuestion ? 'bg-slate-800 border-slate-900 text-slate-500' : 'bg-slate-700 border-slate-900 hover:bg-slate-600 text-white active:bg-indigo-600'}`}
                >
                  {opt}
                </button>
              ) : (
                <div key={i} className="bg-slate-800 p-6 rounded-2xl text-xl font-bold text-center border-b-4 border-slate-900 text-slate-300 flex flex-col justify-center items-center">
                    <span>{opt}</span>
                    <div className="mt-2 flex gap-1 flex-wrap justify-center">
                        {players.filter(p => p.last_q_index === gameState.current_question).length > 0 && <span className="text-[10px] text-slate-500 animate-pulse">Venter på svar...</span>}
                    </div>
                </div>
              )
            ))}
          </div>

          {role === 'host' && <button onClick={() => updateGameStatus('showing_answer', gameState.current_question)} className="mt-6 w-full bg-amber-500 text-black py-4 rounded-2xl font-black text-xl shadow-lg">SE SVAR</button>}
          {role === 'player' && iHaveAnsweredThisSpecificQuestion && <div className="mt-4 text-center text-indigo-400 font-bold animate-pulse">Svar modtaget... 🤞</div>}
        </div>
      )}

      {/* SHOWING ANSWER */}
      {gameState.status === 'showing_answer' && currentQ && (
        <div className="flex-grow flex flex-col items-center justify-start text-center overflow-y-auto">
          
          {/* SKÅL ALARM LOGIK */}
          {(() => {
            const playersWhoAnswered = players.filter(p => p.last_q_index === gameState.current_question);
            const everyoneWrong = playersWhoAnswered.length > 0 && playersWhoAnswered.every(p => p.last_answer !== currentQ.a);
            
            if (everyoneWrong) {
                return (
                    <div className="w-full bg-rose-600 text-white p-6 rounded-3xl mb-6 animate-bounce shadow-2xl border-4 border-rose-800">
                        <div className="flex justify-center mb-2"><AlertTriangle size={48} className="text-yellow-300" /></div>
                        <h2 className="text-3xl font-black uppercase mb-2">KATASTROFE!</h2>
                        <p className="text-xl font-bold">Alle drikker! Bund eller resten i håret!</p>
                    </div>
                );
            }
            return null;
          })()}

          {/* DET RIGTIGE SVAR + CONTEXT */}
          <div className="mb-6 w-full max-w-2xl mx-auto">
             <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-500/20">
                <CheckCircle2 size={14} /> Det rigtige svar
             </div>
             <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{currentQ.o[currentQ.a]}</h2>
             
             {currentQ.c && (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-slate-300 text-sm md:text-base italic leading-relaxed shadow-sm max-w-lg mx-auto">
                    " {currentQ.c} "
                </div>
             )}
          </div>

          {/* HVEM SVAREDE HVAD? */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
             {currentQ.o.map((opt, i) => {
                const isCorrect = i === currentQ.a;
                // Her kigger vi kun på dem, der har svaret PÅ DENNE RUNDE
                const votedHere = players.filter(p => p.last_q_index === gameState.current_question && p.last_answer === i);
                
                return (
                    <div key={i} className={`p-3 rounded-xl border-2 flex flex-col ${isCorrect ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-slate-800/50 border-slate-800'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold text-sm ${isCorrect ? 'text-emerald-400' : 'text-slate-400'}`}>{opt}</span>
                            {isCorrect && <CheckCircle2 size={16} className="text-emerald-500" />}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                            {votedHere.map((p, idx) => (
                                <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md font-bold truncate max-w-[100px] ${isCorrect ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )
             })}
          </div>

          {role === 'host' && <button onClick={() => updateGameStatus('active', gameState.current_question + 1)} className="mt-auto w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50">NÆSTE <ChevronRight /></button>}
        </div>
      )}

      {/* RESULTS */}
      {gameState.status === 'finished' && (
        <div className="flex-grow flex flex-col">
          <div className="text-center mb-8">
             <Trophy size={64} className="mx-auto text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
             <h2 className="text-4xl font-black text-white italic">RESULTATER</h2>
             <div className="text-amber-300 font-bold mt-2 uppercase">{getRoundTitle()} AFSLUTTET</div>
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
          
          {role === 'host' && (
            <div className="mt-auto space-y-4">
                {/* KNAPPEN TIL NÆSTE RUNDE (VISES KUN HVIS VI IKKE ALLEREDE ER I RUNDE 3) */}
                {!gameState.quiz_mode.includes('3') && (
                    <button onClick={startMoreQuestions} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl animate-pulse hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
                         {gameState.quiz_mode.includes('2') ? "SPICY RUNDE 3!!!" : "MERE!!!"} <Flame fill="currentColor" />
                    </button>
                )}
                
                <button onClick={fullReset} className="w-full text-rose-500 text-xs font-bold uppercase flex items-center justify-center gap-2 py-4">
                   <RefreshCcw size={14} /> Nulstil alt
                </button>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default QuizApp;
