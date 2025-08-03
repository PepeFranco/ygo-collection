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
    it("should prompt for mode selection on startup", async () => {
      // Super clean - just specify the return values
      mockQuestion
        .mockResolvedValueOnce("1")    // Select individual mode
        .mockResolvedValueOnce("exit"); // Exit immediately

      const cli = createCLI(mockRL);
      await cli.startCli();

      // Verify the calls were made correctly
      expect(mockQuestion).toHaveBeenCalledWith("Select mode (1/2): ");
      expect(mockQuestion).toHaveBeenCalledWith("Enter card code (e.g., LOB-001): ");
      expect(mockClose).toHaveBeenCalled();
    });

    it("should handle invalid mode selection gracefully", async () => {
      mockQuestion
        .mockResolvedValueOnce("3")    // Invalid selection
        .mockResolvedValueOnce("1")    // Valid selection
        .mockResolvedValueOnce("exit"); // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("❌ Invalid selection. Please choose 1 or 2.");
    });
  });

  describe("Individual Mode", () => {
    it("should process individual card addition successfully", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(true);

      mockQuestion
        .mockResolvedValueOnce("1")       // Mode selection
        .mockResolvedValueOnce("LOB-001") // Card code
        .mockResolvedValueOnce("1")       // 1st Edition
        .mockResolvedValueOnce("exit");   // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("LOB-001", undefined, "1st");
      expect(consoleSpy).toHaveBeenCalledWith("🏷️ Selected: 1st Edition");
    });

    it("should handle multiple rarities elegantly", async () => {
      const mockMultipleRarities = {
        error: "Multiple rarities found for this card code",
        rarities: ["Common", "Ultra Rare"]
      };
      
      (addCardToCollection as jest.Mock)
        .mockResolvedValueOnce(mockMultipleRarities)
        .mockResolvedValueOnce(true);

      mockQuestion
        .mockResolvedValueOnce("1")         // Mode selection  
        .mockResolvedValueOnce("YSKR-001")  // Card code
        .mockResolvedValueOnce("")          // No edition
        .mockResolvedValueOnce("2")         // Select Ultra Rare
        .mockResolvedValueOnce("exit");     // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("YSKR-001", undefined, "");
      expect(addCardToCollection).toHaveBeenCalledWith("YSKR-001", "Ultra Rare", "");
    });
  });

  describe("Batch Mode", () => {
    it("should set up batch mode correctly", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(true);

      mockQuestion
        .mockResolvedValueOnce("2")    // Mode selection
        .mockResolvedValueOnce("LOB")  // Set code
        .mockResolvedValueOnce("1")    // 1st Edition
        .mockResolvedValueOnce("1")    // Card number
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("LOB-001", undefined, "1st");
    });

    it("should handle multiple card numbers", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(true);

      mockQuestion
        .mockResolvedValueOnce("2")     // Mode selection
        .mockResolvedValueOnce("SGX1")  // Set code
        .mockResolvedValueOnce("2")     // LIMITED edition
        .mockResolvedValueOnce("1")     // First card
        .mockResolvedValueOnce("25")    // Second card
        .mockResolvedValueOnce("done"); // Finish

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(addCardToCollection).toHaveBeenCalledWith("SGX1-001", undefined, "LIMITED");
      expect(addCardToCollection).toHaveBeenCalledWith("SGX1-025", undefined, "LIMITED");
    });
  });

  describe("Error Handling", () => {
    it("should handle failed card additions", async () => {
      (addCardToCollection as jest.Mock).mockResolvedValue(false);

      mockQuestion
        .mockResolvedValueOnce("1")           // Individual mode
        .mockResolvedValueOnce("INVALID-001") // Invalid card
        .mockResolvedValueOnce("")            // No edition
        .mockResolvedValueOnce("exit");       // Exit

      const cli = createCLI(mockRL);
      await cli.startCli();

      expect(consoleSpy).toHaveBeenCalledWith("❌ Failed to add card");
    });
  });
});