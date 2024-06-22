<template>
  <div class="form-wrapper">
    <div class="login-form">
      <h2 class="page-title">Login</h2>

      <el-form :model="form" :rules="rules" ref="form" label-width="100px" label-position="left">
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

<script>
import { ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

export default {
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton
  },
  setup() {
    const form = ref({
      phone: '',
      verification: ''
    })

    const rules = {
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
      ],
      verification: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    }

    const countdown = ref(0)
    let timer = null

    // 发送验证码
    const sendVerificationCode = () => {
      if (countdown.value > 0) return

      // 模拟发送验证码
      console.log('发送验证码')

      countdown.value = 60 // 设置倒计时时间，例如 60 秒
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          timer = null
        }
      }, 1000)
    }

    // 提交表单
    const submitForm = () => {
      // 在这里可以进行表单提交逻辑
      console.log('登录表单提交', form.value)
    }

    return {
      form,
      rules,
      countdown,
      sendVerificationCode,
      submitForm
    }
  }
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
