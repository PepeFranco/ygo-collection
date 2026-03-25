import fs from "fs";
import path from "path";
import axios from "axios";
import { CollectionRow } from "./data/data.types";

export type Section = "main" | "extra" | "side";

export type DeckEntry = { id: string; section: Section };

export type MissingCard = {
  id: string;
  name: string;
  section: Section;
  needed: number;
  owned: number;
  missing: number;
};

export const SECTION_LABELS: Record<Section, string> = {
  main: "Main Deck",
  extra: "Extra Deck",
  side: "Side Deck",
};

export const SECTIONS: Section[] = ["main", "extra", "side"];

export function parseYdk(filePath: string): DeckEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const entries: DeckEntry[] = [];
  let section: Section = "main";

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === "#main") { section = "main"; continue; }
    if (trimmed === "#extra") { section = "extra"; continue; }
    if (trimmed === "!side") { section = "side"; continue; }
    if (trimmed.startsWith("#") || trimmed.startsWith("!")) continue;
    if (/^\d+$/.test(trimmed)) {
      entries.push({ id: String(parseInt(trimmed, 10)), section });
    }
  }

  return entries;
}

export function buildCollectionById(
  collection: CollectionRow[]
): Map<string, { count: number; name: string }> {
  const map = new Map<string, { count: number; name: string }>();
  for (const card of collection) {
    if (!card.ID) continue;
    const existing = map.get(card.ID);
    if (existing) {
      existing.count++;
    } else {
      map.set(card.ID, { count: 1, name: card.Name });
    }
  }
  return map;
}

export function loadCollection(): CollectionRow[] {
  const collectionPath = path.join(__dirname, "data/collection.json");
  return JSON.parse(fs.readFileSync(collectionPath, "utf-8"));
}

export function computeMissing(
  deckEntries: DeckEntry[],
  collectionById: Map<string, { count: number; name: string }>
): { missingCards: MissingCard[]; unknownIds: string[] } {
  const neededById = new Map<string, { count: number; section: Section }>();
  for (const { id, section } of deckEntries) {
    const existing = neededById.get(id);
    if (existing) {
      existing.count++;
    } else {
      neededById.set(id, { count: 1, section });
    }
  }

  const missingCards: MissingCard[] = [];
  const unknownIds: string[] = [];

  for (const [id, { count: needed, section }] of neededById) {
    const owned = collectionById.get(id)?.count ?? 0;
    if (owned < needed) {
      const name = collectionById.get(id)?.name ?? null;
      if (!name) unknownIds.push(id);
      missingCards.push({ id, name: name ?? id, section, needed, owned, missing: needed - owned });
    }
  }

  return { missingCards, unknownIds };
}

export async function fetchCardNames(ids: string[]): Promise<Map<string, string>> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const { data } = await axios.get(
          `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`
        );
        return [id, data.data?.[0]?.name ?? `ID: ${id}`] as const;
      } catch {
        return [id, `ID: ${id}`] as const;
      }
    })
  );
  return new Map(results);
}

export function applyFetchedNames(
  missingCards: MissingCard[],
  nameMap: Map<string, string>
): void {
  for (const card of missingCards) {
    if (nameMap.has(card.id)) card.name = nameMap.get(card.id)!;
  }
}
