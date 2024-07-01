<template>
  <div>
    <!-- Mobile menu button -->
    <el-button v-if="isMobile" class="menu-button" @click="toggleDrawer">
      <el-icon><Menu /></el-icon>
    </el-button>

    <!-- Drawer for mobile view -->
    <el-drawer
      v-if="isMobile"
      :model-value="drawerVisible"
      direction="ltr"
      size="80%"
      :with-header="false"
      custom-class="sidebar-drawer"
      @close="toggleDrawer"
    >
      <SidebarContent />
    </el-drawer>

    <!-- Aside for PC view -->
    <el-aside v-else width="250px" class="menu">
      <SidebarContent />
    </el-aside>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElButton, ElDrawer, ElAside, ElIcon } from 'element-plus'
import { Menu } from '@element-plus/icons-vue'
import SidebarContent from './SidebarContent.vue'

export default defineComponent({
  name: 'Sidebar',
  components: {
    ElButton,
    ElDrawer,
    ElAside,
    ElIcon,
    Menu,
    SidebarContent
  },
  setup() {
    const drawerVisible = ref(false)
    const isMobile = ref(window.innerWidth <= 768)

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    const toggleDrawer = () => {
      drawerVisible.value = !drawerVisible.value
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      drawerVisible,
      toggleDrawer,
      isMobile
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

.scrollbar {
  height: 100%;
}

.menu-button {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 2000;
}

.sidebar-drawer {
  z-index: 3000;
}

@media (max-width: 768px) {
  .menu {
    border-right: none;
  }
}
</style>
