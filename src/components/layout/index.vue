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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const {
  options: { routes },
} = useRouter();

const menus = computed(() => {
  let res = [];
  routes.forEach((item) => {
    if (item.meta?.isMenu) {
      res.push({
        name: item.path.replace("/", ""),
        path: item.path,
        icon: item.meta?.icon,
      });
    }
  });
  return res;
});
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
    margin: 8px 0;
  }
  .router-link-active {
    color: var(--el-color-primary);
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
      color: var(--el-color-primary);
    }
  }
  border-right: 1px solid #dcdfe6;
}
</style>