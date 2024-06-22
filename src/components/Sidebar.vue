<template>
  <el-aside width="250px" class="menu">
    <div class="logo-container">
      <el-icon><i class="el-icon-setting"></i></el-icon>
      <h2 class="title">Video Assistance</h2>
    </div>
    <el-menu default-active="1" class="el-menu-vertical-demo" @select="handleMenuSelect">
      <el-menu-item index="1">
        <el-icon><i class="el-icon-menu"></i></el-icon>
        仪表盘
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><i class="el-icon-user"></i></el-icon>
        助手管理
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><i class="el-icon-setting"></i></el-icon>
        设置
      </el-menu-item>
      <el-menu-item index="4">
        <el-icon><i class="el-icon-bell"></i></el-icon>
        通知
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElAside, ElMenu, ElMenuItem, ElIcon } from 'element-plus'

export default defineComponent({
  name: 'Sidebar',
  components: {
    ElAside,
    ElMenu,
    ElMenuItem,
    ElIcon
  },
  setup() {
    const router = useRouter()

    const handleMenuSelect = (index) => {
      if (index === '1') {
        router.push('/dashboard')
      } else if (index === '2') {
        router.push('/manage')
      } else {
        console.log('选中菜单项', index)
        // 其他路由跳转逻辑
      }
    }

    return {
      handleMenuSelect
    }
  }
})
</script>

<style scoped>
.menu {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid #dee2e6;
}

.main {
  padding: 20px;
  background-color: #f8f9fa;
  overflow-y: auto;
}

.logo-container {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.logo-container .title {
  margin: 10px 0 0;
  font-size: 24px;
  font-weight: bold;
  color: #000000;
}
</style>
