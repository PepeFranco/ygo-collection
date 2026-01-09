# General collection

## Download collection
Download collection from google spreadsheet to json
```
yarn collection:download
```

## Fill data
Fill collection with missing data

```
yarn collection:fill
```

## Upload collection
Upload collection back to google spreadsheet

Also uploads cards missing for structure decks
```
yarn collection:upload
```

# General data

All card sets can be manually obtained from
https://db.ygoprodeck.com/api/v7/cardsets.php
But it tends to be out of date
Manually copy the file under `data/cardsets.json`


# Structure decks

> [!NOTE]
> `export DEBUG=true` is required for debugging messages

The scripts will output which cards are required to complete 3 sets of each Structure Deck, plus Chronicles deck and some Legendary Decks.

It is recommended to follow each step in order. As each step assumes the output of the previous step is in place.

## Generate lists of sets

The following script will look through `data/cardsets.json` and find all the sets that are structure decks. 
It will output `data/structureDecks/cardsets.json`. 

```
yarn tsx structureDecks/getStructureSets.ts
```

> [!NOTE]
> Chronicles deck have to be manually added to cardsets.json cause they do not exist on YGOPro API

> [!NOTE]
> Legendary Hero & 5Ds deck have to be manually added cause a single cardset contains 3 decks

## Generate lists of cards

The following script will look through `data/structureDecks/cardsets.json` structure decks and create a matching `data/structureDecks/*.json` file with a list of unique cards.

```
yarn tsx structureDecks/getCardLists.ts
```

> [!NOTE]
> Chronicles deck have to have their json files manully added cause they do not exist on YGOPro API

> [!NOTE]
> Legendary Hero & 5Ds deck have to be manually added cause a single cardset contains 3 decks

## Generate missing cards

> [!NOTE]
> It is recommended to reset the Keep value of all cards in the collection
> before running this script

The following script will sort through each structure deck and find the best matching cards in the collection.
Cards in collection will have their `Keep` property changed to their structure deck.
It will generate `data/structureDecks/missingCards.json`

```
yarn tsx structureDecks/getMissingCards.ts

```

> [!NOTE]
> It is recommended to upload the collection at this point

# Retro formats

> [!NOTE]
> `export DEBUG=true` is required for debugging messages

The scripts will modify the collection to mark which cards to keep for retro formats.
It will respect existing Keep values.

## Mark cards to keep

The following script will modify the collection and mark them to keep for which format.

```
yarn tsx retroFormats/markCardsToKeep.ts
```

> [!NOTE]
> It is recommended to upload the collection at this point


# Speed duel

> [!NOTE]
> `export DEBUG=true` is required for debugging messages

The scripts will modify the collection to mark which cards are speed duel legal.
And which to keep based on that.

## Generate lists of sets

The following script will look through `data/cardsets.json` and find all the sets that are speed duel. 
It will output `data/speedDuel/cardsets.json`.

```
yarn tsx speedDuel/getSpeedDuelSets.ts
```

## Generate lists of legal cards 

The following script will look through `data/speedDuel/cardsets.json` and find all legal cards in speed duel.

```
yarn tsx speedDuel/getCardLists.ts
```

## Mark cards to keep

The following script will mark all speed duel legal cards as Keep.
It will respect whatever is in place already.

```
yarn tsx speedDuel/markCardsToKeep.ts
```

> [!NOTE]
> It is recommended to upload the collection at this point
