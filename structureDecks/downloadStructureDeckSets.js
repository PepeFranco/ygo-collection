const {
  getCardSets,
  getStructureDeckSetNames,
} = require("./getCardsMissingForStructureDecks");
const axios = require("axios");
const fs = require("fs");
const { Promise } = require("bluebird");

const getCardsInStructureDeck = async (structureDeckName) => {
  const result = await axios
    .get(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${structureDeckName}`
    )
    .catch((e) => {
      // console.error(e);
    });

  return (result && result.data && result.data.data) || null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mainFunction = async () => {
  const cardSets = await getCardSets();
  console.log(`There are ${cardSets.length} sets`);

  const structureDeckNames = getStructureDeckSetNames(cardSets);
  console.log(`There are ${structureDeckNames.length} structure decks`);

  const cardsInStructureDeckSet = {};
  await Promise.each(structureDeckNames, async (structureDeckName) => {
    const cardsInStructureDeck = await getCardsInStructureDeck(
      structureDeckName
    );
    const cardNames = cardsInStructureDeck.map((card) => card["name"]);
    cardsInStructureDeckSet[structureDeckName] = cardNames;
    console.log(cardsInStructureDeck);
    await sleep(1000);
  });

  fs.writeFile(
    "./structureDecks/cardsInStructureDecks.json",
    JSON.stringify(cardsInStructureDeckSet, null, 3),
    function (err) {
      // console.error(err);
    }
  );
};

mainFunction();
