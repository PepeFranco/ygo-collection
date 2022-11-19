const fs = require("fs");

const getDeckNames = () => {
  const decks: string[] = [];
  fs.readdirSync(__dirname + "/data/ydkFiles/").forEach((deck) => {
    decks.push(deck);
  });
  return decks;
};

export { getDeckNames };
