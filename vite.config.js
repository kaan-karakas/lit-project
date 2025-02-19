import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    modulePreload: true,
  },
  resolve: {
    dedupe: ['lit']
  }
});
