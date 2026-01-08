import collection from "../data/collection.json";
import legalCards from "../data/speedDuel/legalCards.json";
import path from "path";
import fs from "fs";
import _ from "lodash";
import { CollectionRow } from "../data/data.types";
import { debug } from "../debug";

const goatDate = new Date(2005, 7, 16);
const edisonDate = new Date(2010, 3, 25);
const hatDate = new Date(2014, 6, 8);

const collectionCopy = [...collection];

collectionCopy.map((collectionCard: CollectionRow) => {
  const [date, month, year] = collectionCard["Earliest Date"].split("/");
  const collectionCardDate = new Date(year, month - 1, date);
  const legalities = [];
  if (collectionCardDate < goatDate) {
    legalities.push("Goat");
  }
  if (collectionCardDate < edisonDate) {
    legalities.push("Edison");
  }
  if (collectionCardDate < hatDate) {
    legalities.push("HAT");
  }
  if (legalities.length > 0) {
    const legalityString = legalities.join("|");
    debug(`${collectionCard.Name} is legal in ${legalityString}`);
    if (!collectionCard.Keep) {
      collectionCard.Keep = legalityString;
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
