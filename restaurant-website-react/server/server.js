const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Helper function to format order items for email
const formatOrderItems = (items) => {
  return items
    .map((item) => {
      let itemText = `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: start; gap: 20px;">
              <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; flex-shrink: 0;" />
              <div style="flex: 1; padding-left: 10px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${item.name}</h4>
                ${item.size ? `<p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;">Size: ${item.size}</p>` : ''}
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</p>
                <p style="margin: 0; color: #E67E22; font-weight: bold; font-size: 16px;">Rs.${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
      `;

      // Add customizations if present
      if (
        item.addOns &&
        (item.addOns.drinks?.length > 0 ||
          item.addOns.desserts?.length > 0 ||
          item.addOns.extras?.length > 0 ||
          item.spiceLevel)
      ) {
        itemText += `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Customizations:</p>
        `;

        // Spice Level
        if (item.spiceLevel) {
          const formattedSpiceLevel = item.spiceLevel
            .replace('spice-', '')
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          itemText += `<p style="margin: 0 0 5px 0; color: #4b5563; font-size: 13px;">• Spice Level: ${formattedSpiceLevel}</p>`;
        }

        // Drinks
        if (item.addOns.drinks?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Drinks:</p>`;
          item.addOns.drinks.forEach((drink) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${drink.name} ${drink.quantity > 1 ? `x${drink.quantity}` : ''} - Rs.${(drink.price * drink.quantity).toFixed(2)}</p>`;
          });
        }

        // Desserts
        if (item.addOns.desserts?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Desserts:</p>`;
          item.addOns.desserts.forEach((dessert) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${dessert.name} ${dessert.quantity > 1 ? `x${dessert.quantity}` : ''} - Rs.${(dessert.price * dessert.quantity).toFixed(2)}</p>`;
          });
        }

        // Extras
        if (item.addOns.extras?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Extras:</p>`;
          item.addOns.extras.forEach((extra) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${extra.name} ${extra.quantity > 1 ? `x${extra.quantity}` : ''} - Rs.${(extra.price * extra.quantity).toFixed(2)}</p>`;
          });
        }

        itemText += `</div>`;
      }

      itemText += `
          </td>
        </tr>
      `;

      return itemText;
    })
    .join('');
};

// Customer email template
const getCustomerEmailTemplate = (order) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Order Confirmed!</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Thank you for your order</p>
                  </td>
                </tr>

                <!-- Order ID and Status -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FFFBF5;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Order ID</p>
                    <h2 style="margin: 5px 0 15px 0; color: #E67E22; font-size: 24px; font-weight: bold;">${order.orderId}</h2>
                    <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                      ${order.status}
                    </div>
                  </td>
                </tr>

                <!-- Customer Details -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Customer Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Name</p>
                          <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.fullName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Email</p>
                          <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Phone</p>
                          <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.phone}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Delivery Address -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Delivery Address</h3>
                    <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                      ${order.customerInfo.address}<br/>
                      ${order.customerInfo.city}${order.customerInfo.postalCode ? `, ${order.customerInfo.postalCode}` : ''}
                    </p>
                    ${order.customerInfo.additionalNotes ? `<p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px; font-style: italic;">Note: ${order.customerInfo.additionalNotes}</p>` : ''}
                  </td>
                </tr>

                <!-- Order Items -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Order Items</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                      ${formatOrderItems(order.items)}
                    </table>
                  </td>
                </tr>

                <!-- Price Summary -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Order Summary</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Subtotal</td>
                        <td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Delivery Fee</td>
                        <td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.deliveryFee.toFixed(2)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #E67E22;">
                        <td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Total</td>
                        <td align="right" style="padding: 12px 0; color: #E67E22; font-size: 22px; font-weight: bold;">Rs.${order.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Payment Method -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <div style="background-color: #FFFBF5; border-left: 4px solid #E67E22; padding: 15px; border-radius: 8px;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment Method</p>
                      <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: bold;">${order.paymentMethod}</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your order will be delivered soon!</p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">If you have any questions, please contact us.</p>
                    <div style="margin-top: 20px;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">Order Date: ${new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

// Admin email template
const getAdminEmailTemplate = (order) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Received</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">New Order Received!</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Action Required - Process Order</p>
                  </td>
                </tr>

                <!-- Order Alert -->
                <tr>
                  <td style="padding: 20px 30px; background-color: #FFFBF5; border-left: 4px solid #E67E22;">
                    <p style="margin: 0; color: #D35400; font-size: 16px; font-weight: bold;">⚠️ New order needs to be processed immediately!</p>
                  </td>
                </tr>

                <!-- Order ID and Status -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FFFBF5;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Order ID</p>
                    <h2 style="margin: 5px 0 15px 0; color: #E67E22; font-size: 24px; font-weight: bold;">${order.orderId}</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Date & Time</p>
                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${new Date(order.orderDate).toLocaleString()}</p>
                  </td>
                </tr>

                <!-- Customer Details -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Customer Information</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Customer Name</p>
                          <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.fullName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Email</p>
                          <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Phone (Contact for confirmation)</p>
                          <p style="margin: 3px 0 0 0; color: #E67E22; font-size: 18px; font-weight: bold;">${order.customerInfo.phone}</p>
                        </td>
                      </tr>
                      ${order.userId ? `<tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">User ID</p><p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.userId}</p></td></tr>` : ''}
                    </table>
                  </td>
                </tr>

                <!-- Delivery Address -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Delivery Location</h3>
                    <div style="background-color: #FFFBF5; border-radius: 8px; padding: 15px;">
                      <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6; font-weight: 600;">
                        ${order.customerInfo.address}<br/>
                        ${order.customerInfo.city}${order.customerInfo.postalCode ? `, ${order.customerInfo.postalCode}` : ''}
                      </p>
                      ${order.customerInfo.additionalNotes ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;"><p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600;">Delivery Instructions:</p><p style="margin: 5px 0 0 0; color: #E67E22; font-size: 14px; font-style: italic;">${order.customerInfo.additionalNotes}</p></div>` : ''}
                    </div>
                  </td>
                </tr>

                <!-- Order Items -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Order Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                      ${formatOrderItems(order.items)}
                    </table>
                  </td>
                </tr>

                <!-- Financial Summary -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Financial Summary</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Subtotal</td>
                        <td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Delivery Fee</td>
                        <td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.deliveryFee.toFixed(2)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #E67E22;">
                        <td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Total Amount to Collect</td>
                        <td align="right" style="padding: 12px 0; color: #E67E22; font-size: 24px; font-weight: bold;">Rs.${order.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Payment Information -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <div style="background-color: #FFFBF5; border-left: 4px solid #E67E22; padding: 15px; border-radius: 8px;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment Method</p>
                      <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: bold;">${order.paymentMethod}</p>
                    </div>
                  </td>
                </tr>

                <!-- Action Items -->
                <tr>
                  <td style="padding: 20px 30px; background-color: #fffbeb;">
                    <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">Action Items:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                      <li>Call customer at ${order.customerInfo.phone} for order confirmation</li>
                      <li>Prepare order items as listed above</li>
                      <li>Assign delivery rider</li>
                      <li>Ensure rider has exact change for Rs.${order.total.toFixed(2)}</li>
                      <li>Update order status in system</li>
                    </ul>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: bold;">Restaurant Management System</p>
                    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">This is an automated notification for new orders</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

// Order placement endpoint
app.post('/api/orders/place', async (req, res) => {
  try {
    const order = req.body;

    // Validate required fields
    if (!order || !order.customerInfo || !order.items || order.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data',
      });
    }

    // Admin email (hardcoded as specified)
    const adminEmail = 'shiningstardeveloper@gmail.com';

    // Send email to customer (if email is provided)
    let customerEmailSent = false;
    if (order.customerInfo.email) {
      try {
        await transporter.sendMail({
          from: `"Restaurant" <${process.env.EMAIL_USER}>`,
          to: order.customerInfo.email,
          subject: `Order Confirmation - ${order.orderId}`,
          html: getCustomerEmailTemplate(order),
        });
        customerEmailSent = true;
        console.log('Customer email sent successfully to:', order.customerInfo.email);
      } catch (emailError) {
        console.error('Error sending customer email:', emailError);
        // Continue even if customer email fails
      }
    }

    // Send email to admin
    let adminEmailSent = false;
    try {
      await transporter.sendMail({
        from: `"Restaurant Order System" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🔔 New Order - ${order.orderId} - Rs.${order.total.toFixed(2)}`,
        html: getAdminEmailTemplate(order),
      });
      adminEmailSent = true;
      console.log('Admin email sent successfully to:', adminEmail);
    } catch (emailError) {
      console.error('Error sending admin email:', emailError);
      // If admin email fails, it's more critical - but still return success for order placement
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      orderId: order.orderId,
      emailStatus: {
        customerEmailSent,
        adminEmailSent,
      },
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order',
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
