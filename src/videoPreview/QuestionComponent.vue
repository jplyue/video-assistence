<template>
  <div>
    <el-button v-if="askButtonVisible" @click="handleAskButtonClick" class="ask-button">
      提问
    </el-button>
    <WebSocketComponent
      ref="wsComponent"
      @audioPartReady="handleAudioPartReady"
      @audioComplete="handleAudioComplete"
    />
    <!-- 浮层样式 -->
    <div>
      <el-dialog v-model="dialogVisibleLocal" width="500" :show-close="false">
        <template #header="{ closeDialog, titleId, titleClass }">
          <div class="my-header">
            <h4 :id="titleId" :class="titleClass">
              {{ curState === 'question' ? '回答问题' : '正确答案' }}
            </h4>
            <el-button type="default" @click="closeDialog"> 关闭 </el-button>
          </div>
        </template>
        <div>
          <div v-if="curState === 'question'">
            <!-- 文本提问 -->
            <div v-if="question.questionType === 'text'">
              <div class="margin10">
                <p class="dialog-question">{{ question.question }}</p>
              </div>
              <el-input v-model="userAnswer" :rows="3" type="textarea" placeholder="请输入答案" />
            </div>

            <!-- 语音提问 -->
            <div v-else-if="question.questionType === 'audio'">
              <div class="recording-wrapper">
                <div><p>请录制您的回答:</p></div>
                <div>
                  <el-button @click="startRecording">开始录音</el-button>
                  <el-button @click="stopRecording" :disabled="!isRecording">停止录音</el-button>
                </div>
                <div>
                  <audio v-if="answerUrl" :src="answerUrl" controls></audio>
                </div>
              </div>
            </div>

            <!-- photo talk -->
          </div>
          <div v-if="curState === 'score'">
            <!-- score -->
            <div class="margin10">
              <p>您的分数78分</p>
            </div>
          </div>
          <div v-if="curState === 'answer'">
            <!-- 文本回答 -->
            <div v-if="question.questionType === 'text'">
              <div class="margin10">
                <p class="dialog-answer">{{ displayedText }}</p>
              </div>
            </div>

            <!-- 语音回答 -->
            <div v-else-if="question.questionType === 'audio'">
              <audio ref="audioPlayer" controls></audio>
            </div>

            <!-- photo talk -->
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button v-if="curState === 'question'" @click="handleSubmit" type="primary"
              >提交</el-button
            >
            <el-button v-if="curState === 'score'" @click="handleSubmit" type="primary"
              >查看正确答案</el-button
            >
            <el-button @click="closeDialog">关闭</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="interactionVisible && !dialogVisibleLocal">
      <!--其他样式 -->
      <div class="conversation">
        <div class="conversation-content">
          <div v-if="curState === 'question'">
            <!-- 文本提问 -->
            <div v-if="question.questionType === 'text'">
              <div class="question-text margin10">
                <p class="dialog-question">{{ question.question }}</p>
              </div>
              <el-input v-model="userAnswer" :rows="3" type="textarea" placeholder="请输入答案" />
            </div>

            <!-- 语音提问 -->
            <div v-else-if="question.questionType === 'audio'">
              <div class="recording-wrapper">
                <div><p>请录制您的问题:</p></div>
                <div>
                  <el-button @click="startRecording">开始录音</el-button>
                  <el-button @click="stopRecording" :disabled="!isRecording">停止录音</el-button>
                </div>
                <div>
                  <audio v-if="answerUrl" :src="answerUrl" controls></audio>
                </div>
              </div>
            </div>
          </div>

          <!-- score -->
          <div v-if="curState === 'score'">
            <div class="margin10">
              <p>您的分数78分</p>
            </div>
          </div>

          <!-- 回答 -->
          <div v-if="curState === 'answer'">
            <!-- 文本回答 -->
            <div v-if="question.answerType === 'text'">
              <div class="question-text margin10">
                <p class="dialog-answer">{{ displayedText }}</p>
              </div>
            </div>

            <!-- 语音回答 -->
            <div v-else-if="question.answerType === 'audio'">
              <div>
                <audio ref="audioPlayer" controls></audio>
              </div>
            </div>

            <!-- Phototalk回答 -->
            <div v-if="question.answerType === 'phototalk'">
              <div class="phototalk-wrapper margin10">
                <video
                  autoplay
                  src="https://storage.googleapis.com/yepic-generated-videos/4d001c40-9c71-4b2a-87c6-21a393b2d22f/downloads/avatar/dffaf892-1d78-f228-6c07-c148239fb54f/4d001c40-9c71-4b2a-87c6-21a393b2d22f.mp4"
                ></video>
              </div>
            </div>
          </div>
        </div>
        <div class="conversation-footer margin10">
          <!-- <el-button v-if="!isSubmitAnswer" @click="handleSubmit">提交</el-button>
          <el-button v-if="!answerVisible" @click="submitAnswer(question)">查看正确答案</el-button>
          <el-button v-else @click="closeConversation">关闭</el-button> -->
          <el-button v-if="curState === 'question'" @click="handleSubmit" type="primary"
            >提交</el-button
          >
          <el-button v-if="curState === 'score'" @click="handleSubmit" type="primary"
            >查看正确答案</el-button
          >
          <el-button v-if="curState !== 'close'" @click="closeConversation">关闭</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'

import WebSocketComponent from './WebSocketComponent.vue'

const stateOrder = ['question', 'score', 'answer', 'close']

export default {
  components: {
    WebSocketComponent
  },
  props: {
    interactionVisible: Boolean,
    question: Object,
    askButtonVisible: Boolean,
    dialogVisible: Boolean
  },
  setup(props, { emit }) {
    const userAnswer = ref('')
    const displayedText = ref('')
    const isRecording = ref(false)
    const answerUrl = ref('')
    const audioBlob = ref(null)
    const mediaRecorder = ref(null)
    const interruptFlag = ref(false)
    const dialogVisibleLocal = ref(props.dialogVisible)

    const isSubmitAnswer = ref(false) //是否已经提交答案
    const answerVisible = ref(false)
    const askButtonMode = ref(false)
    const wsComponent = ref(null)
    const audioPlayer = ref(null)
    const mediaSource = ref(null)
    const sourceBuffer = ref(null)
    const audioParts = ref([])
    let isUpdateEndListenerAdded = false

    const scoreVisible = ref(false)
    const curState = ref('close') //

    watch([() => props.question, () => props.dialogVisible], ([newQuestion, newDialogVisible]) => {
      // if (newQuestion && newQuestion.answerType === 'audio') {
      //   wsComponent.value.resetWebSocket()
      // }
      if (newQuestion) {
        console.log('here is new question, reset state to', stateOrder[0])
        curState.value = stateOrder[0]
      }
      if (newDialogVisible) {
        dialogVisibleLocal.value = newDialogVisible
        if (newDialogVisible) {
          console.log('reset to ', stateOrder[0])
          curState.value = stateOrder[0]
        }
      }
    })

    const resetState = () => {
      userAnswer.value = ''
      displayedText.value = ''
      isRecording.value = false
      answerUrl.value = ''
      answerVisible.value = false
      askButtonMode.value = false
    }

    const resetAudioState = () => {
      // 重置音频流
      if (sourceBuffer.value) {
        try {
          sourceBuffer.value.abort()
        } catch (error) {
          console.error('Error aborting source buffer:', error)
        }
        mediaSource.value = null
        sourceBuffer.value = null
        audioParts.value = []
      }
    }

    const initMediaSource = () => {
      if (audioPlayer.value && !mediaSource.value) {
        console.log('Initializing MediaSource')
        mediaSource.value = new MediaSource()
        console.log('mediaSource.value', mediaSource.value)
        audioPlayer.value.src = URL.createObjectURL(mediaSource.value)
        mediaSource.value.addEventListener('sourceopen', () => {
          if (!sourceBuffer.value) {
            console.log('Adding SourceBuffer')
            sourceBuffer.value = mediaSource.value.addSourceBuffer('audio/mpeg')
            sourceBuffer.value.mode = 'sequence'
            sourceBuffer.value.addEventListener('updateend', () => {
              console.log('updateend event')
              if (audioParts.value.length > 0 && !sourceBuffer.value.updating) {
                console.log('Appending audio part')
                sourceBuffer.value.appendBuffer(audioParts.value.shift())
              }
            })
          }
        })
      }
    }

    const closeConversation = () => {
      interruptFlag.value = true
      resetState()
      resetAudioState()
      curState.value = 'close'
    }

    // 对话框状态显示判断机
    const interactionDisplayState = (curState) => {
      const nextIndex = stateOrder.indexOf(curState.value) + 1
      curState.value = stateOrder[nextIndex % stateOrder.length]
    }

    const closeDialog = () => {
      dialogVisibleLocal.value = false
      emit('closeDialog')
      closeConversation()
    }

    const displayText = async (text) => {
      displayedText.value = ''
      interruptFlag.value = false

      if (!text) return

      for (let i = 0; i < text.length; i++) {
        if (interruptFlag.value) break
        await new Promise((resolve) => setTimeout(resolve, 50))
        displayedText.value += text[i]
      }
    }

    const startRecording = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            mediaRecorder.value = new MediaRecorder(stream)
            mediaRecorder.value.start()
            isRecording.value = true
            const audioChunks = []
            mediaRecorder.value.ondataavailable = (event) => {
              audioChunks.push(event.data)
            }
            mediaRecorder.value.onstop = () => {
              audioBlob.value = new Blob(audioChunks, { type: 'audio/wav' })
              answerUrl.value = URL.createObjectURL(audioBlob.value)
              isRecording.value = false
            }
          })
          .catch((error) => {
            console.error('Error accessing media devices.', error)
          })
      } else {
        console.error('Media devices are not supported.')
      }
    }

    const stopRecording = () => {
      if (mediaRecorder.value) {
        mediaRecorder.value.stop()
      }
    }

    const handleAudioPartReady = (payload) => {
      console.log('Received audio part:', payload)
      audioParts.value.push(payload)
      if (sourceBuffer.value && !sourceBuffer.value.updating) {
        console.log('Appending audio part from handleAudioPartReady')
        sourceBuffer.value.appendBuffer(audioParts.value.shift())
      }
    }

    const handleAudioComplete = () => {
      console.log('Audio complete')
      if (!mediaSource.value) {
        initMediaSource()
      }

      if (mediaSource.value.readyState === 'open') {
        const checkAndEndStream = () => {
          console.log('Checking and ending stream')
          if (!sourceBuffer.value.updating) {
            try {
              sourceBuffer.value.removeEventListener('updateend', checkAndEndStream)
              sourceBuffer.value.abort()
              mediaSource.value.endOfStream()
            } catch (error) {
              console.error('Error ending stream:', error)
            }
          }
        }

        if (!sourceBuffer.value.updating) {
          mediaSource.value.endOfStream()
        } else {
          if (!isUpdateEndListenerAdded) {
            sourceBuffer.value.addEventListener('updateend', checkAndEndStream)
            isUpdateEndListenerAdded = true
          }
        }
      }
    }

    const displayAudio = (text) => {
      if (wsComponent.value) {
        console.log('Sending text to WebSocket:', text)
        wsComponent.value.sendMessages(text)
      }
    }

    const handleSubmitAnswer = () => {
      isSubmitAnswer.value = true
      scoreVisible.value = true
      interactionDisplayState(curState)
    }

    const handleSubmit = () => {
      interactionDisplayState(curState)

      if (curState.value === 'answer') {
        if (props.question.answerType === 'text') {
          displayText(props.question.answer)
        } else if (props.question.answerType === 'audio') {
          displayAudio(props.question.answer)
        }
      }
    }

    const handleShowAnswer = () => {
      if (question.answerType === 'text') {
        displayText(question.answer)
      } else if (question.answerType === 'audio') {
        displayAudio(question.answer)
      }

      answerVisible.value = true
    }

    const handleAskButtonClick = () => {
      askButtonMode.value = true
      answerVisible.value = false
    }

    const updateDialogVisible = (val) => {
      emit('update:dialogVisible', val)
    }

    return {
      userAnswer,
      displayedText,
      isRecording,
      answerUrl,
      startRecording,
      stopRecording,
      handleAudioPartReady,
      handleAudioComplete,
      wsComponent,
      audioPlayer,
      mediaSource,
      sourceBuffer,
      answerVisible,
      closeConversation,
      handleSubmitAnswer,
      askButtonMode,
      handleAskButtonClick,
      resetState,
      closeDialog,
      updateDialogVisible,
      dialogVisibleLocal,
      isSubmitAnswer,
      scoreVisible,
      curState,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
}

.dialog-question {
  font-weight: bold;
}

.dialog-answer {
  white-space: pre-wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.recording-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.margin10 {
  margin: 10px 0;
}

.ask-button {
  margin-bottom: 20px;
}

.phototalk-wrapper {
  width: 200px;
  height: 200px;

  video {
    width: 100%;
    height: 100%;
  }
}
</style>
