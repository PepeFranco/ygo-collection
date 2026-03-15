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
  () => ["Cyber Dragon", "Cyber Dragon Core"],
);
jest.mock("../data/structureDecks/machina mayhem structure deck.json", () => [
  "Cyber Dragon",
  "Machina Gearframe",
]);
jest.mock("../data/structureDecks/structure deck: cyber strike.json", () => [
  "Cyber Dragon",
  "Cyber Dragon Herz",
]);

beforeEach(() => {
  jest.resetModules();
});

describe("getMissingCards", () => {
  it("writes missing cards per deck to missingCards.json", () => {
    jest.doMock("../data/collection.json", () => [
      // 3x Cyber Dragon Core from SDCR — covers the non-Cyber Dragon SDCR card
      {
        Name: "Cyber Dragon Core",
        Code: "SDCR-EN016",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Super Rare",
      },
      {
        Name: "Cyber Dragon Core",
        Code: "SDCR-EN016",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Super Rare",
      },
      {
        Name: "Cyber Dragon Core",
        Code: "SDCR-EN016",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Super Rare",
      },
      // 3x Machina Gearframe from SDMM — covers the non-Cyber Dragon SDMM card
      {
        Name: "Machina Gearframe",
        Code: "SDMM-EN006",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Super Rare",
      },
      {
        Name: "Machina Gearframe",
        Code: "SDMM-EN006",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Super Rare",
      },
      {
        Name: "Machina Gearframe",
        Code: "SDMM-EN006",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Super Rare",
      },
      // 3x Cyber Dragon Herz from SDCS — covers the non-Cyber Dragon SDCS card
      {
        Name: "Cyber Dragon Herz",
        Code: "SDCS-EN005",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon Herz",
        Code: "SDCS-EN005",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon Herz",
        Code: "SDCS-EN005",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
      },
    ]);
    const { getMissingCards } = require("./getMissingCards");
    const mockFs = require("fs");

    getMissingCards();

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
        cardsMissing: ["Cyber Dragon", "Cyber Dragon", "Cyber Dragon"],
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3),
    );
  });

  it("writes updated collection to collection.json", () => {
    jest.doMock("../data/collection.json", () => [
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
      },
    ]);
    const { getMissingCards } = require("./getMissingCards");
    const mockFs = require("fs");

    getMissingCards();

    const expectedCollection: CollectionRow[] = [
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
        Keep: "Machina Mayhem Structure Deck",
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(expectedCollection, null, 3),
    );
  });
});

describe("getMinimumMissingCards — no-copy cap", () => {
  it("reports a card as missing if not enough copies exist across the collection", () => {
    jest.doMock("../data/collection.json", () => [
      // 2x Cyber Dragon from each deck — 6 total, none are deck-specific 3x
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
      },
    ]);
    const { getMissingCards } = require("./getMissingCards");
    const mockFs = require("fs");

    getMissingCards();

    const expectedMissingCards = [
      {
        deck: "Machina Mayhem Structure Deck",
        cardsMissing: [
          "Cyber Dragon",
          "Machina Gearframe",
          "Machina Gearframe",
          "Machina Gearframe",
        ],
      },
      {
        deck: "Cyber Dragon Revolution Structure Deck",
        cardsMissing: [
          "Cyber Dragon",
          "Cyber Dragon Core",
          "Cyber Dragon Core",
          "Cyber Dragon Core",
        ],
      },
      {
        deck: "Structure Deck: Cyber Strike",
        cardsMissing: [
          "Cyber Dragon",
          "Cyber Dragon Herz",
          "Cyber Dragon Herz",
          "Cyber Dragon Herz",
        ],
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3),
    );

    const expectedCollection: CollectionRow[] = [
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
        Keep: "Structure Deck: Cyber Strike",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
        Keep: "Structure Deck: Cyber Strike",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
        Keep: "Machina Mayhem Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
        Keep: "Machina Mayhem Structure Deck",
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(expectedCollection, null, 3),
    );
  });

  it("reports missing copies when not enough copies exist across the collection", () => {
    jest.doMock("../data/collection.json", () => [
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
      },
    ]);
    const { getMissingCards } = require("./getMissingCards");
    const mockFs = require("fs");

    getMissingCards();

    const expectedMissingCards = [
      {
        deck: "Machina Mayhem Structure Deck",
        cardsMissing: [
          "Cyber Dragon",
          "Machina Gearframe",
          "Machina Gearframe",
          "Machina Gearframe",
        ],
      },
      {
        deck: "Cyber Dragon Revolution Structure Deck",
        cardsMissing: [
          "Cyber Dragon",
          "Cyber Dragon Core",
          "Cyber Dragon Core",
          "Cyber Dragon Core",
        ],
      },
      {
        deck: "Structure Deck: Cyber Strike",
        cardsMissing: [
          "Cyber Dragon",
          "Cyber Dragon",
          "Cyber Dragon Herz",
          "Cyber Dragon Herz",
          "Cyber Dragon Herz",
        ],
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3),
    );

    const expectedCollection: CollectionRow[] = [
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Cyber Dragon Revolution Structure Deck",
        Rarity: "Ultra Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Structure Deck: Cyber Strike",
        Rarity: "Ultra Rare",
        Keep: "Structure Deck: Cyber Strike",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
        Keep: "Machina Mayhem Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
        Keep: "Machina Mayhem Structure Deck",
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(expectedCollection, null, 3),
    );
  });

  it("claims higher rarity copies first when more copies exist", () => {
    jest.doMock("../data/collection.json", () => [
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Mosaic Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Super Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Gold Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Secret Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Ghost Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Ultimate Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Platinum Secret Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Quarter Century Secret Rare",
      },
    ]);
    const { getMissingCards } = require("./getMissingCards");
    const mockFs = require("fs");

    getMissingCards();

    const expectedMissingCards = [
      {
        deck: "Machina Mayhem Structure Deck",
        cardsMissing: [
          "Machina Gearframe",
          "Machina Gearframe",
          "Machina Gearframe",
        ],
      },
      {
        deck: "Cyber Dragon Revolution Structure Deck",
        cardsMissing: [
          "Cyber Dragon Core",
          "Cyber Dragon Core",
          "Cyber Dragon Core",
        ],
      },
      {
        deck: "Structure Deck: Cyber Strike",
        cardsMissing: [
          "Cyber Dragon Herz",
          "Cyber Dragon Herz",
          "Cyber Dragon Herz",
        ],
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/structureDecks/missingCards.json"),
      JSON.stringify(expectedMissingCards, null, 3),
    );

    // The 6 rarest copies should be claimed; Common, Short Print, Rare should stay unclaimed
    const expectedCollection: CollectionRow[] = [
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Quarter Century Secret Rare",
        Keep: "Machina Mayhem Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Platinum Secret Rare",
        Keep: "Machina Mayhem Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDMM-EN009",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Ultimate Rare",
        Keep: "Machina Mayhem Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Ghost Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Secret Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Gold Rare",
        Keep: "Cyber Dragon Revolution Structure Deck",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCR-EN014",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Ultra Rare",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Super Rare",
        Keep: "Structure Deck: Cyber Strike",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Mosaic Rare",
        Keep: "Structure Deck: Cyber Strike",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Rare",
        Keep: "Structure Deck: Cyber Strike",
      },
      {
        Name: "Cyber Dragon",
        Code: "SDCS-EN003",
        Set: "Machina Mayhem Structure Deck",
        Rarity: "Common",
      },
    ];

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(expectedCollection, null, 3),
    );
  });
});
