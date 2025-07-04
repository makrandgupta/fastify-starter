import { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi';
import { z } from 'zod';
import { and, inArray, gte, lte } from 'drizzle-orm';
import { task } from '@/modules/task/task.schema.js';
import { asArray } from '@/plugins/zod.types.js';

// Schema for query parameters
const listTaskQuerySchema = z.object({
  status: asArray(z.enum(['pending', 'in_progress', 'completed', 'cancelled'])).optional(),
  dueDateFrom: z.string().datetime('Invalid date format').optional(),
  dueDateTo: z.string().datetime('Invalid date format').optional(),
});

// Schema for an individual task item in the list response
const taskListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(), // Drizzle returns date as string
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for the response array
const listTaskResponseSchema = z.array(taskListItemSchema);

// Schema for error response
const errorResponseSchema = z.object({
  message: z.string(),
});

/**
 * Plugin for handling the GET /task route.
 */
const listTasksRoute: FastifyPluginAsyncZodOpenApi = async (server): Promise<void> => {
  server.get(
    '/',
    {
      onRequest: [server.authenticate()],
      schema: {
        description: 'List all tasks. Supports filtering by status and due date range.',
        tags: ['task'],
        summary: 'Lists tasks',
        querystring: listTaskQuerySchema,
        response: {
          200: listTaskResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async function (request, reply) {
      try {
        const { status, dueDateFrom, dueDateTo } = request.query;

        // Build conditions array
        const conditions = [];
        
        if (status !== undefined && status.every(s => s !== undefined)) {
          conditions.push(inArray(task.status, status));
        }
        
        if (dueDateFrom !== undefined) {
          conditions.push(gte(task.dueDate, new Date(dueDateFrom).toISOString().split('T')[0]));
        }
        
        if (dueDateTo !== undefined) {
          conditions.push(lte(task.dueDate, new Date(dueDateTo).toISOString().split('T')[0]));
        }

        // Build the base query
        const baseQuery = server.db
          .select({
            id: task.id,
            name: task.name,
            description: task.description,
            dueDate: task.dueDate,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          })
          .from(task);

        // Execute query with conditions if any exist
        const tasks = conditions.length > 0 
          ? await baseQuery.where(and(...conditions)).orderBy(task.createdAt)
          : await baseQuery.orderBy(task.createdAt);

        // Convert Date objects to ISO strings for response
        return tasks.map(task => ({
          ...task,
          createdAt: task.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: task.updatedAt?.toISOString() || new Date().toISOString(),
        }));

      } catch (error: unknown) {
        server.log.error(error, 'Error fetching tasks:');
        return reply.code(500).send({ message: 'Internal Server Error fetching tasks.' });
      }
    },
  );
};

export default listTasksRoute; 