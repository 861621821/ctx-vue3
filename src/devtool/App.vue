<template>
  <el-config-provider size="small">
    <div class="section">
      <router-view></router-view>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from "element-plus";
</script>

<style lang="scss" scoped>
.section {
  flex: 1;
  overflow: hidden;
  & > div {
    height: 100%;
    width: 100%;
  }
}
</style>