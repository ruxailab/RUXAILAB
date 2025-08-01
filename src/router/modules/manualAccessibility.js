import { createAccessibilityRoutes } from './accessibilityUtils';

const manualAccessibilityRoutes = createAccessibilityRoutes(
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
);

export default manualAccessibilityRoutes;
