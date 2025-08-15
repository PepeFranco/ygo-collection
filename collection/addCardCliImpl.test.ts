import { createCLI } from "./addCardCliImpl";
import * as fs from "fs";
import path from "path";

// Mock dependencies for integration testing
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

// Mock console.log to prevent test output pollution
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("addCardCliImpl - Clean Async/Await Version", () => {
  let mockQuestion: jest.Mock;
  let mockClose: jest.Mock;
  let mockRL: any;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();

    mockQuestion = jest.fn();
    mockClose = jest.fn();
    mockRL = {
      question: mockQuestion,
      close: mockClose,
    };
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("Mode Selection", () => {
    it("should handle invalid mode selection", async () => {
      mockQuestion
        .mockResolvedValueOnce("3") // Invalid selection
        .mockResolvedValueOnce("1") // Valid selection
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Invalid selection. Please choose 1 or 2."
      );
    });
  });

  describe("Individual Mode", () => {
    it("can save individual card", async () => {
      // Temporarily disable console mocking to see errors
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();

      // Setup mock data for successful card addition
      jest.mocked(fs.readFileSync).mockImplementation((filePath) => {
        console.log("Reading file:", filePath);
        if (filePath.toString().includes("cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Blue Eyes Set",
              set_code: "BLUE",
              num_of_cards: 100,
              tcg_date: "2023-01-01",
            },
          ]);
        }
        if (filePath.toString().includes("collection.json")) {
          return JSON.stringify([]);
        }
        if (filePath.toString().includes("blue eyes set.json")) {
          return JSON.stringify([
            {
              id: 12345,
              name: "Blue Eyes White Dragon",
              type: "Normal Monster",
              race: "Dragon",
              atk: 3000,
              def: 2500,
              level: 8,
              attribute: "LIGHT",
              card_sets: [
                {
                  set_name: "Blue Eyes Set",
                  set_code: "BLUE-001",
                  set_rarity: "Ultra Rare",
                  set_price: "10.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/test.jpg",
                },
              ],
            },
          ]);
        }
        return "[]";
      });

      mockQuestion
        .mockResolvedValueOnce("1") // Mode selection
        .mockResolvedValueOnce("BLUE-001") // Card code
        .mockResolvedValueOnce("") // No edition (press Enter)
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(__dirname, "../data/collection.json"),
        JSON.stringify(
          [
            {
              Name: "Blue Eyes White Dragon",
              Code: "BLUE-001",
              Set: "Blue Eyes Set",
              Rarity: "Ultra Rare",
              Edition: "",
              "In Deck": "",
              ID: 12345,
              Type: "Normal Monster",
              ATK: 3000,
              DEF: 2500,
              Level: 8,
              "Card Type": "Dragon",
              Attribute: "LIGHT",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "Blue Eyes Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 10.0,
            },
          ],
          null,
          3
        )
      );
    });

    it("saves individual card with limited edition and multiple rarities", async () => {
      // Temporarily disable console mocking to see errors
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();

      // Setup mock data for card with multiple rarities
      jest.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes("cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Red Eyes Set",
              set_code: "RED",
              num_of_cards: 100,
              tcg_date: "2023-01-01",
            },
          ]);
        }
        if (filePath.toString().includes("collection.json")) {
          return JSON.stringify([]);
        }
        if (filePath.toString().includes("red eyes set.json")) {
          return JSON.stringify([
            {
              id: 67890,
              name: "Red Eyes Black Dragon",
              type: "Normal Monster",
              race: "Dragon",
              atk: 2400,
              def: 2000,
              level: 7,
              attribute: "DARK",
              card_sets: [
                {
                  set_name: "Red Eyes Set",
                  set_code: "RED-123",
                  set_rarity: "Common",
                  set_price: "5.00",
                },
                {
                  set_name: "Red Eyes Set",
                  set_code: "RED-EN123",
                  set_rarity: "Common",
                  set_price: "3.00",
                },
                {
                  set_name: "Red Eyes Set",
                  set_code: "RED-EN123",
                  set_rarity: "Secret Rare",
                  set_price: "25.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/red-eyes.jpg",
                },
              ],
            },
          ]);
        }
        return "[]";
      });

      mockQuestion
        .mockResolvedValueOnce("1") // Mode selection
        .mockResolvedValueOnce("RED-123") // Card code
        .mockResolvedValueOnce("2") // Limited Edition
        .mockResolvedValueOnce("3") // Select Secret Rare (3rd option)
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(__dirname, "../data/collection.json"),
        JSON.stringify(
          [
            {
              Name: "Red Eyes Black Dragon",
              Code: "RED-EN123",
              Set: "Red Eyes Set",
              Rarity: "Secret Rare",
              Edition: "LIMITED",
              "In Deck": "",
              ID: 67890,
              Type: "Normal Monster",
              ATK: 2400,
              DEF: 2000,
              Level: 7,
              "Card Type": "Dragon",
              Attribute: "DARK",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "Red Eyes Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 25.0,
            },
          ],
          null,
          3
        )
      );
    });

    it("saves individual card with limited edition and multiple rarities per set", async () => {
      // Temporarily disable console mocking to see errors
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();

      // Setup mock data for card with multiple rarities
      jest.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes("cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Red Eyes Set",
              set_code: "RED",
              num_of_cards: 100,
              tcg_date: "2023-01-01",
            },
          ]);
        }
        if (filePath.toString().includes("collection.json")) {
          return JSON.stringify([]);
        }
        if (filePath.toString().includes("red eyes set.json")) {
          return JSON.stringify([
            {
              id: 67890,
              name: "Red Eyes Black Dragon",
              type: "Normal Monster",
              race: "Dragon",
              atk: 2400,
              def: 2000,
              level: 7,
              attribute: "DARK",
              card_sets: [
                {
                  set_name: "Red Eyes Set",
                  set_code: "RED-123",
                  set_rarity: "Common",
                  set_price: "5.00",
                },
                {
                  set_name: "Red Eyes Set",
                  set_code: "RED-EN123",
                  set_rarity: "Common",
                  set_price: "3.00",
                },
                {
                  set_name: "Red Eyes Set",
                  set_code: "RED-EN123",
                  set_rarity: "Secret Rare",
                  set_price: "25.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/red-eyes.jpg",
                },
              ],
            },
          ]);
        }
        return "[]";
      });

      mockQuestion
        .mockResolvedValueOnce("1") // Mode selection
        .mockResolvedValueOnce("RED-123") // Card code
        .mockResolvedValueOnce("2") // Limited Edition
        .mockResolvedValueOnce("2") // Select Common (2nd option)
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(__dirname, "../data/collection.json"),
        JSON.stringify(
          [
            {
              Name: "Red Eyes Black Dragon",
              Code: "RED-EN123",
              Set: "Red Eyes Set",
              Rarity: "Common",
              Edition: "LIMITED",
              "In Deck": "",
              ID: 67890,
              Type: "Normal Monster",
              ATK: 2400,
              DEF: 2000,
              Level: 7,
              "Card Type": "Dragon",
              Attribute: "DARK",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "Red Eyes Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 3,
            },
          ],
          null,
          3
        )
      );
    });

    it("can handle card not found", async () => {
      // Temporarily disable console mocking to see errors
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();

      // Setup mock data for card not found scenario
      jest.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes("cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "Not Found Set",
              set_code: "NOTFOUND",
              num_of_cards: 100,
              tcg_date: "2023-01-01",
            },
          ]);
        }
        if (filePath.toString().includes("collection.json")) {
          return JSON.stringify([]);
        }
        if (filePath.toString().includes("not found set.json")) {
          // Return empty array to simulate no cards found
          return JSON.stringify([]);
        }
        return "[]";
      });

      mockQuestion
        .mockResolvedValueOnce("1") // Mode selection
        .mockResolvedValueOnce("NOTFOUND-999") // Invalid card code
        .mockResolvedValueOnce("1") // 1st Edition
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      // Verify that writeFileSync was NOT called (since card wasn't found)
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("Batch Mode", () => {
    it("should handle multiple card numbers", async () => {
      // Temporarily disable console mocking to see errors
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();

      // Setup mock data for batch mode with multiple cards
      jest.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes("cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "SGX1 Set",
              set_code: "SGX1",
              num_of_cards: 100,
              tcg_date: "2023-01-01",
            },
          ]);
        }
        if (filePath.toString().includes("collection.json")) {
          return JSON.stringify([]);
        }
        if (filePath.toString().includes("sgx1 set.json")) {
          return JSON.stringify([
            {
              id: 11111,
              name: "SGX1 Card 001",
              type: "Effect Monster",
              race: "Warrior",
              atk: 1800,
              def: 1200,
              level: 4,
              attribute: "EARTH",
              card_sets: [
                {
                  set_name: "SGX1 Set",
                  set_code: "SGX1-001",
                  set_rarity: "Common",
                  set_price: "2.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/sgx1-001.jpg",
                },
              ],
            },
            {
              id: 22222,
              name: "SGX1 Card A25",
              type: "Spell Card",
              race: "Normal",
              atk: 0,
              def: 0,
              level: 0,
              attribute: "",
              card_sets: [
                {
                  set_name: "SGX1 Set",
                  set_code: "SGX1-A25",
                  set_rarity: "Rare",
                  set_price: "5.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/sgx1-a25.jpg",
                },
              ],
            },
          ]);
        }
        return "[]";
      });

      mockQuestion
        .mockResolvedValueOnce("2") // Mode selection
        .mockResolvedValueOnce("SGX1") // Set code
        .mockResolvedValueOnce("2") // LIMITED edition
        .mockResolvedValueOnce("1") // First card
        .mockResolvedValueOnce("A25") // Second card
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      // Verify that writeFileSync was called twice (once for each card)
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);

      // Check the first call - adding first card
      expect(fs.writeFileSync).toHaveBeenNthCalledWith(
        1,
        path.join(__dirname, "../data/collection.json"),
        JSON.stringify(
          [
            {
              Name: "SGX1 Card 001",
              Code: "SGX1-001",
              Set: "SGX1 Set",
              Rarity: "Common",
              Edition: "LIMITED",
              "In Deck": "",
              ID: 11111,
              Type: "Effect Monster",
              ATK: 1800,
              DEF: 1200,
              Level: 4,
              "Card Type": "Warrior",
              Attribute: "EARTH",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "SGX1 Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 2.0,
            },
          ],
          null,
          3
        )
      );

      // Check the second call - adding second card to existing collection
      expect(fs.writeFileSync).toHaveBeenNthCalledWith(
        2,
        path.join(__dirname, "../data/collection.json"),
        JSON.stringify(
          [
            {
              Name: "SGX1 Card A25",
              Code: "SGX1-A25",
              Set: "SGX1 Set",
              Rarity: "Rare",
              Edition: "LIMITED",
              "In Deck": "",
              ID: 22222,
              Type: "Spell Card",
              ATK: 0,
              DEF: 0,
              Level: 0,
              "Card Type": "Normal",
              Attribute: "",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "SGX1 Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 5.0,
            },
          ],
          null,
          3
        )
      );
    });

    it("handles multiple rarities on cards in batch mode", async () => {
      // Temporarily disable console mocking to see errors
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();

      // Setup mock data for batch mode with multiple rarities
      let collectionData: any[] = [];
      jest.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes("cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "TEST Set",
              set_code: "TEST",
              num_of_cards: 100,
              tcg_date: "2023-01-01",
            },
          ]);
        }
        if (filePath.toString().includes("collection.json")) {
          return JSON.stringify(collectionData);
        }
        if (filePath.toString().includes("test set.json")) {
          return JSON.stringify([
            {
              id: 33333,
              name: "TEST Card 005",
              type: "Effect Monster",
              race: "Warrior",
              atk: 1600,
              def: 1000,
              level: 3,
              attribute: "LIGHT",
              card_sets: [
                {
                  set_name: "TEST Set",
                  set_code: "TEST-005",
                  set_rarity: "Common",
                  set_price: "1.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/test-005.jpg",
                },
              ],
            },
            {
              id: 44444,
              name: "TEST Card 012",
              type: "Spell Card",
              race: "Normal",
              atk: 0,
              def: 0,
              level: 0,
              attribute: "",
              card_sets: [
                {
                  set_name: "TEST Set",
                  set_code: "TEST-012",
                  set_rarity: "Common",
                  set_price: "2.00",
                },
                {
                  set_name: "TEST Set",
                  set_code: "TEST-EN012",
                  set_rarity: "Super Rare",
                  set_price: "8.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/test-012.jpg",
                },
              ],
            },
          ]);
        }
        return "[]";
      });

      // Mock writeFileSync to simulate updating collection
      jest.mocked(fs.writeFileSync).mockImplementation((filePath, data) => {
        if (filePath.toString().includes("collection.json")) {
          collectionData = JSON.parse(data.toString());
        }
      });

      mockQuestion
        .mockResolvedValueOnce("2") // Mode selection
        .mockResolvedValueOnce("TEST") // Set code
        .mockResolvedValueOnce("1") // 1st Edition
        .mockResolvedValueOnce("5") // First card number
        .mockResolvedValueOnce("12") // Second card number
        .mockResolvedValueOnce("2") // Select Super Rare (2nd option)
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      // Verify that writeFileSync was called twice (once for each card)
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);

      // Check the final call - adding second card with selected rarity
      expect(fs.writeFileSync).toHaveBeenLastCalledWith(
        path.join(__dirname, "../data/collection.json"),
        JSON.stringify(
          [
            {
              Name: "TEST Card 005",
              Code: "TEST-005",
              Set: "TEST Set",
              Rarity: "Common",
              Edition: "1st",
              "In Deck": "",
              ID: 33333,
              Type: "Effect Monster",
              ATK: 1600,
              DEF: 1000,
              Level: 3,
              "Card Type": "Warrior",
              Attribute: "LIGHT",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "TEST Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 1.0,
            },
            {
              Name: "TEST Card 012",
              Code: "TEST-EN012",
              Set: "TEST Set",
              Rarity: "Super Rare",
              Edition: "1st",
              "In Deck": "",
              ID: 44444,
              Type: "Spell Card",
              ATK: 0,
              DEF: 0,
              Level: 0,
              "Card Type": "Normal",
              Attribute: "",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "TEST Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 8.0,
            },
          ],
          null,
          3
        )
      );
    });

    it("handles card failure in batch mode", async () => {
      // Temporarily disable console mocking to see errors
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();

      // Setup mock data for batch mode with failures
      let collectionData: any[] = [];
      jest.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes("cardsets.json")) {
          return JSON.stringify([
            {
              set_name: "FAIL Set",
              set_code: "FAIL",
              num_of_cards: 100,
              tcg_date: "2023-01-01",
            },
          ]);
        }
        if (filePath.toString().includes("collection.json")) {
          return JSON.stringify(collectionData);
        }
        if (filePath.toString().includes("fail set.json")) {
          return JSON.stringify([
            {
              id: 55555,
              name: "FAIL Card 001",
              type: "Effect Monster",
              race: "Beast",
              atk: 1000,
              def: 800,
              level: 2,
              attribute: "WIND",
              card_sets: [
                {
                  set_name: "FAIL Set",
                  set_code: "FAIL-001",
                  set_rarity: "Common",
                  set_price: "1.50",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/fail-001.jpg",
                },
              ],
            },
            {
              id: 77777,
              name: "FAIL Card 003",
              type: "Trap Card",
              race: "Normal",
              atk: 0,
              def: 0,
              level: 0,
              attribute: "",
              card_sets: [
                {
                  set_name: "FAIL Set",
                  set_code: "FAIL-003",
                  set_rarity: "Rare",
                  set_price: "3.00",
                },
              ],
              card_images: [
                {
                  image_url_small: "https://test.com/fail-003.jpg",
                },
              ],
            },
            // Note: FAIL-099 is intentionally missing to simulate card not found
          ]);
        }
        return "[]";
      });

      // Mock writeFileSync to simulate updating collection
      jest.mocked(fs.writeFileSync).mockImplementation((filePath, data) => {
        if (filePath.toString().includes("collection.json")) {
          collectionData = JSON.parse(data.toString());
        }
      });

      mockQuestion
        .mockResolvedValueOnce("2") // Mode selection
        .mockResolvedValueOnce("FAIL") // Set code
        .mockResolvedValueOnce("") // No edition
        .mockResolvedValueOnce("1") // First card number (succeeds)
        .mockResolvedValueOnce("99") // Second card number (fails)
        .mockResolvedValueOnce("3") // Third card number (succeeds)
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      // Verify that writeFileSync was called twice (for first and third card, but not for failed second card)
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);

      // Check the final call - adding third card after second failed
      expect(fs.writeFileSync).toHaveBeenLastCalledWith(
        path.join(__dirname, "../data/collection.json"),
        JSON.stringify(
          [
            {
              Name: "FAIL Card 001",
              Code: "FAIL-001",
              Set: "FAIL Set",
              Rarity: "Common",
              Edition: "",
              "In Deck": "",
              ID: 55555,
              Type: "Effect Monster",
              ATK: 1000,
              DEF: 800,
              Level: 2,
              "Card Type": "Beast",
              Attribute: "WIND",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "FAIL Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 1.5,
            },
            {
              Name: "FAIL Card 003",
              Code: "FAIL-003",
              Set: "FAIL Set",
              Rarity: "Rare",
              Edition: "",
              "In Deck": "",
              ID: 77777,
              Type: "Trap Card",
              ATK: 0,
              DEF: 0,
              Level: 0,
              "Card Type": "Normal",
              Attribute: "",
              Archetype: "",
              Scale: "",
              "Link Scale": "",
              "Earliest Set": "FAIL Set",
              "Earliest Date": "2023-01-01",
              "Is Speed Duel": "No",
              "Is Speed Duel Legal": "",
              Keep: "",
              Price: 3.0,
            },
          ],
          null,
          3
        )
      );
    });
  });
});
