import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Play, Trophy, Monitor, ChevronRight, CheckCircle2, Zap, Trash2, RefreshCcw, AlertTriangle, Flame } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- SIMPLE CONFETTI COMPONENT (NO DEPENDENCIES) ---
const SimpleConfetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#73ff00', '#ff00ea'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // left position %
      delay: Math.random() * 2, // animation delay
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
            borderRadius: Math.random() > 0.5 ? '50%' : '0%', // Mix of circles and squares
          }}
        />
      ))}
    </div>
  );
};

const MainLayout = ({ children, quizMode }) => (
  // min-h-[100dvh] sikrer at den passer præcis indenfor browserens rammer på mobil
  <div className={`min-h-[100dvh] text-slate-100 font-sans transition-colors duration-500 flex flex-col ${quizMode.includes('test') ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900'}`}>
    {quizMode.includes('test') && <div className="bg-amber-500 text-black font-black text-center text-xs py-1">TEST MODE {quizMode.includes('3') ? '3' : (quizMode.includes('2') ? '2' : '1')} (DEV)</div>}
    {/* p-3 for at spare vertikal plads på mobiler */}
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
  const [gameState, setGameState] = useState({ status: 'lobby', current_question: 0, question_started_at: null, quiz_mode: 'real' });
  
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

  // --- DATA: RUNDE 1 (FAKTA & KALENDER 2025 - ORDSPIL EDITION) ---
  const realQuestions1 = [
    // DE 5 NYE STARTSPØRGSMÅL
    { q: "Hvilke tre lande delte værtsskabet for VM i Herrehåndbold i januar 2025?", o: ["Danmark, Sverige, Norge", "Danmark, Norge, Kroatien", "Tyskland, Polen, Danmark", "Frankrig, Spanien, Portugal"], a: 1, c: "Vi håndterede det for vildt! Det var ikke en harpiks-situation, men en ren mål-fest i tre lande. Man må sige, vi havde grebet om tingene." },
    { q: "Hvilken begivenhed fandt sted i Washington D.C. d. 20. januar 2025?", o: ["Super Bowl", "Indsættelse af Donald Trump", "Det Hvide Hus jubilæum", "Fredsaftale underskrevet"], a: 1, c: "Han trak det længste strå - eller skal vi sige den længste Trump-et? Demokraterne blev Harris'et ud, og nu er Det Hvide Hus igen orange-over." },
    { q: "Hvilken Formel 1-kører annoncerede sit skifte til Ferrari og kørte i rødt i 2025?", o: ["Max Verstappen", "Lando Norris", "Lewis Hamilton", "Kevin Magnussen"], a: 2, c: "Han skiftede gear! Det var en rød-glødende nyhed. Man kan sige, han var træt af at være Mercedes-løs og ville prøve flere hestekræfter." },
    { q: "Hvilken hiphop-stjerne stod for Super Bowl Halftime Show i februar 2025?", o: ["Kanye West", "Kendrick Lamar", "Drake", "Jay-Z"], a: 1, c: "Det var helt bowl-et! Han rappede så taget lettede. Det var bestemt ikke falsk markedsføring – han ramte plet på hver en beat." },
    { q: "Hvad var sommerens helt store musiknyhed i Storbritannien?", o: ["The Beatles AI-tour", "Blur gik fra hinanden", "Oasis blev genforenet", "Ed Sheeran stoppede"], a: 2, c: "Det var Wonder-well gjort! Brødrene begravede stridsøksen uden at slås. Don't look back in banker - de tjener kassen!" },

    // SPORT & BEGIVENHEDER (Fortsat)
    { q: "Hvilken by lagde asfalt til starten af Tour de France d. 5. juli 2025?", o: ["København", "Lille (Frankrig)", "Barcelona", "London"], a: 1, c: "En stor start i en Lille by! Rytterne var gearet til tænderne, og det kørte bare deruda'. Det var heldigvis aldrig kæde-ligt at se på." },
    { q: "Hvor blev Champions League finalen spillet d. 31. maj 2025?", o: ["Wembley (London)", "Parken (Kbh)", "Allianz Arena (München)", "Stade de France (Paris)"], a: 2, c: "München var mål-rettet! Det var en bajer-dygtig indsats. Der var ikke noget pølse-snak her, kun ren tysk effektivitet." },
    { q: "Hvilken by var vært for Eurovision Song Contest i maj 2025?", o: ["Zürich", "Geneve", "Basel", "Bern"], a: 2, c: "Det gik som et schweizerur! Basel var basen, og stemningen var ost-tastisk. Der var ingen, der sang på sidste vers." },
    
    // POLITIK & SAMFUND
    { q: "Hvilken dato var vi til stemmeurnerne til Kommunalvalget 2025?", o: ["1. november", "18. november", "21. november", "4. december"], a: 1, c: "Vi satte vores kryds og tværs. Der var masser af valgflæsk på menuen, men vi håber, de nye byrødder ikke er helt taburet-tappede." },
    { q: "Hvilken rolle varetog Danmark i EU i andet halvår af 2025?", o: ["Formandskabet", "Forsvars-ledelsen", "Landbrugsstyrelsen", "Ingen"], a: 0, c: "Mette sad for bordenden. Det var en union-ik chance for at vise fanen. Vi håber ikke, det blev for EU-ro-tisk i kulissen." },
    { q: "Hvad fejrede statsradiofonien (DR) d. 1. april 2025?", o: ["Lukningen af P3", "Reklame-start", "100 års jubilæum", "Ny generaldirektør"], a: 2, c: "De har været på bølgelængde med danskerne i 100 år. Det var en signal-stærk fejring, og licensen var heldigvis ikke en radio-aktiv bombe." },

    // KULTUR & SHOWBIZ
    { q: "Hvem styrede slagets gang som vært for Oscar-uddelingen i marts 2025?", o: ["Jimmy Kimmel", "Conan O'Brien", "Ricky Gervais", "Kevin Hart"], a: 1, c: "Han var Conan-kurerende sjov! Han leverede en rolle-model indsats. Det var bestemt ikke en komedie af fejl, men en ægte blockbuster." },
    { q: "Hvilket dansk band spillede 4 udsolgte koncerter i Parken i juni 2025?", o: ["Volbeat", "D-A-D", "The Minds of 99", "Nik & Jay"], a: 2, c: "De spillede så Parken rystede – det var helt sind-ssygt! De var på hjemmebane, og publikum var helt Solkonge-lige." },
    { q: "Hvilken sangerinde afsluttede officielt sin gigantiske 'Eras Tour' i 2024/25?", o: ["Beyoncé", "Taylor Swift", "Adele", "Dua Lipa"], a: 1, c: "Det gik ikke Swift, for den tour varede evigheder! Men hun sang sig ind i historiebøgerne. Det var en æra-frygtindgydende præstation." },

    // TECH & TING
    { q: "Hvilket spil ventede hele verden på i 2025 (men udgivelsen var sat til efteråret/26)?", o: ["GTA VI", "Red Dead 3", "FIFA 26", "Sims 5"], a: 0, c: "Vi må konsol-idere os med ventetiden. Rockstar kører ikke i højeste gear. Det var et tyveri af vores tålmodighed!" },
    { q: "Hvilket Microsoft-styresystem mistede supporten d. 14. oktober 2025?", o: ["Windows 10", "Windows 11", "Windows XP", "Windows 8"], a: 0, c: "Microsoft lukkede vinduet for 10'eren. Nu er det blue screen of death, hvis du ikke opdaterer. Det er en tast-elig situation." },
    { q: "Hvilket stik blev det eneste lovlige til nye telefoner i EU i 2025?", o: ["Lightning", "USB-C", "Trådløs", "Micro-USB"], a: 1, c: "Apple fik et ordentligt stik i siden af EU. Nu er der endelig kontakt! Det var også på høje volt, at det skete." },
    { q: "Hvad var det særlige ved iPhone 17 'Air', som rygtedes/kom i efteråret?", o: ["Den var gennemsigtig", "Den var ekstremt tynd", "Den kunne foldes", "Den havde intet kamera"], a: 1, c: "Den er så tynd, at den næsten er luft! Apple har virkelig skrællet æblet ind til benet. Pas på den ikke blæser væk." },

    // DYR & NATUR
    { q: "Hvilket rovdyr havde flere dokumenterede hvalpekuld i Jylland i 2025?", o: ["Guldsjakal", "Ulv", "Los", "Bjørn"], a: 1, c: "Det er helt ulv-ideligt sandt. De er her! Det får nok fårene til at føle sig lidt får-fordelt, men naturen er tand-løs uden dem." },
    { q: "Hvilken invasiv snegl var stadig haveejernes værste fjende i 2025?", o: ["Voldsneglen", "Dræbersneglen", "Plettet voldsnegl", "Vinbjergsneglen"], a: 1, c: "En slim-et affære. De er nogle snegl-e til at skride hjem igen. Det er en kamp, der går i snegletempo, men vi giver ikke op!" },
    { q: "Hvilken hunderace lå igen nr. 1 på listen over populære hunde i DK?", o: ["Fransk Bulldog", "Labrador Retriever", "Golden Retriever", "Cocker Spaniel"], a: 1, c: "Labradoren er stadig pote-ntielt den bedste. Den logrer sig ind overalt. Det er ikke noget at gø af - den er bare sød!" },
    { q: "Hvad var det, Dronning Margrethe gjorde for præcis to år siden (nytår 23/24)?", o: ["Hun abdicerede", "Hun fik en hund", "Hun flyttede", "Hun fik kørekort"], a: 0, c: "Hun smed kronen på værket. Det var en kongelig overraskelse, der fik os til at tabe kæben. Nu er det Frederik, der styrer ballet." }
  ];

  // --- DATA: RUNDE 2 (BLANDET MIX 2025 - ORDSPIL EDITION) ---
  const realQuestions2 = [
    { q: "FILM: Hvilken spil-filmatisering med Jack Black havde premiere i april 2025?", o: ["Minecraft: The Movie", "Fortnite: The Movie", "Zelda", "Mario 2"], a: 0, c: "En rigtig blok-buster! Men anmelderne var lidt firkantede. Det var måske at bygge lidt for højt på en spil-succes." },
    { q: "ROYALT: Hvem fyldte 20 år d. 15. oktober 2025?", o: ["Prins Christian", "Prinsesse Isabella", "Grev Nikolai", "Prins Joachim"], a: 0, c: "Han er ikke længere teen-konge, men tyve! Han tronede frem på dagen. Det var en fyrstelig fejring." },
    { q: "SPORT: Hvem var landstræner for herrelandsholdet i fodbold hele året?", o: ["Kasper Hjulmand", "Brian Riemer", "Thomas Frank", "Michael Laudrup"], a: 1, c: "Han har virkelig sparket gang i holdet. Han sidder ikke bare på bænken, han har en plan. Lad os håbe, han ikke bliver skiftet ud." },
    { q: "MUSIK: Hvilken dansk legende holdt stadig pause fra koncerter i 2025?", o: ["Christopher", "Jada", "Thomas Helmig", "Medina"], a: 2, c: "Det gør ondt i hjertet, men han holder pause. Ingen stupid man her, kun respekt. Vi venter på, at han igen siger: 'Jeg malaga mig ned'." },
    { q: "PARK: Hvilken forlystelse i Tivoli var savnet i 2025 (lukket/ombygget)?", o: ["Dæmonen", "Den Gamle Rutschebane", "Snurretoppen", "Ballongyngerne"], a: 2, c: "Det var en top-nyhed, at den røg. Nu slipper vi for at køre i ring. Tivoli har forlystet sig med at bygge nyt." },
    { q: "REJSE: Hvad var 'Coolcation', som mange danskere valgte i sommerferien?", o: ["Ferie i kolde lande", "Ferie alene", "Ferie uden mobil", "Ferie med is"], a: 0, c: "Det er is-koldt beregnet! Folk gider ikke svede, så de tager en kølig dukkert nordpå. Det er den hotteste trend at fryse." },
    { q: "JUBILÆUM: Hvilken folkekær film fyldte 50 år i efteråret 2025?", o: ["Olsen Banden på Sporet", "Matador", "Zappa", "Huset på Christianshavn"], a: 0, c: "Skide godt, Egon! 50 år på sporet. Det var en plan, der holdt hele vejen. De er stadig kup-et over dem alle." },
    { q: "BYGGERI: Hvad åbnede endelig på Papirøen i København i 2025?", o: ["Vandkulturhuset", "Et Operahus", "En ny metro", "Et storcenter"], a: 0, c: "Nu kan man komme i vand til knæene. Det ser ikke kun godt ud på papir-et, det virker også i virkeligheden. En flydende succes." },
    { q: "SERIE: Hvilken Netflix-gigant sendte sin 5. og sidste sæson i 2025?", o: ["Stranger Things", "Bridgerton", "The Crown", "Squid Game"], a: 0, c: "Det var en mærkelig (strange) afslutning! Verden blev vendt på hovedet. Det var ikke for tøsepiger, men monster-fedt." },
    { q: "TURISME: Hvad skulle turister betale for at komme ind i Venedig på travle dage?", o: ["5 Euro i entré", "Ingenting", "100 Euro", "Man skulle booke 1 år før"], a: 0, c: "Det koster kassen at se vandet. Turisterne må punge ud. Det er en synkende skude, hvis de ikke begrænser strømmen." },
    { q: "DANMARK: Hvilken forårs-helligdag manglede vi igen i år (2025)?", o: ["Store Bededag", "Kristi Himmelfart", "2. Pinsedag", "Grundlovsdag"], a: 0, c: "Vi måtte bede forgæves om at få den tilbage. Regeringen var ikke til at hugge eller stikke i. Nu er det slut med varme hveder." },
    { q: "BIL: Hvilket bilmærke dominerede de danske veje i 2025?", o: ["Tesla", "VW", "Toyota", "Peugeot"], a: 0, c: "De giver konkurrenterne baghjul på strøm. Salget var helt elektrisk! Det kører som smurt i olie... eller nå nej." },
    { q: "SUNDHED: Hvilket medicin-navn var på alles læber (og maver) i 2025?", o: ["Wegovy (Vægttab)", "Panodil", "Ipren", "Hostesaft"], a: 0, c: "Novo har fedet den, mens vi andre er skrumpet. Det er en sprøjte-god forretning. En rigtig tung spiller på markedet." },
    { q: "RUMMET: Hvad gjorde Artemis II missionen i september 2025?", o: ["Fløj mennesker rundt om månen", "Landede på Mars", "Byggede en base", "Intet"], a: 0, c: "Helt til månen og tilbage! Det var en stjerne-god præstation. Der var ingen, der var lunatic - det var ren videnskab." },
    { q: "JOB: Hvad gik trenden 'Coffee Badging' ud på i 2025?", o: ["Møde ind, hente kaffe, skride hjem", "Lave god kaffe", "Spilde kaffe", "Drikke te"], a: 0, c: "En bønne for fremmøde! Man stempler ind, får sit koffein-fix, og så er man smuttet. Det er kaffe-grums i maskineriet for chefen." },
    { q: "SPORT: Hvilket land var værter for Kvindernes EM i fodbold i sommer?", o: ["Schweiz", "England", "Tyskland", "Danmark"], a: 0, c: "Det var dame-godt spillet! De gik til stålet (og bolden). Det kørte som smurt i alpe-landet." },
    { q: "REJSE: Hvad skulle vi have klar for at rejse til London fra april 2025?", o: ["En ETA (Elektronisk tilladelse)", "Et visum på papir", "Vaccinepas", "Ingenting"], a: 0, c: "Nu koster det at sige Hello. Briterne har sat en grænse. Det er slut med at komme sovende gennem kontrollen." },
    { q: "NET: Hvad insisterede Elon Musk stadig på at kalde Twitter i 2025?", o: ["X", "Y", "Z", "SpaceBook"], a: 0, c: "Elon satte et stort kryds over fuglen. Men vi pipper stadig løs. Det er lidt et X-periment, der aldrig slutter." },
    { q: "KALENDER: Hvilken ugedag faldt Juleaften på i år (2025)?", o: ["Onsdag", "Torsdag", "Fredag", "Lørdag"], a: 0, c: "En onsdags-snegl... øh jul. Det delte ugen midt over som en brunede kartoffel. Kort uge, lang and!" },
    { q: "TECH: Hvilken ny håndholdt konsol annoncerede Nintendo endelig i 2025?", o: ["Switch 2", "GameBoy 2025", "Wii 3", "DS 2025"], a: 0, c: "Nintendo lavede endelig et skifte (Switch). Vi har trykket på alle knapper for at få den. Det er game on igen!" },
    { q: "BONUS: Er vi klar til den SPICY runde?", o: ["JA!", "Nej", "Måske", "Hvad?"], a: 0, c: "Så stram ballerne, for nu gælder det trends og TikTok-sprog!" }
  ];

  // --- DATA: RUNDE 3 (SPICY TRENDS & BEGREBER 2025 - ORDSPIL EDITION) ---
  const realQuestions3 = [
    { q: "TREND: Hvad gik fænomenet 'Rawdogging' på en flyvetur ud på?", o: ["Ingen skærm/mad/søvn", "At flyve nøgen", "At spise råt kød", "At stå op"], a: 0, c: "Det er rå-kost for hjernen! Ingen underholdning, bare luft. Man skal være gjort af et særligt stof for ikke at flyve op i det røde felt." },
    { q: "SLANG: Hvad betød det, hvis en person havde 'Rizz' i 2025?", o: ["Charme/Score-evne", "Risengrød", "Penge", "Dårlig stil"], a: 0, c: "Har du Rizz, får du kys! Ingen Rizz? Så er det bare ris til egen røv. Det handler om at have talegaverne i orden." },
    { q: "SOMMER: Hvad var 'Brat Summer', som vi snakkede om?", o: ["Neon-grøn, fest og kaos", "Barbie-pink", "Rolig sommer", "Kedelig sommer"], a: 0, c: "En grøn bølge af kaos! Det var tilladt at være en møgunge. Sommeren var ikke bare hot, den var Brat." },
    { q: "FÆNOMEN: Hvad blev 'Hawk Tuah' pigen kendt for (fra året før)?", o: ["Et viralt interview om sex", "At synge opera", "At bage kage", "At spille fodbold"], a: 0, c: "Hun spyttede sandheder ud! Det gik viralt hurtigere end man kunne sige Tuah. Internettet er et mærkeligt sted." },
    { q: "FORHOLD: Hvad kaldte man det, når man datede uden at være kærester?", o: ["Situationship", "Relationskib", "Venskab+", "Deltid"], a: 0, c: "Et skib uden ror! Man sejler rundt i følelserne. Er vi kærester? Nej, vi er i situation. Det er forhold-svis kompliceret." },
    { q: "LIVSSTIL: Hvad gik trenden 'Bed Rotting' ud på?", o: ["At ligge i sengen hele dagen", "At spise gammel mad", "At sove 24 timer", "At ødelægge sin seng"], a: 0, c: "Man lader dagen rådne væk. Det er dyne-namit for sjælen (eller dovenskaben). Hvorfor stå op, når man kan ligge ned?" },
    { q: "UDSEENDE: Hvad var 'Mewing', som især drenge gik op i?", o: ["Tungepres for kæbelinje", "Kattelyde", "Hårfarvning", "Makeup"], a: 0, c: "Hold tunge lige i munden! De vil have en kæbe af stål, men ser ud som om de har slugt en kat. Mjaverligt!" },
    { q: "ORD: Hvad betød det at være 'Demure' (Jools Lebron trenden)?", o: ["Beskeden og mindful", "Vild og gal", "Højlydt", "Grim"], a: 0, c: "Vær lidt mindful, skat. Det er ikke demure at bøvse ved bordet. En trend der var mistænkeligt pæn i kanten." },
    { q: "APP: Hvad gjorde mange på appen 'Temu' i 2025?", o: ["Købte billigt skrammel", "Datede", "Hørte musik", "Så film"], a: 0, c: "Det er temu-lig billigt! Men kvaliteten er også derefter. Man får hvad man betaler for: En kina-køb der holder til døren." },
    { q: "DATE: Hvad mente folk, når de fik et 'Ick'?", o: ["Noget der tændte dem af", "En sygdom", "En type drink", "Et kys"], a: 0, c: "Pludselig er han bare klam. Det er et ick-e til at holde ud! Når magien forsvinder hurtigere end dug for solen." },
    { q: "BEGREB: Hvad var en 'Tradwife', som trendede på sociale medier?", o: ["Husmor der dyrker 50'er stilen", "En moderne kone", "En der handler aktier", "En robot-kone"], a: 0, c: "Tilbage til kødgryderne! Det er trad-itionelt, men er det moderne? Hun bager brød, mens han tjener brødet. Smag og behag." },
    { q: "SLANG: Hvad betød det at være 'Delulu'?", o: ["Virkelighedsfjern/Indbildsk", "Lækker", "Dum", "Rig"], a: 0, c: "Hvis man tror på det, er det sandt? Nej, du er bare delulu! Men hey, drømme er gratis (indtil virkeligheden rammer)." },
    { q: "KROP: Hvad var 'Ozempic Face', som sladderbladene s
