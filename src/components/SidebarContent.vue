<template>
  <el-scrollbar class="scrollbar">
    <div class="logo-container">
      <el-icon><Setting /></el-icon>
      <h2 class="title">Video Assistance</h2>
    </div>
    <el-menu :default-active="$route.path" class="el-menu-vertical-demo" router>
      <el-menu-item index="/dashboard">
        <router-link to="/dashboard" class="router-link">
          <el-icon><Menu /></el-icon>
          <span>仪表盘</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/create">
        <router-link to="/create" class="router-link">
          <el-icon><Setting /></el-icon>
          <span>助手创建</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/manage">
        <router-link to="/manage" class="router-link">
          <el-icon><Setting /></el-icon>
          <span>助手管理</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/settings">
        <router-link to="/settings" class="router-link">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/notifications">
        <router-link to="/notifications" class="router-link">
          <el-icon><Setting /></el-icon>
          <span>通知</span>
        </router-link>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { defineComponent } from 'vue'
import { ElScrollbar, ElMenu, ElMenuItem, ElIcon } from 'element-plus'
import { Menu, Setting } from '@element-plus/icons-vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'SidebarContent',
  components: {
    ElScrollbar,
    ElMenu,
    ElMenuItem,
    ElIcon,
    Menu,
    Setting,
    RouterLink
  }
})
</script>

<style scoped>
.scrollbar {
  height: 100%;
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

.router-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
}

.router-link:hover {
  text-decoration: none;
}

.el-menu-item.is-active .router-link {
  color: #409eff;
}
</style>
