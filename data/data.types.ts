export type CollectionRow = {
  Name: string;
  Code?: string;
  Set?: string;
  Rarity?:
    | "Common"
    | "Ghost"
    | "Rare"
    | "Secret"
    | "Super"
    | "Ultimate"
    | "Ultra";
  Edition?: "1st" | "LIMITED";
  "In Deck"?: string;
  ID?: number;
  Type?: string;
  ATK?: number;
  DEF?: number;
  Level?: number;
  "Card Type"?: string;
  Attribute?: "DARK" | "DIVINE" | "EARTH" | "FIRE" | "LIGHT" | "WATER" | "WIND";
  Archetype?: string;
  Scale?: number;
  "Link Scale"?: number;
  "Earliest Set"?: string;
  "Earliest Date"?: string;
  "Is Speed Duel"?: "Yes" | "No";
  "Is Speed Duel Legal"?: "TRUE" | "FALSE";
  Keep?: string;
  Price?: number;
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
