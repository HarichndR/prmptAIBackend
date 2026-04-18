const mongoose = require('mongoose');
const User = require('../models/User.model');
const env = require('../config/env');
const bcrypt = require('bcryptjs');

const resetPasswords = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('🔗 Connected to DB. Starting FULL Platform Password Reset (123456)...');

    const users = await User.find({}).select('+password');
    console.log(`🔍 Found ${users.length} users in the database.`);

    for (const user of users) {
      console.log(`🔨 Updating password for: ${user.email}`);
      // Simply setting the password and calling save() triggers the pre-save hook
      // which hashes the password using the platform's standard algorithm.
      user.password = '123456';
      await user.save();
      console.log(`✅ ${user.email} reset to 123456 (hashed).`);
    }

    console.log('\n--- FULL RESET COMPLETE ---');
    console.log(`${users.length} accounts are now accessible with password: 123456`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
};

resetPasswords();
