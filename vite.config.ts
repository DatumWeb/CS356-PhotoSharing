import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production base must match the repo name for GitHub Pages project sites:
// https://<owner>.github.io/CS356-PhotoSharing/
// https://vite.dev/config/shared-options.html#base
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/CS356-PhotoSharing/' : '/',
}))
