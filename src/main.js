import { createApp } from 'vue';
// import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import copyToClipboard from './directives/copyToClipboard';
import './assets/styles/index.scss';

// const pinia = createPinia();
const app = createApp(App);
app.directive('copyToClipboard', copyToClipboard);
app.use(router).mount('#app');
