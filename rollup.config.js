import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/entrypoints/cli.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['node_modules', 'dist', '**/*.test.ts'],
    }),
    nodeResolve({
      preferBuiltins: true,
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    }),
    commonjs(),
  ],
};
