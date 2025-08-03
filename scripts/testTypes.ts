// Test script to verify the generated types work correctly
import { CollectionRow } from "../data/collection.types";

// Test that the generated type works
const testCard: CollectionRow = {
  Name: "Blue-Eyes White Dragon",
  Code: "LOB-001",
  Set: "Legend of Blue Eyes White Dragon",
  Rarity: "Ultra Rare"
};

console.log("✅ Generated CollectionRow type works correctly!");
console.log("📄 Test card:", testCard.Name);

export { testCard };