import EditTest from '@/views/admin/EditTestView.vue'
import TestList from '@/views/admin/AdminView.vue'
import ManagerView from '@/views/admin/ManagerView.vue'
import ReportView from '@/views/admin/ReportView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import AnalyticsView from '@/views/admin/AnalyticsView.vue'
import TemplateView from '@/views/admin/TemplateView.vue'
import CreateFromTemplate from '@/views/admin/CreateFromTemplateView.vue'
import FinalReportView from '@/ux/Heuristic/views/FinalReportView.vue'
import Profile from '@/views/admin/ProfileView.vue'
import Notification from '@/features/notifications/views/NotificationPage.vue'
import Choose from '@/features/ux_creation/Choose.vue'
import ChooseStudyMethods from '@/features/ux_creation/ChooseStudyMethods.vue'
import ChooseStudyType from '@/features/ux_creation/ChooseStudyType.vue'
import StudyDetailsForm from '@/features/ux_creation/StudyDetailsForm.vue'
import accessibility from '@/views/admin/Accessibility.vue'
import DashboardView from '@/features/dashboard/views/DashboardView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import UserAnswerView from '@/ux/UserTest/views/UserAnswerView.vue'
import HeuristicAnswerView from '@/ux/Heuristic/views/HeuristicAnswerView.vue'

export default [
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { authorize: [1] },
    component: DashboardView,
  },
  {
    path: '/admin',
    name: 'Admin',
    meta: { authorize: [1] },
    component: TestList,
  },
  {
    path: '/testslist',
    name: 'TestList',
    meta: { authorize: [1] },
    component: TestList,
  },
  {
    path: '/accessibility',
    name: 'Accessibility',
    meta: { authorize: [1] },
    component: accessibility,
  },
  {
    path: '/profile',
    name: 'Profile',
    meta: { authorize: [1] },
    component: Profile,
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
    children: [
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
        path: '/userTest/moderated/answerview/:id/:token?',
        name: 'UserTestModeratedAnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: '/userTest/unmoderated/answerview/:id/:token?',
        name: 'UserTestUnmoderatedAnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: '/heuristic/answerview/:id/:token?',
        name: 'HeuristicAnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: HeuristicAnswerView,
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
      // {
      //   path: '/userTest/moderated/cooperators/:id/:token?',
      //   name: 'UserModeraterCooperatorView',
      //   props: true,
      //   meta: { authorize: [0, 1] },
      //   component: CooperatorsModeratedView,
      // },
      {
        path: '/analyticsview/:id/:heuristic?',
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
    ],
  },
  {
    path: '/choose',
    name: 'study-create-step1',
    meta: { authorize: [1] },
    component: Choose,
  },
  {
    path: '/methods',
    name: 'study-create-step2',
    meta: { authorize: [1] },
    component: ChooseStudyMethods,
  },
  {
    path: '/createtest',
    name: 'study-create-step3',
    meta: { authorize: [1] },
    component: ChooseStudyType,
  },
  {
    path: '/studydetails',
    name: 'study-create-step4',
    meta: { authorize: [1] },
    component: StudyDetailsForm,
  },
  {
    path: '/fromtemplate',
    name: 'Create from template',
    meta: { authorize: [1] },
    component: CreateFromTemplate,
  },
]
