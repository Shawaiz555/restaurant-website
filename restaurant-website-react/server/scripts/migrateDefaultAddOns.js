require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'Bites_Restaurant';

// Default add-ons data (copied from addOnsData.js)
const defaultAddOns = {
  drinks: [
    { name: 'Coca Cola (350ml)', price: 3.00, description: '' },
    { name: 'Pepsi (350ml)', price: 3.00, description: '' },
    { name: 'Sprite (350ml)', price: 3.00, description: '' },
    { name: 'Sting (350ml)', price: 3.50, description: '' },
    { name: 'Mirinda (350ml)', price: 3.00, description: '' },
    { name: 'Fresh Orange Juice (1 Glass)', price: 5.00, description: '' },
    { name: 'Mineral Water (350ml)', price: 2.00, description: '' },
  ],
  desserts: [
    { name: 'Chocolate Brownie', price: 4.50, description: '' },
    { name: 'Ice Cream Scoop', price: 3.00, description: '' },
    { name: 'Cheesecake Slice', price: 5.50, description: '' },
    { name: 'Tiramisu', price: 6.00, description: '' },
  ],
  extras: [
    { name: 'Extra Cheese', price: 2.00, description: '' },
    { name: 'Extra Sauce', price: 1.50, description: '' },
    { name: 'Garlic Bread', price: 3.50, description: '' },
    { name: 'Side Salad', price: 4.00, description: '' },
  ],
};

async function migrateDefaultAddOns() {
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
      let needsUpdate = false;
      const updateData = {};

      // Check if drinks need to be added/updated
      if (!product.drinks || product.drinks.length === 0) {
        updateData.drinks = defaultAddOns.drinks;
        needsUpdate = true;
      }

      // Check if desserts need to be added/updated
      if (!product.desserts || product.desserts.length === 0) {
        updateData.desserts = defaultAddOns.desserts;
        needsUpdate = true;
      }

      // Check if extras need to be added/updated
      if (!product.extras || product.extras.length === 0) {
        updateData.extras = defaultAddOns.extras;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Product.findByIdAndUpdate(
          product._id,
          { $set: updateData },
          { new: true }
        );

        updatedCount++;
        console.log(`✓ Updated: ${product.name} (${product.category})`);

        const updates = [];
        if (updateData.drinks) updates.push(`${updateData.drinks.length} drinks`);
        if (updateData.desserts) updates.push(`${updateData.desserts.length} desserts`);
        if (updateData.extras) updates.push(`${updateData.extras.length} extras`);
        console.log(`  Added: ${updates.join(', ')}`);
      } else {
        skippedCount++;
        console.log(`- Skipped: ${product.name} (already has add-ons)`);
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`\nAll products now have default add-ons in the database.`);
    console.log(`You can now safely remove the static addOnsData.js file.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the migration
migrateDefaultAddOns();
