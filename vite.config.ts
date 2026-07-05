import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Live data comes from the public worldcup26.ir API, which has open reads and
// CORS `*`, so the browser calls it directly — no dev proxy or API key needed.
export default defineConfig({
  plugins: [react()],
});
