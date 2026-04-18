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
    console.log('🌱 Starting MASSIVE premium seed with REAL DATA (Model + Bio)...');

    // 1. CLEANUP (Wipe everything for clean slate)
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Prompt.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Save.deleteMany({})
    ]);

    // 2. SEED CATEGORIES (Essential for Prompt references)
    const seedCategories = [
      { name: 'Coding', slug: 'coding' },
      { name: 'Image Gen', slug: 'image-generation' },
      { name: 'Marketing', slug: 'marketing' },
      { name: 'Content Writing', slug: 'content-writing' },
      { name: 'Business', slug: 'business' },
      { name: 'Education', slug: 'education' }
    ];
    const createdCategories = await Category.insertMany(seedCategories);
    console.log(`✅ ${createdCategories.length} Categories created`);

    // 3. SEED USERS (Admin + Professional Profiles with Standard Password: '123456')
    const seedUsers = [
      { 
        name: 'Super Admin', email: 'admin@promptai.com', password: '123456', role: ROLES.ADMIN, onboardingCompleted: true,
        bio: 'Global Platform Administrator. Overseeing data integrity and content moderation for the Prompt AI ecosystem.'
      },
      { 
        name: 'Alice Chen', email: 'alice@promptai.com', password: '123456', role: ROLES.USER, onboardingCompleted: true,
        bio: 'Senior Technical Lead at a Silicon Valley AI startup. Expert in recursive prompt engineering and structured data extraction from LLMs.'
      },
      { 
        name: 'Bob Smith', email: 'bob@promptai.com', password: '123456', role: ROLES.USER, onboardingCompleted: true,
        bio: 'Backend Architect with a passion for Rust and WebAssembly. Specializes in designing robust, scalable prompt logic for enterprise microservices.'
      },
      { 
        name: 'Clara Bloom', email: 'clara@promptai.com', password: '123456', role: ROLES.USER, onboardingCompleted: true,
        bio: 'Creative Strategist and Content Designer. Focuses on bridging the gap between narrative storytelling and AI-driven automation.'
      },
      { 
        name: 'David Gear', email: 'david@promptai.com', password: '123456', role: ROLES.USER, onboardingCompleted: true,
        bio: 'Growth Marketer and SEO specialist. Developing advanced prompt frameworks for high-conversion copy and viral social media campaigns.'
      },
      { 
        name: 'Elena Vox', email: 'elena@promptai.com', password: '123456', role: ROLES.USER, onboardingCompleted: true,
        bio: 'Professional Visual Artist and MJ certified prompt engineer. Exploring the intersection of brutalist architecture and cinematic lighting in AI art.'
      },
    ];

    const users = [];
    for (const u of seedUsers) {
      const user = await User.create(u);
      users.push(user);
    }
    console.log('✅ 6 Users created (Hashed password: 123456)');


    // 4. MAP CATEGORIES
    const cat = (slug) => createdCategories.find(c => c.slug === slug)?._id;

    // 5. SEED 20 PREMIUM PROMPTS
    const longDesc = (title) => `## Overview
This premium prompt for ${title} is engineered for high-precision outputs and professional results.

### Why this works
- **Contextual Anchoring**: We use specific priming phrases to set the persona.
- **Iterative Refinement**: The prompt is structured to handle multi-step reasoning.

---
*Verified for Professional Production Workflows.*`;

    const promptsData = [
      // Coding
      { title: 'Next.js 14 Infinite Scroller', model: 'GPT-4 Turbo', promptText: 'Create a reusable React component for infinite scrolling using Intersection Observer API...', description: longDesc('Infinite Scrolling'), category: cat('coding'), author: users[1]._id, imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Python Microservice Template', model: 'Claude 3.5 Sonnet', promptText: 'Design a FastAPI microservice structure with Docker, PostgreSQL, and Redis...', description: longDesc('Microservices'), category: cat('coding'), author: users[1]._id, imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Rust WebAssembly Framework', model: 'GPT-4', promptText: 'Write a comprehensive guide for compiling Rust to WebAssembly for canvas rendering...', description: longDesc('WASM'), category: cat('coding'), author: users[2]._id, imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop' },
      { title: 'GraphQL Schema Architect', model: 'Claude 3.5 Sonnet', promptText: 'Design a scalable GraphQL schema for a multi-tenant e-commerce platform...', description: longDesc('GraphQL'), category: cat('coding'), author: users[2]._id, imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010ca685ed?q=80&w=2070&auto=format&fit=crop' },

      // Image Gen
      { title: 'Cinematic Cyberpunk Street', model: 'Midjourney v6.1', promptText: 'Hyper-realistic cyberpunk street at night, neon reflections, atmospheric fog, 8k...', description: longDesc('Cyberpunk Visuals'), category: cat('image-generation'), author: users[5]._id, imageUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Architectural Brutalism Study', model: 'Midjourney v6', promptText: 'Minimalist brutalist architecture, raw concrete, desert environment, 35mm film...', description: longDesc('Brutalist Architecture'), category: cat('image-generation'), author: users[5]._id, imageUrl: 'https://images.unsplash.com/photo-1518005020251-58296b8646d1?q=80&w=2021&auto=format&fit=crop' },
      { title: 'Isometric Game Asset Pack', model: 'DALL-E 3', promptText: 'Isometric 3D game assets, fantasy theme, stylized wood and stone, soft lighting...', description: longDesc('Game Assets'), category: cat('image-generation'), author: users[5]._id, imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea206f25dc?q=80&w=2012&auto=format&fit=crop' },
      { title: 'Surrealist Oil Portrait', model: 'Stable Diffusion XL', promptText: 'Abstract surrealist oil painting portrait, melting features, cosmic colors...', description: longDesc('Surrealism'), category: cat('image-generation'), author: users[5]._id, imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop' },

      // Marketing
      { title: 'SaaS Viral Launch Thread', model: 'Claude 3 Opus', promptText: 'Write a 10-tweet viral launch thread for a new productivity SaaS...', description: longDesc('Viral Threads'), category: cat('marketing'), author: users[4]._id, imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop' },
      { title: 'High-Conversion Ad Copy', model: 'GPT-4 Turbo', promptText: 'Act as a direct response copywriter. Write 5 versions of Facebook ad copy...', description: longDesc('Ad Copywriting'), category: cat('marketing'), author: users[4]._id, imageUrl: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=2000&auto=format&fit=crop' },
      { title: 'Influencer Outreach Script', model: 'GPT-4', promptText: 'Generate personalized outreach scripts for micro-influencers in fitness...', description: longDesc('Outreach'), category: cat('marketing'), author: users[4]._id, imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Product Launch Email Series', model: 'Claude 3.5 Sonnet', promptText: 'Design a 5-day email sequence for a digital product launch...', description: longDesc('Email Marketing'), category: cat('marketing'), author: users[4]._id, imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop' },

      // Content
      { title: 'SEO Lifestyle Blog Post', model: 'GPT-4 Turbo', promptText: 'Write a 1500-word SEO-optimized blog post about "Deep Work"...', description: longDesc('SEO blogging'), category: cat('content-writing'), author: users[3]._id, imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop' },
      { title: 'Technical Whitepaper Outline', model: 'GPT-4', promptText: 'Act as a technical writer. Create a detailed outline for a whitepaper...', description: longDesc('Whitepapers'), category: cat('content-writing'), author: users[3]._id, imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Interactive Story Spec', model: 'Claude 3.5 Sonnet', promptText: 'Draft a branching narrative structure for a text-based adventure game...', description: longDesc('Narrative Design'), category: cat('content-writing'), author: users[3]._id, imageUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Newsletter Editorial Persona', model: 'GPT-4', promptText: 'Define a distinct, witty, and deeply informed editorial persona...', description: longDesc('Editorial Design'), category: cat('content-writing'), author: users[3]._id, imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop' },

      // Business
      { title: 'Executive Retreat Agenda', model: 'Claude 3 Opus', promptText: 'Act as a COO. Design a 3-day executive retreat agenda...', description: longDesc('Strategic Operations'), category: cat('business'), author: users[1]._id, imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Venture Capital Pitch Deck', model: 'GPT-4 Turbo', promptText: 'Act as a founder. Create a 12-slide pitch deck outline...', description: longDesc('Pitch Decks'), category: cat('business'), author: users[1]._id, imageUrl: 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=2070&auto=format&fit=crop' },

      // Education
      { title: 'LMS Curriculum Planner', model: 'GPT-4', promptText: 'Design a 12-week online course curriculum for "Introduction to Data Science"...', description: longDesc('Curriculum Design'), category: cat('education'), author: users[1]._id, imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb28f74b55a?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Personalized Study Plan', model: 'Claude 3.5 Sonnet', promptText: 'Create a hyper-personalized 30-day study plan for a GRE student...', description: longDesc('Personalized Learning'), category: cat('education'), author: users[1]._id, imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop' },
    ];

    const promptsToInsert = promptsData.map((p, index) => ({
      ...p,
      // Mixed statuses: Some approved, some pending (index 0-4 as pending)
      status: index < 5 ? PROMPT_STATUS.PENDING : PROMPT_STATUS.APPROVED,
      views: Math.floor(Math.random() * 5000) + 500,
      likes: Math.floor(Math.random() * 200) + 10,
      saves: Math.floor(Math.random() * 100) + 5
    }));

    const insertedPrompts = await Prompt.insertMany(promptsToInsert);
    console.log(`✅ ${insertedPrompts.length} Prompts Created (Some PENDING for moderation tests)`);

    // 6. COMMENT ACTIVITY
    for (const p of insertedPrompts) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      await Comment.create({ promptId: p._id, author: randomUser._id, text: 'This instruction set is masterful. The results are indistinguishable from human output! 🔥' });
    }

    console.log('✨ MASSIVE PREMIUM SEED COMPLETE (Password: 123456)!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();
