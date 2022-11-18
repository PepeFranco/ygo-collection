const axios = require("axios");

const getCardNameFromId = async (cardId: Number): Promise<string | null> => {
  const result = await axios
    .get(
      "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=" +
        encodeURIComponent(String(cardId))
    )
    .catch((e) => {});

  return (result && result.data.data[0].name) || null;
};

export { getCardNameFromId };
