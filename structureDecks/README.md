# General collection

### Download collection
Download collection from google spreadsheet to json
```
node data/downloadCollection.js
```

### Fill data
Fill collection with missing data

```
node fillCollectionWithData.js
```

### Upload collection
Upload collection back to google spreadsheet
```
node data/uploadCollection.js
```


# Structure decks

There are 2 approaches to get which cards are missing for 3 sets of structure decks

## Approach 1 

### Get cards missing for structure decks
Generates `missingCardsDataSet.json`
Summarizes how many cards in collection and missing for each deck

Generates `cardsForXSets.json`
Specifies which cards are missing for each deck
Which cards are already in the collection
And which cards are limited / semi limited
```
node structureDecks/cardsMissingForStructureDecks.js
```

## Approach 2

### Download structure deck lists
Generates `cardsInStructureDecks.json`
List of each individual card in each deck

YGO Pro API may not have complete lists on all decks
This means missing lists may be incomplete
And cards may incorrectly be marked as not to keep

```
node structureDecks/downloadStructureDeckSets.json
```

### Generate enhanced structure deck lists
Takes `cardsInStructureDecks.json` and generates `cardsInStructureDecksEnhanced.json`
Adds which cards are limited/semi
Multiplies cards according to their own banlist
Source of truth of which cards to get to complete 3 of each Structure Deck
```
node ./structureDecks/mapCardsForSetsToDeckLists.js
```

### Generate files for each deck 
Uses approach from Format folders to generate individual cards for each deck
They can then be used by `buildDeck` to generate built files

```
node ./structureDecks/mapCardsForSetsToDeckLists.js
```
