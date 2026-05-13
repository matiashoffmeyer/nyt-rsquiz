// src/stagging_campaign.js

export const staggingData = {
    title: "Stagging It Up",
    engine: "rpg",
    defaults: {
        lt: 20,
        hs: 7,
        vp: 0
    },
    // NYT: Begrænsning på antal spillere
    playerLimits: { min: 4, max: 5 },
    coreRules: `
**Setup:** 4-5 players, 5 battles, 6 boosters and a land booster. HS 6, LT 15. Dual land market is 2 x types (20) = 40 cards.

**Bidding & Roles:** At the beginning of the campaign players secretly bid a number to subtract from their LT. Players choose a non-King-role to gain, starting with the highest bidder and then in descending order. Only one player can have a role at a time.

**King Role:** When a player wins a battle, he gains the King role for the next battle.

**Role Selection:** At the beginning of a battle, all non-King players may gain an available role, in descending ranking order.

**Dead Players:** After a player is dead in battle 1-4 other players can’t gain more XP in that battle (except rewards based on the outcome of the battle).

**Levels:** Level 1 less than 10 xp, Level 2 10 xp, Level 3 20 xp. Players can’t have more than 20 xp or less than 0.

**Ranking:** Player ranking is determined by the number of VPs, if tied, the most recent wins count highest. Gain a VP by winning a battle. The winner of the campaign is the winner of the final battle.

**Mulligans:** If you want to mulligan your starting hand, you may shuffle your hand and draw a new hand, then, before looking at it, put one card from your hand on the bottom of your library. For each time you mulligan, put an extra card on the bottom of your library.

**Draw-out:** If, at any point, you can’t draw a card from your library you may instead sacrifice a non-land permanent. If you don’t, you lose 2 life.

**Stalemate:** The moment 2 players are left in any battle, put a timer dice to 1. Increase it at the beginning of turns. When it reaches 10 (in consensus only, you’re allowed to change this number during the campaign), the battle ends and the winner is the player with the most lives, if tied, the most non-land permanents in play, if tied, the most cards on hand, if tied, the most cards left in his library.
    `,
    timeline: [
        { title: "Battle 1: Repentance", type: "battle", desc: "All vs All, you may pay life instead of mana for your spells." },
        { title: "Post-Battle 1", type: "post", desc: "Bid i det sure løg #101 for each loser.\nQuilt draft a Booster." },
        { title: "Battle 2: Grand Melee", type: "battle", desc: "Creatures have haste and attack each turn if able." },
        { title: "Post-Battle 2", type: "post", desc: "Workout Session #114 (all buffs up)\nHousmann draft a booster. #107" },
        { title: "Battle 3: Hunters Loge", type: "battle", desc: "#59 Pre-battle, stack 3 OG’s facedown, when the top OG is defeated, the next OG is turned face up, it's cycle number (X) is equal to the cycle number of the defeated OG, and it becomes the new OG’s turn. The 3 OGs are treated as a single, combined OG.\nAs long as there is an OG in play, players may block for each other.\nUntil the first OG dies, players draw their cards from the library of the player to their left.\nAs long as the second OG is in play, players can’t pay mana for their own spells or abilities, but other players can transfer them mana from their manapools.\nAs long as the third OG is in play, each time the first player takes his turn, players must vote to skip their main phases or attack step until the first player's next turn. The top voted phases are skipped. If the vote is tied, both main phases and attack steps are skipped.\nIf the OG wins there is no King in the next battle.\nIf you cause an OG to die, gain a VP. If you die while an OG is in play, lose 5 XP and discard 3 random non-basic land cards." },
        { title: "Post-Battle 3", type: "post", desc: "Mobile Hammock: Minesweeper draft a land booster.\n#107" },
        { title: "Battle 4: Spikeball", type: "battle", desc: "All vs. All\nFlip a coin to decide the starting attack direction (left or right).\nStart of game: Shuffle 2 markers into each player's deck, when a marker is drawn, the attack direction changes. (The marker is shuffled back into the deck and the player draws another card).\nThe winner is the first player to eliminate the player in his attack direction (or when said player dies for another reason)." },
        { title: "Post-Battle 4", type: "post", desc: "oNator gains the Fool role, HS = 7, LT = 20, VP = 0.\nThen do #105\nDinner a´la card:\nShuffle two random dual-boosters together, then divide them in half. One half becomes an Unsealed Dual Booster. The other half is divided into piles equal to the number of players. Reveal 1 pile. Players choose in turn (descending ranking order: 1, 2, 3, 4, 5) to add one to their deck (you may skip your turn), until each player has had a turn. Then the pile is replaced with a new pile and the process is repeated with a new starting player (descending by rank: 2, 1, 3, 4, 5 Then: 3, 1, 2, 4, 5 and so on) until all players have had a turn with the starting pick.\nRemaining cards (of the drafted half of the two dual boosters) go in Skraldespanden.\nAny of the chosen cards may be added to your starting hand in the following battle. (Players draw cards for the starting hand, minus the number they chose to put in the starting hand)\nPlayers may, in ranking order, gain an available role or switch role with a non-King player of lower player ranking." },
        { title: "Battle 5: Heidi's Bierbar", type: "battle", desc: "All vs All\nIn each player’s end step, he gains his choice of 2 Drunk- or 2 Poison counters.\nWhen a permanent, spell or ability you control causes a player to lose, you may gain his role.\nLast remaining player wins the campaign, if all the last players are killed at the same time (for example by a player-owned OG), the tie breaker is VP, then randomly." }
    ],
    roleData: {
        'Doctor': {
            abilities: [
                "When a creature enters play under your control, you may remove a counter from a permanent or player.", 
                "Gain a Drunk counter: Target creature gains Metaxa until end of turn.", 
                "Creatures under your control have Infect. At the end of your turn: Proliferate."
            ],
            reward: "When one or more creatures die during your turn, gain 1 xp."
        },
        'Monk': {
            abilities: [
                "Discard a card and pay (2) (sorcery speed) (max once pr turn): Place a Heresy counter on target player. Attacking creatures have +X/+0 where X is the number of Heresy counters on the defending player. When a player attacks a player with one or more Heresy counters, he draws a card.", 
                "You may activate abilities of OGs and planeswalkers under your control twice per turn (as if the OG had two turns, so not the same ability twice if used on an OG).", 
                "Tap 3 creatures under your control (sorcery speed): Put a random OG in play under your control. Sacrifice it if one or more of the tapped creatures become untapped. You can’t control more than one OG, this way, at a time."
            ],
            reward: "Whenever your life total changes, gain 1 xp."
        },
        'Smith': {
            abilities: [
                "Artifact spells in your hand cost (1) less for every level you have.", 
                "Equipped creatures under your control have Vigilance, Trample and Reach.", 
                "Metalcraft (If you control 3 or more artifacts) you may discard a card to create a token that is a copy of target artifact. (Sorcery speed only and max once pr turn)."
            ],
            reward: "When an artifact enters play under your control, gain 1 xp."
        },
        'Knight': {
            abilities: [
                "(1) discard a card to create a 1/2 Green horse creature token with Haste (Sorcery speed only).", 
                "Equipped creatures you control have Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)", 
                "Battalion (When you attack with 3 or more creatures): You may have a creature under your control fight target creature."
            ],
            reward: "Whenever one or more creatures under your control deal damage, gain 1 XP."
        },
        'Fool': {
            abilities: [
                "Spells you cast on your opponent's turn cost (1) less.", 
                "If you caused the King to die, you may gain his role for the rest of the battle.", 
                "Creature spells in your hand have Ninjutsu equal to their CMC. (Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)"
            ],
            reward: "Whenever you target an opponent or a permanent under his control with a spell or ability, gain 1 xp (max once pr turn)"
        },
        'King': {
            abilities: [
                "Creatures under your control have +1/+1 for each of your levels.", 
                "You may play an extra land during your turn and lands you control also have ‘T: Add one mana of any colour.’", 
                "You draw an extra card in your draw step."
            ],
            reward: "Every third time another player gains xp you gain 1 xp."
        }
    }
};
