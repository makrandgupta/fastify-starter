import { pgTable, serial, text, timestamp, date } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled'
]);

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  dueDate: date('due_date'),
  status: taskStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 