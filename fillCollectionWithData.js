const _ = require("lodash");
const axios = require("axios");
const fs = require("fs");

const getCardInfo = async (cardName) => {
  const name = `${cardName.trim()}`;
  // console.log("==================");
  // console.log(name);
  const result = await axios
    .get(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(
        name
      )}`
    )
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
    // console.log("card code", card["Code"]);
    const cardSet = cardInfo["card_sets"].find((cs) => {
      // console.log("set code", cs["set_code"]);
      return (
        cs["set_code"].toLowerCase().trim().split("-")[0] ===
        card["Code"].toLowerCase().trim().split("-")[0]
      );
    });
    if (cardSet) {
      // console.log("Card set found", cardSet);
      return cardSet["set_name"];
    }
  }
  return "";
};

const getCardPrice = (card, cardInfo) => {
  const cardSets = cardInfo["card_sets"];
  if (!card["Set"] || !cardSets || cardSets.length === 0) {
    return 0;
  }
  const cardRarity = card["Rarity"] ? card["Rarity"].toLowerCase() : "common";
  const cardSet = cardSets.find((cardSet) => {
    return (
      cardSet["set_name"] === card["Set"] &&
      cardSet["set_rarity"].toLowerCase().includes(cardRarity)
    );
  });
  if (cardSet) {
    console.log(`$${cardSet["set_price"]}`);
    return cardSet["set_price"];
  }
  return 0;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const collection = require("./data/collection.json");
const collectionCopy = [...collection];

const cardIsComplete = (card) => {
  if (card["Type"] === "Skill Card") {
    return true;
  }
  if (card["Price"] === undefined) {
    console.log("Missing price");
    return false;
  }
  if (!card["Set"]) {
    console.log("Missing Set");
    return false;
  }
  if (!card["Type"]) {
    console.log("Missing Type");
    return false;
  }
  if (!card["Card Type"]) {
    console.log("Missing Card Type");
    return false;
  }
  if (!card["Is Speed Duel"]) {
    console.log("Missing Card Type");
    return false;
  }
  const cardHasEarliestSet = card["Earliest Set"] && card["Earliest Date"];
  return Boolean(cardHasEarliestSet);
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
          const earliestSet = getEarliestInfo(cardInfo, cardSetsByDate);
          card["Earliest Set"] = earliestSet.earliestSet || "";
          card["Earliest Date"] = earliestSet.earliestDate || "";
          const isSpeedDuel =
            set.toLowerCase().includes("speed duel") || card["Type"] === "Skill"
              ? "Yes"
              : "No";
          card["Is Speed Duel"] = isSpeedDuel;
          card["Price"] = getCardPrice(card, cardInfo);
        }
        sleep(100);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    fs.writeFile(
      "./data/collection.json",
      JSON.stringify(collectionCopy, null, 3),
      function (err) {
        if (err) console.error(err);
      }
    );
  }
};

mainFunction();
