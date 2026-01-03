import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sword, Scroll, Users, ArrowRight, Crown, Dna } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GameLobby = ({ onSelectCampaign }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, engine, active_state, static_config')
        .order('created_at', { ascending: true });
      
      if (data) setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center text-amber-600 font-serif">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <Sword className="animate-spin-slow" size={32}/>
        <span>Loading Chronicles...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-6 relative overflow-hidden">
      {/* Background Effect (Samme som i Manager) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <style>{`@keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .nebula-bg { background: linear-gradient(-45deg, #1a0b0b, #2e1010, #0f172a, #000000); background-size: 400% 400%; animation: nebula 15s ease infinite; }`}</style>
        <div className="w-full h-full nebula-bg"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="mb-10 border-b border-stone-800 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600 tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Campaign Select
            </h1>
            <p className="text-stone-500 text-sm mt-1 flex items-center gap-2">
              <Scroll size={14}/> Choose your destiny
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div 
              key={camp.id}
              onClick={() => onSelectCampaign(camp.id)}
              className="group relative bg-[#111]/80 backdrop-blur-sm border border-stone-800 hover:border-amber-600/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:shadow-amber-900/10 active:scale-95 flex flex-col"
            >
              {/* Engine Badge */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] uppercase tracking-wider text-stone-400 border border-stone-800 flex items-center gap-1">
                {camp.engine === 'rpg' ? <Crown size={10} className="text-yellow-500"/> : <Dna size={10} className="text-blue-500"/>}
                {camp.engine === 'rpg' ? 'RPG Engine' : 'Standard'}
              </div>

              <div className="p-6 flex-grow">
                <h2 className="text-2xl font-bold text-stone-200 group-hover:text-amber-500 transition-colors mb-3 leading-tight" style={{ fontFamily: 'Cinzel, serif' }}>
                  {camp.title}
                </h2>
                
                {/* Quick Stats Preview */}
                <div className="space-y-2 text-xs text-stone-500 mt-4">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-stone-600" />
                    <span>{camp.active_state?.players?.length || 0} Players Active</span>
                  </div>
                  {camp.static_config?.timeline && (
                    <div className="flex items-center gap-2">
                      <Sword size={12} className="text-stone-600" />
                      <span>{camp.static_config.timeline.length} Battles Planned</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-black/20 border-t border-stone-800/50 flex justify-between items-center group-hover:bg-amber-900/5 transition-colors">
                <span className="text-[10px] uppercase tracking-widest text-stone-600 group-hover:text-amber-500/80">
                  ID: {camp.id}
                </span>
                <div className="flex items-center text-stone-400 group-hover:text-amber-500 text-xs font-bold uppercase tracking-widest gap-2">
                  Enter <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                </div>
              </div>
              
              {/* Color Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 group-hover:from-amber-700 group-hover:via-red-600 group-hover:to-amber-700 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
