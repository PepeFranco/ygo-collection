const {
  getStructureDeckSets,
  getClosestMatchingBanList,
  getSetsOfCardsInStructureDeck,
  getDeckFilteredByBanlist,
  removeCardsFromCollection,
  excludeSetsFromCollection,
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
      const result = getStructureDeckSets(mockSets);
      expect(result).toEqual([
        {
          date: "2010-01-01",
          deck: "Legendary Hero Decks",
        },
        {
          date: "2010-02-01",
          deck: "Cyber Dragon Revolution Structure Deck",
        },
        {
          date: "2010-02-02",
          deck: "Spellcaster's Command Structure Deck",
        },
      ]);
    });
  });

  describe("getClosestMatchingBanlist", () => {
    it("returns the earliest banlist", () => {
      const result = getClosestMatchingBanList(new Date(1999, 0, 1));
      expect(result.date).toEqual("2002-5");
    });

    it("returns the banlist that matches the date", () => {
      const result = getClosestMatchingBanList(new Date(2005, 0, 1));
      expect(result.date).toEqual("2004-10");
    });

    it("returns an earlier banlist", () => {
      const result = getClosestMatchingBanList(new Date(2002, 5, 30));
      expect(result.date).toEqual("2002-5");
    });

    it("returns the latest banlist", () => {
      const result = getClosestMatchingBanList(new Date(3000, 0, 1));
      expect(result.date).toEqual("2022-12");
    });
  });

  describe("getSetsOfCardsInStructureDeck", () => {
    const mockDeck = {
      deck: "Structure Deck: Dragon's Roar",
      cards: ["Armed Dragon LV3", "Armed Dragon LV5"],
    };

    it("returns given if set is one", () => {
      const result = getSetsOfCardsInStructureDeck(mockDeck, 1);
      expect(result).toEqual(mockDeck);
    });

    it("returns set of two", () => {
      const result = getSetsOfCardsInStructureDeck(mockDeck, 2);
      expect(result).toEqual({
        deck: "Structure Deck: Dragon's Roar",
        cards: [
          "Armed Dragon LV3",
          "Armed Dragon LV3",
          "Armed Dragon LV5",
          "Armed Dragon LV5",
        ],
      });
    });
  });

  describe("getDeckFilteredByBanlist", () => {
    const mockBanlist = {
      cards: [
        {
          card: "Card Destruction",
          number: 2,
        },
        {
          card: "Change of Heart",
          number: 1,
        },
        {
          card: "Raigeki",
          number: 0,
        },
      ],
    };

    it("returns deck if no cards on banlist", () => {
      const mockDeck = {
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Armed Dragon LV3", "Armed Dragon LV5"],
        forbiddenCards: [],
        limitedCards: [],
        semiLimitedCards: [],
      };
      const result = getDeckFilteredByBanlist(mockDeck, mockBanlist);
      expect(result).toEqual(mockDeck);
    });

    it("filters forbidden cards", () => {
      const mockDeck = {
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Armed Dragon LV3", "Armed Dragon LV5", "Raigeki"],
      };
      const result = getDeckFilteredByBanlist(mockDeck, mockBanlist);
      expect(result).toEqual({
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Armed Dragon LV3", "Armed Dragon LV5"],
        forbiddenCards: ["Raigeki"],
        limitedCards: [],
        semiLimitedCards: [],
      });
    });

    it("filters limited cards", () => {
      const mockDeck = {
        deck: "Structure Deck: Dragon's Roar",
        cards: [
          "Change of Heart",
          "Change of Heart",
          "Change of Heart",
          "Raigeki",
        ],
      };
      const result = getDeckFilteredByBanlist(mockDeck, mockBanlist);
      expect(result).toEqual({
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Change of Heart"],
        forbiddenCards: ["Raigeki"],
        limitedCards: ["Change of Heart"],
        semiLimitedCards: [],
      });
    });

    it("filters semi limited cards", () => {
      const mockDeck = {
        deck: "Structure Deck: Dragon's Roar",
        cards: [
          "Card Destruction",
          "Card Destruction",
          "Card Destruction",
          "Card Destruction",
          "Change of Heart",
          "Change of Heart",
          "Change of Heart",
          "Raigeki",
        ],
      };
      const result = getDeckFilteredByBanlist(mockDeck, mockBanlist);
      expect(result).toEqual({
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Card Destruction", "Card Destruction", "Change of Heart"],
        forbiddenCards: ["Raigeki"],
        limitedCards: ["Change of Heart"],
        semiLimitedCards: ["Card Destruction"],
      });
    });

    it("does not add cards", () => {
      const mockDeck = {
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Card Destruction"],
      };
      const result = getDeckFilteredByBanlist(mockDeck, mockBanlist);
      expect(result).toEqual({
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Card Destruction"],
        forbiddenCards: [],
        limitedCards: [],
        semiLimitedCards: ["Card Destruction"],
      });
    });
  });

  describe("removeCardsFromCollection", () => {
    it("removes cards from collection", () => {
      const mockCollection = [
        "Armed Dragon Lv3",
        "Armed Dragon LV3",
        "Blue-Eyes White Dragon",
        "Call of the Haunted",
        "Call of the Haunted",
        "Call of the Haunted",
        "Contact C",
        "Zombie Master",
      ];
      const result = removeCardsFromCollection(
        {
          deck: "Structure Deck: Dragon's Roar",
          cards: [
            "Armed Dragon LV3",
            "Armed Dragon LV3",
            "Armed Dragon LV3",
            "Call of the Haunted",
            "Call of the Haunted",
          ],
        },
        mockCollection
      );

      expect(result).toEqual({
        collection: [
          "Blue-Eyes White Dragon",
          "Call of the Haunted",
          "Contact C",
          "Zombie Master",
        ],
        deck: {
          deck: "Structure Deck: Dragon's Roar",
          cards: [
            "Armed Dragon LV3",
            "Armed Dragon LV3",
            "Armed Dragon LV3",
            "Call of the Haunted",
            "Call of the Haunted",
          ],
          cardsMissing: ["Armed Dragon LV3"],
          cardsInCollection: [
            "Armed Dragon LV3",
            "Armed Dragon LV3",
            "Call of the Haunted",
            "Call of the Haunted",
          ],
        },
      });

      const result2 = removeCardsFromCollection(
        {
          deck: "Structure Deck: Zombie Madness",
          cards: [
            "Call of the Haunted",
            "Call of the Haunted",
            "Contact C",
            "Zombie Master",
          ],
        },
        result.collection
      );
      expect(result2).toEqual({
        collection: ["Blue-Eyes White Dragon"],
        deck: {
          deck: "Structure Deck: Zombie Madness",
          cardsMissing: ["Call of the Haunted"],
          cardsInCollection: [
            "Call of the Haunted",
            "Contact C",
            "Zombie Master",
          ],
          cards: [
            "Call of the Haunted",
            "Call of the Haunted",
            "Contact C",
            "Zombie Master",
          ],
        },
      });
    });
  });

  describe("excludeSetsFromCollection", () => {
    it("can call", () => {
      const collection = [
        { Name: "Armed Dragon Lv3", Set: "Soul of the Duelist" },
        { Name: "Armed Dragon Lv3", Set: "Soul of the Duelist" },
        { Name: "Armed Dragon Lv3", Set: "Soul of the Duelist" },
        { Name: "Armed Dragon Lv5", Set: "Soul of the Duelist" },
        { Name: "Armed Dragon Lv5", Set: "Soul of the Duelist" },
        { Name: "Armed Dragon Lv7", Set: "Soul of the Duelist" },
        {
          Name: "Blue-Eyes White Dragon",
          Set: "Legend of Blue Eyes White Dragon",
        },
        {
          Name: "Blue-Eyes White Dragon",
          Set: "Legend of Blue Eyes White Dragon",
        },
        {
          Name: "Dark Magician",
          Set: "Legend of Blue Eyes White Dragon",
        },
        {
          Name: "Zombie Master",
          Set: "Tactical Evolution",
        },
      ];
      const numberOfCopiesToExclude = 2;
      const setsToExclude = [
        "Soul of the Duelist",
        "Legend of Blue Eyes White Dragon",
      ];
      const result = excludeSetsFromCollection({
        setsToExclude,
        numberOfCopiesToExclude,
        collection,
      });

      expect(result).toEqual([
        { Name: "Armed Dragon Lv3", Set: "Soul of the Duelist" },
        {
          Name: "Zombie Master",
          Set: "Tactical Evolution",
        },
      ]);
    });
  });
});
