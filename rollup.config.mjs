// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import * as path from 'path';

// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'es',
      file: 'dist/index.es.js',
      sourcemap: true,
    },
    {
      format: 'cjs',
      sourcemap: true,
      file: 'dist/index.cjs.js',
    },
  ],
  plugins: [typescript()],
};
