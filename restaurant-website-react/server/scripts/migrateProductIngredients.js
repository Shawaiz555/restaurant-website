/**
 * Migration Script: Fix Product.ingredients to use canonical Ingredient names
 *
 * SAFETY RULES:
 *  1. Only entries that appear in MANUAL_MAP or are exact case-insensitive
 *     matches are replaced/kept.
 *  2. Entries with no mapping AND no exact match are REMOVED (they are
 *     display-only text that does not exist in the stock system).
 *  3. --dry-run flag previews every change without touching the DB.
 *  4. The final list is deduplicated (preserving order).
 *
 * Usage:
 *   node server/scripts/migrateProductIngredients.js --dry-run   ← safe preview
 *   node server/scripts/migrateProductIngredients.js             ← apply changes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Manual mapping table ─────────────────────────────────────────────────────
// Keys   : product ingredient strings (case-insensitive lookup at runtime)
// Values : exact canonical name from the Ingredients collection
//          Use null to explicitly DROP an entry (not in stock — remove it)
//
// Every key here was taken from the dry-run output and reviewed manually.
// ─────────────────────────────────────────────────────────────────────────────
const MANUAL_MAP = {
  // ── Produce variants ──
  'fresh tomatoes':   'Tomato',
  'tomatoes':         'Tomato',
  'premium potatoes': 'Potato',
  'mashed potatoes':  'Potato',
  'bell peppers':     'Bell Pepper',
  'onions':           'Onion',
  'red onion':        'Onion',
  'green onions':     'Onion',
  'pickled ginger':   'Ginger',
  'coconut milk':     'Milk',

  // ── Meat variants ──
  'chicken':          'Chicken Breast',
  'chicken piece':    'Chicken Breast',
  'grilled chicken':  'Chicken Breast',
  'beef':             'Beef Mince',
  'beef patty':       'Beef Mince',
  'sirloin steak':    'Boneless Beef',

  // ── Dairy variants ──
  'greek yogurt':     'Yogurt',
  'cheddar cheese':   'Cheese (Processed)',
  'cheese':           'Cheese (Processed)',
  'feta cheese':      'Cheese (Processed)',
  'blue cheese':      'Cheese (Processed)',
  'parmesan':         'Cheese (Processed)',
  'parmesan cheese':  'Cheese (Processed)',
  'garlic butter':    'Butter',

  // ── Spice / seasoning variants ──
  'turmeric':         'Turmeric Powder',
  'spices':           'Garam Masala',
  'special seasoning':'Garam Masala',

  // ── Grain variants ──
  'flour':            'All-Purpose Flour',
  'steamed rice':     'Basmati Rice',
  'sushi rice':       'Basmati Rice',
  'chickpeas':        'Chickpeas (Dried)',
  'bread':            'Bread (Naan)',
  'pita bread':       'Bread (Naan)',

  // ── Oil variants ──
  'olive oil':        'Cooking Oil',
  'vegetable oil':    'Cooking Oil',
  'sesame oil':       'Cooking Oil',
  'chili oil':        'Cooking Oil',

  // ── Explicitly dropped (no stock equivalent) ──
  'durum wheat semolina': null,
  'basil':            null,
  'lettuce':          null,
  'pickles':          null,
  'garlic sauce':     null,
  'special sauce':    null,
  'tahini':           null,
  'tahini dressing':  null,
  'caesar dressing':  null,
  'ranch dressing':   null,
  'fresh fish':       null,
  'curry leaves':     null,
  'eggs':             null,
  'sugar':            null,
  'baking powder':    null,
  'fresh berries':    null,
  'maple syrup':      null,
  'yeast':            null,
  'granola':          null,
  'honey':            null,
  'almonds':          null,
  'mushrooms':        null,
  'herbs':            null,
  'fresh blueberries':null,
  'vanilla':          null,
  'streusel topping': null,
  'ramen noodles':    null,
  'miso paste':       null,
  'pork belly':       null,
  'soft-boiled egg':  null,
  'nori':             null,
  'bamboo shoots':    null,
  'rice noodles':     null,
  'shrimp':           null,
  'peanuts':          null,
  'bean sprouts':     null,
  'tamarind sauce':   null,
  'lime':             null,
  'cilantro':         null,
  'egg noodles':      null,
  'cabbage':          null,
  'carrots':          null,
  'soy sauce':        null,
  'oyster sauce':     null,
  'udon noodles':     null,
  'dashi broth':      null,
  'tempura shrimp':   null,
  'kamaboko':         null,
  'romaine lettuce':  null,
  'croutons':         null,
  'cucumbers':        null,
  'cucumber':         null,
  'kalamata olives':  null,
  'oregano':          null,
  'mixed lettuce':    null,
  'bacon':            null,
  'avocado':          null,
  'tomatoes':         'Tomato',   // duplicate key resolved above, keep
  'quinoa':           null,
  'roasted vegetables':null,
  'kale':             null,
  'pumpkin seeds':    null,
  'avocado':          null,
  'wasabi':           null,
  'assorted vegetables':null,
  'tempura batter':   null,
  'tempura sauce':    null,
  'daikon':           null,
  'daikon radish':    null,
  'shiso leaf':       null,
  'salmon':           null,
  'fresh salmon':     null,
  'espresso':         null,
  'ice':              null,
  'simple syrup':     null,
  'fresh mint':       null,
  'lime juice':       null,
  'soda water':       null,
  'lime wedges':      null,
  'strawberries':     null,
  'blueberries':      null,
  'raspberries':      null,
  'banana':           null,
  'fresh oranges':    null,
  'sesame bun':       null,
  'ketchup':          null,
  'mayonees':         null,
  'mayo':             null,
  'turkey':           null,
  'toasted bread':    null,
  'seasonal vegetables':null,
  'fettuccine':       null,
  'club sandwich':    null,
  'seasonal vegetables':null,
  'romaine lettuce':  null,
  'green chilli':     'Green Chilli',
};

// ─── Resolve a single ingredient entry ───────────────────────────────────────
// Returns:
//   { keep: true,  name: <canonical> }   — keep with this name
//   { keep: false, reason: <string> }    — drop this entry
// ─────────────────────────────────────────────────────────────────────────────
const resolve = (entry, ingredients) => {
  const needle = entry.trim().toLowerCase();
  if (!needle) return { keep: false, reason: 'empty string' };

  // 1. Manual map takes priority
  if (Object.prototype.hasOwnProperty.call(MANUAL_MAP, needle)) {
    const mapped = MANUAL_MAP[needle];
    if (mapped === null) return { keep: false, reason: 'explicitly dropped (not in stock)' };
    return { keep: true, name: mapped };
  }

  // 2. Exact case-insensitive match against live ingredient list
  const exact = ingredients.find((i) => i.name.trim().toLowerCase() === needle);
  if (exact) return { keep: true, name: exact.name };

  // 3. No mapping, no exact match → drop
  return { keep: false, reason: 'no match in stock system — dropped' };
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI / MONGO_URI not set in .env');
    process.exit(1);
  }

  // Inject DB_NAME into the URI if provided separately
  const dbName = process.env.DB_NAME;
  if (dbName) {
    uri = uri.replace(
      /(mongodb(?:\+srv)?:\/\/[^/]+)(\/[^?]*)?(.*)/,
      (_, host, _path, rest) => `${host}/${dbName}${rest}`,
    );
  }

  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB\n');

  // Load authoritative ingredient list
  const ingredients = await Ingredient.find({}, 'name category').lean();
  console.log(`Found ${ingredients.length} ingredients in the Ingredients collection:`);
  ingredients.forEach((i) =>
    console.log(`  • ${i.name}${i.category ? ` [${i.category}]` : ''}`),
  );
  console.log();

  if (ingredients.length === 0) {
    console.log('No ingredients in stock — add them first, then re-run this script.');
    await mongoose.disconnect();
    return;
  }

  // Load products with a non-empty ingredients array
  const products = await Product.find({
    ingredients: { $exists: true, $not: { $size: 0 } },
  }).lean();

  console.log(`Found ${products.length} products with ingredient lists\n`);
  console.log('─'.repeat(70));

  const updatedProducts = [];

  for (const product of products) {
    const original = (product.ingredients || []).filter((s) => s && s.trim() !== '');
    if (original.length === 0) continue;

    const newList = [];
    let productChanged = false;
    const productChanges = [];

    for (const entry of original) {
      const result = resolve(entry, ingredients);

      if (!result.keep) {
        // Drop this entry
        productChanged = true;
        productChanges.push({ from: entry, to: '(removed)', reason: result.reason });
      } else if (result.name !== entry) {
        // Remap to canonical name
        newList.push(result.name);
        productChanged = true;
        productChanges.push({ from: entry, to: result.name, reason: 'mapped to canonical' });
      } else {
        // Already correct
        newList.push(entry);
      }
    }

    // Deduplicate while preserving order
    const dedupedList = [...new Set(newList)];
    if (dedupedList.length !== newList.length) {
      productChanged = true;
      productChanges.push({ from: '(duplicates)', to: '(removed)', reason: 'deduplication' });
    }

    if (productChanged) {
      updatedProducts.push({
        _id: product._id,
        name: product.name,
        original,
        updated: dedupedList,
        changes: productChanges,
      });
    }
  }

  // ── Print planned changes ──────────────────────────────────────────────────
  if (updatedProducts.length === 0) {
    console.log('✓ All product ingredients already match. Nothing to update.\n');
  } else {
    console.log(`\n📝 PLANNED CHANGES (${updatedProducts.length} product(s)):\n`);
    for (const p of updatedProducts) {
      console.log(`  Product: "${p.name}"`);
      console.log(`    Before: [${p.original.join(', ')}]`);
      console.log(`    After:  [${p.updated.join(', ')}]`);
      p.changes.forEach((c) =>
        console.log(`    • "${c.from}" → "${c.to}"  (${c.reason})`),
      );
      console.log();
    }
  }

  // ── Apply changes (unless dry-run) ────────────────────────────────────────
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No changes were written to the database.');
    console.log('  Remove --dry-run to apply the changes above.\n');
  } else if (updatedProducts.length > 0) {
    console.log('─'.repeat(70));
    console.log('Applying changes...\n');
    let saved = 0;
    for (const p of updatedProducts) {
      await Product.findByIdAndUpdate(
        p._id,
        { $set: { ingredients: p.updated } },
        { runValidators: false },
      );
      console.log(`  ✓ Updated "${p.name}"`);
      saved++;
    }
    console.log(`\n✓ Done — ${saved} product(s) updated successfully.`);
    console.log('  Run with --dry-run at any time to audit the current state.\n');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('\nMigration failed:', err.message || err);
  process.exit(1);
});
