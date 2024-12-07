import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'
import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import typescript from '@rollup/plugin-typescript'
import builtins from 'rollup-plugin-node-builtins'
import { cp, readdir } from 'fs/promises'
import { join } from 'path'
import materialSymbols from 'rollup-plugin-material-symbols'
import terser from '@rollup/plugin-terser'

cp('../../node_modules/@vandeurenglenn/lite-elements/exports/themes', 'www/themes', { recursive: true })
try {
  execSync('rm -rf ./www/*.js')
} catch {
  console.log('No files to delete')
}

const sw = `
try {
  window.registration = await navigator.serviceWorker.register('/service-worker.js');
  registration.onupdatefound = () => {
    // notifyUpdate();
  };
  console.log('Registration successful, scope is:', registration.scope);
} catch (error) {
  console.log('Service worker registration failed, error:', error);
}`

const prepareAndCopy = async () => {
  // execSync(`rm www/${target}/*.js`);
  let index = await readFileSync(`src/index.html`)
  index = index.toString()
  // let isProduction = execSync('set production');
  // console.log(isProduction.toString());
  // isProduction = Boolean(isProduction.toString().split('=')[1] === 'true \r\n');
  // index = index.replace('// @build:sw', isProduction ? sw : '');
  await writeFileSync(`www/index.html`, index)
}

prepareAndCopy()

const dirs = (await readdir('./src/sections')).map((dir) => join('./src/sections', dir))

let input = []
for (const dir of dirs) {
  input = [...(await readdir(dir)).map((file) => join(dir, file)), ...input]
}

export default [
  {
    input: ['src/shell.ts', 'src/api.ts', ...input],

    output: {
      dir: 'www',
      format: 'es'
    },
    plugins: [
      json(),
      resolve(),
      typescript(),
      // cjs(),
      // builtins(),
      materialSymbols({
        elements: ['md-icon'],
        placeholderPrefix: 'symbol'
      })
      // terser({ keep_classnames: true })
    ]
  }
]
