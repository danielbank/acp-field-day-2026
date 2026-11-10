// vite.config.js — build settings. Please don't change during class.
// `npm run build` → dist/   ·   `npm run build:offline` → dist-offline/game.html (one file, no server)

import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';
  return {
    base: './',
    build: { outDir: offline ? 'dist-offline' : 'dist', emptyOutDir: true },
    plugins: offline ? [viteSingleFile(), renameHtml('game.html')] : [],
  };
});

// Renames the built index.html (e.g. to game.html).
function renameHtml(newName) {
  return {
    name: 'rename-html',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.fileName === 'index.html') file.fileName = newName;
      }
    },
  };
}
