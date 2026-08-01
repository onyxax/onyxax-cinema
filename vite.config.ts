import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['discord-rpc']
            }
          }
        }
      },
      preload: {
        input: 'electron/preload.ts',
      },
    }),
  ],
  build: {
    cssMinify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

