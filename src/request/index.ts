import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

// 创建一个 Axios 实例
const instance = axios.create({
  baseURL: '/api' // 基础 URL，可以根据需要进行修改
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 获取 token 的函数
const getTokenFromCookie = () => {
  const name = 'token='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim()
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

console.log('token:', getTokenFromCookie())

// 保存 token 的函数
export const saveTokenInCookie = (token: string) => {
  const now = new Date()
  now.setTime(now.getTime() + 24 * 60 * 60 * 1000) // 设置 cookie 有效期为 24 小时
  document.cookie = `token=${token};expires=${now.toUTCString()};path=/`
  console.log('Token saved:', document.cookie) // 确认 token 已成功存储
}

// 定义请求函数的类型
export const request = (options: AxiosRequestConfig, addToken: boolean = false) => {
  const token = getTokenFromCookie()

  if (addToken) {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers['token'] = token
  }

  return instance(options)
}
