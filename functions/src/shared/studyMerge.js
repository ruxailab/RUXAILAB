/**
 * Merge a study update requested by an editor into the stored study without
 * dropping the changes another admin made in the meantime.
 *
 * The editor sends the snapshot it based its changes on (`base`). Comparing
 * that snapshot with the requested values tells the server which parts the
 * editor actually changed. Everything the editor did not touch keeps the
 * stored value, so a save from a stale editor no longer overwrites the work
 * of another admin.
 */

const IDENTITY_FIELDS = Object.freeze({
  userTasks: 'taskName',
  preTest: 'title',
  postTest: 'title',
})

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * Stable representation of a value, used to compare two versions of the same
 * field without depending on the key order.
 *
 * @param {unknown} value
 * @returns {string}
 */
const canonical = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonical(entry)).join(',')}]`
  }
  if (isPlainObject(value)) {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value === undefined ? null : value)
}

/**
 * @param {unknown} left
 * @param {unknown} right
 * @returns {boolean}
 */
export const isSameValue = (left, right) => canonical(left) === canonical(right)

/**
 * The field that identifies an entry of a list. Tasks and study variables are
 * identified by the name the admin gave them, so an entry that was renamed
 * counts as a new entry and the renamed one is removed.
 *
 * @param {unknown} entry
 * @param {string|undefined} field
 * @returns {string|null}
 */
const identityOf = (entry, field) => {
  const identityField = IDENTITY_FIELDS[field]
  if (!identityField || !isPlainObject(entry)) return null
  const value = entry[identityField]
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

const keyOf = (entry, field) =>
  identityOf(entry, field) ?? `#${canonical(entry)}`

/**
 * Merge two lists of study content. Entries the editor did not change keep
 * the stored value, entries the editor added are kept, and entries another
 * admin added in the meantime are preserved.
 *
 * @param {object} params
 * @returns {Array}
 */
const mergeList = ({ current, base, requested, field }) => {
  const currentEntries = Array.isArray(current) ? current : []
  const baseEntries = Array.isArray(base) ? base : []
  const requestedEntries = Array.isArray(requested) ? requested : []

  const baseByKey = new Map()
  baseEntries.forEach((entry) => {
    const key = keyOf(entry, field)
    if (!baseByKey.has(key)) baseByKey.set(key, entry)
  })

  const merged = []
  const usedCurrent = new Set()

  requestedEntries.forEach((entry) => {
    const key = keyOf(entry, field)
    const index = currentEntries.findIndex(
      (currentEntry, currentIndex) =>
        keyOf(currentEntry, field) === key && !usedCurrent.has(currentIndex),
    )
    if (index === -1) {
      merged.push(entry)
      return
    }
    usedCurrent.add(index)
    const baseEntry = baseByKey.get(key)
    merged.push(
      baseEntry !== undefined && isSameValue(entry, baseEntry)
        ? currentEntries[index]
        : entry,
    )
  })

  currentEntries.forEach((entry, index) => {
    if (usedCurrent.has(index)) return
    // The editor removed this entry, or another admin added it after the
    // editor loaded the study. Only the second case is kept.
    if (baseByKey.has(keyOf(entry, field))) return
    merged.push(entry)
  })

  return merged
}

/**
 * @param {object} params
 * @returns {unknown}
 */
const mergeValue = ({ current, base, requested, field }) => {
  if (isPlainObject(requested) && isPlainObject(current)) {
    return mergeObject({
      current,
      base: isPlainObject(base) ? base : undefined,
      requested,
    })
  }

  if (
    Array.isArray(requested) &&
    Array.isArray(current) &&
    IDENTITY_FIELDS[field]
  ) {
    return mergeList({ current, base, requested, field })
  }

  if (base !== undefined && isSameValue(requested, base)) {
    // The editor did not change this field, so the stored value wins. A field
    // the stored study does not carry at all stays absent: Firestore refuses
    // an `undefined` value in an update.
    return current
  }

  return requested
}

/**
 * @param {object} params
 * @returns {object}
 */
const mergeObject = ({ current, base, requested }) => {
  const merged = {}

  Object.keys(requested).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(current, key)) {
      const value = mergeValue({
        current: current[key],
        base: base ? base[key] : undefined,
        requested: requested[key],
        field: key,
      })
      // A field the stored study does not carry stays absent rather than
      // becoming `undefined`, which Firestore refuses in an update.
      if (value !== undefined) merged[key] = value
      return
    }
    merged[key] = requested[key]
  })

  Object.keys(current).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(requested, key)) return
    if (base && Object.prototype.hasOwnProperty.call(base, key)) {
      // The editor removed this field.
      return
    }
    // Another admin added this field after the editor loaded the study.
    merged[key] = current[key]
  })

  return merged
}

/**
 * Merge the requested study update into the stored study.
 *
 * Without a base snapshot there is nothing to compare against, so the request
 * is applied as it is. With a base snapshot the update is merged: the editor's
 * changes are applied and the changes another admin made in the meantime are
 * preserved.
 *
 * @param {object} params
 * @param {object} params.current the stored study
 * @param {object} params.requestedUpdates the values the editor requested
 * @param {object|null} params.base the study snapshot the editor based its changes on
 * @returns {object} the values to store
 */
export const mergeStudyUpdates = ({ current, requestedUpdates, base }) => {
  if (!isPlainObject(base) || !isPlainObject(requestedUpdates)) {
    return { ...requestedUpdates }
  }

  const updates = {}

  Object.keys(requestedUpdates).forEach((key) => {
    const requested = requestedUpdates[key]
    const stored = isPlainObject(current) ? current[key] : undefined
    const baseValue = base[key]

    if (
      key === 'testStructure' &&
      Array.isArray(stored) &&
      isPlainObject(requested)
    ) {
      // Studies created before the editor existed store the task list as a
      // flat list instead of a structure object.
      updates[key] = mergeValue({
        current: { userTasks: stored },
        base: Array.isArray(baseValue) ? { userTasks: baseValue } : baseValue,
        requested,
        field: key,
      })
      return
    }

    const value = mergeValue({
      current: stored,
      base: baseValue,
      requested,
      field: key,
    })
    // A field the stored study does not carry stays absent rather than
    // becoming `undefined`, which Firestore refuses in an update.
    if (value !== undefined) updates[key] = value
  })

  return updates
}
