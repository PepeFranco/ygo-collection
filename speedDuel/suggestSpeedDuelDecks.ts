import * as fs from "fs";
import { CollectionRow } from "../data/data.types";
import { SpeedDuelAnalyzer } from "./speedDuel.analyzer";
import { SpeedDuelUtils } from "./speedDuel.utils";

async function main() {
  console.log("Loading collection...");
  const collectionPath = "./data/collection.json";
  const collectionData = fs.readFileSync(collectionPath, "utf-8");
  const collection: CollectionRow[] = JSON.parse(collectionData);

  console.log(`Loaded ${collection.length} cards from collection`);

  // Analyze collection
  const analyzer = new SpeedDuelAnalyzer();
  const { speedDuelCards, speedDuelLegalCards, archetypeCounts } =
    analyzer.analyzeCollection(collection);

  console.log(`\nSpeed Duel Cards: ${speedDuelCards.length}`);
  console.log(`Speed Duel Legal Cards: ${speedDuelLegalCards.length}`);
  console.log(`Unique Archetypes: ${Object.keys(archetypeCounts).length}`);

  // Suggest decks
  console.log("\nAnalyzing viable Speed Duel deck strategies...");
  const decks = analyzer.suggestDecks(collection, 12);

  // Print summary
  SpeedDuelUtils.printDeckSummary(decks);

  // Create output directory
  const outputDir = "./speedDuel";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Export results
  SpeedDuelUtils.saveDecks(decks, `${outputDir}/speed-duel-decks.json`);
  SpeedDuelUtils.exportDeckList(decks, `${outputDir}/speed-duel-decks.md`);
  SpeedDuelUtils.exportDeckSummary(decks, `${outputDir}/speed-duel-summary.md`);
  SpeedDuelUtils.exportAllDecksForDuelingBook(
    decks,
    `${outputDir}/duelingbook`
  );

  console.log("\nSpeed Duel deck suggestions complete!");
  console.log(`\nCheck ${outputDir}/speed-duel-decks.md for full deck lists`);
  console.log(`Check ${outputDir}/speed-duel-summary.md for quick overview`);
}

main().catch((error) => {
  console.error("Error suggesting Speed Duel decks:", error);
  process.exit(1);
});
