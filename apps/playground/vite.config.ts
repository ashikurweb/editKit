import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@editkit/core': path.resolve(__dirname, '../../packages/core/src'),
      '@editkit/ui/styles': path.resolve(__dirname, '../../packages/ui/src/styles/editor.css'),
      '@editkit/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
