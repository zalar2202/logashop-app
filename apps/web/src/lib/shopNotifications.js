/**
 * E-commerce Notification Helpers
 *
 * Pre-defined notification functions for order lifecycle events.
 * Each function:
 *   1. Sends in-app notification (stored in DB, pushed via FCM)
 *   2. Optionally sends transactional email with rich HTML template
 *
 * Uses the existing sendNotification() + sendMail() infrastructure.
 */

import { sendNotification, sendBulkNotification } from "@/lib/notifications";
import { sendMail } from "@/lib/mail";
import User from "@/models/User";
import DigitalDelivery from "@/models/DigitalDelivery";
import {
    orderConfirmationEmail,
    orderShippedEmail,
    orderDeliveredEmail,
    passwordResetEmail,
    lowStockAlertEmail,
    welcomeEmail,
} from "@/lib/emailTemplates";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7777";

// ─── Order Confirmed ─────────────────────────────────────────

/**
 * Notify customer that their order has been confirmed.
 * Also sends confirmation email.
 *
 * @param {Object} order - Full order document (populated)
 */
export const notifyOrderConfirmed = async (order) => {
    try {
        const results = { notification: null, email: null };
        let recipientEmail = order.guestEmail;

        // 1. In-app notification (and get email for registered users)
        if (order.userId) {
            const user = await User.findById(order.userId);
            if (user) {
                recipientEmail = user.email;
                results.notification = await sendNotification({
                    recipientId: user._id.toString(),
                    title: "Order Confirmed!",
                    message: `Your order #${order.orderNumber} has been confirmed. Total: $${(order.total / 100).toFixed(2)}`,
                    type: "success",
                    actionUrl: `/account/orders/${order._id}`,
                    actionLabel: "View Order",
                    metadata: {
                        orderNumber: order.orderNumber,
                        orderId: order._id.toString(),
                        total: order.total,
                    },
                });
            }
        }

        // 2. Email (for all orders — registered + guests)
        if (recipientEmail) {
            // Check for digital downloads
            const digitalDeliveries = await DigitalDelivery.find({ orderId: order._id }).populate(
                "productId"
            );
            let orderForEmail = order;

            if (digitalDeliveries && digitalDeliveries.length > 0) {
                const plainOrder = order.toObject ? order.toObject() : { ...order };
                plainOrder.digitalDownloads = digitalDeliveries.map((d) => ({
                    name: d.productId?.name || d.fileName || "Digital Product",
                    token: d.downloadToken,
                    expiresAt: d.expiresAt,
                }));
                orderForEmail = plainOrder;
            }

            const template = orderConfirmationEmail(orderForEmail);
            const emailResult = await sendMail({
                to: recipientEmail,
                subject: template.subject,
                html: template.html,
                text: template.text,
                fromType: "BILLING",
            });
            results.email = emailResult;
        }

        console.log(`✅ Order confirmation sent for #${order.orderNumber}`);
        return results;
    } catch (error) {
        console.error("❌ Failed to send order confirmation:", error);
        // Don't throw — notification failure should not block checkout
        return { error: error.message };
    }
};

// ─── Order Shipped ───────────────────────────────────────────

/**
 * Notify customer that their order has been shipped.
 *
 * @param {Object} order - Order document
 * @param {string} trackingNumber - Carrier tracking number (optional)
 * @param {string} carrier - Carrier name (optional)
 */
export const notifyOrderShipped = async (order, trackingNumber = null, carrier = null) => {
    try {
        const results = { notification: null, email: null };
        let recipientEmail = order.guestEmail;

        // 1. In-app notification
        if (order.userId) {
            const user = await User.findById(order.userId);
            if (user) {
                recipientEmail = user.email;
                results.notification = await sendNotification({
                    recipientId: user._id.toString(),
                    title: "Order Shipped! 🚚",
                    message: `Your order #${order.orderNumber} is on its way!${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}`,
                    type: "info",
                    actionUrl: `/account/orders/${order._id}`,
                    actionLabel: "Track Order",
                    metadata: {
                        orderNumber: order.orderNumber,
                        orderId: order._id.toString(),
                        trackingNumber,
                        carrier,
                    },
                });
            }
        }

        // 2. Email
        if (recipientEmail) {
            const template = orderShippedEmail(order, trackingNumber, carrier);
            const emailResult = await sendMail({
                to: recipientEmail,
                subject: template.subject,
                html: template.html,
                text: template.text,
                fromType: "INFO",
            });
            results.email = emailResult;
        }

        console.log(`✅ Shipped notification sent for #${order.orderNumber}`);
        return results;
    } catch (error) {
        console.error("❌ Failed to send shipped notification:", error);
        return { error: error.message };
    }
};

// ─── Order Delivered ─────────────────────────────────────────

/**
 * Notify customer that their order has been delivered.
 *
 * @param {Object} order - Order document
 */
export const notifyOrderDelivered = async (order) => {
    try {
        const results = { notification: null, email: null };
        let recipientEmail = order.guestEmail;

        if (order.userId) {
            const user = await User.findById(order.userId);
            if (user) {
                recipientEmail = user.email;
                results.notification = await sendNotification({
                    recipientId: user._id.toString(),
                    title: "Order Delivered! 📬",
                    message: `Your order #${order.orderNumber} has been delivered. We hope you love it!`,
                    type: "success",
                    actionUrl: `/account/orders/${order._id}`,
                    actionLabel: "View Order",
                    metadata: {
                        orderNumber: order.orderNumber,
                        orderId: order._id.toString(),
                    },
                });
            }
        }

        if (recipientEmail) {
            const template = orderDeliveredEmail(order);
            const emailResult = await sendMail({
                to: recipientEmail,
                subject: template.subject,
                html: template.html,
                text: template.text,
                fromType: "INFO",
            });
            results.email = emailResult;
        }

        console.log(`✅ Delivered notification sent for #${order.orderNumber}`);
        return results;
    } catch (error) {
        console.error("❌ Failed to send delivered notification:", error);
        return { error: error.message };
    }
};

// ─── Order Status Changed ────────────────────────────────────

/**
 * Dispatch the appropriate notification based on new order status.
 * Call this when an admin updates order status.
 *
 * @param {Object} order - Order document
 * @param {string} newStatus - New status being set
 * @param {string} trackingNumber - Carrier tracking number (for shipped)
 * @param {string} carrier - Carrier name (for shipped)
 */
export const notifyOrderStatusChanged = async (
    order,
    newStatus,
    trackingNumber = null,
    carrier = null
) => {
    switch (newStatus) {
        case "processing":
            // Order moved to processing (payment confirmed)
            if (order.userId) {
                return await sendNotification({
                    recipientId: order.userId.toString(),
                    title: "Order Being Processed",
                    message: `Your order #${order.orderNumber} is now being prepared.`,
                    type: "info",
                    actionUrl: `/account/orders/${order._id}`,
                    actionLabel: "View Order",
                });
            }
            break;

        case "shipped":
            return await notifyOrderShipped(order, trackingNumber, carrier);

        case "delivered":
            return await notifyOrderDelivered(order);

        case "cancelled":
            if (order.userId) {
                return await sendNotification({
                    recipientId: order.userId.toString(),
                    title: "Order Cancelled",
                    message: `Your order #${order.orderNumber} has been cancelled. Contact us if you have questions.`,
                    type: "warning",
                    actionUrl: `/account/orders/${order._id}`,
                    actionLabel: "View Details",
                });
            }
            break;

        case "refunded":
            if (order.userId) {
                return await sendNotification({
                    recipientId: order.userId.toString(),
                    title: "Order Refunded",
                    message: `Your order #${order.orderNumber} has been refunded. The refund will appear in your account shortly.`,
                    type: "info",
                    actionUrl: `/account/orders/${order._id}`,
                    actionLabel: "View Details",
                });
            }
            break;
    }
};

// ─── Password Reset Notification ─────────────────────────────

/**
 * Send password reset email to user.
 *
 * @param {Object} user - User document
 * @param {string} resetToken - Unique reset token
 */
export const notifyPasswordReset = async (user, resetToken) => {
    try {
        const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
        const template = passwordResetEmail(user, resetUrl);

        const result = await sendMail({
            to: user.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
            fromType: "SUPPORT",
        });

        console.log(`✅ Password reset email sent to ${user.email}`);
        return result;
    } catch (error) {
        console.error("❌ Failed to send password reset email:", error);
        return { success: false, error: error.message };
    }
};

// ─── Low Stock Alert (Admin) ─────────────────────────────────

/**
 * Notify all admins about products with low stock.
 * Called from a cron job or stock-check utility.
 *
 * @param {Array} products - Array of { name, sku, stockQuantity } below threshold
 * @param {number} threshold - Stock level that triggered the alert
 */
export const notifyLowStock = async (products, threshold = 5) => {
    try {
        if (!products.length) return;

        // Find all admin users
        const admins = await User.find({
            role: { $in: ["admin", "manager"] },
            status: "active",
        }).select("_id email");

        if (!admins.length) return;

        const results = { notifications: 0, emails: 0 };

        // 1. In-app notifications to all admins
        const adminIds = admins.map((a) => a._id.toString());
        const notifResult = await sendBulkNotification({
            recipientIds: adminIds,
            title: `⚠️ Low Stock Alert: ${products.length} product${products.length !== 1 ? "s" : ""}`,
            message: `${products.map((p) => `${p.name} (${p.stockQuantity} left)`).join(", ")}`,
            type: "warning",
            actionUrl: "/panel/admin/products",
            actionLabel: "Manage Products",
        });
        results.notifications = notifResult.created;

        // 2. Email to all admins
        const template = lowStockAlertEmail(products);
        for (const admin of admins) {
            if (admin.email) {
                await sendMail({
                    to: admin.email,
                    subject: template.subject,
                    html: template.html,
                    text: template.text,
                    fromType: "INFO",
                });
                results.emails++;
            }
        }

        console.log(
            `✅ Low stock alert sent to ${admins.length} admins (${products.length} products below ${threshold})`
        );
        return results;
    } catch (error) {
        console.error("❌ Failed to send low stock alert:", error);
        return { error: error.message };
    }
};

// ─── Welcome Notification ────────────────────────────────────

/**
 * Send welcome notification + email to newly registered user.
 *
 * @param {Object} user - Newly created user document
 */
export const notifyWelcome = async (user) => {
    try {
        const results = { notification: null, email: null };

        // In-app notification
        results.notification = await sendNotification({
            recipientId: user._id.toString(),
            title: "Welcome to LogaShop! 🎉",
            message: "Your account is ready. Start exploring our products!",
            type: "success",
            actionUrl: "/products",
            actionLabel: "Start Shopping",
        });

        // Welcome email
        if (user.email) {
            const template = welcomeEmail(user);
            const emailResult = await sendMail({
                to: user.email,
                subject: template.subject,
                html: template.html,
                text: template.text,
                fromType: "INFO",
            });
            results.email = emailResult;
        }

        console.log(`✅ Welcome notification sent to ${user.email || user._id}`);
        return results;
    } catch (error) {
        console.error("❌ Failed to send welcome notification:", error);
        return { error: error.message };
    }
};
