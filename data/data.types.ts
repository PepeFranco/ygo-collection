export type CollectionRow = {
  Name: string;
  Code?: string;
  Set?: string;
  Rarity?: string;
  // | "Common"
  // | "Ghost"
  // | "Rare"
  // | "Secret"
  // | "Super"
  // | "Ultimate"
  // | "Ultra";
  Edition?: string;
  // "1st" | "LIMITED";
  "In Deck"?: string;
  ID?: string;
  Type?: string;
  ATK?: string;
  DEF?: string;
  Level?: string;
  "Card Type"?: string;
  Attribute?: string;
  // | "DARK"
  // | "DIVINE"
  // | "EARTH"
  // | "FIRE"
  // | "LIGHT"
  // | "WATER"
  // | "WIND";
  Archetype?: string;
  Scale?: string;
  "Link Scale"?: string;
  "Earliest Set"?: string;
  "Earliest Date"?: string;
  "Is Speed Duel"?: string;
  // "Yes" | "No";
  "Is Speed Duel Legal"?: string;
  //  "TRUE" | "FALSE";
  Keep?: string;
  Price?: string;
};

export type YGOProSet = {
  set_name: string;
  set_code: string;
  num_of_cards: number;
  tcg_date: string;
  set_image: string;
};

type BanlistCard = { card: string; number: number };
export type Banlist = {
  date: string;
  cards: BanlistCard[];
};
