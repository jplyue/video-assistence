<template>
  <el-container class="assistant-management">
    <Sidebar />
    <!-- 右侧内容区域 -->
    <el-container>
      <el-header class="header">
        <h2>助手管理</h2>
        <el-button type="primary" @click="createAssistant">新建助手</el-button>
      </el-header>
      <el-main>
        <div>
          <h2>助手列表</h2>
          <el-table :data="assistants" style="width: 100%">
            <el-table-column prop="id" label="助手 ID" width="150"></el-table-column>
            <el-table-column prop="title" label="助手标题" width="300"></el-table-column>
            <el-table-column label="操作" width="200">
              <template v-slot="scope">
                <el-button @click="handleEdit(scope.row)" type="primary" size="small"
                  >编辑</el-button
                >
                <!-- <el-button @click="removeAssistant(scope.row.id)" type="danger" size="small"
                  >删除</el-button
                > -->
              </template>
            </el-table-column>
          </el-table>
        </div>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { request } from '@/request'

const router = useRouter()
const assistants = ref([])

// 获取助手列表
const fetchAssistants = async () => {
  try {
    const response = await request(
      {
        url: '/program/list',
        method: 'POST',
        data: {
          page: 1,
          page_size: 10
        }
      },
      true
    )
    if (response.code === 200) {
      assistants.value = response.data.list
    } else {
      console.error('获取助手列表失败', response.message)
    }
  } catch (error) {
    console.error('获取助手列表失败', error)
  }
}

const handleEdit = (assistant) => {
  router.push({
    path: `/assistant/${assistant.id}`,
    query: {
      assistant_id: assistant.assistant_id,
      store_id: assistant.store_id
    }
  })
}

const removeAssistant = (id: number) => {
  assistants.value = assistants.value.filter((assistant) => assistant.id !== id)
}

const createAssistant = () => {
  router.push(`/create`)
}

onMounted(() => {
  fetchAssistants()
})
</script>

<style scoped>
.assistant-management .el-main {
}
</style>
