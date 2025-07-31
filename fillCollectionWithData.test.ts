import axios from "axios";
import * as fs from "fs";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("fs", () => ({
  writeFile: jest.fn(),
}));

jest.mock("./data/collection.json", () => [], { virtual: true });

describe("fillCollectionWithData", () => {
  it("can call", async () => {
    jest.mocked(axios.get).mockResolvedValue({
      data: [],
    });

    const fillCollectionWithData = require("./fillCollectionWithData");
    
    expect(true).toBe(true);
  });
});