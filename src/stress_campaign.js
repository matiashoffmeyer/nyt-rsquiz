// stress_campaign.js
export const stressData = {
    defaults: { lt: 40, hs: 7, vp: 0, penalties: 0 }, 
    modes: {
        sudden_death: {
            title: "Sudden Death",
            start_time_sec: 180,
            turn_bonus_sec: 60,
            pending_time_sec: 1,
            overtime_penalty_sec: 60, // Hvor ofte falder straffen?
            penalty_life: 2,          // Hvor meget liv koster det?
            penalty_drinks: 1,        // Hvor meget skal man drikke?
            desc: "Active player consumes their own time bank. Running out results in severe penalties."
        }
    }
};
