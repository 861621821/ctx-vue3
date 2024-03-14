<template>
    <div class="decrypt-container">
        <div class="header flex flex-center">
            <i
                class="iconfont icon-qingchushujuku"
                style="margin-right: 10px; cursor: pointer; font-size: 18px"
                :style="{
                    color: recordsList.length ? (hasError ? 'red' : '#333') : '#999',
                    cursor: recordsList.length ? 'pointer' : 'not-allowed',
                }"
                @click="handleClear"></i>
            <el-input type="text" class="key-words" placeholder="输入关键词过滤" clearable v-model="keyWords" />
            <el-button class="filter-btn" type="primary" plain @click="handleFilter">过滤</el-button>
            <el-checkbox v-model="onlyAjax" disabled label="Fetch/XHR" title="Show Only Fetch/XHR" />
            <div class="desc"><i class="iconfont icon-tishi"></i>由于Chrome限制，需要先激活NetworkPlus（手动打开面板一次）后才能记录请求信息</div>
        </div>
        <div class="main">
            <div class="left-area">
                <div class="thead">
                    <div class="th">#</div>
                    <div class="th">Method</div>
                    <div class="th">Status</div>
                    <div class="th">Url</div>
                </div>
                <div id="list">
                    <el-scrollbar ref="scrollRef" style="height: 100%">
                        <div class="list-container" ref="containerRef">
                            <div class="row" v-for="(item, i) in recordsList" :key="i" :class="currentIndex === i ? 'selected' : ''" @click="hanldeViewParams(item, i)">
                                <div class="td">{{ i + 1 }}</div>
                                <div class="td">{{ item.method }}</div>
                                <div class="td">{{ item.status }}</div>
                                <div class="td" :title="item.url">{{ item.url }}</div>
                            </div>
                        </div>
                    </el-scrollbar>
                </div>
            </div>
            <div class="adjustment"></div>
            <div class="right-area" style="--el-border-color: #d8d8d8">
                <el-tabs model-value="Payload" type="border-card" style="--el-bg-color-overlay: transparent; --el-border-color-light: #d8d8d8">
                    <el-scrollbar height="100%">
                        <el-tab-pane :disabled="!currentRecord" label="RequestHeaders" name="Headers">
                            <el-table
                                v-if="currentRecord?.headers?.length"
                                :data="currentRecord?.headers"
                                size="small"
                                border
                                style="--el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-border-color: #d8d8d8">
                                <el-table-column prop="name" label="Name" width="120" />
                                <el-table-column prop="value" label="Value">
                                    <template #default="scope">
                                        <div class="content-column flex flex-center">
                                            {{ scope.row.value }}
                                            <i class="iconfont icon-fuzhi" style="margin-left: 8px" v-if="scope.row.name.toLowerCase() === 'request-id'" v-copyToClipboard="scope.row.value"></i>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <el-tab-pane :disabled="!currentRecord" label="Payload" name="Payload">
                            <div class="info">
                                <i class="iconfont icon-fuzhi payload" v-if="currentRecord" v-copyToClipboard="currentRecord?.params"></i>
                                <vue-json-pretty v-if="currentRecord?.params" :data="currentRecord?.params" :showLine="false" :showDoubleQuotes="false" showIcon :key="Date.now()" />
                            </div>
                        </el-tab-pane>
                        <el-tab-pane :disabled="!currentRecord" label="Preview" name="Preview">
                            <div class="info">
                                <i class="iconfont icon-fuzhi preview" v-if="currentRecord?.response" v-copyToClipboard="currentRecord?.response"></i>
                                <vue-json-pretty v-if="currentRecord?.response" :data="currentRecord?.response" :showLine="false" :showDoubleQuotes="false" showIcon :deep="2" :key="Date.now()" />
                            </div>
                        </el-tab-pane>
                    </el-scrollbar>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import CryptoJS from 'crypto-js';

const onlyAjax = ref(true);
const hasError = ref(false);

const scrollRef = ref(null);
const containerRef = ref(null);

const recordsList = ref([]);
const keyWords = ref('');

// fix 解密报错
const filterSpace = str => {
    return str.replace(/\n/g, '').replace(/\r/g, '').replace(/\s/g, '');
};

const decryptParams = (data, cookie) => {
    if (!data?.enc_data) {
        return data;
    }
    try {
        const key = CryptoJS.enc.Utf8.parse(cookie?.slice(cookie.length - 16));
        const decipher = CryptoJS.AES.decrypt(filterSpace(data.enc_data), key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        const plaintext = decipher.toString(CryptoJS.enc.Utf8);
        let response = {};
        try {
            response = JSON.parse(plaintext);
        } catch (error) {
            response = plaintext;
        }
        return { ...data, enc_data: response };
    } catch (error) {
        hasError.value = true;
        console.error(error, data, cookie);
        return { msg: '解码异常，请重试', error };
    }
};

const initRecord = record => {
    // 关键词过滤
    const { url, method, status, headers, params } = record;
    if (keyWords.value) {
        const reg = new RegExp(keyWords.value, 'gi');
        if (!reg.test(url) && !reg.test(method) && !reg.test(status)) {
            return;
        }
    }
    const cookie = headers.find(e => e.name?.toLowerCase() === 'security-token')?.value;
    recordsList.value.push({
        ...record,
        i: recordsList.value.length,
        params: decryptParams(params, cookie),
    });
    nextTick(() => {
        scrollRef.value && scrollRef.value.setScrollTop(containerRef.value.clientHeight);
    });
};

const currentRecord = ref(null);
const currentIndex = ref(-1);

const handleFilter = () => {
    recordsList.value = recordsList.value.filter(e => {
        const { url, method, status } = e;
        const reg = new RegExp(keyWords.value, 'gi');
        return reg.test(url) || reg.test(method) || reg.test(status);
    });
    currentRecord.value = null;
    currentIndex.value = -1;
};

const handleClear = () => {
    recordsList.value = [];
    currentRecord.value = null;
    currentIndex.value = -1;
    chrome.runtime.sendMessage({ type: 'clear' });
};

// 对象排序
const sortObjectKey = obj => {
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        const keys = Object.keys(obj).sort();
        const newObj = {};
        keys.forEach(e => {
            newObj[e] = sortObjectKey(obj[e]);
        });
        return newObj;
    } else if (Array.isArray(obj)) {
        return obj.map(e => sortObjectKey(e));
    } else {
        return obj;
    }
};

const hanldeViewParams = (item, i) => {
    currentRecord.value = sortObjectKey(item);
    currentIndex.value = i;
    nextTick(() => {
        // 时间戳转换
        const reg1 = /^[1-9][0-9]{9}$/gm;
        const reg2 = /^[1-9][0-9]{12}$/gm;

        document.querySelectorAll('.vjs-value').forEach(e => {
            const text = e.innerText.replace(/"/g, '');
            if (reg1.test(text) || reg2.test(text)) {
                const date = new Date(Number(text));
                e.setAttribute('title', date.toLocaleString());
            }
        });
    });
};

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
        if (onlyAjax.value) {
            mimeTypes.includes(record.mimeType) && initRecord(record);
        } else {
            initRecord(record);
        }
    });
});
</script>

<style lang="scss" scoped>
.decrypt-container {
    display: flex;
    flex-direction: column;
}
.header {
    display: flex;
    .key-words {
        width: 200px;
    }
    .desc {
        margin-left: auto;
        margin-right: 10px;
        font-size: 10px;
        color: #a8abb2;
        display: flex;
        align-items: center;
        i {
            font-size: 12px;
            margin-right: 4px;
            color: #ff3f3f;
        }
    }
}

.filter-btn {
    margin: 0 12px;
}

.main {
    flex: 1;
    display: flex;
    padding-top: 5px;
    margin-top: 5px;
    overflow: hidden;
    border-top: 1px solid #ebeef5;
    .left-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-bottom: 5px;
        .thead {
            padding: 5px 0;
            background: var(--el-fill-color-light);
            border-radius: 4px;
        }
        #list {
            flex: 1;
            overflow: hidden;
            color: #606266;
        }
        .thead,
        .row {
            display: flex;
            padding: 5px 0;
            div {
                padding: 0 5px;
                &:nth-of-type(1) {
                    width: 25px;
                }
                &:nth-of-type(2),
                &:nth-of-type(3) {
                    width: 60px;
                }
                &:nth-of-type(1),
                &:nth-of-type(2),
                &:nth-of-type(3) {
                    text-align: center;
                }
                &:nth-of-type(4) {
                    flex: 1;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
            }
        }
        .row {
            cursor: pointer;
            transition: background 0.2s;
            &:nth-child(even) {
                background: #f7f7f7;
            }
            &:hover {
                background: #c2e7ea7c;
            }
            &.selected {
                background: #c2e7ea;
            }
        }
    }
    .right-area {
        flex: 1;
        display: flex;
        overflow: hidden;
        :deep(.el-tabs) {
            --el-tabs-header-height: 26px;
            width: 100%;
            display: flex;
            flex-direction: column;
            border-radius: 4px;
            overflow: hidden;
            & > .el-tabs__header {
                background: transparent;
            }
            .el-tabs__content {
                padding: 5px;
                flex: 1;
                overflow-y: auto;
            }
            .el-tabs__item {
                --el-font-size-base: 12px;
                padding: 0 10px;
                user-select: none;
                &.is-active {
                    background: transparent;
                    border-right-color: transparent;
                    border-left-color: transparent;
                }
            }
            .el-table__header-wrapper {
                display: none;
            }
            .el-table .cell {
                line-height: 16px;
            }
            .el-table__inner-wrapper:before {
                content: unset;
            }
        }
        .info {
            position: relative;
        }
        .icon-fuzhi {
            font-size: 16px;
            cursor: pointer;
            color: #999;
            z-index: 999;
            &:hover {
                color: #333;
            }
            &.payload,
            &.preview {
                position: absolute;
                right: 10px;
                top: 5px;
            }
        }
    }

    .adjustment {
        width: 1px;
        margin: 0 2px;
        // cursor: col-resize;
        // background: #ebeef5;
    }
}
</style>
