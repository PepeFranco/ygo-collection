import * as readline from "readline";
import { normalizeCardCode } from "./addCardImpl";
import type { CollectionRow } from "../data/data.types";
import fs from "node:fs";
import path from "path";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m", // Mode selection
  green: "\x1b[32m", // Individual card codes
  cyan: "\x1b[36m", // Batch set codes
  yellow: "\x1b[33m", // Rarity selection
  magenta: "\x1b[35m", // Edition selection
  brightGreen: "\x1b[92m", // Batch card numbers
};

// Helper function to colorize prompts
const colorPrompt = (text: string, color: string): string => {
  return `${color}${text}${colors.reset}`;
};

export interface CLIInterface {
  question: (prompt: string) => Promise<string>;
  close: () => void;
}

// Helper to promisify readline
const createPromiseInterface = (rl: readline.Interface): CLIInterface => ({
  question: (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  },
  close: () => rl.close(),
});

export const createCLI = (rlInterface?: CLIInterface) => {
  const rl =
    rlInterface ||
    createPromiseInterface(
      readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
    );

  // Shared utility functions
  const promptForEdition = async (): Promise<string> => {
    console.log("\nEdition options:");
    console.log("1. 1st Edition");
    console.log("2. Limited Edition");
    console.log("Press Enter for no edition");

    const editionInput = await rl.question(
      colorPrompt("Select edition (1/2 or Enter): ", colors.magenta)
    );
    const trimmedEditionInput = editionInput.trim();
    let selectedEdition = "";

    if (trimmedEditionInput === "1") {
      selectedEdition = "1st";
      console.log("🏷️ Selected: 1st Edition");
    } else if (trimmedEditionInput === "2") {
      selectedEdition = "LIMITED";
      console.log("🏷️ Selected: Limited Edition");
    } else {
      console.log("🏷️ No edition selected");
    }

    return selectedEdition;
  };

  const deleteCardFromCollection = async ({
    cardCode,
    selectedRarity,
    selectedSetCode,
    edition,
  }: {
    cardCode: string;
    selectedRarity?: string;
    selectedSetCode?: string;
    edition?: string;
  }) => {
    // Normalize card code for consistency
    const normalizedCardCode = normalizeCardCode(cardCode);
    console.log(`🔍 Looking up card with code: ${normalizedCardCode}`);

    let collection: CollectionRow[] = [];
    try {
      const collectionData = fs.readFileSync(
        path.join(__dirname, "../data/collection.json"),
        "utf8"
      );
      collection = JSON.parse(collectionData);
    } catch (error) {
      console.log("📝 No collection file");
    }

    const cardsFound = collection.filter(
      (collectionCard) => collectionCard.Code === normalizeCardCode
    );
  };

  const promptForRarity = async (
    rarities: { display: string; code: string; rarity: string }[]
  ): Promise<{ rarity: string; setCode: string } | null> => {
    console.log("Available rarities:");
    rarities.forEach((rarityObj, index) => {
      console.log(`${index + 1}. ${rarityObj.display}`);
    });

    const rarityInput = await rl.question(
      colorPrompt("\nSelect rarity number: ", colors.yellow)
    );
    const rarityIndex = parseInt(rarityInput.trim()) - 1;

    if (
      isNaN(rarityIndex) ||
      rarityIndex < 0 ||
      rarityIndex >= rarities.length
    ) {
      console.log("❌ Invalid selection. Please try again.\n");
      return null;
    }

    const selectedRarityObj = rarities[rarityIndex];
    console.log(`\n🎯 Selected: ${selectedRarityObj.display}`);
    return {
      rarity: selectedRarityObj.rarity,
      setCode: selectedRarityObj.code,
    };
  };

  const startCli = async () => {
    console.log("🎴 Yu-Gi-Oh Card Collection CLI Tool");
    console.log("Enter card codes to DELETE them to your collection");

    const promptForCard = async (): Promise<void> => {
      const input = await rl.question(
        colorPrompt("Enter card code (e.g., LOB-001): ", colors.green)
      );
      const trimmedInput = input.trim();

      if (
        trimmedInput.toLowerCase() === "exit" ||
        trimmedInput.toLowerCase() === "quit"
      ) {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }

      if (!trimmedInput) {
        console.log("⚠️ Please enter a card code");
        await promptForCard();
        return;
      }

      const result = await deleteCardFromCollection({
        cardCode: trimmedInput,
      });

      // Check if multiple rarities were found
      if (typeof result === "object" && result.error && result.rarities) {
        console.log(`\n${result.error}`);

        const selectedRarityInfo = await promptForRarity(result.rarities);
        if (!selectedRarityInfo) {
          await promptForCard();
          return;
        }

        const finalResult = await addCardToCollection({
          cardCode: trimmedInput,
          selectedRarity: selectedRarityInfo.rarity,
          selectedSetCode: selectedRarityInfo.setCode,
          edition: selectedEdition,
        });
        if (!finalResult) {
          console.log("❌ Failed to add card with selected rarity");
        }

        console.log(); // Empty line for readability
        await promptForCard();
        return;
      }

      // Handle boolean result (success/failure)
      if (!result) {
        console.log("❌ Failed to add card");
      }

      console.log(); // Empty line for readability
      await promptForCard();
    };

    await promptForCard();
  };

  return { startCli };
};
