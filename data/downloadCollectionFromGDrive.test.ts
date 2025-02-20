import { downloadCollectionFromGDrive } from "./downloadCollectionFromGDrive";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import mockFS from "mock-fs";
import fs from "node:fs";

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

    mockFS({});
  });

  afterEach(() => {
    mockFS.restore();
  });

  it("should download the collection", async () => {
    await downloadCollectionFromGDrive();

    const headerFile = fs.readFileSync("./headers.json", "utf8");
    expect(headerFile).toEqual(``);
  });
});
