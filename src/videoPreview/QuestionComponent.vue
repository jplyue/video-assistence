<template>
  <div>
    <div v-if="question.questionType === 'text'">
      <p v-if="!answerVisible" class="dialog-question">{{ question.question }}</p>
      <p v-else class="dialog-answer">{{ displayedText }}</p>
      <el-input
        v-if="!answerVisible"
        v-model="userAnswer"
        :rows="3"
        type="textarea"
        placeholder="请输入答案"
      />
    </div>

    <div v-else-if="question.questionType === 'audio'">
      <div v-if="!answerVisible">
        <p>请录制您的回答:</p>
        <el-button @click="startRecording">开始录音</el-button>
        <el-button @click="stopRecording" :disabled="!isRecording">停止录音</el-button>
        <audio v-if="audioUrl" :src="audioUrl" controls></audio>
      </div>
      <div v-else>
        <audio :src="question.answer" controls></audio>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="!answerVisible && question.questionType === 'text'" @click="submitAnswer"
          >查看正确答案</el-button
        >
        <el-button
          v-if="!answerVisible && question.questionType === 'audio'"
          @click="submitAudioAnswer"
          >提交</el-button
        >
        <el-button v-else @click="$emit('close')">关闭</el-button>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'QuestionComponent',
  props: {
    question: Object,
    answerVisible: Boolean
  },
  emits: ['close', 'submit-answer', 'submit-audio-answer'],
  setup(props, { emit }) {
    const userAnswer = ref('')
    const displayedText = ref('')
    const isRecording = ref(false)
    const audioUrl = ref('')
    const audioBlob = ref(null)
    const mediaRecorder = ref(null)

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
              audioUrl.value = URL.createObjectURL(audioBlob.value)
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

    const submitAnswer = () => {
      emit('submit-answer', userAnswer.value)
    }

    const submitAudioAnswer = () => {
      if (audioBlob.value) {
        const audioUrl = URL.createObjectURL(audioBlob.value)
        props.question.answer = audioUrl
        emit('submit-audio-answer')
      }
    }

    const displayText = async (text) => {
      displayedText.value = ''
      for (let i = 0; i < text.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        displayedText.value += text[i]
      }
    }

    watch(
      () => props.answerVisible,
      (newValue) => {
        if (newValue && props.question.questionType === 'text') {
          displayText(props.question.answer)
        }
      }
    )

    return {
      userAnswer,
      displayedText,
      isRecording,
      audioUrl,
      startRecording,
      stopRecording,
      submitAnswer,
      submitAudioAnswer
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.dialog-question,
.dialog-answer {
  margin-bottom: 20px;
}
</style>
