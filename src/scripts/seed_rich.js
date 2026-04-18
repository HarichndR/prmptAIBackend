const mongoose = require('mongoose');
const User = require('../models/User.model');
const Category = require('../models/Category.model');
const Prompt = require('../models/Prompt.model');
const Comment = require('../models/Comment.model');
const Like = require('../models/Like.model');
const Save = require('../models/Save.model');
const env = require('../config/env');
const { ROLES, PROMPT_STATUS } = require('../constants');

const seedData = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('🌱 Starting comprehensive seed...');

    // 1. CLEANUP (Optional - Comment out if you want to keep existing)
    await Promise.all([
      User.deleteMany({ email: { $ne: 'admin@promptai.com' } }),
      Prompt.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Save.deleteMany({})
    ]);

    // 2. SEED ADMIN (Ensure persists)
    let admin = await User.findOne({ email: 'admin@promptai.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@promptai.com',
        password: 'AdminPassword123!',
        role: ROLES.ADMIN,
        onboardingCompleted: true
      });
    }

    // 3. SEED GUEST USERS
    const guestUsers = [
      { name: 'John Developer', email: 'john@test.com', password: 'TestPassword123!', onboardingCompleted: true },
      { name: 'Sarah Writer', email: 'sarah@test.com', password: 'TestPassword123!', onboardingCompleted: true },
      { name: 'Mike Marketer', email: 'mike@test.com', password: 'TestPassword123!', onboardingCompleted: true },
    ];

    const users = await User.insertMany(guestUsers);
    console.log('✅ Guest users created');

    // 4. GET CATEGORIES
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('❌ No categories found. Run base seed first or add them here.');
      process.exit(1);
    }

    // 5. SEED PROMPTS
    const promptData = [
      {
        title: 'Python Data Scraper',
        description: 'A robust script to scrape price data from e-commerce sites.',
        promptText: 'Write a Python script using BeautifulSoup to extract product names and prices...',
        category: categories.find(c => c.slug === 'coding')._id,
        author: users[0]._id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        status: PROMPT_STATUS.APPROVED,
        likes: 2, saves: 1
      },
      {
        title: 'Creative Blog Intro',
        description: 'Get readers hooked with this narrative style intro.',
        promptText: 'I want you to act as a creative writer. Write an introduction for a blog about...',
        category: categories.find(c => c.slug === 'content-writing')._id,
        author: users[1]._id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        status: PROMPT_STATUS.APPROVED,
        likes: 1, saves: 1
      },
      {
        title: 'SEO Meta Tags Generator',
        description: 'Generate high-CTR meta titles and descriptions.',
        promptText: 'Act as an SEO expert. Provide 5 variants of meta titles and descriptions for...',
        category: categories.find(c => c.slug === 'marketing')._id,
        author: users[2]._id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        status: PROMPT_STATUS.APPROVED,
        likes: 3, saves: 2
      }
    ];

    const prompts = await Prompt.insertMany(promptData);
    console.log('✅ Prompts created');

    // 6. SEED COMMENTS
    const commentData = [
      { promptId: prompts[0]._id, author: users[1]._id, text: 'This saved me hours of manual extraction!' },
      { promptId: prompts[0]._id, author: users[2]._id, text: 'Does this handle pagination correctly?' },
      { promptId: prompts[1]._id, author: users[0]._id, text: 'Love the narrative approach here.' },
    ];
    await Comment.insertMany(commentData);
    console.log('✅ Comments created');

    // 7. SEED LIKES & SAVES (Example cross-interaction)
    await Like.create({ promptId: prompts[0]._id, userId: users[1]._id });
    await Like.create({ promptId: prompts[0]._id, userId: users[2]._id });
    await Save.create({ promptId: prompts[0]._id, userId: users[1]._id });

    console.log('✨ Comprehensive seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();
