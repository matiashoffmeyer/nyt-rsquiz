export const styles = `
@keyframes floatUp {
    0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; }
    20% { transform: translate(-50%, 0px) scale(1.2); opacity: 1; text-shadow: 0 0 10px rgba(74, 222, 128, 0.8); }
    100% { transform: translate(-50%, -60px) scale(1); opacity: 0; }
}
.anim-float { animation: floatUp 2s ease-out forwards; }

/* SKJUL STANDARD BROWSER PILE */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none !important; 
  margin: 0 !important; 
  display: none !important;
}
input[type=number] {
  -moz-appearance: textfield !important;
  appearance: none !important;
}
`;

export const STEP_INFO = [
    { id: 'UNTAP',  label: 'UNTAP',         group: 'BEGINNING',   burnsClock: true }, 
    { id: 'UPKEEP', label: 'UPKEEP',        group: 'BEGINNING',   burnsClock: true },
    { id: 'DRAW',   label: 'DRAW STEP',     group: 'BEGINNING',   burnsClock: true },
    { id: 'MAIN1',  label: 'MAIN 1',        group: 'PRE-COMBAT',  burnsClock: true },
    { id: 'BEC',    label: 'BEGIN CMBT',    group: 'COMBAT',      burnsClock: true },
    { id: 'ATK',    label: 'ATTACKERS',     group: 'COMBAT',      burnsClock: true },
    { id: 'BLK',    label: 'BLOCKERS',      group: 'COMBAT',      burnsClock: true },
    { id: 'DMG',    label: 'DAMAGE',        group: 'COMBAT',      burnsClock: false }, 
    { id: 'EC',     label: 'END CMBT',      group: 'COMBAT',      burnsClock: true },
    { id: 'MAIN2',  label: 'MAIN 2',        group: 'POST-COMBAT', burnsClock: true },
    { id: 'END',    label: 'END STEP',      group: 'ENDING',      burnsClock: true },
    { id: 'CLEAN',  label: 'CLEANUP',       group: 'ENDING',      burnsClock: false } 
];

export const LAZY_SKIPS = ['UPKEEP', 'DRAW', 'BEC', 'EC', 'END', 'CLEAN'];

// Her er variablen der drillede - nu eksporteret korrekt
export const containerClass = "fixed inset-0 z-50 bg-[#0a0a0a] text-gray-200 overflow-hidden flex flex-col h-dvh w-screen font-sans";
