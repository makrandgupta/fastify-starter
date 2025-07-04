/* eslint-disable no-console */

import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { task } from '@/modules/task/task.schema.js';
import { generateTasks } from './generators/task-generator.js';




// Database connection setup
if (!process.env.DATABASE_URL) {
  console.error('⚠️  DATABASE_URL not set');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? '',
});

const db = drizzle(pool);

/**
 * Main function to seed the database with sample data
 */
async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    // Generate tasks
    console.log('Generating tasks...');
    const tasks = generateTasks();

    // Insert data into database
    console.log('\nInserting data into database...');

    // Insert tasks (no dependencies)
    console.log('Inserting tasks...');
    const insertedTasks = await db.insert(task).values(tasks).returning();
    console.log(`Inserted ${insertedTasks.length} tasks`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Tasks: ${insertedTasks.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Export for use
export { seedDatabase };

// Run if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedDatabase().catch(console.error);
} 