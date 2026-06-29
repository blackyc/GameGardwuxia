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
      ignored: ['**/work/**', '**/docs/**', '**/_*.js']
    }
  },
  optimizeDeps: {
    // work/ 下文件通过 <script> 标签经典加载，禁止 Vite 扫描
    entries: ['src/main.js']
  }
});
