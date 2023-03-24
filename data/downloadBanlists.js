const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../../secret/spreadsheet-credentials.json");
const { id } = require("../../secret/collectionwrite.json");
const { api_key } = require("../../secret/google-api-key.json");
const fs = require("fs");

const banLists = [];

const mainFunction = async () => {
  const doc = new GoogleSpreadsheet(id);
  doc.useApiKey(api_key);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  for (let b = 1; b <= 3; b++) {
    const b1SheetTitle = `Banlist ${b}`;
    const b1Sheet = doc.sheetsByTitle[b1SheetTitle];
    await b1Sheet.loadCells();
    const columnCount = b1Sheet.columnCount;
    const rowCount = b1Sheet.rowCount;
    let year = "";
    for (let c = 1; c < columnCount; c++) {
      if (b1Sheet.getCell(0, c).value) {
        year = b1Sheet.getCell(0, c).value;
      }
      const month = b1Sheet.getCell(1, c).value;
      const date = `${year}-${month}`;
      console.log(date);
      const cardsInThisList = [];
      for (let r = 2; r < rowCount; r++) {
        const card = b1Sheet.getCell(r, 0).value;
        const number = b1Sheet.getCell(r, c).value;
        if (number !== null && number !== 3) {
          const limitedCard = {
            card,
            number,
          };
          cardsInThisList.push(limitedCard);
        }
      }
      const thisBanlist = {
        date,
        cards: cardsInThisList,
      };
      banLists.push(thisBanlist);
    }
  }
  fs.writeFileSync(
    "./collectionScripts/data/banlists.json",
    JSON.stringify(banLists, null, 3)
  );
};
mainFunction();
