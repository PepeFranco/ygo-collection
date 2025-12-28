import { CollectionRow } from "../data/data.types";
import { SpeedDuelDeck, SpeedDuelArchetype } from "./speedDuel.types";

// Define popular Speed Duel archetypes and their requirements
const SPEED_DUEL_ARCHETYPES: SpeedDuelArchetype[] = [
  {
    name: "Dark Magician",
    character: "Yugi",
    recommendedSkill: "Master of Magicians",
    strategy: "Control deck using Dark Magician and spell/trap support",
    requiredCards: ["Dark Magician"],
    supportCards: [
      "Dark Magic Attack",
      "Thousand Knives",
      "Dark Magic Curtain",
      "Skilled Dark Magician",
      "Magician's Circle",
      "Dark Magic Expanded",
      "Sage's Stone",
      "Dark Magical Circle",
    ],
  },
  {
    name: "Blue-Eyes",
    character: "Kaiba",
    recommendedSkill: "Peak Performance",
    strategy: "Beatdown with Blue-Eyes White Dragon and support",
    requiredCards: ["Blue-Eyes White Dragon"],
    supportCards: [
      "Kaibaman",
      "The White Stone of Legend",
      "Ancient Rules",
      "Burst Stream of Destruction",
      "Champion's Vigilance",
      "Blue-Eyes Spirit Dragon",
      "Majesty with Eyes of Blue",
    ],
  },
  {
    name: "Red-Eyes",
    character: "Joey",
    recommendedSkill: "Grit",
    strategy: "Aggressive beatdown with Red-Eyes monsters",
    requiredCards: ["Red-Eyes B. Dragon"],
    supportCards: [
      "Red-Eyes Insight",
      "Red-Eyes Spirit",
      "Red-Eyes Wyvern",
      "Black Metal Dragon",
      "Inferno Fire Blast",
      "Red-Eyes Slash Dragon",
      "Red-Eyes Baby Dragon",
    ],
  },
  {
    name: "Harpie",
    character: "Mai",
    recommendedSkill: "Harpie's Hunting Ground",
    strategy: "Swarm with Harpie Ladies and backrow removal",
    requiredCards: ["Harpie Lady", "Harpie Lady 1", "Harpie Lady 2", "Harpie Lady 3"],
    supportCards: [
      "Harpie's Feather Duster",
      "Elegant Egotist",
      "Harpie's Hunting Ground",
      "Cyber Harpie Lady",
      "Harpie Queen",
      "Harpie Channeler",
      "Harpie's Pet Dragon",
    ],
  },
  {
    name: "Toons",
    character: "Pegasus",
    recommendedSkill: "It's a Toon World",
    strategy: "Direct attack with Toon monsters",
    requiredCards: ["Toon World"],
    supportCards: [
      "Blue-Eyes Toon Dragon",
      "Toon Dark Magician Girl",
      "Toon Mermaid",
      "Toon Summoned Skull",
      "Comic Hand",
      "Toon Rollback",
      "Toon Kingdom",
    ],
  },
  {
    name: "Amazoness",
    character: "Mai",
    recommendedSkill: "Amazoness Village",
    strategy: "Control with Amazoness warriors",
    requiredCards: ["Amazoness Swords Woman"],
    supportCards: [
      "Amazoness Queen",
      "Amazoness Princess",
      "Amazoness Tiger",
      "Amazoness Onslaught",
      "Amazoness Willpower",
      "Amazoness Village",
      "Amazoness Fighter",
    ],
  },
  {
    name: "Spellcaster Beatdown",
    character: "Yugi",
    recommendedSkill: "Power of Dark",
    strategy: "DARK Spellcaster beatdown",
    requiredCards: ["Skilled Dark Magician", "Dark Magician Girl"],
    supportCards: [
      "Legion the Fiend Jester",
      "Magical Dimension",
      "Magical Blast",
      "Dark Magic Curtain",
      "Magician's Circle",
      "Dark Magician",
    ],
  },
  {
    name: "Dinosaur",
    character: "Rex Raptor",
    recommendedSkill: "Dinosaur Kingdom",
    strategy: "Beatdown with dinosaur-type monsters",
    requiredCards: ["Two-Headed King Rex", "Crawling Dragon", "Tyranno Infinity"],
    supportCards: [
      "Black Tyranno",
      "Destroyersaurus",
      "Sabersaurus",
      "Gilasaurus",
      "Fossil Dig",
      "Survival's End",
      "Jurassic World",
    ],
  },
  {
    name: "Insect",
    character: "Weevil",
    recommendedSkill: "Parasite Infestation",
    strategy: "Insect swarm and burn",
    requiredCards: ["Insect Queen", "Perfectly Ultimate Great Moth"],
    supportCards: [
      "Larvae Moth",
      "Cocoon of Evolution",
      "Resonance Insect",
      "Gokipole",
      "Verdant Sanctuary",
      "Metamorphosed Insect Queen",
    ],
  },
  {
    name: "Gravekeeper's",
    character: "Ishizu",
    recommendedSkill: "Sealed Tombs",
    strategy: "Control with Gravekeeper's and Necrovalley",
    requiredCards: ["Necrovalley"],
    supportCards: [
      "Gravekeeper's Vassal",
      "Gravekeeper's Recruiter",
      "Gravekeeper's Priestess",
      "Gravekeeper's Spiritualist",
      "Gravekeeper's Chief",
      "Rite of Spirit",
    ],
  },
  {
    name: "Zombie",
    character: "Bonz",
    recommendedSkill: "Zombie World",
    strategy: "Zombie swarm and recursion",
    requiredCards: ["Skull Archfiend of Lightning", "Vampire Lord"],
    supportCards: [
      "Pyramid Turtle",
      "Il Blud",
      "Zombie Master",
      "Mezuki",
      "Book of Life",
      "Goblin Zombie",
      "Gozuki",
    ],
  },
  {
    name: "Machine",
    character: "Kaiba",
    recommendedSkill: "Peak Performance",
    strategy: "Machine beatdown and advantage",
    requiredCards: ["Ancient Gear Golem"],
    supportCards: [
      "Mechanicalchaser",
      "Jinzo",
      "Cyber Dragon",
      "Ancient Gear Knight",
      "Limiter Removal",
      "Ancient Gear Tank",
      "Geartown",
    ],
  },
  {
    name: "Warrior Beatdown",
    character: "Joey",
    recommendedSkill: "Last Gamble",
    strategy: "Aggressive warrior monsters",
    requiredCards: ["Gearfried the Iron Knight", "Rocket Warrior"],
    supportCards: [
      "Command Knight",
      "Marauding Captain",
      "D.D. Warrior Lady",
      "Warrior Elimination",
      "The A. Forces",
      "Reinforcement of the Army",
    ],
  },
  {
    name: "Fiend",
    character: "Bakura",
    recommendedSkill: "Fiend Farewell",
    strategy: "DARK Fiend control",
    requiredCards: ["Dark Necrofear", "Dark Ruler Ha Des"],
    supportCards: [
      "Archfiend of Gilfer",
      "Summoned Skull",
      "Puppet Master",
      "Headless Knight",
      "Checkmate",
      "Dark Spirit of the Silent",
    ],
  },
  {
    name: "Golem/Rock",
    character: "Ishizu",
    recommendedSkill: "Grit",
    strategy: "Defense and stall with Rock monsters",
    requiredCards: ["Megarock Dragon", "Guardian Statue"],
    supportCards: [
      "Granmarg the Rock Monarch",
      "Block Golem",
      "Medium of the Ice Barrier",
      "Catapult Turtle",
      "Big Shield Gardna",
    ],
  },
  {
    name: "Fusion",
    character: "Yugi/Joey",
    recommendedSkill: "Fusion Time",
    strategy: "Fusion summon focused strategy",
    requiredCards: ["Polymerization"],
    supportCards: [
      "Fusion Sage",
      "King of the Swamp",
      "Versago the Destroyer",
      "Buster Blader",
      "Blue-Eyes Ultimate Dragon",
      "Dark Paladin",
      "Elemental HERO Flame Wingman",
    ],
  },
];

export class SpeedDuelAnalyzer {
  analyzeCollection(collection: CollectionRow[]): {
    speedDuelCards: CollectionRow[];
    speedDuelLegalCards: CollectionRow[];
    archetypeCounts: { [key: string]: number };
  } {
    const speedDuelCards = collection.filter(
      (card) => card["Is Speed Duel"] === "Yes"
    );
    const speedDuelLegalCards = collection.filter(
      (card) => card["Is Speed Duel Legal"] === "Yes"
    );

    // Count cards by archetype
    const archetypeCounts: { [key: string]: number } = {};
    for (const card of speedDuelLegalCards) {
      if (card.Archetype && card.Archetype !== "") {
        archetypeCounts[card.Archetype] =
          (archetypeCounts[card.Archetype] || 0) + 1;
      }
    }

    return {
      speedDuelCards,
      speedDuelLegalCards,
      archetypeCounts,
    };
  }

  suggestDecks(collection: CollectionRow[], maxDecks: number = 12): SpeedDuelDeck[] {
    const { speedDuelLegalCards } = this.analyzeCollection(collection);

    const decks: SpeedDuelDeck[] = [];

    // Check each archetype
    for (const archetype of SPEED_DUEL_ARCHETYPES) {
      const deck = this.buildDeck(archetype, speedDuelLegalCards);
      if (deck && deck.completeness >= 40) {
        // At least 40% complete
        decks.push(deck);
      }
    }

    // Sort by completeness
    decks.sort((a, b) => b.completeness - a.completeness);

    return decks.slice(0, maxDecks);
  }

  private buildDeck(
    archetype: SpeedDuelArchetype,
    availableCards: CollectionRow[]
  ): SpeedDuelDeck | null {
    const mainDeck: CollectionRow[] = [];
    const extraDeck: CollectionRow[] = [];
    const foundCards = new Set<string>();
    let coreCount = 0;

    // Check for required cards
    const hasRequiredCards = archetype.requiredCards.some((cardName) =>
      availableCards.some((card) => this.cardMatches(card.Name, cardName))
    );

    if (!hasRequiredCards) {
      return null; // Can't build this deck
    }

    // Add all matching cards
    const allRelevantCards = [
      ...archetype.requiredCards,
      ...archetype.supportCards,
    ];

    for (const card of availableCards) {
      for (const relevantCard of allRelevantCards) {
        if (this.cardMatches(card.Name, relevantCard)) {
          if (card.Type?.includes("Fusion") ||
              card.Type?.includes("Synchro") ||
              card.Type?.includes("Xyz") ||
              card.Type?.includes("Link")) {
            if (extraDeck.length < 5) {
              extraDeck.push(card);
            }
          } else {
            mainDeck.push(card);
          }
          foundCards.add(relevantCard);
          if (archetype.requiredCards.includes(relevantCard)) {
            coreCount++;
          }
          break;
        }
      }
    }

    // Add generic staples if deck is small
    if (mainDeck.length < 20) {
      const staples = this.getSpeedDuelStaples(availableCards, archetype);
      mainDeck.push(...staples.slice(0, 20 - mainDeck.length));
    }

    // Calculate completeness
    const totalRelevant = archetype.requiredCards.length + archetype.supportCards.length;
    const completeness = (foundCards.size / totalRelevant) * 100;

    // Deduplicate by card ID
    const uniqueMain = this.deduplicateCards(mainDeck);
    const uniqueExtra = this.deduplicateCards(extraDeck);

    return {
      name: archetype.name,
      character: archetype.character,
      strategy: archetype.strategy,
      skill: archetype.recommendedSkill,
      mainDeck: uniqueMain.slice(0, 30), // Speed Duel max 30 main deck
      extraDeck: uniqueExtra.slice(0, 5), // Speed Duel max 5 extra deck
      keyCards: archetype.requiredCards,
      coreCount,
      completeness: Math.round(completeness),
      notes: this.generateDeckNotes(uniqueMain, uniqueExtra, archetype),
    };
  }

  private cardMatches(cardName: string, searchName: string): boolean {
    const normalize = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalize(cardName).includes(normalize(searchName)) ||
           normalize(searchName).includes(normalize(cardName));
  }

  private getSpeedDuelStaples(
    availableCards: CollectionRow[],
    archetype: SpeedDuelArchetype
  ): CollectionRow[] {
    const stapleNames = [
      "Monster Reborn",
      "Dark Hole",
      "Mirror Force",
      "Mystical Space Typhoon",
      "Nobleman of Crossout",
      "Tribute to the Doomed",
      "Windstorm of Etaqua",
      "Curse of Anubis",
      "Enemy Controller",
      "Super Rush Headlong",
      "Wall of Disruption",
      "Powerful Rebirth",
      "Sphere Kuriboh",
    ];

    const staples: CollectionRow[] = [];
    for (const card of availableCards) {
      if (stapleNames.some((name) => this.cardMatches(card.Name, name))) {
        staples.push(card);
      }
    }

    return this.deduplicateCards(staples);
  }

  private deduplicateCards(cards: CollectionRow[]): CollectionRow[] {
    const seen = new Set<string>();
    const unique: CollectionRow[] = [];

    for (const card of cards) {
      const key = `${card.ID}-${card.Name}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(card);
      }
    }

    return unique;
  }

  private generateDeckNotes(
    mainDeck: CollectionRow[],
    extraDeck: CollectionRow[],
    archetype: SpeedDuelArchetype
  ): string[] {
    const notes: string[] = [];

    notes.push(`Main Deck: ${mainDeck.length} cards`);
    if (extraDeck.length > 0) {
      notes.push(`Extra Deck: ${extraDeck.length} cards`);
    }

    // Count card types
    const monsters = mainDeck.filter((c) => c.Type?.includes("Monster")).length;
    const spells = mainDeck.filter((c) => c.Type?.includes("Spell")).length;
    const traps = mainDeck.filter((c) => c.Type?.includes("Trap")).length;

    notes.push(`Distribution: ${monsters}M / ${spells}S / ${traps}T`);

    if (mainDeck.length < 20) {
      notes.push("⚠️ Add more cards to reach minimum 20 cards");
    }

    return notes;
  }
}
