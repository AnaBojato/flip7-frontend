import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const plugins = [react()]

if (process.env.VITE_COVERAGE === 'true') {
  const istanbul = (await import('vite-plugin-istanbul')).default
  plugins.push(
    istanbul({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules', 'test/'],
      extension: ['.ts', '.tsx'],
      requireEnv: false,
    }),
  )
}

export default defineConfig({
  plugins,
})
