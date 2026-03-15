import fs from "fs";
import path from "path";
import collection from "../data/collection.json";

export const getMinimumMissingCards = () => {
  fs.writeFileSync(path.join(__dirname, "../data/structureDecks/missingCards.json"), "");
  fs.writeFileSync(path.join(__dirname, "../data/collection.json"), "");
};
