import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: path.resolve(clientRoot),
  plugins: [react()],
  build: {
    outDir: path.resolve(clientRoot, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/vitest.setup.ts',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
