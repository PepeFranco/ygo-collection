const _ = require("lodash");
const fs = require("fs");

const collection = require("../data/collection.json");
const decks = [];
fs.readdirSync(__dirname + "/edisonDeckLists/").forEach((deck) => {
  decks.push(deck);
});

const edisonCards = [];
decks.map((d) => {
  const cardList = require(`./edisonDeckLists/${d}`);
  cardList.main.map((c) => edisonCards.push(c));
  cardList.side.map((c) => edisonCards.push(c));
  cardList.extra.map((c) => edisonCards.push(c));
});

const uniqueEdisonCards = _.uniq(edisonCards);
console.log(uniqueEdisonCards);

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
console.log("Unique Edison cards:    ", uniqueEdisonCards.length);

const cardsIAlreadyOwn = [];

allCollectionCards.map((cc) => {
  const cardIndex = uniqueEdisonCards.findIndex(
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
  "./collectionScripts/formats/edisonOwnedCards.json",
  JSON.stringify(cards, null, 3),
  function (err) {
    console.error(err);
  }
);
