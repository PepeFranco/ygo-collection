import { CollectionRow } from "../data/data.types";
import { Cube, CubeCard, CubeConfig, CubeAnalysis } from "./cube.types";
import { CubeAnalyzer } from "./cube.analyzer";

export class CubeBuilder {
  private analyzer: CubeAnalyzer;

  constructor() {
    this.analyzer = new CubeAnalyzer();
  }

  buildCube(collection: CollectionRow[], config: CubeConfig): Cube {
    console.log(`Building ${config.size}-card cube: ${config.name}`);
    console.log(`Style: ${config.style}`);

    // Analyze all cards
    const analyzedCards = collection.map((card) =>
      this.analyzer.analyzeCard(card)
    );

    // Remove duplicates by card ID
    const uniqueCards = this.deduplicateCards(analyzedCards);

    // Score and sort cards
    const scoredCards = uniqueCards.map((card) => ({
      card,
      score: this.analyzer.scoreCardForCube(card),
    }));

    scoredCards.sort((a, b) => b.score - a.score);

    // Build the cube based on config
    const selectedCards = this.selectBalancedCards(scoredCards, config);

    // Create metadata
    const metadata = this.generateMetadata(selectedCards);

    return {
      config,
      cards: selectedCards,
      metadata,
    };
  }

  private deduplicateCards(cards: CubeCard[]): CubeCard[] {
    const seen = new Set<string>();
    const unique: CubeCard[] = [];

    for (const card of cards) {
      const key = `${card.ID}-${card.Name}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(card);
      }
    }

    return unique;
  }

  private selectBalancedCards(
    scoredCards: { card: CubeCard; score: number }[],
    config: CubeConfig
  ): CubeCard[] {
    const selected: CubeCard[] = [];
    const targetMonsters = Math.floor(config.size * config.targetMonsterRatio);
    const targetSpells = Math.floor(config.size * config.targetSpellRatio);
    const targetTraps = Math.floor(config.size * config.targetTrapRatio);

    let monsterCount = 0;
    let spellCount = 0;
    let trapCount = 0;

    // Track archetypes
    const archetypeCount: { [key: string]: number } = {};
    const maxPerArchetype = config.cardsPerArchetype || 10;

    // First pass: Add all staples
    for (const { card } of scoredCards) {
      if (
        this.analyzer.isCardStaple(card) &&
        this.canAddCard(
          card,
          monsterCount,
          targetMonsters,
          spellCount,
          targetSpells,
          trapCount,
          targetTraps
        )
      ) {
        selected.push(card);
        if (card.Type?.includes("Monster")) monsterCount++;
        if (card.Type?.includes("Spell")) spellCount++;
        if (card.Type?.includes("Trap")) trapCount++;
      }
    }

    console.log(
      `Added staples: ${selected.length} cards (M:${monsterCount}, S:${spellCount}, T:${trapCount})`
    );

    // Second pass: Add archetype cards for balanced mix
    if (config.style === "balanced" || config.style === "archetype-focused") {
      for (const { card } of scoredCards) {
        if (selected.includes(card)) continue;

        const archetype = card.Archetype;
        if (archetype && archetype !== "") {
          // Check archetype limit
          const currentArchetypeCount = archetypeCount[archetype] || 0;
          if (currentArchetypeCount >= maxPerArchetype) continue;

          if (
            this.canAddCard(
              card,
              monsterCount,
              targetMonsters,
              spellCount,
              targetSpells,
              trapCount,
              targetTraps
            )
          ) {
            selected.push(card);
            if (card.Type?.includes("Monster")) monsterCount++;
            if (card.Type?.includes("Spell")) spellCount++;
            if (card.Type?.includes("Trap")) trapCount++;
            archetypeCount[archetype] = currentArchetypeCount + 1;
          }
        }

        if (selected.length >= config.size) break;
      }
    }

    console.log(
      `Added archetype cards: ${selected.length} cards (M:${monsterCount}, S:${spellCount}, T:${trapCount})`
    );

    // Third pass: Fill remaining slots with highest scored cards
    for (const { card } of scoredCards) {
      if (selected.length >= config.size) break;
      if (selected.includes(card)) continue;

      if (
        this.canAddCard(
          card,
          monsterCount,
          targetMonsters,
          spellCount,
          targetSpells,
          trapCount,
          targetTraps
        )
      ) {
        selected.push(card);
        if (card.Type?.includes("Monster")) monsterCount++;
        if (card.Type?.includes("Spell")) spellCount++;
        if (card.Type?.includes("Trap")) trapCount++;
      }
    }

    console.log(
      `Final cube: ${selected.length} cards (M:${monsterCount}, S:${spellCount}, T:${trapCount})`
    );

    return selected.slice(0, config.size);
  }

  private canAddCard(
    card: CubeCard,
    monsterCount: number,
    targetMonsters: number,
    spellCount: number,
    targetSpells: number,
    trapCount: number,
    targetTraps: number
  ): boolean {
    const isMonster = card.Type?.includes("Monster");
    const isSpell = card.Type?.includes("Spell");
    const isTrap = card.Type?.includes("Trap");

    if (isMonster && monsterCount < targetMonsters) return true;
    if (isSpell && spellCount < targetSpells) return true;
    if (isTrap && trapCount < targetTraps) return true;

    return false;
  }


  private generateMetadata(cards: CubeCard[]) {
    let totalMonsters = 0;
    let totalSpells = 0;
    let totalTraps = 0;
    const archetypes: { [key: string]: number } = {};

    for (const card of cards) {
      if (card.Type?.includes("Monster")) totalMonsters++;
      if (card.Type?.includes("Spell")) totalSpells++;
      if (card.Type?.includes("Trap")) totalTraps++;

      if (card.Archetype && card.Archetype !== "") {
        archetypes[card.Archetype] = (archetypes[card.Archetype] || 0) + 1;
      }
    }

    return {
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalMonsters,
      totalSpells,
      totalTraps,
      archetypes,
    };
  }

  analyzeCube(cube: Cube): CubeAnalysis {
    const { cards, metadata } = cube;

    const categoryBreakdown: { [category: string]: number } = {};
    for (const card of cards) {
      if (card.cubeCategory) {
        categoryBreakdown[card.cubeCategory] =
          (categoryBreakdown[card.cubeCategory] || 0) + 1;
      }
    }

    const recommendations: string[] = [];

    // Check balance
    const monsterRatio = metadata.totalMonsters / cards.length;
    const spellRatio = metadata.totalSpells / cards.length;
    const trapRatio = metadata.totalTraps / cards.length;

    if (monsterRatio < 0.4)
      recommendations.push("Consider adding more monsters (currently below 40%)");
    if (monsterRatio > 0.65)
      recommendations.push("Consider reducing monsters (currently above 65%)");
    if (spellRatio < 0.15)
      recommendations.push("Consider adding more spells (currently below 15%)");
    if (trapRatio < 0.1)
      recommendations.push("Consider adding more traps (currently below 10%)");

    // Check archetype diversity
    const archetypeCount = Object.keys(metadata.archetypes).length;
    if (archetypeCount < 5)
      recommendations.push(
        "Low archetype diversity - consider adding more archetype support"
      );

    return {
      totalCards: cards.length,
      monsters: metadata.totalMonsters,
      spells: metadata.totalSpells,
      traps: metadata.totalTraps,
      archetypeBreakdown: metadata.archetypes,
      categoryBreakdown,
      recommendations,
    };
  }
}
