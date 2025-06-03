import {fileURLToPath, URL} from 'node:url';

import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import GitDescribe from "git-describe";

try {
    const gitInfo = GitDescribe.gitDescribeSync({
        customArguments: ['--abbrev=40']
    });
    process.env.VITE_GIT_HASH = gitInfo.hash;
    process.env.VITE_GIT_DIRTY = gitInfo.dirty.toString();
} catch {
    // ignore, we end up here when running tests on CI (error is "Git executable not found in PATH")
    process.env.VITE_GIT_HASH = '';
    process.env.VITE_GIT_DIRTY = '';
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    // TODO Remove with Bootstrap v5.5.0
    // Disable deprecation warnings due to Bootstrap not ready for them.
    // Further information:
    // - Issue: https://github.com/twbs/bootstrap/issues/40962
    // - Roadmap: https://github.com/orgs/twbs/discussions/41370
    //     -> Vite configuration template: https://github.com/twbs/examples/blob/main/vue/vite.config.js
    // - Draft PR to remove node-sass support (needed to fix the dart-sass deprecations):
    //   https://github.com/twbs/bootstrap/pull/41112
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    'import', // SASS 1.80.0+: @import is deprecated
                    'color-functions', // SASS 1.79.0+: color.red(), color.green()... deprecated in favor of color.channel()
                    'global-builtin', // SASS 1.80.0+: Global built-in functions like mix() or unit() are deprecated
                ],
            },
        },
    }
});
