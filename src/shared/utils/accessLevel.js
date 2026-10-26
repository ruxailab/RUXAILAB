export const ACCESS_LEVEL = {
  ADMIN: 0,
  EVALUATOR: 1,
  GUEST: 2,
  OBSERVATOR: 3,
}

export function normalizeAccessLevel(value) {
  if (value == null) return null

  if (typeof value === 'number') return value

  const normalized = String(value).trim().toUpperCase()

  if (!normalized) return null

  if (normalized === 'ADMIN' || normalized === 'FACILITATOR')
    return ACCESS_LEVEL.ADMIN
  if (normalized === 'EVALUATOR') return ACCESS_LEVEL.EVALUATOR
  if (normalized === 'GUEST') return ACCESS_LEVEL.GUEST
  if (
    normalized === 'OBSERVATOR' ||
    normalized === 'OBSERVER' ||
    normalized === 'VIEWER'
  ) {
    return ACCESS_LEVEL.OBSERVATOR
  }

  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : null
}

export function isObserverAccessLevel(value) {
  const normalized = normalizeAccessLevel(value)
  return normalized === ACCESS_LEVEL.OBSERVATOR
}
