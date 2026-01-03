
import React, { useState, useEffect } from 'react';
import GameLobby from './GameLobby';
import UniversalCampaignManager from './UniversalCampaignManager';

const App = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState(() => {
    try {
      return localStorage.getItem('current_campaign_id');
    } catch (e) {
      return null;
    }
  });

  const handleSelect = (id) => {
    localStorage.setItem('current_campaign_id', id);
    setSelectedCampaignId(id);
  };

  const handleExit = () => {
    localStorage.removeItem('current_campaign_id');
    setSelectedCampaignId(null);
  };

  // Error Boundary-ish: Hvis der opstår en fejl, vis Lobby
  if (selectedCampaignId === 'undefined') {
      handleExit();
      return <GameLobby onSelectCampaign={handleSelect} />;
  }

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
