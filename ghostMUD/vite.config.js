import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500
  },
  server: {
    port: 5173,
    open: true,
    watch: {
      ignored: ['**/temp/**', '**/aidoc/**', '**/_*.js']
    }
  },
  optimizeDeps: {
    entries: ['src/main.js']
  }
});
