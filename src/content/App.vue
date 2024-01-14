<template>
  <el-config-provider size="small">
    <Jira></Jira>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from "element-plus";
import Jira from './components/jira.vue'

</script>
