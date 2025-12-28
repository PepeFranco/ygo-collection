const fs = require('fs');

// Read collection
const collection = JSON.parse(fs.readFileSync('./data/collection.json', 'utf8'));

// Aggregate cards by name
const cardCounts = {};
collection.forEach(card => {
  const name = card.Name;
  if (!cardCounts[name]) {
    cardCounts[name] = 0;
  }
  cardCounts[name]++;
});

// Define all cards needed across the 4 decks
const cardsNeeded = {
  // Cards needed multiple times across decks
  'Black Luster Soldier - Envoy of the Beginning': 2,
  'Chaos Emperor Dragon - Envoy of the End': 2,
  'Mystic Tomato': 4,
  'D.D. Warrior Lady': 3,
  'D.D. Assailant': 3,
  'Exiled Force': 3,
  'Breaker the Magical Warrior': 3,
  'Magician of Faith': 4,
  'Sinister Serpent': 4,
  'Spirit Reaper': 2,
  'Airknight Parshath': 2,
  'Reinforcement of the Army': 4,
  'Mystical Space Typhoon': 6,
  'Bottomless Trap Hole': 6,
  'Book of Moon': 4,
  'Pot of Greed': 4,
  'Graceful Charity': 4,
  'Premature Burial': 4,
  'Snatch Steal': 4,
  'Heavy Storm': 4,
  'Nobleman of Crossout': 4,
  'Scapegoat': 3,
  'Smashing Ground': 4,
  'Lightning Vortex': 3,
  'Mirror Force': 4,
  'Torrential Tribute': 4,
  'Call of the Haunted': 4,
  'Ring of Destruction': 3,
  'Trap Dustshoot': 3,

  // Single copy cards
  'Asura Priest': 1,
  'Morphing Jar': 1,
  'Swords of Revealing Light': 1,
  'The Forceful Sentry': 1,
  'Delinquent Duo': 2,
  'Sakuretsu Armor': 3,
  'Widespread Ruin': 1,
  'Jinzo': 1,
  'Zaborg the Thunder Monarch': 1,
  'Mobius the Frost Monarch': 1,
  'Berserk Gorilla': 1,
  'Blade Knight': 2,
  'Don Zaloog': 1,
  'Elemental Hero Sparkman': 2,
  'Kycoo the Ghost Destroyer': 2,
  'Magical Merchant': 1,
  'Goblin Attack Force': 4,
  'Gemini Elf': 2,
  'Dust Tornado': 2,
  'Shining Angel': 2,
  'Giant Rat': 2,
  'Sangan': 1,
  'Tribe-Infecting Virus': 1,
  'Command Knight': 1,
  'Marauding Captain': 2,
  'Mystic Swordsman LV2': 1,
  'Mystic Swordsman LV4': 1,
  'Mystic Swordsman LV6': 1,
  'Mataza the Zapper': 1,
  'Ninja Grandmaster Sasuke': 1,
  'Level Up!': 1,
};

// Check what's missing or insufficient
const missing = [];
const insufficient = [];

Object.keys(cardsNeeded).forEach(cardName => {
  const needed = cardsNeeded[cardName];
  const have = cardCounts[cardName] || 0;

  if (have === 0) {
    missing.push({ name: cardName, needed, have: 0 });
  } else if (have < needed) {
    insufficient.push({ name: cardName, needed, have });
  }
});

// Output results
console.log('=== MISSING CARDS (0 copies) ===');
if (missing.length === 0) {
  console.log('None! You have at least 1 copy of every card.');
} else {
  missing.forEach(card => {
    console.log(`${card.name}: need ${card.needed}, have ${card.have}`);
  });
}

console.log('\n=== INSUFFICIENT CARDS (have some but not enough) ===');
if (insufficient.length === 0) {
  console.log('None! You have enough copies of everything you own.');
} else {
  insufficient.forEach(card => {
    console.log(`${card.name}: need ${card.needed}, have ${card.have}`);
  });
}

console.log('\n=== SUMMARY ===');
console.log(`Total unique cards needed: ${Object.keys(cardsNeeded).length}`);
console.log(`Missing completely: ${missing.length}`);
console.log(`Insufficient copies: ${insufficient.length}`);
console.log(`Cards OK: ${Object.keys(cardsNeeded).length - missing.length - insufficient.length}`);
