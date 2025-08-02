const axios = require("axios");
const fs = require("fs");
const _ = require("lodash");

// const deckPath = "/formats/goat/";
// const decks = ["Goat Control", "Goat Warrior"];
// const excludeLanguages = ["SP"];

const deckPath = "/formats/edison/";
// const deckPath = "/formats/structure/";
// Can be empty and will go through the directory
// For SDs this array keeps release order
// Legendary Deck is wrong cause the set list includes 3 decks
// And the Deck name in collection is different from the set name
// const decks = [
//   "Structure Deck: Dragon's Roar",
//   "Structure Deck: Zombie Madness",
//   "Structure Deck: Blaze of Destruction",
//   "Structure Deck: Fury from the Deep",
//   "Structure Deck: Warrior's Triumph",
//   "Structure Deck: Spellcaster's Judgment",
//   "Structure Deck: Invincible Fortress",
//   "Structure Deck: Lord of the Storm",
//   "Structure Deck: Dinosaur's Rage",
//   "Structure Deck: Machine Re-Volt",
//   "Rise of the Dragon Lords Structure Deck",
//   "The Dark Emperor Structure Deck",
//   "Zombie World Structure Deck",
//   "Spellcaster's Command Structure Deck",
//   "Warriors' Strike Structure Deck",
//   "Machina Mayhem Structure Deck",
//   "Structure Deck: Marik (TCG)",
//   "Dragunity Legion Structure Deck",
//   "Lost Sanctuary Structure Deck",
//   "Gates of the Underworld Structure Deck",
//   "Dragons Collide Structure Deck",
//   "Samurai Warlords Structure Deck",
//   "Realm of the Sea Emperor Structure Deck",
//   "Onslaught of the Fire Kings Structure Deck",
//   "Saga of Blue-Eyes White Dragon Structure Deck",
//   "Cyber Dragon Revolution Structure Deck",
//   "Realm of Light Structure Deck",
//   "Geargia Rampage Structure Deck",
//   "HERO Strike Structure Deck",
//   "Synchron Extreme Structure Deck",
//   "Master of Pendulum Structure Deck",
//   "Emperor of Darkness Structure Deck",
//   "Rise of the True Dragons Structure Deck",
//   "Structure Deck: Seto Kaiba",
//   "Structure Deck: Yugi Muto",
//   "Pendulum Domination Structure Deck",
//   "Dinosmasher's Fury Structure Deck",
//   "Machine Reactor Structure Deck",
//   "Structure Deck: Cyberse Link",
//   "Structure Deck: Wave of Light",
//   "Structure Deck: Lair of Darkness",
//   "Structure Deck: Powercode Link",
//   "Legendary Hero Decks",
//   "Structure Deck: Zombie Horde",
//   "Structure Deck: Soulburner",
//   "Structure Deck: Order of the Spellcasters",
//   "Structure Deck: Rokket Revolt",
//   "Structure Deck: Shaddoll Showdown",
//   "Structure Deck: Mechanized Madness",
//   "Structure Deck: Sacred Beasts",
//   "Structure Deck: Spirit Charmers",
//   "Structure Deck: Freezing Chains",
//   "Structure Deck: Cyber Strike",
//   "Structure Deck: Albaz Strike",
//   "Structure Deck: Legend of the Crystal Beasts",
//   "Structure Deck: Dark World",
//   "Structure Deck: Beware of Traptrix",
//   "Structure Deck: The Crimson King",
// ];
const decks = ["quickdraw plant w side", "diva hero"];
const excludeLanguages = [];
// If empty, will not use cards already in deck
// If it has values, will use the cards in those decks
// This works for SDs to use as many real cards as possible for earlier decks
// Get this empty to check which cards need to be printed
// And then add back Structure Deck and Legendary Deck to see where to get the real cards from
const includeDecks = ["structure deck", "Legendary Deck", "edison"];
// const includeDecks = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getCardName = async (id) => {
  await sleep(100);
  const result = await axios
    .get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`)
    .catch((e) => {
      // console.error(e);
    });

  if (result && result.data.data[0]) {
    console.log(result.data.data[0].name);
    return result.data.data[0].name;
  }
  return undefined;
};

const getDeckList = async (deck) => {
  const deckContents = fs.readFileSync(`${__dirname}${deckPath}${deck}`, {
    encoding: "utf8",
    flag: "r",
  });
  const cardIdsOrNames = deckContents
    .split("\n")
    .filter((codeOrName) => codeOrName.trim().length > 0);
  //   console.log("=>getDeckList");
  //   console.log({ deck }, cardIdsOrNames.length);
  const cardNames = [];
  for (let i = 0; i < cardIdsOrNames.length; i++) {
    const cardIdOrName = cardIdsOrNames[i];
    const cardIsId = !Number.isNaN(Number(cardIdOrName));
    // console.log({ cardIdOrName, cardIsId });
    if (cardIsId) {
      const cardName = await getCardName(cardIdOrName);
      //   console.log({ cardName });
      cardNames.push(cardName);
      continue;
    }
    cardNames.push(cardIdOrName);
  }
  fs.writeFileSync(
    `${__dirname}${deckPath}${deck}`,
    cardNames.join("\n"),
    () => {}
  );
  return _.sortBy(cardNames, _.identity);
};

const main = async () => {
  const builtDecks = {};
  if (decks.length === 0) {
    const filenames = fs.readdirSync(
      `${__dirname}${deckPath}`,
      function (err, filenames) {
        if (err) {
          console.log(err);
          return;
        }
      }
    );
    filenames.forEach(function (filename) {
      if (!fs.lstatSync(`${__dirname}${deckPath}${filename}`).isDirectory()) {
        decks.push(filename);
      }
    });
  }

  for (let i = 0; i < decks.length; i++) {
    const deck = decks[i];
    const deckList = await getDeckList(deck);
    builtDecks[deck] = {};
    builtDecks[deck].cardsFound = [];
    builtDecks[deck].cardsNotFound = [];
    builtDecks[deck].cards = deckList;
  }
  // console.log(builtDecks);

  const collection = require("../data/collection.json");
  const allCollectionCards = collection.map((card) => ({
    id: card["ID"],
    name: card["Name"],
    code: card["Code"],
    rarity: card["Rarity"],
    set: card["Set"],
    deck: card["In Deck"],
  }));

  const sortedCards = _.sortBy(allCollectionCards, (card) => {
    const rarityMap = {
      Ghost: 0,
      Ultimate: 1,
      Secret: 2,
      Ultra: 3,
      Super: 4,
      Rare: 5,
    };
    const inDeckScore = !card.deck ? 1 : 2;
    const rarityScore = inDeckScore * (rarityMap[card.rarity] || 10);
    return rarityScore;
  });

  const getCardFoundRecord = (card) =>
    `${card.name} (${card.rarity}) [${card.code}] <${card.deck}>`;

  let collectionCopy = [...sortedCards];
  Object.keys(builtDecks).map((deck) => {
    console.log(deck);
    const cardsAlreadyInDeck = collectionCopy.filter(
      (card) => card.deck === deck
    );
    builtDecks[deck].cardsFound = cardsAlreadyInDeck.map((card) =>
      getCardFoundRecord(card)
    );

    cardsAlreadyInDeck.map((cardFound) => {
      const cardIndex = builtDecks[deck].cards.findIndex(
        (cardName) => cardName === cardFound.name
      );
      builtDecks[deck].cards.splice(cardIndex, 1);
    });

    collectionCopy = collectionCopy.filter((card) => card.deck !== deck);
    // console.log("....", deck);
    // console.log(builtDecks[deck]);
    builtDecks[deck].cards.map((cardInDeckName) => {
      const cardIndex = collectionCopy.findIndex((cc) => {
        const shouldIncludeBasedOnLanguage = () => {
          if (!cc.code) {
            return true;
          }
          const splitCode = cc.code.split("-");
          if (splitCode.length < 2) {
            return true;
          }
          return !excludeLanguages.includes(splitCode[1].substring(0, 2));
        };
        const shouldIncludeBasedOnDeck = () => {
          if (!cc.deck) {
            return true;
          }

          if (includeDecks.length === 0) {
            return false;
          }

          return includeDecks.reduce((accumulator, currentValue) => {
            // if (cc.name === "Thestalos the Firestorm Monarch") {
            //   console.log(cc.deck, cc.deck.includes(currentValue));
            // }
            return accumulator || cc.deck.toLowerCase().includes(currentValue);
          }, false);
        };
        return (
          cc.name === cardInDeckName &&
          shouldIncludeBasedOnDeck() &&
          shouldIncludeBasedOnLanguage()
        );
      });
      // console.log(c, cardIndex);
      if (cardIndex > 0) {
        builtDecks[deck].cardsFound.push(
          getCardFoundRecord(collectionCopy[cardIndex])
        );
        collectionCopy.splice(cardIndex, 1);
      } else {
        builtDecks[deck].cardsNotFound.push(cardInDeckName);
      }
    });
    delete builtDecks[deck].cards;
  });

  Object.keys(builtDecks).map((deck) => {
    fs.writeFileSync(
      `${__dirname}${deckPath}built/${deck}.json`,
      JSON.stringify(builtDecks[deck], null, 3),
      () => {}
    );
  });
};

main();
