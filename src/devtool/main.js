import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import copyToClipboard from '../directives/copyToClipboard';
import '../assets/styles/index.scss';

import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const pinia = createPinia();
const app = createApp(App);
app.component('VueJsonPretty', VueJsonPretty);
app.directive('copyToClipboard', copyToClipboard);
app.use(router).use(pinia).mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// fix ResizeObserver loop completed with undelivered notifications
const debounce = (fn, delay) => {
    let timer = null;
    return function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments);
            timer = null;
        }, delay);
    };
};

const _ = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ {
    constructor(fn) {
        fn = debounce(fn, 50);
        super(fn);
    }
};
