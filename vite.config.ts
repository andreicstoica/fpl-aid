import { config as loadEnv } from 'dotenv'
// Load .env then .env.local (local overrides default)
loadEnv()
loadEnv({ path: '.env.local', override: true })

import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import neon from './neon-vite-plugin.ts'

const config = defineConfig(({ mode }) => ({
  plugins: [
    // Only include Neon plugin in development (it's for creating claimable databases)
    ...(mode === 'development' ? [neon] : []),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    ...nitroV2Plugin({
      preset: 'vercel',
      compatibilityDate: '2025-10-29',
    }),
    viteReact(),
  ],
}))

export default config
