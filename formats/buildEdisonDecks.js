const collection = require("../data/collection.json");
const allCollectionCards = collection.map((card) => ({
  card: card["Name"],
  code: card["Code"],
}));
const _ = require("lodash");

const fs = require("fs");
const decks = [];

fs.readdirSync(__dirname + "/edisonDeckLists/").forEach((deck) => {
  decks.push(deck);
});

const deckPairs = [];

decks.map((deck) => {
  const deckContents = require(`./edisonDeckLists/${deck}`);
  const cardsInDeck = deckContents.main.concat(deckContents.extra);
  console.log("============================");
  console.log(deck);
  const cardsFound = [];
  const cardsNotFound = [];
  const collectionCopy = [...allCollectionCards];
  cardsInDeck.map((c) => {
    const cardIndex = collectionCopy.findIndex(
      (cc) => cc.card.toLowerCase() === c.toLowerCase()
    );
    // console.log(c, cardIndex);
    if (cardIndex > 0) {
      cardsFound.push(collectionCopy[cardIndex]);
      collectionCopy.splice(cardIndex, 1);
    } else {
      cardsNotFound.push(c);
    }
  });
  // console.log(
  //   `Deck 1 could be ${deck}: ${cardsFound.length}/${cardsInDeck.length} cards`
  // );

  const deckPair = {
    deck1: {
      name: deck,
      cardsFound,
      cardsNotFound,
      completed: (cardsFound.length / cardsInDeck.length) * 100,
    },
  };

  const otherDecks = decks.filter((d) => d !== deck);

  const decksWithFoundCards = otherDecks.map((od) => {
    const cardsFoundForThisDeck = [];
    const cardsNotFoundInThisDeck = [];
    const deckContents2 = require(`./edisonDeckLists/${od}`);
    const cardsInDeck2 = deckContents2.main.concat(deckContents2.extra);
    const collectionCopy2 = [...collectionCopy];
    cardsInDeck2.map((c) => {
      const cardIndex = collectionCopy2.findIndex(
        (cc) => cc.card.toLowerCase() === c.toLowerCase()
      );
      // console.log(c, cardIndex);
      if (cardIndex > 0) {
        cardsFoundForThisDeck.push(collectionCopy2[cardIndex]);
        collectionCopy2.splice(cardIndex, 1);
      } else {
        cardsNotFoundInThisDeck.push(c);
      }
    });
    return {
      name: od,
      cardsFound: cardsFoundForThisDeck,
      cardsNotFound: cardsNotFoundInThisDeck,
      completed: (cardsFoundForThisDeck.length / cardsInDeck2.length) * 100,
    };
  });

  const orderedOtherDecks = _.reverse(
    _.sortBy(decksWithFoundCards, (d) => d.completed)
  );
  const highestOtherDeck = orderedOtherDecks[0];

  // console.log(
  //   `Deck 2 could be ${highestOtherDeck.deck}: ${highestOtherDeck.cardsFound.length}/${highestOtherDeck.cardsNeeded.length} cards`
  // );
  deckPair.deck2 = highestOtherDeck;
  deckPairs.push(deckPair);
});

_.reverse(
  _.sortBy(deckPairs, (dp) => {
    return dp.deck1.completed + dp.deck2.completed;
  })
).map((dp, index) => {
  console.log(dp.deck1.completed + dp.deck2.completed);
  fs.writeFileSync(
    `./collectionScripts/formats/edisonDecksToBuild/${index} ${dp.deck1.name} and ${dp.deck2.name}.json`,
    JSON.stringify(dp, null, 3),
    () => {}
  );
});
