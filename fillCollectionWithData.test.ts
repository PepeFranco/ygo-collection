import axios from "axios";
import * as fs from "fs";
import { CollectionRow } from "./data/data.types";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFile: jest.fn(),
}));

describe("fillCollectionWithData", () => {
  beforeEach(() => {
    // Use fake timers to make sleep calls instant
    jest.useFakeTimers();
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers();
  });

  it("should not modify collection when all cards are complete", async () => {
    // Mock a complete collection with 3 cards
    const mockCollection = [
      {
        Name: "Blue-Eyes White Dragon",
        Type: "Monster",
        "Card Type": "Dragon",
        Set: "Legend of Blue Eyes White Dragon",
        Price: "10.00",
        "Is Speed Duel": "No",
        "Earliest Set": "Legend of Blue Eyes White Dragon",
        "Earliest Date": "2002-03-08",
      },
      {
        Name: "Dark Magician",
        Type: "Monster",
        "Card Type": "Spellcaster",
        Set: "Legend of Blue Eyes White Dragon",
        Price: "8.50",
        "Is Speed Duel": "No",
        "Earliest Set": "Legend of Blue Eyes White Dragon",
        "Earliest Date": "2002-03-08",
      },
      {
        Name: "Lightning Bolt",
        Type: "Spell Card",
        "Card Type": "Normal",
        Set: "Legend of Blue Eyes White Dragon",
        Price: "2.00",
        "Is Speed Duel": "No",
        "Earliest Set": "Legend of Blue Eyes White Dragon",
        "Earliest Date": "2002-03-08",
      },
    ];

    // Mock fs.readFileSync to return our mock collection
    jest
      .mocked(fs.readFileSync)
      .mockReturnValue(JSON.stringify(mockCollection));

    // Mock axios.get for card sets
    jest.mocked(axios.get).mockResolvedValue({
      data: [], // Empty card sets response
    });

    // Import the exported function
    const { mainFunction } = require("./fillCollectionWithData");

    await mainFunction();

    // Verify fs.writeFile was called (since all cards are complete, it should still write the file)
    expect(fs.writeFile).toHaveBeenCalledWith(
      "./data/collection.json",
      JSON.stringify(mockCollection, null, 3),
      expect.any(Function)
    );
  });

  it("should fill card data using code when card name does not exist", async () => {
    // Mock a collection with a card that has code but no name
    const mockCollection = [
      {
        Name: "",
        Code: "LOB-001",
        Type: "",
        "Card Type": "",
        Set: "",
        Price: undefined,
        "Is Speed Duel": "",
        "Earliest Set": "",
        "Earliest Date": "",
      },
    ];

    // Mock fs.readFileSync to return our mock collection
    jest
      .mocked(fs.readFileSync)
      .mockReturnValue(JSON.stringify(mockCollection));

    // Mock axios calls:
    jest
      .mocked(axios.get)
      .mockResolvedValueOnce({
        // 1. /api/v7/cardsets.php - get all card sets
        data: [
          {
            set_name: "Legend of Blue Eyes White Dragon",
            set_code: "LOB",
            num_of_cards: 355,
            tcg_date: "2002-03-08",
            set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
          },
        ],
      })
      .mockResolvedValueOnce({
        // 2. /api/v7/cardinfo.php?cardset=legend%20of%20blue-eyes%20white%20dragon
        data: [
          {
            id: 89631139,
            name: "Blue-Eyes White Dragon",
            card_sets: [
              {
                set_name: "Legend of Blue Eyes White Dragon",
                set_code: "LOB-001",
                set_rarity: "Ultra Rare",
                set_price: "62.15",
              },
            ],
            type: "Normal Monster",
            race: "Dragon",
            atk: 3000,
            def: 2500,
            level: 8,
            attribute: "LIGHT",
            archetype: "Blue-Eyes",
            scale: null,
            linkval: null,
          },
        ],
      });

    // Import the exported function
    const { mainFunction } = require("./fillCollectionWithData");

    await mainFunction();

    // The card should be filled with data from the set lookup
    const expectedCard = {
      Name: "Blue-Eyes White Dragon",
      Code: "LOB-001",
      Type: "Normal Monster",
      "Card Type": "Dragon",
      Set: "Legend of Blue Eyes White Dragon",
      Rarity: "Ultra",
      ID: 89631139,
      ATK: 3000,
      DEF: 2500,
      Level: 8,
      Attribute: "LIGHT",
      Archetype: "Blue-Eyes",
      Scale: "",
      "Link Scale": "",
      "Earliest Set": "Legend of Blue Eyes White Dragon",
      "Earliest Date": "2002-03-08",
      "Is Speed Duel": "No",
      Price: 0,
    };

    // Verify fs.writeFile was called
    expect(fs.writeFile).toHaveBeenCalledTimes(1);

    // Parse the JSON string that was written and check the card data
    const writeCall = jest.mocked(fs.writeFile).mock.calls[0];
    const writtenJson = writeCall[1] as string;
    const writtenCollection = JSON.parse(writtenJson);

    expect(writtenCollection).toHaveLength(1);
    expect(writtenCollection[0]).toMatchObject(expectedCard);
  });
});
