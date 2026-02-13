/**
 * Firebase Client SDK Configuration
 * 
 * Initializes Firebase app and Firebase Cloud Messaging (FCM) for push notifications.
 * This file runs in the browser and handles:
 * - Firebase app initialization
 * - FCM instance creation
 * - Notification permission requests
 * - FCM token generation and retrieval
 * 
 * @see https://firebase.google.com/docs/cloud-messaging/js/client
 */

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

/**
 * Firebase configuration object from Firebase Console
 * These values are safe to expose in client-side code
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Check if Firebase config is valid (not placeholder values)
 */
const isValidFirebaseConfig = () => {
    const apiKey = firebaseConfig.apiKey;
    return apiKey && apiKey !== "placeholder" && apiKey.length > 10;
};

/**
 * Initialize Firebase app (singleton pattern)
 * Prevents multiple initializations
 * Only initializes if valid config is present
 */
let firebaseApp = null;
if (typeof window !== "undefined" && isValidFirebaseConfig()) {
    try {
        if (!getApps().length) {
            firebaseApp = initializeApp(firebaseConfig);
        } else {
            firebaseApp = getApps()[0];
        }
    } catch (error) {
        console.warn("Firebase initialization failed:", error.message);
    }
}

/**
 * Get Firebase Cloud Messaging instance
 * Only works in browser (not server-side)
 * 
 * @returns {Messaging|null} FCM instance or null if not in browser
 */
export const getMessagingInstance = () => {
    if (typeof window === "undefined" || !firebaseApp) {
        return null;
    }
    
    try {
        return getMessaging(firebaseApp);
    } catch (error) {
        console.error("Error getting messaging instance:", error);
        return null;
    }
};

/**
 * Request notification permission and get FCM token
 * This is the main function to call when setting up push notifications
 * 
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestNotificationPermission = async () => {
    try {
        // Check if browser supports notifications
        if (!("Notification" in window)) {
            console.warn("This browser does not support notifications");
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission !== "granted") {
            console.log("Notification permission denied");
            return null;
        }

        console.log("Notification permission granted");

        // Get FCM token
        const messaging = getMessagingInstance();
        if (!messaging) {
            console.error("Messaging instance not available");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
            console.log("FCM Token generated:", token);
            return token;
        } else {
            console.log("No registration token available");
            return null;
        }
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return null;
    }
};

/**
 * Listen for foreground messages (when app is open)
 * Call this function to handle notifications when user is actively using the app
 * 
 * @param {Function} callback - Function to call when message received
 * @returns {Function} Unsubscribe function
 */
export const onForegroundMessage = (callback) => {
    const messaging = getMessagingInstance();
    if (!messaging) {
        console.debug("Messaging instance not available - foreground listener skipped");
        return () => {};
    }

    return onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        callback(payload);
    });
};

/**
 * Get current FCM token (if already generated)
 * Useful for checking if user has already granted permission
 * 
 * @returns {Promise<string|null>} Current FCM token or null
 */
export const getCurrentToken = async () => {
    try {
        const messaging = getMessagingInstance();
        if (!messaging) {
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        return token || null;
    } catch (error) {
        console.error("Error getting current token:", error);
        return null;
    }
};

/**
 * Check if notifications are supported and permitted
 * 
 * @returns {boolean} True if notifications are available
 */
export const isNotificationSupported = () => {
    return typeof window !== "undefined" && "Notification" in window;
};

/**
 * Get current notification permission status
 * 
 * @returns {NotificationPermission|null} "granted", "denied", "default", or null
 */
export const getNotificationPermission = () => {
    if (!isNotificationSupported()) {
        return null;
    }
    return Notification.permission;
};

export { firebaseApp };

