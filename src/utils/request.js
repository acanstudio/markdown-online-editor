import axios from 'axios'
import Qs from 'qs'
import { MessageBox, Message } from 'element-ui'

const Tip = (msg) => {
  Message({
    message: msg || 'Error',
    type: 'error',
    duration: 3 * 1000,
  })
}

// create an axios instance
const service = axios.create({
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10 * 1000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    if (config.method === 'post') {
      const contentType = config.headers['Content-Type']
      if (contentType) {
        if (contentType.includes('multipart')) {
          // 类型 'multipart/form-data'
        } else if (contentType.includes('json')) {
          // 类型 'application/json'
          config.data = JSON.stringify(config.data)
        } else {
          // 类型 'application/x-www-form-urlencoded'
          config.data = Qs.stringify(config.data)
        }
      }
    }
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code == 200) {
      return res.data
    } else {
      let message = res.message ? res.message : '未知错误'
      Tip(message + '-' + res.code)
      //return res
      return Promise.reject()
    }
  },
  (error) => {
    let message = error.response.statusText
    message = !message ? error.response.statusText : message
    message = !message ? error.response.data.message : message
    message = !message ? '请求错误' : message
    Tip(message + '-' + error.response.status)
    return Promise.reject(error)
  }
)

export default service
