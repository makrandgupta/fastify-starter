import { buildServer } from '@/server.js';
import { task } from '@/modules/task/task.schema.js';
import { eq } from 'drizzle-orm';

describe('POST /task', () => {
  let server: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    server = await buildServer({ testMode: true });
  }, 30000);

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  it('should create a new task successfully', async () => {
    const taskData = {
      name: 'Test Task',
      description: 'This is a test task description',
      dueDate: '2024-12-31T23:59:59.000Z',
      status: 'pending' as const,
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(201);
    
    const result = JSON.parse(response.payload);
    expect(result).toMatchObject({
      id: expect.any(Number),
      name: 'Test Task',
      description: 'This is a test task description',
      dueDate: '2024-12-31',
      status: 'pending',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    // Verify task was created in database
    const createdTask = await server.db
      .select()
      .from(task)
      .where(eq(task.id, result.id))
      .limit(1);
    
    expect(createdTask).toHaveLength(1);
    expect(createdTask[0].name).toBe('Test Task');
  });

  it('should create a task with minimal required fields', async () => {
    const taskData = {
      name: 'Minimal Task',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(201);
    
    const result = JSON.parse(response.payload);
    expect(result).toMatchObject({
      id: expect.any(Number),
      name: 'Minimal Task',
      description: null,
      dueDate: null,
      status: 'pending',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should create a task with different status', async () => {
    const taskData = {
      name: 'In Progress Task',
      status: 'in_progress' as const,
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(201);
    
    const result = JSON.parse(response.payload);
    expect(result.status).toBe('in_progress');
  });

  it('should reject task creation with empty name', async () => {
    const taskData = {
      name: '',
      description: 'This should fail',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject task creation with name too long', async () => {
    const taskData = {
      name: 'a'.repeat(256), // 256 characters, exceeds 255 limit
      description: 'This should fail',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject task creation with description too long', async () => {
    const taskData = {
      name: 'Valid Task Name',
      description: 'a'.repeat(1001), // 1001 characters, exceeds 1000 limit
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject task creation with invalid date format', async () => {
    const taskData = {
      name: 'Valid Task Name',
      dueDate: 'invalid-date-format',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject task creation with invalid status', async () => {
    const taskData = {
      name: 'Valid Task Name',
      status: 'invalid_status',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(400);
  });

  it('should handle empty string values correctly', async () => {
    const taskData = {
      name: 'Task with Empty Fields',
      description: '',
      dueDate: '',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/task',
      headers: {
        'authorization': 'Bearer test-token',
      },
      payload: taskData,
    });

    expect(response.statusCode).toBe(201);
    
    const result = JSON.parse(response.payload);
    expect(result.description).toBe(null);
    expect(result.dueDate).toBe(null);
  });
});
