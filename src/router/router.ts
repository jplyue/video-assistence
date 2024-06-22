import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/dashboard/Dashboard.vue'
import VideoSetting from '@/videoSetting/VideoSetting.vue'
import VideoPreview from '@/videoPreview/VideoPreview.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Dashboard
    },
    {
      path: '/video-setting',
      component: VideoSetting
    },
    {
      path: '/video-preview',
      component: VideoPreview
    }
  ]
})
export default router
