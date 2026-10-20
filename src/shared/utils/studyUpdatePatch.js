const isPlainObject = (value) => {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

export const cloneStudyData = (value) => {
  if (Array.isArray(value)) return value.map(cloneStudyData)
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        cloneStudyData(nestedValue),
      ]),
    )
  }
  if (value instanceof Date) return new Date(value.getTime())
  return value
}

const isEqual = (left, right) => {
  if (Object.is(left, right)) return true
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime()
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => isEqual(value, right[index]))
    )
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) => Object.hasOwn(right, key) && isEqual(left[key], right[key]),
      )
    )
  }
  if (
    typeof left?.isEqual === 'function' &&
    right &&
    typeof right === 'object'
  ) {
    return left.isEqual(right)
  }
  return false
}

export const createStudyUpdatePatch = (previous, next) => {
  const patch = []

  const compare = (before, after, path) => {
    if (isEqual(before, after)) return

    if (isPlainObject(before) && isPlainObject(after)) {
      const keys = new Set([...Object.keys(before), ...Object.keys(after)])
      for (const key of keys) {
        const childPath = [...path, key]
        if (!Object.hasOwn(after, key) || after[key] === undefined) {
          patch.push({ path: childPath, delete: true })
        } else if (!Object.hasOwn(before, key)) {
          patch.push({ path: childPath, value: cloneStudyData(after[key]) })
        } else {
          compare(before[key], after[key], childPath)
        }
      }
      return
    }

    if (path.length > 0) {
      patch.push({ path, value: cloneStudyData(after) })
    }
  }

  compare(previous, next, [])
  return patch
}

export const applyStudyUpdatePatch = (source, patch) => {
  const result = cloneStudyData(source)

  for (const change of patch) {
    const [root, ...nestedPath] = change.path
    if (!root) continue

    if (nestedPath.length === 0) {
      if (change.delete) delete result[root]
      else result[root] = cloneStudyData(change.value)
      continue
    }

    let target = result[root]
    if (!isPlainObject(target)) target = {}
    else target = { ...target }
    result[root] = target

    for (let index = 0; index < nestedPath.length - 1; index += 1) {
      const segment = nestedPath[index]
      const child = target[segment]
      target[segment] = isPlainObject(child) ? { ...child } : {}
      target = target[segment]
    }

    const leaf = nestedPath[nestedPath.length - 1]
    if (change.delete) delete target[leaf]
    else target[leaf] = cloneStudyData(change.value)
  }

  return result
}

export const mergeStudySnapshotPreservingFields = (
  current,
  incoming,
  preservedFields = [],
) => {
  const merged = { ...incoming }
  const currentStructure = current?.testStructure || {}
  const incomingStructure = incoming?.testStructure || {}

  merged.testStructure = { ...incomingStructure }
  for (const field of preservedFields) {
    if (Object.hasOwn(currentStructure, field)) {
      merged.testStructure[field] = currentStructure[field]
    } else {
      delete merged.testStructure[field]
    }
  }

  return merged
}

export const mergeStudySnapshotPreservingRootFields = (
  current,
  incoming,
  preservedFields = [],
) => {
  const merged = { ...incoming }

  for (const field of preservedFields) {
    if (Object.hasOwn(current || {}, field)) {
      merged[field] = current[field]
    } else {
      delete merged[field]
    }
  }

  return merged
}
