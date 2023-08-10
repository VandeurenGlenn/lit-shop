import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import { readdir } from 'fs/promises';
import { join } from 'path'
try { 
  execSync('rm -rf ./exports')
} catch {
  
}

export default [{
  input: [
    'src/controller.ts'
  ],

  output: {
    dir: 'exports',
    format: 'es'
  },
  plugins: [
    json(),
    typescript({ compilerOptions: { outDir: 'exports' }})
  ]
}];
