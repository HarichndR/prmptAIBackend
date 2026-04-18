const mongoose = require('mongoose');
const User = require('../models/User.model');
const Category = require('../models/Category.model');
const env = require('../config/env');
const { ROLES } = require('../constants');

const seed = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('🌱 Starting seed...');

    // Seed Admin
    const adminEmail = 'admin@promptai.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'AdminPassword123!', // Will be hashed by pre-save hook
        role: ROLES.ADMIN,
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Seed Categories
    const categories = [
      { name: 'Content Writing', slug: 'content-writing' },
      { name: 'Image Generation', slug: 'image-generation' },
      { name: 'Coding', slug: 'coding' },
      { name: 'Marketing', slug: 'marketing' },
      { name: 'Education', slug: 'education' },
      { name: 'Business', slug: 'business' },
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      }
    }

    console.log('✨ Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
