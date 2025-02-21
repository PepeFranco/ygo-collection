import { downloadCollectionFromGDrive } from "./downloadCollectionFromGDrive";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import mockFS from "mock-fs";
import fs from "node:fs";
import path from "path";

jest.mock("../secret/collectionread.json", () => ({
  url: "http://fake-gdrive-url",
}));

describe("downloadCollectionFromGDrive", () => {
  beforeEach(() => {
    const handlers = [
      http.get("http://fake-gdrive-url", () => {
        return HttpResponse.text(
          `"Name","Code","Set","Rarity","Edition","In Deck","ID","Type","ATK","DEF","Level","Card Type","Attribute","Archetype","Scale","Link Scale","Earliest Set","Earliest Date","Is Speed Duel","Is Speed Duel Legal","Keep","Price","","",""
          "7","AST-091","Ancient Sanctuary","Common","1st","","67048711","Spell Card","","","","Continuous","","","","","Ancient Sanctuary","2004-06-01","No","FALSE","","0","","",""
          "7","DR2-EN204","Dark Revelation Volume 2","Common","","","67048711","Spell Card","","","","Continuous","","","","","Ancient Sanctuary","2004-06-01","No","FALSE","","3.55","","",""
          "4-Starred Ladybug of Doom","YSYR-EN010","Starter Deck: Yugi Reloaded","Common","","","83994646","Flip Effect Monster","800","1200","3","Insect","WIND","","","","Pharaoh's Servant","2002-10-20","No","FALSE","","1.38","","",""`
        );
      }),
    ];

    const server = setupServer(...handlers);
    server.listen();

    mockFS({ data: {} });
  });

  afterEach(() => {
    mockFS.restore();
  });

  it("should download the collection", async () => {
    await downloadCollectionFromGDrive();

    const headerFile = fs.readFileSync(
      path.join(__dirname, "headers.json"),
      "utf8"
    );
    expect(headerFile).toMatchInlineSnapshot(`
      "{
         "headers": [
            "Name",
            "Code",
            "Set",
            "Rarity",
            "Edition",
            "In Deck",
            "ID",
            "Type",
            "ATK",
            "DEF",
            "Level",
            "Card Type",
            "Attribute",
            "Archetype",
            "Scale",
            "Link Scale",
            "Earliest Set",
            "Earliest Date",
            "Is Speed Duel",
            "Is Speed Duel Legal",
            "Keep",
            "Price",
            "",
            "",
            ""
         ]
      }"
    `);

    const collectionFile = fs.readFileSync(
      path.join(__dirname, "collection.json"),
      "utf8"
    );
    expect(collectionFile).toMatchInlineSnapshot(`
      "[
         {
            "Name": "7",
            "Code": "AST-091",
            "Set": "Ancient Sanctuary",
            "Rarity": "Common",
            "Edition": "1st",
            "In Deck": "",
            "ID": "67048711",
            "Type": "Spell Card",
            "ATK": "",
            "DEF": "",
            "Level": "",
            "Card Type": "Continuous",
            "Attribute": "",
            "Archetype": "",
            "Scale": "",
            "Link Scale": "",
            "Earliest Set": "Ancient Sanctuary",
            "Earliest Date": "2004-06-01",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "FALSE",
            "Keep": "",
            "Price": "0",
            "field23": "",
            "field24": "",
            "field25": ""
         },
         {
            "Name": "7",
            "Code": "DR2-EN204",
            "Set": "Dark Revelation Volume 2",
            "Rarity": "Common",
            "Edition": "",
            "In Deck": "",
            "ID": "67048711",
            "Type": "Spell Card",
            "ATK": "",
            "DEF": "",
            "Level": "",
            "Card Type": "Continuous",
            "Attribute": "",
            "Archetype": "",
            "Scale": "",
            "Link Scale": "",
            "Earliest Set": "Ancient Sanctuary",
            "Earliest Date": "2004-06-01",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "FALSE",
            "Keep": "",
            "Price": "3.55",
            "field23": "",
            "field24": "",
            "field25": ""
         },
         {
            "Name": "4-Starred Ladybug of Doom",
            "Code": "YSYR-EN010",
            "Set": "Starter Deck: Yugi Reloaded",
            "Rarity": "Common",
            "Edition": "",
            "In Deck": "",
            "ID": "83994646",
            "Type": "Flip Effect Monster",
            "ATK": "800",
            "DEF": "1200",
            "Level": "3",
            "Card Type": "Insect",
            "Attribute": "WIND",
            "Archetype": "",
            "Scale": "",
            "Link Scale": "",
            "Earliest Set": "Pharaoh's Servant",
            "Earliest Date": "2002-10-20",
            "Is Speed Duel": "No",
            "Is Speed Duel Legal": "FALSE",
            "Keep": "",
            "Price": "1.38",
            "field23": "",
            "field24": "",
            "field25": ""
         }
      ]"
    `);
  });
});
