/**
 * migrateStackedReservations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Clears tableIds/tableId from all stacked reservations so they match the new
 * approach: stacked reservations store NO tables — the admin assigns them
 * manually via the admin detail view when the reservation time occurs.
 *
 * What this script does:
 *   1. Finds all stacked reservations.
 *   2. For any that still have tableIds/tableId set, clears them.
 *   3. Syncs table statuses for any tables that were previously referenced
 *      (they may now become Available).
 *
 * Safety:
 *   • Never touches non-stacked reservations
 *   • Never deletes any reservation or table
 *   • Idempotent: stacked reservations already without tables are skipped
 *   • Dry-run mode: pass --dry-run flag to preview without saving
 *
 * Usage:
 *   node server/scripts/migrateStackedReservations.js
 *   node server/scripts/migrateStackedReservations.js --dry-run
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGO_URI = rawUri && !rawUri.includes('/Bites_Restaurant')
  ? rawUri.replace(/\/(\?|$)/, '/Bites_Restaurant$1')
  : rawUri;

const DRY_RUN = process.argv.includes('--dry-run');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Syncs a table's status to 'Reserved' or 'Available' based on whether
 * any active (Pending/Confirmed) future reservations reference it.
 */
const syncTableStatus = async (tableId) => {
  const today = new Date().toISOString().split('T')[0];
  const activeCount = await Reservation.countDocuments({
    $or: [
      { tableIds: tableId, status: { $in: ['Pending', 'Confirmed'] }, reservationDate: { $gte: today } },
      { tableId, tableIds: { $size: 0 }, status: { $in: ['Pending', 'Confirmed'] }, reservationDate: { $gte: today } },
    ],
  });
  const newStatus = activeCount > 0 ? 'Reserved' : 'Available';
  await Table.findByIdAndUpdate(tableId, { status: newStatus });
  return newStatus;
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  if (!MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');
  if (DRY_RUN) console.log('🔍  DRY-RUN mode — no changes will be saved\n');

  // ── 1. Find ALL stacked reservations ──────────────────────────────────────
  const stackedReservations = await Reservation.find({
    tableSelectionMode: 'stacked',
  }).sort({ reservationDate: 1, reservationTime: 1 });

  if (stackedReservations.length === 0) {
    console.log('ℹ️   No stacked reservations found. Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${stackedReservations.length} stacked reservation(s) to process.\n`);

  const touchedTableIds = new Set();
  let cleared = 0;
  let skipped = 0;

  for (const res of stackedReservations) {
    const label = `  [${res.reservationId}] ${res.fullName} | ${res.reservationDate} ${res.reservationTime} | party=${res.partySize} | status=${res.status}`;

    const hasTableIds = Array.isArray(res.tableIds) && res.tableIds.length > 0;
    const hasTableId  = !!res.tableId;

    if (!hasTableIds && !hasTableId) {
      console.log(`${label}`);
      console.log('    ✔  Already empty — no change needed.\n');
      skipped++;
      continue;
    }

    const oldIds = hasTableIds
      ? res.tableIds.map((id) => id.toString())
      : hasTableId ? [res.tableId.toString()]
      : [];

    console.log(`${label}`);
    console.log(`    Clearing tableIds: [${oldIds.join(', ')}]`);

    if (!DRY_RUN) {
      res.tableIds = [];
      res.tableId  = null;
      await res.save({ validateBeforeSave: false });
      console.log('    ✅  Cleared.\n');
    } else {
      console.log('    🔍  [dry-run] Would clear.\n');
    }

    oldIds.forEach((id) => touchedTableIds.add(id));
    cleared++;
  }

  // ── 2. Sync table statuses for all tables we touched ──────────────────────
  if (!DRY_RUN && touchedTableIds.size > 0) {
    console.log(`\nSyncing statuses for ${touchedTableIds.size} previously-assigned table(s)...`);
    for (const id of touchedTableIds) {
      const status = await syncTableStatus(new mongoose.Types.ObjectId(id));
      const table  = await Table.findById(id).select('tableNumber');
      console.log(`  Table #${table?.tableNumber ?? '?'} → ${status}`);
    }
  }

  // ── 3. Summary ────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────');
  console.log(`Total stacked reservations processed : ${stackedReservations.length}`);
  console.log(`  ✅  Tables cleared                 : ${cleared}`);
  console.log(`  ✔   Already empty (skipped)        : ${skipped}`);
  if (DRY_RUN) console.log('\n🔍  Dry-run complete — run without --dry-run to apply changes.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Error:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
