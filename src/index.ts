/* eslint-disable no-console */
import 'dotenv/config'; // Load environment variables
import { buildServer } from '@/server.js';
import { config } from '@/plugins/env.js';

/**
 * Starts the Fastify server.
 */
async function startServer(): Promise<void> {
  try {
    const server = await buildServer();

    await server.listen({ port: config.PORT, host: config.HOST });

    // Graceful shutdown
    // eslint-disable-next-line no-undef
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        await server.close();
        process.exit(0);
      });
    }

  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

void startServer(); 