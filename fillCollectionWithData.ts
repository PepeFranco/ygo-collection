import _ from "lodash";
import axios from "axios";
import fs from "fs";
import type {
  CollectionRow,
  YGOProCard,
  YGOProCardSet,
  YGOProSet,
} from "./data/data.types";

const getCardInfo = async (cardName: string): Promise<YGOProCard | null> => {
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
  return (result && (result.data.data[0] as YGOProCard)) || null;
};

const getCardSets = async (): Promise<YGOProSet[] | null> => {
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardsets.php")
    .catch((e) => {
      // console.error(e);
    });

  return (result && (result.data as YGOProSet[])) || null;
};

const getEarliestInfo = (cardInfo: YGOProCard, cardSetsByDate: YGOProSet[]) => {
  if (!cardInfo) {
    return {};
  }
  const earliestSet = cardSetsByDate.find((currentSet) => {
    if (!cardInfo.card_sets) {
      return false;
    }
    const found = cardInfo.card_sets.find(
      (cardSet) => cardSet.set_name === currentSet.set_name
    );
    if (found) {
      return true;
    }
  });
  return {
    earliestSet: (earliestSet && earliestSet.set_name) || "",
    earliestDate: (earliestSet && earliestSet.tcg_date) || "",
  };
};

const getCardSet = (
  card: CollectionRow,
  cardInfo: YGOProCard
): YGOProCardSet | undefined => {
  if (card["Code"] && cardInfo["card_sets"]) {
    // console.log("card code", card["Code"]);
    const cardSet = _.uniqBy(
      cardInfo["card_sets"]
        .map((cs) => ({
          ...cs,
          set_rarity: cs["set_rarity"].toLowerCase().includes("short")
            ? "Common"
            : cs["set_rarity"],
        }))
        .filter((cs) => {
          console.log("set code", cs["set_code"], cs["set_rarity"]);
          return (
            cs["set_code"].toLowerCase().trim().split("-")[0] ===
            card["Code"]?.toLowerCase().trim().split("-")[0]
          );
        }),
      (cs) => cs["set_rarity"]
    );

    if (cardSet.length > 0) {
      if (cardSet.length === 1) {
        console.log("Card set found", cardSet[0]);
        return cardSet[0];
      }

      console.log(
        "Multiple card sets found: ",
        cardSet.map((cs) => cs["set_name"]).join(",")
      );

      const cardRarity = card["Rarity"];
      if (cardRarity !== undefined) {
        const setWithCorrectRarity = cardSet.find((cardSet) => {
          const setRarity = cardSet["set_rarity"].toLowerCase();
          console.log({ setRarity }, card.Rarity);
          return setRarity.includes(cardRarity.toLowerCase());
        });
        if (setWithCorrectRarity) {
          return setWithCorrectRarity;
        }
      }

      console.log(
        `-> Set ${cardSet[0]["set_name"]} includes several rarities: ${cardSet
          .map((cs) => cs["set_rarity"].split(" ")[0])
          .join(",")}`
      );
    }
  }
  return undefined;
};

const getCardPrice = (card: CollectionRow, cardInfo: YGOProCard) => {
  const cardSets = cardInfo["card_sets"];
  if (!card["Set"] || !cardSets || cardSets.length === 0) {
    return 0;
  }
  const cardRarity = card["Rarity"];
  if (cardRarity) {
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
  }
  return 0;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const collection = require("./data/collection.json");
const collectionCopy = [...collection];

const cardIsComplete = (card: CollectionRow) => {
  if (card["Type"] === "Skill Card") {
    // console.log("========================");
    // console.log("Card is Skill Card", card["Name"]);
    return true;
  }

  if (card["Price"] === undefined) {
    console.log("========================");
    console.log("Missing price");
    return false;
  }
  if (!card["Set"]) {
    console.log("========================");
    console.log("Missing Set");
    return false;
  }
  if (!card["Type"]) {
    console.log("========================");
    console.log("Missing Type");
    return false;
  }
  if (!card["Card Type"]) {
    console.log("========================");
    console.log("Missing Card Type");
    return false;
  }
  if (!card["Is Speed Duel"]) {
    console.log("========================");
    console.log("Missing Speed Duel");
    return false;
  }
  const cardHasEarliestSet = card["Earliest Set"] && card["Earliest Date"];
  if (!cardHasEarliestSet) {
    console.log("========================");
    console.log("Missing Earliest Set");
  }
  return Boolean(cardHasEarliestSet);
};

const mainFunction = async () => {
  try {
    const cardSets = await getCardSets();
    const cardSetsByDate = _.sortBy(cardSets, ["tcg_date"]);
    for (let i = 0; i < collectionCopy.length; i++) {
      const card = collectionCopy[i];

      if (!cardIsComplete(card)) {
        const cardInfo = await getCardInfo(card["Name"]);
        console.log(
          `${card["Name"]} (${card["Code"]}). Card info found: ${Boolean(
            cardInfo
          )}`
        );
        if (cardInfo) {
          const set = getCardSet(card, cardInfo);
          card["Name"] = cardInfo.name;
          card["Set"] = card["Set"] || (set && set["set_name"]) || "";
          card["Code"] = (set && set["set_code"]) || card["Code"] || "";
          card["Rarity"] =
            card["Rarity"] ||
            (set && set["set_rarity"] && set["set_rarity"].split(" ")[0]);
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
            (set &&
              set["set_name"] &&
              set["set_name"].toLowerCase().includes("speed duel")) ||
            card["Type"] === "Skill"
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
