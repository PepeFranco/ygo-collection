import cardSets from "../data/cardsets.json";
import fs from "fs";
import path from "path";
import { debug } from "../debug";

debug(`-> There are ${cardSets.length} total sets`);

const speedDuelSets = cardSets.filter((cardSet) => {
  const setName = cardSet.set_name.toLowerCase();
  return setName.includes("speed duel");
});

debug(`-> There are ${speedDuelSets.length} speed duel sets`);

fs.writeFileSync(
  path.join(__dirname, "../data/speedDuel/cardsets.json"),
  JSON.stringify(speedDuelSets, null, 3)
);
