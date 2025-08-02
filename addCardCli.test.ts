import * as fs from "fs";
import axios from "axios";
import { addCardToCollection } from "./addCardImpl";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe("addCardCli", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call addCardToCollection function", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (path === "./data/cardsets.json") {
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
        if (path === "./data/collection.json") {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
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
        },
      ],
    });

    const result = await addCardToCollection("LOB-001");

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "./data/collection.json",
      JSON.stringify([
        {
          Name: "Blue-Eyes White Dragon",
          Code: "LOB-001",
          Set: "Legend of Blue Eyes White Dragon",
          Rarity: "Ultra",
          Edition: "",
          "In Deck": "",
          ID: "89631139",
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
      ], null, 3)
    );
  });

  it("should accept lowercase card codes", async () => {
    // Mock fs.readFileSync for cardsets and collection
    jest
      .mocked(fs.readFileSync)
      .mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (path === "./data/cardsets.json") {
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
        if (path === "./data/collection.json") {
          return JSON.stringify([]);
        }
        throw new Error("Unexpected file read");
      });

    // Mock axios call for getting cards from set
    jest.mocked(axios.get).mockResolvedValueOnce({
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
        },
      ],
    });

    const result = await addCardToCollection("lob-001");

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "./data/collection.json",
      JSON.stringify([
        {
          Name: "Blue-Eyes White Dragon",
          Code: "LOB-001",
          Set: "Legend of Blue Eyes White Dragon",
          Rarity: "Ultra",
          Edition: "",
          "In Deck": "",
          ID: "89631139",
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
      ], null, 3)
    );
  });
});
