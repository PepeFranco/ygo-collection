import { CollectionRow } from "../data/data.types";

export type SpeedDuelDeck = {
  name: string;
  character?: string; // Yugi, Kaiba, Joey, etc.
  strategy: string;
  skill?: string; // Recommended skill card
  mainDeck: CollectionRow[];
  extraDeck: CollectionRow[];
  keyCards: string[]; // Cards essential to the strategy
  coreCount: number; // How many copies of core cards are available
  completeness: number; // 0-100, how complete the deck is
  notes?: string[];
};

export type SpeedDuelArchetype = {
  name: string;
  requiredCards: string[]; // Must have these cards
  supportCards: string[]; // Nice to have
  character?: string;
  recommendedSkill?: string;
  strategy: string;
};

export type SpeedDuelAnalysis = {
  totalSpeedDuelCards: number;
  totalSpeedDuelLegalCards: number;
  viableDecks: SpeedDuelDeck[];
  archetypeBreakdown: { [archetype: string]: number };
};
