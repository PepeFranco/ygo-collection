import { YdkDeck } from "./getYdkDeck";

type YdkDeckWithNumbers = YdkDeck & {
  cardsInMain: Number;
  cardsInExtra: Number;
  cardsInSide: Number;
  percentageInMainFromTotal: Number;
  percentageInExtraFromTotal: Number;
  percentabeInSideFromTotal: Number;
};

const getSectionPercentage = (
  deckToCalculate: YdkDeck,
  otherDeck: YdkDeck,
  section: "main" | "extra" | "side"
) =>
  (deckToCalculate[section].length * 100) /
  (deckToCalculate[section].length + otherDeck[section].length);

const getNumbersForDeck = (
  deckToCalculate: YdkDeck,
  otherDeck: YdkDeck
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
}: {
  cardsInDeckInCollection: YdkDeck;
  cardsInDeckNotInCollection: YdkDeck;
}): {
  cardsInDeckInCollection: YdkDeckWithNumbers;
  cardsInDeckNotInCollection: YdkDeckWithNumbers;
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
  };
};

export { getNumbersAboutDeckInCollection };
