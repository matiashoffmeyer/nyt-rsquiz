import React, { useState } from 'react';
import CampaignLobby from './CampaignLobby';
import UniversalCampaignManager from './UniversalCampaignManager';

const App = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  return (
    <>
      {!selectedCampaignId ? (
        <CampaignLobby onSelectCampaign={(id) => setSelectedCampaignId(id)} />
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
