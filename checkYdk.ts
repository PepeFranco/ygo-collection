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
} from "./checkYdkLib";

async function main() {
  const ydkPath = process.argv[2];
  if (!ydkPath) {
    console.error("Usage: tsx checkYdk.ts <path-to-ydk-file>");
    process.exit(1);
  }

  const absoluteYdkPath = path.resolve(ydkPath);
  if (!fs.existsSync(absoluteYdkPath)) {
    console.error(`File not found: ${absoluteYdkPath}`);
    process.exit(1);
  }

  const deckEntries = parseYdk(absoluteYdkPath);
  const collectionById = buildCollectionById(loadCollection());
  const { missingCards, unknownIds } = computeMissing(deckEntries, collectionById);

  if (unknownIds.length > 0) {
    process.stdout.write(`Fetching names for ${unknownIds.length} unknown card(s)...`);
    const nameMap = await fetchCardNames(unknownIds);
    applyFetchedNames(missingCards, nameMap);
    process.stdout.write(" done\n\n");
  }

  if (missingCards.length === 0) {
    console.log("You have all the cards for this deck!");
    return;
  }

  console.log(`Missing ${missingCards.length} unique card(s):\n`);

  for (const section of SECTIONS) {
    const cards = missingCards.filter((c) => c.section === section);
    if (cards.length === 0) continue;
    console.log(`[${SECTION_LABELS[section]}]`);
    for (const card of cards) {
      const copies = card.missing === 1 ? "1 copy" : `${card.missing} copies`;
      console.log(`  ${card.name} — need ${copies} (have ${card.owned}/${card.needed})`);
    }
    console.log();
  }
}

main().catch(console.error);
