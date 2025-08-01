import { createAccessibilityRoutes } from './accessibilityUtils';

const accessibilityRoutes = [
    ...createAccessibilityRoutes(
        '/accessibility/manual',
        () => import('@/views/admin/AccessibilityManagerView.vue'),
        [
            {
                path: '',
                name: 'AccessibilityHome',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityHome.vue')
            },
            {
                path: '/edit/:testId',
                name: 'EditAccessibilityTest',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityEditTest.vue')
            },
            {
                path: '/preview/:testId',
                name: 'AccessibilityPreviewTest',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityPreviewTest.vue')
            },
            {
                path: '/result/:testId',
                name: 'AccessibilityTestAnswers',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityAnswer.vue')
            },
            {
                path: '/report/:testId',
                name: 'AccessibilityTestReport',
                component: () => import('@/views/admin/AccessibilityReport.vue')
            },
            {
                path: '/cooperative/:testId',
                name: 'AccessibilityTestCooperative',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityCooperative.vue')
            },
            {
                path: '/setting/:testId',
                name: 'AccessibilityTestSettings',
                component: () => import('@/views/admin/AccessibilitySettings.vue')
            },
            {
                path: '/config/:testId',
                name: 'AccessibilityConfig',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityConfig.vue')
            }
        ]
    ),
    ...createAccessibilityRoutes(
        '/accessibility/automatic',
        () => import('@/views/admin/AutomatedAccessibilityManager.vue'),
        [
            {
                path: '',
                name: 'AutomatedAccessibilityHome',
                component: () => import('@/views/admin/AutomatedAccessibility/AutomatedAccessibilityHome.vue')
            },
            {
                path: '/analyse/:testId',
                name: 'Analyse',
                component: () => import('@/views/admin/AutomatedAccessibility/EditTest.vue')
            },
            {
                path: '/answers/:testId',
                name: 'AccessibilityAnswers',
                component: () => import('@/views/admin/AutomatedAccessibility/Answers.vue')
            },
            {
                path: '/report/:testId',
                name: 'AccessibilityReport',
                component: () => import('@/views/admin/AutomatedAccessibility/Report.vue')
            },
            {
                path: '/cooperation/:testId',
                name: 'AccessibilityCooperation',
                component: () => import('@/views/admin/AutomatedAccessibility/Cooperation.vue')
            },
            {
                path: '/settings/:testId',
                name: 'AccessibilitySettings',
                component: () => import('@/views/admin/AutomatedAccessibility/Settings.vue')
            }
        ]
    )
];

export default accessibilityRoutes;
