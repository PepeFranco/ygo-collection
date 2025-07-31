# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Yu-Gi-Oh! card collection management system that helps track owned cards, manage structure deck completion, and organize cards across different formats. The system integrates with Google Spreadsheets for data storage and the YGO Pro API for card information.

## Core Architecture

### Data Flow
- **Collection Management**: Cards are stored in Google Spreadsheets, downloaded locally as JSON, enhanced with additional data, then uploaded back
- **Structure Decks**: Uses YGO Pro API to download deck lists, compares against collection to identify missing cards
- **Format Support**: Special handling for Edison, Goat, and Structure deck formats with deck building capabilities

### Key Data Types
- `CollectionRow` (data/data.types.ts): Represents a single card in the collection with metadata
- `StructureDeck` (structureDecks/structureDecks.type.ts): Structure deck definition with banlist awareness
- `YGOProCard` (data/data.types.ts): Card data from YGO Pro API

### File Organization
- `data/`: Collection management, API integration, and type definitions
- `structureDecks/`: Structure deck analysis and missing card tracking
- `formats/`: Format-specific deck building (Edison, Goat, Structure)
- `secret/`: Google API credentials (not version controlled)

## Development Commands

### Collection Management
```bash
# Download collection from Google Spreadsheet
yarn collection:download

# Fill collection with missing card data from APIs
yarn collection:fill

# Upload enhanced collection back to Google Spreadsheet
yarn collection:upload

# Complete collection update workflow
yarn collection:update
```

### Structure Deck Analysis
```bash
# Download structure deck lists from YGO Pro API
yarn structure:download-lists

# Analyze missing cards for structure deck completion
yarn structure:get-missing

# Move cards in collection to appropriate decks
yarn structure:move-cards

# Complete structure deck workflow
yarn structure:update
```

### Testing
```bash
# Run test suite using Jest
yarn test
```

### Utility Commands
```bash
# Download banlists (manually updated in spreadsheet)
yarn collection:download-banlists

# Complete update of all data
yarn update-all
```

## Google API Integration

The system requires Google API credentials in the `secret/` directory:
- `collectionread.json`: Read access to collection spreadsheet
- `collectionwrite.json`: Write access to collection spreadsheet  
- `google-api-key.json`: General Google API access
- `spreadsheet-credentials.json`: Spreadsheet-specific credentials

## Key Workflows

### Adding New Structure Decks
1. Update YGO Pro API integration if needed
2. Run `yarn structure:download-lists` to fetch new deck data
3. Run `yarn structure:get-missing` to analyze completion requirements

### Collection Updates
1. Download current collection: `yarn collection:download`
2. Fill missing data: `yarn collection:fill`
3. Upload changes: `yarn collection:upload`


## Testing Strategy

Uses Jest with TypeScript support. Test files are co-located with source files using `.test.ts` extension. Mock data and external API responses are handled through Jest mocking utilities.