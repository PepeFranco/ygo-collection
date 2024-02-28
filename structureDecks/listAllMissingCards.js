const fs = require("fs");
const _ = require("lodash");

const decksFor3 = require("./cardsFor3Sets.json");

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
