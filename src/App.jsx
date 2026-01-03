import React, { useState, useEffect } from 'react';
import GameLobby from './GameLobby';
import UniversalCampaignManager from './UniversalCampaignManager';

const App = () => {
  // Vi tjekker localStorage ved start for at se, om vi var midt i et spil
  const [selectedCampaignId, setSelectedCampaignId] = useState(() => {
    return localStorage.getItem('current_campaign_id') || null;
  });

  const handleSelect = (id) => {
    localStorage.setItem('current_campaign_id', id);
    setSelectedCampaignId(id);
  };

  const handleExit = () => {
    localStorage.removeItem('current_campaign_id');
    setSelectedCampaignId(null);
  };

  return (
    <>
      {!selectedCampaignId ? (
        <GameLobby onSelectCampaign={handleSelect} />
      ) : (
        <UniversalCampaignManager 
          campaignId={selectedCampaignId} 
          onExit={handleExit} 
        />
      )}
    </>
  );
};

export default App;

