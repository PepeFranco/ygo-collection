const {
  getStructureDeckSetNames,
} = require("./getCardsMissingForStructureDecks");

describe("Cards Missing for Structure Decks", () => {
  describe("getStructureDecks", () => {
    it("gets correct sets", () => {
      const mockSets = [
        {
          set_name: "Spellcaster's Command Structure Deck: Special Edition",
        },
        {
          set_name: "Spellcaster's Command Structure Deck",
        },
        {
          set_name: "Cyber Dragon Revolution Structure Deck",
        },
        {
          set_name: "Cyber Dragon Revolution Structure Deck Deluxe Edition",
        },
        {
          set_name: "2-Player Starter Deck: Yuya & Declan",
        },
        {
          set_name: "Legendary Hero Decks",
        },
      ];
      const result = getStructureDeckSetNames(mockSets);
      expect(result).toEqual([
        "Spellcaster's Command Structure Deck",
        "Cyber Dragon Revolution Structure Deck",
        "Legendary Hero Decks",
      ]);
    });
  });
});
