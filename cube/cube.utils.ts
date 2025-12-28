import * as fs from "fs";
import { Cube, CubeCard, CubeAnalysis } from "./cube.types";

export class CubeUtils {
  static saveCube(cube: Cube, filepath: string): void {
    const json = JSON.stringify(cube, null, 2);
    fs.writeFileSync(filepath, json, "utf-8");
    console.log(`Cube saved to ${filepath}`);
  }

  static loadCube(filepath: string): Cube {
    const json = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(json) as Cube;
  }

  static exportCardList(cube: Cube, filepath: string): void {
    const lines = ["# " + cube.config.name, ""];
    lines.push(`Total: ${cube.cards.length} cards`);
    lines.push(
      `Monsters: ${cube.metadata.totalMonsters} | Spells: ${cube.metadata.totalSpells} | Traps: ${cube.metadata.totalTraps}`
    );
    lines.push("");

    // Group by type
    const monsters = cube.cards.filter((c) => c.Type?.includes("Monster"));
    const spells = cube.cards.filter((c) => c.Type?.includes("Spell"));
    const traps = cube.cards.filter((c) => c.Type?.includes("Trap"));

    if (monsters.length > 0) {
      lines.push("## Monsters");
      monsters.forEach((card) => {
        const archetype = card.Archetype ? ` [${card.Archetype}]` : "";
        const level = card.Level && parseInt(card.Level) > 0 ? ` Lv${card.Level}` : "";
        const stats =
          card.ATK !== undefined && card.DEF !== undefined
            ? ` (${card.ATK}/${card.DEF})`
            : "";
        lines.push(`- ${card.Name}${archetype}${level}${stats}`);
      });
      lines.push("");
    }

    if (spells.length > 0) {
      lines.push("## Spells");
      spells.forEach((card) => {
        const archetype = card.Archetype ? ` [${card.Archetype}]` : "";
        const cardType = card["Card Type"] ? ` (${card["Card Type"]})` : "";
        lines.push(`- ${card.Name}${archetype}${cardType}`);
      });
      lines.push("");
    }

    if (traps.length > 0) {
      lines.push("## Traps");
      traps.forEach((card) => {
        const archetype = card.Archetype ? ` [${card.Archetype}]` : "";
        const cardType = card["Card Type"] ? ` (${card["Card Type"]})` : "";
        lines.push(`- ${card.Name}${archetype}${cardType}`);
      });
      lines.push("");
    }

    // Archetype breakdown
    lines.push("## Archetypes");
    const sortedArchetypes = Object.entries(cube.metadata.archetypes).sort(
      (a, b) => b[1] - a[1]
    );
    sortedArchetypes.forEach(([archetype, count]) => {
      lines.push(`- ${archetype}: ${count} cards`);
    });

    fs.writeFileSync(filepath, lines.join("\n"), "utf-8");
    console.log(`Card list exported to ${filepath}`);
  }

  static printAnalysis(analysis: CubeAnalysis): void {
    console.log("\n=== CUBE ANALYSIS ===");
    console.log(`Total Cards: ${analysis.totalCards}`);
    console.log(`Monsters: ${analysis.monsters} (${(analysis.monsters / analysis.totalCards * 100).toFixed(1)}%)`);
    console.log(`Spells: ${analysis.spells} (${(analysis.spells / analysis.totalCards * 100).toFixed(1)}%)`);
    console.log(`Traps: ${analysis.traps} (${(analysis.traps / analysis.totalCards * 100).toFixed(1)}%)`);

    console.log("\nArchetype Breakdown:");
    const sortedArchetypes = Object.entries(analysis.archetypeBreakdown).sort(
      (a, b) => b[1] - a[1]
    );
    sortedArchetypes.slice(0, 10).forEach(([archetype, count]) => {
      console.log(`  ${archetype}: ${count} cards`);
    });

    console.log("\nCategory Breakdown:");
    Object.entries(analysis.categoryBreakdown).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} cards`);
    });

    if (analysis.recommendations.length > 0) {
      console.log("\nRecommendations:");
      analysis.recommendations.forEach((rec) => {
        console.log(`  - ${rec}`);
      });
    }
    console.log("===================\n");
  }

  static exportForDuelingBook(cube: Cube, filepath: string): void {
    // Dueling Book format: one card name per line
    const cardNames = cube.cards.map((card) => card.Name);
    fs.writeFileSync(filepath, cardNames.join("\n"), "utf-8");
    console.log(`Dueling Book format exported to ${filepath}`);
  }

  static exportForYGOPro(cube: Cube, filepath: string): void {
    // YGO Pro format: card count followed by card name
    const lines = ["#created by Cube Builder", ""];
    const cardCounts: { [name: string]: number } = {};

    cube.cards.forEach((card) => {
      cardCounts[card.Name] = (cardCounts[card.Name] || 0) + 1;
    });

    Object.entries(cardCounts).forEach(([name, count]) => {
      lines.push(`${count} ${name}`);
    });

    fs.writeFileSync(filepath, lines.join("\n"), "utf-8");
    console.log(`YGO Pro format exported to ${filepath}`);
  }

  static generateCubeSummary(cube: Cube): string {
    const summary = [];
    summary.push(`Cube: ${cube.config.name}`);
    summary.push(`Size: ${cube.cards.length} cards`);
    summary.push(
      `Distribution: ${cube.metadata.totalMonsters}M / ${cube.metadata.totalSpells}S / ${cube.metadata.totalTraps}T`
    );
    summary.push(`Archetypes: ${Object.keys(cube.metadata.archetypes).length}`);
    summary.push(`Created: ${new Date(cube.metadata.createdAt).toLocaleDateString()}`);
    return summary.join("\n");
  }
}
