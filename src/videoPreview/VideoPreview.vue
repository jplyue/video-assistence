<template>
  <div id="video-preview" class="container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/dashboard">主页</el-breadcrumb-item>
      <el-breadcrumb-item to="/manage">助手管理</el-breadcrumb-item>
      <el-breadcrumb-item>视频设置</el-breadcrumb-item>
    </el-breadcrumb>

    <div>
      <el-button @click="handlePause" class="control-button">暂停</el-button>
      <el-button v-if="buttonShow" @click="handleAsk" class="control-button">提问</el-button>
    </div>
    <div :class="['interactive-position-wrapper', videoData.interactionPosition]">
      <div :class="['video-wrapper', videoData.interactionPosition]">
        <video ref="videoPlayer" class="video-js vjs-default-skin" controls></video>
      </div>
      <div class="interaction-area">
        <div class="video-ask">
          <QuestionComponent
            ref="questionComponent"
            :interaction-visible="interactionVisible"
            :question="currentQuestion"
            :dialog-visible="dialogVisible"
            :videoId="videoId"
          />
        </div>
        <ChatComponent
          v-if="videoId !== null && threadId"
          :videoId="videoId"
          :assistantId="assistantId"
          :threadId="threadId"
          :askButtonClicked="askButtonClicked"
          :formattedTime="formattedTime || '00:00'"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import 'video.js/dist/video-js.css'
import videojs from 'video.js'
import QuestionComponent from './QuestionComponent.vue'
import ChatComponent from './ChatComponent.vue'
import { useRoute } from 'vue-router'
import { request } from '@/request'

const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60)
    .toString()
    .padStart(2, '0')
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${seconds}`
}

const questionTypeMapping = {
  1: 'audio',
  2: 'text'
}

const answerTypeMapping = {
  1: 'audio',
  2: 'text',
  3: 'phototalk'
}

export default {
  components: {
    QuestionComponent,
    ChatComponent
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
    const assistantId = ref(null)
    const threadId = ref(null)
    const askButtonClicked = ref(false)
    const videoTime = ref(0)
    const buttonShow = ref(false)

    const formattedTime = computed(() => formatTime(videoTime.value))

    const videoData = reactive({
      interactionPosition: 'right',
      questions: []
    })

    const checkTime = () => {
      const currentVideoTime = player.value.currentTime()
      videoTime.value = currentVideoTime
      const currentQuestion = videoData.questions[currentQuestionIndex.value]

      if (currentQuestion) {
        const questionTime = convertToSeconds(currentQuestion.time)

        if (Math.abs(currentVideoTime - questionTime) < 0.3) {
          player.value.pause()
          showQuestion(currentQuestion)
          currentQuestionIndex.value++ // 更新当前问题索引，防止重复显示
        }
      }
    }

    const convertToSeconds = (time) => {
      const [minutes, seconds] = time.split(':').map(Number)
      return minutes * 60 + seconds
    }

    const showQuestion = (question) => {
      console.log('question', question)
      currentQuestion.value = question
      interactionVisible.value = true
      videoData.interactionPosition === 'overlay' && (dialogVisible.value = true)
    }

    const setInteractionPosition = (position) => {
      videoData.interactionPosition = position
    }

    const closeDialog = () => {
      dialogVisible.value = false
      interactionVisible.value = false
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
          console.log('Video play over reported successfully')
        } catch (error) {
          console.error('Failed to report video play over:', error)
        }
      }
    }

    const handleBeforeUnload = (event) => {
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

    onMounted(async () => {
      videoId.value = route.query.video_id
      assistantId.value = route.query.assistant_id
      currentQuestionIndex.value = 0 // 初始化当前问题索引

      try {
        const videoResponse = await request(
          {
            url: '/video/detail',
            method: 'POST',
            data: {
              video_id: videoId.value,
              visitor: '1'
            }
          },
          true
        )
        console.log('videoResponse:', videoResponse)

        if (videoResponse.code === 200) {
          const videoDetails = videoResponse.data
          // videoData.interactionPosition = videoDetails.assistant_show === 1 ? 'right' : 'overlay'
          videoData.interactionPosition = 'right'
          videoData.questions = videoDetails.questions.map((q, index) => ({
            index: index + 1,
            question: q.question,
            answer: q.answer,
            time: q.time,
            questionType: q.question_type.map((type) => questionTypeMapping[type])[0],
            answerType: q.answer_type.map((type) => answerTypeMapping[type])[0],
            action: q.action
          }))
          buttonShow.value = videoDetails.button_show === 1

          const videoUrl = videoDetails.video_data

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

          player.value.on('ended', () => {
            reportPlayOver()
          })

          const threadResponse = await request(
            {
              url: '/video/thread',
              method: 'POST',
              data: {
                video_id: videoId.value,
                assistant_id: assistantId.value
              }
            },
            true
          )

          if (threadResponse.code === 200) {
            threadId.value = threadResponse.data.thread_id
          } else {
            console.error('Failed to start video thread:', threadResponse.message)
          }
        } else {
          console.error('Failed to fetch video details:', videoResponse.message)
        }
      } catch (error) {
        console.error('Error fetching video details:', error)
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
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
      handlePause,
      handleAsk,
      askButtonClicked,
      videoId,
      assistantId,
      threadId,
      formattedTime,
      buttonShow
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
}

.interactive-position-wrapper {
  display: flex;

  &.top {
    flex-direction: column-reverse;
  }

  &.right {
    flex-direction: row;
    height: 80vh;
    gap: 20px;

    .video-wrapper {
      width: 100%;
    }
    .interaction-area {
      width: 30vw;
      height: 100%;

      flex-direction: column;
      flex-grow: 0;
      margin-top: 0;
      overflow: auto;
    }
  }
  &.bottom {
    flex-direction: column;
  }
  &.overlay {
    display: block;
  }
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
