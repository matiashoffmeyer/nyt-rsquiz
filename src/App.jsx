import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Play, Trophy, Monitor, ChevronRight, CheckCircle2, Zap, Trash2, RefreshCcw, AlertTriangle, FastForward } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MainLayout = ({ children, quizMode }) => (
  <div className={`min-h-screen text-slate-100 font-sans transition-colors duration-500 flex flex-col ${quizMode.includes('test') ? 'bg-slate-900 border-t-8 border-amber-500' : 'bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900'}`}>
    {quizMode.includes('test') && <div className="bg-amber-500 text-black font-black text-center text-xs py-1">TEST MODE {quizMode.includes('2') ? '2' : '1'} (DEV)</div>}
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
  
  // --- DATA: TEST RUNDE 1 ---
  const testQuestions1 = [
    { q: "TEST 1: Virker knapperne?", o: ["Ja", "Nej", "Måske", "Ved ikke"], a: 0, c: "Hvis du kan læse dette, så virker koden! Det er ren magi." },
    { q: "TEST 2: Hvad hedder Matias' kat?", o: ["Plet", "Mina", "Speck", "Felix"], a: 2, c: "Speck styrer showet." }
  ];

  // --- DATA: TEST RUNDE 2 ---
  const testQuestions2 = [
    { q: "RUNDE 2 TEST: Er vi videre?", o: ["Ja da", "Nej", "Hvad?", "Måske"], a: 0, c: "Velkommen til runde 2! Det virker sgu." },
    { q: "RUNDE 2 TEST: Hvad drikker vi?", o: ["Vand", "Mælk", "Champagne", "Gift"], a: 2, c: "Skål! 🥂" }
  ];

  // --- DATA: RUNDE 1 (30 SPØRGSMÅL - ORIGINAL) ---
  const realQuestions1 = [
    // SPORT & BEGIVENHEDER
    { q: "Hvem vandt Tour de France i sommeren 2025?", o: ["Jonas Vingegaard", "Tadej Pogacar", "Remco Evenepoel", "Primoz Roglic"], a: 0, c: "Vingegaard smadrede dem på Mont Ventoux. Der var slet ingen tvivl i år – Glyngøres stolthed er tilbage på tronen!" },
    { q: "Hvilken dansk festival meldte 'Alt Udsolgt' på rekordtid (4 minutter) i 2025?", o: ["Roskilde Festival", "Smukfest", "NorthSide", "Copenhell"], a: 1, c: "Smukfest billetterne røg hurtigere end man kan drikke en fadøl i Bøgeskoven. Serverne nedsmeltede totalt." },
    { q: "Hvilket land vandt Eurovision Song Contest 2025?", o: ["Sverige", "Frankrig", "Italien", "Ukraine"], a: 2, c: "Italien vandt med en rocksang, der fik Måneskin til at ligne et kirkekor. Det var vildt!" },
    { q: "Hvad blev resultatet af den store 'Storebælts-lukning' i januar 2025?", o: ["Ingen mælk i Kbh", "Total trafikprop", "Færgerne kom tilbage", "Gratis bro i en uge"], a: 1, c: "Køen strakte sig helt til Odense. Folk holdt Nytår i deres biler på motorvejen." },
    
    // POLITIK & SAMFUND
    { q: "Hvilken ministerpost blev nedlagt i 2025 som led i 'effektivisering'?", o: ["Kirkeministeren", "Digitaliseringsministeren", "Ældreministeren", "Nordisk Samarbejde"], a: 1, c: "AI overtog jobbet. Det viste sig, at ChatGPT var bedre til at lave PowerPoint-slides end ministeriet." },
    { q: "Hvad hedder den nye bydel i København, der officielt åbnede første etape i 2025?", o: ["Lynetteholm", "Jernbanebyen", "Nordhavn Vest", "Enghave Brygge"], a: 0, c: "Jordpåfyldningen er endelig synlig over vandet. Kritikerne kalder det stadig 'Mudderøen', men nu kan man gå på den." },
    { q: "Hvilken valuta ramte sin laveste kurs nogensinde overfor den danske krone i 2025?", o: ["Svenske kroner", "Norske kroner", "US Dollar", "Pund"], a: 0, c: "Det er blevet latterligt billigt at købe slik i Malmø. En svensk krone koster nu det samme som en 5-øre." },
    { q: "Hvem holdt årets mest omdiskuterede nytårstale ved indgangen til 2025?", o: ["Mette Frederiksen", "Kong Frederik X", "Lars Løkke", "Dronning Margrethe"], a: 1, c: "Kong Frederik glemte manuskriptet og improviserede i 3 minutter om 'fede tider'. Folk elskede det!" },

    // KULTUR & GOSSIP
    { q: "Hvilket dansk kendis-par gik fra hinanden i foråret 2025 og skabte forside-storm?", o: ["Remee & Mathilde", "Christopher & Cecilie", "Medina & Malo", "Nicklas Bendtner & Ny flamme"], a: 1, c: "Det knuste tusindvis af teenagehjerter (og et par voksenhjerter). De er dog stadig 'gode venner' på Instagram." },
    { q: "Hvad var årets mest streamede danske sang i 2025?", o: ["Stor Mand 2", "Tobias Rahim (Ny single)", "Gilli - 'Hjem'", "Artigeardit - 'Fri'"], a: 1, c: "Tobias Rahim smed tøjet igen i videoen. Det virker åbenbart hver gang." },
    { q: "Hvilken gammel dansk TV-serie fik et 'reboot' på Netflix i 2025?", o: ["Rejseholdet", "Matador", "Taxa", "Klovn"], a: 2, c: "Taxa vendte tilbage! Nu med elektriske biler og endnu mere drama på Nørrebro." },
    { q: "Hvem vandt 'Vild med Dans' 2025?", o: ["En YouTuber", "En håndboldspiller", "En politiker", "En skuespiller"], a: 0, c: "De unge stemte som gale. Dommerne var sure, men SMS-stemmerne løj ikke." },

    // TECH & VIDENSKAB
    { q: "Hvilken funktion fjernede Apple fra iPhone 17 (2025-modellen)?", o: ["Ladeporten", "Volumeknapperne", "Frontkameraet", "Siri"], a: 0, c: "Nu er det kun trådløs opladning. Held og lykke, hvis du glemmer din MagSafe-puck!" },
    { q: "Hvad blev kåret som 'Årets Ord 2025' af Dansk Sprognævn?", o: ["AI-skam", "Klimatristhed", "Skærmfri", "Multiprise"], a: 0, c: "Følelsen af at bruge AI til at skrive en bryllupstale og blive opdaget. Det hedder 'AI-skam'." },
    { q: "Hvilken planet sendte NASA succesfuldt en ny type drone til i 2025?", o: ["Mars", "Venus", "Jupiter", "Saturn"], a: 1, c: "Venus! Dronen overlevede syre-skyerne i hele 4 timer. Det er ny rekord." },
    { q: "Hvad kostede en liter benzin i gennemsnit i sommeren 2025?", o: ["11 kr.", "14 kr.", "17 kr.", "20 kr."], a: 2, c: "17 kroner. Og folk brokkede sig stadig over, at elbiler er for dyre." },

    // BLANDET GODT
    { q: "Hvilken dansk supermarkedskæde annoncerede, at de stopper med at sælge tobak i 2025?", o: ["Netto", "Rema 1000", "Coop 365", "Lidl"], a: 1, c: "Rema 1000 tog teten. Ingen smøger til discountpriser længere!" },
    { q: "Hvilken farve var 'Årets Farve' i modebilledet 2025?", o: ["Limegrøn", "Elektrisk Blå", "Fersken", "Dyb Lilla"], a: 3, c: "Alt var lilla. Tøj, tasker, selv biler. Prince ville have været stolt." },
    { q: "Hvad skete der med Parken (stadion) i 2025?", o: ["Nyt navn", "Udvidelse godkendt", "Nyt græstæppe", "Taget blæste af"], a: 1, c: "Endelig! Der bliver plads til 50.000 mennesker. Naboerne er allerede sure over larmen." },
    { q: "Hvilken dansk by blev kåret til 'Europas Kulturhovedstad' (uformelt) af CNN?", o: ["Aarhus", "Odense", "Aalborg", "Esbjerg"], a: 1, c: "H.C. Andersen byen rykkede! Letbanen virkede faktisk, og turisterne væltede ind." },

    // DYR & NATUR
    { q: "Hvad blev lovpligtigt for alle udekatte i 2025?", o: ["At bære refleks", "GPS-halsbånd", "At være i snor", "Obligatorisk kastrering"], a: 1, c: "GPS-tracking blev et krav. Nu kan du se præcis hvor mange mus (og naboens haver) Misser besøger." },
    { q: "Hvilken stor begivenhed fandt sted i København Zoo i 2025?", o: ["De fik en Enhjørning", "Pandaerne fik endelig en unge", "Isbjørnene stak af", "Elefanterne lærte at male"], a: 1, c: "Miraklet skete! Efter årevis med bambus-dates og akavet stemning, kom der en lille sort-hvid uldtot." },
    { q: "En spækhugger skabte kaos i en dansk havn i sommeren 2025. Hvad gjorde den?", o: ["Spiste en kajak", "Væltede en sejlbåd", "Stjal fisk fra kuttere", "Sang opera"], a: 1, c: "Den 'legede' med roret indtil båden kæntrede. Forsikringsselskabet troede ikke på forklaringen." },
    { q: "Hvilken invasiv art blev det 'nye store problem' for sommerhusejere i 2025?", o: ["Vaskebjørne", "Kongekobraer", "Dræbersnegle 2.0", "Papegøjer"], a: 0, c: "De ser søde ud, men de tømmer din skraldespand og flytter ind på loftet. Vaskebjørnen er kommet for at blive." },
    { q: "Hvilken fisk vendte talstærkt tilbage til Øresund, så der nu arrangeres 'safari' efter den?", o: ["Hvidhajen", "Blåfinnet Tun", "Sværdfisk", "Månefisk"], a: 1, c: "Tunen er tilbage! Kæmpe fisk på 300 kg springer op af vandet med udsigt til Sverige." },
    { q: "For at mindske CO2, begyndte danske landmænd i 2025 at fodre køer med...?", o: ["Hvidløg", "Mynte", "Tang fra Vestkysten", "Gammelt brød"], a: 2, c: "Tang i foderet fjerner bøvserne. Mælken smager heldigvis ikke af havvand." },
    { q: "Hvilket insekt var den største plage på Roskilde Festival 2025?", o: ["Asiatisk Gedehams", "Skovflåt med vinger", "Tigermyg", "Kæmpe-Biller"], a: 0, c: "Også kendt som 'Dræber-hvepsen'. Den er stor, sur og den elsker lunken Tuborg." },
    { q: "Bævere har længe været i Jylland, men hvad gjorde de i 2025?", o: ["Byggede dæmning over E45", "Blev set i København", "Udryddede odderen", "Lærte at svømme rygcrawl"], a: 1, c: "En bæver-familie blev spottet i Utterslev Mose! Ingen ved, hvordan de kom over broen (eller tog færgen)." },
    { q: "Hvad blev kåret til 'Danmarks Nationaldyr' i en ny stor afstemning i 2025?", o: ["Svanen (genvalg)", "Pindsvinet", "Egernet", "Grævlingen"], a: 1, c: "Pindsvinet vandt folkets hjerter. Svanen var for arrogant og hvæsede for meget ad vælgerne." },
    { q: "Hvilken hunderace eksploderede i popularitet i 2025?", o: ["Gravhunden", "Golden Retriever", "Grand Danois", "En robot-hund"], a: 0, c: "Pølsehunden er overalt! De passer perfekt i en lille københavner-lejlighed og på Instagram." },

    // AFSLUTTENDE SPØRGSMÅL (GENERELT)
    { q: "Hvem scorede det afgørende mål i Champions League finalen 2025?", o: ["Haaland", "Mbappé", "Vinicius Jr.", "Højlund"], a: 1, c: "Mbappé gjorde det for Real Madrid. Det var kedeligt, men effektivt." },
    { q: "Hvad hed den storm, der ramte Danmark i oktober 2025?", o: ["Bodil", "Gorm", "Ingolf", "Jytte"], a: 2, c: "Ingolf var ikke så slem som frygtet, men havemøblerne fløj alligevel en tur til Sverige." },
    { q: "Hvilket socialt medie lukkede endegyldigt i 2025?", o: ["X (Twitter)", "Snapchat", "Threads", "Pinterest"], a: 0, c: "Elon trak stikket. Det hele blev til en betalingsmur, og så skred brugerne." },
    { q: "Hvor mange Michelin-stjerner fik restaurant 'Jordnær' i 2025 guiden?", o: ["1", "2", "3", "Mistede alle"], a: 2, c: "De fik den 3. stjerne! Det er nu officielt en af verdens bedste restauranter." },
    { q: "Hvem blev ny vært på 'X-Factor' i 2025?", o: ["Sofie Linde (retur)", "Melvin Kakooza", "Petra Nagel", "Martin Johannes Larsen"], a: 1, c: "Melvin er overalt, og nu også på X-Factor. Han gør det nu meget godt." },
    { q: "Hvor holdt Lukas Graham sin 'Comeback' koncert i 2025?", o: ["Royal Arena", "Boxen", "Christiania", "Refshaleøen"], a: 2, c: "Back to the roots på Staden. Der var røg i luften, og det var ikke kun fra røgmaskinerne." },
    { q: "Hvilken drik afløste 'Aperol Spritz' som sommerens hit i 2025?", o: ["Limoncello Spritz", "Hugo", "Espresso Tonic", "White Port & Tonic"], a: 0, c: "Limoncello er det nye sort. Surt, sødt og farligt let at drikke." },
    { q: "Hvad var navnet på DR's store julekalender i 2025?", o: ["Tidsrejsen 3", "Nissernes Ø", "Julefeber 2", "Gammel Jul"], a: 2, c: "Mere julefeber til folket! Børnene elskede det, de voksne savnede Pyrus." }
  ];

  // --- DATA: RUNDE 2 (20 NYE SPØRGSMÅL - EKSTRA) ---
  const realQuestions2 = [
    { q: "MAD: Hvad hed den 'superfood' alle spiste i 2025?", o: ["Kaktus-juice", "Fårekyllinge-mel", "Tang-bacon", "Svampe-kaffe"], a: 3, c: "Kaffe lavet på svampe. Det smager af jord, men hipsterne elsker det." },
    { q: "RUMMET: Hvad fandt man på Månen i 2025?", o: ["Vand i store mængder", "Aliens", "En gammel cola-dåse", "Guld"], a: 0, c: "Kæmpe underjordiske søer. Nu skal vi bare finde ud af, hvordan vi får det ned i en sodavandsmaskine." },
    { q: "SPROG: Hvilket jysk udtryk kom i ordbogen i 2025?", o: ["Træls", "Mojn", "Kavt", "Pyt-knap"], a: 2, c: "'Kavt' er nu officielt dansk. Det beskriver perfekt stemningen, når man møder sin eks i Netto." },
    { q: "FILM: Hvem spillede den nye James Bond i 2025?", o: ["Aaron Taylor-Johnson", "Idris Elba", "Tom Holland", "Mads Mikkelsen"], a: 0, c: "Han fik rollen! Han ser godt ud i smoking, men kan han drikke Martinis?" },
    { q: "TEKNOLOGI: Hvad kan din mikrobølgeovn nu i 2025?", o: ["Flyve", "Bestille pizza", "Scanne kalorier", "Spille musik"], a: 2, c: "Den tæller kalorierne i din lasagne, mens den varmer den. Verdens mest deprimerende feature." },
    { q: "DANMARK: Hvilken by fik endelig sin letbane til at virke i 2025?", o: ["Odense", "Aarhus", "København (Ring 3)", "Aalborg"], a: 2, c: "Ring 3 letbanen kører! Den larmer lidt, men den kører faktisk til tiden (nogle gange)." },
    { q: "MODE: Hvad kom tilbage på mode for mænd i 2025?", o: ["Høje hatte", "Monokler", "Overskæg", "Lange kapper"], a: 3, c: "Kapper er in! Folk ligner en blanding af Batman og en Harry Potter-karakter på Strøget." },
    { q: "SPORT: Hvilken sportsgren blev OL-disciplin i 2025?", o: ["E-sport (CS:GO)", "Padel Tennis", "Dødvægtløft", "Øl-bowling"], a: 1, c: "Padel er nu OL-sport. Alle mellemledere i Danmark jubler og køber nyt udstyr." },
    { q: "NATUREN: Hvad skete der med Gudenåen i foråret 2025?", o: ["Den tørrede ud", "Den gik over sine bredder (igen)", "Den frøs til is", "Den skiftede farve"], a: 1, c: "Oversvømmelse igen. Silkeborg var kortvarigt Nordens Venedig." },
    { q: "MUSIK: Hvilket legendarisk band blev genforenet (som hologrammer) i 2025?", o: ["Gasolin'", "Oasis", "The Beatles", "Spice Girls"], a: 0, c: "Kim Larsen som hologram i Parken. Det var smukt, men også lidt uhyggeligt." },
    { q: "HVERDAG: Hvad blev forbudt i offentlig transport i 2025?", o: ["At tale i telefon", "At spise kebab", "Højttaler-musik", "At have sko på"], a: 2, c: "Endelig! Bøde på 1000 kr. for at spille TikTok-videoer uden høretelefoner." },
    { q: "GAMING: Hvad kostede den nye PlayStation 6, da den udkom i 2025?", o: ["4.000 kr.", "6.000 kr.", "8.500 kr.", "12.000 kr."], a: 2, c: "8.500 kr. Og du skal stadig betale ekstra for at spille online. Av." },
    { q: "USA: Hvad indførte USA som noget nyt i 2025?", o: ["Gratis tandlæge", "4 dages arbejdsuge", "Skat på robotter", "Forbud mod TikTok"], a: 3, c: "TikTok røg. Influencere græd på åben skærm (på Instagram i stedet)." },
    { q: "BIZARRE NEWS: En mand i Jylland blev berømt for at samle på...?", o: ["Navleuld", "Gamle Nokiaer", "Tomme mælkekartoner", "Regnvand"], a: 1, c: "Han havde 5.000 stk Nokia 3310. Han bygger nu et hus af dem." },
    { q: "DRKULTUR: Hvem blev ny dommer i 'Den Store Bagedyst' 2025?", o: ["En AI-robot", "Dronning Mary", "En fransk konditor", "Casper Christensen"], a: 2, c: "En sur franskmand, der hader alt med fondant. Det er fantastisk TV." },
    { q: "VEJRET: Sommeren 2025 slog rekord i...?", o: ["Regn", "Solskinstimer", "Hagl", "Vindstød"], a: 0, c: "Det regnede i 40 dage i træk. Roskilde Festival var ét stort mudderbad." },
    { q: "ARBEJDSLIV: Hvad blev det nye store frynsegode i 2025?", o: ["Gratis massage", "Søvn-pod på kontoret", "Ubegrænset ferie", "Betalt terapi"], a: 1, c: "Du kan nu tage en lur i arbejdstiden. Chefen kalder det 'Power Napping Optimization'." },
    { q: "ROYALT: Hvad fik Prins Christian i 20-års fødselsdagsgave af Folketinget?", o: ["En ø", "En hest", "Et jagtgevær", "En elcykel"], a: 2, c: "Et håndlavet jagtgevær. De Gamle Værdier lever stadig." },
    { q: "TREND: Hvad erstattede 'Cold Plunge' (isbad) som sundhedstrend i 2025?", o: ["Sauna-dragter", "Sand-badning", "Lyd-terapi", "At skrige i skoven"], a: 1, c: "At blive begravet i varmt sand. Det kradser alle vegne, men det skulle være sundt." },
    { q: "SIDSTE SPØRGSMÅL (RUNDE 2): Skal vi tage en runde 3?", o: ["JA!", "NEJ, jeg skal tisse", "Kun hvis der er shots", "Jeg vil hjem"], a: 0, c: "Desværre venner, koden stopper her. Men baren er stadig åben! SKÅL!" }
  ];

  // Logik til at vælge spørgsmål
  let activeData = [];
  if (gameState.quiz_mode === 'test') activeData = testQuestions1;
  else if (gameState.quiz_mode === 'test_2') activeData = testQuestions2;
  else if (gameState.quiz_mode === 'real') activeData = realQuestions1;
  else if (gameState.quiz_mode === 'real_2') activeData = realQuestions2;
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
    if (!window.confirm("Er du klar til RUNDE 2? Dette nulstiller pointene for den nye runde!")) return;
    
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

    const currentBase = gameState.quiz_mode.includes('test') ? 'test' : 'real';
    const nextMode = currentBase + '_2'; 
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

  return (
    <MainLayout quizMode={gameState.quiz_mode}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
        <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            {gameState.quiz_mode.includes('2') ? "RUNDE 2 🚀" : "QUIZ'25"}
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
            {gameState.quiz_mode.includes('2') ? "Klar til Runde 2?" : "Lobbyen er åben!"}
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
             {gameState.quiz_mode.includes('2') && <div className="text-amber-300 font-bold mt-2">RUNDE 2 AFSLUTTET</div>}
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
                {/* KNAPPEN TIL RUNDE 2 (VISES KUN HVIS VI IKKE ALLEREDE ER I RUNDE 2) */}
                {!gameState.quiz_mode.includes('2') && (
                    <button onClick={startMoreQuestions} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl animate-pulse hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
                         MERE!!! <FastForward fill="currentColor" />
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
