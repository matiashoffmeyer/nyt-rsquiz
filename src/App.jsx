import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Play, Trophy, Monitor, ChevronRight, CheckCircle2, Zap, Trash2, RefreshCcw, AlertTriangle, FastForward, Flame } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MainLayout = ({ children, quizMode }) => (
  // ÆNDRING: min-h-[100dvh] sikrer at den passer præcis indenfor browserens rammer på mobil (uden adressebar-problemer)
  <div className={`min-h-[100dvh] text-slate-100 font-sans transition-colors duration-500 flex flex-col ${quizMode.includes('test') ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900'}`}>
    {quizMode.includes('test') && <div className="bg-amber-500 text-black font-black text-center text-xs py-1">TEST MODE {quizMode.includes('3') ? '3' : (quizMode.includes('2') ? '2' : '1')} (DEV)</div>}
    {/* ÆNDRING: p-3 i stedet for p-4/p-6 for at spare vertikal plads på mobiler */}
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-3 md:p-6 flex-grow flex flex-col justify-between">
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
    { q: "KROP: Hvad var 'Ozempic Face', som sladderbladene skrev om?", o: ["Indfaldent ansigt efter vægttab", "Et glad ansigt", "Røde øjne", "Store læber"], a: 0, c: "Ansigtet hænger lidt i bremsen. Man bliver tynd, men ser slidt ud. Det er prisen for at snyde på vægten." },
    { q: "ARBEJDE: Hvad dækkede begrebet 'Quiet Quitting' over?", o: ["Kun at gøre det nødvendige", "At sige op hemmeligt", "At larme", "At stjæle ting"], a: 0, c: "Man lister sig ud af ansvaret på stille sokker. Ingen larm, bare minimum indsats. Chefen opdager det ikke, før det er for sent." },
    { q: "TREND: Hvad var 'Dumbphone' trenden?", o: ["At skifte til gammel Nokia", "En telefon af træ", "At tale dumt", "Ingen telefon"], a: 0, c: "Det er smart at være dum! Slut med apps, nu kan man kun ringe. Det er en opkalds-kvalitet, vi havde glemt." },
    { q: "MAD: Hvad var en 'Girl Dinner'?", o: ["En tallerken med snacks/ost", "En stor bøf", "Ingen mad", "Kun salat"], a: 0, c: "Hvem behøver en steg? Lidt ost og en kiks er pige-godt! Det er snack-attack på højt niveau." },
    { q: "FARVE: Hvad var et 'Beige Flag' i dating-verdenen?", o: ["Noget sært, men ikke farligt", "Noget meget farligt", "At de er kedelige", "At de elsker beige"], a: 0, c: "Det er ikke rødt, det er ikke grønt, det er bare... beige. Lidt farveløst, men man dør ikke af det. Kedeligt er det nye sort." },
    { q: "LIVSSTIL: Hvad stod 'DINK' for?", o: ["Double Income, No Kids", "Drinking In New Kitchen", "Dad Is Not Kind", "Dance In Night Klub"], a: 0, c: "Ingen bleer, masser af skejser! De lever det søde liv og tager en drink mere. Børn er dyre, frihed er priceless." },
    { q: "FILM: Hvilket fænomen kaldte man 'Barbenheimer' (som vi stadig husker)?", o: ["Barbie og Oppenheimer mix", "En ny drink", "En by i Tyskland", "En sanger"], a: 0, c: "En bombe af lyserød energi! Det var en eksplosiv cocktail. Biograferne havde en dukke-god dag." },
    { q: "SIDSTE SPØRGSMÅL: Hvem har styret festen i aften?", o: ["Vi har!", "Naboen", "Politiet", "Ingen"], a: 0, c: "I har styret det for vildt! Ingen er nabo-venlige i aften. Tak for kampen – I er nogle krudtugler! Godt nytår!" }
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
        promptText = "Klar til RUNDE 3 (FINALEN)? Pointene nulstilles!";
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
      <div className="flex justify-between items-center mb-4 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
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
          <div className="text-center mb-4">
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
