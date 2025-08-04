import _ from "lodash";

import type { Banlist, YGOProSet } from "../data/data.types";
import type { CollectionRow } from "../data/collection.types";
import type {
  StructureDeck,
  StructureDeckWithLimitedCards,
  StructureDeckWithLimitedAndCollectionCards,
} from "./structureDecks.type";

const collectionFile: CollectionRow[] = _.sortBy(
  [...require("../data/collection.json")],
  (collectionCard: CollectionRow) => collectionCard["In Deck"]
);

const banListsFile: Banlist[] = _.sortBy(
  require("../data/banlists.json"),
  (l: Banlist) => new Date(l.date)
);

const cardsInStructureDecks: StructureDeck[] = require("./cardsInStructureDecks.json");

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
  onlyRemoveIfSameSet: Boolean,
  onlyRemoveIfSameDeck: Boolean
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
        String(collectionCard["Name"]).toLowerCase().trim() ===
        card.toLowerCase().trim();
      const exactSameSetName = deck.deck
        .toLowerCase()
        .trim()
        .includes(String(collectionCard["Set"] || "").toLowerCase().trim());
      const setMatchesLegendaryHeroDecks =
        deck.deck.toLocaleLowerCase().trim().includes("legendary hero") &&
        String(collectionCard.Set || "").toLowerCase().trim().includes("legendary hero");
      const sameSet = exactSameSetName || setMatchesLegendaryHeroDecks;
      const sameDeck =
        deck.deck.toLowerCase().trim() ===
        String(collectionCard["In Deck"] || "").toLowerCase().trim();

      if (onlyRemoveIfSameDeck) {
        return sameName && sameDeck;
      }

      if (onlyRemoveIfSameSet) {
        return sameName && sameSet;
      }

      return sameName;
    });

    if (collectionIndex >= 0) {
      const collectionCard = { ...filteredCollection[collectionIndex] };
      filteredCollection.splice(collectionIndex, 1);
      cardsInCollection.push(
        `${collectionCard.Name} [${collectionCard.Code}] (${collectionCard.Rarity}) <${collectionCard["In Deck"]}>`
      );
      cardsFound.push(card);
    }
  });
  _.each(cardsFound, (card) => {
    cardsMissing.splice(cardsMissing.indexOf(card), 1);
  });
  return {
    collection: filteredCollection,
    deck: {
      ...deck,
      cards: deck.cards, // Preserve the original cards array
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
    if (!card.Set || !setsToExclude.includes(String(card.Set))) {
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
    return !decksToExclude.some((deckToExclude) =>
      String(card["In Deck"] || "")
        .toLowerCase()
        .trim()
        .includes(deckToExclude.toLowerCase().trim())
    );
  });
};

const getCardsMissingForStructureDecks = async ({
  collection = collectionFile,
  banlists,
  prioritiseOriginalSet = true,
}: {
  collection?: CollectionRow[];
  banlists?: Banlist[];
  prioritiseOriginalSet?: Boolean;
}) => {
  console.log(`📚 There are ${collection.length} cards in the collection`);

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
      // //special case, there are 3 sets
      // "Speed Duel Starter Decks: Destiny Masters",
      // // one copy only
      // "Speed Duel Starter Decks: Match of the Millennium",
      // "Speed Duel Starter Decks: Twisted Nightmares",
      // "Speed Duel Starter Decks: Ultimate Predators",
    ];

    const decksToExclude = [
      "Edison Quickdraw",
      "Edison Diva Hero",
      "Speed Duel",
    ];

    const collectionCopyWithSetsExcluded = excludeSetsFromCollection({
      setsToExclude: setsToExcludeTwoOf,
      numberOfCopiesToExclude: 1,
      collection: [...collection],
    });

    const collectionCopy = excludeDecksFromCollection({
      decksToExclude,
      collection: [...collectionCopyWithSetsExcluded],
    });

    const structureDeckSet: StructureDeckResult[] = cardsInStructureDecks.map(
      (deck) => {
        const banlist = getClosestMatchingBanList(
          new Date(deck.date),
          banlists
        );
        const deckWithCardsMultiplied = getSetsOfCardsInStructureDeck(
          deck,
          set
        );
        const filteredDeck = getDeckFilteredByBanlist(deckWithCardsMultiplied, banlist);
        return {
          ...filteredDeck,
          cardsMissing: [],
          cardsInCollection: [],
          numberOfCardsMissing: 0,
        };
      }
    );

    const getMissingCardsFromCollection = ({
      setToReduce,
      collectionToRemoveCardsFrom,
      onlyRemoveIfSameSet,
      onlyRemoveIfSameDeck,
    }: {
      setToReduce: StructureDeckResult[];
      collectionToRemoveCardsFrom: CollectionRow[];
      onlyRemoveIfSameSet: Boolean;
      onlyRemoveIfSameDeck: Boolean;
    }) => {
      const resultSet: StructureDeckResult[] = [];
      const { collection: collectionWithCardsRemoved } = setToReduce.reduce(
        (accumulator, structureDeck) => {
          if (process.env.NODE_ENV !== "test") {
            console.log(` 🎴 Getting cards for: ${structureDeck.deck}`);
          }
          const { collection, deck } = removeCardsFromCollection(
            { ...structureDeck },
            accumulator.collection,
            onlyRemoveIfSameSet,
            onlyRemoveIfSameDeck
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
          if (onlyRemoveIfSameSet) {
            resultSet.push({
              ...deck,
              numberOfCardsMissing: deck.cardsMissing.length,
            });
            return accumulator;
          }
          resultSet.push({
            ...deck,
            cards: [],
            numberOfCardsMissing: deck.cardsMissing.length,
          });
          return accumulator;
        },
        { collection: collectionToRemoveCardsFrom }
      );
      return { resultSet, collectionWithCardsRemoved };
    };

    const getResultSet = () => {
      const firstReduceResult = getMissingCardsFromCollection({
        setToReduce: structureDeckSet,
        collectionToRemoveCardsFrom: collectionCopy,
        onlyRemoveIfSameSet: false,
        onlyRemoveIfSameDeck: true,
      });
      const secondReduceResult = getMissingCardsFromCollection({
        setToReduce: firstReduceResult.resultSet,
        collectionToRemoveCardsFrom:
          firstReduceResult.collectionWithCardsRemoved,
        onlyRemoveIfSameSet: prioritiseOriginalSet,
        onlyRemoveIfSameDeck: false,
      });
      const thirdReduceResult = getMissingCardsFromCollection({
        setToReduce: secondReduceResult.resultSet,
        collectionToRemoveCardsFrom:
          secondReduceResult.collectionWithCardsRemoved,
        onlyRemoveIfSameSet: false,
        onlyRemoveIfSameDeck: false,
      });
      return thirdReduceResult.resultSet;
    };
    setResult[set] = getResultSet().map((structureDeckSetResult) => {
      structureDeckSetResult.cardsInCollection =
        structureDeckSetResult.cardsInCollection.sort();
      return structureDeckSetResult;
    });
  });

  sets.map((set) => {
    setResult[set].map((deckResult) => {
      dataForCSV.push({
        set,
        deck: deckResult.deck,
        cardsMissing: deckResult.cardsMissing.length,
        cardsInCollection: deckResult.cardsInCollection.length,
      });
    });
  });

  return {
    dataForCSV,
    cardsFor1Sets: setResult[1],
    cardsFor2Sets: setResult[2],
    cardsFor3Sets: setResult[3],
  };
};

const getCardSets = async (): Promise<YGOProSet[] | null> => {
  try {
    const response = await fetch(
      "https://db.ygoprodeck.com/api/v7/cardsets.php"
    );
    if (!response.ok) {
      throw new Error(`Failed to download card sets ${response.text()}`);
    }
    const data = await response.json();
    return data as YGOProSet[];
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getStructureDeckSets = (cardSets: YGOProSet[]): StructureDeck[] => {
  return cardSets
    .filter(
      (set) =>
        set.set_name.toLowerCase().includes("structure deck") &&
        !set.set_name.toLowerCase().includes("special") &&
        !set.set_name.toLowerCase().includes("deluxe")
    )
    .map((set) => {
      return {
        date: set.tcg_date,
        deck: set.set_name,
        cards: [],
      };
    });
};

export {
  getCardSets,
  getCardsMissingForStructureDecks,
  getClosestMatchingBanList,
  getSetsOfCardsInStructureDeck,
  getDeckFilteredByBanlist,
  getStructureDeckSets,
  removeCardsFromCollection,
  excludeSetsFromCollection,
};
