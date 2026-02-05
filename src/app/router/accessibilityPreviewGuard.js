/**
 * Accessibility preview route access decision (Issue 7).
 * Pure function: no store or side effects. Used by router guard and unit tests.
 *
 * @param {{ path: string, params?: { token?: string }, query?: { token?: string } }} to - route being navigated to
 * @returns {'allow'|'redirect'|null} - 'allow' when token present, 'redirect' when preview path but no token, null when not a preview path
 */
export function getAccessibilityPreviewAccess(to) {
  const isAccessibilityPreview =
    to.path.includes('/accessibility/') && to.path.includes('/preview/')
  if (!isAccessibilityPreview) return null
  const hasToken = !!(to.params?.token || to.query?.token)
  return hasToken ? 'allow' : 'redirect'
}
