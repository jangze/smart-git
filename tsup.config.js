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
  target: 'node20',
  outDir: 'dist',
  loader: {
    '.ts': 'ts',
  },
  platform: 'node',
  esbuildOptions: (options) => {
    options.resolveExtensions = ['.ts', '.js'];
  },
});
