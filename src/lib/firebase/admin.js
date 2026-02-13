/**
 * Firebase Admin SDK Configuration
 * 
 * Server-side Firebase configuration for sending push notifications.
 * This should ONLY run on the server (never in browser).
 * 
 * Uses service account credentials from environment variables.
 * 
 * @see https://firebase.google.com/docs/admin/setup
 */

import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK (singleton pattern)
 * Prevents multiple initializations
 */
let firebaseAdmin = null;

export const getFirebaseAdmin = () => {
    if (firebaseAdmin) {
        return firebaseAdmin;
    }

    try {
        // Check if already initialized
        if (admin.apps.length > 0) {
            firebaseAdmin = admin.apps[0];
            return firebaseAdmin;
        }

        // Get credentials from environment variables
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        // Validate required credentials
        if (!projectId || !clientEmail || !privateKey) {
            console.error('Missing Firebase Admin credentials');
            console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
            return null;
        }

        // Initialize Firebase Admin
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                // Handle private key with escaped newlines
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
            projectId,
        });

        console.log('✅ Firebase Admin SDK initialized successfully');
        return firebaseAdmin;
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin SDK:', error.message);
        return null;
    }
};

/**
 * Get Firebase Messaging instance
 * @returns {admin.messaging.Messaging|null}
 */
export const getMessaging = () => {
    const app = getFirebaseAdmin();
    if (!app) {
        return null;
    }
    return admin.messaging(app);
};

/**
 * Send push notification to a single device token
 * 
 * @param {string} token - FCM device token
 * @param {Object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} payload.data - Additional data (optional)
 * @returns {Promise<string>} Message ID if successful
 */
export const sendPushNotification = async (token, { title, body, data = {} }) => {
    try {
        const messaging = getMessaging();
        if (!messaging) {
            throw new Error('Firebase Messaging not initialized');
        }

        const message = {
            token,
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                clickAction: data.actionUrl || '/notifications',
            },
            webpush: {
                fcmOptions: {
                    link: data.actionUrl || '/notifications',
                },
            },
        };

        const response = await messaging.send(message);
        console.log('✅ Push notification sent successfully:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending push notification:', error.message);
        throw error;
    }
};

/**
 * Send push notification to multiple device tokens (batch)
 * 
 * @param {Array<string>} tokens - Array of FCM device tokens
 * @param {Object} payload - Notification payload
 * @returns {Promise<Object>} Batch response with success/failure counts
 */
export const sendBatchPushNotifications = async (tokens, { title, body, data = {} }) => {
    try {
        const messaging = getMessaging();
        if (!messaging) {
            throw new Error('Firebase Messaging not initialized');
        }

        if (!tokens || tokens.length === 0) {
            return {
                successCount: 0,
                failureCount: 0,
                responses: [],
            };
        }

        // FCM allows max 500 tokens per batch
        const batchSize = 500;
        const results = {
            successCount: 0,
            failureCount: 0,
            responses: [],
        };

        // Split tokens into batches
        for (let i = 0; i < tokens.length; i += batchSize) {
            const batchTokens = tokens.slice(i, i + batchSize);

            const message = {
                notification: {
                    title,
                    body,
                },
                data: {
                    ...data,
                    clickAction: data.actionUrl || '/notifications',
                },
                webpush: {
                    fcmOptions: {
                        link: data.actionUrl || '/notifications',
                    },
                },
                tokens: batchTokens,
            };

            const response = await messaging.sendEachForMulticast(message);
            
            results.successCount += response.successCount;
            results.failureCount += response.failureCount;
            results.responses.push(...response.responses);
        }

        console.log(`✅ Batch push sent: ${results.successCount} success, ${results.failureCount} failed`);
        return results;
    } catch (error) {
        console.error('❌ Error sending batch push notifications:', error.message);
        throw error;
    }
};

/**
 * Validate FCM token
 * 
 * @param {string} token - FCM token to validate
 * @returns {Promise<boolean>} True if token is valid
 */
export const validateToken = async (token) => {
    try {
        const messaging = getMessaging();
        if (!messaging) {
            return false;
        }

        // Try to send a dry-run message (doesn't actually send)
        const message = {
            token,
            notification: {
                title: 'Test',
                body: 'Test',
            },
            dryRun: true,
        };

        await messaging.send(message);
        return true;
    } catch (error) {
        console.error('❌ Invalid token:', error.message);
        return false;
    }
};

/**
 * Remove invalid tokens from database
 * Call this when receiving errors from FCM
 * 
 * @param {Array<string>} invalidTokens - Tokens to remove
 * @returns {Promise<void>}
 */
export const cleanupInvalidTokens = async (invalidTokens) => {
    try {
        // Import User model
        const User = (await import('@/models/User')).default;

        // Remove invalid tokens from all users
        await User.updateMany(
            {
                'fcmTokens.token': { $in: invalidTokens },
            },
            {
                $pull: {
                    fcmTokens: {
                        token: { $in: invalidTokens },
                    },
                },
            }
        );

        console.log(`✅ Cleaned up ${invalidTokens.length} invalid tokens`);
    } catch (error) {
        console.error('❌ Error cleaning up invalid tokens:', error.message);
    }
};

export default admin;

