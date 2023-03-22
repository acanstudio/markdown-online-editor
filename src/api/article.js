import request from '@/utils/request'
const BASE_URL = `${process.env.VUE_APP_BASE_API}`

export default {
  // 获取文章内容
  getArticle(params) {
    return request({
      url: `${BASE_URL}/${params.app}/${params.resource}/${params.id}`,
      method: 'get',
    })
  },
  // 添加文章
  createArticle(params, data) {
    return request({
      url: `${BASE_URL}/${params.app}/${params.resource}`,
      method: 'post',
      data,
    })
  },
  // 编辑文章
  saveArticle(params, data) {
    return request({
      url: `${BASE_URL}/${params.app}/${params.resource}/${params.id}`,
      method: 'put',
      data,
    })
  },
}
