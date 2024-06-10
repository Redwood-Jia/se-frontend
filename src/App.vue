<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/evenness">平整度检测</router-link> |
    <router-link to="/crack">幕墙爆裂检测</router-link>
  </nav> -->

  <!-- 控制侧边菜单是否展开 -->
  <div class="app-container">
    <div class="menu-container">
      <div class="menu-btn-container">
        <el-button @click="handleMenuClicked" circle>
          <el-icon><Menu /></el-icon>
        </el-button>
      </div>

      <el-menu
        :default-active="activeIndex"
        :collapse="isCollapse"
        @select="handleSelect"
        router="true"
        mode="vertical"
      >
        <el-menu-item index="/" route="/">
          <el-icon><House /></el-icon>
          <template #title>主页面</template>
        </el-menu-item>
        <el-menu-item index="/evenness" route="/evenness">
          <el-icon><Memo /></el-icon>
          <template #title>平整度检测</template>
        </el-menu-item>
        <el-menu-item index="/crack" route="/crack">
          <el-icon><document /></el-icon>
          <template #title>玻璃爆裂检测</template>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="view-container">
      <router-view/>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const isCollapse = ref(false); // 侧边栏展开；其值与radio-button的value绑定
const route = useRoute();

const activeIndex = ref("/"); //一开始默认设置成主菜单
// 捕捉侧边栏是否被点击
const handleMenuClicked = (event) => {
  isCollapse.value = !isCollapse.value;
  // click后失去焦点
  event.target.blur();
}

const handleSelect = (index) => {
  console.log(index);
}

watch(
  () => route.path,
  (newPath) => {
    console.log("newPath:",newPath);
    activeIndex.value = newPath;
  }
)
</script>

<style lang="scss">
.app-container {
  display:flex;
  flex-direction: row; // 按行方向排列
  justify-content: center;
  align-content: center;
}

.menu-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-container {
  flex:10;
}
</style>
