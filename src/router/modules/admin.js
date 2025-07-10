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
import Accessibility from '@/views/admin/Accessibility.vue'
import Assessment from '@/views/admin/Assessment.vue'
import Sample from '@/views/public/Sample.vue'
import AccessibilityManagerView from '@/views/admin/AccessibilityManagerView.vue'
import AutomatedAccessibilityManager from '@/views/admin/AutomatedAccessibilityManager.vue'
import AutomatedAccessibilityHome from '@/views/admin/AutomatedAccessibility/AutomatedAccessibilityHome.vue'
import Analyse from '@/views/admin/AutomatedAccessibility/EditTest.vue'
import Answers from '@/views/admin/AutomatedAccessibility/Answers.vue'
import Report from '@/views/admin/AutomatedAccessibility/Report.vue'
import Cooperation from '@/views/admin/AutomatedAccessibility/Cooperation.vue'
import Settings from '@/views/admin/AutomatedAccessibility/Settings.vue'
export default [
  {
    path: '/testslist',
    name: 'TestList',
    meta: { authorize: [1] },
    component: TestList,
  },
  {
    path: '/choose',
    name: 'Choose',
    meta: { authorize: [1] },
    component: Choose,
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
        path: '/reportview/:id',
        name: 'ReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/finalreportview/:id',
        name: 'FinalReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: FinalReportView,
      },
      {
        path: '/answerview/:id',
        name: 'AnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: AnswerView,
      },
      {
        path: '/edittest/:id',
        name: 'EditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: '/settingsview/:id',
        name: 'SettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/cooperators/:id',
        name: 'CooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: '/analyticsview/:id/:heuristic?',
        name: 'AnalyticsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: AnalyticsView,
      },
      {
        path: '/templateview/:id',
        name: 'TemplateView',
        props: true,
        meta: { authorize: [0, 1] },
        component: TemplateView,
      },
    ],
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
    path: '/accessibility',
    name: 'accessibility',
    meta: { authorize: [1] },
    component: Accessibility,
  },
  {
    path: '/assessment',
    name: 'assessment',
    meta: { authorize: [1] },
    component: Assessment,
  },
  {
    path: '/fromtemplate',
    name: 'Create from template',
    meta: { authorize: [1] },
    component: CreateFromTemplate,
  },
  {
    path: '/accessibility/automatic/:testId',
    name: 'AutomatedAccessibility',
    component: AutomatedAccessibilityManager,
    meta: { authorize: [1] },
    props: true,
    children: [
      {
        path: '',
        name: 'AutomatedAccessibilityHome',
        component: AutomatedAccessibilityHome,
        meta: { authorize: [1] }
      },
      {
        path: '/analyse/:testId',
        name: 'Analyse',
        component: Analyse,
        meta: { authorize: [1] }
      },
      {
        path: '/answers/:testId',
        name: 'AccessibilityAnswers',
        component: Answers,
        meta: { authorize: [1] }
      },
      {
        path: '/report/:testId',
        name: 'AccessibilityReport',
        component: Report,
        meta: { authorize: [1] }
      },
      {
        path: '/cooperation/:testId',
        name: 'AccessibilityCooperation',
        component: Cooperation,
        meta: { authorize: [1] }
      },
      {
        path: '/settings/:testId',
        name: 'AccessibilitySettings',
        component: Settings,
        meta: { authorize: [1] }
      }
    ]
  },
  {
    path: '/accessibility/manual/:testId',
    name: 'ManualAccessibility',
    meta: { authorize: [1] },
    component: AccessibilityManagerView,
    props: true,
    children: [
      {
        path: '',
        name: 'AccessibilityHome',
        component: () => import('@/views/admin/ManualAccessibility/AccessibilityHome.vue'),
        meta: { authorize: [1] }
      },
      {
        path: '/edit/:testId',
        name: 'EditAccessibilityTest',
        component: () => import('@/views/admin/ManualAccessibility/AccessibilityEditTest.vue'),
        props: true,
        meta: { authorize: [1] }
      },
      {
        path: '/preview/:testId',
        name: 'AccessibilityPreviewTest',
        component: () => import('@/views/admin/ManualAccessibility/AccessibilityPreviewTest.vue'),
        props: true,
        meta: { authorize: [1] }
      },
      {
        path: '/result/:testId',
        name: 'AccessibilityTestAnswers',
        component: () => import('@/views/admin/ManualAccessibility/AccessibilityAnswer.vue'),
        props: true,
        meta: { authorize: [1] }
      },
      {
        path: '/report/:testId',
        name: 'AccessibilityTestReport',
        component: () => import('@/views/admin/AccessibilityReport.vue'),
        props: true,
        meta: { authorize: [1] }
      },
      {
        path: '/cooperative/:testId',
        name: 'AccessibilityTestCooperative',
        component: () => import('@/views/admin/AccessibilityCooperative.vue'),
        props: true,
        meta: { authorize: [1] }
      },
      {
        path: '/setting/:testId',
        name: 'AccessibilityTestSettings',
        component: () => import('@/views/admin/AccessibilitySettings.vue'),
        props: true,
        meta: { authorize: [1] }
      }
    ]
  },
]