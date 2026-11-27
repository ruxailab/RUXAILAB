/**
 * Refinement fragment: the user is editing an existing, complete draft.
 */

import { SECTION_KEYS } from '../refinement/draftSections.js'

/**
 * @param {object} currentDraft
 * @returns {string}
 */
export function buildRefinementSection(currentDraft) {
  return `REFINEMENT MODE:
The user already has the complete study draft below. Their latest message asks for a change to it.

CURRENT DRAFT:
${JSON.stringify(currentDraft, null, 2)}

REFINEMENT RULES:
1. Apply ONLY the change requested in the latest user message. Keep every other field and item exactly as it is in CURRENT DRAFT, including titles, texts and item order.
2. Return the COMPLETE updated draft in the same schema, not only the changed part.
3. Keep testType and subType unless the user explicitly asks to switch the method or study type.
4. List every section you changed in changedSections. Allowed section names: ${SECTION_KEYS.join(', ')}.
5. For list sections (cards, categories, userTasks, heuristics, discussionGuide), put the titles of the items you removed in "removed". Renaming an item counts as removing the old title. Set "reordered": true only when the user asked to reorder the items.
6. If the request is ambiguous, set clarificationNeeded=true and ask about it, without changing the draft.
7. When the change is applied, set clarificationNeeded=false.`
}
