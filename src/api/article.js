import request from '@/utils/request'
const BASE_URL = `${process.env.VUE_APP_BASE_API}`

export default {
  // 获取文章内容
  getArticle(data) {
    let result = request({
      url: `${BASE_URL}/infocms/articles/1`,
      method: 'get',
      params: data
    })
    console.log(result, 'ddddd')
    return result
  },
  // 编辑文章
  saveArticle(data) {
    return request({
      url: `${BASE_URL}/articles/1s`,
      method: 'put',
      data
    })
  }
}
