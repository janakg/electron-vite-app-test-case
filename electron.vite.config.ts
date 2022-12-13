import { resolve } from 'path'
import { defineConfig } from 'electron-vite'

import injectProcessEnvPlugin from 'rollup-plugin-inject-process-env'
import tsconfigPathsPlugin from 'vite-tsconfig-paths'
import reactPlugin from '@vitejs/plugin-react'

import { resources } from './package.json'
const outPath = resolve('./out')

const tsconfigPaths = tsconfigPathsPlugin({
  projects: [resolve('tsconfig.json')],
})

const isDev = process.env.NODE_ENV === 'development'
const devAlias = {}
export default defineConfig({
  main: {
    assetsInclude: [
      '**/*.wasm',
      '**/*.ttf',
      '**/*.otf',
      '**/*.woff',
      '**/*.woff2',
    ],
    plugins: [tsconfigPaths],
    publicDir: resolve(resources, 'public'),
    build: {
      // ssr: true, // https://github.com/vitejs/vite/issues/4405
      // assetsInlineLimit: 1600000, // 1.6MB (default: 4096)
      rollupOptions: {
        input: {
          main: resolve('src/main/index.ts'),
          gen: resolve('src/gen/index.ts'),
        },

        output: {
          dir: outPath,
        },
      },
      // outDir: outPath,
    },
    resolve: {
      alias: isDev ? devAlias : {},
    },
  },

  preload: {
    assetsInclude: [
      '**/*.wasm',
      '**/*.ttf',
      '**/*.otf',
      '**/*.woff',
      '**/*.woff2',
    ],
    plugins: [tsconfigPaths],

    build: {
      // outDir: outPath,

      rollupOptions: {
        input: {
          preload: resolve('src/preload/index.ts'),
        },

        output: {
          dir: outPath,
        },
      },
    },
  },

  renderer: {
    assetsInclude: [
      '**/*.wasm',
      '**/*.ttf',
      '**/*.otf',
      '**/*.woff',
      '**/*.woff2',
    ],
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
      // outDir: outPath,

      rollupOptions: {
        plugins: [
          injectProcessEnvPlugin({
            NODE_ENV: 'production',
            platform: process.platform,
          }),
        ],

        input: {
          app: resolve('src/renderer/index.html'),
        },

        output: {
          dir: outPath,
        },
      },
    },
  },
})
