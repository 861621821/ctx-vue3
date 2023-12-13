import { createRouter, createWebHashHistory } from 'vue-router';
import Network from './pages/network/index.vue';

const routes = [
    { path: '/', redirect: '/network' },
    { path: '/network', component: Network },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
