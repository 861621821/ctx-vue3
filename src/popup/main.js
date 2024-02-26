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

// 浏览器指纹
import Fingerprint2 from 'fingerprintjs2';
import { insertFingerprint } from '../utils/supabase';

requestIdleCallback(function () {
    Fingerprint2.get(function (components) {
        const values = components.map(component => component.value); // 配置的值的数组
        const fingerprint = Fingerprint2.x64hash128(values.join(''), 31); // 生成浏览器指纹
        insertFingerprint(fingerprint);
    });
});
