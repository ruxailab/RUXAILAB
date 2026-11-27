import {
  TYPE_SECTION,
  commonSections,
  keyItems,
  readSection,
  sectionsForType,
  stableStringify,
} from './draftSections.js'

const isSame = (a, b) => stableStringify(a) === stableStringify(b)

function diffList(section, before, after) {
  const beforeItems = keyItems(before, section.itemKey)
  const afterItems = keyItems(after, section.itemKey)
  const beforeByKey = new Map(beforeItems.map((entry) => [entry.key, entry]))
  const afterKeys = new Set(afterItems.map((entry) => entry.key))

  const added = afterItems.filter((entry) => !beforeByKey.has(entry.key))
  const removed = beforeItems.filter((entry) => !afterKeys.has(entry.key))
  const updated = afterItems.filter(
    (entry) =>
      beforeByKey.has(entry.key) &&
      !isSame(beforeByKey.get(entry.key).item, entry.item),
  )
  const keptOrder = (items, keys) =>
    items.filter((entry) => keys.has(entry.key)).map((entry) => entry.key)
  const reordered =
    keptOrder(beforeItems, afterKeys).join('|') !==
    keptOrder(afterItems, new Set(beforeByKey.keys())).join('|')

  if (!added.length && !removed.length && !updated.length && !reordered) {
    return null
  }
  const titles = (entries) => entries.map((entry) => entry.title)
  return {
    section: section.key,
    kind: 'list',
    added: titles(added),
    removed: titles(removed),
    updated: titles(updated),
    reordered,
  }
}

/**
 * Lists what changed between two drafts, section by section.
 * Computed from the data only, never from model text.
 *
 * @param {object} before
 * @param {object} after
 * @returns {Array<{
 *   section: string,
 *   kind: 'value' | 'list',
 *   added?: string[],
 *   removed?: string[],
 *   updated?: string[],
 *   reordered?: boolean,
 * }>}
 */
export function diffStudyDrafts(before, after) {
  const switchedMethod = before?.testType !== after?.testType
  const sections = switchedMethod
    ? commonSections()
    : sectionsForType(after.testType)

  const changes = sections
    .map((section) => {
      const previous = readSection(before, section)
      const next = readSection(after, section)
      if (section.kind === 'list') return diffList(section, previous, next)
      return isSame(previous, next)
        ? null
        : { section: section.key, kind: 'value' }
    })
    .filter(Boolean)

  return switchedMethod
    ? [{ section: TYPE_SECTION.key, kind: 'value' }, ...changes]
    : changes
}
