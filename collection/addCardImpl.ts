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
import { get } from "lodash";

export const normalizeCardCode = (cardCode: string): string => {
  // A normalized card code has 2 parts: set code and card number
  // Card number is always 3 digits, or one letter and 2 digits
  // Set code can be 3 or 4 alphanumeric characters
  const normalized = cardCode.trim().toUpperCase();

  const getPaddedCardNumber = (cardNumber: string): string => {
    if (cardNumber.length === 3) {
      return cardNumber;
    }
    if (cardNumber.length === 2) {
      if (cardNumber[0].match(/[A-Z]/)) {
        // Letter + 1 digits
        return `${cardNumber[0]}0${cardNumber[1]}`;
      }
      return `0${cardNumber}`;
    }
    return `00${cardNumber}`;
  };

  const getParts = () => {
    if (normalized.includes("-")) {
      return normalized.split("-");
    }
    if (normalized.includes(" ")) {
      return normalized.split(" ");
    }
    throw new Error("cardCode is only one word");
  };

  try {
    const [setCode, cardNumber] = getParts();
    return `${setCode}-${getPaddedCardNumber(cardNumber)}`;
  } catch (error) {
    // carry on
  }

  const getIndexOfLastLetter = () => {
    const reverseIndex = [...normalized]
      .reverse()
      .findIndex((char) => char.match(/[A-Z]/));
    return normalized.length - reverseIndex - 1;
  };

  const indexOfLastLetter = getIndexOfLastLetter();
  // Set with letters in the card number
  // Will always have a set code of 4 characters
  if (indexOfLastLetter > 3) {
    const setCode = normalized.slice(0, 4);
    const cardNumber = normalized.slice(4);
    return `${setCode}-${getPaddedCardNumber(cardNumber)}`;
  }

  const setCode = normalized.slice(0, indexOfLastLetter + 1);
  const cardNumber = normalized.slice(indexOfLastLetter + 1);
  return `${setCode}-${getPaddedCardNumber(cardNumber)}`;
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
