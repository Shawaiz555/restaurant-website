require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'Bites_Restaurant';

// Default spice levels (no price field)
const defaultSpiceLevels = [
  { name: 'No Spice', description: 'No heat' },
  { name: 'Mild', description: 'Slightly spicy' },
  { name: 'Medium', description: 'Moderately spicy' },
  { name: 'Hot', description: 'Very spicy' },
  { name: 'Extra Hot', description: 'Extremely spicy' },
];

async function migrateSpiceLevels() {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`Database: ${DB_NAME}`);
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME
    });
    console.log('Connected successfully!\n');

    // Fetch all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Check if spiceLevels need to be added/updated
      if (!product.spiceLevels || product.spiceLevels.length === 0) {
        await Product.findByIdAndUpdate(
          product._id,
          { $set: { spiceLevels: defaultSpiceLevels } },
          { new: true }
        );

        updatedCount++;
        console.log(`✓ Updated: ${product.name} (${product.category})`);
        console.log(`  Added: ${defaultSpiceLevels.length} spice levels`);
      } else {
        skippedCount++;
        console.log(`- Skipped: ${product.name} (already has spice levels)`);
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`\nAll products now have default spice levels in the database.`);
    console.log(`You can now safely remove the addOnsData.js file completely.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the migration
migrateSpiceLevels();
