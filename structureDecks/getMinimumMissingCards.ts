import fs from "fs";
import path from "path";
import cardSets from "../data/structureDecks/cardsets.json";
import collection from "../data/collection.json";
import { CollectionRow } from "../data/data.types";

export const getMinimumMissingCards = () => {
  const collectionCopy: CollectionRow[] = [...collection].map((card) => ({
    ...card,
  }));

  const missingCountByName: Record<string, number> = {};
  const result = [...cardSets]
    .sort((a, b) => a.tcg_date.localeCompare(b.tcg_date))
    .map((cardSet) => {
      const cardList: string[] = require(`../data/structureDecks/${cardSet.set_name.toLowerCase()}.json`);
      const tripled = [...cardList, ...cardList, ...cardList];

      const cardsMissing = tripled.filter((cardName) => {
        const inCollection = collectionCopy.filter(
          (c) => c.Name === cardName,
        ).length;

        if (inCollection >= 6) {
          const marked = collectionCopy.filter(
            (c) => c.Name === cardName && c.Keep === "Structure Deck",
          ).length;
          if (marked < 6) {
            const idx = collectionCopy.findIndex(
              (c) => c.Name === cardName && !c.Keep,
            );
            if (idx > -1) collectionCopy[idx].Keep = "Structure Deck";
          }
          return false;
        }

        const idx = collectionCopy.findIndex(
          (card) =>
            card.Name === cardName &&
            card.Code?.includes(cardSet.set_code) &&
            !card.Keep,
        );
        if (idx > -1) {
          collectionCopy[idx].Keep = cardSet.set_name;
          return false;
        }

        const missing = missingCountByName[cardName] ?? 0;
        if (inCollection + missing >= 6) return false;

        missingCountByName[cardName] = missing + 1;
        return true;
      });

      return { deck: cardSet.set_name, cardsMissing: cardsMissing.sort() };
    });

  fs.writeFileSync(
    path.join(__dirname, "../data/structureDecks/missingCards.json"),
    JSON.stringify(result, null, 3),
  );
  fs.writeFileSync(
    path.join(__dirname, "../data/collection.json"),
    JSON.stringify(collectionCopy, null, 3),
  );
};

if (require.main === module) {
  getMinimumMissingCards();
}
