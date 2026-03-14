/**
 * seedProductAddons.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Safe seed script — MERGES new addons into existing products.
 *
 * What it does:
 *   For every product, appends any addon from the NEW_* lists that is not
 *   already present (matched by name, case-insensitive). Existing addons are
 *   never removed or modified. addOnsConfig flags are set to true for each
 *   category that ends up with at least one item.
 *
 * Safety guarantees:
 *   • Only APPENDS — never removes, replaces or overwrites existing addons.
 *   • Duplicate-guard: checks existing addon names before appending.
 *   • Never touches Orders, Users, Ingredients, Recipes, Purchases, etc.
 *   • Idempotent — safe to run multiple times (re-run skips already-present items).
 *
 * Addon names EXACTLY match AddonStock records so order-time stock
 * deduction works correctly.
 *
 * Usage:
 *   npm run seed:addons
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('../models/Product');

// ── New addons to merge in (names must match AddonStock records exactly) ─────

const NEW_DRINKS = [
  { name: 'Mango Lassi',       price: 120, description: 'Chilled mango lassi' },
  { name: 'Sweet Lassi',       price: 100, description: 'Classic sweet lassi' },
  { name: 'Rooh Afza Sharbat', price: 80,  description: 'Rose-flavoured sharbat' },
  { name: 'Cold Coffee',       price: 150, description: 'Chilled cold coffee' },
  { name: 'Mineral Water',     price: 50,  description: '500ml mineral water' },
  { name: 'Coca Cola',         price: 80,  description: '330ml can' },
  { name: 'Sprite',            price: 80,  description: '330ml can' },
  { name: 'Fanta',             price: 80,  description: '330ml can' },
  { name: 'Fresh Lime Soda',   price: 90,  description: 'Fresh lime with soda' },
  { name: 'Doodh Soda',        price: 70,  description: 'Milk soda drink' },
];

const NEW_DESSERTS = [
  { name: 'Gulab Jamun',         price: 80,  description: 'Soft gulab jamun (2 pcs)' },
  { name: 'Kheer',               price: 100, description: 'Creamy rice kheer' },
  { name: 'Zarda',               price: 120, description: 'Sweet saffron rice' },
  { name: 'Phirni',              price: 110, description: 'Chilled phirni' },
  { name: 'Gajar Halwa',         price: 130, description: 'Carrot halwa' },
  { name: 'Rasgulla',            price: 80,  description: 'Soft rasgulla (2 pcs)' },
  { name: 'Ice Cream (Vanilla)', price: 90,  description: 'Single scoop vanilla' },
  { name: 'Brownie',             price: 150, description: 'Chocolate fudge brownie' },
];

const NEW_EXTRAS = [
  { name: 'Raita',            price: 50, description: 'Fresh yogurt raita' },
  { name: 'Pappad',           price: 30, description: 'Crispy pappad (2 pcs)' },
  { name: 'Green Chutney',    price: 30, description: 'Mint & coriander chutney' },
  { name: 'Imli Chutney',     price: 30, description: 'Tamarind chutney' },
  { name: 'Extra Naan',       price: 40, description: 'One plain naan' },
  { name: 'Extra Rice',       price: 60, description: 'Portion of steamed rice' },
  { name: 'Salad',            price: 70, description: 'Garden fresh salad' },
  { name: 'Pickles',          price: 30, description: 'Mixed pickles' },
  { name: 'Butter (Portion)', price: 40, description: 'Butter portion for naan' },
];

// ── Helper: filter out items whose name already exists in the product array ──
function missingOnly(newItems, existingItems) {
  const existingNames = new Set(
    existingItems.map((e) => e.name.toLowerCase().trim())
  );
  return newItems.filter((n) => !existingNames.has(n.name.toLowerCase().trim()));
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  console.log('✔  Connected to MongoDB');

  const products = await Product.find({});
  console.log(`   Found ${products.length} products\n`);

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const product of products) {
    const drinksToAdd   = missingOnly(NEW_DRINKS,   product.drinks   || []);
    const dessertsToAdd = missingOnly(NEW_DESSERTS, product.desserts || []);
    const extrasToAdd   = missingOnly(NEW_EXTRAS,   product.extras   || []);

    // Nothing new to add for this product
    if (drinksToAdd.length === 0 && dessertsToAdd.length === 0 && extrasToAdd.length === 0) {
      totalSkipped++;
      continue;
    }

    // Build the merged arrays
    const mergedDrinks   = [...(product.drinks   || []), ...drinksToAdd];
    const mergedDesserts = [...(product.desserts || []), ...dessertsToAdd];
    const mergedExtras   = [...(product.extras   || []), ...extrasToAdd];

    // Preserve existing addOnsConfig, only upgrade false→true (never downgrade true→false)
    const updatedConfig = {
      showSpiceLevel: product.addOnsConfig?.showSpiceLevel || false,
      showDrinks:     (product.addOnsConfig?.showDrinks   || false) || mergedDrinks.length   > 0,
      showDesserts:   (product.addOnsConfig?.showDesserts || false) || mergedDesserts.length > 0,
      showExtras:     (product.addOnsConfig?.showExtras   || false) || mergedExtras.length   > 0,
    };

    await Product.findByIdAndUpdate(
      product._id,
      {
        $set: {
          drinks:      mergedDrinks,
          desserts:    mergedDesserts,
          extras:      mergedExtras,
          addOnsConfig: updatedConfig,
        },
      },
      { runValidators: false }
    );

    console.log(
      `  ✔  ${product.name}` +
      (drinksToAdd.length   ? ` +${drinksToAdd.length} drinks`   : '') +
      (dessertsToAdd.length ? ` +${dessertsToAdd.length} desserts` : '') +
      (extrasToAdd.length   ? ` +${extrasToAdd.length} extras`   : '')
    );
    totalUpdated++;
  }

  console.log('\n─────────────────────────────────────────');
  console.log('  ADDON MERGE COMPLETE');
  console.log(`  Products updated : ${totalUpdated}`);
  console.log(`  Products skipped : ${totalSkipped} (already had all new addons)`);
  console.log('─────────────────────────────────────────');
  console.log('\n  ✔  All done. No existing addon data was removed or overwritten.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('✘  Seed failed:', err.message);
  process.exit(1);
});
