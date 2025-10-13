/**
 * Utility to get the current authenticated user
 * This ensures we always have user data by checking multiple sources
 */

import { getAuth } from 'firebase/auth';
import UserController from '@/features/auth/controllers/UserController';

const userController = new UserController();

/**
 * Get current user with fallback logic
 * 1. Try to get from Vuex store
 * 2. If not in store, get Firebase user and fetch from database
 * 3. Update store with fetched user
 * 4. Return user object with at minimum: id and email
 * 
 * @param {Object} store - Vuex store instance
 * @returns {Promise<Object|null>} User object or null
 */
export const getCurrentUser = async (store) => {
    // Get Firebase user first (always available if authenticated)
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
        console.log('getCurrentUser - No Firebase user authenticated');
        return null;
    }

    console.log('getCurrentUser - Firebase user UID:', firebaseUser.uid);

    // Try to get user from store
    let currentUser = store.state.Auth.user;

    // If not in store or incomplete, fetch from database
    if (!currentUser || !currentUser.id) {
        console.log('getCurrentUser - User not in store, fetching from database...');

        try {
            currentUser = await userController.getById(firebaseUser.uid);
            console.log('getCurrentUser - User fetched from database:', currentUser);

            // Update store with user data
            if (currentUser) {
                store.commit('SET_USER', currentUser);
            }
        } catch (error) {
            console.error('getCurrentUser - Error fetching user from database:', error);

            // Use Firebase user as fallback with minimum required fields
            currentUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
            };

            console.log('getCurrentUser - Using Firebase user as fallback:', currentUser);
        }
    } else {
        console.log('getCurrentUser - User from store:', currentUser);
    }

    return currentUser;
};

/**
 * Get current user synchronously (only from store or Firebase)
 * Use this when you can't use async/await
 * 
 * @param {Object} store - Vuex store instance
 * @returns {Object|null} User object or null
 */
export const getCurrentUserSync = (store) => {
    // Try store first
    let currentUser = store.state.Auth.user;

    if (currentUser && currentUser.id) {
        return currentUser;
    }

    // Fallback to Firebase user (synchronous)
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
        return null;
    }

    // Return minimal user object from Firebase
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
    };
};
