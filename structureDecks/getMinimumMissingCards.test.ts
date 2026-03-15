import path from "path";
import { CollectionRow } from "../data/data.types";

const mockCardSets = [
  {
    set_name: "Cyber Dragon Revolution Structure Deck",
    set_code: "SDCR",
    num_of_cards: 38,
    tcg_date: "2014-02-06",
  },
  {
    set_name: "Machina Mayhem Structure Deck",
    set_code: "SDMM",
    num_of_cards: 37,
    tcg_date: "2010-02-19",
  },
  {
    set_name: "Structure Deck: Cyber Strike",
    set_code: "SDCS",
    num_of_cards: 48,
    tcg_date: "2021-10-14",
  },
];

jest.mock("fs");
jest.mock("../data/structureDecks/cardsets.json", () => mockCardSets);
jest.mock(
  "../data/structureDecks/cyber dragon revolution structure deck.json",
  () => ["Cyber Dragon", "Cyber Dragon Core"]
);
jest.mock(
  "../data/structureDecks/machina mayhem structure deck.json",
  () => ["Cyber Dragon", "Machina Gearframe"]
);
jest.mock(
  "../data/structureDecks/structure deck: cyber strike.json",
  () => ["Cyber Dragon", "Cyber Dragon Herz"]
);

beforeEach(() => {
  jest.resetModules();
});

describe("getMinimumMissingCards", () => {
  it("writes missing cards per deck to missingCards.json", () => {
    jest.doMock("../data/collection.json", () => [
      // 3x Cyber Dragon Core from SDCR — covers the non-Cyber Dragon SDCR card
      { Name: "Cyber Dragon Core", Code: "SDCR-EN016", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Super Rare" },
      { Name: "Cyber Dragon Core", Code: "SDCR-EN016", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Super Rare" },
      { Name: "Cyber Dragon Core", Code: "SDCR-EN016", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Super Rare" },
      // 3x Machina Gearframe from SDMM — covers the non-Cyber Dragon SDMM card
      { Name: "Machina Gearframe", Code: "SDMM-EN006", Set: "Machina Mayhem Structure Deck", Rarity: "Super Rare" },
      { Name: "Machina Gearframe", Code: "SDMM-EN006", Set: "Machina Mayhem Structure Deck", Rarity: "Super Rare" },
      { Name: "Machina Gearframe", Code: "SDMM-EN006", Set: "Machina Mayhem Structure Deck", Rarity: "Super Rare" },
      // 3x Cyber Dragon Herz from SDCS — covers the non-Cyber Dragon SDCS card
      { Name: "Cyber Dragon Herz", Code: "SDCS-EN005", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon Herz", Code: "SDCS-EN005", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon Herz", Code: "SDCS-EN005", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare" },
    ]);
    const { getMinimumMissingCards } = require("./getMinimumMissingCards");
    const mockFs = require("fs");

    getMinimumMissingCards();

    const expectedMissingCards = [
      {
        deck: "Machina Mayhem Structure Deck",
        cardsMissing: ["Cyber Dragon", "Cyber Dragon", "Cyber Dragon"],
      },
      {
        deck: "Cyber Dragon Revolution Structure Deck",
        cardsMissing: ["Cyber Dragon", "Cyber Dragon", "Cyber Dragon"],
      },
      {
        deck: "Structure Deck: Cyber Strike",
        cardsMissing: [],
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3)
    );
  });

  it("writes updated collection to collection.json", () => {
    jest.doMock("../data/collection.json", () => [
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common" },
    ]);
    const { getMinimumMissingCards } = require("./getMinimumMissingCards");
    const mockFs = require("fs");

    getMinimumMissingCards();

    const expectedCollection: CollectionRow[] = [
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare", Keep: "Cyber Dragon Revolution Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare", Keep: "Cyber Dragon Revolution Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare", Keep: "Cyber Dragon Revolution Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common", Keep: "Machina Mayhem Structure Deck" },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(expectedCollection, null, 3)
    );
  });
});

describe("getMinimumMissingCards — 6-copy cap", () => {
  it("does not report a card as missing if 6 copies exist across the collection", () => {
    jest.doMock("../data/collection.json", () => [
      // 2x Cyber Dragon from each deck — 6 total, none are deck-specific 3x
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common" },
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDCS-EN003", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDCS-EN003", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare" },
    ]);
    const { getMinimumMissingCards } = require("./getMinimumMissingCards");
    const mockFs = require("fs");

    getMinimumMissingCards();

    const expectedMissingCards = [
      {
        deck: "Machina Mayhem Structure Deck",
        cardsMissing: ["Machina Gearframe", "Machina Gearframe", "Machina Gearframe"],
      },
      {
        deck: "Cyber Dragon Revolution Structure Deck",
        cardsMissing: ["Cyber Dragon Core", "Cyber Dragon Core", "Cyber Dragon Core"],
      },
      {
        deck: "Structure Deck: Cyber Strike",
        cardsMissing: ["Cyber Dragon Herz", "Cyber Dragon Herz", "Cyber Dragon Herz"],
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3)
    );

    const expectedCollection: CollectionRow[] = [
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common", Keep: "Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common", Keep: "Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare", Keep: "Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare", Keep: "Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDCS-EN003", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare", Keep: "Structure Deck" },
      { Name: "Cyber Dragon", Code: "SDCS-EN003", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare", Keep: "Structure Deck" },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(expectedCollection, null, 3)
    );
  });

  it("reports only 1 missing copy when 5 copies exist across the collection", () => {
    jest.doMock("../data/collection.json", () => [
      // 5x Cyber Dragon total — one short of the cap
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common" },
      { Name: "Cyber Dragon", Code: "SDMM-EN009", Set: "Machina Mayhem Structure Deck", Rarity: "Common" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDCR-EN014", Set: "Cyber Dragon Revolution Structure Deck", Rarity: "Ultra Rare" },
      { Name: "Cyber Dragon", Code: "SDCS-EN003", Set: "Structure Deck: Cyber Strike", Rarity: "Ultra Rare" },
    ]);
    const { getMinimumMissingCards } = require("./getMinimumMissingCards");
    const mockFs = require("fs");

    getMinimumMissingCards();

    // Only 1 Cyber Dragon missing total across all decks (5 owned + 1 = 6 cap)
    const expectedMissingCards = [
      {
        deck: "Machina Mayhem Structure Deck",
        cardsMissing: ["Cyber Dragon", "Machina Gearframe", "Machina Gearframe", "Machina Gearframe"],
      },
      {
        deck: "Cyber Dragon Revolution Structure Deck",
        cardsMissing: ["Cyber Dragon Core", "Cyber Dragon Core", "Cyber Dragon Core"],
      },
      {
        deck: "Structure Deck: Cyber Strike",
        cardsMissing: ["Cyber Dragon Herz", "Cyber Dragon Herz", "Cyber Dragon Herz"],
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3)
    );
  });
});
