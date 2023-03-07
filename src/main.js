/** @format */

import Vue from 'vue'
import './global.js'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

import ElementUi from 'element-ui'
Vue.use(ElementUi)

//import './icons'

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
