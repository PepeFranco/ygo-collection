// TODO: Replace axios with fetch
import _ from "lodash";
import axios from "axios";
import fs from "fs";
import path from "path";
import type {
  CollectionRow,
  YGOProCard,
  YGOProCardSet,
  YGOProSet,
} from "../data/data.types";

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

export const getCardSets = async (): Promise<YGOProSet[] | null> => {
  // First try to read from local file
  try {
    const localSets = fs.readFileSync(
      path.join(__dirname, "../data/cardsets.json"),
      "utf8"
    );
    const cardSets = JSON.parse(localSets) as YGOProSet[];
    console.log(
      `📁 Using cached cardsets from local file (${cardSets.length} sets)`
    );
    return cardSets;
  } catch (error) {
    // If file doesn't exist or can't be read, fall back to API
    console.log("🌐 Fetching cardsets from API (local file not found)");
    const result = await axios
      .get("https://db.ygoprodeck.com/api/v7/cardsets.php")
      .catch((e) => {
        // console.error(e);
      });

    if (result && result.data) {
      const cardSets = result.data as YGOProSet[];
      // Write fetched cardsets to local file for future caching
      fs.writeFileSync(
        path.join(__dirname, "../data/cardsets.json"),
        JSON.stringify(cardSets, null, 3)
      );
      return cardSets;
    }

    return null;
  }
};

export const getSetCodeFromCardCode = (cardCode: string): string => {
  // Extract set code from card code (e.g., "LOB" from "LOB-001")
  return cardCode.split("-")[0];
};

export const cardCodesMatch = (
  searchCode: string,
  actualCode: string
): boolean => {
  // Handle optional language code between set prefix and numbers
  // "YSKR-001" should match "YSKR-EN001" or "YSKR-001"
  const parts = searchCode.split("-");
  if (parts.length === 2) {
    const [setPrefix, cardNumber] = parts;
    // Create pattern: YSKR-([A-Z]{2})?001 - language code is inserted without extra dash
    const pattern = `^${setPrefix}-(?:[A-Z]{2})?${cardNumber}$`;
    const regex = new RegExp(pattern);
    return regex.test(actualCode);
  }

  // Fallback to exact match
  return actualCode === searchCode;
};

export const getCardsFromSet = async (
  setCode: string,
  cardSets: YGOProSet[]
): Promise<YGOProCard[] | null> => {
  // Find all sets with matching code (handles cases like collectible tins with multiple waves)
  const matchingSets = cardSets.filter((set) => set.set_code === setCode);
  if (matchingSets.length === 0) return null;

  const allCards: YGOProCard[] = [];

  // Get cards from all matching sets
  for (const matchingSet of matchingSets) {
    // Create filename for cache
    const fileName = matchingSet.set_name
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    const filePath = path.join(
      __dirname,
      "../data/cardsets",
      `${fileName}.json`
    );

    let cards: YGOProCard[] | null = null;

    // First try to read from local cache file
    try {
      const localCards = fs.readFileSync(filePath, "utf8");
      cards = JSON.parse(localCards) as YGOProCard[];
      console.log(
        `📁 Using cached cards for set "${matchingSet.set_name}" from local file`
      );
    } catch (error) {
      // If file doesn't exist or can't be read, fall back to API
      console.log(
        `🌐 Fetching cards for set "${matchingSet.set_name}" from API (local file not found)`
      );
      const result = await axios
        .get(
          `https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${encodeURIComponent(
            matchingSet.set_name
          )}`
        )
        .catch((e) => {
          // console.error(e);
        });

      if (result && result.data && result.data.data) {
        cards = result.data.data as YGOProCard[];

        // Write fetched cards to local file for caching
        try {
          fs.writeFileSync(filePath, JSON.stringify(cards, null, 3));
        } catch (err) {
          console.error(err);
        }
      }
    }

    // Add cards from this set to the combined collection
    if (cards) {
      allCards.push(...cards);
    }
  }

  return allCards.length > 0 ? allCards : null;
};

export const findCardByCodeInSet = (
  cards: YGOProCard[],
  cardCode: string
): YGOProCard | null => {
  return (
    cards.find((card) => {
      if (!card.card_sets) return false;
      return card.card_sets.some((cardSet) =>
        cardCodesMatch(cardCode, cardSet.set_code)
      );
    }) || null
  );
};

export const getEarliestInfo = (
  cardInfo: YGOProCard,
  cardSets: YGOProSet[]
) => {
  if (!cardInfo || !cardInfo.card_sets || cardInfo.card_sets.length === 0) {
    return {
      earliestSet: "",
      earliestDate: "",
      earliestCardSetInfo: null,
    };
  }

  // Get unique set names that this card appears in
  const cardSetNames = [
    ...new Set(cardInfo.card_sets.map((cs: any) => cs.set_name)),
  ];

  // Filter cardSets to only include sets this card appears in
  const relevantCardSets = cardSets.filter((cs: any) =>
    cardSetNames.includes(cs.set_name)
  );

  // Sort by date and pick the earliest
  const sortedBySets = relevantCardSets
    .filter((cs: any) => cs.tcg_date) // Only include sets with dates
    .sort(
      (a: any, b: any) =>
        new Date(a.tcg_date).getTime() - new Date(b.tcg_date).getTime()
    );

  if (sortedBySets.length > 0) {
    const earliest = sortedBySets[0];
    const earliestCardSetInfo = cardInfo.card_sets.find(
      (cs: any) => cs.set_name === earliest.set_name
    );

    return {
      earliestSet: earliest.set_name,
      earliestDate: earliest.tcg_date,
      earliestCardSetInfo,
    };
  }

  return {
    earliestSet: "",
    earliestDate: "",
    earliestCardSetInfo: null,
  };
};

export const isSpeedDuelSet = (setName: string): boolean => {
  return setName?.toLowerCase().includes("speed duel") || false;
};

export const isCardSpeedDuelLegal = (cardInfo: YGOProCard): boolean => {
  if (!cardInfo.card_sets) return false;
  return cardInfo.card_sets.some((cs: any) => isSpeedDuelSet(cs.set_name));
};

export const getSpeedDuelInfo = (cardInfo: YGOProCard, cardSet: any) => {
  const isSpeedDuel = isSpeedDuelSet(cardSet.set_name) ? "Yes" : "No";
  const isSpeedDuelLegal = isCardSpeedDuelLegal(cardInfo) ? "Yes" : "";

  return {
    isSpeedDuel,
    isSpeedDuelLegal,
  };
};

export const getCardForCollection = (
  cardInfo: YGOProCard,
  setCode: string,
  setName: string,
  setRarity: string,
  edition: string = "",
  cardSets: YGOProSet[]
): CollectionRow => {
  // Get earliest set information
  const earliestInfo = getEarliestInfo(cardInfo, cardSets);

  // Create cardSet object for Speed Duel info
  const cardSet = {
    set_name: setName,
    set_code: setCode,
    set_rarity: setRarity,
  };
  const speedDuelInfo = getSpeedDuelInfo(cardInfo, cardSet);

  // Handle special case for Skill cards in fillCollectionWithDataImpl
  const isSpeedDuel =
    speedDuelInfo.isSpeedDuel === "Yes" || cardInfo.type === "Skill"
      ? "Yes"
      : "No";

  return {
    Name: cardInfo.name,
    Code: setCode,
    Set: setName,
    Rarity: setRarity,
    Edition: edition,
    "In Deck": "",
    ID: cardInfo.id || 0,
    Type: cardInfo.type || "",
    ATK: cardInfo.atk || 0,
    DEF: cardInfo.def || 0,
    Level: cardInfo.level || 0,
    "Card Type": cardInfo.race || "",
    Attribute: cardInfo.attribute || "",
    Archetype: cardInfo.archetype || "",
    Scale: cardInfo.scale?.toString() || "",
    "Link Scale": cardInfo.linkval?.toString() || "",
    "Earliest Set": earliestInfo.earliestSet,
    "Earliest Date": earliestInfo.earliestDate,
    "Is Speed Duel": isSpeedDuel,
    "Is Speed Duel Legal": speedDuelInfo.isSpeedDuelLegal,
    Keep: "",
    Price: 0, // Will be set separately based on the specific card set pricing logic
  } as unknown as CollectionRow;
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
          // Convert "Short Print" rarities to "Common" to normalize rarity values
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

export const mainFunction = async () => {
  const collection = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/collection.json"), "utf8")
  );
  const collectionCopy = [...collection];

  try {
    const cardSets = await getCardSets();
    if (!cardSets) {
      console.log("❌ Unable to fetch card sets");
      return;
    }

    for (let i = 0; i < collectionCopy.length; i++) {
      const card = collectionCopy[i];

      if (!cardIsComplete(card)) {
        console.log(`${card["Name"]} is incomplete, fetching data...`);
        // Fetch by code instead of name
        let cardInfo = await getCardInfo(card["Name"]);
        // let cardInfo = null;

        // Code-based lookup
        if (card["Code"]) {
          const setCode = getSetCodeFromCardCode(card["Code"]);
          const setCards = await getCardsFromSet(setCode, cardSets);
          if (setCards) {
            cardInfo = findCardByCodeInSet(setCards, card["Code"]);
          }
        }

        if (cardInfo) {
          const set = getCardSet(card, cardInfo);

          // Use shared function to get card data, then merge with existing data
          const newCardData = getCardForCollection(
            cardInfo,
            (set && set["set_code"]) || String(card["Code"]) || "",
            card["Set"] || (set && set["set_name"]) || "",
            card["Rarity"] ||
              (set && set["set_rarity"] && set["set_rarity"].split(" ")[0]) ||
              "",
            String(card["Edition"]) || "",
            cardSets
          );

          // Merge the new data with existing card, preserving existing values where appropriate
          Object.keys(newCardData).forEach((key) => {
            const typedKey = key as keyof CollectionRow;
            if (typedKey === "Price") {
              // Handle price separately using existing logic
              card[typedKey] = getCardPrice(card, cardInfo);
            } else if (
              card[typedKey] === undefined ||
              card[typedKey] === "" ||
              card[typedKey] === 0
            ) {
              // Only update if the existing value is empty/undefined/zero
              card[typedKey] = newCardData[typedKey];
            }
          });
        }
        sleep(100);
      }
    }
  } catch (e) {
    // console.error(e);
  } finally {
    fs.writeFileSync(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(collectionCopy, null, 3)
    );
  }
};
