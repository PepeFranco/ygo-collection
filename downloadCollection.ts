const axios = require("axios");
const fs = require("fs");
const csv = require("csvtojson");
const collectionSecret = require("./secret/collectionSecrets.json");

const downloadCollection = async () => {
  const result = await axios.get(collectionSecret.url).catch(() => {});

  csv()
    .fromString(result.data)
    .then((collection) => {
      const headers = result.data
        .split("\n")[0]
        .split(",")
        .map((h) => h.replace(/"/g, ""));
      fs.writeFile(
        "./data/headers.json",
        JSON.stringify({ headers }, null, 3),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
      fs.writeFile(
        "./data/collection.json",
        JSON.stringify(collection, null, 3),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
    });
};

export { downloadCollection };
