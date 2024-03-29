import {
  getStructureDeckSets,
  getClosestMatchingBanList,
  getSetsOfCardsInStructureDeck,
  getDeckFilteredByBanlist,
  removeCardsFromCollection,
  excludeSetsFromCollection,
  getCardsMissingForStructureDecks,
} from "./getCardsMissingForStructureDecks";

import axios from "axios";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

describe("Cards Missing for Structure Decks", () => {
  describe("getStructureDecks", () => {
    it("gets correct sets", () => {
      const mockSets = [
        {
          set_name: "Spellcaster's Command Structure Deck: Special Edition",
          tcg_date: "",
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
          tcg_date: "",
        },
        {
          set_name: "2-Player Starter Deck: Yuya & Declan",
          tcg_date: "",
        },
        {
          set_name: "Legendary Hero Decks",
          tcg_date: "2010-01-01",
        },
      ];
      const result = getStructureDeckSets(mockSets);
      expect(result).toEqual([
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
      expect(result.date).toEqual("2024-1");
    });
  });

  describe("getSetsOfCardsInStructureDeck", () => {
    const mockDeck = {
      deck: "Structure Deck: Dragon's Roar",
      cards: ["Armed Dragon LV3", "Armed Dragon LV5"],
      date: "",
    };

    it("returns given if set is one", () => {
      const result = getSetsOfCardsInStructureDeck(mockDeck, 1);
      expect(result).toEqual(mockDeck);
    });

    it("returns set of two", () => {
      const result = getSetsOfCardsInStructureDeck(mockDeck, 2);
      expect(result).toEqual({
        date: "",
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
      date: "",
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
        date: "",
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
        date: "",
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Armed Dragon LV3", "Armed Dragon LV5", "Raigeki"],
      };
      const result = getDeckFilteredByBanlist(mockDeck, mockBanlist);
      expect(result).toEqual({
        date: "",
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Armed Dragon LV3", "Armed Dragon LV5"],
        forbiddenCards: ["Raigeki"],
        limitedCards: [],
        semiLimitedCards: [],
      });
    });

    it("filters limited cards", () => {
      const mockDeck = {
        date: "",
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
        date: "",
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Change of Heart"],
        forbiddenCards: ["Raigeki"],
        limitedCards: ["Change of Heart"],
        semiLimitedCards: [],
      });
    });

    it("filters semi limited cards", () => {
      const mockDeck = {
        date: "",
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
        date: "",
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Card Destruction", "Card Destruction", "Change of Heart"],
        forbiddenCards: ["Raigeki"],
        limitedCards: ["Change of Heart"],
        semiLimitedCards: ["Card Destruction"],
      });
    });

    it("does not add cards", () => {
      const mockDeck = {
        date: "",
        deck: "Structure Deck: Dragon's Roar",
        cards: ["Card Destruction"],
      };
      const result = getDeckFilteredByBanlist(mockDeck, mockBanlist);
      expect(result).toEqual({
        date: "",
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
        { Name: "Armed Dragon Lv3" },
        { Name: "Armed Dragon LV3" },
        { Name: "Blue-Eyes White Dragon" },
        { Name: "Call of the Haunted" },
        { Name: "Call of the Haunted" },
        { Name: "Call of the Haunted" },
        { Name: "Contact C" },
        { Name: "Zombie Master" },
      ];
      const result = removeCardsFromCollection(
        {
          date: "",
          deck: "Structure Deck: Dragon's Roar",
          cards: [
            "Armed Dragon LV3",
            "Armed Dragon LV3",
            "Armed Dragon LV3",
            "Call of the Haunted",
            "Call of the Haunted",
          ],
          forbiddenCards: [],
          limitedCards: [],
          semiLimitedCards: [],
          cardsInCollection: [],
          cardsMissing: [],
        },
        mockCollection,
        false
      );

      expect(result).toEqual({
        collection: [
          { Name: "Blue-Eyes White Dragon" },
          { Name: "Call of the Haunted" },
          { Name: "Contact C" },
          { Name: "Zombie Master" },
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
            // TODO: Why is this Lv and not LV
            "Armed Dragon Lv3 (undefined) <undefined>",
            "Armed Dragon LV3 (undefined) <undefined>",
            "Call of the Haunted (undefined) <undefined>",
            "Call of the Haunted (undefined) <undefined>",
          ],
          date: "",
          forbiddenCards: [],
          limitedCards: [],
          semiLimitedCards: [],
        },
      });

      const result2 = removeCardsFromCollection(
        {
          date: "",
          deck: "Structure Deck: Zombie Madness",
          cards: [
            "Call of the Haunted",
            "Call of the Haunted",
            "Contact C",
            "Zombie Master",
          ],
          forbiddenCards: [],
          limitedCards: [],
          semiLimitedCards: [],
          cardsInCollection: [],
          cardsMissing: [],
        },
        result.collection,
        false
      );
      expect(result2).toEqual({
        collection: [{ Name: "Blue-Eyes White Dragon" }],
        deck: {
          deck: "Structure Deck: Zombie Madness",
          cardsMissing: ["Call of the Haunted"],
          cardsInCollection: [
            "Call of the Haunted (undefined) <undefined>",
            "Contact C (undefined) <undefined>",
            "Zombie Master (undefined) <undefined>",
          ],
          cards: [
            "Call of the Haunted",
            "Call of the Haunted",
            "Contact C",
            "Zombie Master",
          ],
          date: "",
          forbiddenCards: [],
          limitedCards: [],
          semiLimitedCards: [],
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

describe("getCardsMissingForStructureDecks", () => {
  beforeAll(() => {
    jest.mocked(axios.get).mockResolvedValue({
      data: [
        {
          set_name: "Structure Deck: Dragon's Roar",
          tcg_date: "2005-01-01",
        },
      ],
    });
  });

  it("removes the correct cards when prioritising original set", async () => {
    // This card is 3x of in
    // Structure Deck: Fire Kings
    // Onslaught of the Fire Kings Structure Deck
    // Structure Deck: Soulburner
    const collection = [
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Onslaught of the Fire Kings Structure Deck",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Soulburner",
      },
    ];

    const result = await getCardsMissingForStructureDecks({
      collection,
      prioritiseOriginalSet: true,
    });

    const fireKings = result?.cardsFor3Sets.find(
      (sd) => sd.deck === "Structure Deck: Fire Kings"
    );
    const missingCirclesInFireKings = fireKings?.cardsMissing.filter(
      (cardName) => cardName === "Circle of the Fire Kings"
    );
    expect(missingCirclesInFireKings?.length).toEqual(0);

    const circlesInCollectionForFireKings = fireKings?.cardsInCollection.filter(
      (cardName) => cardName.includes("Circle of the Fire Kings")
    );
    expect(circlesInCollectionForFireKings?.length).toEqual(3);

    const onslaughtKings = result?.cardsFor3Sets.find(
      (sd) => sd.deck === "Onslaught of the Fire Kings Structure Deck"
    );
    const missingCirclesInOnslaught = onslaughtKings?.cardsMissing.filter(
      (cardName) => cardName === "Circle of the Fire Kings"
    );
    expect(missingCirclesInOnslaught?.length).toEqual(1);

    const circlesInCollectionForOnslaught =
      onslaughtKings?.cardsInCollection.filter((cardName) =>
        cardName.includes("Circle of the Fire Kings")
      );
    expect(circlesInCollectionForOnslaught?.length).toEqual(2);

    const soulburner = result?.cardsFor3Sets.find(
      (sd) => sd.deck === "Structure Deck: Soulburner"
    );
    const circlesInCollectionForSoulburner =
      soulburner?.cardsInCollection.filter((cardName) =>
        cardName.includes("Circle of the Fire Kings")
      );
    expect(circlesInCollectionForSoulburner?.length).toEqual(1);

    const missingCirclesInSoulburner = soulburner?.cardsMissing.filter(
      (cardName) => cardName === "Circle of the Fire Kings"
    );
    expect(missingCirclesInSoulburner?.length).toEqual(2);
  });

  it("removes the correct cards when not prioritising original set", async () => {
    // This card is 3x of in
    // Structure Deck: Fire Kings
    // Onslaught of the Fire Kings Structure Deck
    // Structure Deck: Soulburner
    const collection = [
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Fire Kings",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Onslaught of the Fire Kings Structure Deck",
      },
      {
        Name: "Circle of the Fire Kings",
        Set: "Structure Deck: Soulburner",
      },
    ];

    const result = await getCardsMissingForStructureDecks({
      collection,
      prioritiseOriginalSet: false,
    });

    const fireKings = result?.cardsFor3Sets.find(
      (sd) => sd.deck === "Structure Deck: Fire Kings"
    );
    const missingCirclesInFireKings = fireKings?.cardsMissing.filter(
      (cardName) => cardName === "Circle of the Fire Kings"
    );
    expect(missingCirclesInFireKings?.length).toEqual(3);

    const circlesInCollectionForFireKings = fireKings?.cardsInCollection.filter(
      (cardName) => cardName.includes("Circle of the Fire Kings")
    );
    expect(circlesInCollectionForFireKings?.length).toEqual(0);

    const onslaughtKings = result?.cardsFor3Sets.find(
      (sd) => sd.deck === "Onslaught of the Fire Kings Structure Deck"
    );
    const missingCirclesInOnslaught = onslaughtKings?.cardsMissing.filter(
      (cardName) => cardName === "Circle of the Fire Kings"
    );
    expect(missingCirclesInOnslaught?.length).toEqual(0);

    const circlesInCollectionForOnslaught =
      onslaughtKings?.cardsInCollection.filter((cardName) =>
        cardName.includes("Circle of the Fire Kings")
      );
    expect(circlesInCollectionForOnslaught?.length).toEqual(3);

    const soulburner = result?.cardsFor3Sets.find(
      (sd) => sd.deck === "Structure Deck: Soulburner"
    );
    const circlesInCollectionForSoulburner =
      soulburner?.cardsInCollection.filter((cardName) =>
        cardName.includes("Circle of the Fire Kings")
      );
    expect(circlesInCollectionForSoulburner?.length).toEqual(3);

    const missingCirclesInSoulburner = soulburner?.cardsMissing.filter(
      (cardName) => cardName === "Circle of the Fire Kings"
    );
    expect(missingCirclesInSoulburner?.length).toEqual(0);
  });
});
