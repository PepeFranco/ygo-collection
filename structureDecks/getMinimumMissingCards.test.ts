import fs from "fs";
import path from "path";
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

    const expectedMissingCards = [
      {
        deck: "Cyber Dragon Revolution Structure Deck",
        cardsMissing: [
          "Cyber Dragon",
          "Cyber Dragon",
          "Cyber Dragon",
          "Cyber Dragon Core",
          "Cyber Dragon Core",
          "Cyber Dragon Core",
        ],
      },
      {
        deck: "Dinosmasher's Fury Structure Deck",
        cardsMissing: ["Fossil Dig", "Fossil Dig", "Fossil Dig"],
      },
    ];

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3)
    );
  });

  it("writes updated collection to collection.json", () => {
    getMinimumMissingCards();

    const expectedCollection: CollectionRow[] = [
      {
        Name: "Babycerasaurus",
        Code: "SR04-EN007",
        Set: "Dinosmasher's Fury Structure Deck",
        Rarity: "Common",
        Keep: "Dinosmasher's Fury Structure Deck",
      },
      {
        Name: "Babycerasaurus",
        Code: "SR04-EN007",
        Set: "Dinosmasher's Fury Structure Deck",
        Rarity: "Common",
        Keep: "Dinosmasher's Fury Structure Deck",
      },
      {
        Name: "Babycerasaurus",
        Code: "SR04-EN007",
        Set: "Dinosmasher's Fury Structure Deck",
        Rarity: "Common",
        Keep: "Dinosmasher's Fury Structure Deck",
      },
    ];

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(expectedCollection, null, 3)
    );
  });
});
