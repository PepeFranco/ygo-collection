import axios from "axios";
import * as fs from "fs";
import path from "path";
import { CollectionRow } from "../data/data.types";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
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
        Name: "Raigeki",
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
    const { mainFunction } = require("./fillCollectionWithDataImpl");

    await mainFunction();

    // Verify fs.writeFileSync was called (since all cards are complete, it should still write the file)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(mockCollection, null, 3)
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
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify(mockCollection);
        }
        throw new Error("Unexpected file read");
      });

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
        data: {
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
              card_images: [
                {
                  id: 89631146,
                  image_url:
                    "https://images.ygoprodeck.com/images/cards/89631146.jpg",
                  image_url_small:
                    "https://images.ygoprodeck.com/images/cards_small/89631146.jpg",
                  image_url_cropped:
                    "https://images.ygoprodeck.com/images/cards_cropped/89631146.jpg",
                },
              ],
              card_prices: [
                {
                  cardmarket_price: "0.02",
                  tcgplayer_price: "0.05",
                  ebay_price: "5.95",
                  amazon_price: "3.90",
                  coolstuffinc_price: "0.99",
                },
              ],
            },
          ],
        },
      });

    // Import the exported function
    const { mainFunction } = require("./fillCollectionWithDataImpl");

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

    // Parse the JSON string that was written and check the card data
    const writeCall = jest.mocked(fs.writeFileSync).mock.calls[2];
    const writtenJson = writeCall[1] as string;
    const writtenCollection = JSON.parse(writtenJson);

    expect(writtenCollection).toHaveLength(1);
    expect(writtenCollection[0]).toMatchObject(expectedCard);
  });

  it("should not get card sets from api if sets file exists", async () => {
    // Mock fs.readFileSync to return our mock collection and mock card sets
    jest.mocked(fs.readFileSync).mockReturnValue(JSON.stringify([]));

    // Mock axios calls:
    jest.mocked(axios.get);

    // Import the exported function
    const { mainFunction } = require("./fillCollectionWithDataImpl");

    await mainFunction();

    // Verify no network calls were made
    expect(axios.get).not.toHaveBeenCalled();
    // Verify fs.readFileSync was called to read the card sets
    expect(fs.readFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/cardsets.json"),
      "utf8"
    );
  });

  it("should get sets from the api when file does not exist, and write the file", async () => {
    const mockCollection: CollectionRow[] = [];

    // Mock fs.readFileSync to return our mock collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify(mockCollection);
        }
        throw new Error("Unexpected file read");
      });

    const mockCardSets = [
      [
        {
          set_name: "Legend of Blue Eyes White Dragon",
          set_code: "LOB",
          num_of_cards: 355,
          tcg_date: "2002-03-08",
          set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
        },
      ],
    ];
    // Mock axios calls:
    jest.mocked(axios.get).mockResolvedValueOnce({
      // 1. /api/v7/cardsets.php - get all card sets
      data: mockCardSets,
    });

    // Import the exported function
    const { mainFunction } = require("./fillCollectionWithDataImpl");
    await mainFunction();

    // Verify one network call was made to get card sets
    expect(axios.get).toHaveBeenCalledWith(
      "https://db.ygoprodeck.com/api/v7/cardsets.php"
    );

    // Verify fs.writeFileSync was called to write the card sets
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/cardsets.json"),
      JSON.stringify(mockCardSets, null, 3)
    );
  });

  it("should get card list for a set from the api when file does not exist, and write the file", async () => {
    const mockCardSets = [
      {
        set_name: "Legend of Blue Eyes White Dragon",
        set_code: "LOB",
        num_of_cards: 355,
        tcg_date: "2002-03-08",
        set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
      },
    ];
    const mockCardsInSet = {
      data: {
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
        card_images: [
          {
            id: 89631146,
            image_url:
              "https://images.ygoprodeck.com/images/cards/89631146.jpg",
            image_url_small:
              "https://images.ygoprodeck.com/images/cards_small/89631146.jpg",
            image_url_cropped:
              "https://images.ygoprodeck.com/images/cards_cropped/89631146.jpg",
          },
        ],
        card_prices: [
          {
            cardmarket_price: "0.02",
            tcgplayer_price: "0.05",
            ebay_price: "5.95",
            amazon_price: "3.90",
            coolstuffinc_price: "0.99",
          },
        ],
      },
    };
    // Mock axios calls:
    jest.mocked(axios.get).mockResolvedValueOnce({
      // https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=
      data: mockCardsInSet,
    });

    const { getCardsFromSet } = require("./fillCollectionWithDataImpl");
    await getCardsFromSet("LOB", mockCardSets);

    // Verify one network call was made to get card sets
    expect(axios.get).toHaveBeenCalledWith(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=Legend%20of%20Blue%20Eyes%20White%20Dragon`
    );

    // Verify fs.writeFileSync was called to write the card sets
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(
        __dirname,
        "../data/cardsets/legend of blue eyes white dragon.json"
      ),
      JSON.stringify(mockCardsInSet.data, null, 3)
    );
  });

  it("should not get card list for a set from the api when file exists", async () => {
    const mockCardSets = [
      {
        set_name: "Legend of Blue Eyes White Dragon",
        set_code: "LOB",
        num_of_cards: 355,
        tcg_date: "2002-03-08",
        set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
      },
    ];
    const mockCardsInSet = [
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
        card_images: [
          {
            id: 89631146,
            image_url:
              "https://images.ygoprodeck.com/images/cards/89631146.jpg",
            image_url_small:
              "https://images.ygoprodeck.com/images/cards_small/89631146.jpg",
            image_url_cropped:
              "https://images.ygoprodeck.com/images/cards_cropped/89631146.jpg",
          },
        ],
        card_prices: [
          {
            cardmarket_price: "0.02",
            tcgplayer_price: "0.05",
            ebay_price: "5.95",
            amazon_price: "3.90",
            coolstuffinc_price: "0.99",
          },
        ],
      },
    ];

    // Mock fs.readFileSync to return cached data
    jest.mocked(fs.readFileSync).mockReturnValueOnce(
      JSON.stringify(mockCardsInSet)
    );

    const { getCardsFromSet } = require("./fillCollectionWithDataImpl");
    const result = await getCardsFromSet("LOB", mockCardSets);

    expect(result).toEqual(mockCardsInSet);
    expect(axios.get).not.toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalledWith(
      path.join(
        __dirname,
        "../data/cardsets/legend of blue eyes white dragon.json"
      ),
      "utf8"
    );
  });
});
