import { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { task } from '@/modules/task/task.schema.js';
import { ApiValidationError } from '@/plugins/errors.js';

// Schema for error response
const errorResponseSchema = z.object({
  message: z.string(),
  errors: z.array(z.string()).optional(),
});

// Schema for the request body when updating a task
const updateTaskBodySchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255, 'Task name must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
  dueDate: z.string().datetime('Invalid date format').optional().or(z.literal('')),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided to update',
});

// Schema for the successful update response
const updateTaskResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Plugin for handling the PUT /task/:id route.
 */
const updateTaskRoute: FastifyPluginAsyncZodOpenApi = async (server): Promise<void> => {
  server.put(
    '/:id',
    {
      onRequest: [server.authenticate()],
      schema: {
        description: 'Update an existing task.',
        tags: ['task'],
        summary: 'Update task',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
            message: 'Task ID must be a positive integer',
          }),
        }),
        body: updateTaskBodySchema,
        response: {
          200: updateTaskResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async function (request, reply) {
      const { id } = request.params;
      const updateData = request.body;
      const db = server.db;

      try {
        // Update task within a transaction
        const updatedTask = await db.transaction(async (tx) => {
          // 1. Check if task exists
          const existingTask = await tx
            .select()
            .from(task)
            .where(eq(task.id, id))
            .limit(1);

          if (existingTask.length === 0) {
            throw new ApiValidationError(`Task with ID ${id} not found.`, 404);
          }

          // 2. Prepare update data
          const updateValues: {
            updatedAt: Date;
            name?: string;
            description?: string | null;
            dueDate?: string | null;
            status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          } = {
            updatedAt: new Date(),
          };

          if (updateData.name !== undefined) {
            updateValues.name = updateData.name;
          }
          if (updateData.description !== undefined) {
            updateValues.description = updateData.description || null;
          }
          if (updateData.dueDate !== undefined) {
            updateValues.dueDate = updateData.dueDate ? new Date(updateData.dueDate).toISOString().split('T')[0] : null;
          }
          if (updateData.status !== undefined) {
            updateValues.status = updateData.status;
          }

          // 3. Update the task record
          const [updatedTaskRecord] = await tx
            .update(task)
            .set(updateValues)
            .where(eq(task.id, id))
            .returning();

          if (!updatedTaskRecord) {
            throw new ApiValidationError('Failed to update task record.', 500);
          }

          return updatedTaskRecord;
        }); // End of transaction

        // If transaction was successful, send the reply
        return reply.code(200).send({
          ...updatedTask,
          createdAt: updatedTask.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: updatedTask.updatedAt?.toISOString() || new Date().toISOString(),
        });

      } catch (error: unknown) {
        server.log.error(error, 'Error updating task:');

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

        return reply.code(500).send({ message: 'Internal Server Error updating task.' });
      }
    },
  );
};

export default updateTaskRoute; 