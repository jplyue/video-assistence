<template>
  <el-container class="assistant-detail">
    <!-- 左侧菜单栏 -->
    <AssistantSidebar />

    <!-- 右侧内容区域 -->
    <el-container>
      <el-header class="header">
        <h2>助手1</h2>
      </el-header>
      <el-main class="main">
        <el-row :gutter="20">
          <el-col :span="12">
            <h2 class="section-title">上传视频</h2>
            <el-form :model="videoForm" class="upload-form" label-width="100px">
              <el-form-item label="标题">
                <el-input v-model="videoForm.title" style="width: 50%"></el-input>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="videoForm.desc" style="width: 50%"></el-input>
              </el-form-item>
              <el-form-item label="上传视频">
                <el-upload
                  ref="upload"
                  class="upload"
                  action="/video/upload"
                  accept="video/mp4,video/quicktime"
                  :before-upload="beforeUploadVideo"
                  :on-success="handleUploadSuccess"
                  :limit="1"
                  :on-exceed="handleExceed"
                >
                  <template #trigger>
                    <el-button type="primary">选择文件</el-button>
                  </template>
                  <template #tip>
                    <div class="el-upload__tip">限制 1 个文件，新文件将覆盖旧文件</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="24">
            <h2 class="section-title">视频列表</h2>
            <el-table :data="videoList" style="width: 100%">
              <el-table-column prop="index" label="#" width="50"></el-table-column>
              <el-table-column prop="title" label="标题"></el-table-column>
              <el-table-column label="上传时间">
                <template #default="scope">{{ formatDate(scope.row.created_at) }}</template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" @click="viewVideo(scope.row)">观看</el-button>
                  <el-button type="primary" @click="settings(scope.row)">设置</el-button>
                </template>
              </el-table-column>
              <el-table-column label="删除">
                <template #default="scope">
                  <el-button type="primary" @click="deleteItem(scope.row, 'video')">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px">
          <el-col :span="12">
            <h2 class="section-title">知识库</h2>
            <el-form :model="knowledgeForm" class="upload-form" label-width="100px">
              <el-form-item label="标题">
                <el-input v-model="knowledgeForm.title" style="width: 50%"></el-input>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="knowledgeForm.desc" style="width: 50%"></el-input>
              </el-form-item>
              <el-form-item label="上传文件">
                <el-upload
                  ref="upload"
                  class="upload"
                  action="/file/create"
                  accept=".txt,.pdf"
                  :before-upload="beforeUploadKnowledge"
                  :on-success="handleUploadSuccess"
                  :limit="1"
                  :on-exceed="handleExceed"
                >
                  <template #trigger>
                    <el-button type="primary">选择文件</el-button>
                  </template>
                  <template #tip>
                    <div class="el-upload__tip">限制 1 个文件，新文件将覆盖旧文件</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="24">
            <h2 class="section-title">知识列表</h2>
            <el-table :data="knowledgeList" style="width: 100%">
              <el-table-column prop="index" label="#" width="50"></el-table-column>
              <el-table-column prop="title" label="标题"></el-table-column>
              <el-table-column label="上传时间">
                <template #default="scope">{{ formatDate(scope.row.created_at) }}</template>
              </el-table-column>
              <el-table-column label="删除">
                <template #default="scope">
                  <el-button type="primary" @click="deleteItem(scope.row, 'knowledge')"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AssistantSidebar from './AssistantSidebar.vue'
import { request } from '@/request'

const router = useRouter()
const route = useRoute()

const videoForm = ref({
  title: '',
  desc: ''
})

const knowledgeForm = ref({
  title: '',
  desc: ''
})

const videoList = ref([])
const knowledgeList = ref([])

const fetchDetails = async () => {
  const assistantId = route.query.assistant_id
  try {
    const response = await request(
      {
        url: '/program/detail',
        method: 'POST',
        data: { assistant_id: assistantId }
      },
      true
    )
    if (response.code === 200) {
      videoList.value =
        response.data.video_info.map((item, index) => ({ ...item, index: index + 1 })) || []
      knowledgeList.value = response.data.file_info
        ? [{ ...response.data.file_info, index: 1 }]
        : []
    } else {
      ElMessage.error('获取详情失败')
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error(error)
  }
}

const formatDate = (dateString) => {
  return dateString.replace('T', ' ')
}

const handleUploadSuccess = (response, file, fileList) => {
  ElMessage.success('上传成功')
  console.log('response:', response)
  console.log('file:', file)
  console.log('fileList:', fileList)
  fetchDetails()
}

const handlePreview = (file) => {
  console.log('preview:', file)
}

const handleRemove = (file, fileList) => {
  console.log('remove:', file, fileList)
}

const beforeUploadKnowledge = async (file) => {
  console.log('Before upload file:', file)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', knowledgeForm.value.title)
  formData.append('desc', knowledgeForm.value.desc)
  formData.append('assistant_id', route.query.assistant_id)
  formData.append('store_id', route.query.store_id)

  try {
    const response = await request(
      {
        url: '/file/create',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      },
      true
    )

    if (response.code === 200) {
      ElMessage.success('文件上传成功')
      handleUploadSuccess(response, file, [])
    } else {
      ElMessage.error('文件上传失败')
    }
  } catch (error) {
    ElMessage.error('文件上传失败')
    console.error(error)
  }

  return false
}

const beforeUploadVideo = async (file) => {
  console.log('Before upload file:', file)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', videoForm.value.title)
  formData.append('desc', videoForm.value.desc)
  formData.append('assistant_id', route.query.assistant_id)
  formData.append('store_id', route.query.store_id)
  formData.append('assistant_show', 1)
  formData.append('share_login', 1)
  formData.append('answer_choose', 1)

  try {
    const response = await request(
      {
        url: '/video/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      },
      true
    )

    if (response.code === 200) {
      handleUploadSuccess(response, file, [])
    } else {
      ElMessage.error('文件上传失败')
    }
  } catch (error) {
    ElMessage.error('文件上传失败')
    console.error(error)
  }

  return false
}

const deleteItem = async (row, type) => {
  if (type === 'video') {
    const requestData = {
      video_id: row.id
    }
    try {
      const response = await request(
        {
          url: '/video/delete',
          method: 'POST',
          data: requestData
        },
        true
      )

      if (response.code === 200) {
        ElMessage.success('视频删除成功')
        fetchDetails()
      } else {
        ElMessage.error('视频删除失败')
      }
    } catch (error) {
      ElMessage.error('视频删除失败')
      console.error(error)
    }
  } else {
    const requestData = {
      file_id: row.file_id,
      store_id: row.store_id,
      assistant_id: row.assistant_id
    }

    try {
      const response = await request(
        {
          url: '/file/delete',
          method: 'POST',
          data: requestData
        },
        true
      )

      if (response.code === 200) {
        ElMessage.success('文件删除成功')
        fetchDetails()
      } else {
        ElMessage.error('文件删除失败')
      }
    } catch (error) {
      ElMessage.error('文件删除失败')
      console.error(error)
    }
  }
}

const handleExceed = (files, fileList) => {
  ElMessage.warning('只能上传一个文件，新的文件将覆盖旧的文件')
}

const viewVideo = (row) => {
  console.log('Navigating to video preview:', row)
  router
    .push({
      path: '/video-preview',
      query: { video_id: row.id, assistant_id: row.assistant_id, url: row.video_data }
    })
    .catch((err) => console.error(err))
}

const viewKnowledge = (row) => {
  console.log('Navigating to knowledge preview:', row)
  router
    .push({
      path: '/knowledge-preview',
      query: { name: row.title, assistant_id: row.assistant_id, store_id: row.store_id }
    })
    .catch((err) => console.error(err))
}

const settings = (row) => {
  console.log('Navigating to video settings:', row)
  router
    .push({
      path: '/video-setting',
      query: { video_id: row.id, assistant_id: row.assistant_id, store_id: row.store_id }
    })
    .catch((err) => console.error(err))
}

const copyLink = (row) => {
  console.log('Copying link for item:', row)
  ElMessage.success(`复制链接：${row.title}`)
}

onMounted(() => {
  fetchDetails()
})
</script>

<style scoped>
.assistant-detail {
  display: flex;
  height: 100vh;
}

.header {
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.main {
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
}

.section-title {
  margin-bottom: 20px;
}

.upload-form {
  margin-bottom: 20px;
}

.el-upload__text {
  color: #606266;
}

.el-upload.drag {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  height: 180px;
  line-height: 180px;
  text-align: center;
}

.el-button + .el-button {
  margin-left: 10px;
}
</style>
