import { CollectionRow } from "../data/collection.types";
import collection from "../data/collection.json";
import fs from "node:fs";
import path from "node:path";
import _ from "lodash";

const setsToKeep = [];

const sdFiles = fs
  .readdirSync(path.join(__dirname, "../formats/structure"))
  .filter((fileName) => fileName.includes(".txt"));

let collectionCopy: CollectionRow[] = [...collection];
console.log(`There are ${collectionCopy.length} cards in collection`);

// Remove SDs
const removeCard = (cardName: string) => {
  const index = collectionCopy.findIndex(
    (card) =>
      card["Name"].toString().trim().toLocaleLowerCase() ==
      cardName.trim().toLocaleLowerCase()
  );
  if (index > -1) {
    collectionCopy.splice(index, 1);
  }
};
sdFiles.map((structureDeck) => {
  console.log(`-->Removing cards from ${structureDeck}`);
  const cardsInDeck = fs
    .readFileSync(path.join(__dirname, "../formats/structure", structureDeck))
    .toString();
  cardsInDeck.split("\n").map((cardName) => removeCard(cardName));
  console.log(`There are ${collectionCopy.length} cards in collection`);
});
console.log("-> After removing cards from structure decks");
console.log(`There are ${collectionCopy.length} cards in collection`);

// Remove Speed duel
collectionCopy = collectionCopy.filter(
  (card) => card["Is Speed Duel Legal"] !== "Yes"
);

console.log("-> After removing cards from speed duel");
console.log(`There are ${collectionCopy.length} cards in collection`);

// Remove cards for HAT, Edison & Goat
collectionCopy = collectionCopy.filter(
  (card) => new Date(card["Earliest Date"]) >= new Date("2014-07-08")
);

console.log("-> After removing cards from HAT, Edison & Goat");
console.log(`There are ${collectionCopy.length} cards in collection`);

// Remove commons & rares
// collectionCopy = collectionCopy.filter(
//   (card) => card["Rarity"] !== "Common" && card["Rarity"] !== "Rare"
// );

console.log("-> After removing commons and rares");
console.log(`There are ${collectionCopy.length} cards in collection`);

collectionCopy = _.sortBy(collectionCopy, "Rarity");
fs.writeFileSync(
  path.join(__dirname, "../data/cardsForTrade.json"),
  JSON.stringify(collectionCopy)
);
