import {
  buildClarificationFromErrors,
  normalizeStudyDraft,
  validateStudyDraft,
} from '../validateDraft.js'
import { diffStudyDrafts } from './diffDrafts.js'
import {
  SECTION_KEYS,
  TYPE_SECTION,
  commonSections,
  keyItems,
  normalizeItemTitle,
  readSection,
  sectionsForType,
  writeSection,
} from './draftSections.js'

export const MAX_CURRENT_DRAFT_CHARS = 60_000

const DRAFT_FIELDS = [
  'testType',
  'subType',
  'testTitle',
  'testDescription',
  'isPublic',
  'status',
  'testOptions',
  'testStructure',
  'discussionGuide',
  'config',
  'useWeights',
  'useSeverity',
  'useFrequency',
  'trackTime',
  'testWeights',
]

export class InvalidCurrentDraftError extends Error {}

/**
 * Keeps only known draft fields, caps the size and checks the draft is a
 * complete, valid study. Returns null when no draft was sent.
 *
 * @param {unknown} raw
 * @returns {object|null}
 */
export function sanitizeCurrentDraft(raw) {
  if (raw == null) return null
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new InvalidCurrentDraftError('currentDraft must be an object')
  }

  const picked = Object.fromEntries(
    DRAFT_FIELDS.filter((field) => raw[field] !== undefined).map((field) => [
      field,
      raw[field],
    ]),
  )

  if (JSON.stringify(picked).length > MAX_CURRENT_DRAFT_CHARS) {
    throw new InvalidCurrentDraftError('currentDraft is too large')
  }

  const draft = normalizeStudyDraft(
    structuredClone({
      ...picked,
      clarificationNeeded: false,
      clarificationQuestions: [],
    }),
  )
  const validation = validateStudyDraft(draft)
  if (!validation.valid) {
    throw new InvalidCurrentDraftError(
      `currentDraft is invalid: ${validation.errors.join('; ')}`,
    )
  }
  return draft
}

/**
 * Reads the model's changedSections declaration. When the model omitted it,
 * every section counts as changed, but list items may not be removed or
 * reordered.
 *
 * @param {unknown} changedSections
 * @param {string} testType
 * @returns {Map<string, { removed: string[], reordered: boolean }>}
 */
export function readChangedSections(changedSections, testType) {
  if (!Array.isArray(changedSections)) {
    return new Map(
      sectionsForType(testType).map((section) => [
        section.key,
        { removed: [], reordered: false },
      ]),
    )
  }

  const declared = new Map()
  changedSections.forEach((entry) => {
    const change = typeof entry === 'string' ? { section: entry } : entry
    if (!SECTION_KEYS.includes(change?.section)) return
    declared.set(change.section, {
      removed: Array.isArray(change.removed) ? change.removed : [],
      reordered: change.reordered === true,
    })
  })
  return declared
}

/**
 * Merges a refined list into the current one:
 * - items missing from the refined list come back unless declared removed;
 * - without reordered, existing items keep their original order and each new
 *   item stays right after the existing item it followed in the refined list.
 *
 * @param {{
 *   before: Array<object>,
 *   after: Array<object>,
 *   itemKey: string,
 *   removed: string[],
 *   reordered: boolean,
 * }} params
 * @returns {Array<object>}
 */
export function mergeListItems({ before, after, itemKey, removed, reordered }) {
  const removedTitles = new Set(removed.map(normalizeItemTitle))
  const beforeItems = keyItems(before, itemKey)
  const afterItems = keyItems(after, itemKey)
  const afterByKey = new Map(afterItems.map((entry) => [entry.key, entry]))
  const beforeKeys = new Set(beforeItems.map((entry) => entry.key))
  const isDropped = ({ key, title }) =>
    !afterByKey.has(key) && removedTitles.has(normalizeItemTitle(title))

  if (reordered) {
    const restored = beforeItems.filter(
      (entry) => !afterByKey.has(entry.key) && !isDropped(entry),
    )
    return [...afterItems, ...restored].map((entry) => entry.item)
  }

  const followers = new Map()
  let anchor = null
  afterItems.forEach((entry) => {
    if (beforeKeys.has(entry.key)) {
      anchor = entry.key
      return
    }
    followers.set(anchor, [...(followers.get(anchor) || []), entry.item])
  })

  const merged = [...(followers.get(null) || [])]
  beforeItems.forEach((entry) => {
    if (isDropped(entry)) return
    merged.push(afterByKey.get(entry.key)?.item ?? entry.item)
    merged.push(...(followers.get(entry.key) || []))
  })
  return merged
}

function mergeSection(section, current, refined, change) {
  const after = readSection(refined, section)
  if (section.kind !== 'list') {
    const before = readSection(current, section)
    return Array.isArray(after) && section.paths.length > 1
      ? after.map((value, index) => value ?? before[index])
      : (after ?? before)
  }
  return mergeListItems({
    before: readSection(current, section),
    after,
    itemKey: section.itemKey,
    removed: change.removed,
    reordered: change.reordered,
  })
}

function copySections(target, source, sections) {
  sections.forEach((section) =>
    writeSection(
      target,
      section,
      structuredClone(readSection(source, section)),
    ),
  )
}

/**
 * Applies only the declared sections of the refined draft on top of the
 * current draft, so every other field stays identical.
 *
 * @param {{
 *   currentDraft: object,
 *   refinedDraft: object,
 *   changedSections: unknown,
 * }} params
 * @returns {object}
 */
export function mergeRefinedDraft({
  currentDraft,
  refinedDraft,
  changedSections,
}) {
  const declared = readChangedSections(changedSections, currentDraft.testType)
  const switchesMethod =
    refinedDraft.testType !== currentDraft.testType &&
    declared.has(TYPE_SECTION.key)

  if (switchesMethod) {
    const merged = structuredClone(refinedDraft)
    copySections(
      merged,
      currentDraft,
      commonSections().filter((section) => !declared.has(section.key)),
    )
    return merged
  }

  const merged = structuredClone(currentDraft)
  sectionsForType(currentDraft.testType)
    .filter((section) => declared.has(section.key))
    .forEach((section) =>
      writeSection(
        merged,
        section,
        structuredClone(
          mergeSection(
            section,
            currentDraft,
            refinedDraft,
            declared.get(section.key),
          ),
        ),
      ),
    )
  return merged
}

/**
 * Turns the finalized model draft into the refined draft returned to the
 * client, plus the list of changes. Clarification drafts are returned as-is
 * so the client keeps its current draft.
 *
 * @param {{
 *   currentDraft: object,
 *   draft: object,
 *   changedSections: unknown,
 *   locale?: string,
 * }} params
 * @returns {{ draft: object, changes: Array<object> }}
 */
export function applyRefinement({
  currentDraft,
  draft,
  changedSections,
  locale,
}) {
  if (draft.clarificationNeeded) return { draft, changes: [] }

  const merged = mergeRefinedDraft({
    currentDraft,
    refinedDraft: draft,
    changedSections,
  })
  const validation = validateStudyDraft(merged)
  if (!validation.valid) {
    return {
      draft: buildClarificationFromErrors(merged, validation.errors, locale),
      changes: [],
    }
  }
  return {
    draft: { ...merged, clarificationQuestions: draft.clarificationQuestions },
    changes: diffStudyDrafts(currentDraft, merged),
  }
}
