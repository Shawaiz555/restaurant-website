/**
 * seedReservations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Inserts 20 realistic sample reservations spread across the next 30 days,
 * each with randomly-assigned tables from the actual tables in the DB.
 *
 * Safety guarantees:
 *  • Only inserts — never deletes or modifies existing reservations or tables
 *  • Idempotent: skips insert if 20+ reservations already exist
 *  • Does NOT mark tables as Reserved (syncTableStatus handles that at runtime)
 *
 * Usage:
 *   node server/scripts/seedReservations.js
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

// ── Helpers ──────────────────────────────────────────────────────────────────

const generateReservationId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `RES-${ts}-${rnd}`;
};

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const futureDateStr = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

// Picks 1–3 tables greedily to cover partySize seats
const pickTablesForParty = (tables, partySize) => {
  const sorted = [...tables].sort((a, b) => b.capacity - a.capacity);
  const picked = [];
  let left = partySize;

  for (const t of sorted) {
    if (left <= 0) break;
    picked.push(t);
    left -= t.capacity;
  }

  // If still short (shouldn't happen with real data), just return what we have
  return picked;
};

// ── Sample data ───────────────────────────────────────────────────────────────

const FIRST_NAMES = ['James', 'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan',
  'Sophia', 'Mason', 'Isabella', 'Logan', 'Mia', 'Lucas', 'Charlotte',
  'Aiden', 'Amelia', 'Jackson', 'Harper', 'Elijah', 'Evelyn'];

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
  'White', 'Harris', 'Martin', 'Thompson', 'Robinson', 'Clark', 'Lewis'];

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com'];

const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const STATUSES = ['Pending', 'Pending', 'Confirmed', 'Confirmed', 'Confirmed', 'Completed', 'Cancelled'];

const SPECIAL_REQUESTS = [
  'Window seat preferred',
  'Birthday celebration — please prepare a surprise',
  'Vegetarian menu options needed',
  'High chair required for infant',
  'Allergy to nuts — please notify kitchen',
  'Anniversary dinner, quiet table appreciated',
  '',
  '',
  '',
];

const SELECTION_MODES = ['custom', 'custom', 'stacked', null];

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  if (!MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // Idempotency guard
  const existing = await Reservation.countDocuments();
  if (existing >= 20) {
    console.log(`ℹ️   Already ${existing} reservations in the DB. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  // Load active tables
  const tables = await Table.find({ isActive: true, status: { $ne: 'Maintenance' } });
  if (tables.length === 0) {
    console.error('❌  No active tables found. Add tables first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Found ${tables.length} active table(s) to assign`);

  const toInsert = [];

  for (let i = 0; i < 20; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName  = randomItem(LAST_NAMES);
    const fullName  = `${firstName} ${lastName}`;
    const email     = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(DOMAINS)}`;
    const phone     = `+1${Math.floor(2000000000 + Math.random() * 7999999999)}`;
    const partySize = Math.floor(Math.random() * 8) + 1; // 1–8
    const daysAhead = Math.floor(Math.random() * 30) + 1; // next 30 days
    const reservationDate = futureDateStr(daysAhead);
    const reservationTime = randomItem(TIME_SLOTS);
    const status    = randomItem(STATUSES);
    const tableSelectionMode = randomItem(SELECTION_MODES);

    // Assign tables that can cover the party size
    const assignedTables = pickTablesForParty(tables, partySize);
    const tableIds = assignedTables.map((t) => t._id);
    const tableId  = tableIds[0];

    const hasGuestList = Math.random() > 0.6;
    const guestCount = hasGuestList ? Math.min(partySize, Math.floor(Math.random() * partySize) + 1) : 0;
    const guests = Array.from({ length: guestCount }, (_, idx) => ({
      name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
      note: idx === 0 ? 'Guest of honour' : '',
    }));

    toInsert.push({
      reservationId: generateReservationId(),
      userId: null,
      tableId,
      tableIds,
      tableSelectionMode: tableSelectionMode || null,
      fullName,
      email,
      phone,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests: randomItem(SPECIAL_REQUESTS),
      status,
      isGuestReservation: Math.random() > 0.5,
      guestDetails: { hasGuestList, guests },
      statusHistory: [
        { status: 'Pending', timestamp: new Date(), note: 'Reservation created' },
        ...(status !== 'Pending'
          ? [{ status, timestamp: new Date(), note: `Status updated to ${status}` }]
          : []),
      ],
    });
  }

  await Reservation.insertMany(toInsert);
  console.log(`✅  Inserted ${toInsert.length} sample reservations.`);

  // Summary
  const modes = toInsert.reduce((acc, r) => {
    const m = r.tableSelectionMode || 'none';
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  console.log('   Selection modes:', modes);

  const statuses = toInsert.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log('   Statuses:', statuses);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Error:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
