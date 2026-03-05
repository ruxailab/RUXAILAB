/**
 * Utility to get the current authenticated user
 * This ensures we always have user data by checking multiple sources
 */

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import UserController from '@/features/auth/controllers/UserController';

const userController = new UserController();

/**
 * Environment-gated logger — only emits in non-production builds.
 * Never logs PII (UIDs, emails, user objects).
 */
const debugLog = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...args);
    }
};

/**
 * Wait for Firebase Auth to be ready
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns {Promise<User|null>} Firebase user or null
 */
const waitForAuthReady = (timeout = 5000) => {
    return new Promise((resolve) => {
        const auth = getAuth();

        // If user is already available, resolve immediately
        if (auth.currentUser) {
            debugLog('getCurrentUser - Auth already ready, user authenticated');
            resolve(auth.currentUser);
            return;
        }

        // Set up timeout
        const timeoutId = setTimeout(() => {
            debugLog('getCurrentUser - Auth wait timeout, no user available');
            unsubscribe();
            resolve(null);
        }, timeout);

        // Wait for auth state to change
        debugLog('getCurrentUser - Waiting for auth state...');
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            debugLog('getCurrentUser - Auth state changed, user:', user ? 'authenticated' : 'none');
            clearTimeout(timeoutId);
            unsubscribe();
            resolve(user);
        });
    });
};

/**
 * Get current user with fallback logic
 * 1. Wait for Firebase Auth to be ready
 * 2. Try to get from Vuex store
 * 3. If not in store, get Firebase user and fetch from database
 * 4. Update store with fetched user
 * 5. Return user object with at minimum: id and email
 * 
 * @param {Object} store - Vuex store instance
 * @returns {Promise<Object|null>} User object or null
 */
export const getCurrentUser = async (store) => {
    // Wait for Firebase Auth to be ready
    const firebaseUser = await waitForAuthReady();

    if (!firebaseUser) {
        debugLog('getCurrentUser - No Firebase user authenticated');
        return null;
    }

    debugLog('getCurrentUser - Firebase user authenticated');    // Try to get user from store
    let currentUser = store.state.Auth.user;

    // If not in store or incomplete, fetch from database
    if (!currentUser || !currentUser.id) {
        debugLog('getCurrentUser - User not in store, fetching from database...');

        try {
            currentUser = await userController.getById(firebaseUser.uid);
            debugLog('getCurrentUser - User fetched from database successfully');

            // Update store with user data
            if (currentUser) {
                store.commit('SET_USER', currentUser);
            }
        } catch (error) {
            console.error('getCurrentUser - Error fetching user from database:', error.message);

            // Use Firebase user as fallback with minimum required fields
            currentUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
            };

            debugLog('getCurrentUser - Using Firebase user as fallback');
        }
    } else {
        debugLog('getCurrentUser - User resolved from store');
    }

    return currentUser;
};

/**
 * Get current user synchronously (only from store or Firebase)
 * Use this when you can't use async/await
 * Note: May return null if auth state hasn't been established yet
 * 
 * @param {Object} store - Vuex store instance
 * @returns {Object|null} User object or null
 */
export const getCurrentUserSync = (store) => {
    // Try store first
    let currentUser = store.state.Auth.user;

    if (currentUser && currentUser.id) {
        debugLog('getCurrentUserSync - User resolved from store');
        return currentUser;
    }

    // Fallback to Firebase user (synchronous)
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
        debugLog('getCurrentUserSync - No user available (auth may not be ready yet)');
        return null;
    }

    debugLog('getCurrentUserSync - Using Firebase user (auth ready)');

    // Return minimal user object from Firebase
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
    };
};