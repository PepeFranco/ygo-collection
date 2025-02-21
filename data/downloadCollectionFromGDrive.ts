import { CollectionRow } from "./data.types";
import axios from "axios";
import fs from "node:fs";
import csv from "csvtojson";
import path from "path";

import collectionSecret from "../secret/collectionread.json";

export const downloadCollectionFromGDrive = async () => {
  const result = await axios
    .get<string>(collectionSecret.url)
    .catch((e: any) => {
      console.error(e);
    });
  if (result) {
    const collection: CollectionRow[] = await csv().fromString(result.data);
    const headers = result.data
      .split("\n")[0]
      .split(",")
      .map((h: any) => h.replace(/"/g, ""));
    fs.writeFileSync(
      path.join(__dirname, "headers.json"),
      JSON.stringify({ headers }, null, 3)
    );
    console.log(`⬇️ Downloaded ${collection.length} items`);
    fs.writeFileSync(
      "./data/collection.json",
      JSON.stringify(collection, null, 3)
    );
  }
};

downloadCollectionFromGDrive();
