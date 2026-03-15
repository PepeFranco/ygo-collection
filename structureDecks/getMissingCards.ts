/**
 * getMissingCards.ts
 *
 * Determines which cards are missing from the collection to complete 3 copies
 * of every card in each structure deck, then writes the results to disk.
 *
 * INPUTS:
 * - data/structureDecks/cardsets.json      — structure deck metadata (name, set code, release date)
 * - data/collection.json                   — current card collection
 * - data/structureDecks/<deck-name>.json   — card list for each structure deck
 *
 * ALGORITHM (two-pass):
 *
 * Setup:
 * - Sorts decks chronologically by tcg_date
 * - Makes a mutable working copy of the collection sorted by rarity (highest first),
 *   so rarer copies are preferentially assigned
 * - Strips Keep field from all cards so each starts unassigned
 *
 * Pass 1 — Exact matches (set-code specific):
 *   For each deck, triples the card list (3 copies needed), then for each card:
 *   1. Looks for a collection card matching both the card name AND the deck's set code
 *   2. If found, marks it Keep=<deck name> (claims it) and moves on
 *   3. If not found, adds it to cardsMissing for that deck
 *
 * Pass 2 — Any copy (fallback):
 *   For each card still missing after Pass 1:
 *   1. Looks for any collection card matching the card name, regardless of set code
 *   2. If found, marks it Keep=<deck name> and removes it from cardsMissing
 *   3. If still not found, it is truly missing
 *
 * Cards are claimed greedily in rarity order, and decks are processed oldest-to-newest,
 * so earlier/rarer cards are preferentially allocated. Once claimed, a card cannot be
 * assigned to another deck.
 *
 * OUTPUTS:
 * - data/structureDecks/missingCards.json  — array of { deck, cardsMissing[] } per deck
 * - data/collection.json                   — updated collection with Keep fields set
 */

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

const collectionCopy = _.sortBy(
  [...collection].map((collectionCard: CollectionRow) => {
    const { Keep, ...restFields } = collectionCard;
    return { ...restFields };
  }),
  ["Code", "Rarity", "Edition"]
);

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
