/**
 * E-commerce Email Templates
 *
 * Beautiful, responsive HTML email templates for order lifecycle events.
 * All templates use inline styles for maximum email client compatibility.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7777";
const STORE_NAME = "LogaShop";

// ─── Shared Styles ───────────────────────────────────────────

const baseWrapper = (content, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${STORE_NAME}</title>
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        .button { padding: 14px 28px !important; }
    </style>
    <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${STORE_NAME}</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:40px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                            <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                                <a href="${APP_URL}" style="color:#6366f1;text-decoration:none;">Visit Store</a>
                                &nbsp;&middot;&nbsp;
                                <a href="${APP_URL}/track" style="color:#6366f1;text-decoration:none;">Track Order</a>
                                &nbsp;&middot;&nbsp;
                                <a href="${APP_URL}/account" style="color:#6366f1;text-decoration:none;">My Account</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const button = (label, url, color = "#4f46e5") =>
    `<a href="${url}" style="display:inline-block;padding:14px 28px;background:${color};color:#ffffff !important;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:-0.2px;margin-top:8px;">${label}</a>`;

const divider = `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">`;

const itemRow = (item) => `
    <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="width:56px;vertical-align:top;">
                        ${
                            item.image
                                ? `<img src="${item.image}" width="48" height="48" alt="${item.name}" style="border-radius:8px;object-fit:cover;">`
                                : `<div style="width:48px;height:48px;background:#f3f4f6;border-radius:8px;text-align:center;line-height:48px;color:#9ca3af;font-size:18px;">📦</div>`
                        }
                    </td>
                    <td style="vertical-align:top;padding-left:12px;">
                        <p style="margin:0;font-weight:600;font-size:14px;color:#111827;">${item.name}</p>
                        ${item.variantLabel ? `<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${item.variantLabel}</p>` : ""}
                        <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Qty: ${item.quantity}</p>
                    </td>
                    <td style="vertical-align:top;text-align:right;white-space:nowrap;">
                        <p style="margin:0;font-weight:600;font-size:14px;color:#111827;">$${(item.lineTotal / 100).toFixed(2)}</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
`;

// ─── Order Confirmation Email ────────────────────────────────

export const orderConfirmationEmail = (order) => {
    const itemsHtml = order.items.map((item) => itemRow(item)).join("");

    const addr = order.shippingAddress;
    const addressStr = addr
        ? `${addr.firstName} ${addr.lastName}<br>${addr.address1}${addr.address2 ? ", " + addr.address2 : ""}<br>${addr.city}, ${addr.state} ${addr.zipCode}`
        : "N/A";

    const content = `
        <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;background:#ecfdf5;border-radius:50%;display:inline-block;text-align:center;line-height:64px;font-size:28px;margin-bottom:16px;">✅</div>
            <h2 style="margin:0;font-size:24px;color:#111827;letter-spacing:-0.5px;">Order Confirmed!</h2>
            <p style="margin:8px 0 0;color:#6b7280;font-size:15px;">Thank you for your purchase.</p>
        </div>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="font-size:13px;color:#6b7280;">Order Number</td>
                    <td style="text-align:right;font-weight:700;font-size:15px;color:#111827;">#${order.orderNumber}</td>
                </tr>
                <tr>
                    <td style="font-size:13px;color:#6b7280;padding-top:8px;">Date</td>
                    <td style="text-align:right;font-size:13px;color:#374151;padding-top:8px;">
                        ${new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </td>
                </tr>
                ${
                    order.trackingCode
                        ? `<tr>
                            <td style="font-size:13px;color:#6b7280;padding-top:8px;">Tracking Code</td>
                            <td style="text-align:right;font-weight:700;font-size:14px;color:#4f46e5;padding-top:8px;font-family:monospace;letter-spacing:2px;">${order.trackingCode}</td>
                        </tr>`
                        : ""
                }
            </table>
        </div>

        <h3 style="margin:0 0 16px;font-size:15px;color:#111827;">Items Ordered</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${itemsHtml}
        </table>

        ${
            order.digitalDownloads && order.digitalDownloads.length > 0
                ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin:24px 0;">
                    <h3 style="margin:0 0 12px;font-size:16px;color:#0369a1;">📥 Your Digital Downloads</h3>
                    <p style="margin:0 0 16px;font-size:14px;color:#0c4a6e;">Click the button(s) below to download your files.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${order.digitalDownloads
                            .map(
                                (d) => `
                            <tr>
                                <td style="padding:8px 0;border-bottom:1px solid #e0f2fe;">
                                    <p style="margin:0;font-weight:600;font-size:14px;color:#0c4a6e;">${d.name}</p>
                                    <p style="margin:2px 0 0;font-size:11px;color:#0284c7;">Expires: ${
                                        d.expiresAt
                                            ? new Date(d.expiresAt).toLocaleDateString()
                                            : "Never"
                                    }</p>
                                </td>
                                <td style="text-align:right;padding:8px 0;border-bottom:1px solid #e0f2fe;">
                                    <a href="${APP_URL}/api/download/${d.token}" style="display:inline-block;padding:6px 12px;background:#0ea5e9;color:#ffffff !important;text-decoration:none;border-radius:6px;font-size:12px;font-weight:600;">Download</a>
                                </td>
                            </tr>`
                            )
                            .join("")}
                    </table>
                   </div>`
                : ""
        }

        ${divider}

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            <tr>
                <td style="color:#6b7280;padding:4px 0;">Subtotal</td>
                <td style="text-align:right;color:#374151;">$${(order.subtotal / 100).toFixed(2)}</td>
            </tr>
            <tr>
                <td style="color:#6b7280;padding:4px 0;">Shipping</td>
                <td style="text-align:right;color:#374151;">${order.shippingCost === 0 ? "FREE" : "$" + (order.shippingCost / 100).toFixed(2)}</td>
            </tr>
            <tr>
                <td style="color:#6b7280;padding:4px 0;">Tax</td>
                <td style="text-align:right;color:#374151;">$${(order.taxAmount / 100).toFixed(2)}</td>
            </tr>
            <tr>
                <td style="font-weight:700;font-size:16px;color:#111827;padding:12px 0 0;border-top:2px solid #e5e7eb;">Total</td>
                <td style="text-align:right;font-weight:700;font-size:16px;color:#4f46e5;padding:12px 0 0;border-top:2px solid #e5e7eb;">$${(order.total / 100).toFixed(2)}</td>
            </tr>
        </table>

        ${divider}

        <h3 style="margin:0 0 8px;font-size:15px;color:#111827;">Shipping Address</h3>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">${addressStr}</p>

        <div style="text-align:center;margin-top:32px;">
            ${
                order.trackingCode
                    ? button("Track Your Order", `${APP_URL}/track`)
                    : button("View Order", `${APP_URL}/account/orders`)
            }
        </div>
    `;

    return {
        subject: `Order Confirmed: #${order.orderNumber}`,
        html: baseWrapper(content, `Your order #${order.orderNumber} has been confirmed!`),
        text: `Order confirmed! Order #${order.orderNumber}. Total: $${(order.total / 100).toFixed(2)}. Track at: ${APP_URL}/track`,
    };
};

// ─── Order Shipped Email ─────────────────────────────────────

export const orderShippedEmail = (order, trackingNumber = null, carrier = null) => {
    const addr = order.shippingAddress;
    const addressStr = addr
        ? `${addr.firstName} ${addr.lastName}, ${addr.address1}, ${addr.city}, ${addr.state} ${addr.zipCode}`
        : "N/A";

    const content = `
        <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;background:#eff6ff;border-radius:50%;display:inline-block;text-align:center;line-height:64px;font-size:28px;margin-bottom:16px;">🚚</div>
            <h2 style="margin:0;font-size:24px;color:#111827;">Your Order is on its Way!</h2>
            <p style="margin:8px 0 0;color:#6b7280;font-size:15px;">Order #${order.orderNumber} has been shipped.</p>
        </div>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="font-size:13px;color:#6b7280;">Order Number</td>
                    <td style="text-align:right;font-weight:700;color:#111827;">#${order.orderNumber}</td>
                </tr>
                ${
                    carrier
                        ? `<tr><td style="font-size:13px;color:#6b7280;padding-top:8px;">Carrier</td>
                           <td style="text-align:right;color:#374151;padding-top:8px;">${carrier}</td></tr>`
                        : ""
                }
                ${
                    trackingNumber
                        ? `<tr><td style="font-size:13px;color:#6b7280;padding-top:8px;">Tracking Number</td>
                           <td style="text-align:right;font-weight:700;color:#4f46e5;padding-top:8px;font-family:monospace;">${trackingNumber}</td></tr>`
                        : ""
                }
            </table>
        </div>

        <h3 style="margin:0 0 8px;font-size:15px;color:#111827;">Shipping To</h3>
        <p style="margin:0;font-size:14px;color:#6b7280;">${addressStr}</p>

        <div style="text-align:center;margin-top:32px;">
            ${
                order.trackingCode
                    ? button("Track Order", `${APP_URL}/track`)
                    : button("View Order", `${APP_URL}/account/orders`)
            }
        </div>
    `;

    return {
        subject: `Your Order #${order.orderNumber} Has Shipped! 🚚`,
        html: baseWrapper(content, `Your order has been shipped!`),
        text: `Your order #${order.orderNumber} has been shipped. ${trackingNumber ? `Tracking: ${trackingNumber}` : ""} Track at: ${APP_URL}/track`,
    };
};

// ─── Order Delivered Email ───────────────────────────────────

export const orderDeliveredEmail = (order) => {
    const content = `
        <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;background:#ecfdf5;border-radius:50%;display:inline-block;text-align:center;line-height:64px;font-size:28px;margin-bottom:16px;">📬</div>
            <h2 style="margin:0;font-size:24px;color:#111827;">Your Order Has Been Delivered!</h2>
            <p style="margin:8px 0 0;color:#6b7280;font-size:15px;">Order #${order.orderNumber} was delivered successfully.</p>
        </div>

        <p style="font-size:15px;color:#374151;line-height:1.7;">
            We hope you love your purchase! If you have any questions or issues with your order, please don't hesitate to reach out.
        </p>

        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
            <p style="margin:0;font-size:14px;color:#92400e;">⭐ Enjoyed your purchase? Leave a review to help other shoppers!</p>
        </div>

        <div style="text-align:center;">
            ${button("View Order", `${APP_URL}/account/orders`)}
        </div>
    `;

    return {
        subject: `Order #${order.orderNumber} Delivered! 📬`,
        html: baseWrapper(content, `Your order has been delivered!`),
        text: `Your order #${order.orderNumber} has been delivered. Visit ${APP_URL}/account/orders to view details.`,
    };
};

// ─── Password Reset Email ────────────────────────────────────

export const passwordResetEmail = (user, resetUrl) => {
    const content = `
        <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;background:#fef3c7;border-radius:50%;display:inline-block;text-align:center;line-height:64px;font-size:28px;margin-bottom:16px;">🔑</div>
            <h2 style="margin:0;font-size:24px;color:#111827;">Reset Your Password</h2>
        </div>

        <p style="font-size:15px;color:#374151;line-height:1.7;">
            Hello ${user.firstName || user.name || "there"},
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;">
            We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.
        </p>

        <div style="text-align:center;margin:32px 0;">
            ${button("Reset Password", resetUrl, "#dc2626")}
        </div>

        <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
        </p>

        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-top:24px;">
            <p style="margin:0;font-size:12px;color:#991b1b;">
                ⚠️ <strong>Security tip:</strong> Never share this link with anyone. ${STORE_NAME} will never ask for your password.
            </p>
        </div>
    `;

    return {
        subject: `Reset your ${STORE_NAME} password`,
        html: baseWrapper(content, `Reset your password for ${STORE_NAME}`),
        text: `Reset your password by visiting: ${resetUrl}. This link expires in 1 hour.`,
    };
};

// ─── Low Stock Alert (Admin) ─────────────────────────────────

export const lowStockAlertEmail = (products) => {
    const rows = products
        .map(
            (p) => `
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;font-weight:500;">${p.name}</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;color:#6b7280;">${p.sku || "—"}</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="display:inline-block;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:600;background:${p.stockQuantity === 0 ? "#fef2f2" : "#fef3c7"};color:${p.stockQuantity === 0 ? "#991b1b" : "#92400e"};">
                        ${p.stockQuantity === 0 ? "Out of Stock" : p.stockQuantity + " left"}
                    </span>
                </td>
            </tr>`
        )
        .join("");

    const content = `
        <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;background:#fef3c7;border-radius:50%;display:inline-block;text-align:center;line-height:64px;font-size:28px;margin-bottom:16px;">⚠️</div>
            <h2 style="margin:0;font-size:24px;color:#111827;">Low Stock Alert</h2>
            <p style="margin:8px 0 0;color:#6b7280;font-size:15px;">${products.length} product${products.length !== 1 ? "s" : ""} ${products.length !== 1 ? "are" : "is"} running low on stock.</p>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr style="border-bottom:2px solid #e5e7eb;">
                <td style="padding:8px 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Product</td>
                <td style="padding:8px 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">SKU</td>
                <td style="padding:8px 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Stock</td>
            </tr>
            ${rows}
        </table>

        <div style="text-align:center;margin-top:32px;">
            ${button("Manage Products", `${APP_URL}/panel/admin/products`, "#f59e0b")}
        </div>
    `;

    return {
        subject: `⚠️ Low Stock Alert: ${products.length} product${products.length !== 1 ? "s" : ""} need attention`,
        html: baseWrapper(content, `${products.length} products are running low on stock`),
        text: `Low stock alert: ${products.map((p) => `${p.name} (${p.stockQuantity} left)`).join(", ")}`,
    };
};

// ─── Welcome Email ───────────────────────────────────────────

export const welcomeEmail = (user) => {
    const content = `
        <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;background:#eff6ff;border-radius:50%;display:inline-block;text-align:center;line-height:64px;font-size:28px;margin-bottom:16px;">🎉</div>
            <h2 style="margin:0;font-size:24px;color:#111827;">Welcome to ${STORE_NAME}!</h2>
        </div>

        <p style="font-size:15px;color:#374151;line-height:1.7;">
            Hello ${user.firstName || user.name || "there"},
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;">
            Thanks for creating an account. You're all set to start shopping and enjoy our curated collection of quality products at great prices.
        </p>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0;">
            <h3 style="margin:0 0 12px;font-size:14px;color:#111827;">What you can do:</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">🛒 &nbsp; Browse and shop products</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">❤️ &nbsp; Save favorites to your wishlist</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">📦 &nbsp; Track all your orders</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">📍 &nbsp; Manage your address book</td></tr>
            </table>
        </div>

        <div style="text-align:center;">
            ${button("Start Shopping", `${APP_URL}/products`)}
        </div>
    `;

    return {
        subject: `Welcome to ${STORE_NAME}! 🎉`,
        html: baseWrapper(content, `Welcome to ${STORE_NAME}!`),
        text: `Welcome to ${STORE_NAME}! Start shopping at ${APP_URL}/products`,
    };
};
