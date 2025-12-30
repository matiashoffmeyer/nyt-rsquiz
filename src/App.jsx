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
    // SPORT & BEGIVENHEDER
    { q: "Hvilken by er officielt bekræftet som startby for Tour de France 2025?", o: ["København", "Lille (Frankrig)", "Barcelona", "London"], a: 1, c: "Touren starter i det nordfranske (Lille) d. 5. juli 2025. Ingen udenlandsk start i år." },
    { q: "Hvor skal Champions League finalen spilles d. 31. maj 2025?", o: ["Wembley (London)", "Parken (Kbh)", "Allianz Arena (München)", "Stade de France (Paris)"], a: 2, c: "München er værtsbyen. Det er bekræftet af UEFA for længe siden." },
    { q: "Hvilken by vandt værtskabet for Eurovision Song Contest 2025?", o: ["Zürich", "Geneve", "Basel", "Bern"], a: 2, c: "Basel i Schweiz vandt kampen. Det bliver afholdt i St. Jakobshalle i maj." },
    { q: "Hvilket stort mesterskab afholdes i Schweiz i sommeren 2025?", o: ["VM i Cykling", "Kvindernes EM i Fodbold", "OL", "VM i Håndbold"], a: 1, c: "Schweiz har et vildt år. Både Melodi Grand Prix og EM i kvindefodbold på én sommer." },
    
    // POLITIK & SAMFUND
    { q: "Hvilken dato skal vi til stemmeurnerne til Kommunalvalget 2025?", o: ["1. november", "18. november", "21. november", "4. december"], a: 1, c: "Valgdatoen ligger fast i loven: Tredje tirsdag i november. Altså d. 18. november 2025." },
    { q: "Hvilken rolle overtager Danmark i EU fra d. 1. juli 2025?", o: ["Formandskabet", "Forsvars-ledelsen", "Landbrugsstyrelsen", "Ingen"], a: 0, c: "Danmark har EU-formandskabet i andet halvår af 2025. Mette F. skal styre møderne." },
    { q: "Hvem bliver indsat som USA's præsident d. 20. januar 2025?", o: ["Donald Trump", "Kamala Harris", "Joe Biden", "J.D. Vance"], a: 0, c: "Donald Trump vandt valget i '24 og bliver nr. 47. Det er et faktum." },
    { q: "Hvad sker der med statsradiofonien i 2025?", o: ["DR lukker P3", "TV2 bliver reklamefri", "DR fylder 100 år", "Licensen stiger"], a: 2, c: "Statsradiofonien (DR) blev grundlagt 1. april 1925. De fylder 100 år!" },

    // KULTUR & SHOWBIZ
    { q: "Hvilket britisk band har officielt meldt ud, at de genforenes i 2025?", o: ["Pink Floyd", "Oasis", "The Smiths", "One Direction"], a: 1, c: "Liam og Noel Gallagher har sluttet fred (for nu). Oasis spiller store koncerter i UK sommeren '25." },
    { q: "Hvem er bekræftet som vært for Oscar-uddelingen i marts 2025?", o: ["Jimmy Kimmel", "Conan O'Brien", "Ricky Gervais", "Kevin Hart"], a: 1, c: "Conan O'Brien tager tjansen. Det er officielt bekræftet af akademiet." },
    { q: "Hvilken verdensstjerne har annonceret, at han kører Formel 1 for Ferrari i 2025?", o: ["Max Verstappen", "Lewis Hamilton", "Kevin Magnussen", "Fernando Alonso"], a: 1, c: "Det største skifte i F1-historien. Hamilton i rødt fra 2025-sæsonen." },
    { q: "Hvilket dansk rockband spiller 4 udsolgte koncerter i Parken i juni 2025?", o: ["Volbeat", "D-A-D", "The Minds of 99", "Nik & Jay"], a: 2, c: "Minds of 99 slår alle rekorder med fire koncerter i nationalarenaen." },

    // TECH & TING
    { q: "Hvilket gigantisk spil har Rockstar bekræftet udkommer i efteråret 2025?", o: ["GTA VI", "Red Dead 3", "FIFA 26", "Sims 5"], a: 0, c: "Grand Theft Auto VI. Traileren sagde 2025, og Rockstar fastholder 'Fall 2025'." },
    { q: "Hvilket Microsoft-styresystem mister officielt supporten i oktober 2025?", o: ["Windows 10", "Windows 11", "Windows XP", "Windows 8"], a: 0, c: "Windows 10 dør d. 14. oktober 2025. Ingen flere sikkerhedsopdateringer." },
    { q: "Hvilken oplader-standard blev lovpligtig for alle nye telefoner i EU ved udgangen af 24/25?", o: ["Lightning", "USB-C", "Trådløs", "Micro-USB"], a: 1, c: "USB-C. Apple måtte bøje sig. Nu har selv iPhone 16/17 det stik." },
    { q: "Hvilken artist er bekræftet til Super Bowl Halftime Show i feb 2025?", o: ["Kendrick Lamar", "Taylor Swift", "Justin Bieber", "Drake"], a: 0, c: "Kendrick Lamar skal optræde i New Orleans. Det blev annonceret i september." },

    // DYR & NATUR
    { q: "Hvilket rovdyr har etableret sig fast med hvalpe i Jylland (status 2024/25)?", o: ["Guldsjakal", "Ulv", "Los", "Bjørn"], a: 1, c: "Ulven er her for at blive. Der er flere dokumenterede hvalpekuld nu." },
    { q: "Hvilken invasiv snegl er stadig den største plage i danske haver?", o: ["Voldsneglen", "Dræbersneglen", "Plettet voldsnegl", "Vinbjergsneglen"], a: 1, c: "Den iberiske skovsnegl (dræbersneglen). Kampen fortsætter også i 2025." },
    { q: "Hvilken hunderace var den mest populære i Danmark ved seneste optælling?", o: ["Fransk Bulldog", "Labrador Retriever", "Golden Retriever", "Cocker Spaniel"], a: 1, c: "Labradoren er stadig danskernes foretrukne familiehund." },
    { q: "Hvad skete der med Dronning Margrethe for præcis et år siden (nytår 23/24)?", o: ["Hun abdicerede", "Hun fik en hund", "Hun flyttede", "Hun fik kørekort"], a: 0, c: "Det var i sin nytårstale for et år siden, hun chokerede alle. Nu har vi Kong Frederik." }
  ];

  // --- DATA: RUNDE 2 (BLANDET MIX 2025) ---
  const realQuestions2 = [
    { q: "FILM: Hvilken stor film med Jason Momoa og Jack Black har premiere i april 2025?", o: ["Minecraft: The Movie", "Jumanji 4", "Aquaman 3", "Fast & Furious 12"], a: 0, c: "En Minecraft-film med rigtige mennesker. Traileren fik... blandede modtagelser." },
    { q: "ROYALT: Hvem fylder 20 år d. 15. oktober 2025?", o: ["Prins Christian", "Prinsesse Isabella", "Grev Nikolai", "Prins Joachim"], a: 0, c: "Kronprins Christian rundede de 18 i '23, så han rammer 20'erne i 2025." },
    { q: "SPORT: Hvem er ny dansk landstræner i herrefodbold (ansat slut 24)?", o: ["Kasper Hjulmand", "Brian Riemer", "Thomas Frank", "Michael Laudrup"], a: 1, c: "Brian Riemer fik jobbet i efteråret 2024 og skal lede holdet i 2025." },
    { q: "MUSIK: Hvilken dansk sanger annoncerede en pause på ubestemt tid i 2024?", o: ["Christopher", "Jada", "Thomas Helmig", "Medina"], a: 2, c: "Thomas Helmig meldte ud, at han trækker stikket til koncerter på ubestemt tid." },
    { q: "PARK: Hvilken forlystelse i Tivoli lukkede/ombygges fra 2025?", o: ["Dæmonen", "Den Gamle Rutschebane", "Snurretoppen", "Ballongyngerne"], a: 2, c: "Snurretoppen blev pillet ned for at gøre plads til noget nyt. RIP til kvalmen." },
    { q: "TREND: Hvad er 'Coolcation', som rejsebureauerne melder om?", o: ["Ferie i kolde lande", "Ferie alene", "Ferie uden mobil", "Ferie med is"], a: 0, c: "Folk flygter fra hedebølgen i Sydeuropa. Norge og Sverige er det nye Mallorca." },
    { q: "JUBILÆUM: Hvad fylder 50 år i 2025 (dansk film)?", o: ["Olsen Banden", "Matador", "Olsen Banden på Sporet", "Huset på Christianshavn"], a: 2, c: "'Olsen Banden på Sporet' (den med det lille tog) havde premiere i 1975." },
    { q: "BYGGERI: Hvilken ø i København åbner mere og mere op i 2025?", o: ["Lynetteholm", "Papirøen", "Refshaleøen", "Trekroner"], a: 1, c: "Vandkulturhuset på Papirøen forventes færdigt. Det bliver byens nye dyre hæng-ud sted." },
    { q: "SERIE: Hvilken Netflix-serie afslutter med sin 5. og sidste sæson i 2025?", o: ["Stranger Things", "Bridgerton", "The Crown", "Squid Game"], a: 0, c: "Stranger Things slutter endelig. Børnene er snart 30 år gamle i virkeligheden." },
    { q: "VIRKELIGHED: Hvad blev indført for turister i Venedig i 2024/25?", o: ["Entré-gebyr", "Forbud mod kufferter", "Svømme-forbud", "Ingen selfies"], a: 0, c: "Man skal betale 5 Euro for at komme ind i byen på travle dage. Slut med gratis kultur." },
    { q: "DANMARK: Hvilket nyt navn fik 'Bededag' i kalenderen?", o: ["Arbejdsdag", "Almindelig fredag", "Mette-dag", "Fridag"], a: 1, c: "Den findes ikke mere. Det er bare en almindelig fredag nu. Tak for det." },
    { q: "BIL: Hvilket bilmærke blev det mest solgte i DK i 2024 (og nok også 25)?", o: ["Tesla", "VW", "Toyota", "Peugeot"], a: 0, c: "Tesla (især Model Y) sidder tungt på markedet. De er overalt." },
    { q: "SUNDHED: Hvad er navnet på den slankemedicin, der eksploderede i 24/25?", o: ["Wegovy", "Ozempic", "Begge dele", "NovoSlim"], a: 2, c: "Wegovy (til vægttab) og Ozempic (til diabetes) er det samme stof. Novo Nordisk ejer verden nu." },
    { q: "RUMMET: Hvad hedder den NASA-mission, der skal flyve rundt om månen i sep 2025?", o: ["Artemis II", "Apollo 18", "Moonraker", "Starship"], a: 0, c: "Artemis II. Fire astronauter skal ud på en tur rundt om månen. Første gang i 50 år." },
    { q: "JOB: Hvad betyder begrebet 'Coffee Badging'?", o: ["Møde ind, hente kaffe, skride hjem", "Lave god kaffe", "Spilde kaffe", "Drikke te"], a: 0, c: "Man møder fysisk op på kontoret bare for at vise ansigt (og få kaffe), og så kører man hjem igen." },
    { q: "SPORT: Hvem vandt EM i Håndbold for herrer i jan 2024 (og er favoritter i VM 25)?", o: ["Frankrig", "Danmark", "Sverige", "Tyskland"], a: 0, c: "Frankrig slog Danmark i finalen. Vi satser på revanche til VM i januar 2025!" },
    { q: "FERIE: Hvilket land kræver nu en 'ETA' (indrejse-godkendelse) for danskere?", o: ["UK (Storbritannien)", "Tyskland", "Norge", "Sverige"], a: 0, c: "Fra april 2025 skal europæere betale og registrere sig før de rejser til London." },
    { q: "NET: Hvad hedder det sociale medie, Elon Musk ejer (som stadig skaber kaos)?", o: ["Twitter", "X", "Y", "Z"], a: 1, c: "Det hedder X. Men vi kalder det alle sammen stadig for Twitter." },
    { q: "KALENDER: Hvilken ugedag falder Juleaften på i 2025?", o: ["Tirsdag", "Onsdag", "Torsdag", "Fredag"], a: 1, c: "Onsdag d. 24. december. En klassisk 'midt i ugen' jul." },
    { q: "BONUS: Er vi klar til den SPICY runde?", o: ["JA!", "Nej", "Måske", "Hvad?"], a: 0, c: "Så stram ballerne, for nu gælder det trends og TikTok-sprog!" }
  ];

  // --- DATA: RUNDE 3 (SPICY TRENDS & BEGREBER 2024/25) ---
  const realQuestions3 = [
    { q: "TREND: Hvad er 'Rawdogging' på en flyvetur (Viral trend)?", o: ["Ingen skærm/mad/søvn", "At flyve nøgen", "At spise råt kød", "At stå op"], a: 0, c: "At sidde og stirre ud i luften i 7 timer. Ingen film, ingen musik, intet vand. Kun ren viljestyrke." },
    { q: "SLANG: Hvad betyder det, hvis nogen har 'Rizz'?", o: ["Charme/Score-evne", "Risengrød", "Penge", "Dårlig stil"], a: 0, c: "Forkortelse for Charisma. Har du Rizz, kan du score. Har du ikke... så er det op ad bakke." },
    { q: "SOMMER: Hvad var 'Brat Summer' (startet af Charli XCX)?", o: ["Neon-grøn, fest og kaos", "Barbie-pink", "Rolig sommer", "Kedelig sommer"], a: 0, c: "Det var overalt. 'Brat' betød at være lidt rodet, festlig og ligeglad. Farven var syre-grøn." },
    { q: "FÆNOMEN: Hvad er 'Hawk Tuah' pigen kendt for?", o: ["Et viralt interview om sex", "At synge opera", "At bage kage", "At spille fodbold"], a: 0, c: "Et interview på gaden i Nashville, der gik verden rundt. Vi siger ikke mere." },
    { q: "FORHOLD: Hvad er et 'Situationship'?", o: ["Mere end venner, ikke kærester", "Et forhold på en båd", "Når man bor sammen", "Kærester kun i weekenden"], a: 0, c: "Den grå zone. Man dater, men man har ikke 'defineret' det. Det er opskriften på forvirring." },
    { q: "LIVSSTIL: Hvad går trenden 'Bed Rotting' ud på?", o: ["At ligge i sengen hele dagen", "At spise gammel mad", "At sove 24 timer", "At ødelægge sin seng"], a: 0, c: "At ligge under dynen med sin telefon en hel dag og lave absolut intet. Gen Z kalder det 'Self Care'." },
    { q: "UDSEENDE: Hvad er 'Mewing' (som drenge laver i skolen)?", o: ["Presser tungen op for kæbelinje", "Laver kattelyde", "Farver hår", "Går med makeup"], a: 0, c: "En teknik hvor man presser tungen op i ganen for at få en skarpere kæbelinje. Ser dumt ud, men de tror på det." },
    { q: "ORD: Hvad betyder det at være 'Demure' (Jools Lebron trend)?", o: ["Beskeden og mindful", "Vild og gal", "Højlydt", "Grim"], a: 0, c: "'Very demure, very mindful'. Det startede som en joke om at være pæn på jobbet, men blev årets ord." },
    { q: "APP: Hvad gør man på appen 'Temu', som alle snakker om?", o: ["Køber billigt skrammel", "Dater", "Hører musik", "Ser film"], a: 0, c: "'Shop like a billionaire'. Kinesisk app hvor du kan købe en drone til 30 kr. (som virker i 2 minutter)." },
    { q: "DATE: Hvad er et 'Ick'?", o: ["Noget der pludselig tænder dig af", "En sygdom", "En type drink", "Et kys"], a: 0, c: "Når din date gør noget, der får dig til at miste interessen øjeblikkeligt. F.eks. løber efter bussen med rygsæk." },
    { q: "BEGREB: Hvad er en 'Tradwife'?", o: ["Husmor der dyrker 50'er stilen", "En moderne kone", "En der handler aktier", "En robot-kone"], a: 0, c: "Kvinder på TikTok der dyrker idealet om at gå hjemme, bage brød og tjene manden som i 1950'erne." },
    { q: "SLANG: Hvad betyder det, hvis nogen er 'Delulu'?", o: ["Virkelighedsfjern/Indbildsk", "Lækker", "Dum", "Rig"], a: 0, c: "Delusional. 'Delulu is the solulu' (Løsningen er at bilde sig selv noget ind). Ofte om dating." },
    { q: "KROP: Hvad er 'Ozempic Face'?", o: ["Indfaldent ansigt efter vægttab", "Et glad ansigt", "Røde øjne", "Store læber"], a: 0, c: "Bivirkning ved det hurtige vægttab på medicin. Man mister fedt i ansigtet og kan se ældre ud." },
    { q: "ARBEJDE: Hvad er 'Quiet Quitting'?", o: ["Kun at gøre præcis det man lønnes for", "At sige op uden at sige det", "At larme", "At stjæle ting"], a: 0, c: "Man passer sit arbejde, men man dropper overarbejde og ekstra ansvar. Man 'melder sig ud' mentalt." },
    { q: "TREND: Hvad er 'Dumbphone' trenden?", o: ["At skifte tilbage til gammel Nokia", "En telefon af træ", "At tale dumt", "Ingen telefon"], a: 0, c: "Folk dropper smartphonen og køber en gammeldags 'klap-telefon' for at få fred fra apps." },
    { q: "MAD: Hvad er 'Girl Dinner'?", o: ["En tallerken med snacks/ost/pølse", "En stor bøf", "Ingen mad", "Kun salat"], a: 0, c: "Når man ikke orker at lave mad, og bare spiser lidt ost, kiks, druer og pickles. Det er Girl Dinner." },
    { q: "FARVE: Hvad er et 'Beige Flag' hos en kæreste?", o: ["Noget sært, men ikke farligt", "Noget meget farligt", "At de er kedelige", "At de elsker beige"], a: 0, c: "Røde flag er farlige. Grønne er gode. Beige er bare... mærkelige vaner. F.eks. at spise pizza med gaffel." },
    { q: "LIVSSTIL: Hvad er en 'DINK'?", o: ["Double Income, No Kids", "Drinking In New Kitchen", "Dad Is Not Kind", "Dance In Night Klub"], a: 0, c: "Par med to indkomster og ingen børn. De har råd til dyre ferier og Lego-sæt til voksne." },
    { q: "FILM: Hvad var fænomenet 'Barbenheimer' (fra året før, men stadig legendarisk)?", o: ["At se Barbie og Oppenheimer samme dag", "En ny drink", "En by i Tyskland", "En sanger"], a: 0, c: "Det definerede biograferne. Pink plastik og atombomber på én aften." },
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
