import { normalizeStudyDraft, validateStudyDraft } from '../validateDraft.js'
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
  // The title can be cleared by hand in the preview; the merge fills it in.
  const validation = validateStudyDraft({
    ...draft,
    testTitle: draft.testTitle || 'untitled',
  })
  if (!validation.valid) {
    throw new InvalidCurrentDraftError(
      `currentDraft is invalid: ${validation.errors.join('; ')}`,
    )
  }
  return draft
}

/**
 * Reads the model's changedSections. Without it, only adds and edits to list
 * sections are applied, since a rewritten value section can't be trusted.
 *
 * @param {unknown} changedSections
 * @param {string} testType
 * @returns {Map<string, { removed: string[], reordered: boolean, inferred: boolean }>}
 */
export function readChangedSections(changedSections, testType) {
  if (!Array.isArray(changedSections)) {
    return new Map(
      sectionsForType(testType)
        .filter((section) => section.kind === 'list')
        .map((section) => [
          section.key,
          { removed: [], reordered: false, inferred: true },
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
      inferred: false,
    })
  })
  return declared
}

/**
 * Gives new items a fresh id when theirs is already used by another item,
 * so merged heuristics and discussion topics never share an id.
 *
 * @param {Array<object>} items
 * @param {Set<object>} newItems
 * @returns {Array<object>}
 */
function withUniqueIds(items, newItems) {
  const used = new Set(
    items.filter((item) => !newItems.has(item)).map((item) => item?.id),
  )
  let nextNumber =
    Math.max(-1, ...items.map((item) => item?.id).filter(Number.isInteger)) + 1

  return items.map((item) => {
    if (!newItems.has(item) || item?.id === undefined) return item
    let id = item.id
    for (let suffix = 2; used.has(id); suffix += 1) {
      id = Number.isInteger(item.id) ? nextNumber++ : `${item.id}-${suffix}`
    }
    used.add(id)
    return id === item.id ? item : { ...item, id }
  })
}

/**
 * Merges a refined list into the current one:
 * - items missing from the refined list come back unless declared removed;
 * - without reordered, existing items keep their original order and each new
 *   item stays right after the existing item it followed in the refined list;
 * - new items never reuse the id of another item.
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
  const newItems = new Set(
    afterItems
      .filter((entry) => !beforeKeys.has(entry.key))
      .map((entry) => entry.item),
  )

  if (reordered) {
    const restored = beforeItems.filter(
      (entry) => !afterByKey.has(entry.key) && !isDropped(entry),
    )
    return withUniqueIds(
      [...afterItems, ...restored].map((entry) => entry.item),
      newItems,
    )
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
  return withUniqueIds(merged, newItems)
}

function mergeSection(section, current, refined, change) {
  const after = readSection(refined, section)
  if (section.kind !== 'list') {
    const before = readSection(current, section)
    return Array.isArray(after) && section.paths.length > 1
      ? after.map((value, index) => value ?? before[index])
      : (after ?? before)
  }
  // A declared list sent back empty means "remove all" (e.g. an open card sort).
  if (!change.inferred && Array.isArray(after) && after.length === 0) {
    return []
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
 * Fills a title cleared by hand with the model's title.
 * @param {object} merged
 * @param {object} refinedDraft
 * @returns {object}
 */
function withTitle(merged, refinedDraft) {
  if (String(merged.testTitle ?? '').trim()) return merged
  return { ...merged, testTitle: refinedDraft.testTitle ?? '' }
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
    return withTitle(merged, refinedDraft)
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
  return withTitle(merged, refinedDraft)
}

/**
 * Merges a model reply into the current draft before validation. A
 * clarification reply keeps the current draft and only carries the message.
 *
 * @param {{
 *   currentDraft: object,
 *   reply: object,
 *   changedSections: unknown,
 * }} params
 * @returns {object}
 */
export function mergeRefinementReply({ currentDraft, reply, changedSections }) {
  const merged = reply.clarificationNeeded
    ? structuredClone(currentDraft)
    : mergeRefinedDraft({ currentDraft, refinedDraft: reply, changedSections })

  return {
    ...merged,
    clarificationNeeded: reply.clarificationNeeded,
    clarificationQuestions: reply.clarificationQuestions,
  }
}

/**
 * @param {object} currentDraft
 * @param {object} draft
 * @returns {Array<object>}
 */
export function listRefinementChanges(currentDraft, draft) {
  return draft.clarificationNeeded ? [] : diffStudyDrafts(currentDraft, draft)
}
