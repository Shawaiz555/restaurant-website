/**
 * seedNutrition.js
 * Fills realistic nutrition info for all 29 products.
 * Run: node server/scripts/seedNutrition.js
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

// nutrition: [{ label, value, unit }]
const NUTRITION_MAP = {
  'Pasta': [
    { label: 'Calories', value: '420', unit: 'kcal' },
    { label: 'Protein', value: '14', unit: 'g' },
    { label: 'Carbs', value: '68', unit: 'g' },
    { label: 'Fat', value: '11', unit: 'g' },
  ],
  'French Fries': [
    { label: 'Calories', value: '365', unit: 'kcal' },
    { label: 'Protein', value: '4', unit: 'g' },
    { label: 'Carbs', value: '48', unit: 'g' },
    { label: 'Fat', value: '18', unit: 'g' },
  ],
  'Chicken Shawarma': [
    { label: 'Calories', value: '510', unit: 'kcal' },
    { label: 'Protein', value: '34', unit: 'g' },
    { label: 'Carbs', value: '42', unit: 'g' },
    { label: 'Fat', value: '20', unit: 'g' },
  ],
  'Fish Curry': [
    { label: 'Calories', value: '380', unit: 'kcal' },
    { label: 'Protein', value: '28', unit: 'g' },
    { label: 'Carbs', value: '22', unit: 'g' },
    { label: 'Fat', value: '17', unit: 'g' },
  ],
  'Fluffy Pancakes': [
    { label: 'Calories', value: '450', unit: 'kcal' },
    { label: 'Protein', value: '10', unit: 'g' },
    { label: 'Carbs', value: '72', unit: 'g' },
    { label: 'Fat', value: '14', unit: 'g' },
  ],
  'Fresh Croissant': [
    { label: 'Calories', value: '310', unit: 'kcal' },
    { label: 'Protein', value: '6', unit: 'g' },
    { label: 'Carbs', value: '36', unit: 'g' },
    { label: 'Fat', value: '16', unit: 'g' },
  ],
  'Yogurt Parfait': [
    { label: 'Calories', value: '280', unit: 'kcal' },
    { label: 'Protein', value: '12', unit: 'g' },
    { label: 'Carbs', value: '42', unit: 'g' },
    { label: 'Fat', value: '6', unit: 'g' },
  ],
  'Classic Omelette': [
    { label: 'Calories', value: '340', unit: 'kcal' },
    { label: 'Protein', value: '22', unit: 'g' },
    { label: 'Carbs', value: '8', unit: 'g' },
    { label: 'Fat', value: '24', unit: 'g' },
  ],
  'Blueberry Muffin': [
    { label: 'Calories', value: '380', unit: 'kcal' },
    { label: 'Protein', value: '5', unit: 'g' },
    { label: 'Carbs', value: '58', unit: 'g' },
    { label: 'Fat', value: '14', unit: 'g' },
  ],
  'Spicy Miso Ramen': [
    { label: 'Calories', value: '520', unit: 'kcal' },
    { label: 'Protein', value: '26', unit: 'g' },
    { label: 'Carbs', value: '62', unit: 'g' },
    { label: 'Fat', value: '16', unit: 'g' },
  ],
  'Shrimp Pad Thai': [
    { label: 'Calories', value: '490', unit: 'kcal' },
    { label: 'Protein', value: '28', unit: 'g' },
    { label: 'Carbs', value: '58', unit: 'g' },
    { label: 'Fat', value: '14', unit: 'g' },
  ],
  'Beef Chow Mein': [
    { label: 'Calories', value: '540', unit: 'kcal' },
    { label: 'Protein', value: '30', unit: 'g' },
    { label: 'Carbs', value: '60', unit: 'g' },
    { label: 'Fat', value: '18', unit: 'g' },
  ],
  'Udon Noodle Soup': [
    { label: 'Calories', value: '410', unit: 'kcal' },
    { label: 'Protein', value: '18', unit: 'g' },
    { label: 'Carbs', value: '64', unit: 'g' },
    { label: 'Fat', value: '8', unit: 'g' },
  ],
  'Chicken Caesar': [
    { label: 'Calories', value: '390', unit: 'kcal' },
    { label: 'Protein', value: '32', unit: 'g' },
    { label: 'Carbs', value: '18', unit: 'g' },
    { label: 'Fat', value: '22', unit: 'g' },
  ],
  'Greek Salad': [
    { label: 'Calories', value: '240', unit: 'kcal' },
    { label: 'Protein', value: '8', unit: 'g' },
    { label: 'Carbs', value: '16', unit: 'g' },
    { label: 'Fat', value: '16', unit: 'g' },
  ],
  'Cobb Salad': [
    { label: 'Calories', value: '460', unit: 'kcal' },
    { label: 'Protein', value: '36', unit: 'g' },
    { label: 'Carbs', value: '14', unit: 'g' },
    { label: 'Fat', value: '28', unit: 'g' },
  ],
  'Quinoa Power Bowl': [
    { label: 'Calories', value: '420', unit: 'kcal' },
    { label: 'Protein', value: '18', unit: 'g' },
    { label: 'Carbs', value: '52', unit: 'g' },
    { label: 'Fat', value: '14', unit: 'g' },
  ],
  'Sushi Platter': [
    { label: 'Calories', value: '480', unit: 'kcal' },
    { label: 'Protein', value: '26', unit: 'g' },
    { label: 'Carbs', value: '70', unit: 'g' },
    { label: 'Fat', value: '8', unit: 'g' },
  ],
  'Tempura Set': [
    { label: 'Calories', value: '560', unit: 'kcal' },
    { label: 'Protein', value: '22', unit: 'g' },
    { label: 'Carbs', value: '66', unit: 'g' },
    { label: 'Fat', value: '22', unit: 'g' },
  ],
  'Salmon Sashimi': [
    { label: 'Calories', value: '280', unit: 'kcal' },
    { label: 'Protein', value: '32', unit: 'g' },
    { label: 'Carbs', value: '2', unit: 'g' },
    { label: 'Fat', value: '16', unit: 'g' },
  ],
  'Iced Latte': [
    { label: 'Calories', value: '180', unit: 'kcal' },
    { label: 'Protein', value: '6', unit: 'g' },
    { label: 'Carbs', value: '24', unit: 'g' },
    { label: 'Fat', value: '6', unit: 'g' },
  ],
  'Mint Mojito': [
    { label: 'Calories', value: '140', unit: 'kcal' },
    { label: 'Protein', value: '0', unit: 'g' },
    { label: 'Carbs', value: '36', unit: 'g' },
    { label: 'Fat', value: '0', unit: 'g' },
  ],
  'Berry Smoothie': [
    { label: 'Calories', value: '220', unit: 'kcal' },
    { label: 'Protein', value: '4', unit: 'g' },
    { label: 'Carbs', value: '46', unit: 'g' },
    { label: 'Fat', value: '2', unit: 'g' },
  ],
  'Fresh Juice': [
    { label: 'Calories', value: '120', unit: 'kcal' },
    { label: 'Protein', value: '2', unit: 'g' },
    { label: 'Carbs', value: '28', unit: 'g' },
    { label: 'Fat', value: '0', unit: 'g' },
  ],
  'Classic Burger': [
    { label: 'Calories', value: '620', unit: 'kcal' },
    { label: 'Protein', value: '36', unit: 'g' },
    { label: 'Carbs', value: '52', unit: 'g' },
    { label: 'Fat', value: '28', unit: 'g' },
  ],
  'Chicken Burger': [
    { label: 'Calories', value: '560', unit: 'kcal' },
    { label: 'Protein', value: '38', unit: 'g' },
    { label: 'Carbs', value: '48', unit: 'g' },
    { label: 'Fat', value: '22', unit: 'g' },
  ],
  'Club Sandwich': [
    { label: 'Calories', value: '540', unit: 'kcal' },
    { label: 'Protein', value: '34', unit: 'g' },
    { label: 'Carbs', value: '46', unit: 'g' },
    { label: 'Fat', value: '22', unit: 'g' },
  ],
  'Grilled Steak': [
    { label: 'Calories', value: '680', unit: 'kcal' },
    { label: 'Protein', value: '54', unit: 'g' },
    { label: 'Carbs', value: '8', unit: 'g' },
    { label: 'Fat', value: '46', unit: 'g' },
  ],
  'Creamy Pasta': [
    { label: 'Calories', value: '580', unit: 'kcal' },
    { label: 'Protein', value: '18', unit: 'g' },
    { label: 'Carbs', value: '72', unit: 'g' },
    { label: 'Fat', value: '24', unit: 'g' },
  ],
};

const run = async () => {
  await connectDB();

  const products = await Product.find({});
  let updated = 0;

  for (const product of products) {
    const nutrition = NUTRITION_MAP[product.name];
    if (!nutrition) {
      console.log(`  SKIPPED (no data defined): ${product.name}`);
      continue;
    }

    product.nutritionInfo = nutrition;
    await product.save();
    console.log(`  Updated: ${product.name}`);
    updated++;
  }

  console.log(`\nDone — ${updated} products updated with nutrition info`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
