import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//导入全局样式表
import './assets/css/global.css';
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import TreeTable from 'vue-table-with-tree-grid'
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
//全局注册组件 树形表格组件
Vue.component('tree-table',TreeTable)
//过滤器
Vue.filter('dateFormat',function(value){
  const dt = new Date(value)
  
  const y = dt.getFullYear()
  //padStart  ES6新增语法，padStart()和padStart()一共接受两个参数，
  //第一个参数用来指定字符串的长度，第二个参数是用来补全的字符串 padStart()用于头部补全
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.use(ElementUI)
//在vue中挂载导入的富文本编辑器
Vue.use(VueQuillEditor) 
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
