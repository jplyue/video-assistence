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
        <el-menu-item
          v-for="assistant in assistants"
          :key="assistant.id"
          :index="`assistant-${assistant.id}`"
          @click="
            navigateTo(`/assistant/${assistant.id}`, assistant.assistant_id, assistant.store_id)
          "
        >
          {{ assistant.title }}
        </el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </el-aside>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '@/request'

export default {
  setup() {
    const router = useRouter()
    const activeIndex = ref('1')
    const assistants = ref([])

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

    const navigateTo = (path, assistantId, storeId) => {
      router.push({ path, query: { assistant_id: assistantId, store_id: storeId } })
    }

    onMounted(() => {
      fetchAssistants()
    })

    return {
      activeIndex,
      assistants,
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
