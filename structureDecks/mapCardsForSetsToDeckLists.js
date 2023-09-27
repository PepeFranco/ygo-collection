const cardsForSets = require("./cardsFor3Sets.json");
const cardsInStructureDecks = require("./cardsInStructureDecks.json");
const {
  getClosestMatchingBanList,
  getSetsOfCardsInStructureDeck,
  getDeckFilteredByBanlist,
} = require("./getCardsMissingForStructureDecks");
const fs = require("fs");

const structureDeckSet = cardsInStructureDecks.map((deck) => {
  const banlist = getClosestMatchingBanList(new Date(deck.date));
  const deckWithCardsMultiplied = getSetsOfCardsInStructureDeck(deck, 3);
  return getDeckFilteredByBanlist(deckWithCardsMultiplied, banlist);
});

// fs.writeFile(
//   `./structureDecks/cardsInStructureDecksEnhanced.json`,
//   JSON.stringify(structureDeckSet),
//   function (err) {
//     // console.error(err);
//   }
// );

structureDeckSet.map((structureDeck) => {
  console.log(`"${structureDeck.deck}",`);

  fs.writeFile(
    `./formats/structure/${structureDeck.deck}`,
    structureDeck.cards.join("\n"),
    function (err) {
      // console.error(err);
    }
  );
});

// console.log(structureDeckSet[0]);
