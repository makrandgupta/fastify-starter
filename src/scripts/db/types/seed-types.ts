// Types for seed data generation

export interface TaskSeed {
  name: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// Main seed data interface
export interface SeedData {
  tasks: TaskSeed[];
} 