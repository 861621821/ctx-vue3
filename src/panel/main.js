import CryptoJS from 'crypto-js';

const recordsList = [];
let networkPlusReady = false;

chrome.devtools.panels.create('NetworkPlus', null, '/src/devtool/devtool.html');

chrome.devtools.network.onRequestFinished.addListener(detail => {
    const {
        request: { url, postData, headers, method },
        response: {
            status,
            content: { mimeType },
        },
    } = detail;
    // 获取请求头、参数、response
    let params = {};
    if (postData?.text) {
        try {
            params = JSON.parse(postData.text);
        } catch (error) {
            params = postData.text;
        }
    }
    detail.getContent(content => {
        let response = {};
        try {
            response = JSON.parse(content);
        } catch (error) {
            response = content;
        }
        const record = {
            url,
            method,
            status,
            headers,
            params,
            response,
            mimeType,
        };
        const mimeTypes = ['application/json'];
        mimeTypes.includes(record.mimeType) && initRecord(record);
    });
});

// fix 解密报错
function filterSpace(str) {
    return str.replace(/\n/g, '').replace(/\r/g, '').replace(/\s/g, '');
}

function decryptParams(data, cookie) {
    if (!data?.enc_data) {
        return data;
    }
    let response = {};
    try {
        const key = CryptoJS.enc.Utf8.parse(cookie?.slice(cookie.length - 16));
        const decipher = CryptoJS.AES.decrypt(filterSpace(data.enc_data), key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        const plaintext = decipher.toString(CryptoJS.enc.Utf8);
        try {
            response = JSON.parse(plaintext);
        } catch (error) {
            response = plaintext;
        }
    } catch (error) {
        console.error(error, data, cookie);
    }
    return { ...data, enc_data: response };
}

function initRecord(record) {
    // 关键词过滤
    const { headers, params } = record;
    const cookie = headers.find(e => e.name?.toLowerCase() === 'security-token')?.value;
    const _record = {
        ...record,
        i: recordsList.length,
        params: decryptParams(params, cookie),
    };
    !networkPlusReady && recordsList.push(_record);
    chrome.runtime.sendMessage({ type: 'NewRecord', data: _record });
}

chrome.runtime.onMessage.addListener(({ type, data }, sender, sendResponse) => {
    if (type === 'NetworkPlusOpen') {
        sendResponse(recordsList);
        networkPlusReady = true;
    }
});
