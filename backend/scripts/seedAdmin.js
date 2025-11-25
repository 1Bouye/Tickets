const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Get command line arguments
    const args = process.argv.slice(2);
    const userId = args[0] || 'admin';
    const name = args[1] || 'System Administrator';
    const password = args[2] || 'admin123';
    const force = args.includes('--force');

    // Check if admin already exists (only if not forcing)
    if (!force) {
      const existingAdmin = await User.findOne({ userId, role: 'admin' });
      if (existingAdmin) {
        console.log(`Admin user with userId "${userId}" already exists. Use --force to overwrite or use a different userId.`);
        process.exit(0);
      }
    } else {
      // If forcing, remove existing admin with same userId
      await User.deleteOne({ userId, role: 'admin' });
      console.log(`Removed existing admin with userId "${userId}"`);
    }

    // Create admin
    const admin = await User.create({
      userId,
      name,
      password, // Will be hashed by pre-save hook
      role: 'admin',
      isActive: true,
      // userType not required for admin
    });

    console.log('Admin user created successfully!');
    console.log(`Username: ${userId}`);
    console.log(`Password: ${password}`);
    console.log('⚠️  Please change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

