import { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi';
import { z } from 'zod';
import { task } from '@/modules/task/task.schema.js';
import { ApiValidationError } from '@/plugins/errors.js';

// Schema for error response
const errorResponseSchema = z.object({
  message: z.string(),
  errors: z.array(z.string()).optional(),
});

// Schema for the request body when creating a task
const createTaskBodySchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255, 'Task name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
  dueDate: z.string().datetime('Invalid date format').optional().or(z.literal('')),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional().default('pending'),
});

// Schema for the successful creation response
const createTaskResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Plugin for handling the POST /task route.
 */
const createTaskRoute: FastifyPluginAsyncZodOpenApi = async (server): Promise<void> => {
  // POST to root path
  server.post(
    '/',
    {
      onRequest: [server.authenticate()],
      schema: {
        description: 'Create a new task.',
        tags: ['task'],
        summary: 'Create task',
        body: createTaskBodySchema,
        response: {
          201: createTaskResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async function (request, reply) {
      const { name, description, dueDate, status } = request.body;
      const db = server.db;

      try {
        // Create task within a transaction
        const newTask = await db.transaction(async (tx) => {
          // Create the task record
          const [insertedTask] = await tx
            .insert(task)
            .values({
              name,
              description: description || null,
              dueDate: dueDate ? new Date(dueDate).toISOString().split('T')[0] : null,
              status,
            })
            .returning();

          if (!insertedTask) {
            throw new ApiValidationError('Failed to create task record.', 500);
          }

          return insertedTask;

        }); // End of transaction

        // If transaction was successful, send the reply
        return reply.code(201).send({
          ...newTask,
          createdAt: newTask.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: newTask.updatedAt?.toISOString() || new Date().toISOString(),
        });

      } catch (error: unknown) {
        server.log.error(error, 'Error creating task:');

        // Handle custom validation errors from transaction
        if (error instanceof ApiValidationError) {
          return reply.code(error.statusCode).send({ message: error.message });
        }

        // Handle database constraint errors
        if (error instanceof Error) {
          if (error.message.includes('duplicate key value')) {
            return reply.code(409).send({ 
              message: 'A task with this name already exists.' 
            });
          }
        }

        return reply.code(500).send({ message: 'Internal Server Error creating task.' });
      }
    },
  );
};

export default createTaskRoute; 