<template>
  <div class="account-container">
    <div class="flex">
      <el-button style="margin-left: auto">导入账号</el-button>
    </div>
    <el-scrollbar>
      <div v-for="vibe in data" :key="vibe.vibe">
        <div class="vibe-title">{{ vibe.vibe }}</div>
        <div class="vibe-data">
          <el-table :data="vibe.data">
            <el-table-column prop="account"></el-table-column>
            <el-table-column prop="pwd"></el-table-column>
            <el-table-column
              prop="desc"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column prop="action" align="center" width="100px">
              <template #default="scope">
                <el-tooltip effect="dark" content="登录" placement="top">
                  <el-icon @click="handleLogin(scope.row)"><Switch /></el-icon>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref } from "vue";

const data = ref([
  {
    vibe: "DEV",
    data: [
      {
        account: "18700000000",
        pwd: "a1234567",
        desc: "系统账号",
      },
      {
        account: "17100000000",
        pwd: "abcd1234",
        desc: "大商户账号",
      },
    ],
  },
  { vibe: "SIT", data: [{ account: "18700000000", pwd: "a1234567" }] },
  { vibe: "PRO", data: [{ account: "18700000000", pwd: "a1234567" }] },
]);

const handleLogin = (data) => {
  // 获取当前激活的标签页ID
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // 发送消息到当前标签页的content.js
    chrome.tabs.sendMessage(tabs[0].id, { type: "8", data });
  });
};
</script>

<style lang="scss" scoped>
.account-container {
  .vibe-title {
    padding: 10px 0 10px 10px;
  }
  :deep(.el-table) {
    font-size: 12px;
    .el-table__header-wrapper .el-table__cell {
      padding: 0;
    }
    .el-icon {
      margin: 0 5px;
      cursor: pointer;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>