import request from '@/utils/request'
const BASE_URL = `${process.env.VUE_APP_BASE_API}`

export default {
  // 用户登录
  login(data) {
    return request({
      url: `${BASE_URL}/passport/token`,
      method: 'post',
      params: data
    })
  },
  // 编辑文章
  register(data) {
    return request({
      url: `${BASE_URL}/articles/1s`,
      method: 'put',
      data
    })
  }
}
