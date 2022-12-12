import { resolve, normalize, dirname } from 'path'
import { defineConfig } from 'electron-vite'

import injectProcessEnvPlugin from 'rollup-plugin-inject-process-env'
import tsconfigPathsPlugin from 'vite-tsconfig-paths'
import reactPlugin from '@vitejs/plugin-react'

import { main, resources } from './package.json'

const [devFolder] = normalize(dirname(main)).split(/\/|\\/g)
const devPath = [devFolder].join('/')

const tsconfigPaths = tsconfigPathsPlugin({
  projects: [resolve('tsconfig.json')],
})

const isDev = process.env.NODE_ENV === 'development'
const devAlias = {}
export default defineConfig({
  main: {
    plugins: [tsconfigPaths],

    build: {
      // ssr: true, // https://github.com/vitejs/vite/issues/4405
      // assetsInlineLimit: 1600000, // 1.6MB (default: 4096)
      rollupOptions: {
        input: {
          index: resolve('src/main/index.ts'),
          gen: resolve('src/gen/index.ts'),
        },

        output: {
          dir: resolve(devPath, 'main'),
        },
      },
    },

    resolve: {
      alias: isDev ? devAlias : {},
    },
  },

  preload: {
    plugins: [tsconfigPaths],

    build: {
      outDir: resolve(devPath, 'preload'),
    },
  },

  renderer: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.platform': JSON.stringify(process.platform),
    },

    server: {
      port: 4927,
    },

    plugins: [tsconfigPaths, reactPlugin()],
    publicDir: resolve(resources, 'public'),

    build: {
      outDir: resolve(devPath, 'renderer'),

      rollupOptions: {
        plugins: [
          injectProcessEnvPlugin({
            NODE_ENV: 'production',
            platform: process.platform,
          }),
        ],

        input: {
          index: resolve('src/renderer/index.html'),
        },

        output: {
          dir: resolve(devPath, 'renderer'),
        },
      },
    },
  },
})
