const _ = require("lodash");
const fs = require("fs");

const setsNOTToKeep = [
  "Speed Duel: Arena of Lost Souls",
  "Speed Duel: Attack from the Deep",
];

const setsToKeep = ["speed duel"];

const decksToKeep = ["edison"];

const collection = _.sortBy(
  [...require("./data/collection.json")],
  (collectionCard) => collectionCard["In Deck"]
);

const markCardsToKeep = async () => {
  collection.map((cardInCollection) => {
    cardInCollection["Keep"] = "FALSE";
  });

  console.log(`=> Marking sets to keep`);
  collection.map((card) => {
    const cardAlreadyMarkedToKeep = card["Keep"] === "TRUE";
    const cardInSetToKeep = setsToKeep.reduce((accumulator, current) => {
      return accumulator || card["Set"].toLowerCase().includes(current);
    }, false);
    const cardInSetNotToKeep = setsNOTToKeep.reduce(
      (accumulator, current) => accumulator || card["Set"] === current,
      false
    );

    if (card["Name"] === "Buster Blader") {
      console.log(card["Name"]);
      console.log(card["Set"]);
      console.log({
        cardAlreadyMarkedToKeep,
        cardInSetToKeep,
        cardInSetNotToKeep,
      });
      console.log(
        `Marking to keep ${
          !cardAlreadyMarkedToKeep && cardInSetToKeep && !cardInSetNotToKeep
        }`
      );
    }

    if (!cardAlreadyMarkedToKeep && cardInSetToKeep && !cardInSetNotToKeep) {
      card["Keep"] = "TRUE";
    }
  });
  console.log(
    `==> Marked`,
    collection.filter((card) => card["Keep"] === "TRUE").length,
    `cards to keep`
  );

  console.log(`=> Marking decks to keep`);
  decksToKeep.map((deckToKeep) => {
    collection.map((card) => {
      const cardAlreadyMarkedToKeep = card["Keep"] === "TRUE";
      if (
        !cardAlreadyMarkedToKeep &&
        card["In Deck"].toLowerCase().includes(deckToKeep)
      ) {
        card["Keep"] = "TRUE";
      }
    });
  });
  console.log(
    `==> Marked`,
    collection.filter((card) => card["Keep"] === "TRUE").length,
    `cards to keep`
  );

  console.log(`=> Marking structure deck cards to keep`);
  const structureDecks = require("./structureDecks/cardsInStructureDecksEnhanced.json");

  const allCardsInStructureDecks = structureDecks
    .map((deck) => deck.cards)
    .flat();

  allCardsInStructureDecks.map((card) => {
    const foundCard = collection.find((cardInCollection) => {
      if (cardInCollection["Keep"] === "TRUE") {
        return false;
      }
      if (cardInCollection["Name"] === card) {
        return true;
      }
    });
    if (foundCard) {
      foundCard["Keep"] = "TRUE";
    }
  });

  console.log(
    `==> Marked`,
    collection.filter((card) => card["Keep"] === "TRUE").length,
    `cards to keep`
  );

  fs.writeFile(
    "./data/collection.json",
    JSON.stringify(collection, null, 3),
    function (err) {
      if (err) console.error(err);
    }
  );
};

markCardsToKeep();