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

const getStructureDeckSetNames = (cardSets) => {
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
  ).map((cardSet) => cardSet["set_name"]);
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

const getDeckFilteredByBanlist = (deck, banlist) => deck;

const getCardsMissingForStructureDecks = async () => {
  console.log(`📚 There are ${collection.length} cards in the collection`);

  const cardSets = await getCardSets();
  const structureDeckSetNames = getStructureDeckSetNames(cardSets);
  console.log(`🔢 There are ${structureDeckSetNames.length} structure decks`);

  const structureDeckSetOfOne = cardsInStructureDecks;
  const structureDeckSetOfTwo = getSetsOfCardsInStructureDeck(
    cardsInStructureDecks,
    2
  );
  const structureDeckSetOfThree = getSetsOfCardsInStructureDeck(
    cardsInStructureDecks,
    3
  );

  const structureDeckSetOfTwoMissing = [];
  const structureDeckSetOfThreeMissing = [];
  structureDeckSetNames.map((structureDeck) => {
    structureDeckSetOfTwoMissing.push({ deck: structureDeck, cards: [] });
    structureDeckSetOfThreeMissing.push({ deck: structureDeck, cards: [] });
  });

  structureDeckSetNames.map((structureDeck) => {
    const deckInCollection = structureDeckSetOfOne.find(
      (sd) => sd.deck === structureDeck
    );

    const uniqueCardsInDeck = _.uniq(deckInCollection.cards);
    const repeatedCards = _.filter(deckInCollection.cards, (val, i, iteratee) =>
      _.includes(iteratee, val, i + 1)
    );
    const repeatedCardsTwice = _.filter(repeatedCards, (val, i, iteratee) =>
      _.includes(iteratee, val, i + 1)
    );
    const cardsNotRepeated = _.difference(
      deckInCollection.cards,
      repeatedCards
    );

    const cardsNotRepeatedTwice = _.difference(
      deckInCollection.cards,
      repeatedCardsTwice
    );
    console.log("-------------------------");
    console.log(
      `${deckInCollection.deck} has ${deckInCollection.cards.length} cards`
    );

    const thisReleaseDate = new Date(
      cardSets.find((set) => set["set_name"] === structureDeck)["tcg_date"]
    );
    const thisBanlist = getClosestMatchingBanList(thisReleaseDate);
    // console.log(`Closest matching banlist date: ${thisBanlist.date}`);
    const limitedCardsInThisDeck = thisBanlist.cards
      .filter(
        (banlistCard) =>
          uniqueCardsInDeck.includes(banlistCard.card) &&
          banlistCard.number === 1
      )
      .map((banlistCard) => banlistCard.card);

    const semiLimitedCardsInThisDeck = thisBanlist.cards
      .filter(
        (banlistCard) =>
          uniqueCardsInDeck.includes(banlistCard.card) &&
          banlistCard.number === 2
      )
      .map((banlistCard) => banlistCard.card);

    console.log(`${uniqueCardsInDeck.length} unique cards`);
    if (repeatedCards.length) {
      console.log(`${cardsNotRepeated.length} cards not repeated`);
      console.log(`${repeatedCards.length} repeated cards once`);
      console.log(`Cards repeated: ${repeatedCards}`);
    }
    if (repeatedCardsTwice.length) {
      console.log(`${cardsNotRepeatedTwice.length} cards not repeated twice`);
      console.log(`${repeatedCardsTwice.length} repeated cards twice`);
      console.log(`Cards repeated twice: ${repeatedCardsTwice}`);
    }

    if (limitedCardsInThisDeck.length > 0) {
      console.log(`Limited cards in deck: ${limitedCardsInThisDeck}`);
    }

    if (semiLimitedCardsInThisDeck.length > 0) {
      console.log(`Semi limited cards in deck: ${semiLimitedCardsInThisDeck}`);
    }

    const cardsNeededToCompleteTwoSets = _.difference(
      cardsNotRepeated,
      limitedCardsInThisDeck
    );
    console.log(
      `Cards needed to complete two sets: ${cardsNeededToCompleteTwoSets.length}`
    );
    const deckToUpdate = structureDeckSetOfTwoMissing.find(
      (sd) => sd.deck === structureDeck
    );
    deckToUpdate.cards = _.sortBy(cardsNeededToCompleteTwoSets);
    if (limitedCardsInThisDeck.length > 0) {
      deckToUpdate.limitedCards = limitedCardsInThisDeck;
    }

    const cardsNeededToCompleteThreeSets = [
      ..._.difference(cardsNeededToCompleteTwoSets, semiLimitedCardsInThisDeck),
      ..._.difference(cardsNeededToCompleteTwoSets, semiLimitedCardsInThisDeck),
    ];
    console.log(
      `Cards needed to complete three sets: ${cardsNeededToCompleteThreeSets.length}`
    );
    const deckToUpdate3 = structureDeckSetOfThreeMissing.find(
      (sd) => sd.deck === structureDeck
    );
    deckToUpdate3.cards = _.sortBy(cardsNeededToCompleteThreeSets);
    if (limitedCardsInThisDeck.length > 0) {
      deckToUpdate3.limitedCards = limitedCardsInThisDeck;
    }
    if (semiLimitedCardsInThisDeck.length > 0) {
      deckToUpdate3.semiLimitedCards = semiLimitedCardsInThisDeck;
    }
  });

  const collectionForSetOfTwo = [...collection];
  for (let i = 0; i < collectionForSetOfTwo.length; i++) {
    const collectionCard = collectionForSetOfTwo[i];
    for (let j = 0; j < structureDeckSetOfTwoMissing.length; j++) {
      const { cards, deck } = structureDeckSetOfTwoMissing[j];
      for (let k = 0; k < cards.length; k++) {
        const card = cards[k];
        const missingCardIndex = k;
        if (card === collectionCard["Name"]) {
          cards.splice(missingCardIndex, 1);
          j = structureDeckSetOfTwoMissing.length;
          if (deck === "Structure Deck: Blaze of Destruction") {
            console.log(
              `${deck}: has is in ${collectionCard["Name"]}, (${collectionCard["Rarity"]}) ${collectionCard["In Deck"]}`
            );
          }
          break;
        }
      }
    }
  }

  const collectionForSetOfThree = [...collection];
  for (let i = 0; i < collectionForSetOfThree.length; i++) {
    const collectionCard = collectionForSetOfThree[i];
    for (let j = 0; j < structureDeckSetOfThreeMissing.length; j++) {
      const { cards, deck } = structureDeckSetOfThreeMissing[j];
      for (let k = 0; k < cards.length; k++) {
        const card = cards[k];
        const missingCardIndex = k;
        if (card === collectionCard["Name"]) {
          cards.splice(missingCardIndex, 1);
          j = structureDeckSetOfThreeMissing.length;
          break;
        }
      }
    }
  }

  const setOfTwo = structureDeckSetOfTwoMissing.map((deckEntry) => ({
    ...deckEntry,
    cardsMissing: deckEntry.cards.length,
    releaseDate: cardSets.find((cardSet) => cardSet.set_name === deckEntry.deck)
      .tcg_date,
  }));

  fs.writeFile(
    "./structureDecks/cardsFor2Sets.json",
    JSON.stringify(
      _.sortBy(setOfTwo, (deckEntry) => deckEntry.releaseDate),
      null,
      3
    ),
    function (err) {
      // console.error(err);
    }
  );

  const setOfThree = structureDeckSetOfThreeMissing.map((deckEntry) => ({
    ...deckEntry,
    cardsMissing: deckEntry.cards.length,
  }));
  fs.writeFile(
    "./structureDecks/cardsFor3Sets.json",
    JSON.stringify(
      _.sortBy(setOfThree, (deckEntry) => deckEntry.cardsMissing),
      null,
      3
    ),
    function (err) {
      // console.error(err);
    }
  );
};

module.exports = {
  getCardsMissingForStructureDecks,
  getStructureDeckSetNames,
  getCardSets,
  getClosestMatchingBanList,
  getSetsOfCardsInStructureDeck,
  getDeckFilteredByBanlist,
};
