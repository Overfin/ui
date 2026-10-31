import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ configFile: '../svelte.config.js' })],
  build: { outDir: 'dist', emptyOutDir: true },
});
