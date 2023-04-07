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
          tcg_date: "2010-02-02",
        },
        {
          set_name: "Cyber Dragon Revolution Structure Deck",
          tcg_date: "2010-02-01",
        },
        {
          set_name: "Cyber Dragon Revolution Structure Deck Deluxe Edition",
        },
        {
          set_name: "2-Player Starter Deck: Yuya & Declan",
        },
        {
          set_name: "Legendary Hero Decks",
          tcg_date: "2010-01-01",
        },
      ];
      const result = getStructureDeckSetNames(mockSets);
      expect(result).toEqual([
        "Legendary Hero Decks",
        "Cyber Dragon Revolution Structure Deck",
        "Spellcaster's Command Structure Deck",
      ]);
    });
  });
});
