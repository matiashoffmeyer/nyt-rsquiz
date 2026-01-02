import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sword, Scroll, Users, ArrowRight } from 'lucide-react';

// Genbrug din Supabase setup her, eller importér den hvis du har den i en separat fil.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CampaignLobby = ({ onSelectCampaign }) => {
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

  if (loading) return <div className="h-screen bg-stone-950 flex items-center justify-center text-amber-600 font-serif">Loading Chronicles...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-6">
      <header className="mb-8 border-b border-stone-800 pb-4">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
          CAMPAIGN SELECT
        </h1>
        <p className="text-stone-500 text-sm mt-1">Choose your destiny</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <div 
            key={camp.id}
            onClick={() => onSelectCampaign(camp.id)}
            className="group relative bg-[#111] border border-stone-800 hover:border-amber-600/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:shadow-amber-900/20 active:scale-95"
          >
            {/* Engine Badge */}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] uppercase tracking-wider text-stone-400 border border-stone-800">
              {camp.engine} Engine
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-stone-200 group-hover:text-amber-500 transition-colors mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                {camp.title}
              </h2>
              
              {/* Quick Stats Preview */}
              <div className="space-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <Users size={12} />
                  <span>{camp.active_state.players?.length || 0} Players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scroll size={12} />
                  <span>{camp.static_config.timeline?.length || 0} Battles Planned</span>
                </div>
              </div>

              <div className="mt-6 flex items-center text-amber-700 group-hover:text-amber-500 text-sm font-bold uppercase tracking-widest gap-2">
                Enter Game <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </div>
            </div>
            
            {/* Color Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 group-hover:from-amber-700 group-hover:via-red-600 group-hover:to-amber-700 transition-all"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignLobby;
