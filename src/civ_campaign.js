// src/civ_campaign.js

export const civData = {
    title: "Civ Mode",
    engine: "civ",
    defaults: {
        lt: 10,
        hs: 6,
        vp: 0
    },
    // NYT: Begrænsning på antal spillere
    playerLimits: { min: 4, max: 4 },
    roleData: {}, // Tom da Civ ikke bruger roller
    
    coreRules: `
Winning the campaign:
The player with the most VPs wins the campaign. If tied for VPs, the player with the most recent win counts highest. 

Achieving one of the following victory conditions ends the battle (except battle 4 and 5).

Victory conditions:
 Military: Be the only player left in the battle. 
 Economic: Control 6 or more non basic lands. 
 Scientific: Control artifacts with a total CMC of 10 or more. 
 Cultural: Control a permanent of each colour (a hybrid or multicolour card can count for any of its colour but not as multiple colours).

Player Ranking:
Highest number of VPs rank highest.

Shortcuts: Battles 1 and/or 2 can be skipped. 

Mulligans:
If you want to mulligan your starting hand, you may shuffle your hand and draw a new hand, then, before looking at it, put one card from your hand on the bottom of your library. For each time you mulligan, put an extra card on the bottom of your library.

Draw-out:
If, at any point, you can’t draw a card from your library you may instead sacrifice a non-land permanent. If you don’t, you lose 2 life.

Stalemate:
The moment 2 players are left in any battle, put a timer dice to 1. Increase it at the beginning of turns. When it reaches 10 (in consensus only, you’re allowed to change this number during the campaign), the battle ends and the winner is the player with the most lives, if tied, the most non-land permanents in play, if tied, the most cards on hand, if tied, the most cards left in his library.

Board game rules:
 At the start of a battle, the starting player may choose one of the available starting tiles, place it as he chooses and place his player marker in an empty field on it. 
 Ensuing starting players may choose an available starting tile to start in, in the same manner. (Some battles require players to start on their own tile).
 You may only attack players adjacent to you on the board. 
 When you deal combat damage to a player, you may move him one field away from you, to an empty field that is not all water. Then look at his hand, you may take one of his cards in hand and gain ownership (Do this maximum once pr turn pr opponent).
 Empty fields are fields without players or markers on them. 
 You can’t enter a field occupied by another player. 
 Pay x mana to move x fields on the board. Activate only with sorcery speed.
 Players can’t enter water fields (only water) unless they control a creature with flying or islandwalk, and they cannot end their movement in a water field. 
 Mountain fields (only mountain) cost double movement to enter. 
 Players may spend one movement to open a facedown tile. Place it lining up with the adjacent tiles in a random direction. Then place markers on any Village-, Culture-, Cultist- and Relic fields.
 At the end of turn, remove all faceup tiles with no players on them. Then replace them with new facedown tiles. 

Field rewards:
 Villages: When a player enters a village marker, he can’t move further that turn, may add a basic land to his hand (gaining ownership) and removes the Village marker from the field. 
 Culture Fields: When a player enters a Culture marker, he can’t move further that turn, removes the Culture marker from the field and draws a card. As the card is drawn, he may reveal it, then cast it without paying its mana cost.
 Cultist Fields: When a player enters a Cultist marker, he can’t move further that turn, may add a dual land to his hand (gaining ownership), is attacked by D6 random tokens in an extra attack step and removes the Cultist marker from the field.
 Relics: When a player enters a Relic marker, he can’t move further that turn, may add a card from target library to his hand (gaining ownership) and removes the Relic marker from the field.

Setup:
Shuffle 2 non mono boosters with 20 basic- (4 of each colour) and 20 non basic lands. 
Divide into 12 piles of ten cards. 
Booster draft the 12 piles (4 at a time).
Minimum deck size at Battle 1 start: 20 cards (increases 3 cards per battle).
Players can’t freely add basic lands to their decks during the campaign, only through drafting, stealing from other players or village fields. 
Players may discard any number of cards from their deck before the first battle.
    `,

    timeline: [
        { 
            title: "Battle 1, Soft start", 
            type: "battle", 
            desc: "2x2 tiles, players start in a corner each.\n\nThe winner of the battle may add any number of cards from Skraldespanden to his deck, the remaining players may then add up to one card each in the same manner in random order." 
        },
        { 
            title: "Battle 2, Camping", 
            type: "battle", 
            desc: "3x3 tiles, players start in a corner each.\n\nPlayers may start camping in their upkeep, they end the camping in their next upkeep.\nA camping player can’t move.\nIn a camping player’s first main phase, he may add the mana symbols on his field and surrounding empty octagon fields to his mana pool (choose one of the colours for hybrid tiles) and place an exhaustion marker on your tile. Exhausted tiles can’t be camped on or harvested mana from.\nWhen a camping player is attacked, attacking creatures gain menace and +1/+1 until end of turn.\n\nThe winner gains +1 HS.\nWinchester draft a booster\n#107 (Marketplace)" 
        },
        { 
            title: "Battle 3, Global Warming", 
            type: "battle", 
            desc: "2x3 tiles, all start faceup (2 north, 2 equator and 2 south).\nAll players start in an equator tile.\nThe lowest faceup tile is south, the one above south is equator and the one above equator is  north. (This means that if both original south tiles are facedown, the equator becomes the new south).\nNew tiles can be revealed to the north as long as there isn’t already a revealed north tile.\nAt the end of a player's second main phase, he loses 3 life and creatures under his control gain 2 -1/-1 counters if he is in a south tile.\n\nThe winner gains +5 LT.\nSolomon draft a booster. Players pass the divided piles to their teammate in battle 4.  Players may discard any number of the new cards." 
        },
        { 
            title: "Battle 4, Capture the Flag", 
            type: "battle", 
            desc: "3x3 tiles each team start in the corner tile opposite the other team.\nPlayers are divided into two teams, with the leading player and the player with the last ranked player on one team.\nThe battle is played as all-vs-all.\nEach team places a flag marker on a non-all water field on their starting tile. A tile with a flag marker can’t be turned facedown.\nWhen a player enters the field with the enemy flag, his team wins and both players on the winning team gain a VP.\nPlayers can’t win Scientific, Cultural or Economic victories in this battle.\nWhen a player is dealt damage on a tile that isn’t his starting tile, he is moved to an empty field on his starting tile of his choice.\nIf a player is dealt damage while standing on his own flag and can’t be moved back one field, he is instead moved to the nearest available field of the active player’s choice.\n\nThe winners may look at a loser’s library and steal one card.\nWinston draft a booster\nPlayers may put any number of cards from their library in Skraldespanden." 
        },
        { 
            title: "Battle 5, Going Nuclear", 
            type: "battle", 
            desc: "3x3 tiles, all players start in the central tile.\nThis battle continues until a Military victory is achieved. The battle continues if other win conditions are achieved. Each victory condition can only be achieved once.\nPay 6 mana and sacrifice an artifact: Choose a board tile, exile all creatures controlled by players on that board tile and remove any field markers on the tile. (Activate only with sorcery speed)" 
        }
    ]
};
