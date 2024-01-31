import { createApp } from 'vue';
import App from './App.vue';
import mainCss from './main.scss?inline';
import {} from './utils';

// 创建一个shadow根元素
const createAppRoot = () => {
    const shadowParent = document.createElement('div');
    shadowParent.id = 'shadow-root';
    shadowParent.style = 'width: 0;height:0;overflow: hidden;';
    document.body.appendChild(shadowParent);

    const appRootEl = document.createElement('div');
    appRootEl.id = 'crx-app-root';

    const appRootStyle = document.createElement('style');
    appRootStyle.textContent = mainCss;

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('src/sandbox/sandbox.html');

    const shadow = shadowParent.attachShadow({ mode: 'open' });
    shadow.appendChild(appRootStyle);
    shadow.appendChild(appRootEl);
    shadow.appendChild(iframe);
    return appRootEl;
};

const initApp = () => {
    const appRoot = createAppRoot();
    const app = createApp(App);
    app.mount(appRoot);
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // 页面已经加载，可以执行脚本
    // "interactive" 表示 DOM 已解析完毕，但像图像、样式表等资源可能还在加载
    // "complete" 表示页面及所有依赖资源已完全加载
    initApp();
} else {
    window.addEventListener('load', initApp);
}
