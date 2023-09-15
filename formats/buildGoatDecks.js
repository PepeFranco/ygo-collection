const axios = require("axios");

const getCardInfo = async (id) => {
  // console.log("==================");
  // console.log(name);
  const result = await axios
    .get("https://db.ygoprodeck.com/api/v7/cardinfo.php?id=" + id)
    .catch((e) => {
      // console.error(e);
    });

  if (result && result.data.data[0]) {
    // console.log(result.data.data[0].name);
    return {
      card: result.data.data[0].id,
      name: result.data.data[0].name,
    };
  }
  return {
    card: id,
    name: "",
  };
};

const main = async () => {
  const collection = require("../data/collection.json");
  const allCollectionCards = collection.map((card) => ({
    card: card["ID"],
    name: card["Name"],
    code: card["Code"],
  }));
  const _ = require("lodash");

  const fs = require("fs");
  const decks = [];

  fs.readdirSync(__dirname + "/goatDeckLists/").forEach((deck) => {
    decks.push(deck);
  });

  const deckPairs = [];

  await Promise.all(
    decks.map(async (deck) => {
      console.log("============================");
      console.log({ deck });
      const data = fs.readFileSync(`${__dirname}/goatDeckLists/${deck}`, {
        encoding: "utf8",
        flag: "r",
      });
      const cardsInDeck = await Promise.all(
        data.split("\n").map(async (id) => {
          const result = await getCardInfo(id);
          // console.log(result);
          return result;
        })
      );
      // console.log({ cardsInDeck });
      const cardsFound = [];
      const cardsNotFound = [];
      const collectionCopy = [...allCollectionCards];
      cardsInDeck.map((c) => {
        const cardIndex = collectionCopy.findIndex((cc) => {
          return cc.card == c.card;
        });
        // console.log(c, cardIndex);
        if (cardIndex > 0) {
          cardsFound.push(collectionCopy[cardIndex].name);
          collectionCopy.splice(cardIndex, 1);
        } else {
          cardsNotFound.push(c.name);
        }
      });
      // console.log(
      //   `Deck 1 could be ${deck}: ${cardsFound.length}/${cardsInDeck.length} cards`
      // );

      const deckPair = {
        deck1: {
          name: deck,
          cardsFound,
          cardsNotFound,
          completed: (cardsFound.length / cardsInDeck.length) * 100,
        },
      };

      const otherDecks = decks.filter((d) => d !== deck);

      const decksWithFoundCards = await Promise.all(
        otherDecks.map(async (od) => {
          const cardsFoundForThisDeck = [];
          const cardsNotFoundInThisDeck = [];
          const data2 = fs.readFileSync(`${__dirname}/goatDeckLists/${deck}`, {
            encoding: "utf8",
            flag: "r",
          });
          const cardsInDeck2 = await Promise.all(
            data2.split("\n").map(async (id) => {
              const result = await getCardInfo(id);
              // console.log(result);
              return result;
            })
          );
          const collectionCopy2 = [...collectionCopy];
          cardsInDeck2.map((c) => {
            const cardIndex = collectionCopy2.findIndex(
              (cc) => cc.card == c.card
            );
            // console.log(c, cardIndex);
            if (cardIndex > 0) {
              cardsFoundForThisDeck.push(collectionCopy2[cardIndex].name);
              collectionCopy2.splice(cardIndex, 1);
            } else {
              cardsNotFoundInThisDeck.push(c.name);
            }
          });
          return {
            name: od,
            cardsFound: cardsFoundForThisDeck,
            cardsNotFound: cardsNotFoundInThisDeck,
            completed:
              (cardsFoundForThisDeck.length / cardsInDeck2.length) * 100,
          };
        })
      );

      const orderedOtherDecks = _.reverse(
        _.sortBy(decksWithFoundCards, (d) => d.completed)
      );
      // orderedOtherDecks.map((od) => {
      //   console.log(od.name, od.completed);
      // });
      const highestOtherDeck = orderedOtherDecks[0];

      // console.log(
      //   `Deck 2 could be ${highestOtherDeck.deck}: ${highestOtherDeck.cardsFound.length}/${highestOtherDeck.cardsNeeded.length} cards`
      // );
      deckPair.deck2 = highestOtherDeck;
      deckPairs.push(deckPair);
    })
  );

  _.reverse(
    _.sortBy(
      _.uniqBy(deckPairs, (dp) => {
        if (dp.deck1.name < dp.deck2.name) {
          return `${dp.deck1.name}-${dp.deck2.name}`;
        }
        return `${dp.deck2.name}-${dp.deck1.name}`;
      }),
      (dp) => {
        return dp.deck1.completed + dp.deck2.completed;
      }
    )
  ).map((dp, index) => {
    fs.writeFileSync(
      `./formats/goatDecksToBuild/${index} ${dp.deck1.name} and ${dp.deck2.name}.json`,
      JSON.stringify(dp, null, 3),
      () => {}
    );
  });
};

main();
