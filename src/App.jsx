import React, { useState, useEffect } from 'react';
import GameLobby from './GameLobby';
import UniversalCampaignManager from './UniversalCampaignManager';

const App = () => {
  // Sikker opstart: Vi læser kun localStorage én gang ved load
  const [selectedCampaignId, setSelectedCampaignId] = useState(() => {
    try {
      const stored = localStorage.getItem('current_campaign_id');
      // Hvis det er "undefined" (som tekst) eller null, så start i lobby
      if (!stored || stored === 'undefined' || stored === 'null') return null;
      return stored;
    } catch (e) {
      return null;
    }
  });

  const handleSelect = (id) => {
    // Gemmer kun hvis ID er gyldigt
    if (id) {
      localStorage.setItem('current_campaign_id', id);
      setSelectedCampaignId(id);
    }
  };

  const handleExit = () => {
    localStorage.removeItem('current_campaign_id');
    setSelectedCampaignId(null);
  };

  return (
    <>
      {selectedCampaignId ? (
        <UniversalCampaignManager 
          campaignId={selectedCampaignId} 
          onExit={handleExit} 
        />
      ) : (
        <GameLobby onSelectCampaign={handleSelect} />
      )}
    </>
  );
};

export default App;
