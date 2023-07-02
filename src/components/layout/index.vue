<template>
  <div class="side-bar-container">
    <img src="@/assets/image/logo.png" class="logo" alt="" srcset="" />
    <router-link :to="menu.path" v-for="menu in menus" :key="menu.name">
      <i class="iconfont" :class="menu.icon"></i>
    </router-link>
  </div>
  <div class="section">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref } from "vue";

const menus = ref([
  { name: "jiemi", path: "/decrypt", icon: "icon-jiemi" },
  { name: "tools", path: "/tools", icon: "icon-gongju" },
  { name: "setting", path: "/setting", icon: "icon-setting" },
]);
const currentMenu = ref("jiemi");
</script>

<style lang="scss" scoped>
.section {
  flex: 1;
  padding: 0 10px;
  overflow: hidden;
  & > div {
    height: 100%;
    width: 100%;
  }
}
.side-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 5px;
  a {
    color: #333;
    text-decoration: none;
    margin: 5px 0;
  }
  .router-link-active {
    color: #1eafb4;
  }
  .logo {
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
  }
  .iconfont {
    font-size: 22px;
    margin: 5px 0;
    padding: 2px;
    cursor: pointer;
    transition: all 0.2s;
    &.active {
      color: #1eafb4;
    }
  }
  border-right: 1px solid #dcdfe6;
}
</style>