const {
  getStructureDeckSetNames,
} = require("./getCardsMissingForStructureDecks");

describe("Cards Missing for Structure Decks", () => {
  describe("getStructureDecks", () => {
    it("gets correct sets", () => {
      const mockSets = [
        {
          set_name: "Spellcaster's Command Structure Deck: Special Edition",
          set_code: "SDSC",
          num_of_cards: 1,
          tcg_date: "2009-03-31",
        },
        {
          set_name: "Spellcaster's Command Structure Deck",
          set_code: "SDSC",
          num_of_cards: 1,
          tcg_date: "2009-03-31",
        },
        {
          set_name: "Cyber Dragon Revolution Structure Deck",
          set_code: "SDCR",
          num_of_cards: 38,
          tcg_date: "2014-02-06",
        },
        {
          set_name: "2-Player Starter Deck: Yuya & Declan",
          set_code: "YS15",
          num_of_cards: 42,
          tcg_date: "2015-05-28",
        },
      ];
      const result = getStructureDeckSetNames(mockSets);
      expect(result).toEqual([
        "Spellcaster's Command Structure Deck",
        "Cyber Dragon Revolution Structure Deck",
      ]);
    });
  });
});
