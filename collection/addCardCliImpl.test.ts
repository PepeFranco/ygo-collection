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

  describe("Individual Mode - Extended Edge Cases", () => {
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
    it("should set up batch mode correctly", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(true);

      mockQuestion
        .mockResolvedValueOnce("2") // Mode selection
        .mockResolvedValueOnce("LOB") // Set code
        .mockResolvedValueOnce("1") // 1st Edition
        .mockResolvedValueOnce("1") // Card number
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith(
        "LOB-001",
        undefined,
        "1st"
      );
    });

    it("should handle multiple card numbers", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(true);

      mockQuestion
        .mockResolvedValueOnce("2") // Mode selection
        .mockResolvedValueOnce("SGX1") // Set code
        .mockResolvedValueOnce("2") // LIMITED edition
        .mockResolvedValueOnce("1") // First card
        .mockResolvedValueOnce("25") // Second card
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith(
        "SGX1-001",
        undefined,
        "LIMITED"
      );
      expect(addCardToCollection).toHaveBeenCalledWith(
        "SGX1-025",
        undefined,
        "LIMITED"
      );
    });
  });

  describe("Batch Mode", () => {
    // TODO: Add comprehensive batch mode edge case tests
  });
});
