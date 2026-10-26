/**
 * System prompt for the RUXAILAB study-creation agent.
 * Composes shared rules with method-specific fragments.
 */

import { buildCommonPreamble, buildDefaults } from './common.js'
import { METHOD_KEY as CARD_SORTING, buildCardSortingPrompt } from './cardSorting.js'
import { METHOD_KEY as USER, buildUserPrompt } from './user.js'
import { METHOD_KEY as HEURISTIC, buildHeuristicPrompt } from './heuristic.js'
import { METHOD_KEY as FOCUS_GROUP, buildFocusGroupPrompt } from './focusGroup.js'

/** @type {Record<string, () => string>} */
const METHOD_PROMPTS = {
  [CARD_SORTING]: buildCardSortingPrompt,
  [USER]: buildUserPrompt,
  [HEURISTIC]: buildHeuristicPrompt,
  [FOCUS_GROUP]: buildFocusGroupPrompt,
}

/**
 * @param {string|null} [preferredMethod]
 * @returns {string}
 */
function buildSupportedMethodsSection(preferredMethod = null) {
  const builders =
    preferredMethod && METHOD_PROMPTS[preferredMethod]
      ? [METHOD_PROMPTS[preferredMethod]]
      : Object.values(METHOD_PROMPTS)

  return `SUPPORTED METHODS (v1):

${builders.map((build) => build()).join('\n\n')}`
}

/**
 * @param {{
 *   locale?: string,
 *   preferredMethod?: string|null,
 * }} [params]
 * @returns {string}
 */
export function buildSystemPrompt({
  locale = 'en-US',
  preferredMethod = null,
} = {}) {
  return `${buildCommonPreamble({ locale, preferredMethod })}

${buildSupportedMethodsSection(preferredMethod)}

${buildDefaults()}
`
}

export {
  CARD_SORTING,
  USER,
  HEURISTIC,
  FOCUS_GROUP,
  METHOD_PROMPTS,
}
