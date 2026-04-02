import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/entrypoints/cli.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  platform: 'node',
});
