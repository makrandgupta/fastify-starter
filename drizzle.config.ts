import 'dotenv/config';
import type { Config } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

export default {
  schema: './dist/src/modules/**/*.schema.js', // Path to compiled schema files
  out: './drizzle', // Directory for migration files
  dialect: 'postgresql', // Specify the dialect
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Optional: Enable verbose logging for drizzle-kit
  // verbose: true,
  // Optional: Enable strict mode for drizzle-kit
  // strict: true,
} satisfies Config; 