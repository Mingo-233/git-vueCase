import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//导入全局样式表
import './assets/css/global.css';

import axios from 'axios'

//配置请求的根路径
axios.defaults.baseURL= 'http://127.0.0.1:8888/api/private/v1/'
//axios请求体拦截
axios.interceptors.request.use(config => {
  // console.log(config);
  //为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //最后必须return config
  return config
})
//将axios挂载到实例原型上，方便调用
Vue.prototype.$axios = axios

Vue.config.productionTip = false

Vue.use(ElementUI)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
