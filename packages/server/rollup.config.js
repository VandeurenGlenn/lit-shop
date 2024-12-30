import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'
import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import typescript from '@rollup/plugin-typescript'
import builtins from 'rollup-plugin-node-builtins'
import { readdir } from 'fs/promises'
import { join } from 'path'
try {
  execSync('rm -rf ./exports')
} catch {}

export default [
  {
    input: ['src/server.ts', 'src/routes/images/routes.images.ts', 'src/routes/payconiq/routes.payconiq.ts'],
    external: ['serviceAccountKey.json', './routes.images.js', './routes/payconiq/routes.payconiq'],

    output: {
      dir: 'exports',
      format: 'es'
    },
    plugins: [json(), typescript({ compilerOptions: { outDir: 'exports' } })]
  }
]
