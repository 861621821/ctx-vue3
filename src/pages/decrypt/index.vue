<template>
  <div class="decrypt-container">
    <div class="header">
      <el-input
        type="text"
        class="key-words"
        placeholder="输入关键词过滤"
        clearable
        v-model="keyWords"
      />
      <el-button class="filter-btn" type="primary" plain @click="handleFilter"
        >过滤</el-button
      >
      <el-button class="clear-btn" type="danger" plain @click="handleClear"
        >清除所有</el-button
      >
    </div>
    <div class="main">
      <div class="top">
        <div class="thead">
          <div class="th">#</div>
          <div class="th">Method</div>
          <div class="th">Url</div>
        </div>
        <div id="list">
          <el-scrollbar ref="scrollRef" style="height: 100%">
            <div class="list-container" ref="containerRef">
              <div
                class="row"
                v-for="(item, i) in listMap"
                :key="i"
                :class="currentIndex === i ? 'selected' : ''"
                @click="hanldeViewParams(item, i)"
              >
                <div class="td">{{ i + 1 }}</div>
                <div class="td">{{ item.method }}</div>
                <div class="td" :title="item.url">{{ item.url }}</div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="bottom">
        <el-tabs type="border-card" model-value="Payload">
          <el-scrollbar height="100%">
            <el-tab-pane
              :disabled="!currentParams"
              label="Headers"
              name="Headers"
            >
              <el-table
                v-if="currentHeaders.length"
                :data="currentHeaders"
                size="small"
                border
              >
                <el-table-column prop="name" label="Name" width="120" />
                <el-table-column prop="value" label="Value" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane
              :disabled="!currentParams"
              label="Payload"
              name="Payload"
            >
              <div class="info">
                <i
                  class="iconfont icon-fuzhi"
                  v-if="currentParams"
                  v-copyToClipboard="currentParams"
                ></i>
                <vue-json-pretty
                  v-if="currentParams"
                  :data="currentParams"
                  :showLine="false"
                  :showDoubleQuotes="false"
                />
              </div>
            </el-tab-pane>
          </el-scrollbar>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import CryptoJS from "crypto-js";
import { useUserStore } from "@/store/user.js";

const scrollRef = ref(null);
const containerRef = ref(null);

const listMap = ref([]);
const keyWords = ref("");
// 建立与 background.js 的通信连接
const port = chrome.runtime.connect({
  name: "popup",
});

chrome.storage.local.get("keyWords", (res) => {
  keyWords.value = res.keyWords || "";
});

// fix 解密报错
const filterSpace = (str) => {
  return str.replace(/\n*$/g, "").replace(/\n/g, "").replace(/\s/g, "");
};

// 解密
const { setNewTodo } = useUserStore();
const decryptParams = (data, cookie) => {
  if (!data.enc_data) {
    return data;
  }
  try {
    const key = CryptoJS.enc.Utf8.parse(cookie);
    const decipher = CryptoJS.AES.decrypt(filterSpace(data.enc_data), key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plaintext = decipher.toString(CryptoJS.enc.Utf8);
    return JSON.parse(plaintext);
  } catch (error) {
    setNewTodo(true);
    console.error(error, data, cookie);
    return { msg: "解码异常，请重试", error };
  }
};

const initRecords = (records) => {
  const list = records.map((e, i) => {
    return {
      ...e.payload,
      i,
      data: decryptParams(e.payload.data, e.payload.cookie),
      headers: e.headers,
    };
  });
  listMap.value = list;
  nextTick(() => {
    scrollRef.value &&
      scrollRef.value.setScrollTop(containerRef.value.clientHeight);
  });
};

chrome.runtime.onMessage.addListener(({ type, data }, sender, sendResponse) => {
  switch (type) {
    case 1:
      initRecords(data);
      break;

    default:
      break;
  }
});

const currentParams = ref(null);
const currentHeaders = ref([]);
const currentIndex = ref(-1);

const handleFilter = () => {
  listMap.value = [];
  currentParams.value = null;
  currentHeaders.value = [];
  currentIndex.value = -1;
  chrome.runtime.sendMessage({ type: 7, data: keyWords.value });
};

const handleClear = () => {
  listMap.value = [];
  chrome.runtime.sendMessage({ type: 2 });
};

const hanldeViewParams = (item, i) => {
  currentParams.value = item.data;
  currentHeaders.value = item.headers;
  currentIndex.value = i;
  nextTick(() => {
    const reg1 = /^[1-9][0-9]{9}$/gm;
    const reg2 = /^[1-9][0-9]{12}$/gm;

    document.querySelectorAll(".vjs-value").forEach((e) => {
      const text = e.innerText.replace(/"/g, "");
      if (reg1.test(text) || reg2.test(text)) {
        const date = new Date(Number(text));
        e.setAttribute("title", date.toLocaleString());
      }
    });
  });
};
</script>

<style lang="scss" scoped>
.decrypt-container {
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  .key-words {
    flex: 1;
  }
}

.filter-btn {
  margin-left: 12px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  overflow: hidden;
  .top {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-bottom: 5px;
    .thead {
      padding: 5px 0;
      background: var(--el-fill-color-light);
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
      div {
        padding: 0 5px;
        &:nth-of-type(1) {
          width: 25px;
        }
        &:nth-of-type(2) {
          width: 60px;
        }
        &:nth-of-type(1),
        &:nth-of-type(2) {
          text-align: center;
        }
        &:nth-of-type(3) {
          flex: 1;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }
  .bottom {
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
      .el-tabs__content {
        padding: 5px;
        flex: 1;
        overflow-y: auto;
      }
      .el-tabs__item {
        --el-font-size-base: 12px;
        padding: 0 10px;
        user-select: none;
      }
      .el-table__header-wrapper {
        display: none;
      }
      .el-table__cell:nth-of-type(1) {
        background: #f5f7fa;
      }
      .el-table .cell {
        line-height: 16px;
      }
    }
    .info {
      position: relative;
    }
    .icon-fuzhi {
      font-size: 16px;
      position: absolute;
      right: 10px;
      top: 5px;
      cursor: pointer;
      color: #999;
      z-index: 999;
      &:hover {
        color: #333;
      }
    }
  }
}
</style>