<template>
  <div>
    <WebSocketComponent
      ref="wsComponent"
      @audioPartReady="handleAudioPartReady"
      @audioComplete="handleAudioComplete"
    />
    <el-dialog v-model="dialogVisibleLocal" width="500" :show-close="false">
      <template #header="{ titleId, titleClass }">
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
              <div><p>请录制您的回答:(按住录音，松开结束)</p></div>
              <div>
                <button
                  @mousedown="startRecording"
                  @mouseup="stopRecording"
                  @touchstart="startRecording"
                  @touchend="stopRecording"
                  class="record-button"
                ></button>
              </div>
              <div>
                <audio v-if="questionAudioUrl" :src="questionAudioUrl" controls></audio>
              </div>
              <div class="transcript">
                <p>{{ finalTranscript }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 分数 -->
        <div v-if="curState === 'score'">
          <div class="margin10">
            <p>您的分数{{ answerScore }}分</p>
            <p v-if="evaluation">{{ evaluation }}</p>
          </div>
        </div>

        <div v-if="curState === 'answer'">
          <!-- 文本回答 -->
          <div v-if="question.answerType === 'text'">
            <div class="margin10">
              <p class="dialog-answer">{{ displayedText }}</p>
            </div>
          </div>

          <!-- 语音回答 -->
          <div v-else-if="question.answerType === 'audio' || question.answerType === 'phototalk'">
            <div
              v-if="question.answerType === 'audio'"
              @click="toggleAudio"
              :class="[
                'audio-icon',
                { 'audio-icon-active': isAnswerUrlLoaded, loading: !isAnswerUrlLoaded }
              ]"
            >
              <font-awesome-icon icon="volume-up" class="sound-icon"></font-awesome-icon>
            </div>
            <audio
              ref="audioPlayer"
              :src="answerAudioUrl"
              style="display: none"
              @loadeddata="onAudioLoaded"
            ></audio>
            <div v-if="question.answerType === 'phototalk'" class="phototalk-wrapper margin10">
              <video autoplay muted loop src="/talking2.mp4"></video>
              <div class="transcript">
                <p>{{ finalTranscript }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-if="curState === 'question'"
            :loading="isSubmitting"
            @click="handleSubmit"
            type="primary"
          >
            提交
          </el-button>
          <el-button v-if="curState === 'score'" @click="handleSubmit" type="primary"
            >查看正确答案</el-button
          >
          <el-button @click="closeDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <div v-if="interactionVisible && !dialogVisible">
      <div class="conversation">
        <div class="conversation-footer margin10">
          <el-button
            v-if="curState === 'question'"
            :loading="isSubmitting"
            @click="handleSubmit"
            type="primary"
          >
            提交
          </el-button>
          <el-button v-if="curState === 'score'" @click="handleSubmit" type="primary"
            >查看正确答案</el-button
          >
          <el-button v-if="curState !== 'close'" @click="closeConversation">关闭</el-button>
        </div>
        <div class="conversation-content">
          <div v-if="curState === 'question'">
            <!-- 文字提问 -->
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
                  <button
                    @mousedown="startRecording"
                    @mouseup="stopRecording"
                    @touchstart="startRecording"
                    @touchend="stopRecording"
                    class="record-button"
                  ></button>
                </div>
                <div>
                  <audio v-if="questionAudioUrl" :src="questionAudioUrl" controls></audio>
                </div>
                <div class="transcript">
                  <p>{{ finalTranscript }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="curState === 'score'">
            <div class="margin10">
              <p>您的分数{{ answerScore }} 分</p>
              <p v-if="evaluation">{{ evaluation }}</p>
            </div>
          </div>
          <div v-if="curState === 'answer'">
            <!-- 文字回答 -->
            <div v-if="question.answerType === 'text'">
              <div class="question-text margin10">
                <p class="dialog-answer">{{ displayedText }}</p>
              </div>
            </div>

            <!-- 语音回答 -->
            <div v-else-if="question.answerType === 'audio' || question.answerType === 'phototalk'">
              <div
                v-if="question.answerType === 'audio'"
                @click="toggleAudio"
                :class="[
                  'audio-icon',
                  { 'audio-icon-active': isAnswerUrlLoaded, loading: !isAnswerUrlLoaded }
                ]"
              >
                <font-awesome-icon icon="volume-up" class="sound-icon"></font-awesome-icon>
              </div>
              <audio
                ref="audioPlayer"
                :src="answerAudioUrl"
                style="display: none"
                @loadeddata="onAudioLoaded"
              ></audio>
              <div v-if="question.answerType === 'phototalk'" class="phototalk-wrapper margin10">
                <video autoplay muted loop src="/talking2.mp4"></video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <audio ref="backgroundAudio" src="/letmethink.mp3" style="display: none"></audio>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import WebSocketComponent from './WebSocketComponent.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { request } from '@/request'
import { ElMessage } from 'element-plus'

library.add(faVolumeUp)

const stateOrder = ['question', 'score', 'answer', 'close']

export default {
  components: {
    WebSocketComponent,
    FontAwesomeIcon
  },
  props: {
    interactionVisible: Boolean,
    question: Object,
    dialogVisible: Boolean,
    interactionPosition: String,
    videoId: String
  },
  setup(props, { emit }) {
    const userAnswer = ref('')
    const displayedText = ref('')
    const interimTranscript = ref('')
    const finalTranscript = ref('')
    const isRecording = ref(false)
    const questionAudioUrl = ref('')
    const answerAudioUrl = ref('')
    const isAnswerUrlLoaded = ref(false)
    const dialogVisibleLocal = ref(props.dialogVisible)
    const curState = ref('close')
    const audioBlob = ref(null)
    const mediaRecorder = ref(null)
    const recognition = ref(null)
    const interruptFlag = ref(false)
    const wsComponent = ref(null)
    const audioPlayer = ref(null)
    const backgroundAudio = ref(null)
    const mediaSource = ref(null)
    const sourceBuffer = ref(null)
    const audioParts = ref([])
    let backgroundAudioInterval = null
    let isUpdateEndListenerAdded = false

    const isSubmitAnswer = ref(false)
    const answerVisible = ref(false)
    const askButtonMode = ref(false)
    const scoreVisible = ref(false)
    const evaluation = ref('')
    const answerScore = ref('')
    const isSubmitting = ref(false)

    watch([() => props.question, () => props.dialogVisible], ([newQuestion, newDialogVisible]) => {
      if (newQuestion) {
        curState.value = stateOrder[0]
      }
      if (newDialogVisible) {
        dialogVisibleLocal.value = newDialogVisible
        if (newDialogVisible) {
          curState.value = stateOrder[0]
        }
      }
    })

    const updateUserAnswer = (value) => {
      userAnswer.value = value
    }

    const closeDialog = () => {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value.currentTime = 0
      }
      stopBackgroundAudio()
      dialogVisibleLocal.value = false
      emit('closeDialog')
      resetState()
    }

    const closeConversation = () => {
      interruptFlag.value = true
      resetState()
      resetAudioState()
      stopBackgroundAudio()
      curState.value = 'close'
    }

    const resetState = () => {
      userAnswer.value = ''
      displayedText.value = ''
      interimTranscript.value = ''
      finalTranscript.value = ''
      isRecording.value = false
      questionAudioUrl.value = ''
      answerAudioUrl.value = ''
      isAnswerUrlLoaded.value = false
      answerVisible.value = false
      askButtonMode.value = false
    }

    const resetAudioState = () => {
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

      if (mediaSource.value && mediaSource.value.readyState === 'open') {
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

    const startBackgroundAudio = () => {
      if (backgroundAudio.value) {
        backgroundAudio.value.loop = false
        backgroundAudio.value.play()
        backgroundAudioInterval = setInterval(() => {
          if (backgroundAudio.value.paused) {
            backgroundAudio.value.play()
          }
        }, 5000)
      }
    }

    const stopBackgroundAudio = () => {
      if (backgroundAudio.value) {
        backgroundAudio.value.pause()
        backgroundAudio.value.currentTime = 0
      }
      if (backgroundAudioInterval) {
        clearInterval(backgroundAudioInterval)
        backgroundAudioInterval = null
      }
    }

    const handleSubmitAnswer = () => {
      isSubmitAnswer.value = true
      scoreVisible.value = true
      interactionDisplayState(curState)
    }

    const handleSubmit = async () => {
      isSubmitting.value = true // 设置提交状态为 true

      // 提交回答的内容
      if (curState.value === 'question') {
        try {
          const response = await request(
            {
              url: '/question/answer',
              method: 'POST',
              data: {
                video_id: props.videoId,
                question: props.question.question,
                answer: props.question.answer,
                user_answer: userAnswer.value,
                time: props.question.time
              }
            },
            true
          )
          const { score, comment } = response.data
          evaluation.value = comment
          answerScore.value = score
          console.log('Submit answer successfully', response)

          // 进入下个状态
          interactionDisplayState(curState)
        } catch (error) {
          console.error('Failed to /question/answer:', error)
          ElMessage({
            message: '提交失败，请重试',
            type: 'error'
          })
        } finally {
          isSubmitting.value = false // 无论成功还是失败，都将提交状态设置为 false
        }
      } else {
        // 进入下个状态
        interactionDisplayState(curState)

        // 查看答案
        if (curState.value === 'answer') {
          if (props.question.answerType === 'text') {
            displayText(props.question.answer)
          } else if (
            props.question.answerType === 'audio' ||
            props.question.answerType === 'phototalk'
          ) {
            displayAudio(props.question.answer)
          }
        }

        isSubmitting.value = false // 确保在其他情况下也将提交状态设置为 false
      }
    }

    const handleAskButtonClick = () => {
      askButtonMode.value = true
      answerVisible.value = false
    }

    const updateDialogVisible = (val) => {
      emit('update:dialogVisible', val)
    }

    const displayText = async (text) => {
      displayedText.value = ''
      interruptFlag.value = false

      if (!text) return

      for (let i = 0; text && i < text.length; i++) {
        if (interruptFlag.value) break
        await new Promise((resolve) => setTimeout(resolve, 50))
        displayedText.value += text[i]
      }
    }

    const interactionDisplayState = (curState) => {
      const nextIndex = stateOrder.indexOf(curState.value) + 1
      curState.value = stateOrder[nextIndex % stateOrder.length]

      if (curState.value === 'answer' && props.question.answerType === 'phototalk') {
        startBackgroundAudio()
      }
    }

    const startRecording = () => {
      // 清空 finalTranscript
      finalTranscript.value = ''

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
              questionAudioUrl.value = URL.createObjectURL(audioBlob.value)
              isRecording.value = false
              // 将录音发送到服务器或按需处理
              recognition.value.stop()
            }
            recognition.value.start()
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

    const playAudio = () => {
      const audio = audioPlayer.value
      if (audio) {
        stopBackgroundAudio()
        if (audio.paused) {
          audio.play()
        } else {
          audio.pause()
        }
      }
    }

    const toggleAudio = () => {
      const audio = audioPlayer.value
      if (audio) {
        if (audio.paused) {
          audio.play()
        } else {
          audio.pause()
        }
      }
    }

    const onAudioLoaded = () => {
      isAnswerUrlLoaded.value = true
      stopBackgroundAudio()
      playAudio()
    }

    if ('webkitSpeechRecognition' in window) {
      recognition.value = new webkitSpeechRecognition()
      recognition.value.continuous = true
      recognition.value.interimResults = true
      recognition.value.lang = 'zh-CN'

      recognition.value.onresult = (event) => {
        let interim = ''
        let final = ''
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript
          } else {
            interim += event.results[i][0].transcript
          }
        }
        interimTranscript.value = interim
        finalTranscript.value += final
        userAnswer.value = finalTranscript.value
      }
    } else {
      console.error('Web Speech API is not supported in this browser.')
      ElMessage({
        message: 'Web Speech API is not supported in this browser.',
        type: 'error'
      })
    }

    return {
      userAnswer,
      displayedText,
      interimTranscript,
      finalTranscript,
      isRecording,
      questionAudioUrl,
      answerAudioUrl,
      curState,
      dialogVisibleLocal,
      closeDialog,
      handleSubmit,
      handleSubmitAnswer,
      updateUserAnswer,
      handleAudioPartReady,
      handleAudioComplete,
      wsComponent,
      closeConversation,
      interactionDisplayState,
      handleAskButtonClick,
      startRecording,
      stopRecording,
      playAudio,
      toggleAudio,
      audioPlayer,
      backgroundAudio,
      mediaSource,
      sourceBuffer,
      answerVisible,
      askButtonMode,
      resetState,
      updateDialogVisible,
      isSubmitAnswer,
      scoreVisible,
      onAudioLoaded,
      isAnswerUrlLoaded,
      evaluation,
      answerScore,
      isSubmitting
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

.phototalk-wrapper {
  width: 200px;
  height: 200px;

  video {
    width: 100%;
    height: 100%;
  }
}

.audio-icon {
  cursor: pointer;
  font-size: 24px;
  color: black;
  &.loading {
    animation: jump 1s linear infinite;
  }
}

.audio-icon-active {
  color: #409eff;
}

@keyframes jump {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.record-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #222;
  border: none;
  cursor: pointer;
}

.transcript {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
}
</style>
