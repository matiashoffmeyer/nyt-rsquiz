import React from 'react';

const Stepper = ({ label, value, onChange, min = 0, suffix = "", icon: Icon, color = "text-white" }) => (
    <div className="bg-black/40 p-2 rounded border border-stone-800 flex flex-col items-center justify-between h-20">
        <label className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1 mb-1 select-none whitespace-nowrap">
            {Icon && <Icon size={10} />}
            {label}
        </label>
        <div className="flex items-center w-full justify-between gap-1">
            <button 
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-8 h-8 bg-stone-800 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 active:scale-95 transition-all shadow-md border border-stone-700 shrink-0 touch-manipulation select-none"
            >
                -
            </button>
            <div className="flex-grow flex items-center justify-center relative min-w-0">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) onChange(val);
                        else onChange(0);
                    }}
                    className={`font-mono text-lg font-black ${color} bg-transparent text-center w-full outline-none focus:bg-white/10 rounded px-1 transition-colors appearance-none`}
                />
                {suffix && <span className="text-[10px] text-stone-600 absolute right-0 pointer-events-none select-none hidden sm:inline">{suffix}</span>}
            </div>
            <button 
                onClick={() => onChange(value + 1)}
                className="w-8 h-8 bg-stone-800 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 active:scale-95 transition-all shadow-md border border-stone-700 shrink-0 touch-manipulation select-none"
            >
                +
            </button>
        </div>
    </div>
);

export default Stepper;
