import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@vellora/core': path.resolve(__dirname, '../../packages/core/src'),
      '@vellora/ui/styles': path.resolve(__dirname, '../../packages/ui/src/styles/editor.css'),
      '@vellora/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
