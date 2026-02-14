import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

// Module level validation is removed to prevent build-time crashes. 
// Validation is performed inside the connectDB function.

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using Mongoose
 * Uses a singleton pattern to prevent multiple connections
 * @returns {Promise<typeof mongoose>} Mongoose connection
 */
async function connectDB() {
    if (!MONGO_URI) {
        throw new Error('Please define the MONGO_URI environment variable inside .env.local');
    }
    // If already connected, return the cached connection
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    // If no promise exists, create a new connection
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable mongoose buffering
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        };

        console.log('🔄 Connecting to MongoDB...');
        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB connected successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB connection error:', e);
        throw e;
    }

    return cached.conn;
}

/**
 * Get the current connection status
 * @returns {string} Connection status
 */
export function getConnectionStatus() {
    const status = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[status] || 'unknown';
}

/**
 * Disconnect from MongoDB
 * Mainly useful for cleanup in serverless environments
 */
export async function disconnectDB() {
    if (cached.conn) {
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
        console.log('✅ MongoDB disconnected');
    }
}

export default connectDB;

