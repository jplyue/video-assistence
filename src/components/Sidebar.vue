<template>
  <el-aside width="250px" class="menu">
    <div class="logo-container">
      <el-icon><i class="el-icon-setting"></i></el-icon>
      <h2 class="title">Video Assistance</h2>
    </div>
    <el-menu :default-active="$route.path" class="el-menu-vertical-demo" router>
      <el-menu-item index="/dashboard">
        <router-link to="/dashboard" class="router-link">
          <el-icon><i class="el-icon-menu"></i></el-icon>
          <span>仪表盘</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/create">
        <router-link to="/manage" class="router-link">
          <el-icon><i class="el-icon-user"></i></el-icon>
          <span>助手创建</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/manage">
        <router-link to="/manage" class="router-link">
          <el-icon><i class="el-icon-user"></i></el-icon>
          <span>助手管理</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/settings">
        <router-link to="/settings" class="router-link">
          <el-icon><i class="el-icon-setting"></i></el-icon>
          <span>设置</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="/notifications">
        <router-link to="/notifications" class="router-link">
          <el-icon><i class="el-icon-bell"></i></el-icon>
          <span>通知</span>
        </router-link>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
import { defineComponent } from 'vue'
import { ElAside, ElMenu, ElMenuItem, ElIcon } from 'element-plus'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'Sidebar',
  components: {
    ElAside,
    ElMenu,
    ElMenuItem,
    ElIcon,
    RouterLink
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
  color: #409eff; /* Element Plus 主色 */
}
</style>
