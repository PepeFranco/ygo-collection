const _ = require("lodash");
const axios = require("axios");
const fs = require("fs");

const getCardInfo = async (cardName) => {
  const name = `${cardName.trim()}`;
  // console.log("==================");
  // console.log(name);
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardinfo.php?name=" + name)
    .catch((e) => {
      // console.error(e);
    });

  // console.log(result);
  return (result && result.data.data[0]) || null;
};

const getCardSets = async () => {
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardsets.php")
    .catch((e) => {
      // console.error(e);
    });

  return (result && result.data) || null;
};

const getEarliestInfo = (cardInfo, cardSetsByDate) => {
  if (!cardInfo) {
    return {};
  }
  const earliestSet = _.find(cardSetsByDate, (currentSet) => {
    if (!cardInfo.card_sets) {
      return;
    }
    const found = cardInfo.card_sets.find(
      (cardSet) => cardSet.set_name === currentSet.set_name
    );
    if (found) {
      return found;
    }
  });
  return {
    earliestSet: (earliestSet && earliestSet.set_name) || "",
    earliestDate: (earliestSet && earliestSet.tcg_date) || "",
  };
};

const getCardSetName = (card, cardInfo) => {
  if (card["Code"] && cardInfo["card_sets"]) {
    console.log("card code", card["Code"]);
    const cardSet = cardInfo["card_sets"].find((cs) => {
      console.log("set code", cs["set_code"]);
      return (
        cs["set_code"].toLowerCase().trim().split("-")[0] ===
        card["Code"].toLowerCase().trim().split("-")[0]
      );
    });
    if (cardSet) {
      console.log("Card set found", cardSet);
      return cardSet["set_name"];
    }
  }
  return "";
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const collection = require("./data/collection.json");
const collectionCopy = [...collection];

const cardIsComplete = (card) => {
  return Boolean(
    card["Set"] &&
      card["ID"] &&
      card["Card Type"] &&
      card["Description"] &&
      ((card["Earliest Set"] && card["Earliest Date"]) ||
        card["Type"] === "Skill Card") &&
      card["Is Speed Duel"]
  );
};

const mainFunction = async () => {
  try {
    const cardSets = await getCardSets();
    const cardSetsByDate = _.orderBy(cardSets, ["tcg_date"]);
    for (let i = 0; i < collectionCopy.length; i++) {
      const card = collectionCopy[i];
      if (!cardIsComplete(card)) {
        const cardInfo = await getCardInfo(card["Name"]);
        console.log("========================");
        console.log(card["Name"], card["Code"]);
        if (cardInfo) {
          const set = getCardSetName(card, cardInfo);
          card["Set"] = card["Set"] || set || "";
          card["Rarity"] = card["Rarity"] || "Common";
          card["ID"] = cardInfo.id || "";
          card["Type"] = cardInfo.type || "";
          card["ATK"] = cardInfo.atk || "";
          card["DEF"] = cardInfo.def || "";
          card["Level"] = cardInfo.level || "";
          card["Card Type"] = cardInfo.race || "";
          card["Attribute"] = cardInfo.attribute || "";
          card["Archetype"] = cardInfo.archetype || "";
          card["Scale"] = cardInfo.scale || "";
          card["Link Scale"] = cardInfo.linkval || "";
          card["Description"] = cardInfo.desc || "";
          const earliestSet = getEarliestInfo(cardInfo, cardSetsByDate);
          card["Earliest Set"] = earliestSet.earliestSet || "";
          card["Earliest Date"] = earliestSet.earliestDate || "";
          const isSpeedDuel = set.toLowerCase().includes("speed duel")
            ? "Yes"
            : "No";
          card["Is Speed Duel"] = isSpeedDuel;
        }
        sleep(100);
      }
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
