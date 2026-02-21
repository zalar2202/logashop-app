/**
 * Seed Sample Users Script
 * 
 * Creates sample users in the database for development and testing.
 * Run this script after creating the admin user.
 * 
 * Usage:
 *   node src/scripts/seedUsers.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env.local') });

// Import User model
import User from '../models/User.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI is not defined in .env.local');
    process.exit(1);
}

/**
 * Sample users data
 */
const sampleUsers = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567891',
    },
    {
        name: 'Sarah Smith',
        email: 'sarah.smith@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567892',
    },
    {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567893',
    },
    {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        password: 'User@123',
        role: 'user',
        status: 'inactive',
        phone: '+1234567894',
    },
    {
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567895',
    },
    {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567896',
    },
    {
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        password: 'User@123',
        role: 'user',
        status: 'suspended',
        phone: '+1234567897',
    },
    {
        name: 'Jennifer Taylor',
        email: 'jennifer.taylor@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567898',
    },
    {
        name: 'James Miller',
        email: 'james.miller@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567899',
    },
    {
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone: '+1234567800',
    },
];

/**
 * Seed sample users
 */
async function seedUsers() {
    try {
        // Connect to MongoDB
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected successfully\n');

        let created = 0;
        let skipped = 0;

        // Create users one by one
        for (const userData of sampleUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
                skipped++;
            } else {
                const user = new User(userData);
                await user.save();
                console.log(`✅ Created: ${userData.email} (${userData.role})`);
                created++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`   Created: ${created} users`);
        console.log(`   Skipped: ${skipped} users`);
        console.log(`   Total: ${sampleUsers.length} users`);

        if (created > 0) {
            console.log('\n🎉 Sample users created successfully!');
            console.log('\n🔐 Default password: "User@123"');
        }

        console.log('\n💡 You can now test the user management features!\n');
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run the seed function
seedUsers();

