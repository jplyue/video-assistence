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
                <el-button @click="handleEdit(scope.row.id)" type="primary" size="small"
                  >编辑</el-button
                >
                <el-button @click="removeAssistant(scope.row.id)" type="danger" size="small"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'

export default {
  components: {
    Sidebar
  },
  setup() {
    const router = useRouter()
    const assistants = ref([
      { id: 1, title: '助手 1' },
      { id: 2, title: '助手 2' },
      { id: 3, title: '助手 3' }
      // 继续添加助手
    ])

    const handleEdit = (id) => {
      router.push(`/assistant/${id}`)
    }

    const removeAssistant = (id) => {
      assistants.value = assistants.value.filter((assistant) => assistant.id !== id)
    }

    const createAssistant = () => {
      router.push(`/create`)
    }

    return {
      assistants,
      handleEdit,
      removeAssistant,
      createAssistant
    }
  }
}
</script>

<style scoped>
.assistant-management .el-main {
}
</style>
