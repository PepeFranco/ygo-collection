const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");

const getCardSets = async () => {
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardsets.php")
    .catch((e) => {
      // console.error(e);
    });

  return (result && result.data) || null;
};

const collection = require("../data/collection.json");
const mainFunction = async () => {
  const banLists = _.sortBy(
    require("../data/banlists.json"),
    (l) => new Date(l.date)
  );

  const cardsInStructureDeck = collection.filter((card) =>
    card["In Deck"].includes("Structure Deck")
  );
  const structureDecks = _.uniq(
    cardsInStructureDeck.map((card) => card["In Deck"])
  );

  const deckCardPair = cardsInStructureDeck.map((card) => ({
    card: card["Name"],
    deck: card["In Deck"],
  }));
  const uniqueCardsInSD = _.uniqBy(
    deckCardPair,
    (dcp) => `${dcp.card}-${dcp.deck}`
  );

  console.log("All SD cards: ", deckCardPair.length);
  console.log("Unique SD cards: ", uniqueCardsInSD.length);

  const uniqueCardsTimes2 = [];
  const uniqueCardsTimes3 = [];

  const sets = await getCardSets();
  const sds = _.sortBy(
    sets.filter((s) => s["set_name"].toLowerCase().includes("structure deck")),
    (sd) => sd["tcg_date"]
  );

  const getClosestMatchingBanList = (d) => {
    for (let i = 0; i < banLists.length; i++) {
      const thisBl = banLists[i];
      if (i === banLists.length - 1) {
        return thisBl;
      }
      const nextBl = banLists[i + 1];
      const nextBlDate = new Date(nextBl.date);
      if (
        nextBlDate.getFullYear() === d.getFullYear() &&
        nextBlDate.getMonth() === d.getMonth()
      )
        return nextBl;
      if (nextBlDate > d) return thisBl;
    }
  };

  const limitedCardsPerDeck = {};

  sds.map((sd) => {
    const sdname = sd["set_name"];
    const cardsInThisSD = uniqueCardsInSD.filter(
      (c) =>
        c.deck === sdname ||
        (c.deck.toLowerCase().includes("legendary deck") &&
          sdname === "Legendary Hero Decks")
    );
    if (cardsInThisSD.length === 0) {
      return;
    }
    const thisReleaseDate = new Date(sd["tcg_date"]);
    const thisBanlist = getClosestMatchingBanList(thisReleaseDate);
    console.log("-----------------");
    console.log(sdname);
    const limitedCards = thisBanlist.cards.filter((c) => c.number === 1);
    const semiLimitedCards = thisBanlist.cards.filter((c) => c.number === 2);
    const limitedCardsInThisDeck = [];
    const semiCardsInThisDeck = [];
    cardsInThisSD.map((c) => {
      uniqueCardsTimes2.push(c);
      uniqueCardsTimes3.push(c);
      const limitedIndex = limitedCards.findIndex(
        (cc) => cc.card.toLowerCase() === c.card.toLowerCase()
      );
      if (limitedIndex >= 0) {
        console.log(c.card, " is limited, not adding it again");
        limitedCardsInThisDeck.push(c.card);
        return;
      }
      uniqueCardsTimes2.push(c);
      uniqueCardsTimes3.push(c);
      const semLimitedIndex = semiLimitedCards.findIndex(
        (cc) => cc.card.toLowerCase() === c.card.toLowerCase()
      );
      if (semLimitedIndex >= 0) {
        console.log(c.card, " is semi limited, not adding it again");
        semiCardsInThisDeck.push(c.card);
        return;
      }
      uniqueCardsTimes3.push(c);
    });
    limitedCardsPerDeck[sdname] = {
      limited: limitedCardsInThisDeck,
      semiLimited: semiCardsInThisDeck,
    };

    // console.log(thisReleaseDate, thisBanlist.date);
  });

  const allCollectionCards = collection.map((card) => ({
    card: card["Name"],
    code: card["Code"],
    set: card["Set"],
    deck: card["In DecK"],
    sleeve: card["In Sleeve"],
    attribute: card["Attribute"],
    type: card["Type"].toLowerCase().includes("monster")
      ? "Monster"
      : card["Type"],
  }));

  console.log("All cards in collection: ", allCollectionCards.length);
  // Object.keys(_.groupBy(allCollectionCards, (c) => c.location)).map((l) => {
  //   console.log(l);
  // });
  console.log("Unique SD cards:    ", uniqueCardsInSD.length);
  console.log("Unique SD cards x2: ", uniqueCardsTimes2.length);
  console.log("Unique SD cards x3: ", uniqueCardsTimes3.length);

  const cardsIAlreadyOwnToComplete2Sets = [];
  const cardsIAlreadyOwnToComplete3Sets = [];

  allCollectionCards.map((cc) => {
    const cardIndex = uniqueCardsInSD.findIndex(
      (uc) => uc.card.toLowerCase() === cc.card.toLowerCase()
    );

    if (cardIndex >= 0) {
      uniqueCardsInSD.splice(cardIndex, 1);
    }

    const cardIndex2 = uniqueCardsTimes2.findIndex(
      (uc) => uc.card.toLowerCase() === cc.card.toLowerCase()
    );

    if (cardIndex2 >= 0) {
      cardsIAlreadyOwnToComplete2Sets.push({
        ...cc,
        deck: uniqueCardsTimes2[cardIndex2].deck,
      });
      uniqueCardsTimes2.splice(cardIndex2, 1);
    }

    const cardIndex3 = uniqueCardsTimes3.findIndex(
      (uc) => uc.card.toLowerCase() === cc.card.toLowerCase()
    );

    if (cardIndex3 >= 0) {
      cardsIAlreadyOwnToComplete3Sets.push({
        ...cc,
        deck: uniqueCardsTimes3[cardIndex3].deck,
      });
      uniqueCardsTimes3.splice(cardIndex3, 1);
    }
  });

  console.log("=====After removal=======");
  console.log("Unique SD cards:    ", uniqueCardsInSD.length);
  console.log("Unique SD cards x2: ", uniqueCardsTimes2.length);
  console.log("Unique SD cards x3: ", uniqueCardsTimes3.length);

  console.log(
    "Cards I own to complete x2 sets: ",
    cardsIAlreadyOwnToComplete2Sets.length
  );
  console.log(
    "Cards I own to complete x3 sets: ",
    cardsIAlreadyOwnToComplete3Sets.length
  );

  const cardsPerDeck2 = _.sortBy(
    structureDecks.map((sd) => {
      const cards = uniqueCardsTimes2.filter((uc) => uc.deck === sd);
      return { deck: sd, cards: cards.length };
    }),
    (cd) => cd.cards
  );

  const cardsPerDeck3 = _.sortBy(
    structureDecks.map((sd) => {
      const cards = uniqueCardsTimes3.filter((uc) => uc.deck === sd);
      return { deck: sd, cards: cards.length };
    }),
    (cd) => cd.cards
  );

  // console.log(cardsPerDeck2);
  // console.log(cardsPerDeck3);

  const sortPerMissingCards2 = (a, b) => {
    const cardsNeededInDeckA = cardsPerDeck2.find(
      (d) => d.deck === a.deck
    ).cards;
    const cardsNeededInDeckB = cardsPerDeck2.find(
      (d) => d.deck === b.deck
    ).cards;
    if (cardsNeededInDeckA < cardsNeededInDeckB) {
      return -1;
    }
    if (cardsNeededInDeckA > cardsNeededInDeckB) {
      return 1;
    }
    if (a.card < b.card) {
      return -1;
    }
    if (a.card > b.card) {
      return 1;
    }
    return 0;
  };

  const sortPerMissingCards3 = (a, b) => {
    const cardsNeededInDeckA = cardsPerDeck3.find(
      (d) => d.deck === a.deck
    ).cards;
    const cardsNeededInDeckB = cardsPerDeck3.find(
      (d) => d.deck === b.deck
    ).cards;
    if (cardsNeededInDeckA < cardsNeededInDeckB) {
      return -1;
    }
    if (cardsNeededInDeckA > cardsNeededInDeckB) {
      return 1;
    }
    if (a.card < b.card) {
      return -1;
    }
    if (a.card > b.card) {
      return 1;
    }
    return 0;
  };

  const preDecks2 = _.groupBy(
    uniqueCardsTimes2.sort(sortPerMissingCards2),
    (c) => c.deck
  );

  const sorted2 = [];
  for (const [key, value] of Object.entries(preDecks2)) {
    sorted2.push({ deck: key, cards: value.map((c) => c.card) });
  }

  const sortedUniqueCardsTimes2 = _.orderBy(sorted2, (d) => d.cards.length);

  fs.writeFile(
    "./collectionScripts/structureDecks/cardsNeededToComplete2Sets.json",
    JSON.stringify(sortedUniqueCardsTimes2, null, 3),
    function (err) {
      console.error(err);
    }
  );

  const preDecks3 = _.groupBy(
    uniqueCardsTimes3.sort(sortPerMissingCards3),
    (c) => c.deck
  );

  const sorted3 = [];
  for (const [key, value] of Object.entries(preDecks3)) {
    sorted3.push({ deck: key, cards: value.map((c) => c.card) });
  }

  const sortedUniqueCardsTimes3 = _.orderBy(sorted3, (d) => d.cards.length);

  fs.writeFile(
    "./collectionScripts/structureDecks/cardsNeededToComplete3Sets.json",
    JSON.stringify(sortedUniqueCardsTimes3, null, 3),
    function (err) {
      console.error(err);
    }
  );

  const owned2 = _.groupBy(cardsIAlreadyOwnToComplete2Sets, (c) => c.location);
  for (const [key, value] of Object.entries(owned2)) {
    owned2[key] = _.sortBy(value, (c) => `${c.attribute}-${c.type}-${c.card}`);
  }

  fs.writeFile(
    "./collectionScripts/structureDecks/cardsIAlreadyOwnToComplete2Sets.json",
    JSON.stringify(owned2, null, 3),
    function (err) {
      console.error(err);
    }
  );

  // console.log("Cards to move per location ================");
  const owned3 = _.groupBy(cardsIAlreadyOwnToComplete3Sets, (c) => c.location);
  // Object.keys(owned3).map((l) => {
  //   console.log(l, owned3[l].length);
  // });
  for (const [key, value] of Object.entries(owned3)) {
    owned3[key] = _.sortBy(value, (c) => `${c.attribute}-${c.type}-${c.card}`);
  }

  fs.writeFile(
    "./collectionScripts/structureDecks/cardsIAlreadyOwnToComplete3Sets.json",
    JSON.stringify(owned3, null, 3),
    function (err) {
      console.error(err);
    }
  );

  fs.writeFile(
    "./collectionScripts/structureDecks/limitedCardsPerDeck.json",
    JSON.stringify(limitedCardsPerDeck, null, 3),
    function (err) {
      console.error(err);
    }
  );
};

mainFunction();
