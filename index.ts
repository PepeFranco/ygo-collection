import { getCollection } from "./getCollection";
import { getYdkDeck } from "./getYdkDeck";
import { findYdkDeckInCollection } from "./findYdkDeckInCollection";
import { getNumbersAboutDeckInCollection } from "./getNumbersAboutDeckInCollection";
import { fillDeckWithNames } from "./fillDeckWithNames";
import { getDeckNames } from "./getDeckNames";

import { sortBy, reverse } from "lodash";
import { writeFileSync } from "fs";
import { fillDecksAndRemoveCards } from "./fillDecksAndRemoveCards";

const main = async function () {
  const collection = getCollection();
  const deckNames = getDeckNames();
  const decks = deckNames.map((deckName) => getYdkDeck(deckName));
  const decksWithNames = await Promise.all(
    decks.map((deck) => fillDeckWithNames(deck))
  );
  const decksWithNumbers = decksWithNames.map((deckWithNames) => {
    const decksInCollection = findYdkDeckInCollection(
      collection,
      deckWithNames
    );
    return getNumbersAboutDeckInCollection(decksInCollection);
  });

  const decksSortedByPercentageOwned = reverse(
    sortBy(
      decksWithNumbers,
      (deckWithNumbers) =>
        deckWithNumbers.cardsInDeckInCollection.percentageInMainFromTotal +
        deckWithNumbers.cardsInDeckInCollection.percentageInExtraFromTotal
    )
  );
  const decksWithNamesSorted = decksSortedByPercentageOwned.map(
    (deck) => deck.ydkDeck
  );

  const result = fillDecksAndRemoveCards(collection, decksWithNamesSorted);
  writeFileSync("./results.json", JSON.stringify(result, null, 3));
};

main();
