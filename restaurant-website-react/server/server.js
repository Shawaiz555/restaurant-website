const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { sendCustomerEmail, sendAdminEmail } = require('../api/_lib/emailService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const imageRoutes = require('./routes/imageRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const dealRoutes = require('./routes/dealRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 image uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

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

// Legacy email endpoints (keep for backward compatibility)
app.post('/api/emails/customer', async (req, res) => {
  try {
    const order = req.body;

    if (!order || !order.customerInfo || !order.orderId) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    const result = await sendCustomerEmail(order);

    return res.status(result.success ? 200 : 400).json({
      ...result,
      orderId: order.orderId,
    });
  } catch (error) {
    console.error('Error sending customer email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send customer email',
      error: error.message,
    });
  }
});

app.post('/api/emails/admin', async (req, res) => {
  try {
    const order = req.body;

    if (!order || !order.customerInfo || !order.orderId || !order.items || order.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    const result = await sendAdminEmail(order);

    return res.status(result.success ? 200 : 400).json({
      ...result,
      orderId: order.orderId,
    });
  } catch (error) {
    console.error('Error sending admin email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send admin email',
      error: error.message,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', database: 'MongoDB' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
