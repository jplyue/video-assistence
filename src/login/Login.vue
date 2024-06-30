<template>
  <div class="form-wrapper">
    <div class="login-form">
      <h2 class="page-title">Login</h2>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" label-position="left">
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            style="max-width: 600px"
            placeholder="请输入手机号"
            maxlength="11"
          >
            <template #append>
              <el-button @click="sendVerificationCode" :disabled="countdown > 0" size="small">
                {{ countdown > 0 ? `${countdown}秒后重新发送` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="verification">
          <el-input v-model="form.verification" placeholder="请输入验证码" maxlength="6"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { request, saveTokenInCookie, saveUserInfo } from '@/request'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  phone: '18511759286',
  verification: '520476'
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  verification: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const formRef = ref(null)
const countdown = ref(0)
let timer = null

// 发送验证码
const sendVerificationCode = async () => {
  if (countdown.value > 0) return

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
    countdown.value = 60 // 设置倒计时时间，例如 60 秒
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败', error)
  }
}

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      console.log('登录表单提交', form)

      try {
        const response = await request({
          url: '/user/login',
          method: 'POST',
          data: { phone: form.phone, code: form.verification }
        })
        if (response.code === 200) {
          ElMessage.success('登录成功！')
          //save token
          const { token } = response.data
          saveTokenInCookie(token)

          //save user data
          saveUserInfo(response.data)

          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          ElMessage.error(response.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败', error)
        ElMessage.error('登录失败，请重试')
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

.login-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
