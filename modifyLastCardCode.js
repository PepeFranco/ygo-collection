#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the replacement characters from command line arguments
const replacementChars = process.argv[2];

if (!replacementChars || replacementChars.length !== 2) {
  console.log('❌ Please provide exactly 2 characters to replace "EN" with');
  console.log('Usage: node modifyLastCardCode.js XX');
  console.log('Example: node modifyLastCardCode.js FR');
  process.exit(1);
}

const collectionPath = path.join(__dirname, 'data', 'collection.json');

try {
  // Read the collection file
  const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

  if (!Array.isArray(collectionData) || collectionData.length === 0) {
    console.log('❌ Collection is empty or invalid format');
    process.exit(1);
  }

  // Get the last card
  const lastCard = collectionData[collectionData.length - 1];
  const originalCode = lastCard.Code;

  console.log(`🎴 Last card: ${lastCard.Name}`);
  console.log(`📝 Original code: ${originalCode}`);

  // Modify the code
  let newCode;
  const dashIndex = originalCode.indexOf('-');

  if (dashIndex === -1) {
    // No dash found, unusual format
    console.log('❌ Code format not recognized (no dash found)');
    process.exit(1);
  }

  const beforeDash = originalCode.substring(0, dashIndex + 1);
  const afterDash = originalCode.substring(dashIndex + 1);

  // Check if "EN" exists after the dash
  if (afterDash.startsWith('EN')) {
    // Replace "EN" with the new characters
    newCode = beforeDash + replacementChars + afterDash.substring(2);
  } else {
    // "EN" not found, add the replacement characters at the beginning of after-dash part
    newCode = beforeDash + replacementChars + afterDash;
  }

  // Update the last card's code
  lastCard.Code = newCode;

  console.log(`✅ New code: ${newCode}`);

  // Write back to file
  fs.writeFileSync(collectionPath, JSON.stringify(collectionData, null, 3));

  console.log('💾 Collection updated successfully!');

} catch (error) {
  console.log('❌ Error:', error.message);
  process.exit(1);
}