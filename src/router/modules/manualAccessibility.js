
export default [
    {
        path: '/accessibility/manual/:testId',
        name: 'ManualAccessibility',
        meta: { authorize: [1] },
        component: () => import('@/views/admin/AccessibilityManagerView.vue'),
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
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityCooperative.vue'),
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
