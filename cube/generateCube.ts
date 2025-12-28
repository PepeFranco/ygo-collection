import * as fs from "fs";
import { CollectionRow } from "../data/data.types";
import { CubeBuilder } from "./cube.builder";
import { CubeUtils } from "./cube.utils";
import { CubeConfig } from "./cube.types";

async function main() {
  console.log("Loading collection...");
  const collectionPath = "./data/collection.json";
  const collectionData = fs.readFileSync(collectionPath, "utf-8");
  const collection: CollectionRow[] = JSON.parse(collectionData);

  console.log(`Loaded ${collection.length} cards from collection`);

  // Define cube configuration
  const config: CubeConfig = {
    name: "Yu-Gi-Oh! 180 Cube",
    size: 180,
    format: "modern",
    style: "balanced",
    targetMonsterRatio: 0.55, // 55% monsters (~99 cards)
    targetSpellRatio: 0.30, // 30% spells (~54 cards)
    targetTrapRatio: 0.15, // 15% traps (~27 cards)
    cardsPerArchetype: 8, // Max 8 cards per archetype for diversity
  };

  // Build the cube
  const builder = new CubeBuilder();
  const cube = builder.buildCube(collection, config);

  // Analyze the cube
  const analysis = builder.analyzeCube(cube);
  CubeUtils.printAnalysis(analysis);

  // Save outputs
  const outputDir = "./cube";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  CubeUtils.saveCube(cube, `${outputDir}/cube.json`);
  CubeUtils.exportCardList(cube, `${outputDir}/cube-list.md`);
  CubeUtils.exportForDuelingBook(cube, `${outputDir}/cube-duelingbook.txt`);
  CubeUtils.exportForYGOPro(cube, `${outputDir}/cube-ygopro.ydk`);

  console.log("\n" + CubeUtils.generateCubeSummary(cube));
  console.log("\nCube generation complete!");
}

main().catch((error) => {
  console.error("Error generating cube:", error);
  process.exit(1);
});
