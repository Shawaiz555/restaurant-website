/**
 * cleanProductAddons.js
 * Removes old static addon entries from all products that do NOT match
 * any AddonStock name, leaving only the correctly-named entries that
 * can be matched for stock deduction on orders.
 * Run: node server/scripts/cleanProductAddons.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME }).then(async () => {
  const Product    = require('../models/Product');
  const AddonStock = require('../models/AddonStock');

  // Build sets of valid names per type
  const drinks   = await AddonStock.find({ addonType: 'Drink' },   'name');
  const desserts = await AddonStock.find({ addonType: 'Dessert' }, 'name');
  const extras   = await AddonStock.find({ addonType: 'Extra' },   'name');

  const validDrinks   = new Set(drinks.map(d => d.name.toLowerCase()));
  const validDesserts = new Set(desserts.map(d => d.name.toLowerCase()));
  const validExtras   = new Set(extras.map(d => d.name.toLowerCase()));

  console.log('Valid drinks:',   [...validDrinks]);
  console.log('Valid desserts:', [...validDesserts]);
  console.log('Valid extras:',   [...validExtras]);

  const products = await Product.find({});
  let updated = 0;

  for (const product of products) {
    const before = {
      drinks:   product.drinks.length,
      desserts: product.desserts.length,
      extras:   product.extras.length,
    };

    product.drinks   = product.drinks.filter(d => validDrinks.has(d.name.toLowerCase()));
    product.desserts = product.desserts.filter(d => validDesserts.has(d.name.toLowerCase()));
    product.extras   = product.extras.filter(d => validExtras.has(d.name.toLowerCase()));

    const changed =
      product.drinks.length   !== before.drinks ||
      product.desserts.length !== before.desserts ||
      product.extras.length   !== before.extras;

    if (changed) {
      await product.save();
      console.log(`Updated "${product.name}": drinks ${before.drinks}->${product.drinks.length}, desserts ${before.desserts}->${product.desserts.length}, extras ${before.extras}->${product.extras.length}`);
      updated++;
    }
  }

  console.log(`\nDone — ${updated} products cleaned`);
  mongoose.disconnect();
});
