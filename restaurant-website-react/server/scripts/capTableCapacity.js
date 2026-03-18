/**
 * capTableCapacity.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates any Table document whose capacity exceeds 6 by capping it to 6.
 * Safe to re-run — tables already at or below 6 are untouched.
 *
 * Usage:
 *   node server/scripts/capTableCapacity.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Table = require('../models/Table');

// Ensure the URI points to the correct database (Bites_Restaurant).
// Atlas URIs often end with /?params — insert the DB name before the '?'.
const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGO_URI = rawUri && !rawUri.includes('/Bites_Restaurant')
  ? rawUri.replace(/\/(\?|$)/, '/Bites_Restaurant$1')
  : rawUri;

async function run() {
  if (!MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // Find all tables with capacity > 6
  const tables = await Table.find({ capacity: { $gt: 6 } });

  if (tables.length === 0) {
    console.log('✅  All tables already have capacity ≤ 6. Nothing to update.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${tables.length} table(s) with capacity > 6. Updating...`);

  let updated = 0;
  for (const table of tables) {
    const oldCap = table.capacity;
    table.capacity = 6;
    // Use { validateBeforeSave: false } so the max:6 validator doesn't block the
    // update itself — the new value is already 6 so it would pass anyway, but
    // this avoids any edge-case re-validation of other fields.
    await table.save({ validateBeforeSave: false });
    console.log(
      `  Table #${table.tableNumber} "${table.name}": capacity ${oldCap} → 6`
    );
    updated++;
  }

  console.log(`\n✅  Done. Updated ${updated} table(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Error:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
