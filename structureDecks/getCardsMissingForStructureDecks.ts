import _ from "lodash";
import axios from "axios";

import type { Banlist, CollectionRow, YGOProSet } from "../data/data.types";
import type {
  StructureDeck,
  StructureDeckWithLimitedCards,
  StructureDeckWithLimitedAndCollectionCards,
} from "./structureDecks.type";

const getCardSets = async () => {
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardsets.php")
    .catch(() => {
      // console.error(e);
    });

  if (!result) {
    return null;
  }

  if (result.data) {
    return result.data as YGOProSet[];
  }

  return null;
};

const collectionFile: CollectionRow[] = _.sortBy(
  [...require("../data/collection.json")],
  (collectionCard: CollectionRow) => collectionCard["In Deck"]
);

const banListsFile: Banlist[] = _.sortBy(
  require("../data/banlists.json"),
  (l: Banlist) => new Date(l.date)
);

const cardsInStructureDecks: StructureDeck[] = require("./cardsInStructureDecks.json");

const getStructureDeckSets = (
  cardSets: Pick<YGOProSet, "set_name" | "tcg_date">[]
) => {
  const filteredSets = cardSets.filter((cardSet) => {
    const setName = cardSet["set_name"].toLowerCase();
    return (
      (setName.includes("structure") || setName === "legendary hero decks") &&
      !setName.includes("special") &&
      !setName.includes("deluxe")
    );
  });
  const sortedSets = _.sortBy(filteredSets, (sd) => sd["tcg_date"]);
  return sortedSets.map((cardSet) => ({
    deck: cardSet["set_name"],
    date: cardSet["tcg_date"],
  }));
};

const getClosestMatchingBanList = (date: Date, banLists = banListsFile) => {
  const foundBanlist = banLists.find((banlist, index) => {
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
  return foundBanlist || banLists[banLists.length - 1];
};

const getSetsOfCardsInStructureDeck = (
  deck: StructureDeck,
  numberOfSets: number
) => {
  const arrayForSets: number[] = new Array(numberOfSets - 1).fill(0);
  const deckWithCardsMultiplied = arrayForSets.reduce((accumulator) => {
    return {
      ...accumulator,
      cards: [...accumulator.cards, ...deck.cards],
    };
  }, deck);
  deckWithCardsMultiplied.cards = _.sortBy(
    deckWithCardsMultiplied.cards,
    (card: string) => card
  );
  return deckWithCardsMultiplied;
};

const getDeckFilteredByBanlist = (
  deck: StructureDeck,
  banlist: Banlist
): StructureDeckWithLimitedCards => {
  const forbiddenCards = banlist.cards
    .filter(({ number, card }) => number === 0 && deck.cards.includes(card))
    .map(({ card }) => card);
  const forbiddenCardsInDeck: string[] = _.intersection(
    deck.cards,
    forbiddenCards
  );

  const limitedCards = banlist.cards
    .filter(({ number, card }) => number === 1 && deck.cards.includes(card))
    .map(({ card }) => card);
  const limitedCardsInDeck: string[] = _.intersection(deck.cards, limitedCards);

  const semiLimitedCards = banlist.cards
    .filter(({ number, card }) => number === 2 && deck.cards.includes(card))
    .map(({ card }) => card);
  const semiLimitedCardsInDeck: string[] = _.intersection(
    deck.cards,
    semiLimitedCards
  );

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
  }, [] as string[]);

  const cardsNotInList: string[] = _.difference(
    deck.cards,
    forbiddenCards,
    limitedCards,
    semiLimitedCardsInDeck
  );

  return {
    ...deck,
    cards: _.sortBy(
      [...cardsNotInList, ...limitedCardsInDeck, ...filteredSemiLimitedCards],
      (card: string) => card
    ) as string[],
    forbiddenCards: forbiddenCardsInDeck,
    limitedCards: limitedCardsInDeck,
    semiLimitedCards: semiLimitedCardsInDeck,
  };
};

const removeCardsFromCollection = (
  deck: StructureDeckWithLimitedAndCollectionCards,
  collection: CollectionRow[],
  onlyRemoveIfSameSet: Boolean
): {
  collection: CollectionRow[];
  deck: StructureDeckWithLimitedAndCollectionCards;
} => {
  const filteredCollection = [...collection];
  const cardsMissing =
    deck.cardsInCollection.length > 0
      ? [...deck.cardsMissing]
      : [...deck.cards];
  const cardsInCollection =
    deck.cardsInCollection.length > 0 ? [...deck.cardsInCollection] : [];
  const cardsFound: string[] = [];

  cardsMissing?.map((card) => {
    const collectionIndex = filteredCollection.findIndex((collectionCard) => {
      const sameName =
        collectionCard["Name"].toLowerCase() === card.toLowerCase();

      if (!onlyRemoveIfSameSet) {
        return sameName;
      }
      const sameSet = collectionCard["Set"] === deck.deck;
      return sameName && sameSet;
    });

    if (collectionIndex >= 0) {
      filteredCollection.splice(collectionIndex, 1);
      cardsInCollection.push(card);
      cardsFound.push(card);
    }
  });
  _.each(cardsFound, (card) => {
    cardsMissing.splice(cardsMissing.indexOf(card), 1);
  });
  if (deck.deck.includes(": Fire Kings")) {
    console.log({ cardsMissing });
  }
  return {
    collection: filteredCollection,
    deck: {
      ...deck,
      cardsMissing,
      cardsInCollection,
    },
  };
};

const excludeSetsFromCollection = ({
  setsToExclude,
  numberOfCopiesToExclude,
  collection,
}: {
  setsToExclude: string[];
  numberOfCopiesToExclude: number;
  collection: CollectionRow[];
}) => {
  const counterOfCardsToExclude: Record<string, number> = {};
  return collection.filter((card) => {
    if (!card.Set || !setsToExclude.includes(card.Set)) {
      return true;
    }
    const keyForCounter = `${card.Name}-${card.Set}`;
    const itemInCounter: number | undefined =
      counterOfCardsToExclude[keyForCounter];
    if (itemInCounter) {
      if (itemInCounter === numberOfCopiesToExclude) {
        return true;
      }
      counterOfCardsToExclude[keyForCounter]++;
      return false;
    }

    counterOfCardsToExclude[keyForCounter] = 1;
    return false;
  });
};

const excludeDecksFromCollection = ({
  decksToExclude,
  collection,
}: {
  decksToExclude: string[];
  collection: CollectionRow[];
}) => {
  return collection.filter((card) => {
    return !decksToExclude.includes(card["In Deck"] || "");
  });
};

const getCardsMissingForStructureDecks = async ({
  collection = collectionFile,
  banlists,
}: {
  collection?: CollectionRow[];
  banlists?: Banlist[];
}) => {
  console.log(`📚 There are ${collection.length} cards in the collection`);

  const cardSets = await getCardSets();
  if (cardSets === null) {
    console.error(`⚠️ Card sets could not be obtained`);
    return;
  }
  const structureDeckSets = getStructureDeckSets(cardSets);
  if (process.env.NODE_ENV !== "test") {
    console.log(`🔢 There are ${structureDeckSets.length} structure decks`);
  }
  const dataForCSV: {
    set: number;
    deck: string;
    cardsMissing: number;
    cardsInCollection: number;
  }[] = [];

  // const sets = [3];
  const sets = [1, 2, 3];
  type StructureDeckResult = StructureDeckWithLimitedAndCollectionCards & {
    numberOfCardsMissing: number;
  };
  const setResult: Record<number, StructureDeckResult[]> = {};
  sets.map((set) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`=== Set of ${set} ===`);
    }
    const setsToExcludeTwoOf = [
      "",
      // "Speed Duel GX: Duel Academy Box",
      // "Speed Duel GX: Duelists of Shadows",
      // "Speed Duel GX: Midterm Paradox",
      // "Speed Duel Starter Decks: Duelists of Tomorrow",
      // "Speed Duel: Battle City Box",
      //special case, there are 3 sets
      // "Speed Duel Starter Decks: Destiny Masters",
      // one copy only
      // "Speed Duel Starter Decks: Match of the Millennium"
      // "Speed Duel Starter Decks: Twisted Nightmares"
      // "Speed Duel Starter Decks: Ultimate Predators"
    ];

    const decksToExclude = ["Edison Quickdraw", "Edison Diva Hero"];

    const collectionCopyWithSetsExcluded = excludeSetsFromCollection({
      setsToExclude: setsToExcludeTwoOf,
      numberOfCopiesToExclude: 2,
      collection: [...collection],
    });

    const collectionCopy = excludeDecksFromCollection({
      decksToExclude,
      collection: [...collectionCopyWithSetsExcluded],
    });

    const structureDeckSet = cardsInStructureDecks.map((deck) => {
      const banlist = getClosestMatchingBanList(new Date(deck.date), banlists);
      const deckWithCardsMultiplied = getSetsOfCardsInStructureDeck(deck, set);
      return getDeckFilteredByBanlist(deckWithCardsMultiplied, banlist);
    });

    const structureDeckSetResult: StructureDeckResult[] = [];
    const firstReduceResult = structureDeckSet.reduce(
      (accumulator, structureDeck) => {
        if (process.env.NODE_ENV !== "test") {
          console.log(` 🎴 Getting cards for: ${structureDeck.deck}`);
        }
        const { collection, deck } = removeCardsFromCollection(
          { ...structureDeck, cardsMissing: [], cardsInCollection: [] },
          accumulator.collection,
          true
        );
        if (process.env.NODE_ENV !== "test") {
          console.log(
            `  #️⃣ There are ${deck?.cards?.length} cards in a set of ${set}`
          );
          console.log(
            `  ✅ ${deck.cardsInCollection.length} are in the collection`
          );
          console.log(`  ❌ ${deck.cardsMissing.length} are missing`);
        }
        accumulator.collection = collection;
        structureDeckSetResult.push({
          ...deck,
          numberOfCardsMissing: deck.cardsMissing.length,
        });
        return accumulator;
      },
      { collection: collectionCopy }
    );
    const secondStructureDeckSetResult: StructureDeckResult[] = [];
    structureDeckSetResult.reduce(
      (accumulator, structureDeck) => {
        if (process.env.NODE_ENV !== "test") {
          console.log(` 🎴 Getting cards for: ${structureDeck.deck}`);
        }
        const { collection, deck } = removeCardsFromCollection(
          structureDeck,
          accumulator.collection,
          false
        );

        accumulator.collection = collection;
        if (process.env.NODE_ENV !== "test") {
          console.log(
            `  #️⃣ There are ${deck?.cards?.length} cards in a set of ${set}`
          );
          console.log(
            `  ✅ ${deck.cardsInCollection.length} are in the collection`
          );
          console.log(`  ❌ ${deck.cardsMissing.length} are missing`);
        }
        dataForCSV.push({
          set,
          deck: deck.deck,
          cardsMissing: deck.cardsMissing.length,
          cardsInCollection: deck.cardsInCollection.length,
        });
        secondStructureDeckSetResult.push({
          ...deck,
          cards: [],
          numberOfCardsMissing: deck.cardsMissing.length,
        });
        return accumulator;
      },
      { collection: firstReduceResult.collection }
    );
    setResult[set] = secondStructureDeckSetResult.map(
      (structureDeckSetResult) => {
        structureDeckSetResult.cardsInCollection =
          structureDeckSetResult.cardsInCollection.sort();
        return structureDeckSetResult;
      }
    );
  });

  return {
    dataForCSV,
    cardsFor1Sets: setResult[1],
    cardsFor2Sets: setResult[2],
    cardsFor3Sets: setResult[3],
  };
};

export {
  getCardsMissingForStructureDecks,
  getStructureDeckSets,
  getCardSets,
  getClosestMatchingBanList,
  getSetsOfCardsInStructureDeck,
  getDeckFilteredByBanlist,
  removeCardsFromCollection,
  excludeSetsFromCollection,
};
