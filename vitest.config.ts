// The tests: the kit's helpers in Node, its components in a real Firefox and Chromium
// (windows, popovers, the focus and the keyboard as a browser does them),
// run headless by Playwright.
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [svelte({ configFile: './svelte.config.js' })],
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unit', environment: 'node', include: ['src/lib/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'components',
          include: ['src/components/**/*.test.ts', 'src/theme.test.ts'],
          setupFiles: ['src/test/setup.ts'],
          // One file at a time: the keyboard and the focus belong to one
          // page, and files run side by side would take them from each other.
          fileParallelism: false,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [
              { browser: 'firefox', viewport: { width: 1536, height: 864 } },
              { browser: 'chromium', viewport: { width: 1536, height: 864 } },
            ],
          },
        },
      },
    ],
  },
});
