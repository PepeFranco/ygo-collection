#!/usr/bin/env node
import * as readline from 'readline';
import fs from 'fs';
import { getSetCodeFromCardCode, getCardsFromSet, findCardByCodeInSet, getCardSets } from './fillCollectionWithDataImpl';
import { CollectionRow } from './data/data.types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const addCardToCollection = async (cardCode: string): Promise<boolean> => {
  try {
    console.log(`🔍 Looking up card with code: ${cardCode}`);
    
    // Get card sets (from cache or API)
    const cardSets = await getCardSets();
    if (!cardSets) {
      console.log('❌ Unable to fetch card sets');
      return false;
    }

    // Extract set code and get cards from that set
    const setCode = getSetCodeFromCardCode(cardCode);
    const setCards = await getCardsFromSet(setCode, cardSets);
    
    if (!setCards) {
      console.log(`❌ Unable to find cards for set: ${setCode}`);
      return false;
    }

    // Find the specific card by code
    const cardInfo = findCardByCodeInSet(setCards, cardCode);
    
    if (!cardInfo) {
      console.log(`❌ Card not found with code: ${cardCode}`);
      return false;
    }

    // Get the card set info for this specific card
    const cardSet = cardInfo.card_sets?.find((set: any) => set.set_code === cardCode);
    
    if (!cardSet) {
      console.log(`❌ Set information not found for code: ${cardCode}`);
      return false;
    }

    // Create collection entry
    const newCard: CollectionRow = {
      Name: cardInfo.name,
      Code: cardSet.set_code,
      Set: cardSet.set_name,
      Rarity: cardSet.set_rarity?.split(' ')[0] || '',
      Edition: '',
      'In Deck': '',
      ID: cardInfo.id?.toString() || '',
      Type: cardInfo.type || '',
      ATK: cardInfo.atk?.toString() || '',
      DEF: cardInfo.def?.toString() || '',
      Level: cardInfo.level?.toString() || '',
      'Card Type': cardInfo.race || '',
      Attribute: cardInfo.attribute || '',
      Archetype: cardInfo.archetype || '',
      Scale: cardInfo.scale?.toString() || '',
      'Link Scale': cardInfo.linkval?.toString() || '',
      'Earliest Set': '', // Will be filled by existing logic if needed
      'Earliest Date': '',
      'Is Speed Duel': cardSet.set_name?.toLowerCase().includes('speed duel') ? 'Yes' : 'No',
      'Is Speed Duel Legal': '',
      Keep: '',
      Price: cardSet.set_price || '0'
    };

    // Read existing collection
    let collection: CollectionRow[] = [];
    try {
      const collectionData = fs.readFileSync('./data/collection.json', 'utf8');
      collection = JSON.parse(collectionData);
    } catch (error) {
      console.log('📝 Creating new collection file');
    }

    // Add new card to collection
    collection.push(newCard);

    // Write back to file
    fs.writeFileSync('./data/collection.json', JSON.stringify(collection, null, 3));

    console.log(`✅ Added card: ${cardInfo.name} (${cardCode}) to collection`);
    console.log(`📊 Collection now has ${collection.length} cards`);
    
    return true;
  } catch (error) {
    console.error('❌ Error adding card:', error);
    return false;
  }
};

const startCli = async () => {
  console.log('🎴 Yu-Gi-Oh Card Collection CLI Tool');
  console.log('Enter card codes to add them to your collection');
  console.log('Type "exit" or "quit" to stop\n');

  const promptForCard = () => {
    rl.question('Enter card code (e.g., LOB-001): ', async (input) => {
      const trimmedInput = input.trim();
      
      if (trimmedInput.toLowerCase() === 'exit' || trimmedInput.toLowerCase() === 'quit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }

      if (!trimmedInput) {
        console.log('⚠️ Please enter a card code');
        promptForCard();
        return;
      }

      await addCardToCollection(trimmedInput);
      console.log(); // Empty line for readability
      promptForCard();
    });
  };

  promptForCard();
};

// Export functions for potential testing
export { addCardToCollection, getSetCodeFromCardCode, getCardsFromSet, findCardByCodeInSet, getCardSets };

// Start CLI if this file is run directly
if (require.main === module) {
  startCli();
}