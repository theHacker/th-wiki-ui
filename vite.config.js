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
} catch (e) {
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
    }
});
