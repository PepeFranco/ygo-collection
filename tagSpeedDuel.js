const _ = require("lodash");
const fs = require("fs");

const collection = require("./data/collection.json");
const collectionCopy = [...collection];
const speedDuelLegal = collectionCopy
  .filter((c) => c["Is Speed Duel"] === "Yes")
  .map((c) => c["Name"]);

const mainFunction = async () => {
  try {
    for (let i = 0; i < collectionCopy.length; i++) {
      const card = collectionCopy[i];
      const isSpeedDuel = card["Set"].toLowerCase().includes("speed duel")
        ? "Yes"
        : "No";
      card["Is Speed Duel"] = isSpeedDuel;
      card["Is Speed Duel Legal"] =
        speedDuelLegal.includes(card["Name"]) || isSpeedDuel === "Yes";
      console.log(card["Name"]);
    }
  } catch (e) {
    console.error(e);
  } finally {
    fs.writeFile(
      "./collectionScripts/data/collection.json",
      JSON.stringify(collectionCopy, null, 3),
      function (err) {
        if (err) console.error(err);
      }
    );
  }
};

mainFunction();
