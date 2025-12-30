import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: true, // Enable for mobile testing
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
});
