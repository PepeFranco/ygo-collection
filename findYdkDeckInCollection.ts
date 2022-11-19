import { CollectionCard } from "./getCollection";
import { YdkDeckWithNames } from "./fillDeckWithNames";

const findYdkDeckInCollection = (
  collection: CollectionCard[],
  ydkDeck: YdkDeckWithNames
): {
  cardsInDeckInCollection: YdkDeckWithNames;
  cardsInDeckNotInCollection: YdkDeckWithNames;
  ydkDeck: YdkDeckWithNames;
} => {
  const cardNamesInCollection = collection.map(
    (collectionCard) => collectionCard.Name
  );

  const cardsInDeckInCollection = {
    deckName: ydkDeck.deckName,
    main: [],
    extra: [],
    side: [],
  };
  const cardsInDeckNotInCollection = {
    deckName: ydkDeck.deckName,
    main: [],
    extra: [],
    side: [],
  };

  ["main", "extra", "side"].map((deckSection) => {
    ydkDeck[deckSection].map((cardName) => {
      const indexInCollection = cardNamesInCollection.findIndex(
        (collectionCardName) => collectionCardName === cardName
      );

      const cardInCollection = indexInCollection >= 0;
      if (cardInCollection) {
        cardsInDeckInCollection[deckSection].push(cardName);
        cardNamesInCollection.splice(indexInCollection, 1);
        return;
      }

      cardsInDeckNotInCollection[deckSection].push(cardName);
    });
  });

  return { cardsInDeckInCollection, cardsInDeckNotInCollection, ydkDeck };
};

export { findYdkDeckInCollection };
