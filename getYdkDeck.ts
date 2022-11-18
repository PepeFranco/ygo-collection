const fs = require("fs");

export interface YdkDeck {
  main: Number[];
  extra: Number[];
  side: Number[];
}

const getMainStartIndex = (lines: string[]) =>
  lines.findIndex((line) => line === "#main") + 1;

const getExtraStartIndex = (lines: string[]) =>
  lines.findIndex((line) => line === "#extra") + 1;

const getSideStartIndex = (lines: string[]) =>
  lines.findIndex((line) => line === "!side") + 1;

const getYdkDeck = (deckName: string): YdkDeck => {
  const ydkString: string = fs
    .readFileSync(`./data/ydkFiles/${deckName}.ydk`)
    .toString();

  const lines = ydkString.split("\n");
  const main = lines
    .slice(getMainStartIndex(lines), getExtraStartIndex(lines) - 1)
    .map((mainCardIdString) => Number(mainCardIdString))
    .filter((cardId) => cardId > 0);

  const extra = lines
    .slice(getExtraStartIndex(lines), getSideStartIndex(lines) - 1)
    .map((extraCardIdString) => Number(extraCardIdString))
    .filter((cardId) => cardId > 0);

  const side = lines
    .slice(getSideStartIndex(lines))
    .map((sideCardIdString) => Number(sideCardIdString))
    .filter((cardId) => cardId > 0);

  const ydkDeck = {
    main,
    extra,
    side,
  };

  return ydkDeck;
};

export { getYdkDeck };
