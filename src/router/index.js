import { createRouter, createWebHashHistory } from 'vue-router';
import Decrypt from '@/pages/decrypt/index.vue';
import Account from '@/pages/account/index.vue';
import Tools from '@/pages/tools/index.vue';
import Setting from '@/pages/setting/index.vue';

const routes = [
    { path: '/', redirect: '/decrypt' },
    { path: '/decrypt', component: Decrypt, meta: { isMenu: true, icon: 'icon-jiemi' } },
    { path: '/account', component: Account, meta: { isMenu: true, icon: 'icon-account' } },
    { path: '/tools', component: Tools, meta: { isMenu: true, icon: 'icon-gongju' } },
    { path: '/setting', component: Setting, meta: { isMenu: true, icon: 'icon-setting' } },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
