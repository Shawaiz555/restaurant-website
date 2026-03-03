const Mailjet = require('node-mailjet');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'shiningstardeveloper@gmail.com';
const FROM_EMAIL = process.env.MAILJET_FROM_EMAIL || 'shawaizbutt555@gmail.com';
const FROM_NAME = process.env.MAILJET_FROM_NAME || 'Restaurant';

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const formatOrderItems = (items) => {
  return items
    .map((item) => {
      // Ensure image URL is absolute
      const getAbsoluteImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }
        // Convert relative path to absolute URL
        // Assumes your app runs on localhost:3000 or you can use your domain
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
      };

      const imageUrl = getAbsoluteImageUrl(item.image);

      let itemText = `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="100" valign="top" style="padding-right: 20px;">
                  <img src="${imageUrl}" alt="${item.name}" width="100" height="100" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; display: block; border: none;" />
                </td>
                <td valign="top">
                  <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${item.name}</h4>
                  ${item.size ? `<p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;">Size: ${item.size}</p>` : ''}
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</p>
                  <p style="margin: 0; color: #E67E22; font-weight: bold; font-size: 16px;">Rs.${(item.price * item.quantity).toFixed(2)}</p>
                </td>
              </tr>
      `;

      if (
        item.addOns &&
        (item.addOns.drinks?.length > 0 ||
          item.addOns.desserts?.length > 0 ||
          item.addOns.extras?.length > 0 ||
          item.spiceLevel)
      ) {
        itemText += `
            <tr>
              <td colspan="2" style="padding-top: 10px;">
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Customizations:</p>
        `;

        if (item.spiceLevel) {
          const formattedSpiceLevel = item.spiceLevel?.name || item.spiceLevel;
          itemText += `<p style="margin: 0 0 5px 0; color: #4b5563; font-size: 13px;">• Spice Level: ${formattedSpiceLevel}</p>`;
        }

        if (item.addOns.drinks?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Drinks:</p>`;
          item.addOns.drinks.forEach((drink) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${drink.name} ${drink.quantity > 1 ? `x${drink.quantity}` : ''} - Rs.${(drink.price * drink.quantity).toFixed(2)}</p>`;
          });
        }

        if (item.addOns.desserts?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Desserts:</p>`;
          item.addOns.desserts.forEach((dessert) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${dessert.name} ${dessert.quantity > 1 ? `x${dessert.quantity}` : ''} - Rs.${(dessert.price * dessert.quantity).toFixed(2)}</p>`;
          });
        }

        if (item.addOns.extras?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Extras:</p>`;
          item.addOns.extras.forEach((extra) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${extra.name} ${extra.quantity > 1 ? `x${extra.quantity}` : ''} - Rs.${(extra.price * extra.quantity).toFixed(2)}</p>`;
          });
        }

        itemText += `
                </div>
              </td>
            </tr>`;
      }

      itemText += `
            </table>
          </td>
        </tr>
      `;

      return itemText;
    })
    .join('');
};

const getCustomerEmailTemplate = (order) => `
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
              <tr>
                <td style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Order Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Thank you for your order</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Order ID</p>
                  <h2 style="margin: 5px 0 15px 0; color: #E67E22; font-size: 24px; font-weight: bold;">${order.orderId}</h2>
                  <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                    ${order.status}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Customer Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">Name</p><p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.fullName}</p></td></tr>
                    <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">Email</p><p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.email}</p></td></tr>
                    <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">Phone</p><p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.phone}</p></td></tr>
                  </table>
                </td>
              </tr>
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
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Order Items</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${formatOrderItems(order.items)}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Order Summary</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Subtotal</td><td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.subtotal.toFixed(2)}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Delivery Fee</td><td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.deliveryFee.toFixed(2)}</td></tr>
                    <tr style="border-top: 2px solid #E67E22;"><td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Total</td><td align="right" style="padding: 12px 0; color: #E67E22; font-size: 22px; font-weight: bold;">Rs.${order.total.toFixed(2)}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <div style="background-color: #FFFBF5; border-left: 4px solid #E67E22; padding: 15px; border-radius: 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment Method</p>
                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: bold;">${order.paymentMethod}</p>
                  </div>
                </td>
              </tr>
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

const getAdminEmailTemplate = (order) => `
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
              <tr>
                <td style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">New Order Received!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Action Required - Process Order</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background-color: #FFFBF5; border-left: 4px solid #E67E22;">
                  <p style="margin: 0; color: #D35400; font-size: 16px; font-weight: bold;">⚠️ New order needs to be processed immediately!</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Order ID</p>
                  <h2 style="margin: 5px 0 15px 0; color: #E67E22; font-size: 24px; font-weight: bold;">${order.orderId}</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Date & Time</p>
                  <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${new Date(order.orderDate).toLocaleString()}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Customer Information</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                    <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">Customer Name</p><p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.fullName}</p></td></tr>
                    <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">Email</p><p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.customerInfo.email}</p></td></tr>
                    <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">Phone (Contact for confirmation)</p><p style="margin: 3px 0 0 0; color: #E67E22; font-size: 18px; font-weight: bold;">${order.customerInfo.phone}</p></td></tr>
                    ${order.userId ? `<tr><td style="padding: 8px 0;"><p style="margin: 0; color: #6b7280; font-size: 14px;">User ID</p><p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${order.userId}</p></td></tr>` : ''}
                  </table>
                </td>
              </tr>
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
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Order Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${formatOrderItems(order.items)}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Financial Summary</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                    <tr><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Subtotal</td><td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.subtotal.toFixed(2)}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Delivery Fee</td><td align="right" style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600;">Rs.${order.deliveryFee.toFixed(2)}</td></tr>
                    <tr style="border-top: 2px solid #E67E22;"><td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Total Amount to Collect</td><td align="right" style="padding: 12px 0; color: #E67E22; font-size: 24px; font-weight: bold;">Rs.${order.total.toFixed(2)}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <div style="background-color: #FFFBF5; border-left: 4px solid #E67E22; padding: 15px; border-radius: 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment Method</p>
                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: bold;">${order.paymentMethod}</p>
                  </div>
                </td>
              </tr>
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

const sendCustomerEmail = async (order) => {
  if (!order.customerInfo.email) {
    console.log('No customer email provided, skipping customer notification');
    return { success: false, message: 'No customer email provided' };
  }

  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: FROM_EMAIL,
            Name: FROM_NAME,
          },
          To: [
            {
              Email: order.customerInfo.email,
              Name: order.customerInfo.fullName,
            },
          ],
          Subject: `Order Confirmation - ${order.orderId}`,
          HTMLPart: getCustomerEmailTemplate(order),
        },
      ],
    });

    await request;
    console.log('Customer email sent successfully to:', order.customerInfo.email);
    return { success: true, message: 'Customer email sent successfully' };
  } catch (err) {
    console.error('Error sending customer email:', err);
    return { success: false, message: err.message };
  }
};

const sendAdminEmail = async (order) => {
  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: FROM_EMAIL,
            Name: 'Restaurant Order System',
          },
          To: [
            {
              Email: ADMIN_EMAIL,
              Name: 'Restaurant Admin',
            },
          ],
          Subject: `🔔 New Order - ${order.orderId} - Rs.${order.total.toFixed(2)}`,
          HTMLPart: getAdminEmailTemplate(order),
        },
      ],
    });

    await request;
    console.log('Admin email sent successfully to:', ADMIN_EMAIL);
    return { success: true, message: 'Admin email sent successfully' };
  } catch (err) {
    console.error('Error sending admin email:', err);
    return { success: false, message: err.message };
  }
};

const sendOrderEmails = async (order) => {
  let customerEmailSent = false;
  if (order.customerInfo.email) {
    try {
      const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: FROM_EMAIL,
              Name: FROM_NAME,
            },
            To: [
              {
                Email: order.customerInfo.email,
                Name: order.customerInfo.fullName,
              },
            ],
            Subject: `Order Confirmation - ${order.orderId}`,
            HTMLPart: getCustomerEmailTemplate(order),
          },
        ],
      });

      await request;
      customerEmailSent = true;
      console.log('Customer email sent successfully to:', order.customerInfo.email);
    } catch (err) {
      console.error('Error sending customer email:', err);
    }
  }

  let adminEmailSent = false;
  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: FROM_EMAIL,
            Name: 'Restaurant Order System',
          },
          To: [
            {
              Email: ADMIN_EMAIL,
              Name: 'Restaurant Admin',
            },
          ],
          Subject: `🔔 New Order - ${order.orderId} - Rs.${order.total.toFixed(2)}`,
          HTMLPart: getAdminEmailTemplate(order),
        },
      ],
    });

    await request;
    adminEmailSent = true;
    console.log('Admin email sent successfully to:', ADMIN_EMAIL);
  } catch (err) {
    console.error('Error sending admin email:', err);
  }

  return { customerEmailSent, adminEmailSent };
};

// ─── Reservation Email Templates ───────────────────────────────────────────

// Convert "HH:MM" (24-hour) → "H:MM AM/PM" for display in emails
const formatReservationTime = (t) => {
  if (!t) return t;
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const getReservationCustomerEmailTemplate = (reservation) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Reservation Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Your table has been reserved</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Reservation ID</p>
                  <h2 style="margin: 5px 0 15px 0; color: #E67E22; font-size: 24px; font-weight: bold;">${reservation.reservationId}</h2>
                  <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                    ${reservation.status}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Reservation Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Date</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${reservation.reservationDate}</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Time</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${formatReservationTime(reservation.reservationTime)}</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Party Size</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${reservation.partySize} ${reservation.partySize === 1 ? 'Guest' : 'Guests'}</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Table</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">Table #${reservation.tableNumber} — ${reservation.tableName} (${reservation.tableLocation})</p>
                    </td></tr>
                    ${reservation.specialRequests ? `
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Special Requests</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-style: italic;">${reservation.specialRequests}</p>
                    </td></tr>` : ''}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Your Information</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Name</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${reservation.fullName}</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Phone</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${reservation.phone}</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">We look forward to seeing you! Please arrive a few minutes early.</p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">If you need to cancel or modify, please contact us as soon as possible.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const getReservationAdminEmailTemplate = (reservation) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Reservation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">New Reservation!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Action Required — Confirm Reservation</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background-color: #FFFBF5; border-left: 4px solid #E67E22;">
                  <p style="margin: 0; color: #D35400; font-size: 16px; font-weight: bold;">🗓️ New table reservation requires confirmation!</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Reservation ID</p>
                  <h2 style="margin: 5px 0 15px 0; color: #E67E22; font-size: 24px; font-weight: bold;">${reservation.reservationId}</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Booked At</p>
                  <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${new Date().toLocaleString()}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Reservation Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Date & Time</p>
                      <p style="margin: 3px 0 0 0; color: #E67E22; font-size: 18px; font-weight: bold;">${reservation.reservationDate} at ${formatReservationTime(reservation.reservationTime)}</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Table</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">Table #${reservation.tableNumber} — ${reservation.tableName} (${reservation.tableLocation})</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Party Size</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${reservation.partySize} ${reservation.partySize === 1 ? 'Guest' : 'Guests'}</p>
                    </td></tr>
                    ${reservation.specialRequests ? `
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Special Requests</p>
                      <p style="margin: 3px 0 0 0; color: #E67E22; font-size: 14px; font-style: italic;">${reservation.specialRequests}</p>
                    </td></tr>` : ''}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #E67E22; padding-bottom: 10px;">Customer Information</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Name</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${reservation.fullName}</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Email</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${reservation.email}</p>
                    </td></tr>
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Phone (Call for confirmation)</p>
                      <p style="margin: 3px 0 0 0; color: #E67E22; font-size: 18px; font-weight: bold;">${reservation.phone}</p>
                    </td></tr>
                    ${reservation.isGuestReservation ? `
                    <tr><td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Guest Type</p>
                      <p style="margin: 3px 0 0 0; color: #1f2937; font-size: 16px;">Walk-in / Guest</p>
                    </td></tr>` : ''}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background-color: #fffbeb;">
                  <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">Action Items:</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                    <li>Call customer at ${reservation.phone} to confirm reservation</li>
                    <li>Mark Table #${reservation.tableNumber} as Reserved for ${reservation.reservationDate} at ${formatReservationTime(reservation.reservationTime)}</li>
                    <li>Prepare table setup for ${reservation.partySize} guests</li>
                    <li>Update reservation status in admin panel</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: bold;">Restaurant Management System</p>
                  <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">This is an automated notification for new reservations</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const sendReservationEmails = async (reservation) => {
  let customerEmailSent = false;
  let adminEmailSent = false;

  // Send customer confirmation email
  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: reservation.email, Name: reservation.fullName }],
          Subject: `Reservation Confirmed — ${reservation.reservationId}`,
          HTMLPart: getReservationCustomerEmailTemplate(reservation),
        },
      ],
    });
    await request;
    customerEmailSent = true;
    console.log('Reservation customer email sent to:', reservation.email);
  } catch (err) {
    console.error('Error sending reservation customer email:', err);
  }

  // Send admin notification email
  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: FROM_EMAIL, Name: 'Restaurant Reservation System' },
          To: [{ Email: ADMIN_EMAIL, Name: 'Restaurant Admin' }],
          Subject: `🗓️ New Reservation — ${reservation.reservationId} — ${reservation.reservationDate} at ${formatReservationTime(reservation.reservationTime)}`,
          HTMLPart: getReservationAdminEmailTemplate(reservation),
        },
      ],
    });
    await request;
    adminEmailSent = true;
    console.log('Reservation admin email sent to:', ADMIN_EMAIL);
  } catch (err) {
    console.error('Error sending reservation admin email:', err);
  }

  return { customerEmailSent, adminEmailSent };
};

module.exports = { sendOrderEmails, sendCustomerEmail, sendAdminEmail, sendReservationEmails };
