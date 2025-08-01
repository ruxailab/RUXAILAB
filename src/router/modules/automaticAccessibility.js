const authorizeMeta = { meta: { authorize: [1] } };

const automatedAccessibilityRoutes = [
    {
        path: '/accessibility/automatic/:testId',
        name: 'AutomatedAccessibility',
        component: () => import('@/views/admin/AutomatedAccessibilityManager.vue'),
        ...authorizeMeta,
        props: true,
        children: [
            {
                path: '',
                name: 'AutomatedAccessibilityHome',
                component: () => import('@/views/admin/AutomatedAccessibility/AutomatedAccessibilityHome.vue'),
                ...authorizeMeta
            },
            {
                path: '/analyse/:testId',
                name: 'Analyse',
                component: () => import('@/views/admin/AutomatedAccessibility/EditTest.vue'),
                ...authorizeMeta
            },
            {
                path: '/answers/:testId',
                name: 'AccessibilityAnswers',
                component: () => import('@/views/admin/AutomatedAccessibility/Answers.vue'),
                ...authorizeMeta
            },
            {
                path: '/report/:testId',
                name: 'AccessibilityReport',
                component: () => import('@/views/admin/AutomatedAccessibility/Report.vue'),
                ...authorizeMeta
            },
            {
                path: '/cooperation/:testId',
                name: 'AccessibilityCooperation',
                component: () => import('@/views/admin/AutomatedAccessibility/Cooperation.vue'),
                ...authorizeMeta
            },
            {
                path: '/settings/:testId',
                name: 'AccessibilitySettings',
                component: () => import('@/views/admin/AutomatedAccessibility/Settings.vue'),
                ...authorizeMeta
            }
        ]
    }
];

export default automatedAccessibilityRoutes;
