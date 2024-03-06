const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../secret/spreadsheet-credentials.json");
const { id } = require("../secret/collectionwrite.json");
const { api_key } = require("../secret/google-api-key.json");

const localCollection = require("./collection.json");
const { headers: headerValues } = require("./headers.json");

const cardsFor3Sets = require("../structureDecks/cardsFor3Sets.json");

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
    "# of cards missing",
  ]);
  const missingRows = cardsFor3Sets.reduce(
    (accumulator, currentValue) => [
      ...accumulator,
      ...currentValue.cardsMissing.map((cardName) => ({
        Card: cardName,
        Deck: currentValue.deck,
        Date: currentValue.date,
        "# of cards missing": currentValue.cardsMissing.length,
      })),
    ],
    []
  );
  await missingCardsSheet.addRows(missingRows);
  console.log(`⬆️ Uploaded Structure Deck Missing Cards`);
};
mainFunction();
