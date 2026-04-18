const mongoose = require('mongoose');
const User = require('../models/User.model');
const env = require('../config/env');

const fixAdmin = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    const user = await User.findOne({ email: 'admin@promptai.com' });
    if (user) {
      user.password = 'Admin123!';
      await user.save();
      console.log('✅ Admin password updated to Admin123!');
    } else {
      await User.create({
        name: 'Super Admin',
        email: 'admin@promptai.com',
        password: 'Admin123!',
        role: 'admin',
        onboardingCompleted: true
      });
      console.log('✅ Admin user created with password Admin123!');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing admin:', err.message);
    process.exit(1);
  }
};

fixAdmin();
