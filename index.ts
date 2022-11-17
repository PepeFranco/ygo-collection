const { downloadCollection } = require("./downloadCollection");

const main = async function () {
  const collection = await downloadCollection();
  console.log(collection);
};

main();
