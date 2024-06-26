import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/dashboard/Dashboard.vue'
import VideoSetting from '@/videoSetting/VideoSetting.vue'
import VideoPreview from '@/videoPreview/VideoPreview.vue'
import Register from '@/register/Register.vue'
import Login from '@/login/Login.vue'
import AssistantManage from '@/assistantManage/AssistantManage.vue'
import AssistantDetail from '@/assistantDetail/AssistantDetail.vue'
import AssistantCreate from '@/assistantCreate/AssistantCreate.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Dashboard
    },
    {
      path: '/dashboard',
      component: Dashboard
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/create',
      component: AssistantCreate
    },
    {
      path: '/manage',
      component: AssistantManage
    },
    { path: '/assistant/:id', component: AssistantDetail, props: true },
    {
      path: '/detail',
      component: AssistantDetail
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
