# TO DO API

A Fastify-based REST API starter with PostgreSQL database and Drizzle ORM. Implements a simple task list as example.

## Prerequisites

*   Node.js (v22.14.1 or later)
*   pnpm (v10.8.1 or later)
*   PostgreSQL database running

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd todo-api
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    ```bash
    cp env.example .env
    # Edit .env and provide your DATABASE_URL and other required variables
    ```

4.  **Database Migrations:**
    ```bash
    pnpm run db:generate
    pnpm run db:migrate
    ```

5.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

The API will be available at `http://localhost:3000`

## GitHub Actions

This project includes simple GitHub Actions workflows for continuous integration:

### Workflows

1. **Tests (`test.yml`)**
   - Runs on push to `main`/`develop` and pull requests
   - Sets up PostgreSQL service for database tests
   - Runs all tests with `pnpm test`

2. **Lint (`lint.yml`)**
   - Runs on push to `main`/`develop` and pull requests
   - Runs ESLint for code quality
   - Runs TypeScript type checking

### Usage

**For Pull Requests:**
- Both workflows run automatically
- Tests must pass before merging
- Code must pass linting checks

**For Main Branch:**
- Both workflows run on every push
- Ensures code quality and test coverage

### Local Testing

Test the workflows locally:

```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Build project
pnpm build
```

## Available Scripts

*   `pnpm run dev`: Starts the development server with hot-reloading.
*   `pnpm run build`: Compiles the TypeScript code to JavaScript in the `dist` folder.
*   `pnpm run start`: Starts the production server (requires running `build` first).
*   `pnpm run test`: Runs tests using Vitest.
*   `pnpm run test:watch`: Runs tests in watch mode.
*   `pnpm run lint`: Runs ESLint to check code quality.
*   `pnpm run lint:fix`: Runs ESLint and automatically fixes issues.
*   `pnpm run type-check`: Runs TypeScript type checking without emitting files.
*   `pnpm run db:generate`: Generates SQL migration files based on schema changes.
*   `pnpm run db:migrate`: Applies pending database migrations.
*   `pnpm run db:studio`: Opens Drizzle Studio to inspect the database.
*   `pnpm run db:seed`: Seeds the database with sample data.
*   `pnpm run db:drop`: Drops all tables (use with caution).

## Project Structure

*   `src/`: Main application source code.
    *   `modules/`: Feature modules (auth, expense, lease, payment, property, rent, tenant, unit).
    *   `plugins/`: Fastify plugins (database, environment, JWT, sensible).
    *   `scripts/`: Database scripts and generators.
    *   `index.ts`: Application entry point.
    *   `server.ts`: Fastify server setup.
*   `drizzle/`: Database migration files and metadata.
*   `dist/`: Compiled JavaScript output.
*   `env.example`: Example environment variables.
*   `.github/workflows/`: GitHub Actions CI workflows.

## Environment Variables

Required environment variables:

- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)

## API Documentation

The API includes the following modules:

- **Authentication**: JWT-based authentication
- **Properties**: Property management
- **Units**: Unit management within properties
- **Tenants**: Tenant information
- **Leases**: Lease agreements
- **Rent**: Rent due and increases
- **Payments**: Payment processing
- **Expenses**: Expense tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all CI checks pass
6. Submit a pull request

## License

[Specify the project license, e.g., MIT.] 
