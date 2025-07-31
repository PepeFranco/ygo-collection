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
});
