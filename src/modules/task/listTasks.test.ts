import { buildServer } from '@/server.js';
import { task } from '@/modules/task/task.schema.js';

describe('GET /task', () => {
  let server: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    server = await buildServer({ testMode: true });
    
    // Create test tasks
    const testTasks = [
      {
        name: 'Task 1 - Pending',
        description: 'First test task',
        dueDate: '2024-12-31',
        status: 'pending' as const,
      },
      {
        name: 'Task 2 - In Progress',
        description: 'Second test task',
        dueDate: '2024-12-15',
        status: 'in_progress' as const,
      },
      {
        name: 'Task 3 - Completed',
        description: 'Third test task',
        dueDate: '2024-11-30',
        status: 'completed' as const,
      },
      {
        name: 'Task 4 - No Due Date',
        description: 'Fourth test task',
        status: 'pending' as const,
      },
    ];

    await server.db.insert(task).values(testTasks).returning();
  });

  afterAll(async () => {
    // Clean up test data
    await server.db.delete(task);
    
    await server.close();
  });

  it('should list all tasks successfully', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(4);
    
    // Check that all required fields are present
    const firstTask = result[0];
    expect(firstTask).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      description: expect.any(String),
      dueDate: expect.any(String),
      status: expect.stringMatching(/^(pending|in_progress|completed|cancelled)$/),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should filter tasks by status', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task?status=pending',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    
    // All returned tasks should have pending status
    result.forEach((task: { status: string }) => {
      expect(task.status).toBe('pending');
    });
  });

  it('should filter tasks by multiple statuses', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task?status=pending&status=in_progress',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    
    // All returned tasks should have either pending or in_progress status
    result.forEach((task: { status: string }) => {
      expect(['pending', 'in_progress']).toContain(task.status);
    });
  });

  it('should filter tasks by due date range', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task?dueDateFrom=2024-12-01T00:00:00.000Z&dueDateTo=2024-12-31T23:59:59.000Z',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    
    // All returned tasks should have due dates within the specified range
    result.forEach((task: { dueDate: string | null }) => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const fromDate = new Date('2024-12-01T00:00:00.000Z');
        const toDate = new Date('2024-12-31T23:59:59.000Z');
        expect(dueDate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
        expect(dueDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
      }
    });
  });

  it('should filter tasks by due date from only', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task?dueDateFrom=2024-12-01T00:00:00.000Z',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    
    // All returned tasks should have due dates on or after the specified date
    result.forEach((task: { dueDate: string | null }) => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const fromDate = new Date('2024-12-01T00:00:00.000Z');
        expect(dueDate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
      }
    });
  });

  it('should filter tasks by due date to only', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task?dueDateTo=2024-12-15T23:59:59.000Z',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    
    // All returned tasks should have due dates on or before the specified date
    result.forEach((task: { dueDate: string | null }) => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const toDate = new Date('2024-12-15T23:59:59.000Z');
        expect(dueDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
      }
    });
  });

  it('should combine status and due date filters', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task?status=pending&dueDateFrom=2024-12-01T00:00:00.000Z',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    
    // All returned tasks should have pending status and due dates on or after the specified date
    result.forEach((task: { status: string; dueDate: string | null }) => {
      expect(task.status).toBe('pending');
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const fromDate = new Date('2024-12-01T00:00:00.000Z');
        expect(dueDate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
      }
    });
  });

  it('should return tasks ordered by creation date', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/task',
    });

    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(Array.isArray(result)).toBe(true);
    
    // Check that tasks are ordered by createdAt (newest first)
    for (let i = 1; i < result.length; i++) {
      const currentTask = new Date(result[i].createdAt);
      const previousTask = new Date(result[i - 1].createdAt);
      expect(currentTask.getTime()).toBeLessThanOrEqual(previousTask.getTime());
    }
  });
}); 