import * as Yup from 'yup';

/**
 * Login Form Validation Schema
 */
export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required')
        .trim()
        .lowercase(),
    
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

/**
 * Signup Form Validation Schema
 */
export const signupSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required')
        .trim()
        .lowercase(),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

/**
 * Initial values for login form
 */
export const loginInitialValues = {
    email: '',
    password: '',
};

/**
 * Initial values for signup form
 */
export const signupInitialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
};

