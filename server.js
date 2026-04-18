const app = require('./app');
const connectWithRetry = require('./src/config/db');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

const port = env.PORT || 5001; // Updated to match environment standard

const startServer = async () => {
  try {
    // Attempt DB connection first
    await connectWithRetry();
    
    app.listen(port, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${port}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
