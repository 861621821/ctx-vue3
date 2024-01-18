<template>
    <div v-if="modelType !== 0" class="xl-model min-w-[350px] max-w-[600px] bg-slate-50 p-[20px] rounded-[12px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
        <sapn @click="handleCloseClick" class="close cursor-pointer flex items-center justify-around rotate-45 w-[16px] h-[16px] text-slate-600 bg-slate-100 shadow-sm absolute right-[-6px] top-[-6px] rounded-full">+</sapn>
        <div class="xl-jira py-[12px]">
            <div class="xl-msg" v-if="modelType === 1">
                <div class="text-[20px] flex items-center mb-[10px]"><img :src="newUrl" class="w-[32px] h-[32px] mr-[5px]">你有<span> {{ jiraList.length }} </span>条新的Jira任务</div>
                <p @click="handleJiraClick(jira)" v-for="jira in jiraList" :key="jira.key" class="text-[#1eafb4] max-w-[350px] text-ellipsis">{{ jira.value }}</p>
            </div>
            <div class="xl-login flex flex-col items-center" v-else-if="modelType === 2">
                <div class="text-[20px] text-center mb-[16px]">Jira未登陆或登陆已过期</div>
                <button @click="handleLogin" class="login-btn rounded-lg px-[20px] leading-[36px] border hover:bg-slate-50">重新登陆</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const newUrl = chrome.runtime.getURL('src/assets/image/new.png');

const modelType = ref(0); // 1: jira, 2: login
const jiraList = ref([]);

chrome.runtime.onMessage.addListener(({ type, data }) => {
    if (type === 3 && data.length) {
        modelType.value = 1   
        jiraList.value = data;
    } else if (type === 6) {
        modelType.value = 2
    }
});

const handleLogin = () => {
    modelType.value = 0;
    window.open('https://jira.internal.pingxx.com/login.jsp', '_blank');
}

// 监听点击后反馈给background
const handleJiraClick = ({ key, value }) => {
    modelType.value = 0;
    window.open(key, '_blank');
    chrome.runtime.sendMessage({ type: 4 });
}

const handleCloseClick = () => {
    chrome.runtime.sendMessage({ type: modelType.value === 1 ? 4 : 5 });
    modelType.value = 0;
}
</script>
