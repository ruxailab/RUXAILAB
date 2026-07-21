/**
 * Repair prompt: asks the model to fix an invalid study draft for ANY method.
 * Generic — driven by validation errors, not regex / language heuristics.
 */

/**
 * @param {{
 *   locale?: string,
 *   invalidDraft: object,
 *   errors: string[],
 *   userText: string,
 * }} params
 */
export function buildRepairSystemPrompt({ locale = 'en-US' } = {}) {
  const languageHint = locale?.startsWith('es')
    ? 'If you must ask clarification questions, write them in Spanish.'
      : 'If you must ask clarification questions, write them in English.'

  return `You are repairing an invalid RUXAILAB study draft JSON.

${languageHint}

RULES:
1. Return ONLY valid JSON matching the study draft schema. No markdown.
2. Keep the same testType unless the user clearly requested a different method.
3. Fix EVERY validation error listed.
4. Preserve titles/items the user already provided in their message.
5. Do NOT invent system fields (id, testAdmin, answersDocId, dates, cooperators).
6. If information is truly missing and cannot be inferred, set clarificationNeeded=true and ask short questions in clarificationQuestions.
7. When the draft can be completed from the user message, set clarificationNeeded=false and clarificationQuestions=[].

METHOD SHAPES:

CARD_SORTING:
- testStructure is an OBJECT with welcomeMessage, finalMessage, consent, preTest=[], postTest=[], cardSorting
- cardSorting.cards: [{ title, description }] (at least 1)
- cardSorting.categories: [{ title, description }]
- options.allow_create_categories true/false; hasScreenRecord / hasCamRecord / hasAudioRecord as requested

USER:
- subType: USER_MODERATED or USER_UNMODERATED
- testStructure OBJECT with userTasks: [{ taskName, taskDescription, ... }] (at least 1)

HEURISTIC:
- Put heuristics under testStructure.heuristics as an ARRAY of { id, title, questions: [{ id, title, descriptions, comparison }] }
- At least 1 heuristic with at least 1 question

FOCUS_GROUP:
- discussionGuide: [{ id, title, prompts[], durationMinutes }] (at least 1)
- config defaults allowed
- testStructure: []
`
}

/**
 * @param {{
 *   invalidDraft: object,
 *   errors: string[],
 *   userText: string,
 * }} params
 */
export function buildRepairUserMessage({ invalidDraft, errors, userText }) {
  return [
    'Original user request:',
    userText || '(empty)',
    '',
    'Invalid draft JSON:',
    JSON.stringify(invalidDraft, null, 2),
    '',
    'Validation errors to fix:',
    errors.map((err, index) => `${index + 1}. ${err}`).join('\n'),
    '',
    'Return the corrected complete study draft JSON now.',
  ].join('\n')
}
