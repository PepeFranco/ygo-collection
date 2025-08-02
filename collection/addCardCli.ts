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

      await addCardToCollection(trimmedInput);
      console.log(); // Empty line for readability
      promptForCard();
    });
  };

  promptForCard();
};

startCli();
