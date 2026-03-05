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
            console.log('Guard - No user data available, redirecting to signin');
            return next('/signin');
        }

        // Extract test ID from route
        const testId = to.params.id;

        if (!testId) {
            console.log('No test ID found');
            return next('/admin');
        }

        // Get test data
        let studyData = null;
        try {
            await store.dispatch('getStudy', { id: testId });

            if (store.getters.test) {
                studyData = store.getters.test;
            } else if (store.state.Study?.Test) {
                studyData = store.state.Study.Test;
            } else if (store.state.Test) {
                studyData = store.state.Test;
            }
        } catch (error) {
            console.error('Error fetching study data:', error);
        }

        if (!studyData) {
            console.log('No study data found');
            return next('/admin');
        }

        // Check if user has admin access
        if (!hasAdminAccess(currentUser, studyData)) {
            console.log('User does not have admin access, redirecting to home');


            let redirectPath;
            if (to.path.includes('/manual/')) {
                redirectPath = `/accessibility/manual/${testId}`;
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
