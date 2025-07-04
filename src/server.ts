import Fastify from 'fastify';
import { type FastifyZodOpenApiTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-zod-openapi';
import { fastifyAutoload } from '@fastify/autoload';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Builds and configures the Fastify application instance.
 * Registers plugins, routes, and hooks.
 *
 * @param options - Optional configuration options
 * @param options.testMode - If true, suppresses server logs for testing
 * @returns A promise that resolves to the configured Fastify instance.
 */
export async function buildServer(options?: { testMode?: boolean }) {
  const isTestMode = options?.testMode || process.env.NODE_ENV === 'test';
  
  const server = Fastify({
    logger: isTestMode ? false : {
      level: 'trace',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
  }).setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .withTypeProvider<FastifyZodOpenApiTypeProvider>();

  /**
   * Plugins
   */

  server.register(import('@/plugins/sensible.js'));
  server.register(import('@/plugins/db.js'));
  server.register(import('@/plugins/jwt.js'));
  server.register(import('@/plugins/openapi.js'));

  

  /**
   * Modules
   */
  server.register(fastifyAutoload, {
    dir: join(__dirname, 'modules'),
    matchFilter: (filename) => filename.includes('.route'),
    dirNameRoutePrefix: true,
  });

  // Example health check route
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  await server.ready();

  return server;
} 