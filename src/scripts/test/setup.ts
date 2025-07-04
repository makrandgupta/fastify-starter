// vitest.setup.ts
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import fp from 'fastify-plugin';
import { vi } from 'vitest';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock the entire module of your database plugin
vi.mock('@/plugins/db', async () => { // Adjust path to your DB plugin file
  // Create an in-memory PGlite instance
  const client = new PGlite();
  const db = drizzle(client);

  // Apply your actual migrations to the in-memory database
  await migrate(db, { migrationsFolder: './drizzle' });

  return {
    default: fp(async (fastify) => {
      // Decorate the fastify instance with the mocked DB
      fastify.decorate('db', db);
    })
  };
});

vi.mock('@/plugins/jwt', async () => {
  return {
    default: fp(async (fastify) => {
      fastify.decorate('authenticate', () => {
        return async () => {
          return;
        };
      });
    }),
  };
});