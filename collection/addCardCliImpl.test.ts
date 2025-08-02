import { createCLI } from "./addCardCliImpl";
import { addCardToCollection } from "./addCardImpl";

// Mock addCardToCollection
jest.mock("./addCardImpl", () => ({
  addCardToCollection: jest.fn(),
}));

// Mock console.log to prevent test output pollution
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("addCardCliImpl", () => {
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
    it("should prompt for mode selection on startup", async () => {
      // Mock the question to select individual mode and then exit
      mockQuestion
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("Select mode (1/2): ");
          callback("1"); // Select individual mode
        })
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("Enter card code (e.g., LOB-001): ");
          callback("exit"); // Exit immediately
        });

      const cli = createCLI(mockRL);
      await cli.startCli();

      // Verify console outputs
      expect(consoleSpy).toHaveBeenCalledWith("🎴 Yu-Gi-Oh Card Collection CLI Tool");
      expect(consoleSpy).toHaveBeenCalledWith("Choose your mode:\n");
      expect(consoleSpy).toHaveBeenCalledWith("1. Individual mode - Add cards one by one with full code");
      expect(consoleSpy).toHaveBeenCalledWith("2. Batch mode - Add multiple cards from the same set\n");
      
      expect(mockQuestion).toHaveBeenCalledWith("Select mode (1/2): ", expect.any(Function));
      expect(mockClose).toHaveBeenCalled();
    });

    it("should handle invalid mode selection", async () => {
      mockQuestion
        .mockImplementationOnce((prompt, callback) => {
          callback("3"); // Invalid selection
        })
        .mockImplementationOnce((prompt, callback) => {
          callback("1"); // Valid selection
        })
        .mockImplementationOnce((prompt, callback) => {
          callback("exit"); // Exit
        });

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("❌ Invalid selection. Please choose 1 or 2.");
    });
  });

  describe("Individual Mode", () => {

    it("should process individual card addition successfully", async () => {
      const mockAddCardResult = true;
      (addCardToCollection as jest.Mock).mockResolvedValue(mockAddCardResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Mode selection
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("Enter card code (e.g., LOB-001): ");
          callback("LOB-001");
        })
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("Select edition (1/2 or Enter): ");
          callback("1"); // 1st Edition
        })
        .mockImplementationOnce((prompt, callback) => {
          callback("exit"); // Exit after processing
        });

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("LOB-001", undefined, "1st");
      expect(consoleSpy).toHaveBeenCalledWith("🏷️ Selected: 1st Edition");
    });

    it("should handle multiple rarities in individual mode", async () => {
      const mockMultipleRarities = {
        error: "Multiple rarities found for this card code",
        rarities: ["Common", "Ultra Rare"]
      };
      const mockFinalResult = true;
      
      (addCardToCollection as jest.Mock)
        .mockResolvedValueOnce(mockMultipleRarities)
        .mockResolvedValueOnce(mockFinalResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("YSKR-001")) // Card code
        .mockImplementationOnce((prompt, callback) => callback("")) // No edition
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("\nSelect rarity number: ");
          callback("2"); // Select Ultra Rare
        })
        .mockImplementationOnce((prompt, callback) => callback("exit"));

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("YSKR-001", undefined, "");
      expect(addCardToCollection).toHaveBeenCalledWith("YSKR-001", "Ultra Rare", "");
    });

    it("should handle exit command in individual mode", async () => {
      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("exit"));

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("👋 Goodbye!");
      expect(mockClose).toHaveBeenCalled();
    });

    it("should handle empty input in individual mode", async () => {
      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("")) // Empty input
        .mockImplementationOnce((prompt, callback) => callback("exit")); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("⚠️ Please enter a card code");
    });
  });

  describe("Batch Mode", () => {

    it("should set up batch mode correctly", async () => {
      const mockAddCardResult = true;
      (addCardToCollection as jest.Mock).mockResolvedValue(mockAddCardResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("2")) // Mode selection
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("Enter set code (e.g., LOB, SGX1): ");
          callback("LOB");
        })
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("Select edition (1/2 or Enter): ");
          callback("1"); // 1st Edition
        })
        .mockImplementationOnce((prompt, callback) => {
          expect(prompt).toBe("Enter card number for LOB: ");
          callback("1");
        })
        .mockImplementationOnce((prompt, callback) => {
          callback("done"); // Finish batch
        });

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("LOB-001", undefined, "1st");
    });

    it("should handle multiple card numbers in batch mode", async () => {
      const mockAddCardResult = true;
      (addCardToCollection as jest.Mock).mockResolvedValue(mockAddCardResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("2")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("SGX1")) // Set code
        .mockImplementationOnce((prompt, callback) => callback("2")) // LIMITED edition
        .mockImplementationOnce((prompt, callback) => callback("1")) // First card
        .mockImplementationOnce((prompt, callback) => callback("25")) // Second card
        .mockImplementationOnce((prompt, callback) => callback("done")); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("SGX1-001", undefined, "LIMITED");
      expect(addCardToCollection).toHaveBeenCalledWith("SGX1-025", undefined, "LIMITED");
    });

    it("should handle no edition selection in batch mode", async () => {
      const mockAddCardResult = true;
      (addCardToCollection as jest.Mock).mockResolvedValue(mockAddCardResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("2")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("LOB")) // Set code
        .mockImplementationOnce((prompt, callback) => callback("")) // No edition
        .mockImplementationOnce((prompt, callback) => callback("1")) // Card number
        .mockImplementationOnce((prompt, callback) => callback("exit")); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("🏷️ No edition selected");
      expect(addCardToCollection).toHaveBeenCalledWith("LOB-001", undefined, "");
    });

    it("should handle multiple rarities in batch mode", async () => {
      const mockMultipleRarities = {
        error: "Multiple rarities found for this card code",
        rarities: ["Common", "Secret Rare"]
      };
      const mockFinalResult = true;
      
      (addCardToCollection as jest.Mock)
        .mockResolvedValueOnce(mockMultipleRarities)
        .mockResolvedValueOnce(mockFinalResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("2")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("TEST")) // Set code
        .mockImplementationOnce((prompt, callback) => callback("")) // No edition
        .mockImplementationOnce((prompt, callback) => callback("1")) // Card number
        .mockImplementationOnce((prompt, callback) => callback("1")) // Select Common
        .mockImplementationOnce((prompt, callback) => callback("done")); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("TEST-001", undefined, "");
      expect(addCardToCollection).toHaveBeenCalledWith("TEST-001", "Common", "");
    });

    it("should handle empty set code in batch mode", async () => {
      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("2")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("")) // Empty set code
        .mockImplementationOnce((prompt, callback) => callback("LOB")) // Valid set code
        .mockImplementationOnce((prompt, callback) => callback("")) // No edition
        .mockImplementationOnce((prompt, callback) => callback("exit")); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("⚠️ Please enter a set code");
    });

    it("should handle empty card number in batch mode", async () => {
      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("2")) // Mode selection
        .mockImplementationOnce((prompt, callback) => callback("LOB")) // Set code
        .mockImplementationOnce((prompt, callback) => callback("")) // No edition
        .mockImplementationOnce((prompt, callback) => callback("")) // Empty card number
        .mockImplementationOnce((prompt, callback) => callback("quit")); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("⚠️ Please enter a card number");
    });
  });

  describe("Edition Selection", () => {
    it("should handle 1st edition selection", async () => {
      const mockAddCardResult = true;
      (addCardToCollection as jest.Mock).mockResolvedValue(mockAddCardResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Individual mode
        .mockImplementationOnce((prompt, callback) => callback("LOB-001"))
        .mockImplementationOnce((prompt, callback) => callback("1")) // 1st Edition
        .mockImplementationOnce((prompt, callback) => callback("exit"));

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("🏷️ Selected: 1st Edition");
      expect(addCardToCollection).toHaveBeenCalledWith("LOB-001", undefined, "1st");
    });

    it("should handle Limited edition selection", async () => {
      const mockAddCardResult = true;
      (addCardToCollection as jest.Mock).mockResolvedValue(mockAddCardResult);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Individual mode
        .mockImplementationOnce((prompt, callback) => callback("LOB-001"))
        .mockImplementationOnce((prompt, callback) => callback("2")) // Limited Edition
        .mockImplementationOnce((prompt, callback) => callback("exit"));

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("🏷️ Selected: Limited Edition");
      expect(addCardToCollection).toHaveBeenCalledWith("LOB-001", undefined, "LIMITED");
    });
  });

  describe("Error Handling", () => {
    it("should handle addCardToCollection failure", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(false);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Individual mode
        .mockImplementationOnce((prompt, callback) => callback("INVALID-001"))
        .mockImplementationOnce((prompt, callback) => callback("")) // No edition
        .mockImplementationOnce((prompt, callback) => callback("exit"));

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("❌ Failed to add card");
    });

    it("should handle invalid rarity selection", async () => {
      const mockMultipleRarities = {
        error: "Multiple rarities found for this card code",
        rarities: ["Common", "Rare"]
      };
      
      (addCardToCollection as jest.Mock).mockResolvedValue(mockMultipleRarities);

      mockQuestion
        .mockImplementationOnce((prompt, callback) => callback("1")) // Individual mode
        .mockImplementationOnce((prompt, callback) => callback("TEST-001"))
        .mockImplementationOnce((prompt, callback) => callback("")) // No edition
        .mockImplementationOnce((prompt, callback) => callback("99")) // Invalid rarity selection
        .mockImplementationOnce((prompt, callback) => callback("exit"));

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("❌ Invalid selection. Please try again.\n");
    });
  });
});