import EditTest from '@/views/admin/EditTestView.vue'
import TestList from '@/views/admin/DashboardView.vue'
import AnswerView from '@/views/admin/AnswerView.vue'
import ManagerView from '@/views/admin/ManagerView.vue'
import ReportView from '@/views/admin/ReportView.vue'
import CooperatorsView from '@/views/admin/CooperatorsView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'
import AnalyticsView from '@/views/admin/AnalyticsView.vue'
import TemplateView from '@/views/admin/TemplateView.vue'
import CreateView from '@/views/admin/CreateView.vue'
import CreateBlankView from '@/views/admin/CreateBlankView'
import CreateFromTemplate from '@/views/admin/CreateFromTemplateView.vue'
import FinalReportView from '@/views/admin/FinalReportView'
import Profile from '@/views/admin/ProfileView.vue'
import Notification from '@/views/admin/NotificationPage.vue'
import Choose from '@/views/admin/Choose.vue'
import Inspection from '@/views/admin/Inspection.vue'
import Testing from '@/views/admin/Testing.vue'


export default [
  {
    path: '/testslist',
    name: 'TestList',
    meta: { authorize: [1] },
    component: TestList,
  },
  {
    path:'/choose',
    name:'Choose',
    meta: { authorize: [1] },
    component:Choose,
  },
  {
    path:'/profile',
    name:'Profile',
    meta: { authorize: [1] },
    component:Profile,
  },
  {
    path: '/notifications',
    name: 'notifications',
    meta: { authorize: [1] },
    component: Notification,
  },
  {
    path: '/managerview/:id/:token?',
    name: 'ManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
  },
  {
    path: '/reportview/:id/:token?',
    name: 'ReportView',
    props: true,
    meta: { authorize: [0, 1] },
    component: ReportView,
  },
  {
    path: '/finalreportview/:id/:token?',
    name: 'FinalReportView',
    props: true,
    meta: { authorize: [0, 1] },
    component: FinalReportView,
  },
  {
    path: '/answerview/:id/:token?',
    name: 'AnswerView',
    props: true,
    meta: { authorize: [0, 1] },
    component: AnswerView,
  },
  {
    path: '/edittest/:id/:token?',
    name: 'EditTest',
    props: true,
    meta: { authorize: [0, 1] },
    component: EditTest,
  },
  {
    path: '/settingsview/:id/:token?',
    name: 'SettingsView',
    props: true,
    meta: { authorize: [0, 1] },
    component: SettingsView,
  },
  {
    path: '/cooperators/:id/:token?',
    name: 'CooperatorsView',
    props: true,
    meta: { authorize: [0, 1] },
    component: CooperatorsView,
  },
  {
    path: '/analyticsview/:id/:heuristic?/:token?',
    name: 'AnalyticsView',
    props: true,
    meta: { authorize: [0, 1] },
    component: AnalyticsView,
  },
  {
    path: '/templateview/:id/:token?',
    name: 'TemplateView',
    props: true,
    meta: { authorize: [0, 1] },
    component: TemplateView,
  },
  {
    path: '/createtest',
    name: 'Create View',
    meta: { authorize: [1] },
    component: CreateView,
  },
  {
    path: '/createBlank',
    name: 'Create Blank View',
    meta: { authorize: [1] },
    component: CreateBlankView,
  },
  {
    path: '/inspection',
    name: 'Inspection',
    meta: { authorize: [1] },
    component: Inspection,
  },
  {
    path: '/testing',
    name: 'Testing',
    meta: { authorize: [1] },
    component: Testing,
  },
  {
    path: '/fromtemplate',
    name: 'Create from template',
    meta: { authorize: [1] },
    component: CreateFromTemplate,
  },
]