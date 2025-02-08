import {fileURLToPath, URL} from 'node:url';

import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig(({_command, mode}) => {

    // Load environment from .env files.
    // See https://vitejs.dev/config/#using-environment-variables-in-config
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            vue(),
            VueDevTools(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            proxy: {
                '/api': env.VITE_PROXY_API_URL
            }
        }
    };
});
