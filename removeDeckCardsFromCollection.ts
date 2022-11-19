import { YdkDeckWithNames } from "./fillDeckWithNames";
import { CollectionCard } from "./getCollection";

const removeDeckCardsFromCollection = (
  ydkDeck: YdkDeckWithNames,
  collection: CollectionCard[]
): CollectionCard[] => {
  const collectionCopy = [...collection];

  ["main", "extra", "side"].map((deckSection) => {
    ydkDeck[deckSection].map((cardName) => {
      const indexInCollection = collection.findIndex(
        (collectionCard) => collectionCard.Name === cardName
      );

      const cardInCollection = indexInCollection >= 0;
      if (cardInCollection) {
        collectionCopy.splice(indexInCollection, 1);
      }
    });
  });

  return collectionCopy;
};

export { removeDeckCardsFromCollection };
