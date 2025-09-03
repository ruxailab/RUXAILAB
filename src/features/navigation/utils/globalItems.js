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
  consoleRoutes: ['/admin', '/signin', '/signup'],

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
