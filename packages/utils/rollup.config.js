import { execSync } from 'child_process'
import typescript from '@rollup/plugin-typescript'
try {
  execSync('rm -rf ./exports')
} catch {}

export default [
  {
    input: ['src/index.ts'],
    external: ['uuid'],
    output: {
      dir: 'exports',
      format: 'es'
    },
    plugins: [typescript()]
  }
]
