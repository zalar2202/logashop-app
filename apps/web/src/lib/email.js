/**
 * Email utility - Re-exports from mail.js with alternative naming
 */

import { sendMail } from './mail';

/**
 * Send an email using the email service
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} [options.text] - Plain text content (optional)
 * @param {string} [options.fromType] - Sender type: INFO, BILLING, SUPPORT, CONTACT
 * @param {Array} [options.attachments] - Email attachments
 */
export const sendEmail = async ({ to, subject, html, text, fromType = 'BILLING', attachments = [] }) => {
    return await sendMail({
        to,
        subject,
        html,
        text,
        fromType,
        attachments
    });
};

export default sendEmail;
