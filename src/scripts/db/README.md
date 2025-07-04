# Database Scripts

This directory contains database-related scripts for the property management system.

## Structure

The seed data system has been modularized for better maintainability:

```
src/scripts/db/
├── types/
│   └── seed-types.ts          # Shared type definitions
├── generators/
│   ├── index.ts               # Export all generators
│   ├── property-generator.ts  # Property data generation
│   ├── unit-generator.ts      # Unit data generation
│   ├── tenant-generator.ts    # Tenant data generation
│   ├── lease-generator.ts     # Lease data generation
│   ├── rent-increase-generator.ts  # Rent increase data generation
│   ├── rent-due-generator.ts  # Rent due data generation
│   ├── expense-generator.ts   # Expense data generation
│   └── payment-generator.ts   # Payment data generation
├── seed-database.ts           # Main orchestrator script
├── test-seed.ts               # Test-specific seed data
├── drop-tables.ts             # Drop all tables
└── README.md                  # This file
```

## Usage

### Seed the database with sample data

```bash
npm run db:seed
```

This will:
1. Generate sample data for all entities
2. Insert data in the correct order (respecting foreign key constraints)
3. Create relationships between entities
4. Provide a summary of inserted records

### Drop all tables

```bash
npm run db:drop
```

### Run test-specific seeding

```bash
npm run db:seed:test
```

## Modular Design

### Types (`types/seed-types.ts`)

Contains all shared type definitions for seed data:
- `PropertySeed`
- `UnitSeed`
- `TenantSeed`
- `LeaseSeed`
- `RentIncreaseSeed`
- `RentDueSeed`
- `ExpenseSeed`
- `PaymentSeed`
- `SeedData` (main interface)

### Generators (`generators/`)

Each generator file contains:
- A single generator function for one entity type
- JSDoc documentation
- Proper TypeScript typing
- Console logging for progress tracking

### Main Orchestrator (`seed-database.ts`)

The main script that:
- Coordinates all generators
- Handles database connections
- Manages insertion order
- Maps generated data to actual database IDs
- Provides error handling and cleanup

## Benefits of Modular Structure

1. **Maintainability**: Each entity type has its own file
2. **Reusability**: Generators can be imported individually
3. **Testability**: Easy to test individual generators
4. **Type Safety**: Shared types ensure consistency
6. **Clear Dependencies**: Each generator shows its dependencies

## Adding New Data

To add new sample data:

1. Add types to `types/seed-types.ts` if needed
2. Create a new generator file in `generators/`
3. Export it from `generators/index.ts`
4. Update the main orchestrator in `seed-database.ts`
5. Update this README

## Database Schema

The seed data creates a realistic property management scenario with:
- 2 properties (Maple Gardens, Riverside Heights)
- 6 units across both properties
- 4 tenants in occupied units
- 4 active leases
- Rent increases, due dates, expenses, and payments 