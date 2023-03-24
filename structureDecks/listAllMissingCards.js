const axios = require("axios");
const fs = require("fs");
const _ = require("lodash");
const csv = require("csvtojson");

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
  const cardsFor2 = decksFor2.reduce(
    (accumulator, currentValue) => [
      ...accumulator,
      ...currentValue.cards.map((cardName) => ({
        card: cardName,
        set: "2",
        deck: currentValue.deck,
      })),
    ],
    []
  );
  const cardsFor3 = decksFor3.reduce(
    (accumulator, currentValue) => [
      ...accumulator,
      ...currentValue.cards.map((cardName) => ({
        card: cardName,
        set: "3",
        deck: currentValue.deck,
      })),
    ],
    []
  );

  cardsFor2.map((card) => {
    const index = cardsFor3.findIndex(
      (card3) => card3.card === card.card && card3.deck === card.deck
    );
    cardsFor3.splice(index, 1);
  });
  console.log(`${cardsFor2.length} cards needed to complete 2 sets`);
  console.log(`${cardsFor3.length} cards needed to complete 3 sets`);

  const allCards = _.sortBy(
    [...cardsFor2, ...cardsFor3],
    ({ card, set }) => `${card}-${set}`
  );
  const lines = [`Card^Type^Deck^For Set Of`];

  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i].card;
    const cardType = await getCardType(card);
    const line = `${card}^${cardType}^${allCards[i].deck}^${allCards[i].set}`;
    lines.push(line);
    console.log("->", card);
    for (let j = i + 1; j < allCards.length; j++) {
      const nextCard = allCards[j].card;
      if (card === nextCard) {
        console.log("-->", card);
        const nextLine = `${nextCard}^${cardType}^${allCards[j].deck}^${allCards[j].set}`;
        lines.push(nextLine);
        i++;
      }
    }
  }

  fs.writeFile(
    "./collectionScripts/structureDecks/missingCards.csv",
    lines.join("\n"),
    function (err) {
      console.error(err);
    }
  );
};

mainFunction();
