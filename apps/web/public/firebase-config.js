/**
 * Firebase Configuration Loader for Service Worker
 * 
 * This file provides Firebase config to the service worker
 * without hardcoding sensitive values in the worker file.
 * 
 * Called by the main app to inject config into service worker.
 */

// Get Firebase config from environment variables
const getFirebaseConfig = () => ({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

// Send config to service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
            type: 'FIREBASE_CONFIG',
            config: getFirebaseConfig(),
        });
    });
}

