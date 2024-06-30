<template>
  <div class="chat-container">
    <div class="user-chat-area">
      <div v-for="(chat, index) in chatHistory" :key="index" class="chat-message">
        <div class="chat-user" v-if="chat.sender === 'user'">
          <p><strong>我：</strong> {{ chat.message }}</p>
        </div>
        <div class="chat-server" v-else>
          <p><strong>助手：</strong> {{ chat.message }}</p>
        </div>
      </div>
    </div>

    <div class="chat-input" v-if="askButtonClicked">
      <el-input
        v-model="userQuestion"
        placeholder="请输入问题..."
        class="input-box"
        @keyup.enter="sendQuestion"
      ></el-input>
      <el-button type="primary" @click="sendQuestion">发送</el-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/request'
import { request } from '@/request'
import { ElMessage } from 'element-plus'

export default {
  props: {
    videoId: {
      type: String,
      required: true
    },
    assistantId: {
      type: String,
      required: true
    },
    threadId: {
      type: String,
      required: true
    },
    askButtonClicked: {
      type: Boolean,
      required: true
    },
    formattedTime: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const chatHistory = ref([])
    const userQuestion = ref('')
    const websocket = ref(null)
    const userInfo = getUserInfo()

    const sendQuestion = async () => {
      const questionText = userQuestion.value
      chatHistory.value.push({ sender: 'user', message: questionText })

      if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
        websocket.value.send(JSON.stringify({ question: questionText }))
      }

      // 保存问题内容用于上报
      const questionToReport = questionText
      userQuestion.value = ''

      websocket.value.onmessage = async (event) => {
        console.log('receive chat msg:', event.data)
        chatHistory.value.push({ sender: 'server', message: event.data })
        // 调用 /video/log/create 接口上报
        try {
          const response = await request(
            {
              url: '/video/log/create',
              method: 'POST',
              data: {
                video_id: props.videoId,
                question: questionToReport,
                question_type: 1, // 假设这是用户提问类型
                answer: event.data, // 初始回答内容，等待实际的回答
                answer_choose: 1, // 假设选择了一个默认值
                time: props.formattedTime
              }
            },
            true
          )

          if (response.code === 200) {
            console.log('Question logged successfully', response)
          } else {
            console.error('Error logging question:', response.message)
            ElMessage({
              message: '问题记录失败: ' + response.message,
              type: 'error'
            })
          }
        } catch (error) {
          console.error('Error logging question:', error)
          ElMessage({
            message: '问题记录失败，请重试',
            type: 'error'
          })
        }
      }
    }

    const initializeWebSocket = (url) => {
      websocket.value = new WebSocket(url)
      websocket.value.onopen = () => {
        console.log('Chat WebSocket connection opened')
      }
      websocket.value.onerror = (error) => {
        console.error('Chat WebSocket error:', error)
        ElMessage({
          message: 'WebSocket连接错误，请检查网络连接',
          type: 'error'
        })
      }
      websocket.value.onclose = () => {
        console.log('Chat WebSocket connection closed')
      }
    }

    onMounted(() => {
      if (props.threadId && userInfo && userInfo.user_id) {
        const websocketUrl = `http://43.135.162.53:9991/ws/chat/${props.videoId}/${userInfo.user_id}/${props.assistantId}/${props.threadId}`
        console.log('trying to connect chat websocket:', websocketUrl)
        initializeWebSocket(websocketUrl)
      } else {
        console.error('chat websocket failed', props.threadId, userInfo, userInfo.user_id)
        ElMessage({
          message: 'WebSocket连接失败，请重试',
          type: 'error'
        })
      }
    })

    return {
      chatHistory,
      userQuestion,
      sendQuestion
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-chat-area {
  flex: 1;
  margin-top: 20px;
  max-height: 100%;
  overflow-y: auto;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ebeef5;
}

.chat-message {
  margin-bottom: 10px;
}

.chat-user,
.chat-server {
  padding: 10px;
  border-radius: 5px;
}

.chat-user {
  background-color: #d9f7be;
}

.chat-server {
  background-color: #e6f7ff;
}

.chat-input {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.input-box {
  flex: 1;
}
</style>
