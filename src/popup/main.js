import { createApp } from 'vue';
import router from './router';
import App from './App.vue';
import copyToClipboard from '../directives/copyToClipboard';
import '../assets/styles/index.scss';

import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);
app.component('VueJsonPretty', VueJsonPretty);
app.directive('copyToClipboard', copyToClipboard);
app.use(router).mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
