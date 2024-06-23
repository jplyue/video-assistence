<template>
  <div>
    <el-button v-if="askButtonVisible" @click="handleAskButtonClick" class="ask-button"
      >提问</el-button
    >
    <WebSocketComponent
      ref="wsComponent"
      @audioPartReady="handleAudioPartReady"
      @audioComplete="handleAudioComplete"
    />
    <div v-if="interactionVisible && (!askButtonVisible || (askButtonVisible && askButtonMode))">
      <div>
        <!-- 文本提问 -->
        <div v-if="question.questionType === 'text'">
          <div v-if="askButtonMode">
            <el-input v-model="userAnswer" :rows="3" type="textarea" placeholder="请输入问题" />
          </div>
          <div v-else>
            <div class="question-text margin10">
              <p class="dialog-question">{{ question.question }}</p>
            </div>
            <el-input v-model="userAnswer" :rows="3" type="textarea" placeholder="请输入答案" />
          </div>
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

        <!-- 回答 -->
        <div v-if="answerVisible">
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

          <!-- Knowledgebase 回答 -->
          <div v-if="question.answerType === 'knowledgebase'">
            <div class="question-text margin10">
              <p class="dialog-answer">Knowledgebase</p>
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button v-if="!answerVisible" @click="submitAnswer(question)">查看正确答案</el-button>
        <el-button v-else @click="closeDialog">关闭</el-button>
      </div>
    </div>

    <el-dialog
      v-if="positionOverlay"
      v-model="dialogVisible"
      :title="answerVisible ? '正确答案' : '回答问题'"
      width="500"
    >
      <template #default>
        <div>
          <!-- 文本提问/回答 -->
          <div v-if="question.questionType === 'text'">
            <div class="margin10">
              <p v-if="!answerVisible" class="dialog-question">{{ question.question }}</p>
              <p v-else class="dialog-answer">{{ displayedText }}</p>
            </div>
            <el-input
              v-if="!answerVisible"
              v-model="userAnswer"
              :rows="3"
              type="textarea"
              placeholder="请输入答案"
            />
          </div>

          <!-- 语音提问/回答 -->
          <div v-else-if="question.questionType === 'audio'">
            <div v-if="!answerVisible" class="recording-wrapper">
              <div><p>请录制您的回答:</p></div>
              <div>
                <el-button @click="startRecording">开始录音</el-button>
                <el-button @click="stopRecording" :disabled="!isRecording">停止录音</el-button>
              </div>
              <div>
                <audio v-if="answerUrl" :src="answerUrl" controls></audio>
              </div>
            </div>
            <div v-else>
              <audio v-show="answerVisible" ref="audioPlayer" controls></audio>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="!answerVisible" @click="submitAnswer(question)">查看正确答案</el-button>
          <el-button v-else @click="closeDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import WebSocketComponent from './WebSocketComponent.vue'

export default {
  components: {
    WebSocketComponent
  },
  props: {
    interactionVisible: Boolean,
    question: Object,
    positionOverlay: Boolean,
    askButtonVisible: Boolean
  },
  setup(props, { emit }) {
    const userAnswer = ref('')
    const displayedText = ref('')
    const isRecording = ref(false)
    const answerUrl = ref('')
    const audioBlob = ref(null)
    const mediaRecorder = ref(null)
    const interruptFlag = ref(false)
    const dialogVisible = ref(false)
    const answerVisible = ref(false)
    const askButtonMode = ref(false)
    const wsComponent = ref(null)
    const audioPlayer = ref(null)
    const mediaSource = ref(null)
    const sourceBuffer = ref(null)
    const audioParts = ref([])
    let isUpdateEndListenerAdded = false

    // watch(
    //   () => props.interactionVisible,
    //   (newVal, oldVal) => {
    //     console.log('hide answer')
    //     if (newVal === false && oldVal) {
    //       answerVisible.value = false
    //     }
    //   }
    // )

    watch(props.question, (newQuestion) => {
      if (newQuestion && newQuestion.answerType === 'audio') {
        if (questionComponent.value) {
          wsComponent.value.resetWebSocket()
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

    const closeDialog = () => {
      dialogVisible.value = false
      answerVisible.value = false
      interruptFlag.value = true
      resetState()
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

    const submitAnswer = (question) => {
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
      dialogVisible,
      answerVisible,
      closeDialog,
      submitAnswer,
      askButtonMode,
      handleAskButtonClick,
      resetState
    }
  }
}
</script>

<style lang="scss" scoped>
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
