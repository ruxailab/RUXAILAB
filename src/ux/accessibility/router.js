// Shared views (async, shared chunk across study areas)
const SettingsView = () =>
  import(/* webpackChunkName: "study-shared" */ '@/shared/views/SettingsView.vue')
const CooperatorsView = () =>
  import(
    /* webpackChunkName: "study-shared" */ '@/shared/views/CooperatorsView.vue'
  )

// Manual-Accessibility-Pages(x7)
const AccessibilityManagerView = () =>
  import(
    /* webpackChunkName: "accessibility-manual" */ '@/ux/accessibility/view/manual/AccessibilityManagerView.vue'
  )
const AccessibilityHome = () =>
  import(
    /* webpackChunkName: "accessibility-manual" */ '@/ux/accessibility/view/manual/AccessibilityHome.vue'
  )
const AccessibilityTestAnswers = () =>
  import(
    /* webpackChunkName: "accessibility-manual" */ '@/ux/accessibility/view/manual/AccessibilityAnswer.vue'
  )
const AccessibilityConfig = () =>
  import(
    /* webpackChunkName: "accessibility-manual" */ '@/ux/accessibility/view/manual/AccessibilityConfig.vue'
  )

// Automated-Accessibility-Pages (x7)
const AutomatedAccessibilityManager = () =>
  import(
    /* webpackChunkName: "accessibility-automatic" */ '@/ux/accessibility/view/automatic/AutomatedAccessibilityManager.vue'
  )
const AutomatedAccessibilityHome = () =>
  import(
    /* webpackChunkName: "accessibility-automatic" */ '@/ux/accessibility/view/automatic/AutomatedAccessibilityHome.vue'
  )
const AccessibilityAnswers = () =>
  import(
    /* webpackChunkName: "accessibility-automatic" */ '@/ux/accessibility/view/automatic/Answers.vue'
  )
const AccessibilityAnalyse = () =>
  import(
    /* webpackChunkName: "accessibility-automatic" */ '@/ux/accessibility/view/automatic/EditTest.vue'
  )

// Automated Accessibility Report Page
const AccessibilityReport = () =>
  import(
    /* webpackChunkName: "accessibility-report" */ '@/ux/accessibility/view/automatic/Report.vue'
  )

// Accessibility Preview Test Page
const AccessibilityPreviewTest = () =>
  import(
    /* webpackChunkName: "accessibility-preview" */ '@/ux/accessibility/view/manual/AccessibilityPreviewTest.vue'
  )


const accessibilityRoutes = [
  // Manual Accessibility Routes
  {
    path: '/accessibility/manual/dashboard/:id',
    alias: '/accessibility/manual/:id',
    name: 'AccessibilityManualManager',
    meta: { authorize: [0, 1] },
    component: AccessibilityManagerView,
    props: true,
    children: [
      {
        path: '/accessibility/manual/dashboard/:id',
        alias: '/accessibility/manual/:id',
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
        path: '/accessibility/manual/results/:id',
        alias: '/accessibility/manual/result/:id',
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
    path: '/accessibility/automatic/dashboard/:id',
    alias: '/accessibility/automatic/:id',
    name: 'AccessibilityAutomaticManager',
    meta: { authorize: [0, 1] },
    component: AutomatedAccessibilityManager,
    props: true,
    children: [
      {
        path: '/accessibility/automatic/dashboard/:id',
        alias: '/accessibility/automatic/:id',
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
        path: '/accessibility/automatic/results/:id',
        alias: '/accessibility/automatic/answers/:id',
        name: 'AccessibilityAnswers',
        props: true,
        meta: { authorize: [0, 1] },
        component: AccessibilityAnswers,
      },
      {
        path: '/accessibility/automatic/progress/:id/:token?',
        alias: '/accessibility/automatic/reports/:id/:token?',
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
