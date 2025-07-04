import { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi';
import { z } from 'zod';

const errorResponseSchema = z.object({
  message: z.string(),
});

const authTokenResponseSchema = z.object({
  token: z.string(),
});

const authTokenRoute: FastifyPluginAsyncZodOpenApi = async (server): Promise<void> => {
  server.get(
    '/token',
    {
      schema: {
        description: 'Generate a non-expiring JWT for testing/development purposes.',
        tags: ['auth', 'development'],
        summary: 'Generate Test JWT',
        response: {
          200: authTokenResponseSchema,
          500: errorResponseSchema, // Server errors during generation
        },
      },
    },
    async function (request, reply) {
      try {

        const testPayload = { userId: 999, role: 'admin' };

        // Generate the JWT *without* an expiresIn option
        const token = await reply.jwtSign(testPayload);

        reply.code(200).send({ token });

      } catch (err: unknown) {
        server.log.error(err, 'Error generating test JWT:');
        return reply.code(500).send({ message: 'Internal Server Error generating JWT.' });
      }
    },
  );
};

export default authTokenRoute; 