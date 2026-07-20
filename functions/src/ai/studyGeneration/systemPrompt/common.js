/**
 * Shared system-prompt fragments for the study-creation agent.
 */

/**
 * @param {string} [locale]
 * @returns {string}
 */
export function buildLanguageHint(locale = 'en-US') {
  if (locale?.startsWith('es')) {
    return 'Respond to clarification questions in Spanish.'
  }
  return 'Respond to clarification questions in English.'
}

/**
 * @param {string|null} [preferredMethod]
 * @returns {string}
 */
export function buildPreferredMethodHint(preferredMethod = null) {
  if (preferredMethod) {
    return `The user already selected preferredMethod=${preferredMethod}. Prefer this method unless the request clearly requires another.`
  }
  return 'Identify the method from the user request. If ambiguous, set clarificationNeeded=true.'
}

/**
 * @returns {string}
 */
export function buildCommonRules() {
  return `RULES:
1. Reply ONLY with JSON matching the response schema. No markdown, no prose outside JSON.
2. Fill ONLY the content block for the chosen testType.
3. Never invent a method when ambiguous — set clarificationNeeded=true and ask clear questions in clarificationQuestions.
4. Preserve titles and items the user listed (cards, categories, tasks, heuristics, topics).
5. Do NOT include system fields: id, testAdmin, answersDocId, creationDate, updateDate, cooperators, templateDoc.
6. When clarificationNeeded is true, still provide testType if reasonably guessed, use empty/minimal content, and ask questions.
7. When clarificationNeeded is false, produce a COMPLETE draft ready to persist — never omit testStructure / cardSorting / cards.
8. Use the exact testTitle the user asked for when they provide a name.`
}

/**
 * @returns {string}
 */
export function buildDefaults() {
  return `DEFAULTS:
- isPublic: false
- status: "active"
- testOptions: []`
}

/**
 * @param {{
 *   locale?: string,
 *   preferredMethod?: string|null,
 * }} [params]
 * @returns {string}
 */
export function buildCommonPreamble({
  locale = 'en-US',
  preferredMethod = null,
} = {}) {
  return `You are the RUXAILAB study creation agent.
You create UX research studies for a platform that supports multiple methods.

${buildPreferredMethodHint(preferredMethod)}
${buildLanguageHint(locale)}

${buildCommonRules()}`
}
