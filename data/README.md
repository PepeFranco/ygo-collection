# Data Types Documentation

## Auto-Generated Collection Types

The `collection.types.ts` file is **automatically generated** from `headers.json` to ensure TypeScript types stay synchronized with the Google Drive spreadsheet structure.

### How it works:

1. **Google Drive Download**: `downloadCollectionFromGDrive` extracts headers from CSV and updates `headers.json`
2. **Auto-Regeneration**: Script automatically runs `yarn generate:types` to update `collection.types.ts`
3. **Type Safety**: Import `CollectionRow` from `collection.types.ts` for guaranteed sync with spreadsheet

### Usage:

```typescript
// ✅ Use the auto-generated types (stays in sync)
import { CollectionRow } from "./collection.types";

// ❌ Avoid the manual types (can get out of sync)
import { CollectionRow } from "./data.types";
```

### Manual Regeneration:

```bash
# Regenerate types from current headers.json
yarn generate:types
```

### Migration Guide:

1. **Replace imports** in your files:
   ```typescript
   // Old
   import { CollectionRow } from "../data/data.types";
   
   // New  
   import { CollectionRow } from "../data/collection.types";
   ```

2. **Existing code works unchanged** - only the import path changes
3. **Types stay synchronized** automatically when downloading from Google Drive

### Files:

- `headers.json` - Source of truth (auto-updated from Google Drive)
- `collection.types.ts` - Auto-generated TypeScript types (**DO NOT EDIT**)
- `data.types.ts` - Manual types for YGO Pro API and other structures
- `scripts/generateTypes.ts` - Type generation script