/**
 * Default document mappers used by Firestore repositories when none are provided.
 */

/**
 * @template T
 * @param {object} data
 * @param {string} id
 * @returns {{ id: string } & object}
 */
export const identityFromFirestore = (data, id) => ({ id, ...data })

/**
 * @template T
 * @param {T} item
 * @returns {object}
 */
export const identityToFirestore = (item) => {
  if (item == null || typeof item !== 'object') return item
  const { id: _id, ...rest } = item
  return rest
}
