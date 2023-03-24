const _ = require("lodash");
const fs = require("fs");

const collection = require("../data/collection.json");
const decks = [];
fs.readdirSync(__dirname + "/goatDeckLists/").forEach((deck) => {
  decks.push(deck);
});

const goatCards = [];
decks.map((d) => {
  const cardList = require(`./goatDeckLists/${d}`);
  goatCards.push(...cardList);
});

const uniquegoatCards = _.uniq(goatCards);
console.log(uniquegoatCards);

const allCollectionCards = collection.map((card) => ({
  card: card["Name"],
  code: card["Code"],
  set: card["Set"],
  deck: card["In DecK"],
  sleeve: card["In Sleeve"],
  attribute: card["Attribute"],
  type: card["Type"].toLowerCase().includes("monster")
    ? "Monster"
    : card["Type"],
}));

console.log("All cards in collection: ", allCollectionCards.length);
console.log("Unique goat cards:    ", uniquegoatCards.length);

const cardsIAlreadyOwn = [];

allCollectionCards.map((cc) => {
  const cardIndex = uniquegoatCards.findIndex(
    (uc) => uc.toLowerCase() === cc.card.toLowerCase()
  );

  if (cardIndex >= 0) {
    cardsIAlreadyOwn.push(cc);
    return;
  }
});

const sortedOwnedCards = _.groupBy(cardsIAlreadyOwn, (c) => c.location);

const cards = {};
for (const [key, value] of Object.entries(sortedOwnedCards)) {
  cards[key] = _.sortBy(value, (c) => `${c.type}-${c.attribute}-${c.card}`);
  console.log(`Cards in ${key}: ${value.length}`);
}

fs.writeFile(
  "./collectionScripts/formats/goatOwnedCards.json",
  JSON.stringify(cards, null, 3),
  function (err) {
    console.error(err);
  }
);
