import cardSets from "../data/speedDuel/cardsets.json";
import path from "path";
import fs from "fs";
import { getCardsFromSet } from "../collection/fillCollectionWithDataImpl";
import { debug } from "../debug";
import _ from "lodash";

const main = async () => {
  debug(`There are ${cardSets.length} speed duel decks`);
  const allCards = [];

  await Promise.all(
    cardSets.map(async (cardSet) => {
      const cardsFromSet = await getCardsFromSet(cardSet.set_code, cardSets);

      if (cardsFromSet) {
        allCards.push(...cardsFromSet.map((ygoProCard) => ygoProCard.name));
        debug(`There are ${cardsFromSet.length} cards in ${cardSet.set_name}`);
      }
    })
  );

  const uniqueCards = _.sortBy(_.uniq(allCards));
  debug(`There are ${uniqueCards.length} legal cards in speed duel`);
  fs.writeFileSync(
    path.join(__dirname, "../data/speedDuel/legalCards.json"),
    JSON.stringify(uniqueCards, null, 3)
  );
};
main();
