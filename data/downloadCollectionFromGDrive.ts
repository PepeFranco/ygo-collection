import { CollectionRow } from "./data.types";

const axios = require("axios");
const fs = require("fs");
const csv = require("csvtojson");
const collectionSecret = require("../secret/collectionread.json");

export const downloadCollectionFromGDrive = async () => {
  const result = await axios.get(collectionSecret.url).catch(() => {});
  csv()
    .fromString(result.data)
    .then((collection: CollectionRow[]) => {
      const headers = result.data
        .split("\n")[0]
        .split(",")
        .map((h) => h.replace(/"/g, ""));
      fs.writeFile(
        "./data/headers.json",
        JSON.stringify({ headers }, null, 3),
        (err: any) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
      console.log(`⬇️ Downloaded ${collection.length} items`);
      fs.writeFile(
        "./data/collection.json",
        JSON.stringify(collection, null, 3),
        (err: any) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
    });
};

downloadCollectionFromGDrive();
