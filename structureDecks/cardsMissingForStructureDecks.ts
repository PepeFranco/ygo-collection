// TODO: Add tests and refactor cardsMissingForStructureDecks
import { getCardsMissingForStructureDecks } from "./getCardsMissingForStructureDecks.js";
import fs from "fs";

const mainFunction = async () => {
  const result = await getCardsMissingForStructureDecks({
    prioritiseOriginalSet: false,
  });

  if (result) {
    const { cardsFor1Sets, cardsFor2Sets, cardsFor3Sets, dataForCSV } = result;
    // TODO: Replace fs.writeFile with fs.writeFileSync for consistency
    fs.writeFile(
      `./structureDecks/cardsFor1Sets.json`,
      JSON.stringify(cardsFor1Sets, null, 3),
      function () {
        // console.error(err);
      }
    );

    // TODO: Replace fs.writeFile with fs.writeFileSync for consistency
    fs.writeFile(
      `./structureDecks/cardsFor2Sets.json`,
      JSON.stringify(cardsFor2Sets, null, 3),
      function () {
        // console.error(err);
      }
    );

    // TODO: Replace fs.writeFile with fs.writeFileSync for consistency
    fs.writeFile(
      `./structureDecks/cardsFor3Sets.json`,
      JSON.stringify(cardsFor3Sets, null, 3),
      function () {
        // console.error(err);
      }
    );

    // TODO: Replace fs.writeFile with fs.writeFileSync for consistency
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
