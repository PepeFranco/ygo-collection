import collection from "./data/collection.json";
import fs from "node:fs";
import path from "node:path";
import _ from "lodash";

const collectionCopy = collection.map((row) => {
  const { field23, field24, field25, ...restFields } = row;
  return { ...restFields };
});

fs.writeFileSync(
  path.join(__dirname, "./data/collection.json"),
  JSON.stringify(collectionCopy, null, 3)
);
