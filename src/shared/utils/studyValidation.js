/**
 * Validates if a user can access a study.
 * @param {Object} study - The study object from Firestore
 * @param {String} token - The token from the URL (not needed in case of Public Test)
 * @returns {Boolean} - True if access is allowed, false otherwise
 */


export default function validateStudyAccess(study, token) {
    if (study.isPublic) return true;

    if (!token) return false;

    const isTokenValid = study.cooperators?.some(c => c.token === token);
    return !!isTokenValid;
}