import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE PATH
// './' (relative) works on any GitHub Pages URL and locally, so nothing needs replacing.
// The GitHub Actions workflow sets VITE_BASE to "/<your-repo-name>/" automatically.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || './',
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1500,
  },
})
