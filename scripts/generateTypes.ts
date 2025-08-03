#!/usr/bin/env npx tsx

import fs from "node:fs";
import path from "node:path";

/**
 * Generates collection.types.ts from headers.json
 * This ensures CollectionRow type stays in sync with Google Drive spreadsheet columns
 */

interface HeadersConfig {
  headers: string[];
}

const sanitizeFieldName = (header: string): string => {
  // Handle empty headers or invalid field names
  if (!header || header.trim() === "") {
    return "";
  }
  
  // If header contains spaces or special chars, wrap in quotes
  if (/[^a-zA-Z0-9_$]/.test(header)) {
    return `"${header}"`;
  }
  
  return header;
};

const generateCollectionRowType = (headers: string[]): string => {
  const validHeaders = headers.filter(h => h && h.trim() !== "");
  
  const fields = validHeaders.map(header => {
    const fieldName = sanitizeFieldName(header);
    // First field (Name) is required, all others optional
    const optional = header === "Name" ? "" : "?";
    return `  ${fieldName}${optional}: string | number;`;
  }).join("\n");

  return `export type CollectionRow = {
${fields}
};`;
};

const generateCollectionTypesFile = (collectionRowType: string): string => {
  return `// This file is auto-generated from headers.json
// DO NOT EDIT MANUALLY - run 'yarn generate:types' to regenerate
// 
// This provides a type-safe CollectionRow that stays in sync with 
// the Google Drive spreadsheet column structure

${collectionRowType}
`;
};

const main = () => {
  try {
    const headersPath = path.join(__dirname, "../data/headers.json");
    const typesPath = path.join(__dirname, "../data/collection.types.ts");
    
    // Read headers.json
    const headersRaw = fs.readFileSync(headersPath, "utf8");
    const headersConfig: HeadersConfig = JSON.parse(headersRaw);
    
    // Generate CollectionRow type
    const collectionRowType = generateCollectionRowType(headersConfig.headers);
    
    // Generate collection types file
    const typesFileContent = generateCollectionTypesFile(collectionRowType);
    
    // Write to collection.types.ts
    fs.writeFileSync(typesPath, typesFileContent);
    
    console.log("✅ Successfully generated collection.types.ts from headers.json");
    console.log(`📄 Generated ${headersConfig.headers.filter(h => h && h.trim() !== "").length} fields for CollectionRow`);
    
  } catch (error) {
    console.error("❌ Error generating types:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

export { generateCollectionRowType, generateCollectionTypesFile };