import * as Yup from "yup";

/**
 * Admin Registration Validation Schema
 * Defines validation rules for the Register Admin form
 */

export const adminRegistrationSchema = Yup.object({
    firstName: Yup.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters")
        .required("First name is required"),

    lastName: Yup.string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters")
        .required("Last name is required"),

    email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),

    phone: Yup.string()
        .matches(
            /^[\d\s\-\+\(\)]+$/,
            "Please enter a valid phone number"
        )
        .min(10, "Phone number must be at least 10 digits")
        .max(20, "Phone number must not exceed 20 digits")
        .required("Phone number is required"),

    role: Yup.string()
        .oneOf(
            ["super_admin", "admin", "moderator"],
            "Please select a valid role"
        )
        .required("Role is required"),

    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
            /[a-z]/,
            "Password must contain at least one lowercase letter"
        )
        .matches(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
            /[@$!%*?&#]/,
            "Password must contain at least one special character (@$!%*?&#)"
        )
        .required("Password is required"),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Please confirm your password"),

    bio: Yup.string()
        .max(500, "Bio must not exceed 500 characters")
        .nullable(),

    avatar: Yup.mixed()
        .nullable()
        .test(
            "fileSize",
            "File size is too large (max 5MB)",
            (value) => !value || value.size <= 5 * 1024 * 1024
        )
        .test(
            "fileType",
            "Unsupported file format (only images allowed)",
            (value) => !value || value.type?.startsWith("image/")
        ),

    hireDate: Yup.date()
        .nullable()
        .max(new Date(), "Hire date cannot be in the future"),

    startTime: Yup.string()
        .nullable()
        .matches(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Please enter a valid time (HH:MM format)"
        ),

    isActive: Yup.boolean(),

    acceptTerms: Yup.boolean()
        .oneOf([true], "You must accept the terms and conditions")
        .required("You must accept the terms and conditions"),
});

