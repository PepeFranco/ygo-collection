import cardSets from "../data/structureDecks/cardsets.json";
import collection from "../data/collection.json";
import path from "path";
import fs from "fs";
import _ from "lodash";
import { CollectionRow } from "../data/data.types";
import { debug } from "../debug";

debug(`There are ${cardSets.length} structure decks`);

const orderedCardSets = _.sortBy(
  cardSets,
  (cardSet) => new Date(cardSet.tcg_date)
);

const collectionCopy = [...collection].map((collectionCard: CollectionRow) => {
  const { Keep, ...restFields } = collectionCard;
  return { ...restFields };
});

const sortByRarity = (collectionList: CollectionRow[]) => {
  return _.sortBy(collectionList, (collectionCard: CollectionRow) => {
    const { Rarity } = collectionCard;
    const sortedRarities = [
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
    const rarityIndex = sortedRarities.findIndex((rarity) => rarity === Rarity);
    return rarityIndex;
  });
};

const sortedCollectionCopy = sortByRarity(collectionCopy);

// Find exact cards
const result = [];
orderedCardSets.map((cardSet) => {
  debug("===================");
  const fileName = `${cardSet.set_name.toLowerCase()}.json`;
  const fileContents = fs.readFileSync(
    path.join(__dirname, "../data/structureDecks/", fileName)
  );
  const cardList = JSON.parse(fileContents.toString());
  debug(`${cardSet.set_name} has ${cardList.length} unique cards`);
  const tripledCardList = [...cardList, ...cardList, ...cardList];
  debug(
    `${cardSet.set_name} has ${tripledCardList.length} triple unique cards`
  );

  const setResult = { deck: cardSet.set_name, cardsMissing: [] };
  tripledCardList.map((cardName) => {
    const normalisedCardName = cardName.trim().toLowerCase();
    const exactCardIndex = sortedCollectionCopy.findIndex(
      (collectionCard: CollectionRow) => {
        return (
          normalisedCardName === collectionCard.Name.trim().toLowerCase() &&
          collectionCard.Code?.includes(cardSet.set_code) &&
          !collectionCard.Keep
        );
      }
    );
    if (exactCardIndex > -1) {
      sortedCollectionCopy[exactCardIndex].Keep = cardSet.set_name;
      return;
    }
    setResult.cardsMissing.push(cardName);
  });

  debug("After trying to find exact matches");
  debug(
    `There are ${setResult.cardsMissing.length} cards missing for ${cardSet.set_name}`
  );
  setResult.cardsMissing = _.orderBy(setResult.cardsMissing);
  result.push(setResult);
});

orderedCardSets.map((cardSet) => {
  debug("===================");

  const setResult = result.find(
    (setResult) => setResult.deck === cardSet.set_name
  );

  const cardList = setResult.cardsMissing;

  const newMissingCards = [];
  cardList.map((cardName) => {
    const normalisedCardName = cardName.trim().toLowerCase();
    const nextBestCardIndex = sortedCollectionCopy.findIndex(
      (collectionCard: CollectionRow) => {
        return (
          normalisedCardName === collectionCard.Name.trim().toLowerCase() &&
          !collectionCard.Keep
        );
      }
    );
    if (nextBestCardIndex > -1) {
      sortedCollectionCopy[nextBestCardIndex].Keep = cardSet.set_name;
      return;
    }

    newMissingCards.push(cardName);
  });

  debug(
    `There are ${newMissingCards.length} cards missing for ${cardSet.set_name}`
  );
  setResult.cardsMissing = _.orderBy(newMissingCards);
});

fs.writeFileSync(
  path.join(__dirname, "../data/structureDecks/missingCards.json"),
  JSON.stringify(result, null, 3)
);

fs.writeFileSync(
  path.join(__dirname, "../data/collection.json"),
  JSON.stringify(sortedCollectionCopy, null, 3)
);
