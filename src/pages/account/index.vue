<template>
  <div class="account-container">
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
                <el-icon @click="handleLogin(scope.row)"><Promotion /></el-icon>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const data = ref([]);

const handleLogin = (data) => {
  // 获取当前激活的标签页ID
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // 发送消息到当前标签页的content.js
    chrome.tabs.sendMessage(tabs[0].id, { type: 20, data });
  });
};

onMounted(() => {
  fetch("/账号.json").then(async (res) => {
    data.value = await res.json();
  });
});
</script>

<style lang="scss" scoped>
.account-container {
  .vibe-title {
    padding: 10px 0 10px 10px;
    font-weight: bold;
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