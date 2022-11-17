const { url } = require("./secret/collectionSecrets.json");
const axios = require("axios");

const downloadCollection = async () => {
  const result = await axios.get(url).catch(() => {});
  return result.data;
};

export { downloadCollection };
