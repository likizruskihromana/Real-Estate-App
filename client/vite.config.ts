import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({mode}) => {
  const env=loadEnv(mode,path.resolve(clientRoot,'..'),'');
  const sentryEnabled=Boolean(env.SENTRY_AUTH_TOKEN&&env.SENTRY_ORG&&env.SENTRY_PROJECT);
  return {
    root: path.resolve(clientRoot),
    plugins: [react(),...(sentryEnabled?[sentryVitePlugin({
      authToken:env.SENTRY_AUTH_TOKEN,
      org:env.SENTRY_ORG,
      project:env.SENTRY_PROJECT,
      release:{name:env.APP_RELEASE||env.VITE_APP_RELEASE||undefined},
      sourcemaps:{filesToDeleteAfterUpload:'**/*.map'},
      telemetry:false,
    })]:[])],
    build: {
      outDir: path.resolve(clientRoot, 'dist'),
      emptyOutDir: true,
      sourcemap:sentryEnabled,
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
  };
});
