// 检测到登录弹窗后关闭
const obs = new MutationObserver((records) => {
    for (let i = 0; i < records.length; i++) {
        const el = records[i].addedNodes[0];
        if (el && el.className === 'passport-login-container') {
            document.body.removeChild(el);
            break;
        }
    }
});
obs.observe(document.body, {
    childList: true,
    subtree: true,
});

// 关闭页面停止观察
window.addEventListener('beforeunload', () => {
    obs.disconnect();
});

// 复制
document.addEventListener('keydown', function (event) {
    // 检查是否按下了Ctrl键（或Cmd键，Mac上）
    var isCtrlPressed = event.ctrlKey || event.metaKey;

    // 检查是否按下了C键
    var isCPressed = event.key === 'c';

    // 如果同时按下了Ctrl+C，则触发你的自定义事件
    if (isCtrlPressed && isCPressed) {
        const text = window.getSelection().toString();
        navigator.clipboard.writeText(text);
    }
});
