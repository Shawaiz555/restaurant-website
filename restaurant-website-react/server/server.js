const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sendOrderEmails, sendCustomerEmail, sendAdminEmail } = require('../api/_lib/emailService');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.post('/api/orders/placeOrder', async (req, res) => {
  try {
    const order = req.body;

    if (!order || !order.customerInfo || !order.items || order.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    const emailStatus = await sendOrderEmails(order);

    return res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      orderId: order.orderId,
      emailStatus,
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process order',
      error: error.message,
    });
  }
});

// Separate endpoint for sending customer email
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

// Separate endpoint for sending admin email
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
