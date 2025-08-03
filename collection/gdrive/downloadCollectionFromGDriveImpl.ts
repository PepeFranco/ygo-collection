import { CollectionRow } from "../../data/data.types";
import fs from "node:fs";
import csv from "csvtojson";
import path from "path";
import { execSync } from "node:child_process";

import collectionSecret from "../../secret/collectionread.json";

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
        path.join(__dirname, "../../data/headers.json"),
        JSON.stringify({ headers }, null, 3)
      );

      // Auto-regenerate TypeScript types from updated headers
      try {
        console.log("🔄 Regenerating TypeScript types from updated headers...");
        execSync("yarn generate:types", { cwd: path.join(__dirname, "../.."), stdio: "inherit" });
      } catch (error) {
        console.warn("⚠️ Warning: Failed to regenerate types:", error);
      }

      const collection: CollectionRow[] = await csv().fromString(rawData);
      console.log(`⬇️ Downloaded ${collection.length} items`);
      fs.writeFileSync(
        path.join(__dirname, "../../data/collection.json"),
        JSON.stringify(collection, null, 3)
      );
    }
  } catch (error) {
    console.error(error);
  }
};