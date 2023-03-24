const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");
const { parse } = require("node-html-parser");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCardName = async (cardId) => {
  sleep(100);
  const result = await axios
    .get(
      "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=" +
        encodeURIComponent(cardId)
    )
    .catch((e) => {});

  return (result && result.data.data[0].name) || null;
};

const getGoatDeckLinks = async (page) => {
  const result = await axios
    .get(
      `https://ygoprodeck.com/deck-search/?_sft_category=goat-format-decks&sort_order=_sfm_total_views+desc+num${
        page && page > 1 ? `&sf_paged=${page}` : ""
      }`
    )
    .catch((e) => {
      console.error("Could not get goat decks", e);
    });

  const htmlNode = parse(result.data);
  const links = htmlNode.querySelectorAll("a");
  const goatDeckNodes = _.uniqBy(
    links.filter((l) => l.rawAttrs.includes("goat")),
    (l) => l.rawAttrs
  );
  const goatDeckLinks = goatDeckNodes
    .map((l) => l.rawAttrs)
    .map((l) => l.replace("href=", "").replace(/"/g, ""));
  return goatDeckLinks;
};

const getCardsByType = (htmlNode, cardType) => {
  const allNodes = htmlNode.querySelectorAll(`.${cardType}`);
  console.log(allNodes.length);
  if (allNodes.length === 0) {
    return [];
  }
  const cardsHtml = allNodes[1].innerHTML;
  const cardsNode = parse(cardsHtml);
  const cardsString = cardsNode.innerText;
  let cards = [];
  let card = "";
  for (let i = 0; i < cardsString.length; i++) {
    const char = cardsString.charAt(i);
    const nextChar = i < cardsString.length ? cardsString.charAt(i + 1) : "";
    if (char === "x" && Number(nextChar) > 0) {
      const numberOfCopies = Number(nextChar);
      const newCards = new Array(numberOfCopies).fill(card.trim());
      cards = cards.concat(newCards);
      card = "";
      i++;
    } else {
      card += char;
    }
  }
  return cards;
};

const writeCardList = async (deckUrl) => {
  try {
    console.log("=============================");
    console.log("Getting deck from: ", deckUrl);
    const result = await axios.get(deckUrl);
    const htmlNode = parse(result.data);
    const deckName = htmlNode.querySelector("title").innerHTML;
    const cardTypes = ["monsters", "spells", "traps", "extra"];
    let cards = [];
    cardTypes.map((c) => {
      cards = cards.concat(getCardsByType(htmlNode, c));
    });
    if (cards.length) {
      fs.writeFileSync(
        `./collectionScripts/formats/goatDeckLists/${deckName}.json`,
        JSON.stringify(cards, 2, null),
        (e) => {
          throw e;
        }
      );
    }
  } catch (e) {
    console.error("Could not write card list", e);
  }
};

const mainFunction = async () => {
  for (let page = 1; page < 10; page++) {
    console.log("Getting decks from page " + page);
    const goatDeckLinks = await getGoatDeckLinks(page);
    for (let i = 0; i < goatDeckLinks.length; i++) {
      await writeCardList(goatDeckLinks[i]);
    }
  }
};
mainFunction();
