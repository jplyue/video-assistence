<template>
  <el-aside width="200px">
    <el-menu :default-active="activeIndex" class="el-menu-vertical-demo">
      <el-menu-item index="1" @click="navigateTo('/')">
        <i class="el-icon-s-home"></i>
        <template v-slot:title>
          <span>主页</span>
        </template>
      </el-menu-item>
      <el-menu-item-group title="助手列表">
        <el-menu-item index="2-1" @click="navigateTo('/assistant/1')">助手 1</el-menu-item>
        <el-menu-item index="2-2" @click="navigateTo('/assistant/2')">助手 2</el-menu-item>
        <el-menu-item index="2-3" @click="navigateTo('/assistant/3')">助手 3</el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </el-aside>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const activeIndex = ref('1')

    const navigateTo = (path) => {
      router.push(path)
    }

    return {
      activeIndex,
      navigateTo
    }
  }
}
</script>

<style scoped>
.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
}
</style>
