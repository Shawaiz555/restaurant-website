const { sendOrderEmails } = require('../_lib/emailService');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
};
