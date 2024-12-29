import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: ['./src/imgur-base.ts', './src/imgur/imgur.ts', './src/device.ts', './src/firebase.ts'],

    output: {
      dir: 'exports',
      format: 'es'
    },
    plugins: [
      resolve(),
      typescript({ compilerOptions: { outDir: 'exports' } })
      // terser({ keep_classnames: true })
    ]
  }
]
