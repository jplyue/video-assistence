<template>
  <el-container class="dashboard">
    <!-- 左侧菜单栏 -->
    <Sidebar />

    <!-- 右侧内容区域 -->
    <el-container>
      <el-header class="header">
        <h2 class="title">Dashboard</h2>
        <el-button type="primary" @click="navigateToAssistantManagement">管理助手</el-button>
      </el-header>
      <el-main class="main">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <canvas id="chart1"></canvas>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <canvas id="chart2"></canvas>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <div class="chart-container">
              <canvas id="chart3"></canvas>
            </div>
          </el-col>
          <el-col :span="12">
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
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElContainer, ElHeader, ElMain, ElRow, ElCol, ElButton } from 'element-plus'
import Sidebar from '@/components/Sidebar.vue'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'Dashboard',
  components: {
    Sidebar,
    ElContainer,
    ElHeader,
    ElMain,
    ElRow,
    ElCol,
    ElButton
  },
  setup() {
    const router = useRouter()

    const navigateToAssistantManagement = () => {
      router.push('/manage')
    }

    onMounted(() => {
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
      navigateToAssistantManagement
    }
  }
})
</script>

<style scoped>
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
  justify-content: space-between;
  align-items: center;
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
</style>
