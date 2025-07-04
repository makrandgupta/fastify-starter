import { buildServer } from '@/server.js';
import { task } from '@/modules/task/task.schema.js';
import type { InferInsertModel } from 'drizzle-orm';

describe('PUT /task/:id', () => {
  let server: Awaited<ReturnType<typeof buildServer>>;
  let testTaskId: number;

  beforeAll(async () => {
    server = await buildServer({ testMode: true });
    // Insert a test task
    const [inserted] = await server.db.insert(task).values({
      name: 'Original Task',
      description: 'Original description',
      dueDate: '2024-12-31',
      status: 'pending',
    } as InferInsertModel<typeof task>).returning();
    testTaskId = inserted.id;
  });

  afterAll(async () => {
    await server.db.delete(task);
    await server.close();
  });

  it('should update all fields of a task', async () => {
    const updateData = {
      name: 'Updated Task',
      description: 'Updated description',
      dueDate: '2025-01-01T00:00:00.000Z',
      status: 'completed' as const,
    };
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: updateData,
    });
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result).toMatchObject({
      id: testTaskId,
      name: 'Updated Task',
      description: 'Updated description',
      dueDate: '2025-01-01',
      status: 'completed',
    });
  });

  it('should update only the name', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: { name: 'Name Only Update' },
    });
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result.name).toBe('Name Only Update');
  });

  it('should update only the status', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: { status: 'in_progress' },
    });
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result.status).toBe('in_progress');
  });

  it('should set description and dueDate to null if empty string is provided', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: { description: '', dueDate: '' },
    });
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result.description).toBeNull();
    expect(result.dueDate).toBeNull();
  });

  it('should return 404 for non-existent task', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/task/999999',
      headers: { 'authorization': 'Bearer test-token' },
      payload: { name: 'Does not matter' },
    });
    expect(response.statusCode).toBe(404);
    const result = JSON.parse(response.payload);
    expect(result.message).toMatch(/not found/i);
  });

  it('should return 400 for invalid input (name too long)', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: { name: 'a'.repeat(256) },
    });
    expect(response.statusCode).toBe(400);
  });

  it('should return 400 for empty body', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: {},
    });
    expect(response.statusCode).toBe(400);
    const result = JSON.parse(response.payload);
    expect(result.message).toMatch(/at least one field/i);
  });

  it('should return 400 for invalid status', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: { status: 'not_a_status' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('should return 400 for invalid date', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/task/${testTaskId}`,
      headers: { 'authorization': 'Bearer test-token' },
      payload: { dueDate: 'not-a-date' },
    });
    expect(response.statusCode).toBe(400);
  });
}); 