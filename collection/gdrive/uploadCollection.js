const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../../secret/spreadsheet-credentials.json");
const { id } = require("../../secret/collectionwrite.json");
const { api_key } = require("../../secret/google-api-key.json");

const localCollection = require("../../data/collection.json");
const { headers: headerValues } = require("../../data/headers.json");

// const cardsFor1Sets = require("../../structureDecks/cardsFor1Sets.json");
// const cardsFor2Sets = require("../../structureDecks/cardsFor2Sets.json");
const cardsFor3Sets = require("../../structureDecks/cardsFor3Sets.json");

const mainFunction = async () => {
  const doc = new GoogleSpreadsheet(id);
  doc.useApiKey(api_key);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  console.log(doc.title);
  const collectionSheetTitle = "Collection";
  const collectionSheet = doc.sheetsByTitle[collectionSheetTitle];
  await collectionSheet.clear();
  await collectionSheet.setHeaderRow(headerValues);
  await collectionSheet.addRows(localCollection);
  await collectionSheet.updateDimensionProperties("ROWS", {
    pixelSize: 21,
  });
  console.log(`⬆️ Uploaded collection`);

  // Structure deck missing cards
  const missingSheetTitle = "Structure Decks Missing";
  const missingCardsSheet = doc.sheetsByTitle[missingSheetTitle];
  await missingCardsSheet.clear();
  await missingCardsSheet.setHeaderRow([
    "Card",
    "Deck",
    "Date",
    "Set of",
    "# of cards missing",
  ]);

  // const missingRows1 = cardsFor1Sets.reduce(
  //   (accumulator, currentValue) => [
  //     ...accumulator,
  //     ...currentValue.cardsMissing.map((cardName) => ({
  //       Card: cardName,
  //       Deck: currentValue.deck,
  //       Date: currentValue.date,
  //       "Set of": 1,
  //       "# of cards missing": currentValue.cardsMissing.length,
  //     })),
  //   ],
  //   []
  // );
  // await missingCardsSheet.addRows(missingRows1);

  // const missingRows2 = cardsFor2Sets.reduce(
  //   (accumulator, currentValue) => [
  //     ...accumulator,
  //     ...currentValue.cardsMissing.map((cardName) => ({
  //       Card: cardName,
  //       Deck: currentValue.deck,
  //       Date: currentValue.date,
  //       "Set of": 2,
  //       "# of cards missing": currentValue.cardsMissing.length,
  //     })),
  //   ],
  //   []
  // );
  // await missingCardsSheet.addRows(missingRows2);

  const missingRows3 = cardsFor3Sets.reduce(
    (accumulator, currentValue) => [
      ...accumulator,
      ...currentValue.cardsMissing.map((cardName) => ({
        Card: cardName,
        Deck: currentValue.deck,
        Date: currentValue.date,
        "Set of": 3,
        "# of cards missing": currentValue.cardsMissing.length,
      })),
    ],
    []
  );
  await missingCardsSheet.addRows(missingRows3);
  console.log(`⬆️ Uploaded Structure Deck Missing Cards`);
};
mainFunction();
