const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../../secret/spreadsheet-credentials.json");
const { id } = require("../../secret/collectionwrite.json");
const { api_key } = require("../../secret/google-api-key.json");

const localCollection = require("../data/collection.json");
const { headers: headerValues } = require("../data/headers.json");

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
  console.log("done");
};
mainFunction();
