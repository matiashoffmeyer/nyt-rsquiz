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
    { q: "Hvilket team kørte Kevin Magnussen IKKE for i 2025 (fordi han stoppede der)?", o: ["Ferrari", "Haas", "McLaren", "Red Bull"], a: 1, c: "Han og Haas sagde farvel efter '24. Det var en **bremseklods** for karrieren, men han gav den gas så længe det varede. En **dæk-adent** afslutning." },
    
    // 12. MUSIK
    { q: "Hvilken dansk festival meldte 'Alt Udsolgt' på rekordtid (igen) i 2025?", o: ["Roskilde Festival", "Smukfest", "Tinderbox", "Copenhell"], a: 1, c: "Smukfest billetterne røg hurtigere end en fadøl i bøgeskoven. Det er en **smuk** tradition, men serverne fik **stress**." },
    
    // 13. ERHVERV
    { q: "Hvilket dansk firma cementerede sin plads som Europas mest værdifulde i 2025?", o: ["Mærsk", "Lego", "Novo Nordisk", "Carlsberg"], a: 2, c: "Novo har **fedet** den, mens vi andre er skrumpet. Det er en **sprøjte-god** forretning. En rigtig tung spiller på markedet." },
    
    // 14. KLIMA
    { q: "Hvor blev FN's store klimatopmøde (COP30) afholdt i november 2025?", o: ["I Danmark", "I Brasilien (Belém)", "I Dubai", "I USA"], a: 1, c: "I Amazon-regnskoven! Det var **klima-ks** på debatten. De lovede guld og **grønne** skove, men lad os se, om det holder." },
    
    // 15. TECH
    { q: "Hvilken ny AI-model fra OpenAI rygtedes/udkom i 2025 og skulle være 'klogere end mennesker'?", o: ["GPT-5 (Orion)", "Siri 2.0", "Alexa Pro", "Terminator"], a: 0, c: "GPT-5. Den er så klog, at den nok snart overtager quiz-tjansen her. Det er en **kunstig** situation, men ret intelligent." },
    
    // 16. DRONNINGEN
    { q: "Hvilken titel bar Margrethe gennem hele 2025?", o: ["Dronning (uden regent-status)", "Prinsesse", "Hertuginde", "Fru Margrethe"], a: 0, c: "Hun er stadig Dronning Margrethe, bare uden tronen. Hun nyder otiummet og maler løs. Det er et **monarki-stisk** luksusliv." },
    
    // 17. BRO
    { q: "Hvad skete der (som sædvanlig) med prisen for at køre over Storebælt i 2025?", o: ["Den blev gratis", "Den steg en lille smule", "Det blev halv pris", "Kun jyder betaler"], a: 1, c: "Den fik et lille nøk op. Det er en **bro-get** affære for pengepungen. Man må sige, de forstår at slå **bro** til din bankkonto." },
    
    // 18. NATUR
    { q: "Hvilket fænomen på nattehimlen var ekstra kraftigt i 2025 pga. 'Solar Maximum'?", o: ["Nordlys", "Måneformørkelse", "Stjerneskud", "UFO'er"], a: 0, c: "Solen gik amok, og vi fik nordlys i Danmark. Himlen var helt **grøn** af misundelse! Det var en **lys-idé** fra naturens side." },
    
    // 19. SPORT (BADMINTON)
    { q: "Hvor blev VM i Badminton afholdt i august 2025?", o: ["København", "Paris", "Tokyo", "London"], a: 1, c: "I Paris. Axelsen var på pletten igen. Han er ikke til at **fjer-ne** fra toppen. En rigtig **shuttle-cocky** indsats!" },
    
    // 20. NYTÅR
    { q: "Hvad er det vigtigste ved nytårsaften 2025?", o: ["Dronningens tale", "Kongens tale", "Statsministerens tale", "At vi vinder quizzen"], a: 3, c: "At I vinder! Kongen talte godt nok kl. 18, men nu gælder det håneretten. Det er en **raket-videnskab** at feste rigtigt!" }
  ];

  // --- DATA: RUNDE 2 (BLANDET MIX 2025 - ORDSPILS EDITION) ---
  const realQuestions2 = [
    { q: "FILM: Hvilken superhelte-film startede det nye 'DC Universe' i juli 2025?", o: ["Superman: Legacy", "Batman Returns", "Wonder Woman 3", "Flash 2"], a: 0, c: "Superman vendte tilbage! Det var en **super-mandlig** præstation. Han fløj højere end benzinpriserne." },
    { q: "ROYALT: Hvem blev student i sommeren 2025 (hvis alt gik efter planen)?", o: ["Prinsesse Isabella", "Prins Christian", "Ingen", "Grev Henrik"], a: 0, c: "Isabella fik huen på! Det var en **hue-ggelig** dag på Øregård. Nu skal hun ud og male byen rød (eller blå)." },
    { q: "SPORT: Hvem var landstræner for herrelandsholdet i fodbold hele året?", o: ["Kasper Hjulmand", "Brian Riemer", "Thomas Frank", "Michael Laudrup"], a: 1, c: "Brian Riemer. Han har virkelig sparket gang i holdet. Han sidder ikke bare på bænken, han har en plan." },
    { q: "MUSIK: Hvilken dansk legende holdt stadig pause fra koncerter i 2025?", o: ["Christopher", "Jada", "Thomas Helmig", "Medina"], a: 2, c: "Det gør ondt i hjertet, men Helmig holder fri. Ingen 'Stupid Man' her. Vi venter på, at han igen siger: 'Jeg malaga mig ned'." },
    { q: "PARK: Hvilken forlystelse i Tivoli var savnet i 2025 (lukket/ombygget)?", o: ["Dæmonen", "Den Gamle Rutschebane", "Snurretoppen", "Ballongyngerne"], a: 2, c: "Snurretoppen røg sig en tur. Nu slipper vi for at køre i ring. Tivoli har forlystet sig med at bygge nyt." },
    { q: "REJSE: Hvad var 'Coolcation', som mange danskere valgte i sommerferien?", o: ["Ferie i kolde lande", "Ferie alene", "Ferie uden mobil", "Ferie med is"], a: 0, c: "Det er is-koldt beregnet! Folk gider ikke svede sydpå, så de tager nordpå. Det er den hotteste trend at fryse." },
    { q: "JUBILÆUM: Hvilken folkekær film fyldte 50 år i efteråret 2025?", o: ["Olsen Banden på Sporet", "Matador", "Zappa", "Huset på Christianshavn"], a: 0, c: "Skide godt, Egon! 50 år på sporet. Det var en plan, der holdt hele vejen. De er stadig kup-et over dem alle." },
    { q: "BYGGERI: Hvad åbnede endelig på Papirøen i København i 2025?", o: ["Vandkulturhuset", "Et Operahus", "En ny metro", "Et storcenter"], a: 0, c: "Nu kan man komme i vand til knæene. Det ser ikke kun godt ud på papir-et, det virker også i virkeligheden." },
    { q: "SERIE: Hvilken Netflix-gigant sendte sin 5. og sidste sæson i 2025?", o: ["Stranger Things", "Bridgerton", "The Crown", "Squid Game"], a: 0, c: "Det var en mærkelig (strange) afslutning! Verden blev vendt på hovedet. Det var ikke for tøsepiger, men monster-fedt." },
    { q: "TURISME: Hvad skulle turister betale for at komme ind i Venedig på travle dage?", o: ["5 Euro i entré", "Ingenting", "100 Euro", "Man skulle booke 1 år før"], a: 0, c: "Det koster kassen at se vandet. Turisterne må punge ud. Det er en synkende skude, hvis de ikke begrænser strømmen." },
    { q: "DANMARK: Hvilken forårs-helligdag manglede vi igen i år (2025)?", o: ["Store Bededag", "Kristi Himmelfart", "2. Pinsedag", "Grundlovsdag"], a: 0, c: "Vi måtte bede forgæves om at få den tilbage. Regeringen var ikke til at hugge eller stikke i. Nu er det slut med varme hveder." },
    { q: "BIL: Hvilket bilmærke dominerede de danske veje i 2025?", o: ["Tesla", "VW", "Toyota", "Peugeot"], a: 0, c: "De giver konkurrenterne baghjul på strøm. Salget var helt elektrisk! Det kører som smurt i olie... eller nå nej." },
    { q: "SUNDHED: Hvilken type medicin var stadig i kæmpe vækst i 2025?", o: ["Slankemedicin (Wegovy)", "Panodil", "Ipren", "Hostesaft"], a: 0, c: "Novo har fedet den, mens vi andre er skrumpet. Det er en sprøjte-god forretning." },
    { q: "GAMING: Hvilket spil ventede vi stadig på (udskudt til '26)?", o: ["GTA VI", "FIFA 26", "Sims 5", "Call of Duty"], a: 0, c: "GTA 6. Vi har ventet længere end på en offentlig bus. Rockstar kører i deres eget gear." },
    { q: "JOB: Hvad gik trenden 'Coffee Badging' ud på i 2025?", o: ["Møde ind, hente kaffe, skride hjem", "Lave god kaffe", "Spilde kaffe", "Drikke te"], a: 0, c: "En bønne for fremmøde! Man stempler ind, får sit koffein-fix, og så er man smuttet. Det er kaffe-grums i maskineriet for chefen." },
    { q: "SPORT: Hvilket land var værter for Kvindernes EM i fodbold i sommer?", o: ["Schweiz", "England", "Tyskland", "Danmark"], a: 0, c: "Det var dame-godt spillet! De gik til stålet (og bolden). Det kørte som smurt i alpe-landet." },
    { q: "REJSE: Hvad skulle vi have klar for at rejse til London fra april 2025?", o: ["En ETA (Elektronisk tilladelse)", "Et visum på papir", "Vaccinepas", "Ingenting"], a: 0, c: "Nu koster det at sige Hello. Briterne har sat en grænse. Det er slut med at komme sovende gennem kontrollen." },
    { q: "NET: Hvad insisterede Elon Musk stadig på at kalde Twitter i 2025?", o: ["X", "Y", "Z", "SpaceBook"], a: 0, c: "Elon satte et stort kryds over fuglen. Men vi pipper stadig løs. Det er lidt et X-periment, der aldrig slutter." },
    { q: "KALENDER: Hvilken ugedag faldt Juleaften på i år (2025)?", o: ["Onsdag", "Torsdag", "Fredag", "Lørdag"], a: 0, c: "En onsdags-snegl... øh jul. Det delte ugen midt over som en brunede kartoffel. Kort uge, lang and!" },
    { q: "TECH: Hvilken ny håndholdt konsol blev endelig vist frem af Nintendo?", o: ["Switch 2", "GameBoy 2025", "Wii 3", "DS 2025"], a: 0, c: "Nintendo lavede endelig et skifte (Switch 2). Vi har trykket på alle knapper for at få den. Det er game on igen!" },
    { q: "BONUS: Er vi klar til den SPICY runde?", o: ["JA!", "Nej", "Måske", "Hvad?"], a: 0, c: "Så stram ballerne, for nu gælder det trends og TikTok-sprog!" }
  ];

  // --- DATA: RUNDE 3 (SPICY TRENDS & BEGREBER 2025 - ORDSPILS EDITION) ---
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
