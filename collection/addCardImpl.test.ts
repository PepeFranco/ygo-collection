import * as fs from "fs";
import path from "path";
import axios from "axios";
import { addCardToCollection, normalizeCardCode } from "./addCardImpl";

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

    const result = await addCardToCollection({ cardCode: "LOB-001" });

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
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Legend of Blue Eyes White Dragon",
            "Earliest Date": "2002-03-08",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 62.15,
          },
        ],
        null,
        3
      )
    );
  });

  it("should add earliest set and date", async () => {
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
              {
                set_name: "Starter Deck: Kaiba Reloaded",
                set_code: "YSKR-EN001",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
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

    const result = await addCardToCollection({ cardCode: "YSKR-EN001" });

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "YSKR-EN001",
            Set: "Starter Deck: Kaiba Reloaded",
            Rarity: "Common",
            Edition: "",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Legend of Blue Eyes White Dragon",
            "Earliest Date": "2002-03-08",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 6.79,
          },
        ],
        null,
        3
      )
    );
  });

  it("should add card when more than one set file share the same code", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Collectible Tins 2012 Wave 1",
              set_code: "CT09",
              num_of_cards: 9,
              tcg_date: "2012-08-10",
              set_image: "https://images.ygoprodeck.com/images/sets/CT09.jpg",
            },
            {
              set_name: "Collectible Tins 2012 Wave 2",
              set_code: "CT09",
              num_of_cards: 9,
              tcg_date: "2012-10-26",
              set_image: "https://images.ygoprodeck.com/images/sets/CT09.jpg",
            },
          ]);
        }
        if (filePath === path.join(__dirname, "../data/collection.json")) {
          return JSON.stringify([]);
        }
        if (
          filePath ===
          path.join(
            __dirname,
            "../data/cardsets/collectible tins 2012 wave 1.json"
          )
        ) {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for collectible tins wave 2
    jest.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 95027497,
            name: "Ninja Grandmaster Hanzo",
            typeline: ["Warrior", "Effect"],
            type: "Effect Monster",
            humanReadableCardType: "Effect Monster",
            frameType: "effect",
            desc: 'When this card is Normal Summoned: You can add 1 "Ninjitsu Art" card from your Deck to your hand. When this card is Flip or Special Summoned: You can add 1 "Ninja" monster from your Deck to your hand, except "Ninja Grandmaster Hanzo".',
            race: "Warrior",
            atk: 1800,
            def: 1000,
            level: 4,
            attribute: "DARK",
            archetype: "Ninja",
            ygoprodeck_url:
              "https://ygoprodeck.com/card/ninja-grandmaster-hanzo-7910",
            card_sets: [
              {
                set_name: "Collectible Tins 2012 Wave 2",
                set_code: "CT09-EN003",
                set_rarity: "Secret Rare",
                set_rarity_code: "(ScR)",
                set_price: "3.33",
              },
            ],
            card_images: [],
            card_prices: [,],
          },
        ],
      },
    });

    const result = await addCardToCollection({ cardCode: "CT09-EN003" });

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Ninja Grandmaster Hanzo",
            Code: "CT09-EN003",
            Set: "Collectible Tins 2012 Wave 2",
            Rarity: "Secret Rare",
            Edition: "",
            "In Deck": "",
            ID: 95027497,
            Type: "Effect Monster",
            ATK: 1800,
            DEF: 1000,
            Level: 4,
            "Card Type": "Warrior",
            Attribute: "DARK",
            Archetype: "Ninja",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Collectible Tins 2012 Wave 2",
            "Earliest Date": "2012-10-26",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 3.33,
          },
        ],
        null,
        3
      )
    );
  });

  it("should mark a card as speed duel if it comes from a speed duel set", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Speed Duel Starter Decks: Duelists of Tomorrow",
              set_code: "SS02",
              num_of_cards: 69,
              tcg_date: "2019-01-24",
              set_image: "https://images.ygoprodeck.com/images/sets/SS02.jpg",
            },
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
              {
                set_name: "Speed Duel Starter Decks: Duelists of Tomorrow",
                set_code: "SS02-ENA01",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
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

    const result = await addCardToCollection({ cardCode: "ss02 a01" });

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "SS02-ENA01",
            Set: "Speed Duel Starter Decks: Duelists of Tomorrow",
            Rarity: "Common",
            Edition: "",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Legend of Blue Eyes White Dragon",
            "Earliest Date": "2002-03-08",
            "Is Speed Duel": "Yes",
            "Is Speed Duel Legal": "Yes",
            Keep: "",
            Price: 6.79,
          },
        ],
        null,
        3
      )
    );
  });

  it("should mark a card as speed duel legal if it has appeared in a speed duel set", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === path.join(__dirname, "../data/cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Speed Duel Starter Decks: Duelists of Tomorrow",
              set_code: "SS02",
              num_of_cards: 69,
              tcg_date: "2019-01-24",
              set_image: "https://images.ygoprodeck.com/images/sets/SS02.jpg",
            },
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
              {
                set_name: "Speed Duel Starter Decks: Duelists of Tomorrow",
                set_code: "SS02-ENA01",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
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

    const result = await addCardToCollection({ cardCode: "lob1" });

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
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Legend of Blue Eyes White Dragon",
            "Earliest Date": "2002-03-08",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "Yes",
            Keep: "",
            Price: 62.15,
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

    const result = await addCardToCollection({
      cardCode: "LOB-001",
      edition: "1st Edition"
    });

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
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Legend of Blue Eyes White Dragon",
            "Earliest Date": "2002-03-08",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 62.15,
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

    const result = await addCardToCollection({ cardCode: "lob-001" });

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
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Legend of Blue Eyes White Dragon",
            "Earliest Date": "2002-03-08",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 62.15,
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

    const result = await addCardToCollection({ cardCode: "lob1" });

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
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Legend of Blue Eyes White Dragon",
            "Earliest Date": "2002-03-08",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 62.15,
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
                set_code: "YSKR-001",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
              },
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

    const result = await addCardToCollection({ cardCode: "yskr1" });

    expect(result).toStrictEqual({
      error: "Multiple rarities found for this card code",
      rarities: [
        { display: "Common (YSKR-001)", code: "YSKR-001", rarity: "Common" },
        {
          display: "Common (YSKR-EN001)",
          code: "YSKR-EN001",
          rarity: "Common",
        },
        {
          display: "Ultimate Rare (YSKR-EN001)",
          code: "YSKR-EN001",
          rarity: "Ultimate Rare",
        },
      ],
    });
    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      expect.any(String)
    );
  });

  it("should return an object with a list of possible rarities when there is more than one set code per rarity and set code was not provided", async () => {
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
                set_code: "YSKR-001",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
              },
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

    const result = await addCardToCollection({
      cardCode: "yskr1",
      selectedRarity: "Common"
    });

    expect(result).toStrictEqual({
      error: "Multiple rarities found for this card code",
      rarities: [
        { display: "Common (YSKR-001)", code: "YSKR-001", rarity: "Common" },
        {
          display: "Common (YSKR-EN001)",
          code: "YSKR-EN001",
          rarity: "Common",
        },
        {
          display: "Ultimate Rare (YSKR-EN001)",
          code: "YSKR-EN001",
          rarity: "Ultimate Rare",
        },
      ],
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

    const result = await addCardToCollection({
      cardCode: "yskr1",
      selectedRarity: "Ultimate Rare"
    });

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
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Starter Deck: Kaiba Reloaded",
            "Earliest Date": "2016-03-25",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 0,
          },
        ],
        null,
        3
      )
    );
  });

  it("should save the right rarity when there is more than one rarity and set code for a card code and rarity and set code is provided", async () => {
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
                set_code: "YSKR-001",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "6.79",
              },
              {
                set_name: "Starter Deck: Kaiba Reloaded",
                set_code: "YSKR-EN001",
                set_rarity: "Common",
                set_rarity_code: "(C)",
                set_price: "0",
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

    const result = await addCardToCollection({
      cardCode: "yskr1",
      selectedRarity: "Common",
      selectedSetCode: "YSKR-EN001"
    });

    expect(result).toEqual(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../data/collection.json"),
      JSON.stringify(
        [
          {
            Name: "Blue-Eyes White Dragon",
            Code: "YSKR-EN001",
            Set: "Starter Deck: Kaiba Reloaded",
            Rarity: "Common",
            Edition: "",
            "In Deck": "",
            ID: 89631139,
            Type: "Normal Monster",
            ATK: 3000,
            DEF: 2500,
            Level: 8,
            "Card Type": "Dragon",
            Attribute: "LIGHT",
            Archetype: "Blue-Eyes",
            Scale: "",
            "Link Scale": "",
            "Earliest Set": "Starter Deck: Kaiba Reloaded",
            "Earliest Date": "2016-03-25",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "",
            Keep: "",
            Price: 0,
          },
        ],
        null,
        3
      )
    );
  });
});

describe("normalizeCardCode", () => {
  it("should normalize card codes correctly", () => {
    expect(normalizeCardCode("LOB-001")).toBe("LOB-001");
    expect(normalizeCardCode("LOB1")).toBe("LOB-001");
    expect(normalizeCardCode("lob1")).toBe("LOB-001");
    expect(normalizeCardCode("lob-1")).toBe("LOB-001");
    expect(normalizeCardCode("lob 1")).toBe("LOB-001");

    expect(normalizeCardCode("ct14 2")).toBe("CT14-002");
    expect(normalizeCardCode("ct14 0")).toBe("CT14-000");
    expect(normalizeCardCode("ct1 47")).toBe("CT1-047");
    expect(normalizeCardCode("ct14 114")).toBe("CT14-114");

    expect(normalizeCardCode("sgx1a1")).toBe("SGX1-A01");
    expect(normalizeCardCode("sgx1b99")).toBe("SGX1-B99");

    expect(normalizeCardCode("yskr1")).toBe("YSKR-001");
  });
});
