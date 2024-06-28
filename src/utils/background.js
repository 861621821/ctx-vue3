class Background {
    TIME_INTERVAL = 15000;
    appReady = true; // 接收方是否准备好
    requestTime = null; // 请求时间
    stopTime = null; // 记录停止时间 1h后再次提示
    enableJira = true; // jira提醒开关
    jiraMap = {};

    constructor() {
        chrome.storage.local.get('enableJira', res => {
            this.enableJira = res.enableJira ?? true;
        });

        chrome.storage.onChanged.addListener(({ enableJira }) => {
            enableJira !== undefined && (this.enableJira = !!enableJira.newValue);
        });

        // 监听popup及content消息
        chrome.runtime.onMessage.addListener(({ type, data }, sender, sendResponse) => {
            switch (type) {
                case 'read':
                    // 标记已读
                    chrome.storage.local.set({ jiraMap: this.jiraMap });
                    break;

                case 'suspend':
                    // 暂停轮训
                    this.stopTime = Date.now();
                    break;

                case 'newTab':
                    // 打开新标签
                    chrome.tabs.create({
                        url: data, // https://baidu.com
                    });
                    break;

                default:
                    break;
            }
        });

        this.queryJira();
        setInterval(() => {
            this.queryJira();
        }, this.TIME_INTERVAL);

        // 监听浏览器切换前后台
        chrome.windows.onFocusChanged.addListener(windowId => {
            if (windowId !== -1) {
                this.queryJira(false);
                this.requestTime = Date.now();
            }
        });
    }

    // 发起通知
    notify(map) {
        const keys = Object.keys(map);
        let data = keys.map(key => {
            return { key: key, value: map[key] };
        });
        // 通知content
        keys.length &&
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (tabs[0] && !tabs[0].url.startsWith('chrome://')) {
                    try {
                        chrome.tabs.sendMessage(tabs[0].id, { type: 'newJiraNotify', data });
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
    }

    // 从string中提取jira列表
    formatJira(str) {
        this.jiraMap = {};
        const regex = /<td\s+class="summary">\s*<p>(\s*<a[^>]+>(.*?)<\/a>\s*)*<\/p>\s*<\/td>/g;
        const results = str.match(regex);
        results.forEach(e => {
            const regex = /<a.*?href="(.*?)".*?>(.*?)<\/a>/g;
            const temp = e.match(regex).pop();
            const match = regex.exec(temp);
            const href = match[1];
            const text = match[2];
            // 缓存jira列表
            this.jiraMap[href] = text;
        });
        chrome.storage.local.get('jiraMap', res => {
            const tempMap = JSON.parse(JSON.stringify(this.jiraMap));
            Object.keys(res.jiraMap || {}).forEach(key => {
                delete tempMap[key];
            });
            this.notify(tempMap);
        });
    }

    // 获取jira分配给我的信息
    queryJira(flag = true) {
        let now = Date.now();
        if (flag && (!this.enableJira || (this.requestTime && now - this.requestTime < this.TIME_INTERVAL))) {
            return;
        }
        this.requestTime = now;
        // 设置超时时间
        let controller = new AbortController();
        let timeout = setTimeout(() => {
            controller.abort();
        }, 5000);
        fetch(
            `https://jira.internal.pingxx.com/rest/gadget/1.0/issueTable/jql?num=10&tableContext=jira.table.cols.dashboard&addDefault=false&columnNames=issuetype&columnNames=issuekey&columnNames=summary&columnNames=assignee&columnNames=reporter&columnNames=status&columnNames=priority&enableSorting=true&paging=true&showActions=true&jql=assignee+%3D+currentUser()+AND+resolution+%3D+unresolved+ORDER+BY+priority+DESC%2C+created+ASC&sortBy=&startIndex=0&_=${Date.now()}`,
            { signal: controller.signal }
        )
            .then(async response => {
                clearTimeout(timeout);
                timeout = null;
                if (response.status === 401) {
                    // 未登陆 登陆过期
                    if (this.stopTime && Date.now() - this.stopTime < 1000 * 60 * 60) {
                        return;
                    }
                    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        if (tabs[0] && !tabs[0].url.startsWith('chrome://')) {
                            try {
                                chrome.tabs.sendMessage(tabs[0].id, { type: 'loginJiraNotify' });
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    });
                    return;
                }
                const data = await response.json();
                if (data?.table && this.appReady) {
                    this.formatJira(data?.table);
                    this.stopTime = null;
                }
            })
            .catch(err => {
                // clearTimeout(timeout);
                // timeout = null;
                // if (this.stopTime && Date.now() - this.stopTime < 1000 * 60 * 60) {
                //     return;
                // }
                // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                //     if (tabs[0] && !tabs[0].url.startsWith('chrome://')) {
                //         chrome.tabs.sendMessage(tabs[0].id, { type: 'loginJiraNotify' });
                //     }
                // });
            });
    }
}

const instance = new Background();

chrome.runtime.onInstalled.addListener(() => {
    instance.appReady = false;
});
