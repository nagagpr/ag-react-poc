import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any host or sub-folder.
  base: './',
  // AG Grid's AllCommunityModule is ~1.4 MB (~390 kB gzipped); fine for a POC.
  build: { chunkSizeWarningLimit: 1600 },
});
