// Shared Settings View
import SettingsView from '@/shared/views/SettingsView.vue'
// Shared Cooperators View
import CooperatorsView from '@/shared/views/CooperatorsView.vue'

// Manual-Accessibility-Pages(x7)
import AccessibilityManagerView from '@/ux/accessibility/view/manual/AccessibilityManagerView.vue'
import AccessibilityHome from '@/ux/accessibility/view/manual/AccessibilityHome.vue'
import AccessibilityPreviewTest from '@/ux/accessibility/view/manual/AccessibilityPreviewTest.vue'
import AccessibilityTestAnswers from '@/ux/accessibility/view/manual/AccessibilityAnswer.vue'
import AccessibilityConfig from '@/ux/accessibility/view/manual/AccessibilityConfig.vue'

// Automated-Accessibility-Pages (x7)
import AutomatedAccessibilityManager from '@/ux/accessibility/view/automatic/AutomatedAccessibilityManager.vue'
import AutomatedAccessibilityHome from '@/ux/accessibility/view/automatic/AutomatedAccessibilityHome.vue'
import AccessibilityAnswers from '@/ux/accessibility/view/automatic/Answers.vue'
import AccessibilityReport from '@/ux/accessibility/view/automatic/Report.vue'
import AccessibilityAnalyse from '@/ux/accessibility/view/automatic/EditTest.vue'

const accessibilityRoutes = [
  // Manual Accessibility Routes
  {
    path: '/accessibility/manual/:id',
    name: 'AccessibilityManualManager',
    meta: { authorize: [0, 1] },
    component: AccessibilityManagerView,
    props: true,
    children: [
      {
        path: '/accessibility/manual/:id',
        name: 'AccessibilityHome',
        props: true,
        meta: { authorize: [0, 1] },
        component: AccessibilityHome,
      },
      {
        path: '/accessibility/manual/setting/:id',
        name: 'EditAccessibilityTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/accessibility/manual/preview/:id/:userId?/:token?',
        name: 'AccessibilityPreviewTest',
        props: true,
        meta: { authorize: [] }, // Allow public access with token
        component: AccessibilityPreviewTest,
      },
      {
        path: '/accessibility/manual/result/:id',
        name: 'AccessibilityTestAnswers',
        props: true,
        meta: { authorize: [0, 1] },
        component: AccessibilityTestAnswers,
      },
      {
        path: '/accessibility/manual/cooperative/:id',
        name: 'AccessibilityTestCooperative',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: '/accessibility/manual/config/:id',
        name: 'AccessibilityConfig',
        props: true,
        meta: { authorize: [0, 1] },
        component: AccessibilityConfig,
      },
    ],
  },
  // Standalone cooperator access route (like heuristics)
  {
    path: '/accessibility/manual/cooperator/:id/:userId?/:token?',
    name: 'AccessibilityCooperatorTest',
    props: true,
    meta: { authorize: [] }, // Allow public access with token
    component: AccessibilityPreviewTest,
  },
  // Automatic Accessibility Routes
  {
    path: '/accessibility/automatic/:id',
    name: 'AccessibilityAutomaticManager',
    meta: { authorize: [0, 1] },
    component: AutomatedAccessibilityManager,
    props: true,
    children: [
      {
        path: '/accessibility/automatic/:id',
        name: 'AutomatedAccessibilityHome',
        props: true,
        meta: { authorize: [0, 1] },
        component: AutomatedAccessibilityHome,
      },
      {
        path: '/accessibility/automatic/analyse/:id',
        name: 'AccessibilityAnalyse',
        props: true,
        meta: { authorize: [0, 1] },
        component: AccessibilityAnalyse,
      },
      {
        path: '/accessibility/automatic/answers/:id',
        name: 'AccessibilityAnswers',
        props: true,
        meta: { authorize: [0, 1] },
        component: AccessibilityAnswers,
      },
      {
        path: '/accessibility/automatic/reports/:id/:token?',
        name: 'AccessibilityReport',
        props: true,
        meta: { authorize: [] }, // Allow public access with token
        component: AccessibilityReport,
      },
      {
        path: '/accessibility/automatic/cooperation/:id',
        name: 'AccessibilityCooperation',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: '/accessibility/automatic/settings/:id',
        name: 'AccessibilitySettings',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
    ],
  },
  // Standalone cooperator access routes
  {
    path: '/accessibility/automatic/cooperator/:id/:token',
    name: 'AccessibilityAutomaticCooperatorTest',
    props: true,
    meta: { authorize: [] }, // Allow public access with token
    component: AccessibilityReport,
  },
]

export default accessibilityRoutes
