<template>
  <el-container class="assistant-management">
    <Sidebar />
    <!-- 右侧内容区域 -->
    <el-container>
      <el-header class="header">
        <h2>创建助手</h2>
      </el-header>
      <el-main>
        <el-form :model="form" ref="formRef" label-width="80px" class="create-assistant-form">
          <el-form-item
            label="名称"
            prop="name"
            :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]"
          >
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="form.remark"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
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
    const formRef = ref(null)
    const form = ref({
      name: '',
      remark: ''
    })

    const handleSubmit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          // 提交表单数据，进行相应的操作，如保存数据
          console.log('提交的数据: ', form.value)
          // 保存完成后跳转到其他页面，如助手列表页面
          router.push('/')
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    }

    const handleReset = () => {
      form.value.name = ''
      form.value.remark = ''
    }

    return {
      form,
      formRef,
      handleSubmit,
      handleReset
    }
  }
}
</script>

<style scoped>
.create-assistant-form {
  max-width: 50vw;
  margin-top: 50px;
}
</style>
