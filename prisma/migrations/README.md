# Replay Data Migration

This directory contains the migration needed to set up the database schema for storing Rocket League replay data.

## Migration Overview

The migration will:
1. Create new tables for storing replay data:
   - `Uploader`: User who uploaded the replay
   - `ReplayGroup`: Groups that replays belong to
   - `Team`: Blue and Orange teams with their stats
   - `Player`: Players with their stats
   - `Camera`: Camera settings for players
2. Modify the existing `Replay` table with new fields
3. Create relationships between these tables

## Running the Migration Manually

To apply this migration manually:

```bash
# Apply the migration
npx prisma migrate dev --name add_replay_data_models

# If you need to just run this specific migration
npx prisma db execute --file ./prisma/migrations/20240626000000_add_replay_data_models/migration.sql --schema ./prisma/schema.prisma
```

## Schema Verification

After running the migration, you can verify the schema was applied correctly:

```bash
npx prisma db pull
```

This will generate a schema.prisma file based on the current database schema, which you can compare with your expected schema. 