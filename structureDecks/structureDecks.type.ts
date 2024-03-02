export type StructureDeck = {
  deck: string;
  cards?: string[];
  date: string;
};

export type StructureDeckWithLimitedCards = StructureDeck & {
  forbiddenCards: string[];
  limitedCards: string[];
  semiLimitedCards: string[];
};

export type StructureDeckWithLimitedAndCollectionCards =
  StructureDeckWithLimitedCards & {
    cardsMissing: string[];
    cardsInCollection: string[];
  };
