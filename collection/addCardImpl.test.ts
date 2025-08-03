import * as fs from "fs";
import path from "path";
import axios from "axios";
import { addCardToCollection } from "./addCardImpl";
import { error } from "console";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock("terminal-image", () => ({
  __esModule: true,
  default: {
    buffer: jest.fn().mockResolvedValue("🖼️ [Mocked Card Image]"),
  },
}));

// Mock fetch for image downloading
global.fetch = jest.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
) as jest.Mock;

describe("addCardCli", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a card to the collection", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Legend of Blue Eyes White Dragon",
              set_code: "LOB",
              num_of_cards: 355,
              tcg_date: "2002-03-08",
              set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
            },
          ]);
        }
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
      data: {
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
            card_images: [
              {
                image_url_small:
                  "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
              },
            ],
          },
        ],
      },
    });

    const result = await addCardToCollection("LOB-001");

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "LOB-001",
            Set: "Legend of Blue Eyes White Dragon",
            Rarity: "Ultra Rare",
            Edition: "",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: "3000",
            DEF: "2500",
            Level: "8",
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "",
            "Earliest Date": "",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: "62.15",
          },
        ],
        null,
        3
      )
    );
  });

  it("should add a card to the collection with edition", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Legend of Blue Eyes White Dragon",
              set_code: "LOB",
              num_of_cards: 355,
              tcg_date: "2002-03-08",
              set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
            },
          ]);
        }
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
      data: {
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
            card_images: [
              {
                image_url_small:
                  "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
              },
            ],
          },
        ],
      },
    });

    const result = await addCardToCollection(
      "LOB-001",
      undefined,
      "1st Edition"
    );

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "LOB-001",
            Set: "Legend of Blue Eyes White Dragon",
            Rarity: "Ultra Rare",
            Edition: "1st Edition",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: "3000",
            DEF: "2500",
            Level: "8",
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "",
            "Earliest Date": "",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: "62.15",
          },
        ],
        null,
        3
      )
    );
  });

  it("should accept lowercase card codes", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Legend of Blue Eyes White Dragon",
              set_code: "LOB",
              num_of_cards: 355,
              tcg_date: "2002-03-08",
              set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
            },
          ]);
        }
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
      data: {
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
            card_images: [
              {
                image_url_small:
                  "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
              },
            ],
          },
        ],
      },
    });

    const result = await addCardToCollection("lob-001");

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "LOB-001",
            Set: "Legend of Blue Eyes White Dragon",
            Rarity: "Ultra Rare",
            Edition: "",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: "3000",
            DEF: "2500",
            Level: "8",
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "",
            "Earliest Date": "",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: "62.15",
          },
        ],
        null,
        3
      )
    );
  });

  it("should accept card codes that are not properly formatted", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Legend of Blue Eyes White Dragon",
              set_code: "LOB",
              num_of_cards: 355,
              tcg_date: "2002-03-08",
              set_image: "https://images.ygoprodeck.com/images/sets/LOB.jpg",
            },
          ]);
        }
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
      data: {
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
            card_images: [
              {
                image_url_small:
                  "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
              },
            ],
          },
        ],
      },
    });

    const result = await addCardToCollection("lob1");

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "LOB-001",
            Set: "Legend of Blue Eyes White Dragon",
            Rarity: "Ultra Rare",
            Edition: "",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: "3000",
            DEF: "2500",
            Level: "8",
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "",
            "Earliest Date": "",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: "62.15",
          },
        ],
        null,
        3
      )
    );
  });

  it("should return an object with a list of possible rarities when there is more than one rarity for a card code", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Starter Deck: Kaiba Reloaded",
              set_code: "YSKR",
              num_of_cards: 50,
              tcg_date: "2016-03-25",
              set_image: "https://images.ygoprodeck.com/images/sets/YSKR.jpg",
            },
          ]);
        }
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
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
                set_name: "Starter Deck: Kaiba Reloaded",
                set_code: "YSKR-EN001",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
              },
              {
                set_name: "Starter Deck: Kaiba Reloaded",
                set_code: "YSKR-EN001",
                set_rarity: "Ultimate Rare",
                set_rarity_code: "(UtR)",
                set_price: "0",
              },
            ],
            card_images: [
              {
                id: 89631139,
                image_url:
                  "https://images.ygoprodeck.com/images/cards/89631139.jpg",
                image_url_small:
                  "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
                image_url_cropped:
                  "https://images.ygoprodeck.com/images/cards_cropped/89631139.jpg",
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

    const result = await addCardToCollection("yskr1");

    expect(result).toStrictEqual({
      error: "Multiple rarities found for this card code",
      rarities: ["Common", "Ultimate Rare"],
    });
    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      expect.any(String)
    );
  });

  it("should save the right rarity when there is more than one rarity for a card code and rarity is provided", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Starter Deck: Kaiba Reloaded",
              set_code: "YSKR",
              num_of_cards: 50,
              tcg_date: "2016-03-25",
              set_image: "https://images.ygoprodeck.com/images/sets/YSKR.jpg",
            },
          ]);
        }
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
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
                set_name: "Starter Deck: Kaiba Reloaded",
                set_code: "YSKR-EN001",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
              },
              {
                set_name: "Starter Deck: Kaiba Reloaded",
                set_code: "YSKR-EN001",
                set_rarity: "Ultimate Rare",
                set_rarity_code: "(UtR)",
                set_price: "0",
              },
            ],
            card_images: [
              {
                id: 89631139,
                image_url:
                  "https://images.ygoprodeck.com/images/cards/89631139.jpg",
                image_url_small:
                  "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
                image_url_cropped:
                  "https://images.ygoprodeck.com/images/cards_cropped/89631139.jpg",
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

    const result = await addCardToCollection("yskr1", "Ultimate Rare");

    expect(result).toEqual(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "YSKR-EN001",
            Set: "Starter Deck: Kaiba Reloaded",
            Rarity: "Ultimate Rare",
            Edition: "",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: "3000",
            DEF: "2500",
            Level: "8",
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "",
            "Earliest Date": "",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: "0",
          },
        ],
        null,
        3
      )
    );
  });
});
