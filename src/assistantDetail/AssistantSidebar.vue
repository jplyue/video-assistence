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
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { request } from '@/request'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
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
          setActiveIndex()
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

    const setActiveIndex = () => {
      const assistantId = route.params.id
      const assistant = assistants.value.find((item) => item.id === parseInt(assistantId))
      if (assistant) {
        activeIndex.value = `assistant-${assistant.id}`
      } else {
        activeIndex.value = '1'
      }
    }

    watch(
      () => route.params.id,
      () => {
        setActiveIndex()
      }
    )

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
