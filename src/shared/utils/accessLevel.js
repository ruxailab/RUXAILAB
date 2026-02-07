export const ACCESS_LEVEL = {
  ADMIN: 0,
  EVALUATOR: 1,
  GUEST: 2,
  OBSERVATOR: 3,
}

/**
 * Calculate user's access level for a test/study
 * @param {Object} currentUser - The current user object
 * @param {Object} currentTest - The current test/study object
 * @returns {number} The access level constant
 */
export const calculateAccessLevel = (currentUser, currentTest) => {
  if (!currentUser) return ACCESS_LEVEL.GUEST
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest?.testAdmin?.userDocId === currentUser.id)
    return ACCESS_LEVEL.ADMIN

  const coop = currentTest?.cooperators?.find(
    (c) => c.userDocId === currentUser.id,
  )
  if (coop) return coop.accessLevel

  return currentTest?.isPublic ? ACCESS_LEVEL.EVALUATOR : ACCESS_LEVEL.GUEST
}
