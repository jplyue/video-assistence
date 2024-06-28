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
        <div class="video-ask">
          <QuestionComponent
            ref="questionComponent"
            :interaction-visible="interactionVisible"
            :question="currentQuestion"
            :dialog-visible="dialogVisible"
          />
        </div>
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

//convert video time to xx:xx
const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600)
    .toString()
    .padStart(2, '0')
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

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
    const chatHistory = ref([
      { sender: 'user', message: '这是什么视频？' },
      { sender: 'server', message: '这是关于Vue.js的视频教程。' },
      { sender: 'user', message: '谢谢！' },
      { sender: 'server', message: '不客气，有什么问题随时问我。' }
    ]) // 存储聊天记录

    const videoData = reactive({
      interactionPosition: 'right',
      questions: [
        {
          index: '1',
          question: '这是第1-1个问题',
          answer:
            '1-1的回答：《哈利·波特》是由英国作家J.K.罗琳创作的一系列奇幻文学作品。系列共包括七部小说，主要讲述的是一个叫哈利·波特的男孩在霍格沃茨魔法学校的学习生活以及与黑魔法师伏地魔的斗争故事。这一系列作品赢得了全球范围内的广泛赞誉和巨大商业成功，深受各个年龄段读者的喜爱。哈利·波特系列不仅仅是一部儿童文学作品，它探讨了诸如友谊、勇气、爱、牺牲、死亡和种族歧视等深刻的主题。在故事的开始，哈利是一个孤儿，被寄养在姨妈家中，过着悲惨的生活。在他11岁生日那天，哈利收到了一封霍格沃茨魔法学校的录取通知书，得知自己是一个巫师。从此，他的生活发生了巨大的变化。在霍格沃茨，哈利结识了两个最好的朋友——赫敏·格兰杰和罗恩·韦斯莱。他们三人组成了一个不可分割的团队，经历了无数的冒险和挑战。每一部小说都对应哈利在霍格沃茨的一个学年，故事逐步揭示了哈利的身世之谜，以及他与伏地魔之间的宿命对决。系列的高潮部分发生在《哈利·波特与死亡圣器》中，哈利和他的朋友们必须找到并摧毁伏地魔的魂器，以彻底击败他。最终，哈利在一场史诗般的战斗中战胜了伏地魔，恢复了魔法界的和平。除了小说外，哈利·波特系列还被改编成了电影、戏剧、电子游戏等多种形式，进一步扩大了其影响力。电影版由丹尼尔·雷德克里夫、艾玛·沃特森和鲁伯特·格林特主演，他们的表演为角色赋予了新的生命。《哈利·波特》系列不仅仅是一种文化现象，影响了一代又一代的读者。书中的魔法世界激发了无数人的想象力，让人们相信奇迹和勇气的力量。无论是年轻的读者，还是成年人，都能在这个充满魔法和冒险的世界中找到自己的共鸣。哈利·波特的成功也激励了许多新的作家和创作者，推动了奇幻文学的发展。许多读者在哈利·波特的陪伴下成长，这个系列在他们的心中占据了特殊的位置。它不仅仅是一部小说，更是一种情感纽带，将全世界的粉丝紧密联系在一起。总之，《哈利·波特》系列是现代文学史上一颗璀璨的明珠。它不仅展示了一个奇幻的魔法世界，更通过一个个动人的故事传递了宝贵的人生哲理和价值观。在未来的岁月中，这个系列将继续被人们所喜爱和铭记，成为经典文学作品中的一部分。',
          time: '00:02',
          questionType: 'text',
          answerType: 'text',
          action: 'pause'
        },
        {
          index: '2',
          question: '这是第1-2个问题',
          answer:
            '1-2的回答：《哈利·波特》是由英国作家J.K.罗琳创作的一系列奇幻文学作品。系列共包括七部小说，主要讲述的是一个叫哈利·波特的男孩在霍格沃茨魔法学校的学习生活以及与黑魔法师伏地魔的斗争故事。这一系列作品赢得了全球范围内的广泛赞誉和巨大商业成功，深受各个年龄段读者的喜爱。哈利·波特系列不仅仅是一部儿童文学作品，它探讨了诸如友谊、勇气、爱、牺牲、死亡和种族歧视等深刻的主题。在故事的开始，哈利是一个孤儿，被寄养在姨妈家中，过着悲惨的生活。在他11岁生日那天，哈利收到了一封霍格沃茨魔法学校的录取通知书，得知自己是一个巫师。从此，他的生活发生了巨大的变化。在霍格沃茨，哈利结识了两个最好的朋友——赫敏·格兰杰和罗恩·韦斯莱。他们三人组成了一个不可分割的团队，经历了无数的冒险和挑战。每一部小说都对应哈利在霍格沃茨的一个学年，故事逐步揭示了哈利的身世之谜，以及他与伏地魔之间的宿命对决。系列的高潮部分发生在《哈利·波特与死亡圣器》中，哈利和他的朋友们必须找到并摧毁伏地魔的魂器，以彻底击败他。最终，哈利在一场史诗般的战斗中战胜了伏地魔，恢复了魔法界的和平。除了小说外，哈利·波特系列还被改编成了电影、戏剧、电子游戏等多种形式，进一步扩大了其影响力。电影版由丹尼尔·雷德克里夫、艾玛·沃特森和鲁伯特·格林特主演，他们的表演为角色赋予了新的生命。《哈利·波特》系列不仅仅是一种文化现象，影响了一代又一代的读者。书中的魔法世界激发了无数人的想象力，让人们相信奇迹和勇气的力量。无论是年轻的读者，还是成年人，都能在这个充满魔法和冒险的世界中找到自己的共鸣。哈利·波特的成功也激励了许多新的作家和创作者，推动了奇幻文学的发展。许多读者在哈利·波特的陪伴下成长，这个系列在他们的心中占据了特殊的位置。它不仅仅是一部小说，更是一种情感纽带，将全世界的粉丝紧密联系在一起。总之，《哈利·波特》系列是现代文学史上一颗璀璨的明珠。它不仅展示了一个奇幻的魔法世界，更通过一个个动人的故事传递了宝贵的人生哲理和价值观。在未来的岁月中，这个系列将继续被人们所喜爱和铭记，成为经典文学作品中的一部分。',
          time: '00:04',
          questionType: 'text',
          answerType: 'audio',
          action: 'button'
        },
        {
          index: '3',
          question: '这是第1-3个问题',
          answer:
            '1-3的回答：《哈利·波特》是由英国作家J.K.罗琳创作的一系列奇幻文学作品。系列共包括七部小说，主要讲述的是一个叫哈利·波特的男孩在霍格沃茨魔法学校的学习生活以及与黑魔法师伏地魔的斗争故事。这一系列作品赢得了全球范围内的广泛赞誉和巨大商业成功，深受各个年龄段读者的喜爱。哈利·波特系列不仅仅是一部儿童文学作品，它探讨了诸如友谊、勇气、爱、牺牲、死亡和种族歧视等深刻的主题。在故事的开始，哈利是一个孤儿，被寄养在姨妈家中，过着悲惨的生活。在他11岁生日那天，哈利收到了一封霍格沃茨魔法学校的录取通知书，得知自己是一个巫师。从此，他的生活发生了巨大的变化。在霍格沃茨，哈利结识了两个最好的朋友——赫敏·格兰杰和罗恩·韦斯莱。他们三人组成了一个不可分割的团队，经历了无数的冒险和挑战。每一部小说都对应哈利在霍格沃茨的一个学年，故事逐步揭示了哈利的身世之谜，以及他与伏地魔之间的宿命对决。系列的高潮部分发生在《哈利·波特与死亡圣器》中，哈利和他的朋友们必须找到并摧毁伏地魔的魂器，以彻底击败他。最终，哈利在一场史诗般的战斗中战胜了伏地魔，恢复了魔法界的和平。除了小说外，哈利·波特系列还被改编成了电影、戏剧、电子游戏等多种形式，进一步扩大了其影响力。电影版由丹尼尔·雷德克里夫、艾玛·沃特森和鲁伯特·格林特主演，他们的表演为角色赋予了新的生命。《哈利·波特》系列不仅仅是一种文化现象，影响了一代又一代的读者。书中的魔法世界激发了无数人的想象力，让人们相信奇迹和勇气的力量。无论是年轻的读者，还是成年人，都能在这个充满魔法和冒险的世界中找到自己的共鸣。哈利·波特的成功也激励了许多新的作家和创作者，推动了奇幻文学的发展。许多读者在哈利·波特的陪伴下成长，这个系列在他们的心中占据了特殊的位置。它不仅仅是一部小说，更是一种情感纽带，将全世界的粉丝紧密联系在一起。总之，《哈利·波特》系列是现代文学史上一颗璀璨的明珠。它不仅展示了一个奇幻的魔法世界，更通过一个个动人的故事传递了宝贵的人生哲理和价值观。在未来的岁月中，这个系列将继续被人们所喜爱和铭记，成为经典文学作品中的一部分。',
          time: '00:06',
          questionType: 'text',
          answerType: 'phototalk',
          action: 'pause'
        },
        {
          index: '5',
          question: '这是第2-1个问题',
          answer:
            '2-1的回答：这是第二个问题的答案。答：互联网技术的发展，特别是大数据、人工智能和云计算等新技术的应用，已经深刻地改变了各个行业的运作模式。以下是互联网技术在不同行业中的应用及其影响的详细分析：1.**电子商务行业**：互联网技术使得电子商务成为可能，从最初的简单购物网站到如今的综合性购物平台，消费者可以通过互联网轻松购买各类商品。大数据分析可以帮助电商平台更好地理解消费者需求，通过个性化推荐提升用户体验。人工智能技术在客服机器人、智能搜索和库存管理等方面也得到了广泛应用，提高了运营效率。2.**金融行业**：互联网技术推动了金融行业的数字化转型，催生了网络银行、移动支付、互联网保险等新兴金融服务。大数据分析在风控和用户信用评估方面发挥着重要作用。区块链技术则为金融交易的安全性和透明度提供了保障，促进了数字货币的发展。3.**医疗健康行业**：互联网技术在医疗健康行业的应用主要体现在远程医疗、健康监控和医疗数据分析等方面。远程医疗可以让患者通过视频会议与医生交流，获取医疗建议。穿戴设备和物联网技术可以实时监控患者的健康数据，大数据分析则可以用于疾病预测和个性化治疗方案的制定。4.**教育行业**：互联网技术改变了传统的教育模式，在线教育平台的兴起使得学生可以随时随地获取教育资源。虚拟现实（VR）和增强现实（AR）技术的应用，使得课堂教学更加生动有趣。人工智能技术则在智能辅导系统、个性化学习路径推荐等方面展现了巨大潜力。5.**制造业**：互联网技术推动了制造业的智能化和数字化转型。工业互联网和物联网技术使得工厂设备之间可以实现互联互通，提升了生产效率和设备利用率。大数据分析和人工智能技术在预测性维护、生产质量控制等方面得到了广泛应用，助力制造业向智能制造方向发展。6.**交通运输行业**：互联网技术在交通运输行业的应用主要体现在智慧交通系统、无人驾驶和物流管理等方面。智慧交通系统通过大数据分析和物联网技术，可以实时监控和管理交通流量，缓解交通拥堵。无人驾驶技术的进步，有望彻底改变未来的出行方式，提高交通安全和效率。物流管理方面，互联网技术使得物流全流程可视化和智能化，实现了高效的仓储和配送管理。7.**媒体与娱乐行业**：互联网技术彻底改变了媒体与娱乐行业的内容生产和传播方式。在线视频、直播、短视频等新兴媒体形式的兴起，使得用户可以随时随地获取和分享内容。大数据分析和人工智能技术在内容推荐、广告投放和用户画像等方面发挥了重要作用，提高了用户粘性和商业价值。总的来说，互联网技术不仅提升了各个行业的效率和服务水平，还催生了许多新兴产业和商业模式。未来，随着互联网技术的不断进步，各行业的数字化、智能化程度将进一步提高，更多的创新应用将不断涌现，推动社会经济的持续发展。',
          time: '00:10',
          questionType: 'audio',
          answerType: 'text',
          action: 'button'
        },
        {
          index: '6',
          question: '这是第2-2个问题',
          answer:
            '在很久很久以前，有一个遥远的王国，这个王国位于一片美丽的大陆上。大陆四季分明，春天花开遍地，夏天绿树成荫，秋天果实累累，冬天白雪皑皑。王国的人民过着幸福而又平静的生活。王国的中心有一座高高的城堡，城堡的主人是慈祥的国王和美丽的王后，他们有一个聪明可爱的小公主。小公主不仅美丽动人，而且非常聪明，她喜欢学习各种知识，经常去城堡的图书馆阅读书籍。有一天，小公主在图书馆里发现了一本古老的魔法书，这本书记录着各种神奇的魔法和传说中的生物。小公主对这些魔法和生物充满了好奇，于是她决定要学习魔法，并探寻这些神秘的生物。小公主每天都在图书馆里阅读魔法书，学习各种魔法咒语和魔法技巧。她发现自己非常有天赋，很快就掌握了许多强大的魔法。她的魔法老师是一位年长的巫师，这位巫师非常欣赏小公主的天赋和努力，经常耐心地指导她。随着时间的推移，小公主的魔法越来越强大，她决定要去寻找传说中的神秘生物。她带上了自己的魔法书和一些必需的物品，开始了她的冒险之旅。她走过了茂密的森林，翻过了高高的山脉，穿过了辽阔的草原，经历了许多艰难险阻，终于找到了传说中的神秘生物。这些生物包括善良的龙、智慧的独角兽、神秘的精灵和强大的巨人。小公主用自己的善良和智慧赢得了这些生物的友谊，他们教会了她更多的魔法和知识。小公主在这些生物的帮助下，成功地打败了一个企图统治王国的邪恶巫师，拯救了她的家园。从那以后，小公主成为了王国的英雄，她的故事被传颂了许多年。她不仅用魔法保护了王国，还用自己的智慧和勇气赢得了人民的爱戴。小公主最终继承了王位，成为了一位英明的女王，继续带领她的人民过着幸福和平的生活。这段长文本展示了小公主的成长和冒险，她的勇气和智慧，以及她与各种神秘生物的友谊。这是一个充满了魔法和冒险的故事，适合用来测试你的代码的处理能力。',
          time: '00:12',
          questionType: 'audio',
          answerType: 'audio',
          action: 'pause'
        },
        {
          index: '7',
          question: '这是第2-3个问题',
          answer: '2-3的回答：这是第三个问题的答案',
          time: '00:14',
          questionType: 'audio',
          answerType: 'phototalk',
          action: 'pause'
        }
      ]
    })

    const checkTime = () => {
      const currentVideoTime = player.value.currentTime()
      console.log(22, currentQuestionIndex.value, videoData.questions.length)
      if (currentQuestionIndex.value < videoData.questions.length) {
        const question = videoData.questions[currentQuestionIndex.value]
        const questionTime = convertToSeconds(question.time)

        if (Math.abs(currentVideoTime - questionTime) < 0.5) {
          console.log('pause')
          player.value.pause()

          videoData.interactionPosition === 'overlay' && (dialogVisible.value = true)

          // 重置子组件
          if (questionComponent.value) {
            questionComponent.value.resetState()
          }

          hideQuestion()
          showQuestion(question)

          currentQuestionIndex.value++ // Move to the next question
          console.log('currentQuestionIndex:', currentQuestionIndex.value)
        }
      }
    }

    const convertToSeconds = (time) => {
      const [minutes, seconds] = time.split(':').map(Number)
      return minutes * 60 + seconds
    }

    const showQuestion = (question) => {
      console.log('show question')
      currentQuestion.value = question
      interactionVisible.value = true
    }

    const hideQuestion = () => {
      console.log('hide question')
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
          console.log('Video play over reported successfully')
        } catch (error) {
          console.error('Failed to report video play over:', error)
        }
      }
    }

    const handleBeforeUnload = (event) => {
      reportPlayOver()
      // 触发浏览器默认行为
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
      const questionText = userQuestion.value
      chatHistory.value.push({ sender: 'user', message: questionText })

      const currentTime = player.value.currentTime()
      const formattedTime = formatTime(currentTime)

      //log chat
      // try {
      //   const response = await request(
      //     {
      //       url: '/video/log/create',
      //       method: 'POST',
      //       data: {
      //         video_id: videoId.value,
      //         question: questionText,
      //         question_type: 1,
      //         answer: '', // 假设这里先为空，实际需要从服务端获取
      //         answer_choose: 1,
      //         time: formattedTime
      //       }
      //     },
      //     true
      //   )

      //   if (response.code === 200) {
      //     chatHistory.value.push({ sender: 'server', message: response.data.answer })
      //   }
      // } catch (error) {
      //   console.error('发送问题失败:', error)
      // }

      userQuestion.value = ''
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
            // videoData.questions = chatResponse.data.questions || []
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
      askButtonClicked,
      chatHistory
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

.user-chat-area {
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
</style>
