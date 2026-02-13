import nodemailer from "nodemailer";

/**
 * LogaShop Email Service
 *
 * Uses SMTP settings from environment variables.
 * Supports different "sender" profiles (billing, support, info, etc.)
 */

// SMTP Configuration
const smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

// Default Senders (Independent of SMTP_USER login)
const SENDERS = {
    INFO: `"LogaShop Info" <${process.env.SMTP_FROM_INFO || "info@logatech.net"}>`,
    BILLING: `"LogaShop Billing" <${process.env.SMTP_FROM_BILLING || "billing@logatech.net"}>`,
    SUPPORT: `"LogaShop Support" <${process.env.SMTP_FROM_SUPPORT || "support@logatech.net"}>`,
    CONTACT: `"LogaShop Contact" <${process.env.SMTP_FROM_CONTACT || "contact@logatech.net"}>`,
};

/**
 * Base Email Wrapper Template
 */
const emailTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: white; }
        .logo { font-size: 24px; font-bold: true; margin-bottom: 10px; }
        .content { padding: 40px; background: #ffffff; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; border-top: 1px solid #eee; }
        .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .badge { background: #f3f4f6; padding: 4px 12px; border-radius: 99px; font-size: 12px; color: #4b5563; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LT LogaShop</div>
            <div style="font-size: 14px; opacity: 0.9;">${title || "Notification"}</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LogaShop. All rights reserved.</p>
            <p>You received this email because you are a registered member of LogaShop Panel.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Send Mail Function
 */
export const sendMail = async ({
    to,
    subject,
    html,
    text,
    fromType = "INFO",
    attachments = [],
}) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport(smtpConfig);

        // Verify connection
        await transporter.verify();

        // Send mail
        const info = await transporter.sendMail({
            from: SENDERS[fromType] || SENDERS.INFO,
            to,
            subject,
            text,
            text,
            html: html.trim().startsWith("<!DOCTYPE") ? html : emailTemplate(html, subject),
            attachments,
            attachments,
        });

        console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Email failed:", error);
        return { success: false, error: error.message };
    }
};

export default sendMail;
