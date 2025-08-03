import * as readline from "readline";
import { addCardToCollection } from "./addCardImpl";

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

  const startCli = async () => {
    console.log("🎴 Yu-Gi-Oh Card Collection CLI Tool");
    console.log("Choose your mode:\n");
    console.log("1. Individual mode - Add cards one by one with full code");
    console.log("2. Batch mode - Add multiple cards from the same set\n");

    const modeInput = await rl.question("Select mode (1/2): ");
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
  const promptForEdition = async (): Promise<string> => {
    console.log("\nEdition options:");
    console.log("1. 1st Edition");
    console.log("2. Limited Edition");
    console.log("Press Enter for no edition");

    const editionInput = await rl.question("Select edition (1/2 or Enter): ");
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

  const promptForCard = async (): Promise<void> => {
    const input = await rl.question("Enter card code (e.g., LOB-001): ");
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

    const result = await addCardToCollection(
      trimmedInput,
      undefined,
      selectedEdition
    );

    // Check if multiple rarities were found
    if (typeof result === "object" && result.error && result.rarities) {
      console.log(`\n${result.error}`);
      console.log("Available rarities:");

      result.rarities.forEach((rarity, index) => {
        console.log(`${index + 1}. ${rarity}`);
      });

      const rarityInput = await rl.question("\nSelect rarity number: ");
      const rarityIndex = parseInt(rarityInput.trim()) - 1;

      if (
        isNaN(rarityIndex) ||
        rarityIndex < 0 ||
        rarityIndex >= result.rarities.length
      ) {
        console.log("❌ Invalid selection. Please try again.\n");
        await promptForCard();
        return;
      }

      const selectedRarity = result.rarities[rarityIndex];
      console.log(`\n🎯 Selected: ${selectedRarity}`);

      const finalResult = await addCardToCollection(
        trimmedInput,
        selectedRarity,
        selectedEdition
      );
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
  const setInput = await rl.question("Enter set code (e.g., LOB, SGX1): ");
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
  const promptForBatchEdition = async (): Promise<string> => {
    console.log("\nEdition options:");
    console.log("1. 1st Edition");
    console.log("2. Limited Edition");
    console.log("Press Enter for no edition");

    const editionInput = await rl.question("Select edition (1/2 or Enter): ");
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

  const selectedEdition = await promptForBatchEdition();
  
  console.log(
    `\n🎯 Batch setup complete: ${setCode} ${
      selectedEdition ? `(${selectedEdition} Edition)` : ""
    }`
  );
  console.log("Now enter card numbers (e.g., 001, 025, etc.)");
  console.log('Type "exit", "quit", or "done" to finish batch\n');

  const promptForCardNumber = async (): Promise<void> => {
    const numberInput = await rl.question(`Enter card number for ${setCode}: `);
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

    const result = await addCardToCollection(
      fullCardCode,
      undefined,
      selectedEdition
    );

    // Check if multiple rarities were found
    if (typeof result === "object" && result.error && result.rarities) {
      console.log(`\n${result.error}`);
      console.log("Available rarities:");

      result.rarities.forEach((rarity, index) => {
        console.log(`${index + 1}. ${rarity}`);
      });

      const rarityInput = await rl.question("\nSelect rarity number: ");
      const rarityIndex = parseInt(rarityInput.trim()) - 1;

      if (
        isNaN(rarityIndex) ||
        rarityIndex < 0 ||
        rarityIndex >= result.rarities.length
      ) {
        console.log("❌ Invalid selection. Please try again.\n");
        await promptForCardNumber();
        return;
      }

      const selectedRarity = result.rarities[rarityIndex];
      console.log(`\n🎯 Selected: ${selectedRarity}`);

      const finalResult = await addCardToCollection(
        fullCardCode,
        selectedRarity,
        selectedEdition
      );
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
