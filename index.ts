import { getCollection } from "./getCollection";
import { getYdkDeck } from "./getYdkDeck";
import { findYdkDeckInCollection } from "./findYdkDeckInCollection";
import { getNumbersAboutDeckInCollection } from "./getNumbersAboutDeckInCollection";
import { fillDeckWithNames } from "./fillDeckWithNames";

const main = async function () {
  const collection = getCollection();
  const frogDeck = getYdkDeck("edison-frogs");
  const decksInCollection = findYdkDeckInCollection(collection, frogDeck);

  const cardsInDeckInCollection = await fillDeckWithNames(
    decksInCollection.cardsInDeckInCollection
  );
  const cardsInDeckNotInCollection = await fillDeckWithNames(
    decksInCollection.cardsInDeckNotInCollection
  );

  const decksWithNumbers = getNumbersAboutDeckInCollection(
    cardsInDeckInCollection,
    cardsInDeckNotInCollection
  );

  console.log(decksWithNumbers);
};

main();
