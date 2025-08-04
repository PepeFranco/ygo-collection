import fs from "fs";
import path from "path";
import terminalImage from "terminal-image";
import {
  getSetCodeFromCardCode,
  getCardsFromSet,
  findCardByCodeInSet,
  getCardSets,
  cardCodesMatch,
  getCardForCollection,
} from "./fillCollectionWithDataImpl";
import { CollectionRow } from "../data/collection.types";

export const normalizeCardCode = (cardCode: string): string => {
  // A normalized card code has 2 parts: set code and card number
  // Card number is always 3 digits, or one letter and 2 digits
  // Set code can be 3 or 4 alphanumeric characters

  // Remove extra spaces but preserve case for later processing
  let input = cardCode.trim();
  // Convert to uppercase for pattern matching, but keep original for letter extraction
  let normalized = input.toUpperCase();

  // If already properly formatted with dash, return as is
  if (normalized.includes("-") && normalized.match(/^[A-Z0-9]+-[A-Z0-9]+$/)) {
    // Still need to pad the card number part
    const parts = normalized.split("-");
    const setCode = parts[0];
    const cardNumber = parts[1];

    // If card number is all digits, pad to 3 digits
    if (/^\d+$/.test(cardNumber)) {
      return `${setCode}-${cardNumber.padStart(3, "0")}`;
    }
    // If card number starts with letter, keep as is but ensure 2 digits after letter
    if (/^[A-Z]\d+$/.test(cardNumber)) {
      const letter = cardNumber[0];
      const digits = cardNumber.substring(1);
      return `${setCode}-${letter}${digits.padStart(2, "0")}`;
    }
    return normalized;
  }

  // Remove spaces and handle different input formats
  const spacedInput = normalized.replace(/\s+/g, " ").trim();

  // Handle space-separated format like "ct14 2" or "sgx1 a1"
  if (spacedInput.includes(" ")) {
    const parts = spacedInput.split(" ");
    if (parts.length === 2) {
      const setCode = parts[0];
      const cardNumber = parts[1];

      // If card number is all digits, pad to 3 digits
      if (/^\d+$/.test(cardNumber)) {
        return `${setCode}-${cardNumber.padStart(3, "0")}`;
      }
      // If card number starts with letter, keep as is but ensure 2 digits after letter
      if (/^[A-Z]\d+$/.test(cardNumber)) {
        const letter = cardNumber[0];
        const digits = cardNumber.substring(1);
        return `${setCode}-${letter}${digits.padStart(2, "0")}`;
      }
    }
  }

  // Handle concatenated format without spaces or dashes
  const cleanNormalized = normalized.replace(/\s+/g, "");
  const cleanInput = input.replace(/\s+/g, "");

  // Pattern for numeric card numbers like "lob1" -> "LOB-001"
  // Set code should be 3 or 4 letters, card number should be digits only
  // Check this BEFORE alphanumeric to avoid conflicts like "yskr1" being parsed as "ysk" + "r1"
  const numericMatch = cleanNormalized.match(/^([A-Z]{3,4})(\d+)$/);
  if (numericMatch) {
    const setCode = numericMatch[1];
    const cardNumber = numericMatch[2];
    return `${setCode}-${cardNumber.padStart(3, "0")}`;
  }

  // Pattern for alphanumeric card numbers like "sgx1a1" -> "SGX1-A01"
  // Set code should be 3 or 4 alphanumeric characters
  const alphaNumMatch = cleanNormalized.match(/^([A-Z0-9]{3,4})([A-Z]\d+)$/);
  if (alphaNumMatch) {
    const setCode = alphaNumMatch[1];
    // Extract the original letter from the input to preserve case
    const originalMatch = cleanInput.match(/^([A-Za-z0-9]{3,4})([A-Za-z]\d+)$/);
    if (originalMatch) {
      const originalCardNumber = originalMatch[2];
      const letter = originalCardNumber[0].toUpperCase(); // Always uppercase the letter
      const digits = originalCardNumber.substring(1);
      return `${setCode}-${letter}${digits.padStart(2, "0")}`;
    }
    // Fallback
    const cardNumber = alphaNumMatch[2];
    const letter = cardNumber[0];
    const digits = cardNumber.substring(1);
    return `${setCode}-${letter}${digits.padStart(2, "0")}`;
  }

  // If we can't parse it, return as is
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

    // Create collection entry using shared function
    const newCard = getCardForCollection(
      cardInfo,
      cardSet.set_code,
      cardSet.set_name,
      cardSet.set_rarity || "",
      edition || "",
      cardSets
    );

    // Set the price based on the specific card set
    (newCard.Price as unknown as number) = parseFloat(cardSet.set_price) || 0;

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
