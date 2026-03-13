/**
 * seedStockData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Safe seed script — ONLY inserts data, NEVER deletes or modifies anything.
 *
 * What it does:
 *  1. Connects to MongoDB using the same .env as the server
 *  2. Finds the first admin user (for `createdBy` fields)
 *  3. Fetches real Product documents so recipes reference actual product IDs
 *  4. Inserts (with duplicate-guard): Ingredients → Suppliers → Recipes →
 *     Purchases (triggers stock increment hooks) → Wastage (triggers stock
 *     decrement hooks)
 *
 * Safety guarantees:
 *  • Uses insertMany / save — zero deleteMany / updateMany calls
 *  • Before every collection insert it counts existing docs; if count > 0 it
 *    skips that section (idempotent re-runs)
 *  • Never touches Products, Orders, Users, Deals, Tables, Reservations,
 *    Expenses or any other existing collection
 *  • Stock is managed by existing Mongoose post-save hooks — no manual stock
 *    manipulation here
 *
 * Usage:
 *   node server/scripts/seedStockData.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ── Models ──────────────────────────────────────────────────────────────────
const Ingredient = require('../models/Ingredient');
const Supplier   = require('../models/Supplier');
const Purchase   = require('../models/Purchase');
const Recipe     = require('../models/Recipe');
const Wastage    = require('../models/Wastage');
const Product    = require('../models/Product');
const User       = require('../models/User');

// ── Helpers ──────────────────────────────────────────────────────────────────
const daysAgo  = (n) => new Date(Date.now() - n * 86400000);
const rand     = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick     = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────────────────────────────────────────────
// 1. INGREDIENT DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const INGREDIENT_DEFS = [
  // Meat
  { name: 'Chicken Breast',       unit: 'kg',   category: 'Meat',      costPerUnit: 650,  minimumStock: 5  },
  { name: 'Chicken Thighs',       unit: 'kg',   category: 'Meat',      costPerUnit: 580,  minimumStock: 5  },
  { name: 'Beef Mince',           unit: 'kg',   category: 'Meat',      costPerUnit: 1100, minimumStock: 3  },
  { name: 'Mutton Leg',           unit: 'kg',   category: 'Meat',      costPerUnit: 1600, minimumStock: 2  },
  { name: 'Boneless Beef',        unit: 'kg',   category: 'Meat',      costPerUnit: 1250, minimumStock: 3  },
  // Produce
  { name: 'Onion',                unit: 'kg',   category: 'Produce',   costPerUnit: 80,   minimumStock: 5  },
  { name: 'Tomato',               unit: 'kg',   category: 'Produce',   costPerUnit: 90,   minimumStock: 5  },
  { name: 'Garlic',               unit: 'kg',   category: 'Produce',   costPerUnit: 300,  minimumStock: 2  },
  { name: 'Ginger',               unit: 'kg',   category: 'Produce',   costPerUnit: 280,  minimumStock: 2  },
  { name: 'Green Chilli',         unit: 'kg',   category: 'Produce',   costPerUnit: 150,  minimumStock: 1  },
  { name: 'Coriander Leaves',     unit: 'kg',   category: 'Produce',   costPerUnit: 200,  minimumStock: 1  },
  { name: 'Lemon',                unit: 'pcs',  category: 'Produce',   costPerUnit: 10,   minimumStock: 20 },
  { name: 'Bell Pepper',          unit: 'kg',   category: 'Produce',   costPerUnit: 220,  minimumStock: 2  },
  { name: 'Potato',               unit: 'kg',   category: 'Produce',   costPerUnit: 70,   minimumStock: 4  },
  // Dairy
  { name: 'Yogurt',               unit: 'kg',   category: 'Dairy',     costPerUnit: 180,  minimumStock: 3  },
  { name: 'Cream',                unit: 'L',    category: 'Dairy',     costPerUnit: 350,  minimumStock: 2  },
  { name: 'Butter',               unit: 'kg',   category: 'Dairy',     costPerUnit: 900,  minimumStock: 1  },
  { name: 'Cheese (Processed)',   unit: 'kg',   category: 'Dairy',     costPerUnit: 1100, minimumStock: 1  },
  // Grains
  { name: 'Basmati Rice',         unit: 'kg',   category: 'Grains',    costPerUnit: 220,  minimumStock: 10 },
  { name: 'All-Purpose Flour',    unit: 'kg',   category: 'Grains',    costPerUnit: 110,  minimumStock: 5  },
  { name: 'Chickpeas (Dried)',    unit: 'kg',   category: 'Grains',    costPerUnit: 200,  minimumStock: 3  },
  { name: 'Lentils (Red)',        unit: 'kg',   category: 'Grains',    costPerUnit: 180,  minimumStock: 3  },
  { name: 'Bread (Naan)',         unit: 'pcs',  category: 'Grains',    costPerUnit: 30,   minimumStock: 20 },
  // Spices
  { name: 'Cumin Seeds',          unit: 'g',    category: 'Spices',    costPerUnit: 2,    minimumStock: 200 },
  { name: 'Coriander Powder',     unit: 'g',    category: 'Spices',    costPerUnit: 1.5,  minimumStock: 200 },
  { name: 'Red Chilli Powder',    unit: 'g',    category: 'Spices',    costPerUnit: 1.8,  minimumStock: 200 },
  { name: 'Turmeric Powder',      unit: 'g',    category: 'Spices',    costPerUnit: 1.2,  minimumStock: 100 },
  { name: 'Garam Masala',         unit: 'g',    category: 'Spices',    costPerUnit: 2.5,  minimumStock: 150 },
  { name: 'Salt',                 unit: 'g',    category: 'Spices',    costPerUnit: 0.3,  minimumStock: 500 },
  { name: 'Black Pepper',         unit: 'g',    category: 'Spices',    costPerUnit: 3,    minimumStock: 100 },
  { name: 'Cardamom',             unit: 'g',    category: 'Spices',    costPerUnit: 8,    minimumStock: 50  },
  // Oil
  { name: 'Cooking Oil',          unit: 'L',    category: 'Other',     costPerUnit: 320,  minimumStock: 5  },
  // Beverages
  { name: 'Milk',                 unit: 'L',    category: 'Beverages', costPerUnit: 150,  minimumStock: 3  },
  { name: 'Mango Pulp',           unit: 'L',    category: 'Beverages', costPerUnit: 250,  minimumStock: 2  },
  { name: 'Rose Syrup',           unit: 'L',    category: 'Beverages', costPerUnit: 180,  minimumStock: 1  },
  { name: 'Cola Concentrate',     unit: 'L',    category: 'Beverages', costPerUnit: 400,  minimumStock: 1  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. SUPPLIER DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const SUPPLIER_DEFS = [
  { name: 'Al-Raheem Meat Shop',      phone: '0300-1234567', email: 'alraheem@supplier.pk',   address: 'Gulshan-e-Iqbal, Karachi', isActive: true  },
  { name: 'Fresh Farms Vegetables',   phone: '0321-9876543', email: 'freshfarms@agri.pk',     address: 'Sabzi Mandi, Lahore',     isActive: true  },
  { name: 'Punjab Dairy Products',    phone: '0333-5556789', email: 'punjabdairy@dairy.pk',   address: 'Raiwind Road, Lahore',    isActive: true  },
  { name: 'National Spice Traders',   phone: '0312-4441122', email: 'spicetraders@pk.com',    address: 'Jodia Bazaar, Karachi',   isActive: true  },
  { name: 'Golden Grain Suppliers',   phone: '0345-7778899', email: 'goldengrain@grains.pk',  address: 'Grain Market, Faisalabad',isActive: true  },
  { name: 'Pak Beverages Wholesale',  phone: '0301-2223344', email: 'pakbev@beverages.pk',    address: 'SITE Area, Karachi',      isActive: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. RECIPE TEMPLATES  (matched by keywords in product name/category)
//    Each entry: { keywords, ingredients: [{name, qty}] }
//    The seed will find the best-matching product for each template.
// ─────────────────────────────────────────────────────────────────────────────
const RECIPE_TEMPLATES = [
  {
    keywords: ['biryani', 'rice'],
    ingredients: [
      { name: 'Chicken Breast',    qty: 0.3  },
      { name: 'Basmati Rice',      qty: 0.25 },
      { name: 'Yogurt',            qty: 0.1  },
      { name: 'Onion',             qty: 0.1  },
      { name: 'Garam Masala',      qty: 5    },
      { name: 'Cumin Seeds',       qty: 3    },
      { name: 'Cooking Oil',       qty: 0.04 },
    ]
  },
  {
    keywords: ['karahi', 'curry', 'chicken'],
    ingredients: [
      { name: 'Chicken Breast',    qty: 0.35 },
      { name: 'Tomato',            qty: 0.2  },
      { name: 'Onion',             qty: 0.1  },
      { name: 'Garlic',            qty: 0.02 },
      { name: 'Ginger',            qty: 0.02 },
      { name: 'Red Chilli Powder', qty: 4    },
      { name: 'Coriander Powder',  qty: 3    },
      { name: 'Cooking Oil',       qty: 0.05 },
    ]
  },
  {
    keywords: ['beef', 'mutton', 'nihari', 'haleem'],
    ingredients: [
      { name: 'Boneless Beef',     qty: 0.35 },
      { name: 'Onion',             qty: 0.15 },
      { name: 'Ginger',            qty: 0.02 },
      { name: 'Garlic',            qty: 0.02 },
      { name: 'Garam Masala',      qty: 5    },
      { name: 'Red Chilli Powder', qty: 5    },
      { name: 'Cooking Oil',       qty: 0.05 },
    ]
  },
  {
    keywords: ['burger', 'wrap', 'sandwich', 'roll'],
    ingredients: [
      { name: 'Chicken Thighs',    qty: 0.2  },
      { name: 'All-Purpose Flour', qty: 0.1  },
      { name: 'Yogurt',            qty: 0.05 },
      { name: 'Onion',             qty: 0.05 },
      { name: 'Bell Pepper',       qty: 0.05 },
      { name: 'Garlic',            qty: 0.01 },
      { name: 'Cooking Oil',       qty: 0.03 },
    ]
  },
  {
    keywords: ['daal', 'lentil', 'chana', 'chickpea'],
    ingredients: [
      { name: 'Chickpeas (Dried)', qty: 0.2  },
      { name: 'Tomato',            qty: 0.15 },
      { name: 'Onion',             qty: 0.1  },
      { name: 'Garlic',            qty: 0.015 },
      { name: 'Turmeric Powder',   qty: 2    },
      { name: 'Cumin Seeds',       qty: 3    },
      { name: 'Cooking Oil',       qty: 0.04 },
    ]
  },
  {
    keywords: ['naan', 'roti', 'bread', 'paratha'],
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.15 },
      { name: 'Yogurt',            qty: 0.05 },
      { name: 'Butter',            qty: 0.02 },
      { name: 'Salt',              qty: 3    },
    ]
  },
  {
    keywords: ['shawarma', 'tikka', 'bbq', 'barbeque', 'kabab', 'kebab'],
    ingredients: [
      { name: 'Chicken Thighs',    qty: 0.3  },
      { name: 'Yogurt',            qty: 0.08 },
      { name: 'Lemon',             qty: 1    },
      { name: 'Garlic',            qty: 0.02 },
      { name: 'Ginger',            qty: 0.02 },
      { name: 'Red Chilli Powder', qty: 5    },
      { name: 'Garam Masala',      qty: 4    },
      { name: 'Cooking Oil',       qty: 0.03 },
    ]
  },
  {
    keywords: ['pizza', 'pasta'],
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.25 },
      { name: 'Cheese (Processed)',qty: 0.1  },
      { name: 'Tomato',            qty: 0.15 },
      { name: 'Bell Pepper',       qty: 0.08 },
      { name: 'Cooking Oil',       qty: 0.03 },
      { name: 'Black Pepper',      qty: 2    },
    ]
  },
  {
    keywords: ['soup', 'shorba'],
    ingredients: [
      { name: 'Chicken Breast',    qty: 0.2  },
      { name: 'Onion',             qty: 0.08 },
      { name: 'Garlic',            qty: 0.01 },
      { name: 'Ginger',            qty: 0.01 },
      { name: 'Black Pepper',      qty: 3    },
      { name: 'Salt',              qty: 5    },
      { name: 'Coriander Leaves',  qty: 0.02 },
    ]
  },
  {
    keywords: ['lassi', 'milkshake', 'shake', 'drink', 'juice', 'mango'],
    ingredients: [
      { name: 'Milk',              qty: 0.25 },
      { name: 'Yogurt',            qty: 0.1  },
      { name: 'Mango Pulp',        qty: 0.1  },
      { name: 'Rose Syrup',        qty: 0.02 },
    ]
  },
  {
    keywords: ['kheer', 'pudding', 'halwa', 'dessert', 'gulab', 'sweet'],
    ingredients: [
      { name: 'Milk',              qty: 0.3  },
      { name: 'Basmati Rice',      qty: 0.05 },
      { name: 'Butter',            qty: 0.03 },
      { name: 'Cardamom',          qty: 2    },
    ]
  },
  // Catch-all for anything else
  {
    keywords: [],
    ingredients: [
      { name: 'Chicken Breast',    qty: 0.25 },
      { name: 'Onion',             qty: 0.1  },
      { name: 'Tomato',            qty: 0.1  },
      { name: 'Cooking Oil',       qty: 0.04 },
      { name: 'Salt',              qty: 4    },
      { name: 'Garam Masala',      qty: 4    },
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PURCHASE SCHEDULE  (2 months, ~8 purchase events)
//    Each event: { daysAgoVal, supplierIdx, items: [{ingName, qty, price}] }
// ─────────────────────────────────────────────────────────────────────────────
function buildPurchaseSchedule(supplierIds, ingredientMap) {
  // supplierIdx refers to the order suppliers were inserted
  return [
    // Month 2 (older)
    {
      daysAgoVal: 58, supplierIdx: 0,
      notes: 'Monthly meat restock — opening stock',
      items: [
        { ingName: 'Chicken Breast',  qty: 20,  price: 650  },
        { ingName: 'Chicken Thighs',  qty: 15,  price: 580  },
        { ingName: 'Beef Mince',      qty: 10,  price: 1100 },
        { ingName: 'Boneless Beef',   qty: 8,   price: 1250 },
        { ingName: 'Mutton Leg',      qty: 5,   price: 1600 },
      ]
    },
    {
      daysAgoVal: 55, supplierIdx: 1,
      notes: 'Vegetables and produce — week 1',
      items: [
        { ingName: 'Onion',           qty: 25,  price: 80   },
        { ingName: 'Tomato',          qty: 20,  price: 90   },
        { ingName: 'Garlic',          qty: 5,   price: 300  },
        { ingName: 'Ginger',          qty: 4,   price: 280  },
        { ingName: 'Green Chilli',    qty: 3,   price: 150  },
        { ingName: 'Bell Pepper',     qty: 6,   price: 220  },
        { ingName: 'Potato',          qty: 15,  price: 70   },
        { ingName: 'Coriander Leaves',qty: 3,   price: 200  },
        { ingName: 'Lemon',           qty: 80,  price: 10   },
      ]
    },
    {
      daysAgoVal: 53, supplierIdx: 4,
      notes: 'Grains and staples — bulk purchase',
      items: [
        { ingName: 'Basmati Rice',         qty: 50, price: 220 },
        { ingName: 'All-Purpose Flour',    qty: 25, price: 110 },
        { ingName: 'Chickpeas (Dried)',    qty: 10, price: 200 },
        { ingName: 'Lentils (Red)',        qty: 10, price: 180 },
        { ingName: 'Bread (Naan)',         qty: 100,price: 30  },
      ]
    },
    {
      daysAgoVal: 50, supplierIdx: 3,
      notes: 'Spice restock — month 2',
      items: [
        { ingName: 'Cumin Seeds',       qty: 2000, price: 2   },
        { ingName: 'Coriander Powder',  qty: 1500, price: 1.5 },
        { ingName: 'Red Chilli Powder', qty: 1500, price: 1.8 },
        { ingName: 'Turmeric Powder',   qty: 800,  price: 1.2 },
        { ingName: 'Garam Masala',      qty: 1200, price: 2.5 },
        { ingName: 'Salt',              qty: 5000, price: 0.3 },
        { ingName: 'Black Pepper',      qty: 600,  price: 3   },
        { ingName: 'Cardamom',          qty: 300,  price: 8   },
      ]
    },
    // Month 1 (recent)
    {
      daysAgoVal: 28, supplierIdx: 0,
      notes: 'Mid-month meat restock',
      items: [
        { ingName: 'Chicken Breast',  qty: 18, price: 660  },
        { ingName: 'Chicken Thighs',  qty: 12, price: 595  },
        { ingName: 'Beef Mince',      qty: 8,  price: 1120 },
        { ingName: 'Boneless Beef',   qty: 6,  price: 1260 },
      ]
    },
    {
      daysAgoVal: 25, supplierIdx: 1,
      notes: 'Fresh produce restock — week 5',
      items: [
        { ingName: 'Onion',            qty: 20, price: 85  },
        { ingName: 'Tomato',           qty: 18, price: 95  },
        { ingName: 'Garlic',           qty: 4,  price: 310 },
        { ingName: 'Ginger',           qty: 3,  price: 290 },
        { ingName: 'Green Chilli',     qty: 2,  price: 160 },
        { ingName: 'Bell Pepper',      qty: 5,  price: 230 },
        { ingName: 'Potato',           qty: 12, price: 75  },
        { ingName: 'Coriander Leaves', qty: 2,  price: 210 },
      ]
    },
    {
      daysAgoVal: 20, supplierIdx: 2,
      notes: 'Dairy products restock',
      items: [
        { ingName: 'Yogurt',            qty: 15, price: 180 },
        { ingName: 'Cream',             qty: 8,  price: 350 },
        { ingName: 'Butter',            qty: 4,  price: 900 },
        { ingName: 'Cheese (Processed)',qty: 3,  price: 1100},
        { ingName: 'Milk',              qty: 20, price: 150 },
      ]
    },
    {
      daysAgoVal: 7, supplierIdx: 0,
      notes: 'Weekly meat top-up',
      items: [
        { ingName: 'Chicken Breast',  qty: 12, price: 660  },
        { ingName: 'Chicken Thighs',  qty: 10, price: 595  },
        { ingName: 'Mutton Leg',      qty: 4,  price: 1620 },
      ]
    },
    {
      daysAgoVal: 5, supplierIdx: 5,
      notes: 'Beverage concentrates and syrups',
      items: [
        { ingName: 'Mango Pulp',      qty: 10, price: 250 },
        { ingName: 'Rose Syrup',      qty: 5,  price: 180 },
        { ingName: 'Cola Concentrate',qty: 3,  price: 400 },
        { ingName: 'Cooking Oil',     qty: 20, price: 320 },
      ]
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. WASTAGE SCHEDULE  (spread over 2 months)
// ─────────────────────────────────────────────────────────────────────────────
function buildWastageSchedule(ingredientMap) {
  const REASONS = ['Spoilage', 'Spillage', 'Expired', 'Overcooked', 'Other'];
  const entries = [
    // Week 8 ago
    { daysAgoVal: 56, ingName: 'Tomato',           qty: 1.5,   reason: 'Spoilage',   notes: 'Overripe batch' },
    { daysAgoVal: 54, ingName: 'Coriander Leaves', qty: 0.3,   reason: 'Spoilage',   notes: '' },
    { daysAgoVal: 52, ingName: 'Chicken Breast',   qty: 0.5,   reason: 'Expired',    notes: 'Left in fridge too long' },
    // Week 7 ago
    { daysAgoVal: 49, ingName: 'Yogurt',           qty: 1.0,   reason: 'Expired',    notes: 'Past use-by date' },
    { daysAgoVal: 47, ingName: 'Onion',            qty: 2.0,   reason: 'Spoilage',   notes: 'Sprouted and rotten' },
    // Week 6 ago
    { daysAgoVal: 43, ingName: 'Green Chilli',     qty: 0.4,   reason: 'Spoilage',   notes: '' },
    { daysAgoVal: 41, ingName: 'Cooking Oil',      qty: 1.0,   reason: 'Spillage',   notes: 'Container knocked over' },
    // Week 5 ago
    { daysAgoVal: 36, ingName: 'Chicken Thighs',   qty: 0.8,   reason: 'Expired',    notes: 'Freezer issue overnight' },
    { daysAgoVal: 34, ingName: 'Bell Pepper',      qty: 1.0,   reason: 'Spoilage',   notes: '' },
    // Week 4 ago
    { daysAgoVal: 29, ingName: 'Cream',            qty: 0.5,   reason: 'Expired',    notes: 'Not used in time' },
    { daysAgoVal: 27, ingName: 'Tomato',           qty: 1.0,   reason: 'Overcooked', notes: 'Sauce overcooked' },
    { daysAgoVal: 25, ingName: 'Basmati Rice',     qty: 0.5,   reason: 'Overcooked', notes: 'Burnt during dinner rush' },
    // Week 3 ago
    { daysAgoVal: 21, ingName: 'Chicken Breast',   qty: 0.4,   reason: 'Expired',    notes: '' },
    { daysAgoVal: 19, ingName: 'Coriander Leaves', qty: 0.2,   reason: 'Spoilage',   notes: '' },
    { daysAgoVal: 17, ingName: 'Lemon',            qty: 10,    reason: 'Spoilage',   notes: 'Dried out' },
    // Week 2 ago
    { daysAgoVal: 13, ingName: 'Yogurt',           qty: 0.5,   reason: 'Expired',    notes: '' },
    { daysAgoVal: 11, ingName: 'Milk',             qty: 1.0,   reason: 'Spoilage',   notes: 'Left out overnight' },
    { daysAgoVal: 10, ingName: 'Potato',           qty: 1.5,   reason: 'Spoilage',   notes: 'Sprouted' },
    // Last week
    { daysAgoVal: 6,  ingName: 'Onion',            qty: 1.0,   reason: 'Spoilage',   notes: '' },
    { daysAgoVal: 5,  ingName: 'Beef Mince',       qty: 0.3,   reason: 'Expired',    notes: 'Not used after thawing' },
    { daysAgoVal: 3,  ingName: 'Chicken Breast',   qty: 0.6,   reason: 'Overcooked', notes: 'Lunch service error' },
    { daysAgoVal: 2,  ingName: 'Bell Pepper',      qty: 0.5,   reason: 'Spoilage',   notes: '' },
    { daysAgoVal: 1,  ingName: 'Cream',            qty: 0.3,   reason: 'Spillage',   notes: 'Dropped during plating' },
  ];
  return entries;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  // Connect
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  console.log('✔  Connected to MongoDB');

  // ── Find admin user (required for createdBy) ────────────────────────────
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    console.error('✘  No admin user found. Create an admin account first, then re-run.');
    process.exit(1);
  }
  console.log(`✔  Using admin user: ${adminUser.name} (${adminUser.email})`);
  const adminId = adminUser._id;

  // ── 1. INGREDIENTS ──────────────────────────────────────────────────────
  const existingIngCount = await Ingredient.countDocuments();
  let ingredientMap = {}; // name → _id

  if (existingIngCount > 0) {
    console.log(`⚠  Ingredients already exist (${existingIngCount}). Skipping ingredient insert.`);
    const existing = await Ingredient.find({}, 'name _id');
    existing.forEach((i) => { ingredientMap[i.name] = i._id; });
  } else {
    console.log('  Inserting ingredients...');
    const inserted = await Ingredient.insertMany(
      INGREDIENT_DEFS.map((d) => ({ ...d, currentStock: 0 }))
    );
    inserted.forEach((i) => { ingredientMap[i.name] = i._id; });
    console.log(`✔  Inserted ${inserted.length} ingredients`);
  }

  // ── 2. SUPPLIERS ────────────────────────────────────────────────────────
  const existingSupCount = await Supplier.countDocuments();
  let supplierIds = [];

  if (existingSupCount > 0) {
    console.log(`⚠  Suppliers already exist (${existingSupCount}). Skipping supplier insert.`);
    const existing = await Supplier.find({}, '_id').sort({ createdAt: 1 });
    supplierIds = existing.map((s) => s._id);
  } else {
    console.log('  Inserting suppliers...');
    const inserted = await Supplier.insertMany(SUPPLIER_DEFS);
    supplierIds = inserted.map((s) => s._id);
    console.log(`✔  Inserted ${inserted.length} suppliers`);
  }

  // ── 3. RECIPES ──────────────────────────────────────────────────────────
  const existingRecipeCount = await Recipe.countDocuments();

  if (existingRecipeCount > 0) {
    console.log(`⚠  Recipes already exist (${existingRecipeCount}). Skipping recipe insert.`);
  } else {
    console.log('  Fetching products to map recipes...');
    const products = await Product.find({}, 'name category _id');

    if (products.length === 0) {
      console.log('⚠  No products found in database. Skipping recipe insert.');
    } else {
      const recipeDocs = [];

      for (const product of products) {
        const nameLower = (product.name + ' ' + (product.category || '')).toLowerCase();

        // Find best matching template
        let bestTemplate = RECIPE_TEMPLATES[RECIPE_TEMPLATES.length - 1]; // catch-all
        for (const tpl of RECIPE_TEMPLATES) {
          if (tpl.keywords.length > 0 && tpl.keywords.some((kw) => nameLower.includes(kw))) {
            bestTemplate = tpl;
            break;
          }
        }

        // Build ingredient list — only include ingredients we actually have
        const recipeIngredients = bestTemplate.ingredients
          .filter((ri) => ingredientMap[ri.name] !== undefined)
          .map((ri) => ({
            ingredientId:   ingredientMap[ri.name],
            ingredientName: ri.name,
            unit:           INGREDIENT_DEFS.find((d) => d.name === ri.name)?.unit || 'g',
            quantityRequired: ri.qty
          }));

        if (recipeIngredients.length === 0) continue;

        // Check for duplicate productId before adding
        const alreadyAdded = recipeDocs.find(
          (r) => r.productId.toString() === product._id.toString()
        );
        if (!alreadyAdded) {
          recipeDocs.push({
            productId:    product._id,
            productName:  product.name,
            ingredients:  recipeIngredients
          });
        }
      }

      if (recipeDocs.length > 0) {
        await Recipe.insertMany(recipeDocs);
        console.log(`✔  Inserted ${recipeDocs.length} recipes for products`);
      } else {
        console.log('⚠  No valid recipe documents to insert.');
      }
    }
  }

  // ── 4. PURCHASES (triggers stock increment hooks) ────────────────────────
  const existingPurchaseCount = await Purchase.countDocuments();

  if (existingPurchaseCount > 0) {
    console.log(`⚠  Purchases already exist (${existingPurchaseCount}). Skipping purchase insert.`);
  } else {
    console.log('  Inserting purchases (this increments ingredient stock via hooks)...');
    const schedule = buildPurchaseSchedule(supplierIds, ingredientMap);
    let purchaseCount = 0;

    for (const event of schedule) {
      // Resolve supplier ID — use modulo in case supplier list is smaller than expected
      const supplierId = supplierIds[event.supplierIdx % supplierIds.length];
      const supplierInfo = await Supplier.findById(supplierId, 'name');

      // Resolve ingredient IDs and build items
      const items = event.items
        .filter((item) => ingredientMap[item.ingName] !== undefined)
        .map((item) => {
          const ing = INGREDIENT_DEFS.find((d) => d.name === item.ingName);
          return {
            ingredientId:   ingredientMap[item.ingName],
            ingredientName: item.ingName,
            unit:           ing?.unit || 'g',
            quantity:       item.qty,
            pricePerUnit:   item.price,
            subtotal:       Math.round(item.qty * item.price * 10) / 10
          };
        });

      if (items.length === 0) continue;

      const totalCost = items.reduce((sum, i) => sum + i.subtotal, 0);

      // Use save() so that the post('save') hook fires and increments stock
      const purchase = new Purchase({
        supplierId,
        supplierName: supplierInfo?.name || 'Unknown Supplier',
        totalCost,
        purchaseDate: daysAgo(event.daysAgoVal),
        notes: event.notes || '',
        createdBy: adminId,
        items
      });
      await purchase.save();
      purchaseCount++;
    }

    console.log(`✔  Inserted ${purchaseCount} purchase records (stock auto-incremented)`);
  }

  // ── 5. WASTAGE (triggers stock decrement hooks) ──────────────────────────
  const existingWastageCount = await Wastage.countDocuments();

  if (existingWastageCount > 0) {
    console.log(`⚠  Wastage records already exist (${existingWastageCount}). Skipping wastage insert.`);
  } else {
    console.log('  Inserting wastage records (this decrements ingredient stock via hooks)...');
    const schedule = buildWastageSchedule(ingredientMap);
    let wastageCount = 0;

    for (const entry of schedule) {
      const ingId = ingredientMap[entry.ingName];
      if (!ingId) {
        console.log(`  ⚠  Ingredient not found: "${entry.ingName}" — skipping wastage entry`);
        continue;
      }

      // Use save() so that the post('save') hook fires and decrements stock
      const wastage = new Wastage({
        ingredientId:   ingId,
        ingredientName: entry.ingName,
        quantity:       entry.qty,
        reason:         entry.reason,
        notes:          entry.notes || '',
        createdBy:      adminId,
        date:           daysAgo(entry.daysAgoVal)
      });
      await wastage.save();
      wastageCount++;
    }

    console.log(`✔  Inserted ${wastageCount} wastage records (stock auto-decremented)`);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const [ingTotal, supTotal, purTotal, recTotal, wasTotal] = await Promise.all([
    Ingredient.countDocuments(),
    Supplier.countDocuments(),
    Purchase.countDocuments(),
    Recipe.countDocuments(),
    Wastage.countDocuments(),
  ]);

  console.log('\n─────────────────────────────────────────');
  console.log('  SEED COMPLETE — Database totals:');
  console.log(`  Ingredients : ${ingTotal}`);
  console.log(`  Suppliers   : ${supTotal}`);
  console.log(`  Purchases   : ${purTotal}`);
  console.log(`  Recipes     : ${recTotal}`);
  console.log(`  Wastage     : ${wasTotal}`);
  console.log('─────────────────────────────────────────');
  console.log('\n  ✔  All done. No existing data was modified or deleted.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('✘  Seed failed:', err.message || err);
  mongoose.disconnect();
  process.exit(1);
});
