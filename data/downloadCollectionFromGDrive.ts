import { CollectionRow } from "./data.types";
import axios from "axios";
import fs from "node:fs";
import csv from "csvtojson";

import collectionSecret from "../secret/collectionread.json";

export const downloadCollectionFromGDrive = async () => {
  const result = await axios
    .get<string>(collectionSecret.url)
    .catch((e: any) => {
      console.error(e);
    });
  if (result) {
    csv()
      .fromString(result.data)
      .then((collection: CollectionRow[]) => {
        const headers = result.data
          .split("\n")[0]
          .split(",")
          .map((h: any) => h.replace(/"/g, ""));
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
        // console.log(`⬇️ Downloaded ${collection.length} items`);
        // fs.writeFile(
        //   "./data/collection.json",
        //   JSON.stringify(collection, null, 3),
        //   (err: any) => {
        //     if (err) {
        //       console.error(err);
        //       return;
        //     }
        //   }
        // );
      });
  }
};

downloadCollectionFromGDrive();
