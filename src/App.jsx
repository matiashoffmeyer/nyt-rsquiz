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

  // --- DATA: RUNDE 1 (FAKTA & KALENDER 2025) ---
  const realQuestions1 = [
    // DE 5 NYE STARTSPØRGSMÅL
    { q: "Hvilke lande delte værtsskabet for VM i Herrehåndbold i januar 2025?", o: ["Danmark, Sverige, Norge", "Danmark, Norge, Kroatien", "Tyskland, Polen, Danmark", "Frankrig, Spanien, Portugal"], a: 1, c: "Det var Danmark, Norge og Kroatien. Vi startede året med harpiks på hænderne!" },
    { q: "Hvilken historisk begivenhed fandt sted i Washington D.C. d. 20. januar 2025?", o: ["Super Bowl", "Donald Trump blev indsat", "Det Hvide Hus brændte", "En fredsaftale blev underskrevet"], a: 1, c: "Donald Trump blev officielt indsat som USA's 47. præsident. Det var en dag, der fyldte meget i nyhederne." },
    { q: "Hvilken Formel 1-kører skiftede sensationelt til Ferrari og kørte sin første sæson i rødt i 2025?", o: ["Max Verstappen", "Lando Norris", "Lewis Hamilton", "Kevin Magnussen"], a: 2, c: "Lewis Hamilton chokerede alle med skiftet. Det var mærkeligt at se ham uden Mercedes-logoet." },
    { q: "Hvilken kæmpe kunstner optrådte ved Super Bowl Halftime Show i februar 2025?", o: ["Taylor Swift", "Kendrick Lamar", "Drake", "Justin Bieber"], a: 1, c: "Kendrick Lamar indtog scenen i New Orleans. Det var et show, der delte vandene!" },
    { q: "Hvad skete der endelig med det britiske band Oasis i sommeren 2025?", o: ["De udgav en jazz-plade", "De blev uvenner igen", "De spillede reunion-koncerter", "Liam Gallagher blev munk"], a: 2, c: "Miraklet skete! Brødrene sluttede fred og spillede en kæmpe turné i UK og Irland." },

    // SPORT & BEGIVENHEDER (Fortsat)
    { q: "Hvilken by var startby for Tour de France 2025?", o: ["København", "Lille (Frankrig)", "Barcelona", "London"], a: 1, c: "Touren startede i det nordfranske (Lille) d. 5. juli. Ingen udenlandske eventyr i år, det hele foregik i Frankrig." },
    { q: "Hvor blev Champions League finalen spillet d. 31. maj 2025?", o: ["Wembley (London)", "Parken (Kbh)", "Allianz Arena (München)", "Stade de France (Paris)"], a: 2, c: "München var værtsbyen. Tyskerne lavede en kæmpe folkefest." },
    { q: "Hvilken by var vært for Eurovision Song Contest i maj 2025?", o: ["Zürich", "Geneve", "Basel", "Bern"], a: 2, c: "Basel vandt værtskabet. Det var dyrt at være gæst i Schweiz, men showet var flot!" },
    
    // POLITIK & SAMFUND
    { q: "Hvilken dato gik vi til stemmeurnerne til Kommunalvalget 2025?", o: ["1. november", "18. november", "21. november", "4. december"], a: 1, c: "Valgdatoen lå fast: Tredje tirsdag i november. Altså d. 18. november." },
    { q: "Hvilken rolle overtog Danmark i EU fra d. 1. juli 2025?", o: ["Formandskabet", "Forsvars-ledelsen", "Landbrugsstyrelsen", "Ingen"], a: 0, c: "Danmark havde EU-formandskabet i det sidste halve år. Der var mange topmøder i København." },
    { q: "Hvad skete der med statsradiofonien (DR) den 1. april 2025?", o: ["De lukkede P3", "De blev reklamefinansieret", "De fyldte 100 år", "Licensen steg til 5000 kr"], a: 2, c: "DR fejrede 100 års jubilæum! Gamle klip rullede over skærmen hele foråret." },

    // KULTUR & SHOWBIZ
    { q: "Hvem var vært for Oscar-uddelingen i marts 2025?", o: ["Jimmy Kimmel", "Conan O'Brien", "Ricky Gervais", "Kevin Hart"], a: 1, c: "Conan O'Brien styrede showet for første gang. Det var en frisk udskiftning efter mange år med Kimmel." },
    { q: "Hvilket dansk rockband spillede hele 4 udsolgte koncerter i Parken i juni 2025?", o: ["Volbeat", "D-A-D", "The Minds of 99", "Nik & Jay"], a: 2, c: "Minds of 99 slog alle rekorder. Fire aftener i træk med fællessang i nationalarenaen." },
    { q: "Hvilken sangerinde afsluttede sin 'Eras Tour' (verdens største tour) i 2024/2025?", o: ["Beyoncé", "Taylor Swift", "Adele", "Dua Lipa"], a: 1, c: "Taylor Swift. Det virkede som om den tour varede i 5 år, men nu er den slut." },

    // TECH & TING
    { q: "Hvad skete der med 'Grand Theft Auto VI' (GTA 6) i efteråret 2025?", o: ["Det udkom og slog alle rekorder", "Det blev gratis", "Det blev udskudt til 2026", "Det blev aflyst"], a: 2, c: "Gamerne græd. Rockstar meldte ud, at vi må vente til 2026 for at få den fulde oplevelse." },
    { q: "Hvilket Microsoft-styresystem mistede officielt supporten i oktober 2025?", o: ["Windows 10", "Windows 11", "Windows XP", "Windows 8"], a: 0, c: "Det var farvel til Windows 10 d. 14. oktober. Millioner af PC'er skulle opdateres eller skrottes." },
    { q: "Hvilken type stik blev det eneste lovlige til nye telefoner i EU i 2025?", o: ["Lightning", "USB-C", "Trådløs", "Micro-USB"], a: 1, c: "USB-C. Nu kan du endelig låne en oplader af din ven med Android (eller omvendt)." },
    { q: "Hvad var det særlige ved iPhone 17 'Air' modellen, der kom i september?", o: ["Den var gennemsigtig", "Den var ekstremt tynd", "Den kunne foldes", "Den havde intet kamera"], a: 1, c: "Den var ultratynd. Apple satsede alt på designet i år." },

    // DYR & NATUR
    { q: "Hvilket rovdyr etablerede sig endnu mere fast i Jylland i løbet af 2025?", o: ["Guldsjakal", "Ulv", "Los", "Bjørn"], a: 1, c: "Ulven er her for at blive. Der blev spottet flere hvalpe, og debatten rasede som altid." },
    { q: "Hvilken invasiv snegl var stadig den største plage i de danske haver i 2025?", o: ["Voldsneglen", "Dræbersneglen", "Plettet voldsnegl", "Vinbjergsneglen"], a: 1, c: "Den iberiske skovsnegl (dræbersneglen). Heller ikke i år fandt vi mirakelkuren." },
    { q: "Hvilken hunderace var den mest populære i Danmark (igen) i 2025?", o: ["Fransk Bulldog", "Labrador Retriever", "Golden Retriever", "Cocker Spaniel"], a: 1, c: "Labradoren er stadig danskernes foretrukne familiehund. Den er bare sød og glad for mad." },
    { q: "Hvad var det, Dronning Margrethe gjorde for præcis to år siden (nytår 23/24)?", o: ["Hun abdicerede", "Hun fik en hund", "Hun flyttede", "Hun fik kørekort"], a: 0, c: "Det var bomben i nytårstalen for to år siden. I år har vi vænnet os til Kong Frederik." }
  ];

  // --- DATA: RUNDE 2 (BLANDET MIX 2025) ---
  const realQuestions2 = [
    { q: "FILM: Hvilken spil-baseret film med Jack Black havde premiere i foråret 2025?", o: ["Minecraft: The Movie", "Fortnite: The Movie", "Zelda", "Mario 2"], a: 0, c: "A Minecraft Movie. Det så meget mærkeligt ud med rigtige mennesker i en firkantet verden." },
    { q: "ROYALT: Hvem rundede et skarpt hjørne og fyldte 20 år d. 15. oktober 2025?", o: ["Prins Christian", "Prinsesse Isabella", "Grev Nikolai", "Prins Joachim"], a: 0, c: "Kronprins Christian forlod teenager-årene. Han er nu en voksen mand på 20." },
    { q: "SPORT: Hvem stod i spidsen for herrelandsholdet i fodbold gennem 2025?", o: ["Kasper Hjulmand", "Brian Riemer", "Thomas Frank", "Michael Laudrup"], a: 1, c: "Brian Riemer. Han overtog roret i slutningen af '24 og har styret holdet i år." },
    { q: "PARK: Hvilken klassisk forlystelse i Tivoli var lukket/under ombygning i 2025?", o: ["Dæmonen", "Den Gamle Rutschebane", "Snurretoppen", "Ballongyngerne"], a: 2, c: "Snurretoppen blev pillet ned for at gøre plads til noget nyt. Mange savnede kvalmen." },
    { q: "REJSE: Hvad var 'Coolcation', som mange danskere tog på i sommeren 2025?", o: ["Ferie i kolde lande", "Ferie alene", "Ferie uden mobil", "Ferie med is"], a: 0, c: "Folk orkede ikke 45 grader i Sydeuropa. Norge og Sverige fik masser af turister, der ville køles ned." },
    { q: "JUBILÆUM: Hvilken klassisk dansk film fyldte 50 år i efteråret 2025?", o: ["Olsen Banden på Sporet", "Matador", "Zappa", "Huset på Christianshavn"], a: 0, c: "'Olsen Banden på Sporet' er fra 1975. Det er den med det lille tog og Børge som lærling." },
    { q: "BYGGERI: Hvilket stort vandkulturhus åbnede endelig dørene i København i 2025?", o: ["Vandhuset på Papirøen", "Lynetteholm Badet", "Amager Strandhus", "Nordhavn Spa"], a: 0, c: "Papirøens vandkulturhus. Det har været undervejs længe, men nu kan man endelig bade der." },
    { q: "SERIE: Hvilken kæmpe Netflix-serie sendte sin sidste sæson i 2025?", o: ["Stranger Things", "Bridgerton", "The Crown", "Squid Game"], a: 0, c: "Stranger Things. Børnene var blevet voksne, men de fik endelig afsluttet kampen mod Vecna." },
    { q: "TURISME: Hvad skulle man betale for at besøge Venedig på travle dage i 2025?", o: ["5 Euro i entré", "Ingenting", "100 Euro", "Man skulle booke 1 år før"], a: 0, c: "Entré-gebyret blev permanent. Man kan ikke bare vade ind på Markuspladsen gratis længere." },
    { q: "DANMARK: Hvad hed den helligdag, vi heller ikke havde i foråret 2025?", o: ["Store Bededag", "Kristi Himmelfart", "2. Pinsedag", "Grundlovsdag"], a: 0, c: "Store Bededag. Vi har stadig ikke fået den tilbage. Det var bare en almindelig fredag." },
    { q: "BIL: Hvilket bilmærke var det mest solgte i Danmark igen i 2025?", o: ["Tesla", "VW", "Toyota", "Peugeot"], a: 0, c: "Tesla. Især Model Y var overalt på de danske veje." },
    { q: "SUNDHED: Hvilken medicin var der stadig kæmpe efterspørgsel på i 2025?", o: ["Wegovy (Vægttab)", "Panodil", "Ipren", "Hostesaft"], a: 0, c: "Wegovy. Novo Nordisk havde endnu et vildt år, fordi hele verden ville tabe sig." },
    { q: "RUMMET: Hvad gjorde fire astronauter med Artemis II missionen i september 2025?", o: ["Fløj rundt om månen", "Landede på Mars", "Byggede en base", "Intet"], a: 0, c: "De fløj rundt om månen og hjem igen. Det var første gang i over 50 år, mennesker var så langt væk." },
    { q: "JOB: Hvad gik trenden 'Coffee Badging' ud på i 2025?", o: ["Møde ind, hente kaffe, skride hjem", "Lave god kaffe", "Spilde kaffe", "Drikke te"], a: 0, c: "At møde op på kontoret, scanne sit kort, hente en kaffe (så chefen så en) og så køre hjem igen." },
    { q: "SPORT: Hvem vandt Kvindernes EM i fodbold i sommeren 2025 (Schweiz)?", o: ["Spanien", "England", "Tyskland", "Danmark"], a: 1, c: "England (Lionesses) tog trofæet (eller var favoritter). Kvindefodbold var større end nogensinde." },
    { q: "REJSE: Hvad skulle danskere have klar for at rejse til London i 2025?", o: ["En ETA (Elektronisk tilladelse)", "Et visum på papir", "Vaccinepas", "Ingenting"], a: 0, c: "Det britiske ETA-system trådte i kraft. Man skulle registreres og betale online før afrejse." },
    { q: "NET: Hvad kalder vi stadig det sociale medie X, selvom det har heddet X længe?", o: ["Twitter", "Facebook", "Insta", "Tokken"], a: 0, c: "Twitter. Ingen har vænnet sig til at sige 'Jeg har lagt et opslag på X'. Det lyder forkert." },
    { q: "KALENDER: Hvilken ugedag faldt Juleaften på i år (2025)?", o: ["Onsdag", "Torsdag", "Fredag", "Lørdag"], a: 0, c: "Det var en onsdag. En rigtig 'midt i ugen' jul, så man fik en kort arbejdsuge." },
    { q: "TECH: Hvilken ny konsol annoncerede Nintendo endelig i 2025?", o: ["Switch 2", "GameBoy 2025", "Wii 3", "DS 2025"], a: 0, c: "Efterfølgeren til Switchen! Gamerne har ventet på den i årevis, og i år hørte vi endelig nyt." },
    { q: "BONUS: Er vi klar til den SPICY runde?", o: ["JA!", "Nej", "Måske", "Hvad?"], a: 0, c: "Så stram ballerne, for nu gælder det trends og TikTok-sprog!" }
  ];

  // --- DATA: RUNDE 3 (SPICY TRENDS & BEGREBER 2025) ---
  const realQuestions3 = [
    { q: "TREND: Hvad gik fænomenet 'Rawdogging' på en flyvetur ud på?", o: ["Ingen skærm/mad/søvn", "At flyve nøgen", "At spise råt kød", "At stå op"], a: 0, c: "At sidde og stirre på flykortet i 7 timer uden høretelefoner, film eller mad. Psykopat-adfærd, der gik viralt." },
    { q: "SLANG: Hvad betød det, hvis en person havde 'Rizz' i 2025?", o: ["Charme/Score-evne", "Risengrød", "Penge", "Dårlig stil"], a: 0, c: "Kort for Charisma. Havde du Rizz, kunne du score. Havde du ikke... så var det ærgerligt." },
    { q: "SOMMER: Hvad var 'Brat Summer', som dominerede musikken?", o: ["Neon-grøn, fest og kaos", "Barbie-pink", "Rolig sommer", "Kedelig sommer"], a: 0, c: "Startet af Charli XCX. Det handlede om at være lidt rodet, festlig og 'Brat'. Farven var giftig grøn." },
    { q: "FÆNOMEN: Hvad blev 'Hawk Tuah' pigen kendt for tidligere på året?", o: ["Et viralt interview om sex", "At synge opera", "At bage kage", "At spille fodbold"], a: 0, c: "Et gadeinterview, der stak helt af. Hvis du ved det, så ved du det. 'Spit on that thang'." },
    { q: "FORHOLD: Hvad kaldte man det, når man datede uden at være kærester?", o: ["Situationship", "Relationskib", "Venskab+", "Deltid"], a: 0, c: "Et Situationship. Mere end venner, men ikke kærester. Opskriften på at blive såret." },
    { q: "LIVSSTIL: Hvad gik trenden 'Bed Rotting' ud på?", o: ["At ligge i sengen hele dagen", "At spise gammel mad", "At sove 24 timer", "At ødelægge sin seng"], a: 0, c: "At ligge under dynen en hel søndag og scrolle på TikTok. Gen Z kaldte det 'Self Care', vi andre kaldte det dovenskab." },
    { q: "UDSEENDE: Hvad var 'Mewing', som især drenge gik op i?", o: ["Tungepres for kæbelinje", "Kattelyde", "Hårfarvning", "Makeup"], a: 0, c: "Man presser tungen op i ganen for at få en skarpere kæbelinje (jawline). Det ser dumt ud, men de gjorde det." },
    { q: "ORD: Hvad betød det at være 'Demure' (Jools Lebron trenden)?", o: ["Beskeden og mindful", "Vild og gal", "Højlydt", "Grim"], a: 0, c: "'Very demure, very mindful'. Det startede som en joke om at være pæn på jobbet, men blev et kæmpe meme." },
    { q: "APP: Hvad gjorde mange på appen 'Temu' i 2025?", o: ["Købte billigt skrammel", "Datede", "Hørte musik", "Så film"], a: 0, c: "Købte ting som en 'laser til katte' for 2 kroner. Det hele lugtede af kemikalier, men det var billigt." },
    { q: "DATE: Hvad mente folk, når de fik et 'Ick'?", o: ["Noget der tændte dem af", "En sygdom", "En type drink", "Et kys"], a: 0, c: "En lille ting, der pludselig gjorde daten frastødende. F.eks. hvis han brugte begge hænder til at holde sit glas." },
    { q: "BEGREB: Hvad var en 'Tradwife', som trendede på sociale medier?", o: ["Husmor der dyrker 50'er stilen", "En moderne kone", "En der handler aktier", "En robot-kone"], a: 0, c: "Kvinder der idealiserede 1950'ernes husmorliv. Hjemmebag, kjoler og at tjene manden. Kontroversielt!" },
    { q: "SLANG: Hvad betød det at være 'Delulu'?", o: ["Virkelighedsfjern/Indbildsk", "Lækker", "Dum", "Rig"], a: 0, c: "Delusional. 'Delulu is the solulu'. Når man bildte sig selv ind, at ens crush også var vild med en." },
    { q: "KROP: Hvad var 'Ozempic Face', som sladderbladene skrev om?", o: ["Indfaldent ansigt efter vægttab", "Et glad ansigt", "Røde øjne", "Store læber"], a: 0, c: "Når stjernerne tabte sig for hurtigt på medicin, mistede de fylde i ansigtet og så hule ud." },
    { q: "ARBEJDE: Hvad dækkede begrebet 'Quiet Quitting' over?", o: ["Kun at gøre det nødvendige", "At sige op hemmeligt", "At larme", "At stjæle ting"], a: 0, c: "Man passede sit job, men sagde nej til overarbejde og ekstra ansvar. Man meldte sig ud mentalt." },
    { q: "TREND: Hvad var 'Dumbphone' trenden?", o: ["At skifte til gammel Nokia", "En telefon af træ", "At tale dumt", "Ingen telefon"], a: 0, c: "Unge skiftede smartphonen ud med en gammel klap-telefon for at slippe for sociale medier." },
    { q: "MAD: Hvad var en 'Girl Dinner'?", o: ["En tallerken med snacks/ost", "En stor bøf", "Ingen mad", "Kun salat"], a: 0, c: "Når man ikke orkede at lave mad: En tallerken med ost, vindruer, en pølse og lidt kiks. Nemt." },
    { q: "FARVE: Hvad var et 'Beige Flag' i dating-verdenen?", o: ["Noget sært, men ikke farligt", "Noget meget farligt", "At de er kedelige", "At de elsker beige"], a: 0, c: "Ikke et rødt flag (farligt), men bare... mærkeligt. F.eks. hvis han aldrig har set Star Wars." },
    { q: "LIVSSTIL: Hvad stod 'DINK' for?", o: ["Double Income, No Kids", "Drinking In New Kitchen", "Dad Is Not Kind", "Dance In Night Klub"], a: 0, c: "Par med to indkomster og ingen børn. De havde råd til rejser, sushi og dyre møbler." },
    { q: "FILM: Hvilket fænomen kaldte man 'Barbenheimer' (som stadig blev omtalt)?", o: ["Barbie og Oppenheimer mix", "En ny drink", "En by i Tyskland", "En sanger"], a: 0, c: "Det definerede biograferne året før, men vi snakkede stadig om kontrasten mellem pink og atombomber." },
    { q: "SIDSTE SPØRGSMÅL: Hvem har styret festen i aften?", o: ["Vi har!", "Naboen", "Politiet", "Ingen"], a: 0, c: "Det rigtige svar er selvfølgelig JER! Godt nytår og tak for i aften! 🎆" }
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

  const startMoreQuestions = async () => {
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
        return; 
    }

    if (!window.confirm(promptText)) return;
    
    const { data: room } = await supabase.from('quiz_rooms').select('id').eq('room_code', roomCode).single();
    
    if (room) {
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
  const myData = players.find(p => p.name === playerName);
  const iHaveAnsweredThisSpecificQuestion = myData && myData.last_q_index === gameState.current_question;

  const getRoundTitle = () => {
      if (gameState.quiz_mode.includes('3')) return "RUNDE 3 🔥";
      if (gameState.quiz_mode.includes('2')) return "RUNDE 2 🚀";
      return "QUIZ'25";
  };

  return (
    <MainLayout quizMode={gameState.quiz_mode}>
      <div className="flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
        <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            {getRoundTitle()}
        </div>
        <div className="flex items-center gap-3">
          {role === 'host' && <button onClick={fullReset} className="text-rose-400 p-2"><Trash2 size={20} /></button>}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-bold text-sm border border-slate-700"><Users size={14} className="text-indigo-400" /> {players.length}</div>
        </div>
      </div>

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

      {gameState.status === 'showing_answer' && currentQ && (
        <div className="flex-grow flex flex-col items-center justify-start text-center overflow-y-auto">
          
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

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
             {currentQ.o.map((opt, i) => {
                const isCorrect = i === currentQ.a;
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
