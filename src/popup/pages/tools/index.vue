<template>
  <div class="tools-container">
    <el-tabs type="border-card" size="small">
      <el-tab-pane label="JSON">
        <div class="json">
          <div class="json-json-str">
            <textarea
              class="json-str-textarea"
              placeholder="输入json字符串进行格式化"
              v-model="jsonStr"
              @change="onJsonStrChange"
            ></textarea>
          </div>
          <div class="json-json-box">
            <vue-json-pretty
              v-if="json"
              :data="json"
              :showLine="false"
              :showDoubleQuotes="false"
            />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Time">
        <div class="shijian">
          <el-descriptions :column="1">
            <el-descriptions-item label="时间戳转北京时间：">
              <el-input
                :placeholder="`${Date.now()}`"
                v-model="unix"
              ></el-input>
              <span class="date">{{ localeDate }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="北京时间转时间戳：">
              <el-input
                placeholder="yyyy-MM-dd HH:mm:ss"
                v-model="locale"
              ></el-input>
              <span class="unix">{{ unixTime }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

// json格式化
const json = ref(null);
const onJsonStrChange = (e) => {
  console.log(e.target.value);
  json.value = JSON.parse(e.target.value);
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

// 时间转换
const localeDate = ref("");
const unix = ref(Date.now());
watch(
  unix,
  (val) => {
    const date = new Date(Number(val));
    localeDate.value = date.toLocaleString();
  },
  { immediate: true }
);
const locale = ref(new Date().toLocaleString());
const unixTime = ref("");
watch(
  locale,
  (val) => {
    const date = new Date(val);
    unixTime.value = date.getTime();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.el-tabs {
  --el-tabs-header-height: 30px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  :deep(.el-tabs__content) {
    flex: 1;
    .el-tab-pane {
      height: 100%;
      & > div {
        height: 100%;
      }
    }
  }
}

.json {
  display: flex;
  border: 1px solid #dcdfe6;
  position: relative;
  & > div {
    flex: 1;
    overflow: auto;
    &:first-of-type {
      border-right: 1px solid #dcdfe6;
    }
  }
  textarea {
    width: 100%;
    height: calc(100% - 3px);
    border: unset;
    resize: none;
    outline: none;
    padding: 5px;
  }
  .json-json-box {
    padding: 5px 12px;
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

.shijian {
  .el-input {
    width: auto;
    margin-right: 20px;
  }
}
</style>