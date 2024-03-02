# General collection

### Download collection
Download collection from google spreadsheet to json
```
yarn collection:download
```

### Fill data
Fill collection with missing data

```
yarn collection:fill
```

### Upload collection
Upload collection back to google spreadsheet

Also uploads cards missing for structure decks
```
yarn collection:upload
```


# Structure decks

There are 2 approaches to get which cards are missing for 3 sets of structure decks

## For both approaches

### Download structure deck lists
Generates `cardsInStructureDecks.json`

List of each individual card in each deck


YGO Pro API may not have complete lists on all decks

This means missing lists may be incomplete

And cards may incorrectly be marked as not to keep

```
yarn structure:download-lists
```

### Download banlists
Banlists are manually udpated in spreadsheet

Format was copied from wikia

The script transforms it to json
```
node ./data/downloadBanlists.js
```

## Approach 1 

### Get cards missing for structure decks
Generates `missingCardsDataSet.json`

Summarizes how many cards in collection and missing for each deck


Generates `cardsForXSets.json`

Specifies which cards are missing for each deck

Which cards are already in the collection

And which cards are limited / semi limited
```
yarn structure:get-missing
```

## Approach 2

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
