const axios = require("axios");
const fs = require("fs");
const _ = require("lodash");

const decksFor2 = require("./cardsFor2Sets.json");
const decksFor3 = require("./cardsFor3Sets.json");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCardType = async (cardName) => {
  await sleep(100);
  const name = `${cardName.trim()}`;
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardinfo.php?name=" + name)
    .catch((e) => {});

  const data = (result && result.data && result.data.data[0]) || null;
  if (data === null) {
    return null;
  }
  return data.type;
};

const mainFunction = async () => {
  const cardsFor3 = decksFor3.reduce(
    (accumulator, currentValue) => [
      ...accumulator,
      ...currentValue.cardsMissing.map((cardName) => ({
        card: cardName,
        deck: currentValue.deck,
      })),
    ],
    []
  );

  console.log(`${cardsFor3.length} cards needed to complete 3 sets`);

  const allCards = _.sortBy(cardsFor3, ({ card, set }) => `${card}-${set}`);
  const lines = [`Card^Deck`];

  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i].card;
    // const cardType = await getCardType(card);
    const line = `${card}^${allCards[i].deck}`;
    lines.push(line);
    console.log("->", card);
  }

  fs.writeFile(
    "./structureDecks/missingCards.csv",
    lines.join("\n"),
    function (err) {
      console.error(err);
    }
  );
};

mainFunction();
