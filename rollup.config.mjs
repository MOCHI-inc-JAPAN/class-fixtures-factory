// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import * as path from 'path';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'es',
      file: 'dist/index.es.js',
      sourcemap: true,
      plugins: [typescript()],
    },
    {
      format: 'cjs',
      sourcemap: true,
      file: 'dist/index.cjs.js',
      plugins: [typescript()],
    },
  ],
};
