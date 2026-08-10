import {
  normalizeStudyDraft,
  validateStudyDraft,
  buildClarificationFromErrors,
} from './validateDraft.js'
import {
  buildRepairSystemPrompt,
  buildRepairUserMessage,
} from './repairPrompt.js'

/**
 * Shared post-processing for any study method:
 * normalize → validate → (optional repair) → normalize → validate → clarification.
 *
 * @param {{
 *   parsed: object,
 *   locale: string,
 *   userText: string,
 *   repairFn: (args: {
 *     systemPrompt: string,
 *     messages: Array<{ role: string, text: string }>,
 *   }) => Promise<{ text: string, usage?: object }>,
 *   log?: (stage: string, context?: object) => void,
 * }} params
 */
export async function finalizeStudyDraft({
  parsed,
  locale,
  userText,
  repairFn,
}) {
  let draft = normalizeStudyDraft(parsed)
  let validation = validateStudyDraft(draft)
  const usageParts = []

  if (validation.valid) {
    return { draft, usageParts, repaired: false }
  }

  try {
    const repairResult = await repairFn({
      systemPrompt: buildRepairSystemPrompt({ locale }),
      messages: [
        {
          role: 'user',
          text: buildRepairUserMessage({
            invalidDraft: draft,
            errors: validation.errors,
            userText,
          }),
        },
      ],
    })

    if (repairResult?.usage) usageParts.push(repairResult.usage)

    let repairedParsed
    try {
      repairedParsed = JSON.parse(repairResult.text)
    } catch {
      return {
        draft: buildClarificationFromErrors(draft, validation.errors, locale),
        usageParts,
        repaired: true,
      }
    }

    draft = normalizeStudyDraft(repairedParsed)
    validation = validateStudyDraft(draft)

    if (validation.valid) {
      return { draft, usageParts, repaired: true }
    }

    return {
      draft: buildClarificationFromErrors(draft, validation.errors, locale),
      usageParts,
      repaired: true,
    }
  } catch (repairErr) {
    return {
      draft: buildClarificationFromErrors(draft, validation.errors, locale),
      usageParts,
      repaired: false,
      repairError: repairErr?.message,
    }
  }
}

function summarizeDraft(draft) {
  return {
    testType: draft?.testType || null,
    clarificationNeeded: draft?.clarificationNeeded,
    structureType:
      draft?.testStructure == null
        ? 'null'
        : Array.isArray(draft.testStructure)
          ? 'array'
          : typeof draft.testStructure,
    cardsCount: draft?.testStructure?.cardSorting?.cards?.length ?? 0,
    categoriesCount: draft?.testStructure?.cardSorting?.categories?.length ?? 0,
    tasksCount: draft?.testStructure?.userTasks?.length ?? 0,
    heuristicsCount: Array.isArray(draft?.testStructure)
      ? draft.testStructure.length
      : (draft?.testStructure?.heuristics?.length ?? 0),
    topicsCount: draft?.discussionGuide?.length ?? 0,
    preview: JSON.stringify(draft || {}).slice(0, 300),
  }
}

/**
 * @param {Array<object|undefined>} parts
 */
export function mergeUsage(parts = []) {
  const merged = { promptTokens: 0, candidatesTokens: 0 }
  let hasAny = false
  for (const part of parts) {
    if (!part) continue
    hasAny = true
    merged.promptTokens += part.promptTokens || 0
    merged.candidatesTokens += part.candidatesTokens || 0
  }
  return hasAny ? merged : undefined
}
