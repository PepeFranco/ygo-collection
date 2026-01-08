import cardSets from "../data/structureDecks/cardsets.json";
import path from "path";
import fs from "fs";

console.log(`There are ${cardSets.length} structure decks`);

cardSets.map((cardSet) => {
  const fileName = `${cardSet.set_name.toLowerCase()}.json`;
  try {
    const fileContents = fs.readFileSync(
      path.join(__dirname, "../data/cardsets", fileName)
    );
    const cardList = JSON.parse(fileContents.toString()).map(
      (card) => card.name
    );
    fs.writeFileSync(
      path.join(__dirname, "../data/structureDecks/", fileName),
      JSON.stringify(cardList, null, 3)
    );
  } catch (error) {
    console.error(`There is no ${fileName}`);
  }
});
