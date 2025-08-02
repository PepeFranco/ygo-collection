const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");

const missingData = require("../cardsFor3Sets.json");

const missingCards = _.sortBy(
  missingData.reduce(
    (cards, deck) => [
      ...cards,
      ...deck.cardsMissing.map((cardMissing) => ({
        card: cardMissing,
        deck: deck.deck,
      })),
    ],
    []
  ),
  ({ card }) => card
);

console.log(missingCards[0]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getCardInfo = async (cardName) => {
  sleep(100);
  const name = `${cardName.trim()}`;
  // console.log("==================");
  // console.log(name);
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardinfo.php?name=" + name)
    .catch((e) => {
      console.error(e);
    });

  // console.log(result);
  return (result && result.data.data[0]) || null;
};

const reprintSets = [
  // "legend of blue eyes white dragon",
  // "spell ruler",
  // "metal raiders",
  // "pharaoh's servant",
  // "invasion of chaos",
  "Battles of Legend: Chapter 1",
  "Maze of Millennia",
  "Valiant Smashers",
  "25th Anniversary Rarity Collection",
  "25th Anniversary Tin: Dueling Heroes Mega Pack",
  "Legendary Duelists: Soulburning Volcano",
  "Wild Survivors",
  "maze of memories",
];

const getReprintSetsForCard = (cardInfo) => {
  if (cardInfo && cardInfo["card_sets"]) {
    const setsForCard = cardInfo["card_sets"]
      .reduce(
        (setNames, currentSet) => [...setNames, currentSet["set_name"]],
        []
      )
      .map((cardSet) => cardSet.toLowerCase());
    const commonSets = _.intersection(reprintSets, setsForCard);
    return commonSets;
  }
  return [];
};

const mainFunction = async () => {
  const cardsFound = [];
  const cardsNotFound = [];
  for (let i = 0; i < missingCards.length; i++) {
    const currentCard = missingCards[i].card;
    const cardInfo = await getCardInfo(currentCard);
    const reprintSetsForCard = getReprintSetsForCard(cardInfo);
    if (reprintSetsForCard.length > 0) {
      console.log(reprintSetsForCard[0]);
      console.log(
        `✅ ${currentCard} <${missingCards[i].deck}> - ${reprintSetsForCard[0]}`
      );
      cardsFound.push(
        `${currentCard} <${missingCards[i].deck}> - ${reprintSetsForCard[0]}`
      );
    } else {
      console.log(`❌ ${currentCard} not found in reprint sets`);
      cardsNotFound.push(currentCard);
    }
  }
  console.log(`Cards found: ${cardsFound.length}/${missingCards.length}`);
  console.log(
    `Cards NOT found: ${cardsNotFound.length}/${missingCards.length}`
  );
  const cardsSortedBySet = _.sortBy(cardsFound, (card) => card.split("-")[1]);
  // TODO: Replace fs.writeFile with fs.writeFileSync for consistency
  fs.writeFile(
    "./structureDecks/sdCardsInReprintSets.json",
    JSON.stringify(cardsSortedBySet, null, 3),
    function (err) {
      if (err) console.error(err);
    }
  );
};

mainFunction();
