export default [
    {
        path: '/accessibility/automatic/:testId',
        name: 'AutomatedAccessibility',
        component: () => import('@/views/admin/AutomatedAccessibilityManager.vue'),
        meta: { authorize: [1] },
        props: true,
        children: [
            {
                path: '',
                name: 'AutomatedAccessibilityHome',
                component: () => import('@/views/admin/AutomatedAccessibility/AutomatedAccessibilityHome.vue'),
                meta: { authorize: [1] }
            },
            {
                path: '/analyse/:testId',
                name: 'Analyse',
                component: () => import('@/views/admin/AutomatedAccessibility/EditTest.vue'),
                meta: { authorize: [1] }
            },
            {
                path: '/answers/:testId',
                name: 'AccessibilityAnswers',
                component: () => import('@/views/admin/AutomatedAccessibility/Answers.vue'),
                meta: { authorize: [1] }
            },
            {
                path: '/report/:testId',
                name: 'AccessibilityReport',
                component: () => import('@/views/admin/AutomatedAccessibility/Report.vue'),
                meta: { authorize: [1] }
            },
            {
                path: '/cooperation/:testId',
                name: 'AccessibilityCooperation',
                component: () => import('@/views/admin/AutomatedAccessibility/Cooperation.vue'),
                meta: { authorize: [1] }
            },
            {
                path: '/settings/:testId',
                name: 'AccessibilitySettings',
                component: () => import('@/views/admin/AutomatedAccessibility/Settings.vue'),
                meta: { authorize: [1] }
            }
        ]
    },
];
