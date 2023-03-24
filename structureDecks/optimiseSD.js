const _ = require("lodash");
const fs = require("fs");

const collection = [...require("../data/collection.json")];
const sets = require("../data/sets.json");
const structureDecks = _.sortBy(
  sets.filter((s) => s["set_name"].toLowerCase().includes("structure deck")),
  (s) => s["tcg_date"]
);
// console.log(structureDecks);

const cardsThatCanBeMoved = [];
const cardsInSDs = collection.filter((c) =>
  c["In Deck"].toLowerCase().includes("structure deck")
);

const collectionCopy = [...collection];

const correctCards = [];
const incorrectCards = [];

cardsInSDs.map((c) => {
  const cardIsInItsOwnDeck =
    c["In Deck"].toLowerCase() === c["Set"].toLowerCase();
  if (cardIsInItsOwnDeck) {
    correctCards.push(c);
    return;
  }

  incorrectCards.push(c);

  const correctCardInCollectionIndex = collectionCopy.findIndex(
    (co) =>
      co["Name"] === c["Name"] &&
      co["Set"] === c["In Deck"] &&
      co["Set"] !== co["In Deck"]
  );

  if (correctCardInCollectionIndex >= 0) {
    const cardToMove = collectionCopy[correctCardInCollectionIndex];
    cardsThatCanBeMoved.push(cardToMove);
    collectionCopy.splice(correctCardInCollectionIndex, 1);
  }
});

const makeStringLength = (string, length) => {
  if (string.length > length) return string;
  const l = length - string.length;
  return `${string}${new Array(l).join(" ")}`;
};

let str = "";
_.reverse(_.sortBy(cardsThatCanBeMoved, (c) => `${c["In Deck"]}`)).map((c) => {
  const name = makeStringLength(c["Name"], 30);
  const code = makeStringLength(` (${c["Code"]}) `, 15);
  const deck = makeStringLength(`(${c["In Deck"] || ""})`, 50);
  const newDeck = makeStringLength(`could go in deck ${c["Set"]}`, 0);
  str += `${name}${code}${deck}${newDeck}\n`;
  // console.log(str);
});

fs.writeFileSync(
  "./collectionScripts/structureDecks/optimisedSDMoves.txt",
  str
);

const correctLength = correctCards.length + cardsThatCanBeMoved.length;
const incorrectLength = incorrectCards.length - cardsThatCanBeMoved.length;
console.log("Correct cards", correctLength);
console.log("Incorrect cards", incorrectLength);
console.log(
  "Percentage of cards in SD decks that are from the correct set: ",
  (correctLength * 100) / (correctLength + incorrectLength),
  "%"
);

let str2 = "";
const sortedIncorrectCards = _.sortBy(
  incorrectCards,
  (c) => `${c["In Deck"]}-${c["Name"]}`
);
sortedIncorrectCards.map((c) => {
  const name = makeStringLength(c["Name"], 40);
  const code = makeStringLength(` (${c["Code"]}) `, 20);
  const deck = makeStringLength(`(${c["In Deck"]})`, 50);
  str2 += `${name}${code}${deck}\n`;
});

fs.writeFileSync("./sdCardsNotInFromCorrectSet.txt", str2);
