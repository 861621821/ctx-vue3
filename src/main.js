import { createApp } from 'vue';
// import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import copyToClipboard from './directives/copyToClipboard';
import './assets/styles/index.scss';

import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

// const pinia = createPinia();
const app = createApp(App);
app.component('VueJsonPretty', VueJsonPretty);
app.directive('copyToClipboard', copyToClipboard);
app.use(router).mount('#app');
