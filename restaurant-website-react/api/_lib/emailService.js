const Mailjet = require('node-mailjet');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'shiningstardeveloper@gmail.com';
const FROM_EMAIL = process.env.MAILJET_FROM_EMAIL || 'shawaizbutt555@gmail.com';
const FROM_NAME = process.env.MAILJET_FROM_NAME || 'Restaurant';

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const getAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const formatOrderItems = (items, currencySymbol) => {
  return items
    .map((item) => {
      if (item.isDeal) {
        // ── Deal item ──────────────────────────────────────────────
        const packageItems = (item.dealItems || [])
          .map((di) => {
            const qty = (di.quantity || 1) > 1 ? `<strong style="color:#E67E22;">${di.quantity}&times;</strong> ` : '';
            return `<span style="display:inline-block; background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; font-size:12px; font-weight:600; padding:3px 10px; border-radius:20px; margin:2px 3px 2px 0;">${qty}${di.name}</span>`;
          })
          .join('');

        // Deal images are GridFS (localhost-only), always use the gift-box placeholder
        const dealImageUrl = null;

        return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; background-color: #fffbf5;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="item-image-cell" style="width:80px; min-width:80px; max-width:80px; padding-right:12px; vertical-align:top;">
                  ${dealImageUrl
                    ? `<img src="${dealImageUrl}" alt="${item.name}" width="80" height="80" style="width:80px; height:80px; object-fit:cover; border-radius:10px; display:block; border:none;" />`
                    : `<table width="80" height="80" cellpadding="0" cellspacing="0" border="0" style="background:#fed7aa; border-radius:10px; width:80px; height:80px;"><tr><td align="center" valign="middle" style="color:#9a3412; font-size:28px; text-align:center;">&#127873;</td></tr></table>`
                  }
                </td>
                <td style="vertical-align:top;">
                  <div style="display:inline-block; background:#E67E22; color:#fff; font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:3px 10px; border-radius:20px; margin-bottom:6px;">Deal</div>
                  <h4 style="margin: 0 0 5px 0; color: #1f2937; font-size: 15px; font-weight: 700;">${item.name}</h4>
                  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">Qty: ${item.quantity}</p>
                  <p style="margin: 0; color: #E67E22; font-weight: bold; font-size: 15px;">${currencySymbol}${(item.price * item.quantity).toFixed(2)}</p>
                </td>
              </tr>
              ${packageItems ? `
              <tr>
                <td colspan="2" style="padding-top: 10px;">
                  <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #fed7aa;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Package Includes:</p>
                    <div>${packageItems}</div>
                  </div>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>
        `;
      }

      // ── Regular item ───────────────────────────────────────────
      const imageUrl = getAbsoluteImageUrl(item.image) || 'https://via.placeholder.com/100x100?text=No+Image';

      let itemText = `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="item-image-cell" style="width:80px; min-width:80px; max-width:80px; padding-right:12px; vertical-align:top;">
                  <img src="${imageUrl}" alt="${item.name}" width="80" height="80" style="width:80px; height:80px; object-fit:cover; border-radius:10px; display:block; border:none;" />
                </td>
                <td style="vertical-align:top;">
                  <h4 style="margin: 0 0 5px 0; color: #1f2937; font-size: 15px; font-weight: 600;">${item.name}</h4>
                  ${item.size ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">Size: ${item.size}</p>` : ''}
                  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">Qty: ${item.quantity}</p>
                  <p style="margin: 0; color: #E67E22; font-weight: bold; font-size: 15px;">${currencySymbol}${(item.price * item.quantity).toFixed(2)}</p>
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
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${drink.name} ${drink.quantity > 1 ? `x${drink.quantity}` : ''} - ${currencySymbol}${(drink.price * drink.quantity).toFixed(2)}</p>`;
          });
        }

        if (item.addOns.desserts?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Desserts:</p>`;
          item.addOns.desserts.forEach((dessert) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${dessert.name} ${dessert.quantity > 1 ? `x${dessert.quantity}` : ''} - ${currencySymbol}${(dessert.price * dessert.quantity).toFixed(2)}</p>`;
          });
        }

        if (item.addOns.extras?.length > 0) {
          itemText += `<p style="margin: 5px 0 2px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Extras:</p>`;
          item.addOns.extras.forEach((extra) => {
            itemText += `<p style="margin: 0 0 3px 0; color: #4b5563; font-size: 13px; padding-left: 15px;">• ${extra.name} ${extra.quantity > 1 ? `x${extra.quantity}` : ''} - ${currencySymbol}${(extra.price * extra.quantity).toFixed(2)}</p>`;
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
      <style>
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 10px !important; }
          .email-container { width: 100% !important; border-radius: 8px !important; }
          .email-header { padding: 24px 16px !important; }
          .email-header h1 { font-size: 24px !important; }
          .email-header p { font-size: 14px !important; }
          .email-section { padding: 16px !important; }
          .section-title { font-size: 17px !important; }
          .summary-total-label { font-size: 16px !important; }
          .summary-total-value { font-size: 18px !important; }
          .item-image-cell { display: none !important; width: 0 !important; min-width: 0 !important; max-width: 0 !important; padding: 0 !important; overflow: hidden !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color: #f9fafb; padding: 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td class="email-header" style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Order Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 15px;">Thank you for your order</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px 16px 20px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Order ID</p>
                  <h2 style="margin: 5px 0 12px 0; color: #E67E22; font-size: 20px; font-weight: bold; word-break: break-all;">${order.orderId}</h2>
                  <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 7px 18px; border-radius: 20px; font-weight: bold; font-size: 13px;">
                    ${order.status}
                  </div>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Customer Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 7px 0;"><p style="margin: 0; color: #6b7280; font-size: 13px;">Name</p><p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${order.customerInfo.fullName}</p></td></tr>
                    <tr><td style="padding: 7px 0;"><p style="margin: 0; color: #6b7280; font-size: 13px;">Email</p><p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600; word-break: break-all;">${order.customerInfo.email}</p></td></tr>
                    <tr><td style="padding: 7px 0;"><p style="margin: 0; color: #6b7280; font-size: 13px;">Phone</p><p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${order.customerInfo.phone}</p></td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Delivery Address</h3>
                  <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                    ${order.customerInfo.address}<br/>
                    ${order.customerInfo.city}${order.customerInfo.postalCode ? `, ${order.customerInfo.postalCode}` : ''}
                  </p>
                  ${order.customerInfo.additionalNotes ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px; font-style: italic;">Note: ${order.customerInfo.additionalNotes}</p>` : ''}
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Order Items</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${formatOrderItems(order.items, order.currencySymbol || 'Rs')}
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Order Summary</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 7px 0; color: #6b7280; font-size: 14px;">Subtotal</td><td align="right" style="padding: 7px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${order.currencySymbol || 'Rs'}${order.subtotal.toFixed(2)}</td></tr>
                    <tr><td style="padding: 7px 0; color: #6b7280; font-size: 14px;">Delivery Fee</td><td align="right" style="padding: 7px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${order.currencySymbol || 'Rs'}${order.deliveryFee.toFixed(2)}</td></tr>
                    <tr style="border-top: 2px solid #E67E22;"><td class="summary-total-label" style="padding: 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Total</td><td align="right" class="summary-total-value" style="padding: 10px 0; color: #E67E22; font-size: 20px; font-weight: bold;">${order.currencySymbol || 'Rs'}${order.total.toFixed(2)}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <div style="background-color: #FFFBF5; border-left: 4px solid #E67E22; padding: 14px; border-radius: 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">Payment Method</p>
                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 15px; font-weight: bold;">${order.paymentMethod}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Your order will be delivered soon!</p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">If you have any questions, please contact us.</p>
                  <div style="margin-top: 16px;">
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
      <style>
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 10px !important; }
          .email-container { width: 100% !important; border-radius: 8px !important; }
          .email-header { padding: 24px 16px !important; }
          .email-header h1 { font-size: 22px !important; }
          .email-header p { font-size: 13px !important; }
          .email-section { padding: 16px !important; }
          .section-title { font-size: 17px !important; }
          .summary-total-label { font-size: 14px !important; }
          .summary-total-value { font-size: 18px !important; }
          .item-image-cell { display: none !important; width: 0 !important; min-width: 0 !important; max-width: 0 !important; padding: 0 !important; overflow: hidden !important; }
          .action-list { padding-left: 16px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color: #f9fafb; padding: 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td class="email-header" style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">New Order Received!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 15px;">Action Required - Process Order</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px; background-color: #FFFBF5; border-left: 4px solid #E67E22;">
                  <p style="margin: 0; color: #D35400; font-size: 15px; font-weight: bold;">&#9888;&#65039; New order needs to be processed immediately!</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px 16px 20px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Order ID</p>
                  <h2 style="margin: 5px 0 12px 0; color: #E67E22; font-size: 20px; font-weight: bold; word-break: break-all;">${order.orderId}</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Order Date &amp; Time</p>
                  <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${new Date(order.orderDate).toLocaleString()}</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Customer Information</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 12px;">
                    <tr><td style="padding: 7px 0;"><p style="margin: 0; color: #6b7280; font-size: 13px;">Customer Name</p><p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${order.customerInfo.fullName}</p></td></tr>
                    <tr><td style="padding: 7px 0;"><p style="margin: 0; color: #6b7280; font-size: 13px;">Email</p><p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600; word-break: break-all;">${order.customerInfo.email}</p></td></tr>
                    <tr><td style="padding: 7px 0;"><p style="margin: 0; color: #6b7280; font-size: 13px;">Phone (Contact for confirmation)</p><p style="margin: 2px 0 0 0; color: #E67E22; font-size: 17px; font-weight: bold;">${order.customerInfo.phone}</p></td></tr>
                    ${order.userId ? `<tr><td style="padding: 7px 0;"><p style="margin: 0; color: #6b7280; font-size: 13px;">User ID</p><p style="margin: 2px 0 0 0; color: #1f2937; font-size: 14px; font-weight: 600; word-break: break-all;">${order.userId}</p></td></tr>` : ''}
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Delivery Location</h3>
                  <div style="background-color: #FFFBF5; border-radius: 8px; padding: 14px;">
                    <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6; font-weight: 600;">
                      ${order.customerInfo.address}<br/>
                      ${order.customerInfo.city}${order.customerInfo.postalCode ? `, ${order.customerInfo.postalCode}` : ''}
                    </p>
                    ${order.customerInfo.additionalNotes ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;"><p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 600;">Delivery Instructions:</p><p style="margin: 4px 0 0 0; color: #E67E22; font-size: 13px; font-style: italic;">${order.customerInfo.additionalNotes}</p></div>` : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Order Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${formatOrderItems(order.items, order.currencySymbol || 'Rs')}
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Financial Summary</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 12px;">
                    <tr><td style="padding: 7px 0; color: #6b7280; font-size: 14px;">Subtotal</td><td align="right" style="padding: 7px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${order.currencySymbol || 'Rs'}${order.subtotal.toFixed(2)}</td></tr>
                    <tr><td style="padding: 7px 0; color: #6b7280; font-size: 14px;">Delivery Fee</td><td align="right" style="padding: 7px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${order.currencySymbol || 'Rs'}${order.deliveryFee.toFixed(2)}</td></tr>
                    <tr style="border-top: 2px solid #E67E22;"><td class="summary-total-label" style="padding: 10px 0; color: #1f2937; font-size: 15px; font-weight: bold;">Total Amount to Collect</td><td align="right" class="summary-total-value" style="padding: 10px 0; color: #E67E22; font-size: 20px; font-weight: bold;">${order.currencySymbol || 'Rs'}${order.total.toFixed(2)}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <div style="background-color: #FFFBF5; border-left: 4px solid #E67E22; padding: 14px; border-radius: 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">Payment Method</p>
                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 15px; font-weight: bold;">${order.paymentMethod}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px; background-color: #fffbeb;">
                  <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 17px;">Action Items:</h3>
                  <ul class="action-list" style="margin: 0; padding-left: 18px; color: #78350f; font-size: 13px; line-height: 2;">
                    <li>Call customer at ${order.customerInfo.phone} for order confirmation</li>
                    <li>Prepare order items as listed above</li>
                    <li>Assign delivery rider</li>
                    <li>Ensure rider has exact change for ${order.currencySymbol || 'Rs'}${order.total.toFixed(2)}</li>
                    <li>Update order status in system</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: bold;">Restaurant Management System</p>
                  <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">This is an automated notification for new orders</p>
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
          Subject: `🔔 New Order - ${order.orderId} - ${order.currencySymbol || 'Rs'}${order.total.toFixed(2)}`,
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
          Subject: `🔔 New Order - ${order.orderId} - ${order.currencySymbol || 'Rs'}${order.total.toFixed(2)}`,
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
      <style>
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 10px !important; }
          .email-container { width: 100% !important; border-radius: 8px !important; }
          .email-header { padding: 24px 16px !important; }
          .email-header h1 { font-size: 24px !important; }
          .email-header p { font-size: 14px !important; }
          .email-section { padding: 16px !important; }
          .section-title { font-size: 17px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color: #f9fafb; padding: 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td class="email-header" style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Reservation Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 15px;">Your table has been reserved</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px 16px 20px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Reservation ID</p>
                  <h2 style="margin: 5px 0 12px 0; color: #E67E22; font-size: 20px; font-weight: bold; word-break: break-all;">${reservation.reservationId}</h2>
                  <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 7px 18px; border-radius: 20px; font-weight: bold; font-size: 13px;">
                    ${reservation.status}
                  </div>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Reservation Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Date</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${reservation.reservationDate}</p>
                    </td></tr>
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Time</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${formatReservationTime(reservation.reservationTime)}</p>
                    </td></tr>
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Party Size</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${reservation.partySize} ${reservation.partySize === 1 ? 'Guest' : 'Guests'}</p>
                    </td></tr>
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">${reservation.tableSelectionMode === 'stacked' ? 'Table' : (reservation.tables && reservation.tables.length > 1 ? 'Tables' : 'Table')}</p>
                      <p style="margin: 2px 0 0 0;">
                        ${reservation.tableSelectionMode === 'stacked'
                          ? `<span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:bold;background-color:#fef3c7;color:#92400e;border:1px solid #fde68a;">&#9776; Stacked &mdash; Admin will arrange your table</span>`
                          : `<span style="color:#1f2937;font-size:15px;font-weight:600;">${reservation.tables && reservation.tables.length > 1 ? reservation.tables.map(t => `Table #${t.tableNumber} — ${t.name} (${t.location})`).join('<br>') : `Table #${reservation.tableNumber} — ${reservation.tableName} (${reservation.tableLocation})`}</span>`
                        }
                      </p>
                    </td></tr>
                    ${reservation.tableSelectionMode === 'custom' ? `
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Table Selection Mode</p>
                      <p style="margin: 4px 0 0 0;">
                        <span style="display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;">&#9638; Custom Selection</span>
                      </p>
                    </td></tr>` : ''}
                    ${reservation.specialRequests ? `
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Special Requests</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-style: italic;">${reservation.specialRequests}</p>
                    </td></tr>` : ''}
                  </table>
                </td>
              </tr>
              ${reservation.guestDetails && reservation.guestDetails.hasGuestList && reservation.guestDetails.guests && reservation.guestDetails.guests.length > 0 ? `
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Guest List (${reservation.guestDetails.guests.length} ${reservation.guestDetails.guests.length === 1 ? 'Guest' : 'Guests'})</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${reservation.guestDetails.guests.map((guest, i) => `
                    <tr>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="32" valign="middle" style="padding-right: 10px;">
                              <table width="28" height="28" cellpadding="0" cellspacing="0" style="border-collapse: separate; background: #E67E22; border-radius: 50%; width: 28px; height: 28px;">
                                <tr>
                                  <td align="center" valign="middle" style="color: #ffffff; font-size: 13px; font-weight: bold; line-height: 1; mso-line-height-rule: exactly;">
                                    ${i + 1}
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td valign="middle">
                              <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 600;">${guest.name}</p>
                              ${guest.note ? `<p style="margin: 2px 0 0 0; color: #6b7280; font-size: 12px; font-style: italic;">${guest.note}</p>` : ''}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`).join('')}
                  </table>
                </td>
              </tr>` : ''}
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Your Information</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Name</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${reservation.fullName}</p>
                    </td></tr>
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Phone</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${reservation.phone}</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">We look forward to seeing you! Please arrive a few minutes early.</p>
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
      <style>
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 10px !important; }
          .email-container { width: 100% !important; border-radius: 8px !important; }
          .email-header { padding: 24px 16px !important; }
          .email-header h1 { font-size: 22px !important; }
          .email-header p { font-size: 13px !important; }
          .email-section { padding: 16px !important; }
          .section-title { font-size: 17px !important; }
          .datetime-value { font-size: 15px !important; }
          .action-list { padding-left: 16px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color: #f9fafb; padding: 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td class="email-header" style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">New Reservation!</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 15px;">Action Required &#8212; Confirm Reservation</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px; background-color: #FFFBF5; border-left: 4px solid #E67E22;">
                  <p style="margin: 0; color: #D35400; font-size: 15px; font-weight: bold;">&#128197; New table reservation requires confirmation!</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px 16px 20px; text-align: center; background-color: #FFFBF5;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Reservation ID</p>
                  <h2 style="margin: 5px 0 12px 0; color: #E67E22; font-size: 20px; font-weight: bold; word-break: break-all;">${reservation.reservationId}</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Booked At</p>
                  <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${new Date().toLocaleString()}</p>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Reservation Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 12px;">
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Date &amp; Time</p>
                      <p class="datetime-value" style="margin: 2px 0 0 0; color: #E67E22; font-size: 17px; font-weight: bold;">${reservation.reservationDate} at ${formatReservationTime(reservation.reservationTime)}</p>
                    </td></tr>
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">${reservation.tableSelectionMode === 'stacked' ? 'Table' : (reservation.tables && reservation.tables.length > 1 ? 'Tables' : 'Table')}</p>
                      <p style="margin: 2px 0 0 0;">
                        ${reservation.tableSelectionMode === 'stacked'
                          ? `<span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:bold;background-color:#fef3c7;color:#92400e;border:1px solid #fde68a;">&#9776; Stacked &mdash; Assign tables via admin panel</span>`
                          : `<span style="color:#1f2937;font-size:15px;font-weight:600;">${reservation.tables && reservation.tables.length > 1 ? reservation.tables.map(t => `Table #${t.tableNumber} &#8212; ${t.name} (${t.location})`).join('<br>') : `Table #${reservation.tableNumber} &#8212; ${reservation.tableName} (${reservation.tableLocation})`}</span>`
                        }
                      </p>
                    </td></tr>
                    ${reservation.tableSelectionMode === 'custom' ? `
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Table Selection Mode</p>
                      <p style="margin: 4px 0 0 0;">
                        <span style="display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;">&#9638; Custom Selection</span>
                      </p>
                    </td></tr>` : ''}
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Party Size</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${reservation.partySize} ${reservation.partySize === 1 ? 'Guest' : 'Guests'}</p>
                    </td></tr>
                    ${reservation.specialRequests ? `
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Special Requests</p>
                      <p style="margin: 2px 0 0 0; color: #E67E22; font-size: 13px; font-style: italic;">${reservation.specialRequests}</p>
                    </td></tr>` : ''}
                  </table>
                </td>
              </tr>
              ${reservation.guestDetails && reservation.guestDetails.hasGuestList && reservation.guestDetails.guests && reservation.guestDetails.guests.length > 0 ? `
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Guest List (${reservation.guestDetails.guests.length} ${reservation.guestDetails.guests.length === 1 ? 'Guest' : 'Guests'})</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${reservation.guestDetails.guests.map((guest, i) => `
                    <tr>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="32" valign="middle" style="padding-right: 10px;">
                              <table width="28" height="28" cellpadding="0" cellspacing="0" style="border-collapse: separate; background: #E67E22; border-radius: 50%; width: 28px; height: 28px;">
                                <tr>
                                  <td align="center" valign="middle" style="color: #ffffff; font-size: 13px; font-weight: bold; line-height: 1; mso-line-height-rule: exactly;">
                                    ${i + 1}
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td valign="middle">
                              <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 600;">${guest.name}</p>
                              ${guest.note ? `<p style="margin: 2px 0 0 0; color: #6b7280; font-size: 12px; font-style: italic;">${guest.note}</p>` : ''}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`).join('')}
                  </table>
                </td>
              </tr>` : ''}
              <tr>
                <td class="email-section" style="padding: 16px 20px;">
                  <h3 class="section-title" style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">Customer Information</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 12px;">
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Name</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">${reservation.fullName}</p>
                    </td></tr>
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Email</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600; word-break: break-all;">${reservation.email}</p>
                    </td></tr>
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Phone (Call for confirmation)</p>
                      <p style="margin: 2px 0 0 0; color: #E67E22; font-size: 17px; font-weight: bold;">${reservation.phone}</p>
                    </td></tr>
                    ${reservation.isGuestReservation ? `
                    <tr><td style="padding: 7px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">Guest Type</p>
                      <p style="margin: 2px 0 0 0; color: #1f2937; font-size: 15px;">Walk-in / Guest</p>
                    </td></tr>` : ''}
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 16px 20px; background-color: #fffbeb;">
                  <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 17px;">Action Items:</h3>
                  <ul class="action-list" style="margin: 0; padding-left: 18px; color: #78350f; font-size: 13px; line-height: 2;">
                    <li>Call customer at ${reservation.phone} to confirm reservation</li>
                    ${reservation.tableSelectionMode === 'stacked'
                      ? `<li><strong>Assign tables</strong> to this stacked reservation via the admin panel before the reservation date</li>`
                      : `<li>Mark ${reservation.tables && reservation.tables.length > 1 ? reservation.tables.map(t => `Table #${t.tableNumber}`).join(', ') : `Table #${reservation.tableNumber}`} as Reserved for ${reservation.reservationDate} at ${formatReservationTime(reservation.reservationTime)}</li>`
                    }
                    <li>Prepare table setup for ${reservation.partySize} guests</li>
                    <li>Update reservation status in admin panel</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding: 24px 20px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: bold;">Restaurant Management System</p>
                  <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">This is an automated notification for new reservations</p>
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
