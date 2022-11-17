const fs = require("fs");

interface FileCard {
  Name: String;
  Code: String;
  Set: String;
  Rarity: String;
  Edition: String;
  "In Box": String;
  "In Sleeve": String;
  "In Deck": String;
  "Out of place": String;
  ID: Number;
  Type: String;
  ATK: String;
  DEF: String;
  Level: String;
  "Card Type": String;
  Attribute: String;
  Archetype: String;
  Scale: String;
  "Link Scale": String;
  Description: String;
  "Description Length": String;
  "Earliest Set": String;
  "Earliest Date": String;
  "Is Speed Duel": String;
  "Is Speed Duel Legal": String;
  Image: String;
}

type CollectionCard = FileCard & { ID: Number };

const getCollection: () => CollectionCard[] = () =>
  JSON.parse(fs.readFileSync("./data/collection.json")).map(
    (fileCard: FileCard) => ({ ...fileCard, ID: Number(fileCard.ID) })
  );

export { getCollection };
