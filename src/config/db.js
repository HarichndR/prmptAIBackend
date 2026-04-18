const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ Connection failed (attempt ${i + 1}/${retries}): ${error.message}`);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Exceeded maximum connection retries. Exiting.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectWithRetry;
