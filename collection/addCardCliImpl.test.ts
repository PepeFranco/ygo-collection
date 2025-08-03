import { createCLI } from "./addCardCliImpl";
import { addCardToCollection } from "./addCardImpl";

// Mock addCardToCollection
jest.mock("./addCardImpl", () => ({
  addCardToCollection: jest.fn(),
}));

// Mock console.log to prevent test output pollution
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

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
      (addCardToCollection as jest.Mock).mockResolvedValue(true);

      mockQuestion
        .mockResolvedValueOnce("1") // Mode selection
        .mockResolvedValueOnce("BLUE-001") // Card code
        .mockResolvedValueOnce("") // No edition (press Enter)
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith(
        "BLUE-001",
        undefined,
        ""
      );
      expect(consoleSpy).toHaveBeenCalledWith("🏷️ No edition selected");
    });

    it("saves individual card with limited edition and multiple rarities", async () => {
      const mockMultipleRarities = {
        error: "Multiple rarities found for this card code",
        rarities: ["Common", "Rare", "Secret Rare"],
      };

      (addCardToCollection as jest.Mock)
        .mockResolvedValueOnce(mockMultipleRarities)
        .mockResolvedValueOnce(true);

      mockQuestion
        .mockResolvedValueOnce("1") // Mode selection
        .mockResolvedValueOnce("RED-123") // Card code
        .mockResolvedValueOnce("2") // Limited Edition
        .mockResolvedValueOnce("3") // Select Secret Rare (3rd option)
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith(
        "RED-123",
        undefined,
        "LIMITED"
      );
      expect(addCardToCollection).toHaveBeenCalledWith(
        "RED-123",
        "Secret Rare",
        "LIMITED"
      );
      expect(consoleSpy).toHaveBeenCalledWith("🏷️ Selected: Limited Edition");
      expect(consoleSpy).toHaveBeenCalledWith("\n🎯 Selected: Secret Rare");
    });

    it("can handle card not found", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(false);

      mockQuestion
        .mockResolvedValueOnce("1") // Mode selection
        .mockResolvedValueOnce("NOTFOUND-999") // Invalid card code
        .mockResolvedValueOnce("1") // 1st Edition
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith(
        "NOTFOUND-999",
        undefined,
        "1st"
      );
      expect(consoleSpy).toHaveBeenCalledWith("❌ Failed to add card");
    });
  });

  describe("Batch Mode", () => {
    it("should handle multiple card numbers", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(true);

      mockQuestion
        .mockResolvedValueOnce("2") // Mode selection
        .mockResolvedValueOnce("SGX1") // Set code
        .mockResolvedValueOnce("2") // LIMITED edition
        .mockResolvedValueOnce("1") // First card
        .mockResolvedValueOnce("A25") // Second card
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith(
        "SGX1-001",
        undefined,
        "LIMITED"
      );
      expect(addCardToCollection).toHaveBeenCalledWith(
        "SGX1-A25",
        undefined,
        "LIMITED"
      );
    });

    it("handles multiple rarities on cards in batch mode", async () => {
      const mockMultipleRarities = {
        error: "Multiple rarities found for this card code",
        rarities: ["Common", "Super Rare"],
      };

      (addCardToCollection as jest.Mock)
        .mockResolvedValueOnce(true) // First card succeeds
        .mockResolvedValueOnce(mockMultipleRarities) // Second card has multiple rarities
        .mockResolvedValueOnce(true); // Final save succeeds

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

      expect(addCardToCollection).toHaveBeenCalledWith(
        "TEST-005",
        undefined,
        "1st"
      );
      expect(addCardToCollection).toHaveBeenCalledWith(
        "TEST-012",
        undefined,
        "1st"
      );
      expect(addCardToCollection).toHaveBeenCalledWith(
        "TEST-012",
        "Super Rare",
        "1st"
      );
      expect(consoleSpy).toHaveBeenCalledWith("\n🎯 Selected: Super Rare");
    });

    it("handles card failure in batch mode", async () => {
      (addCardToCollection as jest.Mock)
        .mockResolvedValueOnce(true) // First card succeeds
        .mockResolvedValueOnce(false) // Second card fails
        .mockResolvedValueOnce(true); // Third card succeeds

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

      expect(addCardToCollection).toHaveBeenCalledWith(
        "FAIL-001",
        undefined,
        ""
      );
      expect(addCardToCollection).toHaveBeenCalledWith(
        "FAIL-099",
        undefined,
        ""
      );
      expect(addCardToCollection).toHaveBeenCalledWith(
        "FAIL-003",
        undefined,
        ""
      );
      expect(consoleSpy).toHaveBeenCalledWith("❌ Failed to add card");
      expect(consoleSpy).toHaveBeenCalledWith("🏷️ No edition selected");
    });
  });
});
