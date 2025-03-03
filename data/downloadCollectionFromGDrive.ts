import { CollectionRow } from "./data.types";
import fs from "node:fs";
import csv from "csvtojson";
import path from "path";

import collectionSecret from "../secret/collectionread.json";

export const downloadCollectionFromGDrive = async () => {
  try {
    const result = await fetch(collectionSecret.url);
    if (result.ok) {
      const rawData = await result.text();
      const headers = await rawData
        .split("\n")[0]
        .split(",")
        .map((h: any) => h.replace(/"/g, ""));
      fs.writeFileSync(
        path.join(__dirname, "headers.json"),

        JSON.stringify({ headers }, null, 3)
      );

      const collection: CollectionRow[] = await csv().fromString(rawData);
      console.log(`⬇️ Downloaded ${collection.length} items`);
      fs.writeFileSync(
        "./data/collection.json",
        JSON.stringify(collection, null, 3)
      );
    }
  } catch (error) {
    console.error(error);
  }
};

downloadCollectionFromGDrive();
