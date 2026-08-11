/**
 * Validates Focus Group draft content.
 * @param {object} draft
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFocusGroupDraft(draft) {
  const errors = []
  const guide = draft?.discussionGuide

  if (!Array.isArray(guide) || guide.length < 1) {
    errors.push('discussionGuide must have at least 1 topic')
    return { valid: false, errors }
  }

  guide.forEach((topic, index) => {
    if (!topic?.title || String(topic.title).trim() === '') {
      errors.push(`discussionGuide[${index}].title is required`)
    }
  })

  return { valid: errors.length === 0, errors }
}
