<template>
  <div class="form-wrapper">
    <div class="register-form">
      <h2 class="page-title">Register</h2>

      <el-form :model="form" :rules="rules" ref="form" label-width="100px" label-position="left">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            style="max-width: 600px"
            placeholder="请输入手机号"
            maxlength="11"
          >
            <template #append>
              <el-button @click="showVerificationDialog" size="small">获取验证码</el-button>
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

      <el-dialog
        title="请输入验证码"
        v-model:visible="dialogVisible"
        width="30%"
        @close="dialogClosed"
      >
        <el-form
          :model="verificationForm"
          :rules="verificationRules"
          ref="verificationForm"
          label-width="100px"
        >
          <el-form-item label="手机号">
            <el-input v-model="form.phone" disabled></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="verification">
            <el-input
              v-model="verificationForm.verification"
              placeholder="请输入验证码"
              maxlength="6"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitVerification" style="width: 100%"
              >确定</el-button
            >
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton, ElDialog } from 'element-plus'

export default {
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElDialog
  },
  setup() {
    const form = ref({
      name: '',
      phone: '',
      verification: ''
    })

    const verificationForm = ref({
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

    const verificationRules = {
      verification: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    }

    const dialogVisible = ref(false)

    // 显示验证码对话框
    const showVerificationDialog = () => {
      dialogVisible.value = true
    }

    // 提交验证码
    const submitVerification = () => {
      // 在这里可以处理提交验证码的逻辑
      console.log('提交验证码', verificationForm.value)

      // 关闭对话框
      dialogVisible.value = false
    }

    // 对话框关闭时重置表单
    const dialogClosed = () => {
      // 可以在这里重置对话框的表单数据
      verificationForm.value.verification = ''
    }

    // 提交表单
    const submitForm = () => {
      // 在这里可以进行表单提交逻辑
      console.log('提交表单', form.value)
    }

    return {
      form,
      rules,
      verificationForm,
      verificationRules,
      dialogVisible,
      showVerificationDialog,
      submitVerification,
      dialogClosed,
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

.register-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
