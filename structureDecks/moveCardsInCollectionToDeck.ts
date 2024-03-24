import _ from "lodash";
import fs from "fs";
import type { CollectionRow } from "../data/data.types";
import type { CardForXSet } from "./structureDecks.type";

const cardsFor3Sets: CardForXSet[] = require("./cardsFor3Sets.json");
const collection: CollectionRow[] = require("../data/collection.json");
const collectionCopy = [...collection];

const deckNameToUpdate = "Structure Deck: Fury from the Deep";

const mainFunction = async () => {
  try {
    const deckToUpdate = cardsFor3Sets.find(
      (set) => set.deck === deckNameToUpdate
    );
    deckToUpdate?.cardsInCollection.map((cardToUpdate) => {
      const cardInDeck = cardToUpdate.split("<")[1].split(">")[0];
      if (cardInDeck) {
        return;
      }

      console.log(cardToUpdate);
      const cardName = cardToUpdate.split("[")[0].trim();
      console.log(cardName);

      const cardCode = cardToUpdate.split("[")[1].split("]")[0];
      console.log(cardCode);

      const cardRarity = cardToUpdate.split("(")[1].split(")")[0];
      console.log(cardRarity);

      console.log(cardInDeck);

      const cardInCollection = collectionCopy.find(
        (collectionCard) =>
          collectionCard.Name === cardName &&
          collectionCard.Code === cardCode &&
          collectionCard.Rarity === cardRarity &&
          collectionCard["In Deck"] === cardInDeck
      );

      cardInCollection?.["In Deck"] === deckNameToUpdate;
    });
  } catch (e) {
    console.error(e);
  } finally {
    // fs.writeFile(
    //   "./data/collection.json",
    //   JSON.stringify(collectionCopy, null, 3),
    //   function (err) {
    //     if (err) console.error(err);
    //   }
    // );
  }
};

mainFunction();
