import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import zipPack from 'vite-plugin-zip-pack';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/assets/styles/element.scss" as *;`,
            },
        },
    },
    plugins: [
        vue(),
        AutoImport({
            resolvers: [
                ElementPlusResolver({
                    importStyle: 'sass',
                }),
            ],
        }),
        Components({
            resolvers: [
                ElementPlusResolver({
                    importStyle: 'sass',
                }),
            ],
        }),
        zipPack({
            outDir: './',
        }),
    ],
    build: {
        watch: true,
        rollupOptions: {
            treeshake: true,
            input: {
                devtool: path.resolve(__dirname, '/src/devtool/devtool.html'),
                popup: path.resolve(__dirname, '/src/popup/popup.html'),
            },
            output: {
                manualChunks: {
                    vue: ['vue'],
                    elementPlus: ['element-plus'],
                    pinia: ['pinia'],
                    vueRouter: ['vue-router'],
                },
            },
        },
    },
});
