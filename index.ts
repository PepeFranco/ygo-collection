import { getCollection } from "./getCollection";
import { getYdkDeck } from "./getYdkDeck";
import { findYdkDeckInCollection } from "./findYdkDeckInCollection";

const main = async function () {
  const collection = getCollection();
  const frogDeck = getYdkDeck("edison-frogs");
  const { cardsInDeckInCollection, cardsInDeckNotInCollection } =
    findYdkDeckInCollection(collection, frogDeck);
  console.log({ cardsInDeckInCollection, cardsInDeckNotInCollection });
};

main();
