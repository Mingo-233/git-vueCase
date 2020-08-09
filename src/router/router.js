import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    { path: '/', redirect: 'login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home}
  ]
})
//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  //to 将要访问的对象，from代表从哪个路径跳转来
  //next（）放行 ， next('/login') 跳转
  if(to.path == '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token');
  //如果没有获取到token值，就是没有登录状态
  if(!tokenStr) return next('/login')
  next();
})
export default router
