import collection from "../data/collection.json";
import legalCards from "../data/speedDuel/legalCards.json";
import path from "path";
import fs from "fs";
import _ from "lodash";
import { CollectionRow } from "../data/data.types";
import { debug } from "../debug";

const collectionCopy = [...collection];

collectionCopy.map((collectionCard: CollectionRow) => {
  const normalisedCardName = collectionCard.Name.trim().toLowerCase();
  const legalityIndex = legalCards.findIndex(
    (legalCard) => legalCard.trim().toLowerCase() === normalisedCardName
  );
  if (legalityIndex > -1) {
    debug(`${collectionCard.Name} is legal in speed duel`);
    if (!collectionCard.Keep) {
      collectionCard.Keep = "Speed Duel";
    } else {
      debug(
        `${collectionCard.Name} is already marked as keep for ${collectionCard.Keep}`
      );
    }
  }
});

fs.writeFileSync(
  path.join(__dirname, "../data/collection.json"),
  JSON.stringify(collectionCopy, null, 3)
);
