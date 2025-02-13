import json from '@rollup/plugin-json'
import { execSync } from 'child_process'
import typescript from '@rollup/plugin-typescript'
try {
  execSync('rm -rf ./exports')
} catch {}

export default [
  {
    input: [
      'src/server.ts',
      'src/routes/images/routes.images.ts',
      'src/routes/payconiq/routes.payconiq.ts',
      'src/routes/generators/routes.qrcode.ts',
      'src/routes/orders/routes.orders.ts'
    ],
    external: ['serviceAccountKey.json', './routes.images.js', './routes/payconiq/routes.payconiq'],

    output: {
      dir: 'exports',
      format: 'es'
    },
    plugins: [json(), typescript({ compilerOptions: { outDir: 'exports' } })]
  }
]
