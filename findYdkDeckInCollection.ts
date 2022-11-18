import { YdkDeck } from "./getYdkDeck";
import { CollectionCard } from "./getCollection";

const findYdkDeckInCollection = (
  collection: CollectionCard[],
  ydkDeck: YdkDeck
) => {
  const cardIdsInCollection = collection.map(
    (collectionCard) => collectionCard.ID
  );

  const cardsInDeckInCollection = {
    main: [],
    extra: [],
    side: [],
  };
  const cardsInDeckNotInCollection = {
    main: [],
    extra: [],
    side: [],
  };

  ["main", "extra", "side"].map((deckSection) => {
    ydkDeck[deckSection].map((cardId) => {
      const indexInCollection = cardIdsInCollection.findIndex(
        (collectionCardId) => collectionCardId === cardId
      );

      const cardInCollection = indexInCollection >= 0;
      if (cardInCollection) {
        cardsInDeckInCollection[deckSection].push(cardId);
        cardIdsInCollection.splice(indexInCollection, 1);
        return;
      }

      cardsInDeckNotInCollection[deckSection].push(cardId);
    });
  });

  return { cardsInDeckInCollection, cardsInDeckNotInCollection };
};

export { findYdkDeckInCollection };
