import request from '@/utils/request'
const BASE_URL = `${process.env.VUE_APP_BASE_API}`

export default {
  // 获取文章内容
  getArticle(data) {
    return request({
      url: `${BASE_URL}/${data.app}/${data.resource}/${data.id}`,
      method: 'get',
      params: data,
    })
  },
  // 编辑文章
  saveArticle(data) {
    return request({
      url: `${BASE_URL}/articles/1s`,
      method: 'put',
      data,
    })
  },
}
