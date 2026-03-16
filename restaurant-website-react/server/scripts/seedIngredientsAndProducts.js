/**
 * Seed Script: Add missing stock ingredients + enrich product ingredient lists
 *
 * Safe to re-run — uses upsert for ingredients and only updates products
 * whose ingredient list differs from the target.
 *
 * Usage:
 *   node server/scripts/seedIngredientsAndProducts.js --dry-run
 *   node server/scripts/seedIngredientsAndProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Ingredient = require('../models/Ingredient');
const Product = require('../models/Product');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── New ingredients to add to stock ─────────────────────────────────────────
// Only items that are not already in the DB.
// unit / category must match the Ingredient schema enums.
const NEW_INGREDIENTS = [
  // Produce
  { name: 'Egg',          unit: 'pcs', category: 'Produce',   currentStock: 120, minimumStock: 30,  costPerUnit: 12  },
  { name: 'Mushroom',     unit: 'g',   category: 'Produce',   currentStock: 500, minimumStock: 100, costPerUnit: 0.5 },
  { name: 'Lettuce',      unit: 'g',   category: 'Produce',   currentStock: 800, minimumStock: 200, costPerUnit: 0.3 },
  { name: 'Cucumber',     unit: 'g',   category: 'Produce',   currentStock: 600, minimumStock: 150, costPerUnit: 0.4 },
  { name: 'Avocado',      unit: 'pcs', category: 'Produce',   currentStock: 30,  minimumStock: 10,  costPerUnit: 80  },
  { name: 'Lime',         unit: 'pcs', category: 'Produce',   currentStock: 50,  minimumStock: 10,  costPerUnit: 20  },
  { name: 'Banana',       unit: 'pcs', category: 'Produce',   currentStock: 40,  minimumStock: 10,  costPerUnit: 25  },
  { name: 'Strawberry',   unit: 'g',   category: 'Produce',   currentStock: 500, minimumStock: 100, costPerUnit: 1.5 },
  { name: 'Blueberry',    unit: 'g',   category: 'Produce',   currentStock: 400, minimumStock: 80,  costPerUnit: 2.0 },
  { name: 'Orange',       unit: 'pcs', category: 'Produce',   currentStock: 60,  minimumStock: 20,  costPerUnit: 30  },
  { name: 'Spinach',      unit: 'g',   category: 'Produce',   currentStock: 500, minimumStock: 100, costPerUnit: 0.4 },

  // Meat / Seafood
  { name: 'Shrimp',       unit: 'g',   category: 'Meat',      currentStock: 1000, minimumStock: 200, costPerUnit: 3.5 },
  { name: 'Salmon',       unit: 'g',   category: 'Meat',      currentStock: 800,  minimumStock: 200, costPerUnit: 5.0 },
  { name: 'Fish Fillet',  unit: 'g',   category: 'Meat',      currentStock: 800,  minimumStock: 200, costPerUnit: 2.5 },
  { name: 'Turkey Breast',unit: 'g',   category: 'Meat',      currentStock: 600,  minimumStock: 150, costPerUnit: 4.0 },
  { name: 'Bacon',        unit: 'g',   category: 'Meat',      currentStock: 500,  minimumStock: 100, costPerUnit: 5.0 },
  { name: 'Pork Belly',   unit: 'g',   category: 'Meat',      currentStock: 800,  minimumStock: 200, costPerUnit: 3.0 },

  // Dairy
  { name: 'Heavy Cream',  unit: 'ml',  category: 'Dairy',     currentStock: 2000, minimumStock: 500, costPerUnit: 0.3 },

  // Grains / Pasta
  { name: 'Pasta (Fettuccine)', unit: 'g', category: 'Grains', currentStock: 2000, minimumStock: 500, costPerUnit: 0.2 },
  { name: 'Pasta (Penne)',      unit: 'g', category: 'Grains', currentStock: 2000, minimumStock: 500, costPerUnit: 0.2 },
  { name: 'Ramen Noodles',      unit: 'g', category: 'Grains', currentStock: 1500, minimumStock: 300, costPerUnit: 0.3 },
  { name: 'Rice Noodles',       unit: 'g', category: 'Grains', currentStock: 1500, minimumStock: 300, costPerUnit: 0.25},
  { name: 'Egg Noodles',        unit: 'g', category: 'Grains', currentStock: 1500, minimumStock: 300, costPerUnit: 0.25},
  { name: 'Udon Noodles',       unit: 'g', category: 'Grains', currentStock: 1000, minimumStock: 200, costPerUnit: 0.4 },
  { name: 'Sushi Rice',         unit: 'g', category: 'Grains', currentStock: 2000, minimumStock: 500, costPerUnit: 0.3 },
  { name: 'Quinoa',             unit: 'g', category: 'Grains', currentStock: 1000, minimumStock: 200, costPerUnit: 0.6 },
  { name: 'Bread Bun',          unit: 'pcs', category: 'Grains', currentStock: 80,  minimumStock: 20,  costPerUnit: 25 },
  { name: 'Toast Bread',        unit: 'pcs', category: 'Grains', currentStock: 60,  minimumStock: 15,  costPerUnit: 15 },

  // Spices / Condiments
  { name: 'Sugar',         unit: 'g',  category: 'Spices',    currentStock: 3000, minimumStock: 500, costPerUnit: 0.05 },
  { name: 'Baking Powder', unit: 'g',  category: 'Spices',    currentStock: 500,  minimumStock: 100, costPerUnit: 0.2  },
  { name: 'Vanilla Extract', unit: 'ml', category: 'Spices',  currentStock: 200,  minimumStock: 50,  costPerUnit: 1.5  },
  { name: 'Soy Sauce',     unit: 'ml', category: 'Spices',    currentStock: 1000, minimumStock: 200, costPerUnit: 0.15 },
  { name: 'Oyster Sauce',  unit: 'ml', category: 'Spices',    currentStock: 500,  minimumStock: 100, costPerUnit: 0.4  },
  { name: 'Tahini',        unit: 'g',  category: 'Spices',    currentStock: 500,  minimumStock: 100, costPerUnit: 1.0  },
  { name: 'Sesame Seeds',  unit: 'g',  category: 'Spices',    currentStock: 300,  minimumStock: 50,  costPerUnit: 0.5  },
  { name: 'Oregano',       unit: 'g',  category: 'Spices',    currentStock: 200,  minimumStock: 30,  costPerUnit: 0.5  },
  { name: 'Basil',         unit: 'g',  category: 'Spices',    currentStock: 150,  minimumStock: 30,  costPerUnit: 0.8  },
  { name: 'Paprika',       unit: 'g',  category: 'Spices',    currentStock: 300,  minimumStock: 50,  costPerUnit: 0.4  },
  { name: 'Wasabi',        unit: 'g',  category: 'Spices',    currentStock: 200,  minimumStock: 30,  costPerUnit: 2.0  },
  { name: 'Miso Paste',    unit: 'g',  category: 'Spices',    currentStock: 500,  minimumStock: 100, costPerUnit: 1.2  },

  // Other
  { name: 'Olive Oil',     unit: 'ml', category: 'Other',     currentStock: 2000, minimumStock: 500, costPerUnit: 0.5  },
  { name: 'Mayonnaise',    unit: 'g',  category: 'Other',     currentStock: 1000, minimumStock: 200, costPerUnit: 0.4  },
  { name: 'Ketchup',       unit: 'g',  category: 'Other',     currentStock: 1000, minimumStock: 200, costPerUnit: 0.3  },
  { name: 'Mustard',       unit: 'g',  category: 'Other',     currentStock: 500,  minimumStock: 100, costPerUnit: 0.4  },
  { name: 'Pickles',       unit: 'g',  category: 'Other',     currentStock: 500,  minimumStock: 100, costPerUnit: 0.5  },
  { name: 'Maple Syrup',   unit: 'ml', category: 'Other',     currentStock: 500,  minimumStock: 100, costPerUnit: 2.0  },
  { name: 'Honey',         unit: 'g',  category: 'Other',     currentStock: 500,  minimumStock: 100, costPerUnit: 1.5  },

  // Beverages
  { name: 'Espresso',      unit: 'ml', category: 'Beverages', currentStock: 2000, minimumStock: 500, costPerUnit: 1.0 },
  { name: 'Soda Water',    unit: 'ml', category: 'Beverages', currentStock: 3000, minimumStock: 500, costPerUnit: 0.1 },
  { name: 'Mint Leaves',   unit: 'g',  category: 'Produce',   currentStock: 200,  minimumStock: 30,  costPerUnit: 1.0 },
  { name: 'Coconut Milk',  unit: 'ml', category: 'Beverages', currentStock: 2000, minimumStock: 400, costPerUnit: 0.5 },
];

// ─── Target ingredient lists per product (name must match DB exactly) ────────
// These use the existing 36 ingredients + the NEW_INGREDIENTS above.
const PRODUCT_INGREDIENTS = {
  // Popular Dishes
  'Pasta':            ['Pasta (Penne)', 'Tomato', 'Garlic', 'Olive Oil', 'Basil', 'Cheese (Processed)', 'Salt', 'Black Pepper'],
  'French Fries':     ['Potato', 'Cooking Oil', 'Salt', 'Paprika', 'Garam Masala'],
  'Chicken Shawarma': ['Chicken Breast', 'Bread (Naan)', 'Tomato', 'Onion', 'Garlic', 'Yogurt', 'Garam Masala', 'Turmeric Powder'],
  'Fish Curry':       ['Fish Fillet', 'Coconut Milk', 'Tomato', 'Onion', 'Garlic', 'Ginger', 'Turmeric Powder', 'Red Chilli Powder', 'Garam Masala', 'Cooking Oil'],

  // Breakfast
  'Fluffy Pancakes':  ['All-Purpose Flour', 'Egg', 'Milk', 'Butter', 'Sugar', 'Baking Powder', 'Vanilla Extract', 'Maple Syrup'],
  'Fresh Croissant':  ['All-Purpose Flour', 'Butter', 'Milk', 'Sugar', 'Salt', 'Egg'],
  'Yogurt Parfait':   ['Yogurt', 'Honey', 'Blueberry', 'Strawberry'],
  'Classic Omelette': ['Egg', 'Cheese (Processed)', 'Bell Pepper', 'Onion', 'Mushroom', 'Butter', 'Salt', 'Black Pepper'],
  'Blueberry Muffin': ['All-Purpose Flour', 'Blueberry', 'Sugar', 'Egg', 'Butter', 'Vanilla Extract', 'Baking Powder'],

  // Noodles
  'Spicy Miso Ramen':  ['Ramen Noodles', 'Miso Paste', 'Pork Belly', 'Egg', 'Onion', 'Ginger', 'Garlic', 'Soy Sauce', 'Cooking Oil', 'Red Chilli Powder'],
  'Shrimp Pad Thai':   ['Rice Noodles', 'Shrimp', 'Egg', 'Onion', 'Garlic', 'Soy Sauce', 'Cooking Oil', 'Lime'],
  'Beef Chow Mein':    ['Egg Noodles', 'Beef Mince', 'Onion', 'Garlic', 'Soy Sauce', 'Oyster Sauce', 'Cooking Oil', 'Black Pepper'],
  'Udon Noodle Soup':  ['Udon Noodles', 'Shrimp', 'Onion', 'Soy Sauce', 'Cooking Oil', 'Ginger', 'Garlic'],

  // Salads
  'Chicken Caesar':    ['Chicken Breast', 'Lettuce', 'Cheese (Processed)', 'Olive Oil', 'Lemon', 'Garlic', 'Black Pepper'],
  'Greek Salad':       ['Tomato', 'Cucumber', 'Cheese (Processed)', 'Onion', 'Olive Oil', 'Oregano', 'Salt', 'Black Pepper'],
  'Cobb Salad':        ['Chicken Breast', 'Lettuce', 'Bacon', 'Avocado', 'Egg', 'Tomato', 'Cheese (Processed)'],
  'Quinoa Power Bowl': ['Quinoa', 'Chickpeas (Dried)', 'Spinach', 'Avocado', 'Lemon', 'Olive Oil', 'Salt', 'Black Pepper'],

  // Japanese
  'Sushi Platter':   ['Sushi Rice', 'Salmon', 'Shrimp', 'Avocado', 'Cucumber', 'Wasabi', 'Ginger', 'Soy Sauce'],
  'Tempura Set':     ['Shrimp', 'All-Purpose Flour', 'Egg', 'Soy Sauce', 'Basmati Rice', 'Ginger'],
  'Salmon Sashimi':  ['Salmon', 'Wasabi', 'Ginger', 'Soy Sauce'],

  // Drinks
  'Iced Latte':      ['Espresso', 'Milk', 'Sugar'],
  'Mint Mojito':     ['Lime', 'Sugar', 'Soda Water', 'Mint Leaves'],
  'Berry Smoothie':  ['Strawberry', 'Blueberry', 'Banana', 'Yogurt', 'Honey', 'Milk'],
  'Fresh Juice':     ['Orange', 'Lemon'],

  // Burgers
  'Classic Burger':  ['Beef Mince', 'Bread Bun', 'Lettuce', 'Tomato', 'Onion', 'Cheese (Processed)', 'Pickles', 'Ketchup', 'Mayonnaise'],
  'Chicken Burger':  ['Chicken Breast', 'Bread Bun', 'Lettuce', 'Tomato', 'Onion', 'Mayonnaise', 'Ketchup'],

  // Lunch
  'Club Sandwich':   ['Turkey Breast', 'Bacon', 'Lettuce', 'Tomato', 'Cheese (Processed)', 'Mayonnaise', 'Mustard', 'Toast Bread'],
  'Grilled Steak':   ['Boneless Beef', 'Potato', 'Butter', 'Garlic', 'Salt', 'Black Pepper', 'Olive Oil'],
  'Creamy Pasta':    ['Pasta (Fettuccine)', 'Cream', 'Cheese (Processed)', 'Chicken Breast', 'Garlic', 'Butter', 'Salt', 'Black Pepper'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) { console.error('ERROR: MONGODB_URI not set'); process.exit(1); }
  const dbName = process.env.DB_NAME;
  if (dbName) {
    uri = uri.replace(
      /(mongodb(?:\+srv)?:\/\/[^/]+)(\/[^?]*)?(.*)/,
      (_, host, _path, rest) => `${host}/${dbName}${rest}`,
    );
  }
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB\n');

  // ── 1. Upsert new ingredients ─────────────────────────────────────────────
  console.log('─'.repeat(70));
  console.log('STEP 1 — Stock ingredients\n');

  const existing = await Ingredient.find({}, 'name').lean();
  const existingNames = new Set(existing.map((i) => i.name));

  const toAdd = NEW_INGREDIENTS.filter((i) => !existingNames.has(i.name));
  const alreadyPresent = NEW_INGREDIENTS.filter((i) => existingNames.has(i.name));

  console.log(`  Already in stock : ${alreadyPresent.length} ingredients`);
  console.log(`  To be added      : ${toAdd.length} ingredients`);
  if (toAdd.length) {
    toAdd.forEach((i) => console.log(`    + ${i.name} [${i.category}]`));
  }

  if (!DRY_RUN && toAdd.length > 0) {
    await Ingredient.insertMany(toAdd);
    console.log(`\n  ✓ Inserted ${toAdd.length} new ingredient(s)`);
  }

  // Reload full ingredient list (after potential inserts)
  const allIngredients = await Ingredient.find({}, 'name').lean();
  const allIngNames = new Set(allIngredients.map((i) => i.name));

  // ── 2. Enrich product ingredient lists ────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('STEP 2 — Product ingredient lists\n');

  const products = await Product.find({}, 'name ingredients').lean();
  const productMap = Object.fromEntries(products.map((p) => [p.name, p]));

  let updatedCount = 0;
  const unknownIngredients = new Set();

  for (const [productName, targetList] of Object.entries(PRODUCT_INGREDIENTS)) {
    const product = productMap[productName];
    if (!product) {
      console.log(`  ⚠  Product not found: "${productName}" — skipped`);
      continue;
    }

    // Validate all target ingredients exist in stock
    const invalid = targetList.filter((name) => !allIngNames.has(name));
    if (invalid.length > 0) {
      invalid.forEach((n) => unknownIngredients.add(n));
      console.log(`  ✗  "${productName}" — unknown ingredient(s): ${invalid.join(', ')}`);
      continue;
    }

    const current = product.ingredients || [];
    if (arraysEqual(current, targetList)) {
      console.log(`  ✓  "${productName}" already correct`);
      continue;
    }

    console.log(`  📝 "${productName}"`);
    console.log(`       Before: [${current.join(', ') || '(none)'}]`);
    console.log(`       After:  [${targetList.join(', ')}]`);

    if (!DRY_RUN) {
      await Product.findByIdAndUpdate(
        product._id,
        { $set: { ingredients: targetList } },
        { runValidators: false },
      );
    }
    updatedCount++;
  }

  if (unknownIngredients.size > 0) {
    console.log(`\n  ⚠  The following ingredient names are in PRODUCT_INGREDIENTS but not in stock:`);
    [...unknownIngredients].forEach((n) => console.log(`     • ${n}`));
    console.log('     Add them to NEW_INGREDIENTS and re-run.\n');
  }

  console.log(`\n  Products to update: ${updatedCount}`);

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No changes written. Remove --dry-run to apply.\n');
  } else {
    console.log('\n✓ Done.\n');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('\nSeed failed:', err.message || err);
  process.exit(1);
});
