import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const page = (p) => fileURLToPath(new URL(p, import.meta.url))

// Relative base so the build works from any sub-path (e.g. GitHub Pages).
// The site has three entry pages: the portfolio and two stand-alone demo tools.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: page('./index.html'),
        promptpay: page('./demos/promptpay/index.html'),
        linestop: page('./demos/linestop/index.html'),
      },
    },
  },
})
