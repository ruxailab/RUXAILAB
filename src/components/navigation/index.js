/**
 * Navigation Components Index
 * Exporta todos los componentes de navegación
 */

// Componentes principales
export { default as GlobalToolbar } from './GlobalToolbar.vue';
export { default as UserMenu } from './UserMenu.vue';
export { default as DashboardSidebar } from './DashboardSidebar.vue';
export { default as TestNavigationDrawer } from './TestNavigationDrawer.vue';
export { default as MobileNavigationDrawer } from './MobileNavigationDrawer.vue';

// Re-exportar configuraciones de navegación para conveniencia
export {
    dashboardNavigationItems,
    testNavigationItems,
    globalNavigationItems,
    getFilteredTestItems,
    getUserInitials,
    getAccessLevelText
} from '@/navigation';
