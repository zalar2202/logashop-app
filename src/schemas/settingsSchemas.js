import * as Yup from 'yup';

// Phone number regex (international format)
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

/**
 * Profile Update Schema
 * For updating user profile information (name, phone, bio, avatar)
 */
export const profileUpdateSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    phone: Yup.string()
        .matches(phoneRegex, 'Invalid phone number format')
        .trim()
        .nullable(),
    bio: Yup.string()
        .max(500, 'Bio must be less than 500 characters')
        .trim()
        .nullable(),
    avatar: Yup.mixed().nullable(), // File validation handled by FileUploadField
    technicalDetails: Yup.object({
        domainName: Yup.string().nullable().trim(),
        serverIP: Yup.string().nullable().trim(),
        serverUser: Yup.string().nullable().trim(),
        serverPassword: Yup.string().nullable(),
        serverPort: Yup.string().nullable().trim(),
    }).nullable(),
});

/**
 * Password Change Schema
 * For changing user password with strong validation
 */
export const passwordChangeSchema = Yup.object({
    currentPassword: Yup.string()
        .required('Current password is required'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(/[@$!%*?&#]/, 'Must contain at least one special character (@$!%*?&#)')
        .notOneOf(
            [Yup.ref('currentPassword')],
            'New password must be different from current password'
        ),
    confirmPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

/**
 * Preferences Update Schema
 * For updating user preferences (notifications, theme, privacy)
 */
export const preferencesSchema = Yup.object({
    emailNotifications: Yup.boolean(),
    pushNotifications: Yup.boolean(),
    notificationFrequency: Yup.string()
        .oneOf(['immediate', 'daily', 'weekly'], 'Invalid notification frequency'),
    theme: Yup.string()
        .oneOf(['light', 'dark', 'system'], 'Invalid theme selection'),
    language: Yup.string(),
    dateFormat: Yup.string(),
    profileVisibility: Yup.string()
        .oneOf(['public', 'private'], 'Invalid visibility setting'),
});

/**
 * Account Deactivation Schema
 * For deactivating account with password verification
 */
export const accountDeactivationSchema = Yup.object({
    password: Yup.string()
        .required('Password is required to deactivate your account'),
    reason: Yup.string()
        .max(500, 'Reason cannot exceed 500 characters')
        .trim()
        .nullable(),
});

/**
 * Account Deletion Schema
 * For permanently deleting account with strong confirmation
 */
export const accountDeletionSchema = Yup.object({
    password: Yup.string()
        .required('Password is required to delete your account'),
    confirmation: Yup.string()
        .required('Please type DELETE to confirm')
        .oneOf(['DELETE'], 'You must type DELETE exactly to confirm account deletion'),
});

/**
 * Data Export Schema
 * For exporting user data
 */
export const dataExportSchema = Yup.object({
    format: Yup.string()
        .required('Export format is required')
        .oneOf(['json', 'csv'], 'Invalid export format'),
});

