import * as readline from "readline";
import { addCardToCollection } from "./addCardImpl";

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',      // Mode selection
  green: '\x1b[32m',     // Individual card codes
  cyan: '\x1b[36m',      // Batch set codes
  yellow: '\x1b[33m',    // Rarity selection
  magenta: '\x1b[35m',   // Edition selection
  brightGreen: '\x1b[92m' // Batch card numbers
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
  const rl = rlInterface || createPromiseInterface(readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }));

  // Shared utility functions
  const promptForEdition = async (): Promise<string> => {
    console.log("\nEdition options:");
    console.log("1. 1st Edition");
    console.log("2. Limited Edition");
    console.log("Press Enter for no edition");

    const editionInput = await rl.question(colorPrompt("Select edition (1/2 or Enter): ", colors.magenta));
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

  const promptForRarity = async (rarities: { display: string; code: string; rarity: string }[]): Promise<{ rarity: string; setCode: string } | null> => {
    console.log("Available rarities:");
    rarities.forEach((rarityObj, index) => {
      console.log(`${index + 1}. ${rarityObj.display}`);
    });

    const rarityInput = await rl.question(colorPrompt("\nSelect rarity number: ", colors.yellow));
    const rarityIndex = parseInt(rarityInput.trim()) - 1;

    if (isNaN(rarityIndex) || rarityIndex < 0 || rarityIndex >= rarities.length) {
      console.log("❌ Invalid selection. Please try again.\n");
      return null;
    }

    const selectedRarityObj = rarities[rarityIndex];
    console.log(`\n🎯 Selected: ${selectedRarityObj.display}`);
    return { rarity: selectedRarityObj.rarity, setCode: selectedRarityObj.code };
  };

  const startCli = async () => {
    console.log("🎴 Yu-Gi-Oh Card Collection CLI Tool");
    console.log("Choose your mode:\n");
    console.log("1. Individual mode - Add cards one by one with full code");
    console.log("2. Batch mode - Add multiple cards from the same set\n");

    const modeInput = await rl.question(colorPrompt("Select mode (1/2): ", colors.blue));
    const trimmedModeInput = modeInput.trim();

    if (trimmedModeInput === "1") {
      console.log("\n📝 Individual mode selected");
      console.log("Enter card codes to add them to your collection");
      console.log('Type "exit" or "quit" to stop\n');
      await startIndividualMode();
    } else if (trimmedModeInput === "2") {
      console.log("\n📦 Batch mode selected");
      console.log(
        "Add multiple cards from the same set with just card numbers"
      );
      console.log('Type "exit" or "quit" to stop\n');
      await startBatchMode();
    } else {
      console.log("❌ Invalid selection. Please choose 1 or 2.");
      await startCli();
    }
  };

const startIndividualMode = async () => {

  const promptForCard = async (): Promise<void> => {
    const input = await rl.question(colorPrompt("Enter card code (e.g., LOB-001): ", colors.green));
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

    // Prompt for edition first
    const selectedEdition = await promptForEdition();
    
    console.log(
      `\n🔍 Processing card: ${trimmedInput} ${
        selectedEdition ? `(${selectedEdition} Edition)` : ""
      }`
    );

    const result = await addCardToCollection({
      cardCode: trimmedInput,
      edition: selectedEdition
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
        edition: selectedEdition
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

const startBatchMode = async () => {
  console.log("\n🔧 Setting up batch mode...");

  // First prompt for set code
  const setInput = await rl.question(colorPrompt("Enter set code (e.g., LOB, SGX1): ", colors.cyan));
  const setCode = setInput.trim().toUpperCase();

  if (!setCode) {
    console.log("⚠️ Please enter a set code");
    await startBatchMode();
    return;
  }

  if (setCode.toLowerCase() === "exit" || setCode.toLowerCase() === "quit") {
    console.log("👋 Goodbye!");
    rl.close();
    return;
  }

  console.log(`\n📦 Set: ${setCode}`);

  // Then prompt for edition
  const selectedEdition = await promptForEdition();
  
  console.log(
    `\n🎯 Batch setup complete: ${setCode} ${
      selectedEdition ? `(${selectedEdition} Edition)` : ""
    }`
  );
  console.log("Now enter card numbers (e.g., 001, 025, etc.)");
  console.log('Type "exit", "quit", or "done" to finish batch\n');

  const promptForCardNumber = async (): Promise<void> => {
    const numberInput = await rl.question(colorPrompt(`Enter card number for ${setCode}: `, colors.brightGreen));
    const trimmedNumberInput = numberInput.trim();

    if (
      trimmedNumberInput.toLowerCase() === "exit" ||
      trimmedNumberInput.toLowerCase() === "quit" ||
      trimmedNumberInput.toLowerCase() === "done"
    ) {
      console.log("✅ Batch completed!");
      console.log("\n👋 Goodbye!");
      rl.close();
      return;
    }

    if (!trimmedNumberInput) {
      console.log("⚠️ Please enter a card number");
      await promptForCardNumber();
      return;
    }

    // Pad the number to 3 digits and construct full card code
    const paddedNumber = trimmedNumberInput.padStart(3, "0");
    const fullCardCode = `${setCode}-${paddedNumber}`;

    console.log(
      `\n🔍 Processing card: ${fullCardCode} ${
        selectedEdition ? `(${selectedEdition} Edition)` : ""
      }`
    );

    const result = await addCardToCollection({
      cardCode: fullCardCode,
      edition: selectedEdition
    });

    // Check if multiple rarities were found
    if (typeof result === "object" && result.error && result.rarities) {
      console.log(`\n${result.error}`);
      
      const selectedRarityInfo = await promptForRarity(result.rarities);
      if (!selectedRarityInfo) {
        await promptForCardNumber();
        return;
      }

      const finalResult = await addCardToCollection({
        cardCode: fullCardCode,
        selectedRarity: selectedRarityInfo.rarity,
        selectedSetCode: selectedRarityInfo.setCode,
        edition: selectedEdition
      });
      if (!finalResult) {
        console.log("❌ Failed to add card with selected rarity");
      }

      console.log(); // Empty line for readability
      await promptForCardNumber();
      return;
    }

    // Handle boolean result (success/failure)
    if (!result) {
      console.log("❌ Failed to add card");
    }

    console.log(); // Empty line for readability
    await promptForCardNumber();
  };

  await promptForCardNumber();
};

  return { startCli };
};
