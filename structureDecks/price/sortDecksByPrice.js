const _ = require("lodash");

const decks = require("./cardsNeededToComplete3Sets.json");

const mainFunction = async () => {
  const newDecks = _.sortBy(newDecks, (deck) => {
    return deck.cards.reduce(
      (accumulator, currentValue) => accumulator + currentValue.price,
      0
    );
  });

  // TODO: Replace fs.writeFile with fs.writeFileSync for consistency
  fs.writeFile(
    "./structureDecks/cardsNeededToComplete3Sets.json",
    JSON.stringify(sortedUniqueCardsTimes3, null, 3),
    function (err) {
      console.error(err);
    }
  );
};

mainFunction();
