const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");
const { parse } = require("node-html-parser");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getDeckLinks = async (page) => {
  const result = await axios
    .get(`https://ygoprodeck.com/category/decks/speed-duel-decks/page/${page}/`)
    .catch((e) => {
      console.error("Could not get decks", e);
    });

  const htmlNode = parse(result.data);
  const links = htmlNode.querySelectorAll("a");
  const deckNodes = links.map((link) => link.getAttribute("href"));
  // const goatDeckLinks = deckNodes
  //   .map((l) => l.rawAttrs)
  //   .map((l) => l.replace("href=", "").replace(/"/g, ""));
  return deckNodes.filter((deckNode) => deckNode.includes("ygoprodeck.com"));
};

const getCards = async (link) => {
  //md-card-breakdown-list
  await sleep(1);
  const result = await axios.get(link).catch((e) => {
    console.error("Could not get cards", e);
  });
  const htmlNode = parse(result.data);
  console.log(htmlNode);
  const allCards = htmlNode.querySelectorAll(".md-card-breakdown-list");
  // if (allNodes.length === 0) {
  //   return [];
  // }
  // const cardsHtml = allNodes[1].innerHTML;
  // const cardsNode = parse(cardsHtml);
  // const cardsString = cardsNode.innerText;
  // let cards = [];
  // let card = "";
  // for (let i = 0; i < cardsString.length; i++) {
  //   const char = cardsString.charAt(i);
  //   const nextChar = i < cardsString.length ? cardsString.charAt(i + 1) : "";
  //   if (char === "x" && Number(nextChar) > 0) {
  //     const numberOfCopies = Number(nextChar);
  //     const newCards = new Array(numberOfCopies).fill(card.trim());
  //     cards = cards.concat(newCards);
  //     card = "";
  //     i++;
  //   } else {
  //     card += char;
  //   }
  // }
  // return cards;
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
  for (let page = 1; page < 2; page++) {
    console.log("Getting decks from page " + page);
    const deckLinks = await getDeckLinks(page);
    for (let i = 0; i < deckLinks.length; i++) {
      // await writeCardList(goatDeckLinks[i]);
      console.log(deckLinks[i]);
      await getCards(deckLinks[i]);
    }
  }
};
mainFunction();
