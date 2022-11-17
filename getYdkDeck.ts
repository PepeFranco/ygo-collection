const fs = require("fs");

interface YdkDeck {
  main: String[];
  extra: String[];
  side: String[];
}

const getMainStartIndex = (lines: String[]) =>
  lines.findIndex((line) => line === "#main") + 1;

const getExtraStartIndex = (lines: String[]) =>
  lines.findIndex((line) => line === "#extra") + 1;

const getSideStartIndex = (lines: String[]) =>
  lines.findIndex((line) => line === "!side") + 1;

const getYdkDeck = (deckName) => {
  const ydkString = fs
    .readFileSync(`./data/ydkFiles/${deckName}.ydk`)
    .toString();

  const lines = ydkString.split("\n");
  const main = lines.slice(
    getMainStartIndex(lines),
    getExtraStartIndex(lines) - 1
  );

  const extra = lines.slice(
    getExtraStartIndex(lines),
    getSideStartIndex(lines) - 1
  );

  const side = lines.slice(getSideStartIndex(lines));

  const ydkDeck = {
    main,
    extra,
    side,
  };

  return ydkDeck;
};

export { getYdkDeck };
