import type { TaskSeed } from '../types/seed-types.js';

/**
 * Generates sample task data for seeding the database
 * @returns Array of TaskSeed objects
 */
export function generateTasks(): TaskSeed[] {
  const tasks: TaskSeed[] = [
    // Generic tasks
    { name: 'Complete project documentation', description: 'Write comprehensive documentation for the new API endpoints', dueDate: '2024-01-15', status: 'pending' },
    { name: 'Review code changes', description: 'Code review for the latest feature branch', dueDate: '2024-01-20', status: 'in_progress' },
    { name: 'Update dependencies', description: 'Check and update npm packages to latest versions', dueDate: '2024-02-01', status: 'pending' },
    { name: 'Write unit tests', description: 'Add unit tests for the new authentication module', dueDate: '2024-01-25', status: 'completed' },
    { name: 'Fix bug in login form', description: 'Users reporting issues with password reset functionality', dueDate: '2024-01-30', status: 'pending' },
    { name: 'Design new UI components', description: 'Create mockups for the dashboard redesign', dueDate: '2024-02-10', status: 'pending' },
    { name: 'Optimize database queries', description: 'Review and optimize slow database queries', dueDate: '2024-02-15', status: 'in_progress' },
    { name: 'Deploy to staging', description: 'Deploy the latest changes to staging environment', dueDate: '2024-02-20', status: 'pending' },
    { name: 'Update user manual', description: 'Update the user manual with new features', dueDate: '2024-01-18', status: 'completed' },
    { name: 'Plan next sprint', description: 'Review backlog and plan tasks for the next sprint', dueDate: '2024-02-05', status: 'pending' },
  ];

  return tasks;
} 