import React, { useState } from 'react';
import GameLobby from './GameLobby';
import UniversalCampaignManager from './UniversalCampaignManager';

const App = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  return (
    <>
      {!selectedCampaignId ? (
        <GameLobby onSelectCampaign={(id) => setSelectedCampaignId(id)} />
      ) : (
        <UniversalCampaignManager 
          campaignId={selectedCampaignId} 
          onExit={() => setSelectedCampaignId(null)} 
        />
      )}
    </>
  );
};

export default App;
