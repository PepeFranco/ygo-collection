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

  ydkDeck.main.map((mainCardId) => {
    const indexInCollection = cardIdsInCollection.findIndex(
      (collectionCardId) => collectionCardId === mainCardId
    );

    const cardInCollection = indexInCollection >= 0;
    if (cardInCollection) {
      cardsInDeckInCollection.main.push(mainCardId);
      cardIdsInCollection.splice(indexInCollection, 1);
      return;
    }

    cardsInDeckNotInCollection.main.push(mainCardId);
  });

  return { cardsInDeckInCollection, cardsInDeckNotInCollection };
};

export { findYdkDeckInCollection };
