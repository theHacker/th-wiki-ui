import {fileURLToPath} from 'node:url';
import {mergeConfig, defineConfig, configDefaults} from 'vitest/config';
import viteConfig from './vite.config';

// Use defineConfig() to cope with callback viteConfig.
// See https://github.com/vitest-dev/vitest/issues/4687#issuecomment-1843181549
export default defineConfig(config => mergeConfig(
    viteConfig(config),
    defineConfig({
        test: {
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/**'],
            root: fileURLToPath(new URL('./', import.meta.url))
        }
    })
));
