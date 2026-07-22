import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React Core Vendor Chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Lucide Icons Vendor Chunk
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Word Export Vendor Chunk (heavy ~550 KB)
          if (id.includes('node_modules/docx')) {
            return 'vendor-docx';
          }
          // PDF Export Vendor Chunk (~135 KB)
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas') || id.includes('node_modules/dompurify')) {
            return 'vendor-jspdf';
          }
          // File Saver Micro Utility (~3 KB)
          if (id.includes('node_modules/file-saver')) {
            return 'vendor-filesaver';
          }
          // Curriculum & Dictionary Offline Data Chunk
          if (id.includes('src/services/contentEngine.ts') || id.includes('src/utils/dictionary.ts')) {
            return 'learning-curriculum';
          }
        }
      }
    }
  }
});
