import fs from "fs";
import {
  getSetCodeFromCardCode,
  getCardsFromSet,
  findCardByCodeInSet,
  getCardSets,
} from "./fillCollectionWithDataImpl";
import { CollectionRow } from "./data/data.types";

export const addCardToCollection = async (
  cardCode: string
): Promise<boolean> => {
  try {
    // Convert card code to uppercase for consistency
    const normalizedCardCode = cardCode.toUpperCase();
    console.log(`🔍 Looking up card with code: ${normalizedCardCode}`);

    // Get card sets (from cache or API)
    const cardSets = await getCardSets();
    if (!cardSets) {
      console.log("❌ Unable to fetch card sets");
      return false;
    }

    // Extract set code and get cards from that set
    const setCode = getSetCodeFromCardCode(normalizedCardCode);
    const setCards = await getCardsFromSet(setCode, cardSets);

    if (!setCards) {
      console.log(`❌ Unable to find cards for set: ${setCode}`);
      return false;
    }

    // Find the specific card by code
    const cardInfo = findCardByCodeInSet(setCards, normalizedCardCode);

    if (!cardInfo) {
      console.log(`❌ Card not found with code: ${normalizedCardCode}`);
      return false;
    }

    // Get the card set info for this specific card
    const cardSet = cardInfo.card_sets?.find(
      (set: any) => set.set_code === normalizedCardCode
    );

    if (!cardSet) {
      console.log(`❌ Set information not found for code: ${normalizedCardCode}`);
      return false;
    }

    // Create collection entry
    const newCard: CollectionRow = {
      Name: cardInfo.name,
      Code: cardSet.set_code,
      Set: cardSet.set_name,
      Rarity: cardSet.set_rarity?.split(" ")[0] || "",
      Edition: "",
      "In Deck": "",
      ID: cardInfo.id?.toString() || "",
      Type: cardInfo.type || "",
      ATK: cardInfo.atk?.toString() || "",
      DEF: cardInfo.def?.toString() || "",
      Level: cardInfo.level?.toString() || "",
      "Card Type": cardInfo.race || "",
      Attribute: cardInfo.attribute || "",
      Archetype: cardInfo.archetype || "",
      Scale: cardInfo.scale?.toString() || "",
      "Link Scale": cardInfo.linkval?.toString() || "",
      "Earliest Set": "", // Will be filled by existing logic if needed
      "Earliest Date": "",
      "Is Speed Duel": cardSet.set_name?.toLowerCase().includes("speed duel")
        ? "Yes"
        : "No",
      "Is Speed Duel Legal": "",
      Keep: "",
      Price: cardSet.set_price || "0",
    };

    // Read existing collection
    let collection: CollectionRow[] = [];
    try {
      const collectionData = fs.readFileSync("./data/collection.json", "utf8");
      collection = JSON.parse(collectionData);
    } catch (error) {
      console.log("📝 Creating new collection file");
    }

    // Add new card to collection
    collection.push(newCard);

    // Write back to file
    fs.writeFileSync(
      "./data/collection.json",
      JSON.stringify(collection, null, 3)
    );

    console.log(`✅ Added card: ${cardInfo.name} (${normalizedCardCode}) to collection`);
    console.log(`📊 Collection now has ${collection.length} cards`);

    return true;
  } catch (error) {
    console.error("❌ Error adding card:", error);
    return false;
  }
};
