import fs from "fs";
import path from "path";
import terminalImage from "terminal-image";
import {
  getSetCodeFromCardCode,
  getCardsFromSet,
  findCardByCodeInSet,
  getCardSets,
  cardCodesMatch,
} from "./fillCollectionWithDataImpl";
import { CollectionRow } from "../data/collection.types";

const normalizeCardCode = (cardCode: string): string => {
  // Convert to uppercase and remove extra spaces
  let normalized = cardCode.toUpperCase().trim();

  // Handle improperly formatted codes like "LOB 1" -> "LOB-001" or "LOB1" -> "LOB-001"
  if (!normalized.includes("-")) {
    // Split by space and assume last part is the card number
    const parts = normalized.split(/\s+/);
    if (parts.length === 2) {
      const setCode = parts[0];
      const cardNumber = parts[1];
      // Pad card number to 3 digits
      const paddedNumber = cardNumber.padStart(3, "0");
      normalized = `${setCode}-${paddedNumber}`;
    } else if (parts.length === 1) {
      // Handle cases like "LOB1" where there's no space or dash
      // Find where letters end and numbers begin
      let setCode = "";
      let cardNumber = "";
      for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        if (char >= "A" && char <= "Z") {
          setCode += char;
        } else if (char >= "0" && char <= "9") {
          cardNumber = normalized.substring(i);
          break;
        }
      }
      if (setCode && cardNumber) {
        // Pad card number to 3 digits
        const paddedNumber = cardNumber.padStart(3, "0");
        normalized = `${setCode}-${paddedNumber}`;
      }
    }
  }

  return normalized;
};

export const addCardToCollection = async (
  cardCode: string,
  selectedRarity?: string,
  edition?: string
): Promise<boolean | { error: string; rarities: string[] }> => {
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

    console.log(`🃏 Found card: ${cardInfo.name}`);

    // Render the card image on the CLI tool (only if no rarity was pre-selected)
    if (
      !selectedRarity &&
      cardInfo.card_images &&
      cardInfo.card_images.length > 0
    ) {
      try {
        const imageUrl = cardInfo.card_images[0].image_url_small;
        const image = await terminalImage.buffer(
          await fetch(imageUrl)
            .then((res) => res.arrayBuffer())
            .then((buffer) => Buffer.from(buffer)),
          { height: 15 }
        );
        console.log(image);
      } catch (error) {
        console.log(
          `❌ Could not display card image: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Check for multiple rarities for this card code
    const matchingSets =
      cardInfo.card_sets?.filter((set: any) =>
        cardCodesMatch(normalizedCardCode, set.set_code)
      ) || [];

    if (matchingSets.length === 0) {
      console.log(
        `❌ Set information not found for code: ${normalizedCardCode}`
      );
      return false;
    }

    let cardSet;
    // If multiple rarities exist
    if (matchingSets.length > 1) {
      if (!selectedRarity) {
        const rarities = matchingSets.map((set: any) => set.set_rarity);
        return {
          error: "Multiple rarities found for this card code",
          rarities: rarities,
        };
      }

      // If a specific rarity was selected, find the matching set
      cardSet = matchingSets.find((set: any) =>
        set.set_rarity.includes(selectedRarity)
      );
      if (!cardSet) {
        console.log(
          `❌ Selected rarity "${selectedRarity}" not found for this card`
        );
        return false;
      }
    } else {
      // Single rarity found, proceed with adding the card
      cardSet = matchingSets[0];
    }

    // Create collection entry
    const newCard: CollectionRow = {
      Name: cardInfo.name,
      Code: cardSet.set_code,
      Set: cardSet.set_name,
      Rarity: cardSet.set_rarity || "",
      Edition: edition || "",
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
      const collectionData = fs.readFileSync(
        path.join(__dirname, "../data/collection.json"),
        "utf8"
      );
      collection = JSON.parse(collectionData);
    } catch (error) {
      console.log("📝 Creating new collection file");
    }

    // Add new card to collection
    collection.push(newCard);

    // Write back to file
    fs.writeFileSync(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(collection, null, 3)
    );

    console.log(
      `✅ Added card: ${cardInfo.name} (${normalizedCardCode}) to collection`
    );
    console.log(`📊 Collection now has ${collection.length} cards`);

    return true;
  } catch (error) {
    console.error("❌ Error adding card:", error);
    return false;
  }
};
