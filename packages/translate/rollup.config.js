import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { readdir } from 'fs/promises'
import { join } from 'path'

const translations = (await readdir('./src/translations')).map((path) => join('./src/translations', path))
console.log(translations);
export default [{
  input: [
    './src/translate.ts',
    './src/string.ts',
  ],

  output: {
    dir: 'exports',
    format: 'es'
  },
  plugins: [
    json(),
    resolve(),
    typescript()
    // terser({ keep_classnames: true })
  ]
}, {
  input: translations,

  output: {
    dir: 'exports/translations',
    format: 'es'
  },
  plugins: [
    json()
  ]
}];
