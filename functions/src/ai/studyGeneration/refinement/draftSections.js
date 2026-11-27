/**
 * Refinable sections of a study draft.
 * A "value" section is replaced as a whole; a "list" section is a list of
 * items identified by itemKey (cards, tasks, heuristics, topics...).
 */

const valueSection = (key, ...paths) => ({ key, kind: 'value', paths })

const listSection = (key, path, itemKey) => ({
  key,
  kind: 'list',
  paths: [path],
  itemKey,
})

const COMMON_SECTIONS = [
  valueSection('testTitle', ['testTitle']),
  valueSection('testDescription', ['testDescription']),
]

const FLOW_SECTIONS = [
  valueSection('welcomeMessage', ['testStructure', 'welcomeMessage']),
  valueSection('finalMessage', ['testStructure', 'finalMessage']),
  valueSection('consent', ['testStructure', 'consent']),
  valueSection('preTest', ['testStructure', 'preTest']),
  valueSection('postTest', ['testStructure', 'postTest']),
]

const METHOD_SECTIONS = {
  CARD_SORTING: [
    ...FLOW_SECTIONS,
    listSection('cards', ['testStructure', 'cardSorting', 'cards'], 'title'),
    listSection(
      'categories',
      ['testStructure', 'cardSorting', 'categories'],
      'title',
    ),
    valueSection('cardSortingOptions', [
      'testStructure',
      'cardSorting',
      'options',
    ]),
  ],
  USER: [
    valueSection('subType', ['subType']),
    ...FLOW_SECTIONS,
    listSection('userTasks', ['testStructure', 'userTasks'], 'taskName'),
  ],
  HEURISTIC: [
    listSection('heuristics', ['testStructure'], 'title'),
    valueSection(
      'heuristicSettings',
      ['useWeights'],
      ['useSeverity'],
      ['useFrequency'],
      ['trackTime'],
      ['testWeights'],
    ),
  ],
  FOCUS_GROUP: [
    listSection('discussionGuide', ['discussionGuide'], 'title'),
    valueSection('focusGroupConfig', ['config']),
  ],
}

export const TYPE_SECTION = valueSection('testType', ['testType'])

export const SECTION_KEYS = [
  TYPE_SECTION.key,
  ...new Set(
    [COMMON_SECTIONS, ...Object.values(METHOD_SECTIONS)]
      .flat()
      .map((section) => section.key),
  ),
]

/**
 * @param {string} testType
 * @returns {Array<object>}
 */
export function sectionsForType(testType) {
  return [...COMMON_SECTIONS, ...(METHOD_SECTIONS[testType] || [])]
}

export function commonSections() {
  return COMMON_SECTIONS
}

function getPath(source, path) {
  return path.reduce((node, segment) => node?.[segment], source)
}

function setPath(target, path, value) {
  const parentPath = path.slice(0, -1)
  let node = target
  for (const segment of parentPath) {
    if (!node[segment] || typeof node[segment] !== 'object') node[segment] = {}
    node = node[segment]
  }
  const leaf = path[path.length - 1]
  if (value === undefined) delete node[leaf]
  else node[leaf] = value
}

/**
 * Value sections with several paths are read as an array of values.
 * @param {object} draft
 * @param {object} section
 */
export function readSection(draft, section) {
  if (section.paths.length === 1) return getPath(draft, section.paths[0])
  return section.paths.map((path) => getPath(draft, path))
}

/**
 * @param {object} draft
 * @param {object} section
 * @param {unknown} value
 */
export function writeSection(draft, section, value) {
  if (section.paths.length === 1) {
    setPath(draft, section.paths[0], value)
    return
  }
  section.paths.forEach((path, index) => setPath(draft, path, value?.[index]))
}

/**
 * @param {unknown} title
 * @returns {string}
 */
export function normalizeItemTitle(title) {
  return titleText(title).trim().toLowerCase()
}

function titleText(title) {
  return typeof title === 'string' || typeof title === 'number'
    ? String(title)
    : ''
}

/**
 * Keys every item by its normalized title, suffixed with an occurrence
 * counter so duplicated titles stay distinct.
 * @param {Array<object>} items
 * @param {string} itemKey
 * @returns {Array<{ key: string, title: string, item: object }>}
 */
export function keyItems(items, itemKey) {
  const seen = new Map()
  return (Array.isArray(items) ? items : []).map((item) => {
    const title = normalizeItemTitle(item?.[itemKey])
    const occurrence = seen.get(title) || 0
    seen.set(title, occurrence + 1)
    return {
      key: `${title}#${occurrence}`,
      title: titleText(item?.[itemKey]),
      item,
    }
  })
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value ?? null)
}
