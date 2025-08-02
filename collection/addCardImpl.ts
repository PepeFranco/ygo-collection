import fs from "fs";
import terminalImage from "terminal-image";
import {
  getSetCodeFromCardCode,
  getCardsFromSet,
  findCardByCodeInSet,
  getCardSets,
} from "./fillCollectionWithDataImpl";
import { CollectionRow } from "../data/data.types";

const normalizeCardCode = (cardCode: string): string => {
  // Convert to uppercase and remove extra spaces
  let normalized = cardCode.toUpperCase().trim();
  
  // Handle improperly formatted codes like "LOB 1" -> "LOB-001"
  if (!normalized.includes('-')) {
    // Split by space and assume last part is the card number
    const parts = normalized.split(/\s+/);
    if (parts.length === 2) {
      const setCode = parts[0];
      const cardNumber = parts[1];
      // Pad card number to 3 digits
      const paddedNumber = cardNumber.padStart(3, '0');
      normalized = `${setCode}-${paddedNumber}`;
    }
  }
  
  return normalized;
};

export const addCardToCollection = async (
  cardCode: string
): Promise<boolean> => {
  try {
    // Normalize card code for consistency
    const normalizedCardCode = normalizeCardCode(cardCode);
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

    // TODO: Some cards have different rarities per set, when that is the case the CLI should prompt which rarity and user types a letter matching the corresponding rarity
    // TODO: Add types where missing
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
      // TODO: CLI should also prompt for edition
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
      const collectionData = fs.readFileSync("../data/collection.json", "utf8");
      collection = JSON.parse(collectionData);
    } catch (error) {
      console.log("📝 Creating new collection file");
    }

    // Add new card to collection
    collection.push(newCard);

    // Write back to file
    fs.writeFileSync(
      "../data/collection.json",
      JSON.stringify(collection, null, 3)
    );

    // Render the card image on the CLI tool
    if (cardInfo.card_images && cardInfo.card_images.length > 0) {
      try {
        const imageUrl = cardInfo.card_images[0].image_url_small;
        console.log(`🖼️  Card Image:`);
        const image = await terminalImage.buffer(
          await fetch(imageUrl).then(res => res.arrayBuffer()).then(buffer => Buffer.from(buffer))
        );
        console.log(image);
      } catch (error) {
        console.log(`❌ Could not display card image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Added card: ${cardInfo.name} (${normalizedCardCode}) to collection`);
    console.log(`📊 Collection now has ${collection.length} cards`);

    return true;
  } catch (error) {
    console.error("❌ Error adding card:", error);
    return false;
  }
};
