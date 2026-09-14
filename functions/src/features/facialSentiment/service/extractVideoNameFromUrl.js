/**
 * Extract a Firebase Storage object path from a download URL.
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function extractVideoNameFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const path = url.split('/o/')[1].split('?')[0]
    return decodeURIComponent(path)
  } catch {
    return null
  }
}
