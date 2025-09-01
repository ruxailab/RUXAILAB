const authorizeMeta = { meta: { authorize: [1] } };

const createAccessibilityRoutes = (basePath, managerComponent, childRoutes) => [
    {
        path: `${basePath}/:testId`,
        name: `${basePath}Accessibility`,
        component: managerComponent,
        ...authorizeMeta,
        props: true,
        children: childRoutes.map(route => ({ ...route, ...authorizeMeta, props: true }))
    }
];

export { authorizeMeta, createAccessibilityRoutes };
