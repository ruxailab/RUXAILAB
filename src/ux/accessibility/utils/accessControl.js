/**
 * Simple access control utility for accessibility tests
 * 
 * Access Rules:
 * - testAdmin: Full access to all pages
 * - cooperator with accessLevel 0: Full access to all pages
 * - cooperator with accessLevel 1 or 2: Only home and preview pages
 * - others: Only preview page
 */

/**
 * Check if user has admin access (full access to all pages)
 * @param {Object} currentUser - The current user object with id
 * @param {Object} studyData - The study/test data object
 * @returns {boolean} - True if user is admin or cooperator with accessLevel 0
 */
export const hasAdminAccess = (currentUser, studyData) => {
    if (!currentUser || !studyData) {
        return false;
    }

    // Try multiple possible user ID fields (id, uid, userDocId)
    const currentUserId = currentUser.id || currentUser.uid || currentUser.userDocId;

    // Check if user is the test admin
    if (studyData.testAdmin?.userDocId === currentUserId) {
        return true;
    }

    // Check if user is cooperator with accessLevel 0
    const cooperator = studyData.cooperators?.find(coop => coop.userDocId === currentUserId);

    if (cooperator && cooperator.accessLevel === 0) {
        return true;
    }

    return false;
};

/**
 * Check if user has at least cooperator access (home + preview)
 * @param {Object} currentUser - The current user object with id
 * @param {Object} studyData - The study/test data object
 * @returns {boolean} - True if user is admin or any cooperator
 */
export const hasCooperatorAccess = (currentUser, studyData) => {
    if (!currentUser || !studyData) return false;

    // Admins have cooperator access too
    if (hasAdminAccess(currentUser, studyData)) {
        return true;
    }

    // Try multiple possible user ID fields
    const currentUserId = currentUser.id || currentUser.uid || currentUser.userDocId;

    // Check if user is any cooperator (accessLevel 1 or 2)
    const cooperator = studyData.cooperators?.find(coop => coop.userDocId === currentUserId);
    if (cooperator && (cooperator.accessLevel === 1 || cooperator.accessLevel === 2)) {
        return true;
    }

    return false;
};

/**
 * Get user role based on their access level
 * @param {Object} currentUser - The current user object with id
 * @param {Object} studyData - The study/test data object
 * @returns {string} - 'admin', 'cooperator', or 'user'
 */
export const getUserRole = (currentUser, studyData) => {
    if (hasAdminAccess(currentUser, studyData)) {
        return 'admin';
    }
    if (hasCooperatorAccess(currentUser, studyData)) {
        return 'cooperator';
    }
    return 'user';
};
