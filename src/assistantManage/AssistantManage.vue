<template>
  <el-container class="assistant-management">
    <!-- 左侧菜单栏 -->
    <Sidebar />

    <!-- 右侧内容区域 -->
    <el-container>
      <el-header class="header">
        <h2>助手管理</h2>
      </el-header>
      <el-main class="main">
        <el-row :gutter="20">
          <el-col :span="12">
            <h2 class="section-title">上传视频</h2>
            <el-form :model="videoForm" class="upload-form" label-width="100px">
              <el-form-item label="标题">
                <el-input v-model="videoForm.title" style="width: 50%"></el-input>
              </el-form-item>
              <el-form-item label="上传视频">
                <el-upload
                  ref="upload"
                  class="upload-demo"
                  action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                  :limit="1"
                  :on-exceed="handleExceed"
                  :auto-upload="false"
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
              <el-table-column prop="name" label="助手名称"></el-table-column>
              <el-table-column prop="remarks" label="备注"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" @click="viewVideo(scope.row)">观看</el-button>
                  <el-button type="primary" @click="settings(scope.row)">设置</el-button>
                </template>
              </el-table-column>
              <el-table-column label="删除">
                <template #default="scope">
                  <el-button type="primary" @click="deleteItem(scope.row)">删除</el-button>
                  <el-button type="primary" @click="copyLink(scope.row)">复制链接</el-button>
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
              <el-form-item label="上传文件">
                <el-upload
                  ref="upload"
                  class="upload-demo"
                  action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                  :limit="1"
                  :on-exceed="handleExceed"
                  :auto-upload="false"
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
              <el-table-column prop="name" label="助手名称"></el-table-column>
              <el-table-column prop="remarks" label="备注"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
              <el-table-column label="删除">
                <template #default="scope">
                  <el-button type="primary" @click="deleteItem(scope.row)">删除</el-button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()

const videoForm = ref({
  title: ''
})

const knowledgeForm = ref({
  title: ''
})

const videoList = ref([
  { index: 1, name: '助手1', remarks: '备注1', uploadTime: '2024-06-22' },
  { index: 2, name: '助手2', remarks: '备注2', uploadTime: '2024-06-21' }
])

const knowledgeList = ref([
  { index: 1, name: '知识1', remarks: '备注1', uploadTime: '2024-06-22' },
  { index: 2, name: '知识2', remarks: '备注2', uploadTime: '2024-06-21' }
])

const handleSuccess = (response, file, fileList) => {
  ElMessage.success('上传成功')
  console.log('response:', response)
  console.log('file:', file)
  console.log('fileList:', fileList)
}

const handlePreview = (file) => {
  console.log('preview:', file)
}

const handleRemove = (file, fileList) => {
  console.log('remove:', file, fileList)
}

const beforeUpload = (file) => {
  console.log('beforeUpload:', file)
  return true
}

const handleExceed = (files, fileList) => {
  ElMessage.warning('只能上传一个文件，新的文件将覆盖旧的文件')
}

const viewVideo = (row) => {
  console.log('Navigating to video preview:', row)
  router
    .push({ path: '/video-preview', query: { name: row.name } })
    .catch((err) => console.error(err))
}

const viewKnowledge = (row) => {
  console.log('Navigating to knowledge preview:', row)
  router
    .push({ path: '/knowledge-preview', query: { name: row.name } })
    .catch((err) => console.error(err))
}

const settings = (row) => {
  console.log('Navigating to video settings:', row)
  router
    .push({ path: '/video-setting', query: { name: row.name } })
    .catch((err) => console.error(err))
}

const deleteItem = (row) => {
  console.log('Deleting item:', row)
  ElMessage.warning(`删除助手：${row.name}`)
}

const copyLink = (row) => {
  console.log('Copying link for item:', row)
  ElMessage.success(`复制链接：${row.name}`)
}
</script>

<style scoped>
.assistant-management {
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
