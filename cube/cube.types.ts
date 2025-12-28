import { CollectionRow } from "../data/data.types";

export type CubeCard = CollectionRow & {
  cubeCategory?: CubeCategory;
  archetypeSupport?: string[];
  tags?: string[];
};

export type CubeCategory =
  | "Staple Monster"
  | "Staple Spell"
  | "Staple Trap"
  | "Archetype Monster"
  | "Archetype Spell"
  | "Archetype Trap"
  | "Generic Support"
  | "Tech Card"
  | "Win Condition";

export type CubeConfig = {
  name: string;
  size: number;
  format?: "goat" | "edison" | "modern" | "speed-duel";
  style: "archetype-focused" | "goodstuff" | "balanced" | "theme";

  // Card type ratios
  targetMonsterRatio: number; // 0-1, e.g., 0.5 for 50%
  targetSpellRatio: number;
  targetTrapRatio: number;

  // Archetype distribution
  targetArchetypes?: string[];
  cardsPerArchetype?: number;

  // Quality filters
  minRarity?: string[];
  excludeCards?: string[];
  includeCards?: string[];
};

export type Cube = {
  config: CubeConfig;
  cards: CubeCard[];
  metadata: {
    createdAt: string;
    lastModified: string;
    totalMonsters: number;
    totalSpells: number;
    totalTraps: number;
    archetypes: { [key: string]: number };
  };
};

export type CubeAnalysis = {
  totalCards: number;
  monsters: number;
  spells: number;
  traps: number;
  archetypeBreakdown: { [archetype: string]: number };
  categoryBreakdown: { [category: string]: number };
  recommendations: string[];
};
