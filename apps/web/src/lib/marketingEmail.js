/**
 * Marketing email HTML builder.
 * Mirrors the PreviewCard layout from Email Marketing page.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://logashop.example.com";

/**
 * @param {Object} opts
 * @param {string} opts.subject
 * @param {string} [opts.preheader]
 * @param {string} opts.headline
 * @param {string} opts.content
 * @param {string} [opts.ctaText]
 * @param {string} [opts.ctaUrl]
 * @param {string} [opts.templateType]
 * @param {string} [opts.recipientEmail] - For unsubscribe link
 * @returns {string} Full HTML email
 */
export function buildMarketingHtml({
    subject,
    preheader = "",
    headline = "Your Headline Here",
    content = "",
    ctaText = "",
    ctaUrl = "",
    templateType = "newsletter",
    recipientEmail = "",
}) {
    const unsubscribeUrl = recipientEmail
        ? `${APP_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
        : `${APP_URL}/unsubscribe`;

    const ctaHtml =
        ctaText && ctaUrl
            ? `
        <div style="margin-top: 24px;">
            <a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                ${ctaText}
            </a>
        </div>
        `
            : "";

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject || "Newsletter"}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td { font-family: Arial, sans-serif !important; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    ${preheader ? `<div style="max-height:0; overflow:hidden; line-height:0; font-size:1px;">${preheader}</div>` : ""}
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
        <div style="background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="height: 8px; background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);"></div>
            <div style="padding: 24px; text-align: center;">
                <div style="font-weight: bold; font-size: 20px; color: #111827; margin-bottom: 8px;">LogaShop</div>
                <div style="height: 1px; background: #f3f4f6; margin: 16px 0;"></div>
                <div style="margin-bottom: 16px;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: #ede9fe; color: #7c3aed;">
                        ${templateType}
                    </span>
                </div>
                <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0; line-height: 1.3;">
                    ${headline}
                </h1>
                <div style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${content && content.includes("<") ? content : (content || "").replace(/\n/g, "<br>")}</div>
                ${ctaHtml}
            </div>
            <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} LogaShop. All rights reserved.</p>
                <p style="margin: 8px 0 0 0;">123 Tech Avenue, Silicon Valley</p>
                <div style="margin-top: 12px;">
                    <a href="${unsubscribeUrl}" style="color: #6366f1; text-decoration: none;">Unsubscribe</a>
                    <span style="margin: 0 4px;">&bull;</span>
                    <a href="${APP_URL}" style="color: #6366f1; text-decoration: none;">View in Browser</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
