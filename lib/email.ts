import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || 'orders@brewtifulcoffee.com';

const transporter = (smtpHost && smtpUser && smtpPass)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

/**
 * Send Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order: any, recipientEmail: string) {
  const subject = `Order Confirmed! #${order.order_number} - Brew-tiful Coffee`;
  const itemsHtml = (order.order_items || order.items || [])
    .map(
      (item: any) => `
      <tr style="border-bottom: 1px solid #5C354C;">
        <td style="padding: 10px; color: #FFF0F5; font-size: 13px;">${item.product?.name || item.name || 'Coffee Item'} (x${item.quantity})</td>
        <td style="padding: 10px; text-align: right; color: #E63E8C; font-weight: bold; font-size: 13px;">₹${((item.price_at_purchase || item.price || 0) * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="background-color: #2A1B24; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFF0F5;">
      <div style="max-w: 600px; margin: 0 auto; background-color: #392431; border-radius: 20px; border: 1px solid #5C354C; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #E63E8C; font-family: Georgia, serif; margin: 0; font-size: 28px;">Brew-tiful Coffee</h1>
          <p style="color: #E0B0FF; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px;">Artisanal Roasts & Fine Brews</p>
        </div>

        <div style="background-color: #2A1B24; border-radius: 15px; padding: 20px; border: 1px solid #5C354C; margin-bottom: 25px;">
          <h2 style="color: #FFF0F5; margin-top: 0; font-size: 20px;">Order Confirmation 🎉</h2>
          <p style="color: #FFF0F5; opacity: 0.8; font-size: 14px; line-height: 1.5;">
            Hi <strong>${order.customer_name}</strong>,<br/>
            Thank you for your order! We're crafting your coffee with care.
          </p>
          <p style="font-size: 13px; color: #E0B0FF; margin-bottom: 0;">
            <strong>Order #:</strong> ${order.order_number}<br/>
            <strong>Payment Method:</strong> ${order.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'Online (Stripe)'}<br/>
            <strong>Status:</strong> ${order.status}
          </p>
        </div>

        <h3 style="color: #FFF0F5; font-size: 16px; border-bottom: 1px solid #5C354C; padding-bottom: 8px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${itemsHtml}
        </table>

        <div style="text-align: right; border-top: 2px solid #5C354C; padding-top: 15px; font-size: 16px; font-weight: bold; color: #FFF0F5;">
          Grand Total: <span style="color: #E63E8C;">₹${Number(order.total).toFixed(2)}</span>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #5C354C; font-size: 11px; color: #FFF0F5; opacity: 0.6;">
          © ${new Date().getFullYear()} Brew-tiful Coffee Shop. All rights reserved.
        </div>
      </div>
    </div>
  `;

  if (transporter && recipientEmail) {
    try {
      await transporter.sendMail({
        from: `Brew-tiful Coffee <${fromEmail}>`,
        to: recipientEmail,
        subject,
        html,
      });
      console.log(`[EMAIL] Sent order confirmation to ${recipientEmail}`);
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send order confirmation:', err);
    }
  } else {
    console.log(`[DEV EMAIL LOG] Order confirmation for #${order.order_number} to ${recipientEmail || order.customer_name}`);
  }
}

/**
 * Send Order Status Update Email
 */
export async function sendOrderStatusUpdateEmail(order: any, recipientEmail: string) {
  const subject = `Order Status Update #${order.order_number}: ${order.status} - Brew-tiful Coffee`;

  const html = `
    <div style="background-color: #2A1B24; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFF0F5;">
      <div style="max-w: 600px; margin: 0 auto; background-color: #392431; border-radius: 20px; border: 1px solid #5C354C; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #E63E8C; font-family: Georgia, serif; margin: 0; font-size: 28px;">Brew-tiful Coffee</h1>
          <p style="color: #E0B0FF; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px;">Artisanal Roasts & Fine Brews</p>
        </div>

        <div style="background-color: #2A1B24; border-radius: 15px; padding: 20px; border: 1px solid #5C354C; margin-bottom: 25px;">
          <h2 style="color: #FFF0F5; margin-top: 0; font-size: 20px;">Order Status Update 🛵</h2>
          <p style="color: #FFF0F5; opacity: 0.8; font-size: 14px; line-height: 1.5;">
            Hi <strong>${order.customer_name}</strong>,<br/>
            Your order status has been updated to:
          </p>
          <div style="display: inline-block; background-color: #E63E8C; color: #ffffff; font-weight: bold; font-size: 14px; padding: 8px 18px; border-radius: 20px; margin: 10px 0; text-transform: uppercase;">
            ${order.status.replace('_', ' ')}
          </div>
          <p style="font-size: 13px; color: #E0B0FF; margin-top: 10px; margin-bottom: 0;">
            <strong>Order #:</strong> ${order.order_number}<br/>
            <strong>Total Amount:</strong> ₹${Number(order.total).toFixed(2)}
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #5C354C; font-size: 11px; color: #FFF0F5; opacity: 0.6;">
          © ${new Date().getFullYear()} Brew-tiful Coffee Shop. All rights reserved.
        </div>
      </div>
    </div>
  `;

  if (transporter && recipientEmail) {
    try {
      await transporter.sendMail({
        from: `Brew-tiful Coffee <${fromEmail}>`,
        to: recipientEmail,
        subject,
        html,
      });
      console.log(`[EMAIL] Sent status update email to ${recipientEmail}`);
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send status update:', err);
    }
  } else {
    console.log(`[DEV EMAIL LOG] Status update to ${order.status} for #${order.order_number} to ${recipientEmail || order.customer_name}`);
  }
}
