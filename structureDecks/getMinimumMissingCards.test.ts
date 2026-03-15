import fs from "fs";
import { CollectionRow } from "../data/data.types";

const mockCollection: CollectionRow[] = [
  {
    Name: "Babycerasaurus",
    Code: "SR04-EN007",
    Set: "Dinosmasher's Fury Structure Deck",
    Rarity: "Common",
  },
  {
    Name: "Babycerasaurus",
    Code: "SR04-EN007",
    Set: "Dinosmasher's Fury Structure Deck",
    Rarity: "Common",
  },
  {
    Name: "Babycerasaurus",
    Code: "SR04-EN007",
    Set: "Dinosmasher's Fury Structure Deck",
    Rarity: "Common",
  },
];

const mockCardSets = [
  {
    set_name: "Cyber Dragon Revolution Structure Deck",
    set_code: "SDCR",
    num_of_cards: 38,
    tcg_date: "2014-02-06",
  },
  {
    set_name: "Dinosmasher's Fury Structure Deck",
    set_code: "SR04",
    num_of_cards: 39,
    tcg_date: "2017-04-13",
  },
];

jest.mock("fs");
jest.mock("../data/collection.json", () => mockCollection);
jest.mock("../data/structureDecks/cardsets.json", () => mockCardSets);
jest.mock(
  "../data/structureDecks/cyber dragon revolution structure deck.json",
  () => ["Cyber Dragon", "Cyber Dragon Core"]
);
jest.mock(
  "../data/structureDecks/dinosmasher's fury structure deck.json",
  () => ["Babycerasaurus", "Fossil Dig"]
);

import { getMinimumMissingCards } from "./getMinimumMissingCards";

describe("getMinimumMissingCards", () => {
  it("writes missing cards per deck to missingCards.json", () => {
    getMinimumMissingCards();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("missingCards.json"),
      expect.any(String)
    );
  });

  it("writes updated collection to collection.json", () => {
    getMinimumMissingCards();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("collection.json"),
      expect.any(String)
    );
  });
});
