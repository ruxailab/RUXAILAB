/**
 * Navigation guard for accessibility routes
 * Checks if user has permission to access specific accessibility pages
 */

import store from '@/store';
import { hasAdminAccess } from '@/ux/accessibility/utils/accessControl';
import { getCurrentUser } from '@/ux/accessibility/utils/getCurrentUser';

/**
 * Check if a route requires admin access
 * Admin-only routes: config, result, cooperative, setting, analyse, settings, cooperation
 * Evaluator access: answers (allow evaluators to view answers)
 * Public routes: home, preview, reports
 */
const isAdminOnlyRoute = (path) => {
    const adminOnlyPatterns = [
        '/config/',
        '/result/',
        '/cooperative/',
        '/setting/',
        '/analyse/',
        '/settings/',
        '/cooperation/'
    ];

    return adminOnlyPatterns.some(pattern => path.includes(pattern));
};

/**
 * Navigation guard for accessibility routes
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Router next function
 */
export const accessibilityGuard = async (to, from, next) => {
    // Allow preview routes (they can be public with token)
    if (to.path.includes('/preview/')) {
        return next();
    }

    // Allow home/manager base route for authenticated users (both admin and cooperators)
    // The home page will filter content based on user role
    const isBaseManagerRoute = to.path.match(/\/accessibility\/(manual|automatic)(\/manager)?\/[^\/]+$/);
    if (isBaseManagerRoute) {
        return next();
    }

    // For admin-only routes, check access
    if (isAdminOnlyRoute(to.path)) {
        // Use centralized getCurrentUser utility
        const currentUser = await getCurrentUser(store);

        if (!currentUser) {
            return next('/signin');
        }

        // Extract test ID from route
        const testId = to.params.id;

        if (!testId) {
            return next('/admin');
        }

        // Get test data
        let studyData = null;
        try {
            await store.dispatch('getStudy', { id: testId });
            studyData = store.getters.test ?? store.state.Tests?.Test ?? null;
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('[accessibilityGuard] Failed to fetch study data:', error.message)
            }
        }

        if (!studyData) {
            return next('/admin');
        }

        // Check if user has admin access
        if (!hasAdminAccess(currentUser, studyData)) {


            let redirectPath;
            if (to.path.includes('/manual/')) {
                redirectPath = `/accessibility/manual/manager/${testId}`;
            } else if (to.path.includes('/aiassisted/')) {
                redirectPath = `/accessibility/aiassisted/manager/${testId}`;
            } else {
                redirectPath = `/accessibility/automatic/manager/${testId}`;
            }

            return next(redirectPath);
        }

        // User has admin access, allow
        return next();
    }

    // Default: allow access
    next();
};
