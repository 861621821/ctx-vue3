import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import zipPack from 'vite-plugin-zip-pack';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import fs from 'fs';

// 编译完成之后添加jquery到manifest.json
const fixManifest = () => ({
    writeBundle() {
        const manifestPath = './dist/manifest.json';
        const _manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        delete _manifest.content_scripts[0].css;
        _manifest.content_scripts.unshift({
            js: ['jquery-3.7.1.js'],
            matches: ['http://*/*', 'https://*/*', '<all_urls>'],
        });
        fs.writeFileSync(manifestPath, JSON.stringify(_manifest, null, 2));
    },
});

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
        crx({ manifest }),
        fixManifest(),
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
        // zipPack({
        //     outDir: './',
        // }),
    ],
    build: {
        watch: true,
        rollupOptions: {
            treeshake: true,
            input: {
                panel: path.resolve(__dirname, '/src/panel/panel.html'),
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
