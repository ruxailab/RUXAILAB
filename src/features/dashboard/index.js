/**
 * Navigation Module
 * Exportaciones centralizadas para todos los items de navegación
 */

// Dashboard items
export {
    dashboardNavigationItems
} from './dashboardItems.js';

// Test items
export {
    generateTestNavigationItems,
    calculateAccessLevel
} from './testItems.js';

// Global items
export {
    globalToolbarItems,
    navigationContexts,
    getNavigationContext
} from '@/features/navigation/globalItems.js';
