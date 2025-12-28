import * as fs from "fs";
import { SpeedDuelDeck } from "./speedDuel.types";

export class SpeedDuelUtils {
  static exportDeckList(decks: SpeedDuelDeck[], filepath: string): void {
    const lines = ["# Speed Duel Deck Suggestions", ""];
    lines.push(`Found ${decks.length} viable Speed Duel decks from your collection.`);
    lines.push("");

    decks.forEach((deck, index) => {
      lines.push(`## ${index + 1}. ${deck.name}`);
      if (deck.character) {
        lines.push(`**Character:** ${deck.character}`);
      }
      if (deck.skill) {
        lines.push(`**Recommended Skill:** ${deck.skill}`);
      }
      lines.push(`**Completeness:** ${deck.completeness}%`);
      lines.push(`**Strategy:** ${deck.strategy}`);
      lines.push("");

      lines.push("**Key Cards:**");
      deck.keyCards.forEach((card) => {
        lines.push(`- ${card}`);
      });
      lines.push("");

      if (deck.notes && deck.notes.length > 0) {
        lines.push("**Deck Info:**");
        deck.notes.forEach((note) => {
          lines.push(`- ${note}`);
        });
        lines.push("");
      }

      lines.push("**Main Deck:**");
      const monsters = deck.mainDeck.filter((c) => c.Type?.includes("Monster"));
      const spells = deck.mainDeck.filter((c) => c.Type?.includes("Spell"));
      const traps = deck.mainDeck.filter((c) => c.Type?.includes("Trap"));

      if (monsters.length > 0) {
        lines.push("*Monsters:*");
        monsters.forEach((card) => {
          const level = card.Level && parseInt(card.Level) > 0 ? ` Lv${card.Level}` : "";
          const stats =
            card.ATK !== undefined && card.DEF !== undefined
              ? ` (${card.ATK}/${card.DEF})`
              : "";
          lines.push(`- ${card.Name}${level}${stats}`);
        });
      }

      if (spells.length > 0) {
        lines.push("*Spells:*");
        spells.forEach((card) => {
          lines.push(`- ${card.Name}`);
        });
      }

      if (traps.length > 0) {
        lines.push("*Traps:*");
        traps.forEach((card) => {
          lines.push(`- ${card.Name}`);
        });
      }

      if (deck.extraDeck.length > 0) {
        lines.push("*Extra Deck:*");
        deck.extraDeck.forEach((card) => {
          lines.push(`- ${card.Name}`);
        });
      }

      lines.push("");
      lines.push("---");
      lines.push("");
    });

    fs.writeFileSync(filepath, lines.join("\n"), "utf-8");
    console.log(`Speed Duel deck suggestions exported to ${filepath}`);
  }

  static exportDeckSummary(decks: SpeedDuelDeck[], filepath: string): void {
    const lines = ["# Speed Duel Deck Summary", ""];

    lines.push("| # | Deck Name | Character | Completeness | Main | Extra | Skill |");
    lines.push("|---|-----------|-----------|--------------|------|-------|-------|");

    decks.forEach((deck, index) => {
      const char = deck.character || "-";
      const skill = deck.skill || "-";
      lines.push(
        `| ${index + 1} | ${deck.name} | ${char} | ${deck.completeness}% | ${deck.mainDeck.length} | ${deck.extraDeck.length} | ${skill} |`
      );
    });

    lines.push("");
    lines.push("## Deck Strategies");
    lines.push("");

    decks.forEach((deck, index) => {
      lines.push(`**${index + 1}. ${deck.name}:** ${deck.strategy}`);
    });

    fs.writeFileSync(filepath, lines.join("\n"), "utf-8");
    console.log(`Speed Duel summary exported to ${filepath}`);
  }

  static exportForDuelingBook(deck: SpeedDuelDeck, filepath: string): void {
    const cardNames = [
      ...deck.mainDeck.map((c) => c.Name),
      ...deck.extraDeck.map((c) => c.Name),
    ];
    fs.writeFileSync(filepath, cardNames.join("\n"), "utf-8");
    console.log(`${deck.name} exported for Dueling Book to ${filepath}`);
  }

  static exportAllDecksForDuelingBook(decks: SpeedDuelDeck[], outputDir: string): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    decks.forEach((deck) => {
      const filename = deck.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      this.exportForDuelingBook(
        deck,
        `${outputDir}/${filename}-duelingbook.txt`
      );
    });
  }

  static saveDecks(decks: SpeedDuelDeck[], filepath: string): void {
    const json = JSON.stringify(decks, null, 2);
    fs.writeFileSync(filepath, json, "utf-8");
    console.log(`Deck data saved to ${filepath}`);
  }

  static printDeckSummary(decks: SpeedDuelDeck[]): void {
    console.log("\n=== SPEED DUEL DECK SUGGESTIONS ===");
    console.log(`Found ${decks.length} viable decks\n`);

    decks.forEach((deck, index) => {
      console.log(`${index + 1}. ${deck.name} (${deck.completeness}% complete)`);
      console.log(`   Character: ${deck.character || "N/A"}`);
      console.log(`   Skill: ${deck.skill || "N/A"}`);
      console.log(`   Cards: ${deck.mainDeck.length} main, ${deck.extraDeck.length} extra`);
      console.log(`   Strategy: ${deck.strategy}`);
      console.log("");
    });

    console.log("===================================\n");
  }
}
