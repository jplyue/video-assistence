<template>
  <div id="video-preview" class="container">
    <div class="button-group">
      <el-button type="primary" @click="setInteractionPosition('top')">顶部</el-button>
      <el-button type="primary" @click="setInteractionPosition('right')">右边</el-button>
      <el-button type="primary" @click="setInteractionPosition('bottom')">底部</el-button>
      <el-button type="primary" @click="setInteractionPosition('overlay')">浮层</el-button>
    </div>
    <div :class="['interactive-position-wrapper', videoData.interactionPosition]">
      <div :class="['video-wrapper', videoData.interactionPosition]">
        <video ref="videoPlayer" class="video-js vjs-default-skin" controls></video>
      </div>
      <div v-if="videoData.interactionPosition !== 'overlay'" class="interaction-area">
        <QuestionComponent
          v-if="showComponentInInteractionArea"
          :question="currentQuestion"
          :answer-visible="answerVisible"
          @close="closeDialog"
          @submit-answer="submitAnswer"
          @submit-audio-answer="submitAudioAnswer"
        />
        <div class="dialog-footer" v-if="showComponentInInteractionArea">
          <el-button
            v-if="!answerVisible && currentQuestion.questionType === 'text'"
            @click="submitAnswer"
            >查看正确答案</el-button
          >
          <el-button
            v-if="!answerVisible && currentQuestion.questionType === 'audio'"
            @click="submitAudioAnswer"
            >提交</el-button
          >
          <el-button v-else @click="closeDialog">关闭</el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model:visible="dialogVisible"
      :title="!!answerVisible ? '正确答案' : '回答问题'"
      width="500"
    >
      <QuestionComponent
        :question="currentQuestion"
        :answer-visible="answerVisible"
        @close="closeDialog"
        @submit-answer="submitAnswer"
        @submit-audio-answer="submitAudioAnswer"
      >
        <template #footer>
          <span class="dialog-footer">
            <el-button
              v-if="!answerVisible && currentQuestion.questionType === 'text'"
              @click="submitAnswer(currentQuestion)"
              >查看正确答案</el-button
            >
            <el-button
              v-if="!answerVisible && currentQuestion.questionType === 'audio'"
              @click="submitAudioAnswer"
              >提交</el-button
            >
            <el-button v-else @click="closeDialog">关闭</el-button>
          </span>
        </template>
      </QuestionComponent>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import 'video.js/dist/video-js.css'
import { Mic } from '@element-plus/icons-vue'
import QuestionComponent from './QuestionComponent.vue'

export default {
  components: {
    Mic,
    QuestionComponent
  },
  setup() {
    const player = ref(null)
    const dialogVisible = ref(false)
    const answerVisible = ref(false)
    const askButtonVisible = ref(false) // 点击提问
    const currentQuestion = ref({})
    const currentQuestionIndex = ref(0)
    const showComponentInInteractionArea = ref(false)
    const videoData = reactive({
      interactionPosition: 'top',
      shareSetting: false,
      loginRequired: false,
      questions: [
        {
          question: '这是第一个问题',
          answer:
            '《哈利·波特》是由英国作家J.K.罗琳创作的一系列奇幻文学作品。系列共包括七部小说，主要讲述的是一个叫哈利·波特的男孩在霍格沃茨魔法学校的学习生活以及与黑魔法师伏地魔的斗争故事。这一系列作品赢得了全球范围内的广泛赞誉和巨大商业成功，深受各个年龄段读者的喜爱。哈利·波特系列不仅仅是一部儿童文学作品，它探讨了诸如友谊、勇气、爱、牺牲、死亡和种族歧视等深刻的主题。在故事的开始，哈利是一个孤儿，被寄养在姨妈家中，过着悲惨的生活。在他11岁生日那天，哈利收到了一封霍格沃茨魔法学校的录取通知书，得知自己是一个巫师。从此，他的生活发生了巨大的变化。在霍格沃茨，哈利结识了两个最好的朋友——赫敏·格兰杰和罗恩·韦斯莱。他们三人组成了一个不可分割的团队，经历了无数的冒险和挑战。每一部小说都对应哈利在霍格沃茨的一个学年，故事逐步揭示了哈利的身世之谜，以及他与伏地魔之间的宿命对决。系列的高潮部分发生在《哈利·波特与死亡圣器》中，哈利和他的朋友们必须找到并摧毁伏地魔的魂器，以彻底击败他。最终，哈利在一场史诗般的战斗中战胜了伏地魔，恢复了魔法界的和平。除了小说外，哈利·波特系列还被改编成了电影、戏剧、电子游戏等多种形式，进一步扩大了其影响力。电影版由丹尼尔·雷德克里夫、艾玛·沃特森和鲁伯特·格林特主演，他们的表演为角色赋予了新的生命。《哈利·波特》系列不仅仅是一种文化现象，影响了一代又一代的读者。书中的魔法世界激发了无数人的想象力，让人们相信奇迹和勇气的力量。无论是年轻的读者，还是成年人，都能在这个充满魔法和冒险的世界中找到自己的共鸣。哈利·波特的成功也激励了许多新的作家和创作者，推动了奇幻文学的发展。许多读者在哈利·波特的陪伴下成长，这个系列在他们的心中占据了特殊的位置。它不仅仅是一部小说，更是一种情感纽带，将全世界的粉丝紧密联系在一起。总之，《哈利·波特》系列是现代文学史上一颗璀璨的明珠。它不仅展示了一个奇幻的魔法世界，更通过一个个动人的故事传递了宝贵的人生哲理和价值观。在未来的岁月中，这个系列将继续被人们所喜爱和铭记，成为经典文学作品中的一部分。',
          time: '1:39',
          questionType: 'text',
          answerType: 'text',
          action: 'pause'
        },
        {
          question: '2',
          answer: '22',
          time: '1:57',
          questionType: 'audio',
          answerType: 'audio',
          action: 'button'
        },
        {
          question: '3',
          answer: '33',
          time: '2:12',
          questionType: 'text',
          answerType: 'phototalk',
          action: 'pause'
        },
        {
          question: '4',
          answer: '44',
          time: '2:33',
          questionType: 'audio',
          answerType: 'knowledgeBase',
          action: 'button'
        },
        {
          question: '5',
          answer: '55',
          time: '2:53',
          questionType: 'text',
          answerType: 'text',
          action: 'pause'
        }
      ]
    })

    onMounted(() => {
      player.value = videojs(videoPlayer.value, {}, () => {
        player.value.on('timeupdate', checkTime)
        player.value.on('ended', () => {
          currentQuestionIndex.value = 0 // 重置问题索引
        })
      })
    })

    const setInteractionPosition = (position) => {
      videoData.interactionPosition = position
      if (position === 'overlay') {
        showComponentInInteractionArea.value = false
      } else {
        showComponentInInteractionArea.value = true
      }
    }

    const submitAnswer = () => {
      answerVisible.value = true
      // 处理提交答案逻辑
    }

    const submitAudioAnswer = () => {
      answerVisible.value = true
      // 处理提交音频答案逻辑
    }

    const closeDialog = () => {
      dialogVisible.value = false
      answerVisible.value = false
      player.value.play() // 继续播放视频
      checkNextQuestion() // 继续检查下一个问题
    }

    const checkNextQuestion = () => {
      setTimeout(() => {
        if (!player.value.paused() && currentQuestionIndex.value < videoData.questions.length) {
          checkTime()
        }
      }, 100)
    }

    const checkTime = () => {
      const currentVideoTime = player.value.currentTime()

      if (currentQuestionIndex.value < videoData.questions.length) {
        const question = videoData.questions[currentQuestionIndex.value]
        const questionTime = convertToSeconds(question.time)

        if (Math.abs(currentVideoTime - questionTime) < 0.5) {
          if (question.action === 'pause') {
            player.value.pause()
            currentQuestion.value = question
            dialogVisible.value = true
          } else if (question.action === 'button') {
            currentQuestion.value = question
            askButtonVisible.value = true
          }

          currentQuestionIndex.value++
        }
      }
    }

    const convertToSeconds = (timeString) => {
      const [minutes, seconds] = timeString.split(':').map(Number)
      return minutes * 60 + seconds
    }

    return {
      player,
      dialogVisible,
      answerVisible,
      askButtonVisible,
      currentQuestion,
      showComponentInInteractionArea,
      videoData,
      setInteractionPosition,
      submitAnswer,
      submitAudioAnswer,
      closeDialog
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-group {
  margin-bottom: 20px;
}

.interactive-position-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-wrapper {
  width: 640px;
  height: 360px;
  position: relative;
}

.interaction-area {
  width: 640px;
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
