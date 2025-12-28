# Speed Duel Deck Suggestions

This directory contains the Speed Duel deck suggestion system for your Yu-Gi-Oh! collection.

## What is Speed Duel?

Speed Duel is a faster-paced Yu-Gi-Oh! format designed to capture the excitement of the original anime duels. Key differences:
- **20-30 card main deck** (vs 40-60 in standard)
- **0-5 card extra deck** (vs 0-15 in standard)
- **Skill cards** that give characters unique abilities
- **4000 LP** instead of 8000 LP
- **3 monster zones** and **3 spell/trap zones**

## Quick Start

Generate Speed Duel deck suggestions from your collection:

```bash
yarn speed-duel:suggest
```

This will create:
- `speed-duel-decks.json` - Full deck data
- `speed-duel-decks.md` - Detailed deck lists with card breakdowns
- `speed-duel-summary.md` - Quick overview table
- `duelingbook/` - Individual deck files for Dueling Book import

## Your Speed Duel Collection

From your collection:
- **3,176 Speed Duel cards** (cards from Speed Duel products)
- **5,127 Speed Duel legal cards** (cards allowed in Speed Duel format)
- **83 unique archetypes** represented

## Suggested Decks

The system found **12 viable Speed Duel decks** you can build:

| # | Deck Name | Character | Completeness | Strategy |
|---|-----------|-----------|--------------|----------|
| 1 | Warrior Beatdown | Joey | 88% | Aggressive warrior monsters |
| 2 | Fiend | Bakura | 88% | DARK Fiend control |
| 3 | Fusion | Yugi/Joey | 88% | Fusion summon focused strategy |
| 4 | Gravekeeper's | Ishizu | 86% | Control with Gravekeeper's and Necrovalley |
| 5 | Amazoness | Mai | 75% | Control with Amazoness warriors |
| 6 | Spellcaster Beatdown | Yugi | 75% | DARK Spellcaster beatdown |
| 7 | Machine | Kaiba | 75% | Machine beatdown and advantage |
| 8 | Dark Magician | Yugi | 67% | Control deck using Dark Magician and spell/trap support |
| 9 | Toons | Pegasus | 63% | Direct attack with Toon monsters |
| 10 | Insect | Weevil | 63% | Insect swarm and burn |
| 11 | Zombie | Bonz | 56% | Zombie swarm and recursion |
| 12 | Blue-Eyes | Kaiba | 50% | Beatdown with Blue-Eyes White Dragon and support |

## Building Your Decks

The suggestions show you what cards from your collection work for each deck. Most decks need additional cards to reach the 20-card minimum:

1. **Check the detailed deck list** in `speed-duel-decks.md` to see what cards you have
2. **Add Speed Duel staples** like:
   - Monster Reborn
   - Mirror Force
   - Enemy Controller
   - Windstorm of Etaqua
   - Sphere Kuriboh
   - Powerful Rebirth
   - Wall of Disruption

3. **Fill with archetype-relevant cards** from your collection
4. **Aim for 20-30 main deck cards** with good monster/spell/trap balance

## Skill Cards

Each deck has a recommended Skill card (assumed you have all skills):

- **Yugi:** Master of Magicians, Power of Dark, Fusion Time
- **Kaiba:** Peak Performance
- **Joey:** Last Gamble, Grit
- **Mai:** Harpie's Hunting Ground, Amazoness Village
- **Pegasus:** It's a Toon World
- **Bakura:** Fiend Farewell
- **Ishizu:** Sealed Tombs
- **Rex Raptor:** Dinosaur Kingdom
- **Weevil:** Parasite Infestation
- **Bonz:** Zombie World

## Customizing Suggestions

To add more archetypes or modify existing ones, edit `speedDuel/speedDuel.analyzer.ts` (speedDuel/speedDuel.analyzer.ts:10):

```typescript
const SPEED_DUEL_ARCHETYPES: SpeedDuelArchetype[] = [
  {
    name: "Your Archetype",
    character: "Character Name",
    recommendedSkill: "Skill Name",
    strategy: "Description of strategy",
    requiredCards: ["Must-have card"],
    supportCards: ["Nice-to-have cards"],
  },
  // Add more archetypes here
];
```

## Deck Completeness

Completeness percentage shows how many key archetype cards you have:
- **80%+**: Very complete, just needs filler
- **60-79%**: Playable with additions
- **40-59%**: Missing some key pieces
- **<40%**: Not suggested (filtered out)

## File Structure

```
speedDuel/
├── README.md                    # This file
├── speedDuel.types.ts           # TypeScript type definitions
├── speedDuel.analyzer.ts        # Deck analysis and archetype definitions
├── speedDuel.utils.ts           # Export and utility functions
├── suggestSpeedDuelDecks.ts     # Main deck suggestion script
├── speed-duel-decks.json        # Generated deck data
├── speed-duel-decks.md          # Detailed deck lists
├── speed-duel-summary.md        # Quick overview
└── duelingbook/                 # Dueling Book import files
    ├── warrior-beatdown-duelingbook.txt
    ├── fiend-duelingbook.txt
    └── ... (one file per deck)
```

## Next Steps

1. Review `speed-duel-decks.md` to see the full card lists
2. Choose which deck(s) you want to build
3. Add additional cards from your collection to reach 20-30 cards
4. Test on Dueling Book using the generated import files
5. Build physical decks for in-person Speed Duels

## Commands

```bash
# Generate Speed Duel deck suggestions
yarn speed-duel:suggest
```

Happy dueling!
