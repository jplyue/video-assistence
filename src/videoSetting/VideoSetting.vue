<template>
  <div id="video-setting" class="container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/dashboard">主页</el-breadcrumb-item>
      <el-breadcrumb-item to="/manage">助手管理</el-breadcrumb-item>
      <el-breadcrumb-item>视频设置</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="video-player-wrapper">
      <video ref="videoPlayer" class="video-js vjs-default-skin" controls></video>
    </div>
    <div class="time-display">
      <span>{{ formatTime(currentTime) }}</span>
      <el-tooltip content="复制时间戳">
        <el-button type="primary" size="small" @click="copyTimestamp"> 复制时间戳 </el-button>
      </el-tooltip>
    </div>
    <el-slider v-model="currentTime" :max="duration" @change="seekVideo" show-tooltip>
      <template #tooltip>
        <div>{{ formatTime(currentTime) }}</div>
      </template>
    </el-slider>

    <el-form class="form-area" label-width="160px">
      <!-- 提问按钮 -->
      <el-form-item label="是否显示提问按钮">
        <el-checkbox v-model="showAskButton">显示提问按钮</el-checkbox>
      </el-form-item>

      <!-- 设置问题 -->
      <el-form-item label="设置问题">
        <div class="responsive-table">
          <el-table :data="questions" style="width: 100%">
            <el-table-column label="删除" width="70">
              <template #default="scope">
                <el-button icon="Delete" @click="handleDelete(scope.$index, scope.row)" circle>
                  <delete style="width: 1em; height: 1em; margin-right: 8px" />
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="index" label="#" width="50"></el-table-column>
            <el-table-column label="问题" width="440">
              <template #default="scope">
                <el-form-item>
                  <el-input
                    v-model="scope.row.question"
                    :rows="3"
                    type="textarea"
                    placeholder="请输入问题"
                  />
                </el-form-item>
                <el-radio-group v-model="scope.row.questionType">
                  <el-radio :value="'text'">文字</el-radio>
                  <el-radio :value="'audio'">语音</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
            <el-table-column label="回答" width="440">
              <template #default="scope">
                <el-form-item>
                  <el-input
                    v-model="scope.row.answer"
                    :rows="3"
                    type="textarea"
                    placeholder="请输入回答"
                  />
                </el-form-item>
                <el-checkbox-group v-model="scope.row.answerTypes">
                  <el-checkbox :value="'audio'">语音</el-checkbox>
                  <el-checkbox :value="'text'">文字</el-checkbox>
                  <el-checkbox :value="'phototalk'">照片对话</el-checkbox>
                </el-checkbox-group>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.time" placeholder="时间" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>

      <el-form-item>
        <div class="buttons" style="margin-top: 20px">
          <el-button type="primary" @click="handleAdd">增加</el-button>
        </div>
      </el-form-item>

      <!-- 设置分享 -->
      <el-form-item label="设置分享">
        <el-checkbox v-model="shareSetting">启用分享</el-checkbox>
        <el-checkbox v-model="loginRequired">观看视频是否需要登录</el-checkbox>
      </el-form-item>

      <el-form-item label="">
        <div class="submit-buttons" style="margin-top: 20px">
          <el-button type="success" :loading="loading" @click="handleSubmit"
            >提交保存设置</el-button
          >
        </div>
      </el-form-item>
    </el-form>

    <!-- 统计信息 -->
    <div class="statistics">
      <h3>统计信息</h3>
      <p>总问题数: {{ questions.length }}</p>
      <p>已回答问题数: {{ answeredQuestionsCount }}</p>
      <p>观看次数: {{ statistics.views }}</p>
      <p>平均观看时长: {{ formatTime(statistics.avg_watch_time) }}</p>
      <!-- 其他统计信息 -->
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import 'video.js/dist/video-js.css'
import { ElMessage } from 'element-plus'
import { CopyDocument, Delete } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { request } from '@/request'

const questionTypeMapping = {
  audio: 1,
  text: 2
}

const answerTypeMapping = {
  audio: 1,
  text: 2,
  phototalk: 3
}

export default {
  components: {
    CopyDocument,
    Delete
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const player = ref(null)
    const videoPlayer = ref(null)
    const shareSetting = ref(false)
    const loginRequired = ref(false)
    const showAskButton = ref(false)
    const loading = ref(false)
    const questions = ref([])
    const currentTime = ref(0)
    const duration = ref(0)
    const statistics = reactive({
      views: 0,
      avg_watch_time: 0
    })
    const questionPopoverVisible = reactive({})
    const popoverAction = ref('pause')

    const answeredQuestionsCount = computed(() => {
      return questions.value.filter((question) => question.answer !== '').length
    })

    onMounted(async () => {
      try {
        const videoDetailResponse = await request(
          {
            url: '/video/detail',
            method: 'POST',
            data: {
              video_id: route.query.video_id,
              visitor: '1'
            }
          },
          true
        )
        console.log('Video Detail Response:', videoDetailResponse)

        if (videoDetailResponse.code === 200) {
          const videoData = videoDetailResponse.data
          questions.value = videoData.questions.map((question, index) => ({
            index: index + 1,
            question: question.question,
            questionType: question.question_type.includes(1) ? 'audio' : 'text',
            answer: question.answer,
            answerTypes: question.answer_type
              .map((type) => {
                for (const [key, value] of Object.entries(answerTypeMapping)) {
                  if (value === type) return key
                }
                return null
              })
              .filter(Boolean),
            time: question.time,
            action: 'pause'
          }))
          shareSetting.value = videoData.share_login === 1
          loginRequired.value = videoData.assistant_show === 1
          showAskButton.value = videoData.answer_choose === 1

          const videojs = await import('video.js')
          player.value = videojs.default(videoPlayer.value, {
            sources: [
              {
                src: videoData.video_data,
                type: 'video/mp4'
              }
            ]
          })
          player.value.on('timeupdate', updateCurrentTime)
          player.value.on('loadedmetadata', () => {
            duration.value = player.value.duration()
          })
        } else {
          ElMessage.error('获取视频详情失败')
        }

        const statisticsResponse = await request(
          {
            url: '/video/play/statistics',
            method: 'POST',
            data: {
              video_id: route.query.video_id
            }
          },
          true
        )
        console.log('Statistics Response:', statisticsResponse)

        if (statisticsResponse.code === 200) {
          statistics.views = statisticsResponse.data.views
          statistics.avg_watch_time = statisticsResponse.data.avg_watch_time
        } else {
          ElMessage.error('获取统计信息失败')
        }
      } catch (error) {
        console.error('Error fetching video details or statistics:', error)
        ElMessage.error('获取视频详情或统计信息失败')
      }
    })

    const updateCurrentTime = () => {
      currentTime.value = player.value.currentTime()
    }

    const seekVideo = (value) => {
      if (player.value) {
        player.value.currentTime(value)
      }
    }

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const sec = Math.floor(seconds % 60)
      return `${minutes}:${sec < 10 ? '0' : ''}${sec}`
    }

    const copyTimestamp = () => {
      const timestamp = formatTime(currentTime.value)
      navigator.clipboard.writeText(timestamp).then(() => {
        ElMessage({
          message: `复制时间戳: ${timestamp}`,
          type: 'success'
        })
      })
    }

    const handleAdd = () => {
      const newIndex = questions.value.length + 1
      questions.value.push({
        index: newIndex,
        question: '',
        answer: '',
        time: '',
        questionType: 'text',
        answerTypes: ['text'], // 默认勾选文字
        action: 'pause' // 默认设置为暂停视频
      })
    }

    const handleEdit = (index, row) => {
      console.log('编辑行:', index, row)
    }

    const handleDelete = (index, row) => {
      questions.value.splice(index, 1)
      // 更新索引
      questions.value.forEach((question, idx) => {
        question.index = idx + 1
      })
    }

    const handleSubmit = async () => {
      loading.value = true
      const tableData = questions.value.map((question) => ({
        question: question.question,
        question_type: [questionTypeMapping[question.questionType]],
        answer: question.answer,
        answer_type: question.answerTypes.map((type) => answerTypeMapping[type]),
        time: question.time
      }))
      const formData = {
        video_id: route.query.video_id, // 从路由中获取视频ID
        questions: tableData,
        answer_choose: showAskButton.value ? 1 : 0,
        share_login: shareSetting.value ? 1 : 0
      }
      console.log('formData:', formData)
      try {
        const response = await request(
          {
            url: '/video/question',
            method: 'POST',
            data: formData
          },
          true
        )

        if (response.code === 200) {
          ElMessage.success('提交成功')
        } else {
          ElMessage.error('提交失败')
        }
        console.log('Submit Response:', response)
      } catch (error) {
        ElMessage.error('提交失败')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const showQuestionPopover = (index) => {
      questionPopoverVisible[index] = true
    }

    const pauseVideo = () => {
      if (player.value) {
        player.value.pause()
      }
    }

    const addQuestion = () => {
      const newIndex = questions.value.length + 1
      questions.value.push({
        index: newIndex,
        question: '',
        answer: '',
        time: new Date().toLocaleDateString(),
        questionType: 'text',
        answerType: 'text',
        action: 'pause'
      })
      questionPopoverVisible[newIndex - 1] = false
    }

    onBeforeUnmount(() => {
      if (player.value) {
        player.value.dispose()
      }
    })

    return {
      videoPlayer,
      shareSetting,
      loginRequired,
      questions,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      currentTime,
      duration,
      seekVideo,
      formatTime,
      copyTimestamp,
      questionPopoverVisible,
      answeredQuestionsCount,
      showQuestionPopover,
      pauseVideo,
      addQuestion,
      popoverAction,
      showAskButton,
      loading,
      statistics
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'video.js/dist/video-js.css';

#video-setting.container {
  max-width: 90vw; /* 修改为 90% 的视窗宽度 */
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-player-wrapper {
  margin-bottom: 20px;
}

.video-js {
  width: 100%;
  height: 60vh;
  border-radius: 10px;
  overflow: hidden;
}

.time-display {
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.el-slider {
  margin-bottom: 20px;
}

.form-area {
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px; /* 为提交按钮增加一些 margin */
}

.el-form-item {
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.el-popover {
  .el-popover__reference {
    display: inline-block;
  }
}

.el-table__body td.el-table__cell {
  vertical-align: top;
}

.responsive-table {
  overflow-x: auto;
}

.el-table {
  min-width: 600px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.statistics {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.statistics h3 {
  margin-bottom: 10px;
}

.statistics p {
  margin: 0;
}
</style>
