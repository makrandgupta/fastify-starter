import { config } from '@/plugins/env.js';
import fastifyJwt from '@fastify/jwt';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

// Extend FastifyInstance interface to include JWT functionality
declare module 'fastify' {
  interface FastifyInstance {
    // eslint-disable-next-line no-unused-vars
    authenticate: () => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const jwtPlugin: FastifyPluginAsync = fp(async (server) => {
  // Register @fastify/jwt with our JWT secret
  server.register(fastifyJwt, {
    secret: config.JWT_SECRET,
  });

  // Add authenticate decorator
  server.decorate('authenticate', () =>
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        server.log.error(err);
        reply.code(401).send({ error: 'Unauthorized', message: 'Invalid token or token expired' });
      }
    }
  );
  
  // Add preHandler hook example (commented out, uncomment to use globally)
  // server.addHook('preHandler', async (request, reply) => {
  //   // Skip auth for specific routes
  //   const skipAuth = ['/login', '/register', '/health'].includes(request.routerPath);
  //   if (skipAuth) return;
  //
  //   try {
  //     await request.jwtVerify();
  //   } catch (err) {
  //     reply.code(401).send({ error: 'Unauthorized', message: 'Invalid token or token expired' });
  //   }
  // });
});

export default jwtPlugin;
