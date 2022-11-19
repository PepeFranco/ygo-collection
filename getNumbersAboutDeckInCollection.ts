import { YdkDeckWithNames } from "./fillDeckWithNames";

type YdkDeckWithNumbers = YdkDeckWithNames & {
  cardsInMain: Number;
  cardsInExtra: Number;
  cardsInSide: Number;
  percentageInMainFromTotal: Number;
  percentageInExtraFromTotal: Number;
  percentabeInSideFromTotal: Number;
};

const getSectionPercentage = (
  deckToCalculate: YdkDeckWithNames,
  otherDeck: YdkDeckWithNames,
  section: "main" | "extra" | "side"
) =>
  (deckToCalculate[section].length * 100) /
  (deckToCalculate[section].length + otherDeck[section].length);

const getNumbersForDeck = (
  deckToCalculate: YdkDeckWithNames,
  otherDeck: YdkDeckWithNames
): YdkDeckWithNumbers => ({
  ...deckToCalculate,
  cardsInMain: deckToCalculate.main.length,
  cardsInExtra: deckToCalculate.extra.length,
  cardsInSide: deckToCalculate.side.length,
  percentageInMainFromTotal: getSectionPercentage(
    deckToCalculate,
    otherDeck,
    "main"
  ),
  percentageInExtraFromTotal: getSectionPercentage(
    deckToCalculate,
    otherDeck,
    "extra"
  ),
  percentabeInSideFromTotal: getSectionPercentage(
    deckToCalculate,
    otherDeck,
    "side"
  ),
});

const getNumbersAboutDeckInCollection = ({
  cardsInDeckInCollection,
  cardsInDeckNotInCollection,
  ydkDeck,
}: {
  cardsInDeckInCollection: YdkDeckWithNames;
  cardsInDeckNotInCollection: YdkDeckWithNames;
  ydkDeck: YdkDeckWithNames;
}): {
  cardsInDeckInCollection: YdkDeckWithNumbers;
  cardsInDeckNotInCollection: YdkDeckWithNumbers;
  ydkDeck: YdkDeckWithNames;
} => {
  return {
    cardsInDeckInCollection: getNumbersForDeck(
      cardsInDeckInCollection,
      cardsInDeckNotInCollection
    ),
    cardsInDeckNotInCollection: getNumbersForDeck(
      cardsInDeckNotInCollection,
      cardsInDeckInCollection
    ),
    ydkDeck,
  };
};

export { getNumbersAboutDeckInCollection };
