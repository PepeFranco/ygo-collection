import { getCollection } from "./getCollection";
import { getYdkDeck } from "./getYdkDeck";

const main = async function () {
  //   const collection = getCollection();
  //   console.log(collction);
  const frogDeck = getYdkDeck("edison-frogs");
  console.log(frogDeck);
};

main();
