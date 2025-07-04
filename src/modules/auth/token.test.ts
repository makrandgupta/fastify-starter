import { FastifyInstance } from 'fastify';
import { buildServer } from '@/server.js';

describe.skip('Auth Token Endpoint', () => {
  let server: FastifyInstance;

  // Build the server instance once before any tests run
  beforeAll(async () => {
    server = await buildServer({ testMode: true });
    await server.ready();
  });

  // Close the server instance after all tests have run
  afterAll(async () => {
    await server.close();
  });

  describe('GET /auth/token', () => {
    it('should return 200 with a valid JWT token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/token',
      });

      console.log(response.payload);

      expect(response.statusCode).toBe(200);
      
      const body = response.json();
      expect(body).toHaveProperty('token');
      
      // Verify the token is a non-empty string
      expect(typeof body.token).toBe('string');
      expect(body.token.length).toBeGreaterThan(0);
      
      // Verify the token has the correct structure (header.payload.signature)
      const tokenParts = body.token.split('.');
      expect(tokenParts.length).toBe(3);
    });
  });
}); 