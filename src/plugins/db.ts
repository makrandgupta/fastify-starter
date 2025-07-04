import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { PgliteDatabase } from 'drizzle-orm/pglite';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import pg from 'pg';
import { config } from '@/plugins/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: NodePgDatabase | PgliteDatabase;
  }
}

const dbPlugin: FastifyPluginAsync = fp(async (server) => {
  const client = new pg.Pool({ connectionString: config.DATABASE_URL ?? '' });
  const db = drizzle({ client: client });

  server.decorate('db', db);

  server.addHook('onClose', async () => {
    await client.end();
  });
});

export default dbPlugin;