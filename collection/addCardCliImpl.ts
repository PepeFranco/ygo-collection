import * as readline from "readline";
import { addCardToCollection } from "./addCardImpl";

export interface CLIInterface {
  question: (prompt: string, callback: (answer: string) => void) => void;
  close: () => void;
}

export const createCLI = (rlInterface?: CLIInterface) => {
  const rl = rlInterface || readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const startCli = async () => {
  console.log("🎴 Yu-Gi-Oh Card Collection CLI Tool");
  console.log("Choose your mode:\n");
  console.log("1. Individual mode - Add cards one by one with full code");
  console.log("2. Batch mode - Add multiple cards from the same set\n");

  rl.question("Select mode (1/2): ", (modeInput) => {
    const trimmedModeInput = modeInput.trim();

    if (trimmedModeInput === "1") {
      console.log("\n📝 Individual mode selected");
      console.log("Enter card codes to add them to your collection");
      console.log('Type "exit" or "quit" to stop\n');
      startIndividualMode();
    } else if (trimmedModeInput === "2") {
      console.log("\n📦 Batch mode selected");
      console.log(
        "Add multiple cards from the same set with just card numbers"
      );
      console.log('Type "exit" or "quit" to stop\n');
      startBatchMode();
    } else {
      console.log("❌ Invalid selection. Please choose 1 or 2.");
      startCli();
    }
  });
};

const startIndividualMode = async () => {
  const promptForEdition = (callback: (edition: string) => void) => {
    console.log("\nEdition options:");
    console.log("1. 1st Edition");
    console.log("2. Limited Edition");
    console.log("Press Enter for no edition");

    rl.question("Select edition (1/2 or Enter): ", (editionInput) => {
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

      callback(selectedEdition);
    });
  };

  const promptForCard = () => {
    rl.question("Enter card code (e.g., LOB-001): ", async (input) => {
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
        promptForCard();
        return;
      }

      // Prompt for edition first
      promptForEdition(async (selectedEdition) => {
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

          rl.question("\nSelect rarity number: ", async (rarityInput) => {
            const rarityIndex = parseInt(rarityInput.trim()) - 1;

            if (
              isNaN(rarityIndex) ||
              rarityIndex < 0 ||
              rarityIndex >= result.rarities.length
            ) {
              console.log("❌ Invalid selection. Please try again.\n");
              promptForCard();
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
            promptForCard();
          });
          return;
        }

        // Handle boolean result (success/failure)
        if (!result) {
          console.log("❌ Failed to add card");
        }

        console.log(); // Empty line for readability
        promptForCard();
      });
    });
  };

  promptForCard();
};

const startBatchMode = async () => {
  console.log("\n🔧 Setting up batch mode...");

  // First prompt for set code
  rl.question("Enter set code (e.g., LOB, SGX1): ", (setInput) => {
    const setCode = setInput.trim().toUpperCase();

    if (!setCode) {
      console.log("⚠️ Please enter a set code");
      startBatchMode();
      return;
    }

    if (setCode.toLowerCase() === "exit" || setCode.toLowerCase() === "quit") {
      console.log("👋 Goodbye!");
      rl.close();
      return;
    }

    console.log(`\n📦 Set: ${setCode}`);

    // Then prompt for edition
    const promptForBatchEdition = (callback: (edition: string) => void) => {
      console.log("\nEdition options:");
      console.log("1. 1st Edition");
      console.log("2. Limited Edition");
      console.log("Press Enter for no edition");

      rl.question("Select edition (1/2 or Enter): ", (editionInput) => {
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

        callback(selectedEdition);
      });
    };

    promptForBatchEdition((selectedEdition) => {
      console.log(
        `\n🎯 Batch setup complete: ${setCode} ${
          selectedEdition ? `(${selectedEdition} Edition)` : ""
        }`
      );
      console.log("Now enter card numbers (e.g., 001, 025, etc.)");
      console.log('Type "exit", "quit", or "done" to finish batch\n');

      const promptForCardNumber = () => {
        rl.question(
          `Enter card number for ${setCode}: `,
          async (numberInput) => {
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
              promptForCardNumber();
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

              rl.question("\nSelect rarity number: ", async (rarityInput) => {
                const rarityIndex = parseInt(rarityInput.trim()) - 1;

                if (
                  isNaN(rarityIndex) ||
                  rarityIndex < 0 ||
                  rarityIndex >= result.rarities.length
                ) {
                  console.log("❌ Invalid selection. Please try again.\n");
                  promptForCardNumber();
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
                promptForCardNumber();
              });
              return;
            }

            // Handle boolean result (success/failure)
            if (!result) {
              console.log("❌ Failed to add card");
            }

            console.log(); // Empty line for readability
            promptForCardNumber();
          }
        );
      };

      promptForCardNumber();
    });
  });
};

  return { startCli };
};
