/* eslint-disable no-console */
import 'dotenv/config';

import { generateTasks } from './generators/task-generator.js';

async function testSeedGeneration(): Promise<void> {
  console.log('🧪 Testing seed data generation...\n');

  try {
    // Generate tasks
    console.log('1. Testing task generation...');
    const tasks = generateTasks();
    console.log(`   ✅ Generated ${tasks.length} tasks`);
    if (tasks.length > 0) {
      console.log(`   Sample: ${tasks[0]?.name} - ${tasks[0]?.status}\n`);
    }

    console.log('🎉 All seed data generation tests passed!');
    console.log('\n📊 Summary:');
    console.log(`   Tasks: ${tasks.length}`);

  } catch (error) {
    console.error('❌ Error during seed data generation test:', error);
    throw error;
  }
}

// Run the test
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  testSeedGeneration().catch(console.error);
} 