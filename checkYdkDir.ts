import fs from "fs";
import path from "path";
import {
  parseYdk,
  buildCollectionById,
  loadCollection,
  computeMissing,
  fetchCardNames,
  applyFetchedNames,
  SECTIONS,
  SECTION_LABELS,
  MissingCard,
} from "./checkYdkLib";

type DeckResult = {
  deckName: string;
  missingCards: MissingCard[];
};

function formatDeckBlock(result: DeckResult): string {
  const lines: string[] = [];
  const { deckName, missingCards } = result;
  const totalMissing = missingCards.reduce((sum, c) => sum + c.missing, 0);

  lines.push(`## ${deckName} — ${missingCards.length} unique card(s) missing (${totalMissing} total copies)`);

  if (missingCards.length === 0) {
    lines.push("  (complete)");
  } else {
    for (const section of SECTIONS) {
      const cards = missingCards.filter((c) => c.section === section);
      if (cards.length === 0) continue;
      lines.push(`  [${SECTION_LABELS[section]}]`);
      for (const card of cards) {
        const copies = card.missing === 1 ? "1 copy" : `${card.missing} copies`;
        lines.push(`    ${card.name} — need ${copies} (have ${card.owned}/${card.needed})`);
      }
    }
  }

  return lines.join("\n");
}

async function main() {
  const dirPath = process.argv[2];
  if (!dirPath) {
    console.error("Usage: tsx checkYdkDir.ts <directory-with-ydk-files>");
    process.exit(1);
  }

  const absoluteDir = path.resolve(dirPath);
  if (!fs.existsSync(absoluteDir)) {
    console.error(`Directory not found: ${absoluteDir}`);
    process.exit(1);
  }

  const ydkFiles = fs
    .readdirSync(absoluteDir)
    .filter((f) => f.toLowerCase().endsWith(".ydk"))
    .map((f) => path.join(absoluteDir, f));

  if (ydkFiles.length === 0) {
    console.error(`No .ydk files found in: ${absoluteDir}`);
    process.exit(1);
  }

  console.log(`Found ${ydkFiles.length} YDK file(s). Analysing...`);

  const collectionById = buildCollectionById(loadCollection());

  // Compute missing cards for every deck
  const results: DeckResult[] = [];
  const allUnknownIds = new Set<string>();

  for (const filePath of ydkFiles) {
    const deckName = path.basename(filePath, ".ydk");
    const deckEntries = parseYdk(filePath);
    const { missingCards, unknownIds } = computeMissing(deckEntries, collectionById);
    unknownIds.forEach((id) => allUnknownIds.add(id));
    results.push({ deckName, missingCards });
  }

  // Batch-fetch all unknown names in one pass
  if (allUnknownIds.size > 0) {
    process.stdout.write(`Fetching names for ${allUnknownIds.size} unknown card(s)...`);
    const nameMap = await fetchCardNames([...allUnknownIds]);
    for (const { missingCards } of results) {
      applyFetchedNames(missingCards, nameMap);
    }
    process.stdout.write(" done\n");
  }

  // Sort decks: least missing unique cards first
  results.sort((a, b) => a.missingCards.length - b.missingCards.length);

  // Build global card impact map: cardName -> Set of deck names it appears in + total copies needed
  const cardDeckCount = new Map<string, { name: string; decks: Set<string>; totalMissing: number }>();
  for (const { deckName, missingCards } of results) {
    for (const card of missingCards) {
      const existing = cardDeckCount.get(card.id);
      if (existing) {
        existing.decks.add(deckName);
        existing.totalMissing = Math.max(existing.totalMissing, card.missing);
      } else {
        cardDeckCount.set(card.id, { name: card.name, decks: new Set([deckName]), totalMissing: card.missing });
      }
    }
  }

  // Sort cards by deck impact (most to least)
  const rankedCards = [...cardDeckCount.values()].sort(
    (a, b) => b.decks.size - a.decks.size
  );

  // Compose output
  const outputLines: string[] = [];

  outputLines.push("# YDK Missing Cards Report");
  outputLines.push(`Generated: ${new Date().toISOString()}`);
  outputLines.push(`Decks analysed: ${results.length}`);
  outputLines.push("");
  outputLines.push("=".repeat(60));
  outputLines.push("");

  for (const result of results) {
    outputLines.push(formatDeckBlock(result));
    outputLines.push("");
  }

  outputLines.push("=".repeat(60));
  outputLines.push("");
  outputLines.push("# Most Impactful Missing Cards");
  outputLines.push("(ranked by number of decks the card would unlock)");
  outputLines.push("");

  for (const { name, decks, totalMissing } of rankedCards) {
    const deckList = [...decks].join(", ");
    const copies = totalMissing === 1 ? "1 copy" : `${totalMissing} copies`;
    outputLines.push(`  ${name} — ${copies} needed across ${decks.size} deck(s): ${deckList}`);
  }

  const outputPath = path.join(absoluteDir, "missing-cards-report.txt");
  fs.writeFileSync(outputPath, outputLines.join("\n"), "utf-8");
  console.log(`\nReport written to: ${outputPath}`);
}

main().catch(console.error);
