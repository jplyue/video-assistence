<template>
  <div class="form-wrapper">
    <div class="register-form">
      <h2 class="page-title">Register</h2>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" label-position="left">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" value="nini"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            style="max-width: 600px"
            placeholder="请输入手机号"
            maxlength="11"
            value="18511759286"
          >
            <template #append>
              <el-button @click="getVerificationCode" size="small" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="verification">
          <el-input v-model="form.verification" placeholder="请输入验证码" maxlength="6"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" style="width: 100%">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { request } from '@/request'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  name: '',
  phone: '',
  verification: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  verification: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const formRef = ref(null)

// 倒计时相关状态
const countdown = ref(0)
const timer = ref(null)

// 获取验证码
const getVerificationCode = async () => {
  if (countdown.value > 0) {
    return
  }

  if (!form.phone) {
    ElMessage.error('请输入手机号')
    return
  }

  try {
    const response = await request({
      url: '/register/code',
      method: 'POST',
      data: { phone: form.phone }
    })
    console.log('验证码已发送', response)

    // 开始倒计时
    countdown.value = 60
    timer.value = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        clearInterval(timer.value)
      }
    }, 1000)
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

// 提交表单
const submitForm = () => {
  console.log('提交表单', form)

  formRef.value.validate(async (valid) => {
    if (valid) {
      console.log('Form submitted successfully!')

      try {
        const response = await request({
          url: '/user/register',
          method: 'POST',
          data: { username: form.name, phone: form.phone, code: form.verification }
        })
        if (response.code === 200) {
          ElMessage.success('注册成功！')
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          ElMessage.error(response.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败', error)
        ElMessage.error('注册失败，请重试')
      }
    } else {
      console.log('Form validation failed!')
      return false
    }
  })
}
</script>

<style scoped>
.form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.register-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
