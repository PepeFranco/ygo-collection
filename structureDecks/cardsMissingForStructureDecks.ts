import { getCardsMissingForStructureDecks } from "./getCardsMissingForStructureDecks.js";
import fs from "fs";

const mainFunction = async () => {
  const result = await getCardsMissingForStructureDecks({});

  if (result) {
    const { cardsFor1Sets, cardsFor2Sets, cardsFor3Sets, dataForCSV } = result;
    fs.writeFile(
      `./structureDecks/cardsFor1Sets.json`,
      JSON.stringify(cardsFor1Sets, null, 3),
      function () {
        // console.error(err);
      }
    );

    fs.writeFile(
      `./structureDecks/cardsFor2Sets.json`,
      JSON.stringify(cardsFor2Sets, null, 3),
      function () {
        // console.error(err);
      }
    );

    fs.writeFile(
      `./structureDecks/cardsFor3Sets.json`,
      JSON.stringify(cardsFor3Sets, null, 3),
      function () {
        // console.error(err);
      }
    );

    fs.writeFile(
      `./structureDecks/missingCardsDataSet.json`,
      JSON.stringify(dataForCSV),
      function () {
        // console.error(err);
      }
    );
  }
};
mainFunction();
