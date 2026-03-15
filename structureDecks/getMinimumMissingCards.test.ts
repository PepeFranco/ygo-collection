import { CollectionRow } from "../data/data.types";

const mockCollection: CollectionRow[] = [
  {
    Name: "Dark Magician",
    Code: "SDY-006",
    Set: "Starter Deck: Yugi",
    Rarity: "Ultra Rare",
    Edition: "1st",
    ID: "46986414",
    Type: "Normal Monster",
    ATK: "2500",
    DEF: "2100",
    Level: "7",
    "Card Type": "Spellcaster",
    Attribute: "DARK",
  },
  {
    Name: "Blue-Eyes White Dragon",
    Code: "SDK-001",
    Set: "Starter Deck: Kaiba",
    Rarity: "Ultra Rare",
    Edition: "1st",
    ID: "89631139",
    Type: "Normal Monster",
    ATK: "3000",
    DEF: "2500",
    Level: "8",
    "Card Type": "Dragon",
    Attribute: "LIGHT",
  },
];

jest.mock("../data/collection.json", () => mockCollection);

import { getMinimumMissingCards } from "./getMinimumMissingCards";

describe("getMinimumMissingCards", () => {
  it("returns the collection", () => {
    expect(getMinimumMissingCards()).toEqual(mockCollection);
  });
});
