const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");
const csv = require("csvtojson");

const getCardSets = async () => {
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardsets.php")
    .catch((e) => {
      // console.error(e);
    });

  return (result && result.data) || null;
};

const collection = _.sortBy(
  [...require("../data/collection.json")],
  (collectionCard) => collectionCard["In Deck"]
);

const banLists = _.sortBy(
  require("../data/banlists.json"),
  (l) => new Date(l.date)
);

const cardsInStructureDecks = require("./cardsInStructureDecks.json");

const getStructureDeckSets = (cardSets) => {
  return _.sortBy(
    cardSets.filter((cardSet) => {
      const setName = cardSet["set_name"].toLowerCase();
      return (
        (setName.includes("structure") || setName === "legendary hero decks") &&
        !setName.includes("special") &&
        !setName.includes("deluxe")
      );
    }),
    (sd) => sd["tcg_date"]
  ).map((cardSet) => ({
    deck: cardSet["set_name"],
    date: cardSet["tcg_date"],
  }));
};

const getClosestMatchingBanList = (date) => {
  return banLists.find((banlist, index) => {
    if (index === banLists.length - 1) {
      return true;
    }

    const banlistDateString = banlist.date;
    const banlistDate = new Date(banlistDateString);

    const nextBanlistDateString = banLists[index + 1].date;
    const nextBanlistDate = new Date(nextBanlistDateString);

    return (
      date <= banlistDate || (banlistDate <= date && date < nextBanlistDate)
    );
  });
};

const getSetsOfCardsInStructureDeck = (deck, numberOfSets) => {
  const deckWithCardsMultiplied = new Array(numberOfSets - 1)
    .fill(0)
    .reduce((accumulator) => {
      return {
        ...accumulator,
        cards: [...accumulator.cards, ...deck.cards],
      };
    }, deck);
  deckWithCardsMultiplied.cards = _.sortBy(
    deckWithCardsMultiplied.cards,
    (card) => card
  );
  return deckWithCardsMultiplied;
};

const getDeckFilteredByBanlist = (deck, banlist) => {
  const forbiddenCards = banlist.cards
    .filter(({ number, card }) => number === 0 && deck.cards.includes(card))
    .map(({ card }) => card);
  const forbiddenCardsInDeck = _.intersection(deck.cards, forbiddenCards);

  const limitedCards = banlist.cards
    .filter(({ number, card }) => number === 1 && deck.cards.includes(card))
    .map(({ card }) => card);
  const limitedCardsInDeck = _.intersection(deck.cards, limitedCards);

  const semiLimitedCards = banlist.cards
    .filter(({ number, card }) => number === 2 && deck.cards.includes(card))
    .map(({ card }) => card);
  const semiLimitedCardsInDeck = _.intersection(deck.cards, semiLimitedCards);

  const filteredSemiLimitedCards = deck.cards.reduce((accumulator, card) => {
    if (semiLimitedCardsInDeck.includes(card)) {
      const timesThisCardIsInTheDeckAlready = accumulator.filter(
        (filteredCard) => filteredCard === card
      ).length;
      if (timesThisCardIsInTheDeckAlready < 2) {
        return [...accumulator, card];
      }
    }
    return accumulator;
  }, []);

  const cardsNotInList = _.difference(
    deck.cards,
    forbiddenCards,
    limitedCards,
    semiLimitedCardsInDeck
  );

  return {
    ...deck,
    cards: _.sortBy(
      [...cardsNotInList, ...limitedCardsInDeck, ...filteredSemiLimitedCards],
      (card) => card
    ),
    forbiddenCards: forbiddenCardsInDeck,
    limitedCards: limitedCardsInDeck,
    semiLimitedCards: semiLimitedCardsInDeck,
  };
};

const removeCardsFromCollection = (deck, collection) => {
  const filteredCollection = [...collection];
  const cardsMissing = [...deck.cards];
  const cardsInCollection = [];
  deck.cards.map((card) => {
    const collectionIndex = filteredCollection.findIndex(
      (collectionCard) => collectionCard.toLowerCase() === card.toLowerCase()
    );
    if (collectionIndex >= 0) {
      filteredCollection.splice(collectionIndex, 1);
      const deckIndex = cardsMissing.findIndex(
        (deckCard) => deckCard.toLowerCase() === card.toLowerCase()
      );
      cardsMissing.splice(deckIndex, 1);
      cardsInCollection.push(card);
    }
  });
  return {
    collection: filteredCollection,
    deck: { ...deck, cardsMissing, cardsInCollection },
  };
};

const getCardsMissingForStructureDecks = async () => {
  console.log(`📚 There are ${collection.length} cards in the collection`);

  const cardSets = await getCardSets();
  const structureDeckSets = getStructureDeckSets(cardSets);
  console.log(`🔢 There are ${structureDeckSets.length} structure decks`);
  const dataForCSV = [];

  const sets = [1, 2, 3];
  sets.map((set) => {
    console.log(`=== Set of ${set} ===`);
    const collectionCopy = [...collection]
      .filter((card) => !card["In Deck"].toLowerCase().includes("edison"))
      .map(({ Name }) => Name);
    const structureDeckSet = cardsInStructureDecks.map((deck) => {
      const banlist = getClosestMatchingBanList(new Date(deck.date));
      const deckWithCardsMultiplied = getSetsOfCardsInStructureDeck(deck, set);
      return getDeckFilteredByBanlist(deckWithCardsMultiplied, banlist);
    });

    const structureDeckSetResult = [];
    structureDeckSet.reduce(
      (accumulator, structureDeck) => {
        console.log(` 🎴 Getting cards for: ${structureDeck.deck}`);
        const { collection, deck } = removeCardsFromCollection(
          structureDeck,
          accumulator.collection
        );
        accumulator.collection = collection;
        console.log(
          `  #️⃣ There are ${deck.cards.length} cards in a set of ${set}`
        );
        console.log(
          `  ✅ ${deck.cardsInCollection.length} are in the collection`
        );
        console.log(`  ❌ ${deck.cardsMissing.length} are missing`);
        dataForCSV.push({
          set,
          deck: deck.deck,
          cardsMissing: deck.cardsMissing.length,
          cardsInCollection: deck.cardsInCollection.length,
        });
        deck.cards = undefined;
        structureDeckSetResult.push({
          ...deck,
          numberOfCardsMissing: deck.cardsMissing.length,
        });
        return accumulator;
      },
      { collection: collectionCopy }
    );

    fs.writeFile(
      `./structureDecks/cardsFor${set}Sets.json`,
      JSON.stringify(structureDeckSetResult, null, 3),
      function (err) {
        // console.error(err);
      }
    );
  });
  fs.writeFile(
    `./structureDecks/missingCardsDataSet.json`,
    JSON.stringify(dataForCSV),
    function (err) {
      // console.error(err);
    }
  );
};

module.exports = {
  getCardsMissingForStructureDecks,
  getStructureDeckSets,
  getCardSets,
  getClosestMatchingBanList,
  getSetsOfCardsInStructureDeck,
  getDeckFilteredByBanlist,
  getCardSets,
  removeCardsFromCollection,
};
