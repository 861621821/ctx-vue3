import { createRouter, createWebHashHistory } from 'vue-router';
import Decrypt from '@/pages/decrypt/index.vue';
import Tools from '@/pages/tools/index.vue';
import Setting from '@/pages/setting/index.vue';

const routes = [
    { path: '/', redirect: '/decrypt' },
    { path: '/decrypt', component: Decrypt },
    { path: '/tools', component: Tools },
    { path: '/setting', component: Setting },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
