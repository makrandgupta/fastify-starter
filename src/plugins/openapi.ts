import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifyApiReference from '@scalar/fastify-api-reference';
import { fastifyZodOpenApiPlugin, fastifyZodOpenApiTransform, fastifyZodOpenApiTransformObject } from 'fastify-zod-openapi';
import { type ZodOpenApiVersion } from 'zod-openapi';

const openapiPlugin: FastifyPluginAsync = fp(async (server) => {
  await server.register(fastifyZodOpenApiPlugin);

  server.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.3' satisfies ZodOpenApiVersion,
      info: {
        title: 'TO DO API',
        description: 'API for TO DO',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local server'
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication related end-points' },
        { name: 'task', description: 'Task related end-points' },
      ],
      security: [{
        apiKey: []
      }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token for authentication'
          },
        }
      }
    },
    transform: fastifyZodOpenApiTransform,
    transformObject: fastifyZodOpenApiTransformObject,
  });

  await server.register(fastifyApiReference, {
    routePrefix: '/docs',
    openApiDocumentEndpoints: {
      json: '/json',
    }
  });


});

export default openapiPlugin;