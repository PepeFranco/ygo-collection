const _ = require("lodash");
const fs = require("fs");

const collection = require("../data/collection.json");

const battlePackCards = require("./bp01.json");
const allBattlePackCards = battlePackCards.map((card) => ({
  card: card.name,
  type: card.type,
}));

const battlePack2Cards = require("./bp02.json");
const allBattlePack2Cards = battlePack2Cards.map((card) => ({
  card: card.name,
  type: card.type,
}));

console.log("Cards in Battle Pack 1: ", battlePackCards.length);
console.log("Cards in Battle Pack 2: ", battlePack2Cards.length);
console.log(
  "Combined Cards in Battle Packs: ",
  battlePackCards.length + battlePack2Cards.length
);

const combinedBattlePackCards = _.uniqBy(
  [...allBattlePackCards, ...allBattlePack2Cards],
  (c) => c.card
);

const xyzMonsters = combinedBattlePackCards.filter(
  (c) => c.type === "XYZ Monster"
);

console.log(
  "Unique cards in combined Battle Pack: ",
  combinedBattlePackCards.length
);
combinedBattlePackCards.push(...xyzMonsters);
console.log(
  "Unique cards in combined Battle Pack + double XYZ monsters: ",
  combinedBattlePackCards.length
);

const cardsNotInStructureDecks = collection.filter(
  (card) => !card["In Deck"].includes("Structure Deck")
);
const allCardsNotInSd = cardsNotInStructureDecks.map((card) => ({
  card: card["Name"],
  code: card["Code"],
  sleeve: card["In Sleeve"],
  deck: card["In Deck"],
  type: card["Type"],
  attribute: card["Attribute"],
}));

const cardsInCube = allCardsNotInSd.filter(
  (c) => c.deck === "Battle Pack Cube"
);

console.log("Cards already in cube: " + cardsInCube.length);

cardsInCube.map((cc) => {
  const cardIndex = combinedBattlePackCards.findIndex(
    (uc) => uc.card.toLowerCase() === cc.card.toLowerCase()
  );

  if (cardIndex >= 0) {
    combinedBattlePackCards.splice(cardIndex, 1);
    return;
  }
  console.log("This card is in the cube but not on battle packs: ", cc.card);
});

console.log(
  "Cards in combined Battle Pack without cards already in cube: ",
  combinedBattlePackCards.length
);

const cardsToBuildCube = [];

allCardsNotInSd.map((cc) => {
  if (cc.deck === "Battle Pack Cube") {
    return;
  }

  const cardIndex = combinedBattlePackCards.findIndex((uc) => {
    return uc.card.toLowerCase() === cc.card.toLowerCase();
  });

  if (cardIndex >= 0) {
    cardsToBuildCube.push(cc);
    combinedBattlePackCards.splice(cardIndex, 1);
  }
});

console.log("=====After removal=======");
console.log(
  "Cards needed to complete battle pack collection: ",
  combinedBattlePackCards.length
);

console.log(
  "Cards owned from battle pack: ",
  cardsToBuildCube.length + cardsInCube.length
);

fs.writeFile(
  "./collectionScripts/battlePack/cardsIAlreadyOwnForBattlePacks.json",
  JSON.stringify(
    _.sortBy(cardsToBuildCube, (c) => `${c.type}`),
    null,
    3
  ),
  function (err) {
    if (err) throw err;
  }
);

fs.writeFile(
  "./collectionScripts/battlePack/cardsINeedForBattlePacks.json",
  JSON.stringify(
    _.sortBy([...combinedBattlePackCards], (c) => c.card),
    null,
    3
  ),
  function (err) {
    if (err) throw err;
  }
);
