import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Ship minified production code without exposing the readable src/ modules.
// Worker entries also pass through Oxc, unlike files copied from public/.
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'oxc',
    cssMinify: 'lightningcss',
    sourcemap: false,
    target: 'safari16.4',
    rolldownOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        sw: resolve(import.meta.dirname, 'workers/sw.js'),
        'pcm-capture.worklet': resolve(import.meta.dirname, 'workers/pcm-capture.worklet.js'),
      },
      output: {
        entryFileNames: chunk =>
          ['sw', 'pcm-capture.worklet'].includes(chunk.name)
            ? `${chunk.name}.js`
            : 'assets/[name]-[hash].js',
      },
    },
  },
});
