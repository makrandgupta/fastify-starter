import { FastifyInstance } from 'fastify';
import { buildServer } from '@/server.js';

describe('Server Health Check', () => {
  let server: FastifyInstance;

  // Build the server instance once before any tests run
  beforeAll(async () => {
    server = await buildServer({ testMode: true });
    await server.ready(); // Ensure plugins are loaded if needed for the route
  });

  // Close the server instance after all tests have run
  afterAll(async () => {
    await server.close();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });

  // Add more describe blocks for other routes defined in server.ts if necessary
}); 