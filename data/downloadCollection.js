const axios = require("axios");
const fs = require("fs");
const csv = require("csvtojson");
const collectionSecret = require("../../secret/collectionread.json");

const mainFunction = async () => {
  const result = await axios.get(collectionSecret.url).catch(() => {});
  csv()
    .fromString(result.data)
    .then((collection) => {
      const headers = result.data
        .split("\n")[0]
        .split(",")
        .map((h) => h.replace(/"/g, ""));
      fs.writeFile(
        "./collectionScripts/data/headers.json",
        JSON.stringify({ headers }, null, 3),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
      console.log(collection);
      fs.writeFile(
        "./collectionScripts/data/collection.json",
        JSON.stringify(collection, null, 3),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
    });

  // const cardSets = await axios
  //   .get("https://db.ygoprodeck.com/api/v7/cardsets.php")
  //   .catch(() => {});
  // fs.writeFile(
  //   "./collectionScripts/data/sets.json",
  //   JSON.stringify(cardSets, null, 3),
  //   (err) => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }
  //   }
  // );
};
mainFunction();
