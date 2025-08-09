/**
 * Global Navigation Items
 * Items de navegación globales y utilidades
 */

/**
 * Items de navegación globales que aparecen en la toolbar
 */
export const globalToolbarItems = {
    // Rutas que muestran "Go to Console"
    homeRoutes: ['/'],

    // Rutas que muestran "Go Home"
    consoleRoutes: ['/testslist', '/signin', '/signup'],

    // Rutas que muestran "Return to Console"
    otherRoutes: [], // Se calcula dinámicamente
};

/**
 * Contextos de navegación para determinar qué menú mostrar en móvil
 */
export const navigationContexts = {
    DASHBOARD: 'dashboard',
    TEST: 'test',
    GLOBAL: 'global'
};

/**
 * Determina el contexto de navegación basado en la ruta actual
 * @param {string} routePath - Ruta actual
 * @returns {string} Contexto de navegación
 */
export const getNavigationContext = (routePath) => {
    if (routePath.includes('/testslist') || routePath.includes('/dashboard')) {
        return navigationContexts.DASHBOARD;
    }

    if (routePath.includes('/managerview') ||
        routePath.includes('/edittest') ||
        routePath.includes('/testview') ||
        routePath.includes('/reportview') ||
        routePath.includes('/answerview') ||
        routePath.includes('/finalreportview') ||
        routePath.includes('/cooperators') ||
        routePath.includes('/templateview')) {
        return navigationContexts.TEST;
    }

    return navigationContexts.GLOBAL;
};
