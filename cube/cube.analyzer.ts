import { CollectionRow } from "../data/data.types";
import { CubeCard, CubeCategory } from "./cube.types";

// Common staple cards that are generically good
const STAPLE_MONSTERS = [
  "Effect Veiler",
  "Ash Blossom & Joyous Spring",
  "Ghost Ogre & Snow Rabbit",
  "Droll & Lock Bird",
  "Maxx \"C\"",
  "Honest",
  "D.D. Crow",
  "Ghost Belle & Haunted Mansion",
  "Nibiru, the Primal Being",
  "Artifact Lancea",
  "Skull Meister",
  "Thunder King Rai-Oh",
  "Sangan",
  "Witch of the Black Forest",
];

const STAPLE_SPELLS = [
  "Mystical Space Typhoon",
  "Twin Twisters",
  "Cosmic Cyclone",
  "Harpie's Feather Duster",
  "Heavy Storm",
  "Monster Reborn",
  "Dark Hole",
  "Raigeki",
  "Book of Moon",
  "Forbidden Chalice",
  "Pot of Greed",
  "Pot of Duality",
  "Pot of Desires",
  "Pot of Prosperity",
  "Upstart Goblin",
  "Reinforcement of the Army",
  "Foolish Burial",
  "One for One",
  "Called by the Grave",
  "Crossout Designator",
  "Triple Tactics Talent",
  "Lightning Storm",
];

const STAPLE_TRAPS = [
  "Torrential Tribute",
  "Bottomless Trap Hole",
  "Compulsory Evacuation Device",
  "Solemn Judgment",
  "Solemn Warning",
  "Solemn Strike",
  "Infinite Impermanence",
  "Evenly Matched",
  "Skill Drain",
  "Imperial Order",
  "Vanity's Emptiness",
  "Macro Cosmos",
  "Dimensional Barrier",
  "Ring of Destruction",
  "Trap Trick",
];

export class CubeAnalyzer {
  analyzeCard(card: CollectionRow): CubeCard {
    const cubeCard: CubeCard = {
      ...card,
      cubeCategory: this.categorizeCard(card),
      archetypeSupport: this.getArchetypeSupport(card),
      tags: this.generateTags(card),
    };

    return cubeCard;
  }

  private categorizeCard(card: CollectionRow): CubeCategory {
    const isMonster = card.Type?.includes("Monster");
    const isSpell = card.Type?.includes("Spell");
    const isTrap = card.Type?.includes("Trap");
    const hasArchetype = card.Archetype && card.Archetype !== "";

    // Check if it's a staple
    if (STAPLE_MONSTERS.includes(card.Name)) return "Staple Monster";
    if (STAPLE_SPELLS.includes(card.Name)) return "Staple Spell";
    if (STAPLE_TRAPS.includes(card.Name)) return "Staple Trap";

    // Categorize based on type and archetype
    if (hasArchetype) {
      if (isMonster) return "Archetype Monster";
      if (isSpell) return "Archetype Spell";
      if (isTrap) return "Archetype Trap";
    }

    // Generic support cards
    if (isMonster) return "Generic Support";
    if (isSpell) return "Generic Support";
    if (isTrap) return "Tech Card";

    return "Generic Support";
  }

  private getArchetypeSupport(card: CollectionRow): string[] {
    const archetypes: string[] = [];

    if (card.Archetype && card.Archetype !== "") {
      archetypes.push(card.Archetype);
    }

    // Check card name for archetype mentions
    const name = card.Name.toLowerCase();

    // Common archetype patterns
    const archetypePatterns = [
      "Blue-Eyes",
      "Dark Magician",
      "Red-Eyes",
      "Hero",
      "Elemental HERO",
      "Destiny HERO",
      "Evil HERO",
      "Cyber Dragon",
      "Blackwing",
      "Six Samurai",
      "Glad",
      "Lightsworn",
      "Burning Abyss",
      "Shaddoll",
      "Kozmo",
      "Monarch",
      "Kaiju",
      "Trickstar",
      "Sky Striker",
      "Salamangreat",
      "Orcust",
      "Dragon Maid",
      "Eldlich",
      "Virtual World",
      "Dogmatika",
      "Tri-Brigade",
    ];

    for (const pattern of archetypePatterns) {
      if (name.includes(pattern.toLowerCase())) {
        if (!archetypes.includes(pattern)) {
          archetypes.push(pattern);
        }
      }
    }

    return archetypes;
  }

  private generateTags(card: CollectionRow): string[] {
    const tags: string[] = [];

    // Add type tags
    if (card.Type?.includes("Effect")) tags.push("Effect");
    if (card.Type?.includes("Fusion")) tags.push("Fusion");
    if (card.Type?.includes("Synchro")) tags.push("Synchro");
    if (card.Type?.includes("Xyz")) tags.push("Xyz");
    if (card.Type?.includes("Link")) tags.push("Link");
    if (card.Type?.includes("Pendulum")) tags.push("Pendulum");
    if (card.Type?.includes("Ritual")) tags.push("Ritual");
    if (card.Type?.includes("Tuner")) tags.push("Tuner");

    // Add attribute tags
    if (card.Attribute) tags.push(card.Attribute);

    // Add card type tags
    if (card["Card Type"]) tags.push(card["Card Type"]);

    // Add rarity tags
    if (card.Rarity) tags.push(card.Rarity);

    // Add level/rank tags
    if (card.Level && parseInt(card.Level) > 0) {
      tags.push(`Level ${card.Level}`);
    }

    return tags;
  }

  isCardStaple(card: CollectionRow): boolean {
    return (
      STAPLE_MONSTERS.includes(card.Name) ||
      STAPLE_SPELLS.includes(card.Name) ||
      STAPLE_TRAPS.includes(card.Name)
    );
  }

  scoreCardForCube(card: CollectionRow): number {
    let score = 0;

    // Staples get high priority
    if (this.isCardStaple(card)) score += 100;

    // Cards with archetypes get bonus
    if (card.Archetype && card.Archetype !== "") score += 50;

    // Higher rarity gets slight bonus (more interesting cards)
    const rarityBonus: { [key: string]: number } = {
      Ultra: 30,
      Secret: 25,
      Super: 15,
      Rare: 5,
    };
    if (card.Rarity && rarityBonus[card.Rarity]) {
      score += rarityBonus[card.Rarity];
    }

    // Extra deck monsters get bonus (limited resource)
    if (
      card.Type?.includes("Fusion") ||
      card.Type?.includes("Synchro") ||
      card.Type?.includes("Xyz") ||
      card.Type?.includes("Link")
    ) {
      score += 40;
    }

    // Penalize cards already in specific decks (they're being used)
    if (card["In Deck"] && card["In Deck"] !== "") {
      score -= 30;
    }

    return score;
  }
}
