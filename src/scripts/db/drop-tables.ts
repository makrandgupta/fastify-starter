/* eslint-disable no-console */
import 'dotenv/config';
import postgres from 'postgres';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);

async function dropTables(): Promise<void> {
  const tables = [
    'rent_receipt',
    'payment',
    'expense',
    'rent_due',
    'rent_increase',
    'lease_tenant',
    'lease',
    'tenant',
    'unit',
    'property'
  ];

  console.log('🗑️  Dropping tables...');
  
  for (const table of tables) {
    try {
      await client`DROP TABLE IF EXISTS ${client(table)} CASCADE`;
      console.log(`✅ Dropped ${table}`);
    } catch (error) {
      console.log(`❌ Failed to drop ${table}:`, error);
    }
  }
  
  await client.end();
  console.log('✅ Done!');
}

// Run if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  dropTables().catch(console.error);
}

export { dropTables }; 