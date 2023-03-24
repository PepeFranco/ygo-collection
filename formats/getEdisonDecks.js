const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");
const { parse } = require("node-html-parser");
const queryString = require("query-string");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getEdisonDeckIds = async (page) => {
  const result = await axios
    .get(
      `https://www.edisonformat.com/decks${page > 1 ? `/previous/${page}` : ""}`
    )
    .catch((e) => {
      console.error("Could not get edison decks", e);
    });

  const htmlNode = parse(result.data);
  const links = htmlNode.querySelectorAll("a");
  const edisonDeckNodes = _.uniqBy(
    links.filter((l) => l.rawAttrs.includes("duelingbook")),
    (l) => l.rawAttrs
  );
  const edisonDeckLinks = edisonDeckNodes
    .map((l) => l.rawAttrs)
    .map(
      (l) =>
        l.replace("href=", "").replace(/"/g, "").replace(/'/g, "").split(" ")[0]
    );
  const edisonDeckIds = edisonDeckLinks.map((ed) => {
    const params = queryString.parseUrl(ed);
    return params.query.id;
  });
  return edisonDeckIds;
};

const writeCardList = async (deckId) => {
  try {
    console.log("=============================");
    console.log("Getting deck from: ", deckId);
    const data = `-----------------------------186954531328020679221394180104\nContent-Disposition: form-data; name="id"\n\n${deckId}\n-----------------------------186954531328020679221394180104--\r\n`;
    const url = `https://www.duelingbook.com/php-scripts/load-deck.php`;
    const headers = {
      "Content-Type":
        "multipart/form-data; boundary=---------------------------186954531328020679221394180104",
    };
    const options = { method: "POST", url, data, headers };
    const result = await axios(options);
    const deckName = result.data.name;
    const deckData = {
      main: result.data.main.map((c) => c.name),
      side: result.data.side.map((c) => c.name),
      extra: result.data.extra.map((c) => c.name),
    };
    fs.writeFileSync(
      `./collectionScripts/formats/edisonDeckLists/${deckName}.json`,
      JSON.stringify(deckData, 2, null),
      (e) => {
        throw e;
      }
    );
  } catch (e) {
    console.error("Could not write card list", e);
  }
};

const mainFunction = async () => {
  for (let page = 1; page < 10; page++) {
    console.log("Getting decks from page " + page);
    const edisonDeckIds = await getEdisonDeckIds(page);
    for (let i = 0; i < edisonDeckIds.length; i++) {
      await writeCardList(edisonDeckIds[i]);
    }
  }
};
mainFunction();
