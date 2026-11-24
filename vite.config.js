import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this site at https://founddeaduser.github.io/negativerealm/
// so the production build must use the base path "/negativerealm/".
// If you ever rename the repository, change REPO_NAME below.
const REPO_NAME = 'negativerealm'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE || (command === 'build' ? `/${REPO_NAME}/` : '/'),
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1500,
  },
}))
