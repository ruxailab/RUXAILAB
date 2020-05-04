import Vue from 'vue'
import VueRouter from 'vue-router'
import CreateTest from '../views/CreateTest.vue'
import TestList from '../views/TestList.vue'
import TestView from '../views/TestView.vue'
import TasksView from '../views/TasksView.vue'

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
  {
    path: '/testview/:id',
    name: 'TestView',
    props: true,
    component: TestView
  },
  {
    path: '/testview/:id/tasksview',
    name: 'TasksView',
    props: true,
    component: TasksView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
