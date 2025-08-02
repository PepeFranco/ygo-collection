const {
  getCardSets,
  getStructureDeckSets,
} = require("./getCardsMissingForStructureDecks");
const axios = require("axios");
const fs = require("fs");
const { Promise } = require("bluebird");
const _ = require("lodash");

const getCardsInStructureDeck = async (structureDeckName) => {
  const result = await axios
    .get(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${structureDeckName}`
    )
    .catch((e) => {
      // console.error(e);
    });

  return (result && result.data && result.data.data) || null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const legendaryHeroDeck = {
  date: "2018-10-04",
  deck: "Legendary Hero Decks - HERO",
  cards: [
    "Xtra HERO Dread Decimator",
    "Destiny HERO - Dogma",
    "Destiny HERO - Plasma",
    "Destiny HERO - Dreadmaster",
    "Destiny HERO - Malicious",
    "Destiny HERO - Celestial",
    "Destiny HERO - Diamond Dude",
    "Destiny HERO - Dread Servant",
    "Destiny HERO - Disk Commander",
    "Destiny HERO - Dark Angel",
    "Destiny HERO - Dynatag",
    "Destiny HERO - Drilldark",
    "Destiny HERO - Decider",
    "Destiny HERO - Dreamer",
    "D Cubed",
    "Elemental HERO Shadow Mist",
    "Elemental HERO Blazeman",
    "Destiny Draw",
    "Over Destiny",
    "Clock Tower Prison",
    "Dark City",
    "Mask Change",
    "Polymerization",
    "Monster Reborn",
    "Magical Stone Excavation",
    "Terraforming",
    "A Feather of the Phoenix",
    "Destiny Signal",
    "D - Time",
    "Eternal Dread",
    "D-Fusion",
    "Destiny End Dragoon",
    "Destiny HERO - Dusktopia",
    "Destiny HERO - Dystopia",
    "Destiny HERO - Dangerous",
    "Masked HERO Dark Law",
    "Masked HERO Anki",
    "Xtra HERO Wonder Driver",
  ],
};

const legendaryAesirDeck = {
  date: "2018-10-04",
  deck: "Legendary Hero Decks - Aesir",
  cards: [
    "Gullveig of the Nordic Ascendant",
    "Tanngrisnir of the Nordic Beasts",
    "Tanngnjostr of the Nordic Beasts",
    "Garmr of the Nordic Beasts",
    "Guldfaxe of the Nordic Beasts",
    "Dverg of the Nordic Alfar",
    "Ljosalf of the Nordic Alfar",
    "Svartalf of the Nordic Alfar",
    "Mara of the Nordic Alfar",
    "Mimir of the Nordic Ascendant",
    "Valkyrie of the Nordic Ascendant",
    "Vanadis of the Nordic Ascendant",
    "Tyr of the Nordic Champions",
    "The Nordic Lights",
    "Nordic Relic Draupnir",
    "March Towards Ragnarok",
    "Forbidden Chalice",
    "Forbidden Lance",
    "Forbidden Dress",
    "Monster Reborn",
    "Soul Charge",
    "Dark Hole",
    "Hey, Trunade!",
    "Mystical Space Typhoon",
    "Gleipnir, the Fetters of Fenrir",
    "Nordic Relic Brisingamen",
    "Nordic Relic Laevateinn",
    "Nordic Relic Gungnir",
    "Nordic Relic Megingjord",
    "Solemn Authority",
    "Thor, Lord of the Aesir",
    "Loki, Lord of the Aesir",
    "Odin, Father of the Aesir",
    "Leo, the Keeper of the Sacred Tree",
    "Ascension Sky Dragon",
    "Beelzeus of the Diabolic Dragons",
    "Beelze of the Diabolic Dragons",
    "Scrap Dragon",
    "Coral Dragon",
  ],
};

const legendaryPKDeck = {
  date: "2018-10-04",
  deck: "Legendary Hero Decks - Phantom Knights",
  cards: [
    "The Phantom Knights of Rusty Bardiche",
    "The Phantom Knights of Ancient Cloak",
    "The Phantom Knights of Silent Boots",
    "The Phantom Knights of Ragged Gloves",
    "The Phantom Knights of Cloven Helm",
    "The Phantom Knights of Fragile Armor",
    "Armageddon Knight",
    "Blue Mountain Butterspy",
    "Rescue Ferret",
    "Junk Forward",
    "Kagemucha Knight",
    "Cockadoodledoo",
    "Effect Veiler",
    "The Phantom Knights' Rank-Up-Magic Launch",
    "Phantom Knights' Spear",
    "Dark Hole",
    "Monster Reborn",
    "Foolish Burial",
    "Reinforcement of the Army",
    "Dark Eruption",
    "Twin Twisters",
    "Phantom Knights' Fog Blade",
    "Phantom Knights' Sword",
    "Phantom Knights' Wing",
    "The Phantom Knights of Shadow Veil",
    "The Phantom Knights of Shade Brigandine",
    "The Phantom Knights of Dark Gauntlets",
    "The Phantom Knights of Tomb Shield",
    "The Phantom Knights of Lost Vambrace",
    "The Phantom Knights of Wrong Magnetring",
    "The Phantom Knights of Mist Claws",
    "The Phantom Knights of Break Sword",
    "The Phantom Knights of Cursed Javelin",
    "Dark Rebellion Xyz Dragon",
    "Dark Requiem Xyz Dragon",
    "Evilswarm Nightmare",
    "Evilswarm Thanatos",
    "Number 86: Heroic Champion - Rhongomyniad",
    "Leviair the Sea Dragon",
    "Dante, Traveler of the Burning Abyss",
  ],
};

const mainFunction = async () => {
  const cardSets = await getCardSets();
  console.log(`There are ${cardSets.length} sets`);

  const structureDeckSets = getStructureDeckSets(cardSets);
  console.log(`There are ${structureDeckSets.length} structure decks`);

  const cardsInStructureDeckSet = [
    legendaryAesirDeck,
    legendaryHeroDeck,
    legendaryPKDeck,
  ];
  await Promise.each(structureDeckSets, async ({ deck, date }) => {
    const cardsInStructureDeck = await getCardsInStructureDeck(deck);
    const cardNames = cardsInStructureDeck.map((card) => card["name"]);
    cardsInStructureDeckSet.push({ deck, cards: cardNames, date });
    console.log(`Downloaded ${cardsInStructureDeck.length} cards for ${deck}`);
    await sleep(100);
  });

  // TODO: Replace fs.writeFile with fs.writeFileSync for consistency
  fs.writeFile(
    "./structureDecks/cardsInStructureDecks.json",
    JSON.stringify(_.sortBy(cardsInStructureDeckSet, ["date"]), null, 3),
    function (err) {
      // console.error(err);
    }
  );
};

mainFunction();
