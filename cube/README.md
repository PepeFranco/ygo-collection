# Yu-Gi-Oh! Cube System

This directory contains the cube design and management system for your Yu-Gi-Oh! collection.

## What is a Cube?

A cube is a curated set of cards used for draft formats. Players draft cards from the cube to build decks and play against each other. It's a great way to create a balanced, replayable draft environment from your collection.

## Quick Start

Generate a cube from your collection:

```bash
yarn cube:generate
```

This will create:
- `cube.json` - Full cube data with metadata
- `cube-list.md` - Human-readable card list organized by type
- `cube-duelingbook.txt` - Import format for Dueling Book
- `cube-ygopro.ydk` - Import format for YGO Pro

## Current Cube

**Yu-Gi-Oh! 180 Cube**
- Size: 180 cards
- Distribution: 99 Monsters / 54 Spells / 27 Traps
- Style: Balanced (archetypes + staples)
- Archetypes: 64 different archetypes represented

### Card Breakdown

- **Staple Monsters**: 18 cards (hand traps, generic power cards)
- **Staple Spells**: 21 cards (removal, draw power, generic support)
- **Staple Traps**: 14 cards (disruption, protection)
- **Archetype Monsters**: 81 cards (core monsters for draft strategies)
- **Archetype Spells**: 33 cards (archetype support)
- **Archetype Traps**: 13 cards (archetype-specific disruption)

### Top Archetypes

1. Elemental HERO (8 cards)
2. Archfiend (7 cards)
3. Roid (7 cards)
4. Amazoness (6 cards)
5. ABC (6 cards)
6. Evil HERO (5 cards)
7. Dark Magician (5 cards)
8. Harpie (4 cards)

## Customizing Your Cube

Edit `cube/generateCube.ts` to customize the cube configuration:

```typescript
const config: CubeConfig = {
  name: "My Custom Cube",
  size: 180, // Change cube size (180, 360, 540, etc.)
  format: "modern", // "goat", "edison", "modern", "speed-duel"
  style: "balanced", // "archetype-focused", "goodstuff", "balanced", "theme"

  // Card type ratios (must sum to 1.0)
  targetMonsterRatio: 0.55, // 55% monsters
  targetSpellRatio: 0.30,   // 30% spells
  targetTrapRatio: 0.15,    // 15% traps

  // Archetype limits
  cardsPerArchetype: 8, // Max cards per archetype for diversity

  // Optional filters
  targetArchetypes: ["Blue-Eyes", "Dark Magician"], // Only include specific archetypes
  minRarity: ["Super", "Ultra", "Secret"], // Only include certain rarities
  excludeCards: ["Card Name"], // Exclude specific cards
  includeCards: ["Card Name"], // Force include specific cards
};
```

## Cube Files

### cube.json
Full cube data including:
- All card information from your collection
- Cube categories (staples, archetype support, etc.)
- Metadata (creation date, archetypes, distribution)
- Configuration used to build the cube

### cube-list.md
Human-readable markdown file with:
- Cards organized by type (Monsters, Spells, Traps)
- Card stats and archetypes
- Archetype breakdown

### cube-duelingbook.txt
One card name per line - copy/paste into Dueling Book deck builder

### cube-ygopro.ydk
YGO Pro deck file format - import directly into YGO Pro

## Draft Recommendations

For a 180-card cube:
- **4-6 players**: Each player drafts 30-40 cards
- **Draft format**: Rochester draft or Winston draft
- **Deck size**: 30-40 card decks
- **Extra deck**: 5-10 cards from drafted Extra Deck monsters

## Advanced Usage

### Analyzing Your Cube

The cube builder automatically analyzes your cube and provides recommendations:

```typescript
import { CubeBuilder } from "./cube/cube.builder";
import { CubeUtils } from "./cube/cube.utils";

const builder = new CubeBuilder();
const cube = CubeUtils.loadCube("./cube/cube.json");
const analysis = builder.analyzeCube(cube);
CubeUtils.printAnalysis(analysis);
```

### Adding Custom Staples

Edit `cube/cube.analyzer.ts` to add your own staple definitions:

```typescript
const STAPLE_MONSTERS = [
  "Effect Veiler",
  "Ash Blossom & Joyous Spring",
  // Add your staples here
];
```

### Card Scoring

Cards are scored for cube inclusion based on:
- Staple status (+100 points)
- Archetype membership (+50 points)
- Rarity (Ultra: +30, Secret: +25, Super: +15, Rare: +5)
- Extra Deck monsters (+40 points)
- Cards in decks (-30 points, already being used)

## File Structure

```
cube/
├── README.md              # This file
├── cube.types.ts          # TypeScript type definitions
├── cube.analyzer.ts       # Card analysis and categorization
├── cube.builder.ts        # Cube construction logic
├── cube.utils.ts          # Export and utility functions
├── generateCube.ts        # Main cube generation script
├── cube.json              # Generated cube data
├── cube-list.md           # Generated card list
├── cube-duelingbook.txt   # Dueling Book format
└── cube-ygopro.ydk        # YGO Pro format
```

## Next Steps

1. Review the generated `cube-list.md` to see what cards were selected
2. Customize the configuration in `generateCube.ts` if desired
3. Regenerate the cube with `yarn cube:generate`
4. Import to Dueling Book or YGO Pro for online play
5. Print/organize physical cards for in-person drafts

Enjoy your cube!
