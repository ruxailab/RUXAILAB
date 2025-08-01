import { createAccessibilityRoutes } from './accessibilityUtils';

const automatedAccessibilityRoutes = createAccessibilityRoutes(
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
);

export default automatedAccessibilityRoutes;
