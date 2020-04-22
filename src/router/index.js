import Vue from 'vue'
import VueRouter from 'vue-router'
import CreateTest from '../views/CreateTest.vue'
import TestList from '../views/TestList.vue'
Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'TestList',
    component: TestList
  },
  {
    path: '/createtest',
    name: 'Create Test',
    component: CreateTest
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
