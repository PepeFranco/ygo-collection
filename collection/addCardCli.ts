#!/usr/bin/env node
import * as readline from "readline";
import { addCardToCollection } from "./addCardImpl";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const startCli = async () => {
  console.log("🎴 Yu-Gi-Oh Card Collection CLI Tool");
  console.log("Enter card codes to add them to your collection");
  console.log('Type "exit" or "quit" to stop\n');

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

      const result = await addCardToCollection(trimmedInput);
      
      // Check if multiple rarities were found
      if (typeof result === 'object' && result.error && result.rarities) {
        console.log(`\n${result.error}`);
        console.log("Available rarities:");
        
        result.rarities.forEach((rarity, index) => {
          console.log(`${index + 1}. ${rarity}`);
        });
        
        rl.question("\nSelect rarity number: ", async (rarityInput) => {
          const rarityIndex = parseInt(rarityInput.trim()) - 1;
          
          if (isNaN(rarityIndex) || rarityIndex < 0 || rarityIndex >= result.rarities.length) {
            console.log("❌ Invalid selection. Please try again.\n");
            promptForCard();
            return;
          }
          
          const selectedRarity = result.rarities[rarityIndex];
          console.log(`\n🎯 Selected: ${selectedRarity}`);
          
          const finalResult = await addCardToCollection(trimmedInput, selectedRarity);
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
  };

  promptForCard();
};

startCli();
