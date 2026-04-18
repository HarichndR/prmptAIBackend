const zod = require('zod');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = zod.object({
  PORT: zod.string().default('5000'),
  MONGO_URI: zod.string().url(),
  JWT_SECRET: zod.string().min(10),
  CLOUDINARY_CLOUD_NAME: zod.string(),
  CLOUDINARY_API_KEY: zod.string(),
  CLOUDINARY_API_SECRET: zod.string(),
  CORS_ORIGIN: zod.string().default('https://prompt-a-icleint-boq8.vercel.app'),
  NODE_ENV: zod.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
