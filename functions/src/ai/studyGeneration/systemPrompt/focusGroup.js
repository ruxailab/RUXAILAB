/**
 * FOCUS_GROUP method prompt fragment.
 */

export const METHOD_KEY = 'FOCUS_GROUP'

/**
 * @returns {string}
 */
export function buildFocusGroupPrompt() {
  return `FOCUS_GROUP:
- subType: null
- discussionGuide: [{ id, title, prompts[], durationMinutes }]
- config: { enableWaitingRoom, requireConsent, hideObservers, maxParticipants }
- testStructure: []`
}
