import collection from "./data/collection.json";
import path from "path";
import fs from "fs";
import _, { add } from "lodash";
import { CollectionRow } from "./data/data.types";
import { debug } from "./debug";

const hatDate = new Date(2014, 6, 8);

const collectionCopy = _.sortBy([...collection], ["Name"]);

const uniqueCards = collectionCopy.reduce(function (accumulator, current) {
  if (accumulator[current["Name"]]) {
    accumulator[current["Name"]].copies++;
    return accumulator;
  }
  accumulator[current["Name"]] = {
    copies: 1,
    Name: current["Name"],
    "Earliest Date": current["Earliest Date"],
  };
  return accumulator;
}, {});

const hatCards = _.filter(uniqueCards, function (collectionCard) {
  const [date, month, year] = collectionCard["Earliest Date"].split("/");
  const collectionCardDate = new Date(year, month - 1, date);
  return collectionCardDate < hatDate;
});

const cardsToRemove = hatCards.reduce(function (accumulator, current) {
  if (current.copies > 6) {
    accumulator[current["Name"]] = current.copies - 6;
  }
  return accumulator;
}, {});

const postHatCards = _.filter(uniqueCards, function (collectionCard) {
  const [date, month, year] = collectionCard["Earliest Date"].split("/");
  const collectionCardDate = new Date(year, month - 1, date);
  return collectionCardDate >= hatDate;
});

const cardsInSD = {};
const structureDecksDir = path.join(__dirname, "./data/structureDecks");
const files = fs
  .readdirSync(structureDecksDir)
  .filter((f) => f.endsWith(".json"));

for (const file of files) {
  const cards: string[] = JSON.parse(
    fs.readFileSync(path.join(structureDecksDir, file), "utf-8"),
  );
  cards.map(function (card) {
    if (cardsInSD[card]) {
      cardsInSD[card].decks++;
    } else {
      cardsInSD[card] = { decks: 1 };
    }
  });
}

const cardsMissing = {};
const postHatCardsToRemove = postHatCards.reduce(function (
  accumulator,
  current,
) {
  const cardName = current["Name"];
  if (cardsInSD[cardName]) {
    const maxCopies = cardsInSD[cardName].decks > 1 ? 6 : 3;
    if (current.copies > maxCopies) {
      accumulator[cardName] = current.copies - maxCopies;
    }
    if (current.copies < maxCopies) {
      cardsMissing[cardName] = maxCopies - current.copies;
    }
  } else {
    accumulator[cardName] = current.copies;
  }
  return accumulator;
},
{});

fs.writeFileSync(
  path.join(__dirname, "./cardsToRemove.json"),
  JSON.stringify([cardsToRemove, postHatCardsToRemove], null, 3),
);

fs.writeFileSync(
  path.join(__dirname, "./cardsToGet.json"),
  JSON.stringify(cardsMissing, null, 3),
);
