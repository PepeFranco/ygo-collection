import cardSets from "../data/cardsets.json";
import fs from "fs";
import path from "path";

console.log(`-> There are ${cardSets.length} total sets`);

const structureDeckSets = cardSets.filter((cardSet) => {
  const setName = cardSet.set_name.toLowerCase();
  return (
    setName.includes("structure") &&
    !setName.includes("special") &&
    !setName.includes("deluxe")
  );
});

console.log(`-> There are ${structureDeckSets.length} structure deck sets`);

fs.writeFileSync(
  path.join(__dirname, "../data/structureDecks/cardsets.json"),
  JSON.stringify(structureDeckSets, null, 3)
);
