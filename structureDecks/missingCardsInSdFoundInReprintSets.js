const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");

const missingData = require("./cardsNeededToComplete3Sets.json");

const missingCards = _.sortBy(
  missingData.reduce((cards, deck) => [...cards, ...deck.cards], []),
  (card) => card
);

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
  "legend of blue eyes white dragon",
  "spell ruler",
  "metal raiders",
  "pharaoh's servant",
  "invasion of chaos",
  // "structure deck: dark world",
  // "structure deck: sacred beasts",
  // "structure deck: legend of the crystal beasts",
  // "structure deck: cyber strike",
  // "structure deck: freezing chains",
  // "structure deck: mechanized madness",
  // "structure deck: spirit charmers",
  // "structure Ddeck: albaz strike",
  // "saga of blue-eyes white dragon structure deck",
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
    const currentCard = missingCards[i];
    const cardInfo = await getCardInfo(currentCard);
    const reprintSetsForCard = getReprintSetsForCard(cardInfo);
    if (reprintSetsForCard.length > 0) {
      console.log(reprintSetsForCard[0]);
      console.log(`✅ ${currentCard} can be found in ${reprintSetsForCard[0]}`);
      cardsFound.push(`${currentCard} - ${reprintSetsForCard[0]}`);
    } else {
      console.log(`❌ ${currentCard} can not be found in reprint sets`);
      cardsNotFound.push(currentCard);
    }
  }
  console.log(`Cards found: ${cardsFound.length}/${missingCards.length}`);
  console.log(
    `Cards NOT found: ${cardsNotFound.length}/${missingCards.length}`
  );
  fs.writeFile(
    "./collectionScripts/structureDecks/sdCardsInReprintSets.json",
    JSON.stringify(cardsFound, null, 3),
    function (err) {
      if (err) console.error(err);
    }
  );
};

mainFunction();
