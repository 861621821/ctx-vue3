<template>
    <div class="setting-container">
        <el-switch v-model="enableJira" :active-text="enableJira ? '关闭Jira提醒' : '开启Jira提醒'" @change="onChange" />
    </div>
</template>

<script setup>
import { ref } from 'vue';

const enableJira = ref(true);
chrome.storage.local.get('enableJira', res => {
    enableJira.value = res.enableJira || true;
});

const onChange = () => {
    chrome.storage.local.set({ enableJira: enableJira.value });
};
</script>

<style lang="scss" scoped>
.setting-container {
    padding: 20px;
}
</style>
