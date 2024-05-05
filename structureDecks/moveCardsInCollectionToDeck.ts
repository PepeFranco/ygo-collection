import _ from "lodash";
import fs from "fs";
import type { CollectionRow } from "../data/data.types";
import type { CardForXSet } from "./structureDecks.type";

const cardsFor3Sets: CardForXSet[] = require("./cardsFor3Sets.json");
const collection: CollectionRow[] = require("../data/collection.json");
const collectionCopy = [...collection];

const mainFunction = async () => {
  function moveCardsInDeck(deckNameToUpdate: string) {
    try {
      const deckToUpdate = cardsFor3Sets.find(
        (set) => set.deck === deckNameToUpdate
      );
      deckToUpdate?.cardsInCollection.map((cardToUpdate) => {
        console.log();
        console.log(`> ${cardToUpdate}`);
        const cardInDeck = cardToUpdate.split("<")[1].split(">")[0];
        if (cardInDeck) {
          console.log(" > SKIP");
          return;
        }

        const cardName = cardToUpdate.split("[")[0].trim();
        // console.log(cardName);
        const cardCode = cardToUpdate.split("[")[1].split("]")[0];
        // console.log(cardCode);
        const cardRarity = cardToUpdate.split("(")[1].split(")")[0];
        // console.log(cardRarity);
        // console.log(cardInDeck);
        const cardInCollection = collectionCopy.find((collectionCard) => {
          const sameCard =
            collectionCard.Name === cardName &&
            collectionCard.Code === cardCode &&
            collectionCard.Rarity === cardRarity &&
            collectionCard["In Deck"] === cardInDeck;
          return sameCard;
        });
        if (cardInCollection) {
          console.log(" >> Before update");
          console.log(
            ` >>> ${cardInCollection?.Name} [${cardInCollection?.Code}] (${cardInCollection?.Rarity}) <${cardInCollection?.["In Deck"]}>`
          );
          cardInCollection["In Deck"] = deckNameToUpdate;
          console.log(" >> After update");
          console.log(
            ` >>> ${cardInCollection?.Name} [${cardInCollection?.Code}] (${cardInCollection?.Rarity}) <${cardInCollection?.["In Deck"]}>`
          );
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      fs.writeFileSync(
        "./data/collection.json",
        JSON.stringify(collectionCopy, null, 3)
      );
    }
  }

  // const deckNameToUpdate = "Rise of the True Dragons Structure Deck";
  const deckNamesToUpdate: string[] = [];
  if (!deckNamesToUpdate.length) {
    cardsFor3Sets.forEach((deckSet) => {
      deckNamesToUpdate.push(deckSet.deck);
    });
  }
  deckNamesToUpdate.forEach((deckNameToUpdate) => {
    moveCardsInDeck(deckNameToUpdate);
  });
};

mainFunction();
