import React, { useState } from 'react';
import GameLobby from './GameLobby';
import UniversalCampaignManager from './UniversalCampaignManager';

const App = () => {
  // 1. SIKKER INITIALISERING
  // Vi tjekker localStorage én gang ved start.
  // Hvis den finder "undefined" eller snavs, returnerer den bare null (Lobbyen) uden at crashe.
  const [selectedCampaignId, setSelectedCampaignId] = useState(() => {
    try {
      const storedId = localStorage.getItem('current_campaign_id');
      // Tjek om det er et gyldigt ID (ikke "undefined" strengen eller null)
      if (!storedId || storedId === 'undefined' || storedId === 'null') {
        return null;
      }
      return storedId;
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
