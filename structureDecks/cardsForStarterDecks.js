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

const getCardsInSets = async (cardSets) => {
  return await Promise.all(
    cardSets.map(async (cardSet) => {
      const result = await axios
        .get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${cardSet}`)
        .catch((e) => {
          // console.error(e);
        });
      return {
        cardSet,
        cards:
          (result && result.data && result.data.data).map(({ name }) => name) ||
          null,
      };
    })
  );
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

  const starterDecks = ["starter deck: yugi", "starter deck: kaiba"];
  console.log(`🔢 There are ${starterDecks.length} structure decks`);
  console.log(`📚 There are ${collection.length} cards in the collection`);

  const cardsInStarterDecks = await getCardsInSets(starterDecks);
  // console.log(JSON.stringify(cardsInStarterDecks));

  const collectionCopy = [...collection];
  for (let i = 0; i < collectionCopy.length; i++) {
    const collectionCard = collectionCopy[i];
    for (let j = 0; j < cardsInStarterDecks.length; j++) {
      const { cards, cardSet } = cardsInStarterDecks[j];
      for (let k = 0; k < cards.length; k++) {
        const card = cards[k];
        const missingCardIndex = k;
        if (card === collectionCard["Name"]) {
          cards.splice(missingCardIndex, 1);
          j = cardsInStarterDecks.length;
          break;
        }
      }
    }
  }

  fs.writeFile(
    "./collectionScripts/structureDecks/cardsForStarterSets.json",
    JSON.stringify(cardsInStarterDecks, null, 3),
    function (err) {
      // console.error(err);
    }
  );

  // const setOfThree = structureDeckSetOfThreeMissing.map((deckEntry) => ({
  //   ...deckEntry,
  //   cardsMissing: deckEntry.cards.length,
  // }));
  // fs.writeFile(
  //   "./collectionScripts/structureDecks/cardsFor3Sets.json",
  //   JSON.stringify(
  //     _.sortBy(setOfThree, (deckEntry) => deckEntry.cardsMissing),
  //     null,
  //     3
  //   ),
  //   function (err) {
  //     // console.error(err);
  //   }
  // );
};

mainFunction();
