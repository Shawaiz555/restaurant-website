/**
 * migrateNutrition.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration: removes nutrition rows where value is empty/null so the
 * product detail page can correctly display real nutrition data.
 *
 * Run: node server/scripts/migrateNutrition.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected');
};

const Product = require('../models/Product');

const run = async () => {
  await connectDB();

  const products = await Product.find({});
  console.log(`Found ${products.length} products`);

  let updated = 0;

  for (const product of products) {
    if (!product.nutritionInfo || product.nutritionInfo.length === 0) continue;

    const cleaned = product.nutritionInfo.filter(
      (n) =>
        n.label && n.label.trim() !== '' &&
        n.value != null && String(n.value).trim() !== ''
    );

    if (cleaned.length !== product.nutritionInfo.length) {
      product.nutritionInfo = cleaned;
      await product.save();
      console.log(
        `  Updated "${product.name}": ${product.nutritionInfo.length} empty rows removed, ${cleaned.length} kept`
      );
      updated++;
    }
  }

  console.log(`\nDone — ${updated} products updated`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
