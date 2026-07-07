# H4A Save System Rewrite — Task Artifact

**Date**: 2026-07-06  
**Phase**: H4A  
**Status**: ✅ Complete  

## Objective

Rewrite the ghostMUD save system to establish a reliable single-save contract with schema validation, backup mechanism, corruption handling, and version migration.

## Key Changes

### 1. New File: `src/core/save_schema.js`
- Exports `SCHEMA_VERSION = 2`
- Exports `SAVE_SCHEMA` object with 48 field definitions (type, default, nullable, transient)
- Transient fields: `combat`, `npcEncounter` (not saved, reset to default on load)
- Nullable fields: `equippedSkill`, `innate`, `innateName`, `innateMods`, `chart`
- Exports helper functions: `checkType()`, `getSaveableFields()`, `createDefaultState()`
- Exports `V1_MIGRATION_MAP` for v1→v2 field renaming (`questProgress` → `questStages`)

### 2. Rewritten: `src/core/storage.js`
- **save()**: Schema whitelist serialization, pre-save backup to `ghostmud_save_v2_backup`, QuotaExceededError handling
- **load()**: JSON parse error → save to `ghostmud_save_v2_corrupt`, return null; v1→v2 migration; schema validation & repair (missing fields → defaults, type mismatch → defaults, null check against nullable flag)
- **hasSave()**, **clear()**: unchanged
- **getBackup()**: reads and validates backup save
- **exportSave()**: returns raw JSON string for export
- **importSave()**: validates and imports JSON string, backs up current save first

### 3. Unified Save Entry: `src/game.js`
- Added `saveGame()` method on Game class: `return this.storage.save(this.state)`
- Replaced 3 scattered `storage.save` calls:
  - `game.js:249` (was `this.storage.save(s)`) → `this.saveGame()`
  - `movement_service.js:99` (was `g.storage.save(g.state)`) → `g.saveGame()`
  - `intro_scene.js:426` (was `this.game.storage.save(this.game.state)`) → `this.game.saveGame()`

### 4. Tests: `test/save-schema.test.cjs`
- 31 test cases covering:
  - Schema basics (version, fields, transient, defaults, checkType)
  - v1→v2 migration (questProgress→questStages, field preservation, dual-field handling)
  - Missing fields → defaults
  - Type mismatch → correction
  - Corrupt save handling (truncated JSON, invalid structure, non-object JSON)
  - Unknown version → compatible load
  - Backup mechanism (after save, QuotaExceededError)
  - Save-load consistency (all 48 fields)
  - Export/import functionality
  - getBackup() functionality
  - Whitelist filtering (schema-external fields not saved)
  - Empty save handling
  - Nullable field handling
- Updated `test/smoke.test.cjs` with new Storage API tests and save_schema.js verification

### 5. Verification
- `npm test`: 69 tests pass, 0 failures
- `npm run build`: 0 warnings, 240ms build time

## Files Modified
- `src/core/save_schema.js` (new)
- `src/core/storage.js` (rewritten)
- `src/game.js` (added saveGame(), replaced 1 call)
- `src/movement_service.js` (replaced 1 call)
- `src/ui/intro_scene.js` (replaced 1 call)
- `test/save-schema.test.cjs` (new)
- `test/smoke.test.cjs` (updated Storage tests)

## Design Decisions
- Used `jsonEqual()` (JSON.stringify comparison) in tests to avoid vm context prototype chain issues with `assert.deepStrictEqual`
- Chinese strings in test file use Unicode escapes to avoid encoding issues during PowerShell regex replacement
- Schema whitelist approach (not blacklist) — only defined fields are saved, preventing schema-external fields from leaking into saves
- Transient fields are reset to defaults on load, not just excluded from save — ensures clean runtime state
