let isReady = false; // NetworkPlus是否准备就绪
let records = []; // 记录请求

chrome.devtools.panels.create('NetworkPlus', null, '/src/devtool/devtool.html', (panel) => {
    panel.onShown.addListener(function (window) {
        console.info('NetworkPlus is open!');
        isReady = true;
        chrome.runtime.sendMessage({ type: 1, data: records });
        records = [];
    });
});

chrome.devtools.network.onRequestFinished.addListener((detail) => {
    const {
        request: { url, postData, headers, method },
        response: {
            status,
            content: { mimeType },
        },
    } = detail;
    // console.log(mimeType);
    // 获取请求头、参数、response
    const params = postData?.text ? JSON.parse(postData.text) : {};
    detail.getContent((content) => {
        let response = {};
        try {
            response = JSON.parse(content);
        } catch (error) {
            response = content;
        }
        const record = {
            url,
            headers,
            method,
            params,
            status,
            response,
            mimeType,
        };
        if (isReady) {
            chrome.runtime.sendMessage({ type: 1, data: [record] });
        } else {
            records.push(record);
        }
    });
});
