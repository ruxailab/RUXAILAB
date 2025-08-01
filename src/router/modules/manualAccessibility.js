const authorizeMeta = { meta: { authorize: [1] } };

const manualAccessibilityRoutes = [
    {
        path: '/accessibility/manual/:testId',
        name: 'ManualAccessibility',
        component: () => import('@/views/admin/AccessibilityManagerView.vue'),
        ...authorizeMeta,
        props: true,
        children: [
            {
                path: '',
                name: 'AccessibilityHome',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityHome.vue'),
                ...authorizeMeta
            },
            {
                path: '/edit/:testId',
                name: 'EditAccessibilityTest',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityEditTest.vue'),
                props: true,
                ...authorizeMeta
            },
            {
                path: '/preview/:testId',
                name: 'AccessibilityPreviewTest',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityPreviewTest.vue'),
                props: true,
                ...authorizeMeta
            },
            {
                path: '/result/:testId',
                name: 'AccessibilityTestAnswers',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityAnswer.vue'),
                props: true,
                ...authorizeMeta
            },
            {
                path: '/report/:testId',
                name: 'AccessibilityTestReport',
                component: () => import('@/views/admin/AccessibilityReport.vue'),
                props: true,
                ...authorizeMeta
            },
            {
                path: '/cooperative/:testId',
                name: 'AccessibilityTestCooperative',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityCooperative.vue'),
                props: true,
                ...authorizeMeta
            },
            {
                path: '/setting/:testId',
                name: 'AccessibilityTestSettings',
                component: () => import('@/views/admin/AccessibilitySettings.vue'),
                props: true,
                ...authorizeMeta
            },
            {
                path: '/config/:testId',
                name: 'AccessibilityConfig',
                component: () => import('@/views/admin/ManualAccessibility/AccessibilityConfig.vue'),
                props: true,
                ...authorizeMeta
            }
        ]
    }
];

export default manualAccessibilityRoutes;
