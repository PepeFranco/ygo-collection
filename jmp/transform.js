const fs = require("node:fs");

const jmpFiles = fs
  .readdirSync(__dirname)
  .filter((fileName) => fileName.includes(".txt"));

const cards = [];
jmpFiles.map((deck) => {
  const cardsInDeck = fs
    .readFileSync(deck)
    .toString()
    .split("\n")
    .filter((line) => !Number.isNaN(Number(line[0])))
    .reduce((acc, curr) => {
      const [quantityString, ...name] = curr.split(" ");
      const basics = ["Plains", "Island", "Mountain", "Swamp", "Forest"];
      const card = name.join(" ");
      if (basics.includes(card)) {
        return acc;
      }
      const quantity = Number(quantityString);
      for (let i = 0; i < quantity; i++) {
        acc.push(card);
      }
      return acc;
    }, []);
  cards.push(...cardsInDeck);
});

fs.writeFileSync("allcards.txt", cards.join("\n"));
