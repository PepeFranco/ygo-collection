import { CollectionCard } from "./getCollection";
import { YdkDeckWithNames } from "./fillDeckWithNames";
import { removeDeckCardsFromCollection } from "./removeDeckCardsFromCollection";
import { findYdkDeckInCollection } from "./findYdkDeckInCollection";
import { getNumbersAboutDeckInCollection } from "./getNumbersAboutDeckInCollection";

const fillDecksAndRemoveCards = (
  collection: CollectionCard[],
  decksSorted: YdkDeckWithNames[]
): {
  cardsInDeckInCollection: YdkDeckWithNames;
  cardsInDeckNotInCollection: YdkDeckWithNames;
}[] => {
  if (decksSorted.length === 0) {
    return [];
  }
  const [currentDeck, ...restDecks] = decksSorted;
  const currentDeckResult = findYdkDeckInCollection(collection, currentDeck);
  const newCollection = removeDeckCardsFromCollection(currentDeck, collection);
  return [
    getNumbersAboutDeckInCollection(currentDeckResult),
    ...fillDecksAndRemoveCards(newCollection, restDecks),
  ];
};
export { fillDecksAndRemoveCards };
