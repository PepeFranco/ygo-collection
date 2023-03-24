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

const mainFunction = async () => {
  const banLists = _.sortBy(
    require("../data/banlists.json"),
    (l) => new Date(l.date)
  );

  const cardSets = await getCardSets();

  const structureDecks = _.sortBy(
    cardSets.filter((cardSet) => {
      const setName = cardSet["set_name"].toLowerCase();
      return (
        setName.includes("structure") &&
        !setName.includes("special") &&
        !setName.includes("deluxe")
      );
    }),
    (sd) => sd["tcg_date"]
  ).map((cardSet) => cardSet["set_name"]);
  console.log(`🔢 There are ${structureDecks.length} structure decks`);
  console.log(`📚 There are ${collection.length} cards in the collection`);

  const structureDeckSetOfOne = structureDecks.map((structureDeck) => {
    const cards = collection
      .filter((card) => card["In Deck"] === structureDeck)
      .map((card) => card["Name"]);

    _.remove(collection, (card) => card["In Deck"] === structureDeck);

    return {
      deck: structureDeck,
      cards,
    };
  });
  console.log(
    `🎴 There are ${structureDeckSetOfOne.reduce(
      (acc, sd) => acc + sd.cards.length,
      0
    )} cards in the collection currently in structure decks`
  );
  console.log(
    `📦 There are ${collection.length} cards in the collection not currently in structure decks`
  );

  const structureDeckSetOfTwoMissing = [];
  const structureDeckSetOfThreeMissing = [];
  structureDecks.map((structureDeck) => {
    structureDeckSetOfTwoMissing.push({ deck: structureDeck, cards: [] });
    structureDeckSetOfThreeMissing.push({ deck: structureDeck, cards: [] });
  });

  const getClosestMatchingBanList = (d) => {
    for (let i = 0; i < banLists.length; i++) {
      const thisBl = banLists[i];
      if (i === banLists.length - 1) {
        return thisBl;
      }
      const nextBl = banLists[i + 1];
      const nextBlDate = new Date(nextBl.date);
      if (
        nextBlDate.getFullYear() === d.getFullYear() &&
        nextBlDate.getMonth() === d.getMonth()
      )
        return nextBl;
      if (nextBlDate > d) return thisBl;
    }
  };

  structureDecks.map((structureDeck) => {
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
    "./collectionScripts/structureDecks/cardsFor2Sets.json",
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
    "./collectionScripts/structureDecks/cardsFor3Sets.json",
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

mainFunction();
