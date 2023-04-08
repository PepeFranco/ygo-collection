const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");

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
  const cardsWithoutForbidden = _.difference(deck.cards, forbiddenCards);

  const limitedCards = banlist.cards
    .filter(({ number, card }) => number === 1 && deck.cards.includes(card))
    .map(({ card }) => card);
  const limitedCardsInDeck = _.intersection(deck.cards, limitedCards);
  const cardsWithoutLimited = _.difference(cardsWithoutForbidden, limitedCards);

  const semiLimitedCards = banlist.cards
    .filter(({ number, card }) => number === 2 && deck.cards.includes(card))
    .map(({ card }) => card);
  const semiLimitedCardsInDeck = _.intersection(deck.cards, semiLimitedCards);
  const cardsWithoutSemiLimited = _.difference(
    cardsWithoutLimited,
    semiLimitedCardsInDeck
  );

  return {
    ...deck,
    cards: _.sortBy(
      [
        ...cardsWithoutSemiLimited,
        ...limitedCardsInDeck,
        ...semiLimitedCardsInDeck,
        ...semiLimitedCardsInDeck,
      ],
      (card) => card
    ),
    forbiddenCards,
    limitedCards,
    semiLimitedCards,
  };
};

const removeCardsFromCollection = (deck, collection) => {
  const filteredCollection = [...collection];
  const missingCardsInStructureDeck = [...deck.cards];
  deck.cards.map((card) => {
    const collectionIndex = filteredCollection.findIndex(
      (collectionCard) => collectionCard.toLowerCase() === card.toLowerCase()
    );
    if (collectionIndex >= 0) {
      filteredCollection.splice(collectionIndex, 1);
      const deckIndex = missingCardsInStructureDeck.findIndex(
        (deckCard) => deckCard.toLowerCase() === card.toLowerCase()
      );
      missingCardsInStructureDeck.splice(deckIndex, 1);
    }
  });
  return {
    collection: filteredCollection,
    deck: { ...deck, cards: missingCardsInStructureDeck },
  };
};

const getCardsMissingForStructureDecks = async () => {
  console.log(`📚 There are ${collection.length} cards in the collection`);

  const cardSets = await getCardSets();
  const structureDeckSets = getStructureDeckSets(cardSets);
  console.log(`🔢 There are ${structureDeckSets.length} structure decks`);

  const sets = [1, 2, 3];
  sets.map((set) => {
    const collectionCopy = [...collection]
      .filter((card) => !card["In Deck"].toLowerCase().includes("edison"))
      .map(({ Name }) => Name);
    const structureDeckSet = cardsInStructureDecks.map((deck) => {
      const banlist = getClosestMatchingBanList(deck.date);
      const deckWithCardsMultiplied = getSetsOfCardsInStructureDeck(deck, set);
      return getDeckFilteredByBanlist(deckWithCardsMultiplied, banlist);
    });

    const structureDeckSetResult = [];
    structureDeckSet.reduce(
      (accumulator, structureDeck) => {
        const { collection, deck } = removeCardsFromCollection(
          structureDeck,
          collectionCopy
        );
        accumulator.collection = collection;
        structureDeckSetResult.push({
          ...deck,
          cardsMissing: deck.cards.length,
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
