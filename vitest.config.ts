import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'; // Use vite-tsconfig-paths for alias support

export default defineConfig({
  test: {
    globals: true, // Make test globals (describe, it, expect) available without imports
    environment: 'node', // Specify the test environment
    isolate: false,
    pool: 'threads',
    server: {
      deps: {
        inline: true,
      }
    },
    // Optional: Setup files to run before each test file
    setupFiles: ['./src/scripts/test/setup.ts'],
    // Optional: Coverage configuration
    // coverage: {
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html'],
    //   include: ['src/**/*.ts'],
    //   exclude: ['src/db/**', 'src/index.ts', 'src/server.ts', 'src/**/*.d.ts'],
    // },
  },
  plugins: [
    tsconfigPaths(), // Add plugin to resolve tsconfig path aliases (@/*)
  ],
}); 