<template>
  <div class="setting-container">
    <el-form :model="setting" label-width="auto">
      <el-form-item label="Jira">
        <el-switch v-model="setting.jira" @change="onChange" />
      </el-form-item>
      <el-form-item label="掘金">
        <el-switch v-model="setting.juejin" @change="onChange" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const setting = ref({
  jira: false,
  juejin: false,
});

chrome.storage.local.get("jira", (res) => {
  setting.value.jira = res.jira ?? false;
});

chrome.storage.local.get("juejin", (res) => {
  setting.value.juejin = res.juejin ?? false;
});

const onChange = () => {
  chrome.storage.local.set({ jira: setting.value.jira });
  chrome.storage.local.set({ juejin: setting.value.juejin });
};
</script>

<style lang="scss" scoped>
.setting-container {
  padding: 20px;
}
</style>
