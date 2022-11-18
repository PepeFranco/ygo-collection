import { getCollection } from "./getCollection";
import { getYdkDeck } from "./getYdkDeck";
import { findYdkDeckInCollection } from "./findYdkDeckInCollection";
import { getNumbersAboutDeckInCollection } from "./getNumbersAboutDeckInCollection";

const main = async function () {
  const collection = getCollection();
  const frogDeck = getYdkDeck("edison-frogs");
  const { cardsInDeckInCollection, cardsInDeckNotInCollection } =
    getNumbersAboutDeckInCollection(
      findYdkDeckInCollection(collection, frogDeck)
    );
  console.log({ cardsInDeckInCollection, cardsInDeckNotInCollection });
};

main();
