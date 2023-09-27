const axios = require("axios");
const fs = require("fs");
const _ = require("lodash");

// const deckPath = "/formats/goat/";
// const decks = ["Goat Control", "Goat Warrior"];
// const excludeLanguages = ["SP"];

const deckPath = "/formats/structure/";
const decks = [];
const excludeLanguages = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getCardName = async (id) => {
  await sleep(100);
  const result = await axios
    .get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`)
    .catch((e) => {
      // console.error(e);
    });

  if (result && result.data.data[0]) {
    // console.log(result.data.data[0].name);
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
  console.log(builtDecks);

  const collection = require("./data/collection.json");
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
    const rarityScore = rarityMap[card.rarity] || 10;
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
        const getCCLanguage = () => {
          if (!cc.code) {
            return undefined;
          }
          const splitCode = cc.code.split("-");
          if (splitCode.length < 2) {
            return undefined;
          }
          return splitCode[1].substring(0, 2);
        };
        return (
          cc.name === cardInDeckName &&
          !cc.deck &&
          !excludeLanguages.includes(getCCLanguage())
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
