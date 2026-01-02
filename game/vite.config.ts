import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webgpu-typescript/',
  build: {
    target: 'esnext',
  },
});
