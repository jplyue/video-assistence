<template>
  <el-container class="dashboard">
    <!-- 左侧菜单栏 -->
    <Sidebar :drawerVisible="drawerVisible" @toggleMenu="toggleMenu" />

    <!-- 右侧内容区域 -->
    <el-container>
      <el-header class="header">
        <div v-if="isMobile" class="mobile-header">
          <div>
            <el-button class="menu-button" @click="toggleMenu">
              <el-icon><Menu /></el-icon>
            </el-button>
          </div>
        </div>
        <div v-else class="desktop-header">
          <h2 class="title">Dashboard</h2>
          <div class="header-buttons">
            <el-button type="primary" @click="navigateToAssistantManagement">管理助手</el-button>
            <el-button type="danger" @click="logout">登出</el-button>
          </div>
        </div>
      </el-header>
      <el-main class="main">
        <el-row v-if="isMobile">
          <div class="page-header">
            <div><h2 class="title">Dashboard</h2></div>
            <div>
              <el-button type="primary" @click="navigateToAssistantManagement">
                <el-icon><Setting /></el-icon>
              </el-button>
              <el-button type="danger" @click="logout">
                <el-icon><SwitchButton /></el-icon>
              </el-button>
            </div>
          </div>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" :xs="{ span: 24 }">
            <div class="chart-container">
              <canvas id="chart1"></canvas>
            </div>
          </el-col>
          <el-col :span="12" :xs="{ span: 24 }">
            <div class="chart-container">
              <canvas id="chart2"></canvas>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12" :xs="{ span: 24 }">
            <div class="chart-container">
              <canvas id="chart3"></canvas>
            </div>
          </el-col>
          <el-col :span="12" :xs="{ span: 24 }">
            <div class="chart-container">
              <canvas id="chart4"></canvas>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElContainer, ElHeader, ElMain, ElRow, ElCol, ElButton, ElIcon } from 'element-plus'
import Sidebar from '@/components/Sidebar.vue'
import { Menu, Setting, SwitchButton } from '@element-plus/icons-vue'
import Chart from 'chart.js/auto'
import { getTokenFromCookie, removeTokenFromCookie } from '@/request'

export default defineComponent({
  name: 'Dashboard',
  components: {
    Sidebar,
    ElContainer,
    ElHeader,
    ElMain,
    ElRow,
    ElCol,
    ElButton,
    ElIcon,
    Menu,
    Setting,
    SwitchButton
  },
  setup() {
    const router = useRouter()
    const isMobile = ref(window.innerWidth <= 768)
    const drawerVisible = ref(false)

    const checkToken = () => {
      const token = getTokenFromCookie()
      if (!token.length) {
        logout()
      }
    }

    const logout = () => {
      removeTokenFromCookie()
      router.push('/login')
    }

    const navigateToAssistantManagement = () => {
      router.push('/manage')
    }

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    const toggleMenu = () => {
      drawerVisible.value = !drawerVisible.value
    }

    onMounted(() => {
      checkToken()
      window.addEventListener('resize', handleResize)

      const createChart = (id, type, data, options) => {
        const ctx = document.getElementById(id).getContext('2d')
        new Chart(ctx, {
          type: type,
          data: data,
          options: options
        })
      }

      const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Dataset 1',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
            hoverBorderColor: 'rgba(75, 192, 192, 1)',
            data: [65, 59, 80, 81, 56, 55, 40]
          }
        ]
      }

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }

      createChart('chart1', 'bar', data, options)
      createChart('chart2', 'line', data, options)
      createChart('chart3', 'pie', data, options)
      createChart('chart4', 'radar', data, options)
    })

    return {
      navigateToAssistantManagement,
      logout,
      isMobile,
      drawerVisible,
      toggleMenu
    }
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

.header {
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  .title {
    line-height: 2;
  }
}

.header-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons-mobile {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.desktop-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.main {
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
}

.chart-container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 300px;
}

.menu-button {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 2000;
}

.page-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

/* Media query for mobile devices */
@media (max-width: 768px) {
  .el-col {
    width: 100% !important;
  }

  .chart-container {
    margin-bottom: 20px;
  }
}
</style>
