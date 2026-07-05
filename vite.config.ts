import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Live data comes from the public worldcup26.ir API, which has open reads and
// CORS `*`, so the browser calls it directly — no dev proxy or API key needed.
//
// `base` is root ("/") for Vercel, but GitHub Pages serves the app from a
// project subpath ("/mondial2026/"). The Pages workflow sets GITHUB_PAGES=true
// so that build gets the right base while Vercel keeps serving from root.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/mondial2026/' : '/',
  plugins: [react()],
});
