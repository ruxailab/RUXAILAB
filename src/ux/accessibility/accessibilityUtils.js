const authorizeMeta = { meta: { authorize: [1] } };

const createAccessibilityRoutes = (basePath, managerComponent, childRoutes) => [
    {
        path: `${basePath}/:testId`,
        name: `${basePath}Accessibility`,
        component: managerComponent,
        ...authorizeMeta,
        props: true,
        children: childRoutes.map(route => ({
            ...route,
            ...authorizeMeta,
            // Convert absolute paths to relative paths for children
            path: route.path.replace(`${basePath}/`, ''),
            // For child routes, pass the :id parameter as props
            props: route.path.includes(':id') ? true : false
        }))
    }
];

export { authorizeMeta, createAccessibilityRoutes };
