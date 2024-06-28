<template>
  <div id="video-preview" class="container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/dashboard">主页</el-breadcrumb-item>
      <el-breadcrumb-item to="/manage">助手管理</el-breadcrumb-item>
      <el-breadcrumb-item>视频设置</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="button-group">
      <el-button type="primary" @click="setInteractionPosition('top')">顶部</el-button>
      <el-button type="primary" @click="setInteractionPosition('right')">右边</el-button>
      <el-button type="primary" @click="setInteractionPosition('bottom')">底部</el-button>
      <el-button type="primary" @click="setInteractionPosition('overlay')">浮层</el-button>
    </div>
    <div>
      <el-button @click="handlePause" class="control-button">暂停</el-button>
      <el-button @click="handleAsk" class="control-button">提问</el-button>
    </div>
    <div :class="['interactive-position-wrapper', videoData.interactionPosition]">
      <div :class="['video-wrapper', videoData.interactionPosition]">
        <video ref="videoPlayer" class="video-js vjs-default-skin" controls></video>
      </div>
      <div class="interaction-area">
        <div class="question-area">
          <QuestionComponent
            ref="questionComponent"
            :interaction-visible="interactionVisible"
            :question="currentQuestion"
          />
        </div>
        <div class="chat-history">
          <el-card v-for="(question, index) in videoData.questions" :key="index" class="chat-card">
            <p><strong>问题：</strong>{{ question.question }}</p>
            <p><strong>回答：</strong>{{ question.answer }}</p>
          </el-card>
        </div>
      </div>
    </div>

    <div v-if="askButtonClicked" class="chat-input">
      <el-input v-model="userQuestion" placeholder="请输入问题..." class="input-box"></el-input>
      <el-button type="primary" @click="sendQuestion">发送</el-button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import 'video.js/dist/video-js.css'
import videojs from 'video.js'
import QuestionComponent from './QuestionComponent.vue'
import { useRoute } from 'vue-router'
import { request } from '@/request' // 确保request函数已经定义并导入

export default {
  components: {
    QuestionComponent
  },
  setup() {
    const route = useRoute()
    const player = ref(null)
    const currentQuestion = ref({})
    const currentQuestionIndex = ref(0)
    const dialogVisible = ref(false)
    const interactionVisible = ref(false)
    const questionComponent = ref(null)
    const videoId = ref(null)
    const questionForm = reactive({
      question: ''
    })
    const askButtonClicked = ref(false)
    const userQuestion = ref('') // 新增的用户问题绑定变量

    const videoData = reactive({
      interactionPosition: 'right',
      questions: [
        {
          index: '1',
          question: '这是第1-1个问题',
          answer: '1-1的回答。',
          time: '00:02',
          questionType: 'text',
          answerType: 'text',
          action: 'pause'
        },
        {
          index: '2',
          question: '这是第1-2个问题',
          answer: '1-2的回答。',
          time: '00:04',
          questionType: 'text',
          answerType: 'audio',
          action: 'button'
        },
        {
          index: '3',
          question: '这是第1-3个问题',
          answer: '1-3的回答。',
          time: '00:06',
          questionType: 'text',
          answerType: 'phototalk',
          action: 'pause'
        }
      ]
    })

    const checkTime = () => {
      const currentVideoTime = player.value.currentTime()
      if (currentQuestionIndex.value < videoData.questions.length) {
        const question = videoData.questions[currentQuestionIndex.value]
        const questionTime = convertToSeconds(question.time)

        if (Math.abs(currentVideoTime - questionTime) < 0.5) {
          player.value.pause()
          videoData.interactionPosition === 'overlay' && (dialogVisible.value = true)

          // 重置子组件
          if (questionComponent.value) {
            questionComponent.value.resetState()
          }

          hideQuestion()
          showQuestion(question)

          currentQuestionIndex.value++ // Move to the next question
        }
      }
    }

    const convertToSeconds = (time) => {
      const [minutes, seconds] = time.split(':').map(Number)
      return minutes * 60 + seconds
    }

    const showQuestion = (question) => {
      currentQuestion.value = question
      interactionVisible.value = true
    }

    const hideQuestion = () => {
      interactionVisible.value = false
    }

    const setInteractionPosition = (position) => {
      videoData.interactionPosition = position
    }

    const closeDialog = () => {
      dialogVisible.value = false
    }

    const reportPlayOver = async () => {
      if (videoId.value) {
        try {
          await request(
            {
              url: '/video/play/over',
              method: 'POST',
              data: {
                video_id: videoId.value,
                play_over: 1
              }
            },
            true
          )
        } catch (error) {
          console.error('Failed to report video play over:', error)
        }
      }
    }

    const handleBeforeUnload = (event) => {
      reportPlayOver()
      event.preventDefault()
      event.returnValue = ''
    }

    const handlePause = () => {
      if (player.value) {
        player.value.pause()
      }
    }

    const handleAsk = () => {
      if (player.value) {
        player.value.pause()
      }
      askButtonClicked.value = true
    }

    const sendQuestion = async () => {
      try {
        await request(
          {
            url: '/video/log/create',
            method: 'POST',
            data: {
              video_id: videoId.value,
              question: userQuestion.value,
              question_type: 1,
              answer: '好的，下面是xxxxx',
              answer_choose: 1,
              time: '00:05'
            }
          },
          true
        )
        userQuestion.value = ''
      } catch (error) {
        console.error('Failed to send question:', error)
      }
    }

    onMounted(async () => {
      const videoUrl = route.query.url
      videoId.value = route.query.video_id
      const assistantId = route.query.assistant_id

      try {
        const threadResponse = await request(
          {
            url: '/video/thread',
            method: 'POST',
            data: {
              video_id: videoId.value,
              assistant_id: assistantId
            }
          },
          true
        )

        if (threadResponse.code === 200) {
          const threadId = threadResponse.data.thread_id

          const chatResponse = await request(
            {
              url: '/chat/list',
              method: 'POST',
              data: {
                thread_id: threadId
              }
            },
            true
          )

          if (chatResponse.code === 200) {
            videoData.questions = chatResponse.data.questions || []
          } else {
            console.error('Failed to fetch chat list:', chatResponse.message)
          }
        } else {
          console.error('Failed to start video thread:', threadResponse.message)
        }
      } catch (error) {
        console.error('Error fetching thread or chat list:', error)
      }

      player.value = videojs(document.querySelector('.video-js'), {
        sources: [
          {
            src: videoUrl,
            type: 'video/mp4'
          }
        ]
      })

      player.value.on('timeupdate', () => {
        checkTime()
      })

      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      reportPlayOver()
    })

    return {
      player,
      dialogVisible,
      currentQuestion,
      videoData,
      interactionVisible,
      setInteractionPosition,
      questionComponent,
      closeDialog,
      currentQuestionIndex,
      handlePause,
      handleAsk,
      sendQuestion,
      userQuestion,
      questionForm,
      askButtonClicked
    }
  }
}
</script>

<style lang="scss">
@import 'video.js/dist/video-js.css';
@import 'element-plus/dist/index.css';

.container {
  max-width: 90vw;
  margin: 50px auto;
  padding: 20px;
  border-radius: 10px;
}

.button-group {
  display: flex;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 20px;
}

.video-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .video-js {
    width: 100%;
    height: 80vh;
    border-radius: 10px;
    overflow: hidden;
  }
}

.interaction-area {
  position: relative;
  padding: 20px;
  background-color: #f9f9f9;
  color: #222;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-area {
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-history {
  overflow-y: auto;
  max-height: 40vh;
}

.chat-card {
  margin-bottom: 10px;
}

.control-button {
  margin-bottom: 10px;
}

.question {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 5px;
  background-color: #fff;
}

.question p,
.dialog-question,
.dialog-answer {
  color: #000;
}

.question p {
  margin: 0 0 10px;
}

.el-dialog__body {
  max-height: 80vh;
  overflow: auto;
}

.dialog-footer {
  margin-top: 10px;
}

.chat-input {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.input-box {
  flex: 1;
}
</style>
