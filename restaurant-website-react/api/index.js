const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectDB } = require('../server/config/database');

// Import routes
const authRoutes = require('../server/routes/authRoutes');
const userRoutes = require('../server/routes/userRoutes');
const orderRoutes = require('../server/routes/orderRoutes');
const productRoutes = require('../server/routes/productRoutes');
const expenseRoutes = require('../server/routes/expenseRoutes');
const imageRoutes = require('../server/routes/imageRoutes');
const tableRoutes = require('../server/routes/tableRoutes');
const reservationRoutes = require('../server/routes/reservationRoutes');
const dealRoutes = require('../server/routes/dealRoutes');
const ingredientRoutes = require('../server/routes/ingredientRoutes');
const supplierRoutes = require('../server/routes/supplierRoutes');
const purchaseRoutes = require('../server/routes/purchaseRoutes');
const recipeRoutes = require('../server/routes/recipeRoutes');
const wastageRoutes = require('../server/routes/wastageRoutes');
const addonStockRoutes = require('../server/routes/addonStockRoutes');
const { sendCustomerEmail, sendAdminEmail } = require('./_lib/emailService');

const app = express();

// Connect to MongoDB (cached for serverless)
let isConnected = false;
async function ensureDBConnected() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    // If no FRONTEND_URL set, allow all (dev/staging fallback)
    if (!allowedOrigins) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// DB connection middleware
app.use(async (req, res, next) => {
  try {
    await ensureDBConnected();
    next();
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/wastage', wastageRoutes);
app.use('/api/addon-stocks', addonStockRoutes);

// Legacy email endpoints
app.post('/api/emails/customer', async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.customerInfo || !order.orderId) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }
    const result = await sendCustomerEmail(order);
    return res.status(result.success ? 200 : 400).json({ ...result, orderId: order.orderId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send customer email', error: error.message });
  }
});

app.post('/api/emails/admin', async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.customerInfo || !order.orderId || !order.items || order.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }
    const result = await sendAdminEmail(order);
    return res.status(result.success ? 200 : 400).json({ ...result, orderId: order.orderId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send admin email', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', database: 'MongoDB' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
