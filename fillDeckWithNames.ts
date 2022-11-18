import { getCardNameFromId } from "./getCardNameFromId";
import { YdkDeck } from "./getYdkDeck";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

interface YdkDeckWithNames {
  main: string[];
  extra: string[];
  side: string[];
}

const fillDeckWithNames = async (
  ydkDeck: YdkDeck
): Promise<YdkDeckWithNames> => {
  const ydkDeckWithNames = {
    main: [],
    extra: [],
    side: [],
  };
  await Promise.all(
    ["main", "extra", "side"].map(async (section) => {
      await Promise.all(
        ydkDeck[section].map(async (cardId: Number) => {
          await sleep(100);
          const name = await getCardNameFromId(cardId);
          ydkDeckWithNames[section].push(name);
        })
      );
    })
  );
  return ydkDeckWithNames;
};

export { fillDeckWithNames };
