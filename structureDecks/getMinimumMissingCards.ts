import fs from "fs";
import path from "path";
import cardSets from "../data/structureDecks/cardsets.json";
import collection from "../data/collection.json";
import { CollectionRow } from "../data/data.types";
import _ from "lodash";

const rarityOrder = [
  "Duel Terminal Ultra Parallel Rare",
  "Collector's Rare",
  "Quarter Century Secret Rare",
  "Prismatic Secret Rare",
  "Platinum Secret Rare",
  "Platinum Rare",
  "Ultimate Rare",
  "Ghost/Gold Rare",
  "Ghost Rare",
  "Gold Secret Rare",
  "Secret Rare",
  "Gold Rare",
  "Ultra Rare",
  "Super Rare",
  "Starfoil Rare",
  "Mosaic Rare",
  "Rare",
  "Short Print",
  "Common",
];

export const getMinimumMissingCards = () => {
  const collectionCopy: CollectionRow[] = [...collection].sort((a, b) => {
    const ai = rarityOrder.indexOf(a.Rarity ?? "");
    const bi = rarityOrder.indexOf(b.Rarity ?? "");
    return ai - bi;
  });

  const recordOfCardsPerSets: Record<string, number> = {};

  const setsWithAllCardsMissing = [...cardSets]
    .sort((a, b) => a.tcg_date.localeCompare(b.tcg_date))
    .map((cardSet) => {
      const cardList: string[] = require(`../data/structureDecks/${cardSet.set_name.toLowerCase()}.json`);
      const missingCardList: string[] = [];
      cardList.map((card) => {
        if (recordOfCardsPerSets[card] === undefined) {
          recordOfCardsPerSets[card] = 1;
          missingCardList.push(card);
          return;
        }
        if (recordOfCardsPerSets[card] === 1) {
          recordOfCardsPerSets[card] = 2;
          missingCardList.push(card);
          return;
        }
      });
      const tripledCardList = [
        ...missingCardList,
        ...missingCardList,
        ...missingCardList,
      ].sort();
      return { deck: cardSet.set_name, cardsMissing: tripledCardList };
    });

  const result = setsWithAllCardsMissing.map((cardSet) => {
    const cardsMissing: string[] = [];
    cardSet.cardsMissing.map((card) => {
      const indexInCollection = collectionCopy.findIndex(
        (collectionCard) =>
          collectionCard.Name === card && !collectionCard.Keep,
      );
      if (indexInCollection > -1) {
        collectionCopy[indexInCollection].Keep = "Structure Deck";
        return;
      }
      cardsMissing.push(card);
    });
    return { deck: cardSet.deck, cardsMissing: cardsMissing };
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
