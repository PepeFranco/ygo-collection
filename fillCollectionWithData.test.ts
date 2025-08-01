import axios from "axios";
import * as fs from "fs";

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
        // 1. getCardSets() - returns card sets including LOB set
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
        data: [
          {
            id: 89631139,
            name: "Blue-Eyes White Dragon",
            typeline: ["Dragon", "Normal"],
            type: "Normal Monster",
            humanReadableCardType: "Normal Monster",
            frameType: "normal",
            desc: "This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome creature and lived to tell the tale.",
            race: "Dragon",
            atk: 3000,
            def: 2500,
            level: 8,
            attribute: "LIGHT",
            archetype: "Blue-Eyes",
            ygoprodeck_url:
              "https://ygoprodeck.com/card/blue-eyes-white-dragon-7485",
            card_sets: [
              {
                set_name: "Legend of Blue Eyes White Dragon",
                set_code: "LOB-001",
                set_rarity: "Ultra Rare",
                set_rarity_code: "(UR)",
                set_price: "62.15",
              },
              {
                set_name: "Legend of Blue Eyes White Dragon",
                set_code: "LOB-E001",
                set_rarity: "Ultra Rare",
                set_rarity_code: "(UR)",
                set_price: "681.49",
              },
              {
                set_name: "Legend of Blue Eyes White Dragon",
                set_code: "LOB-EN001",
                set_rarity: "Ultra Rare",
                set_rarity_code: "(UR)",
                set_price: "253.34",
              },
            ],
          },
        ],
      })
      // 2. getSetCards() - returns cards from the set based on code
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 4035199,
              name: "Blue-Eyes White Dragon",
              card_sets: [
                {
                  set_name: "Legend of Blue Eyes White Dragon",
                  set_code: "LOB-001",
                  set_rarity: "Ultra Rare",
                  set_price: "89.95",
                },
              ],
              type: "Normal Monster",
              race: "Dragon",
              atk: 3000,
              def: 2500,
              level: 8,
              attribute: "LIGHT",
            },
          ],
        },
      }); // getSetCards succeeds

    // Import the exported function
    const { mainFunction } = require("./fillCollectionWithData");

    await mainFunction();

    // The card should be filled with data from the set lookup
    const expectedCollection = [
      {
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
      },
    ];

    expect(fs.writeFile).toHaveBeenCalledWith(
      "./data/collection.json",
      JSON.stringify(expectedCollection, null, 3),
      expect.any(Function)
    );
  });
});
