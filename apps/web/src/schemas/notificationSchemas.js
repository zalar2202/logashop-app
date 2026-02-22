/**
 * Notification Validation Schemas
 * Yup schemas for notification forms
 */

import * as Yup from "yup";

/**
 * Send Notification Schema (Admin)
 */
export const sendNotificationSchema = Yup.object({
    recipientType: Yup.string()
        .required("Recipient type is required")
        .oneOf(["single", "all", "role"], "Invalid recipient type"),

    recipients: Yup.mixed().when("recipientType", {
        is: "single",
        then: (schema) => schema.required("Please select a user"),
        otherwise: (schema) =>
            schema.when("recipientType", {
                is: "role",
                then: (schema) => schema.required("Please select a role"),
                otherwise: () => Yup.mixed().notRequired(),
            }),
    }),

    title: Yup.string()
        .required("Title is required")
        .max(100, "Title cannot exceed 100 characters"),

    message: Yup.string()
        .required("Message is required")
        .max(500, "Message cannot exceed 500 characters"),

    type: Yup.string()
        .required("Type is required")
        .oneOf(
            ["info", "success", "warning", "error", "system", "admin"],
            "Invalid notification type"
        ),

    actionUrl: Yup.string()
        .nullable()
        .matches(
            /^(\/[a-zA-Z0-9\-_/]*)?$/,
            "Action URL must be a valid internal path (e.g., /dashboard)"
        ),

    actionLabel: Yup.string()
        .nullable()
        .max(50, "Action label cannot exceed 50 characters"),
});

