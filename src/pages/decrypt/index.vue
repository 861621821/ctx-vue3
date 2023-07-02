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
          <div
            class="row"
            v-for="(item, i) in listMap"
            :key="i"
            :class="current === i ? 'selected' : ''"
            @click="hanldeViewParams(item, i)"
          >
            <div class="td">{{ i + 1 }}</div>
            <div class="td">{{ item.method }}</div>
            <div class="td" :title="item.url">{{ item.url }}</div>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="info">
          <i
            class="iconfont icon-fuzhi"
            v-if="currentParams"
            v-copyToClipboard="currentParams"
          ></i>
          <div class="json-box">
            <pre id="json-inner"></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import CryptoJS from "crypto-js";

const listMap = ref([]);
const currentParams = ref("");
const current = ref(null);
const keyWords = ref("");
// 建立与 background.js 的通信连接
const port = chrome.runtime.connect({
  name: "popup",
});

chrome.storage.local.get("keyWords", (res) => {
  keyWords.value = res.keyWords || "";
});

// 加密
// const encryptParams = (params, cookie) => {
//   const data = CryptoJS.enc.Utf8.parse(params);
//   const key = CryptoJS.enc.Utf8.parse(cookie);
//   const encrypted = CryptoJS.AES.encrypt(data, key, {
//     mode: CryptoJS.mode.ECB,
//     padding: CryptoJS.pad.Pkcs7,
//   });
//   return encrypted.toString();
// };

// 解密
const decryptParams = (data, cookie) => {
  if (!data.enc_data) {
    return data;
  }
  try {
    const key = CryptoJS.enc.Utf8.parse(cookie);
    const decipher = CryptoJS.AES.decrypt(data.enc_data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plaintext = decipher.toString(CryptoJS.enc.Utf8);
    return JSON.parse(plaintext);
  } catch (error) {
    console.log(error);
    return { msg: "解码异常", error };
  }
};

const initRecords = (records) => {
  const list = records.map((e, i) => {
    return {
      ...e,
      i,
      data: decryptParams(e.data, e.cookie),
    };
  });
  listMap.value = list;
  nextTick(() => {
    var element = document.getElementById("list");
    element.scrollTop = element.scrollHeight;
  });
};

chrome.runtime.onMessage.addListener(({ type, data }, sender, sendResponse) => {
  switch (type) {
    case 1:
      initRecords(data.records);
      break;

    default:
      break;
  }
});

const handleFilter = () => {
  listMap.value = [];
  $("#json-renderer").html("");
  $("#json-inner").html("");
  chrome.runtime.sendMessage({ type: 7, data: keyWords.value });
};

const handleClear = () => {
  listMap.value = [];
  $("#json-renderer").html("");
  $("#json-inner").html("");
  chrome.runtime.sendMessage({ type: 2 });
};

const hanldeViewParams = (item, i) => {
  currentParams.value = JSON.stringify(item.data);
  current.value = i;
  $("#json-inner").jsonViewer(
    {},
    {
      collapsed: $("#collapsed").is(":checked"),
      withQuotes: $("#with-quotes").is(":checked"),
    }
  );
  setTimeout(() => {
    const i = $(this).data("index");
    $("#json-inner").jsonViewer(item.data, {
      collapsed: $("#collapsed").is(":checked"),
      withQuotes: $("#with-quotes").is(":checked"),
    });
    const reg1 = /^[1-9][0-9]{9}$/gm;
    const reg2 = /^[1-9][0-9]{12}$/gm;
    $("#json-inner")
      .find(".json-string")
      .each((i, e) => {
        const unix = $(e).text().replace(/['"]/g, "");
        if (reg1.test(unix) || reg2.test(unix)) {
          const date = new Date(Number(unix));
          $(e).attr("title", date.toLocaleString());
        }
      });
    $("#json-inner")
      .find(".json-literal")
      .each((i, e) => {
        const unix = $(e).text().replace(/['"]/g, "");
        if (reg1.test(unix) || reg2.test(unix)) {
          const date = new Date(Number(unix));
          $(e).attr("title", date.toLocaleString());
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
  padding: 10px 0;
  overflow: hidden;
  .top {
    flex: 1;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-bottom: 5px;
    .thead {
      padding: 5px 0;
      background: #f2f2f2;
    }
    #list {
      flex: 1;
      overflow: auto;
    }
    .thead,
    .row {
      display: flex;
      padding: 5px 0;
      cursor: pointer;
      &:nth-child(even) {
        background: #f6f6f6;
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
    padding: 5px 0 5px 10px;
    pre {
      font-family: system-ui, "PingFang SC", STHeiti, sans-serif !important;
      line-height: 1.2;
    }
    .info {
      position: relative;
      flex: 1;
      overflow: hidden;
      .json-box {
        height: 100%;
        width: 100%;
        overflow: auto;
      }
    }
    .icon-fuzhi {
      font-size: 16px;
      position: absolute;
      right: 10px;
      top: 5px;
      cursor: pointer;
      color: #999;
      &:hover {
        color: #333;
      }
    }
  }
}
</style>