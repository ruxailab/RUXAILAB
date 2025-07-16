import Accessibility from '@/views/admin/Accessibility.vue';
import AccessibilityManagerView from '@/views/admin/AccessibilityManagerView.vue';
import AutomatedAccessibilityManager from '@/views/admin/AutomatedAccessibilityManager.vue';
import AutomatedAccessibilityHome from '@/views/admin/AutomatedAccessibility/AutomatedAccessibilityHome.vue';
import Analyse from '@/views/admin/AutomatedAccessibility/EditTest.vue';
import Answers from '@/views/admin/AutomatedAccessibility/Answers.vue';
import Report from '@/views/admin/AutomatedAccessibility/Report.vue';
import Cooperation from '@/views/admin/AutomatedAccessibility/Cooperation.vue';
import Settings from '@/views/admin/AutomatedAccessibility/Settings.vue';

export default [
    {
        path: '/accessibility',
        name: 'accessibility',
        meta: { authorize: [1] },
        component: Accessibility,
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
            },
            {
                path: '/config/:testId',
                name: 'AccessibilityConfig',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityConfig.vue'),
                props: true,
                meta: { authorize: [1] }
            },
        ]
    },
];
