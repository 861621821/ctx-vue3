import { createRouter, createWebHashHistory } from 'vue-router';
import Account from './pages/account/index.vue';
import Tools from './pages/tools/index.vue';
import Setting from './pages/setting/index.vue';

const routes = [
    { path: '/', redirect: '/account' },
    { path: '/account', component: Account, meta: { isMenu: true, icon: 'icon-account' } },
    { path: '/setting', component: Setting, meta: { isMenu: true, icon: 'icon-setting' } },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
