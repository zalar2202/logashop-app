/**
 * Firebase Cloud Messaging Service Worker
 *
 * This service worker runs in the background and handles push notifications
 * when the browser/app is closed or not in focus.
 *
 * IMPORTANT: This file must be in the /public directory and served at the root URL.
 *
 * @see https://firebase.google.com/docs/cloud-messaging/js/receive
 */

// Import Firebase scripts for service worker
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const DEBUG_LOGS = false;

/**
 * Firebase configuration
 *
 * IMPORTANT: These values are loaded from a separate config endpoint
 * to avoid hardcoding in source code (GitHub secret scanning).
 *
 * Note: Firebase CLIENT API keys are designed to be public and are safe
 * to expose (they're restricted by domain in Firebase Console settings).
 * However, we load them from an endpoint to avoid GitHub alerts.
 */
let firebaseConfig = null;

// Fetch config from endpoint
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "FIREBASE_CONFIG") {
        firebaseConfig = event.data.config;
        if (firebaseConfig && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        ensureMessaging();
    }
});

// Firebase will be initialized when config is received via postMessage
// Get messaging instance after initialization
let messaging = null;

const handleNotificationDisplay = (payload) => {
    if (!payload) return Promise.resolve();

    if (DEBUG_LOGS) {
        console.log("[firebase-messaging-sw.js] Received background message:", payload);
    }

    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body || "You have a new notification",
        icon: payload.notification?.icon || "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: payload.data?.notificationId || "default",
        data: {
            url: payload.data?.actionUrl || "/notifications",
            ...payload.data,
        },
        requireInteraction: false,
        silent: false,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
};

const handleBackgroundMessage = (payload) => {
    return handleNotificationDisplay(payload);
};

// Initialize messaging when Firebase is ready
const ensureMessaging = () => {
    if (!messaging && firebase.apps.length > 0) {
        messaging = firebase.messaging();
        messaging.onBackgroundMessage(handleBackgroundMessage);
    }
    return messaging;
};

/**
 * Handle background messages (when app is closed/not in focus)
 * This will show a notification automatically
 */
self.addEventListener("push", (event) => {
    ensureMessaging();

    let payload = null;

    try {
        payload = event.data?.json();
    } catch (error) {
        if (DEBUG_LOGS) {
            console.error("[firebase-messaging-sw.js] Failed to parse push payload", error);
        }
    }

    event.waitUntil(handleNotificationDisplay(payload));
});

/**
 * Handle notification click
 * Opens the app and navigates to the relevant page
 */
self.addEventListener("notificationclick", (event) => {
    if (DEBUG_LOGS) {
        console.log("[firebase-messaging-sw.js] Notification clicked:", event.notification);
    }

    event.notification.close();

    const urlToOpen = event.notification.data?.url || "/notifications";

    // Open the app or focus existing window
    event.waitUntil(
        clients.matchAll({ type: "window", includeUnmatched: true }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                        client.focus();
                        client.postMessage({
                        type: "NOTIFICATION_CLICKED",
                        url: urlToOpen,
                    });
                    return;
                }
            }

            // App not open, open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

/**
 * Service Worker lifecycle events
 */
self.addEventListener("install", (event) => {
    if (DEBUG_LOGS) {
        console.log("[firebase-messaging-sw.js] Service Worker installing");
    }
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    if (DEBUG_LOGS) {
        console.log("[firebase-messaging-sw.js] Service Worker activating");
    }
    event.waitUntil(clients.claim());
});
