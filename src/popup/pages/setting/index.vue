<template>
  <div class="setting-container">
    <el-switch
      v-model="enableJira"
      active-text="开启Jira提醒"
      @change="onChange"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";

const enableJira = ref(false);
chrome.storage.local.get("enableJira", (res) => {
  enableJira.value = !!res.enableJira;
});

const onChange = () => {
  chrome.storage.local.set({ enableJira: enableJira.value });
};
</script>

<style lang="scss" scoped>
</style>