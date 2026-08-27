import { fail, toHttpsError } from '../errors.js'

/**
 * @typedef {(request: object, next: () => Promise<unknown>) => Promise<unknown>} CallableMiddleware
 */

/**
 * @typedef {object} FieldRule
 * @property {string|string[]} [type]
 * @property {boolean} [required]
 * @property {unknown[]} [enum]
 */

/**
 * Ensures the callable request is authenticated.
 *
 * @type {CallableMiddleware}
 */
export async function requireAuth(request, next) {
  if (!request?.auth?.uid) {
    fail('unauthenticated', 'Authentication is required')
  }
  return next()
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
const isEmpty = (value) => value == null || value === ''

/**
 * @param {unknown} value
 * @param {string|string[]} typeRule
 * @returns {boolean}
 */
const matchesType = (value, typeRule) => {
  const types = Array.isArray(typeRule) ? typeRule : [typeRule]
  const actual = typeof value
  return types.includes(actual)
}

/**
 * Validates `request.data` against a field schema document.
 *
 * @param {Record<string, FieldRule>} schema
 * @returns {CallableMiddleware}
 *
 * @example
 * validateRequest({
 *   answersDocId: { type: 'string', required: true },
 *   taskId: { type: ['string', 'number'], required: true },
 *   provider: { type: 'string', required: true, enum: ['whisper', 'openai'] },
 *   studyId: { type: 'string', required: false },
 * })
 */
export function validateRequest(schema) {
  return async (request, next) => {
    const data = request?.data || {}
    const errors = []

    for (const [field, rule] of Object.entries(schema || {})) {
      const value = data[field]
      const required = rule.required !== false
      const empty = isEmpty(value)

      if (required && empty) {
        errors.push(`${field} is required`)
        continue
      }
      if (empty) continue

      if (rule.type != null && !matchesType(value, rule.type)) {
        const types = Array.isArray(rule.type) ? rule.type : [rule.type]
        errors.push(`${field} must be ${types.join(' or ')}`)
        continue
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`)
      }
    }

    if (errors.length) {
      fail('invalid-argument', errors.join('; '))
    }

    return next()
  }
}

/**
 * Maps AppError / unknown errors to Firebase Callable HttpsError.
 *
 * @param {object} functionsModule `functions` export from f.firebase
 * @param {string} [fallbackMessage]
 * @returns {CallableMiddleware}
 */
export function mapHttpsError(
  functionsModule,
  fallbackMessage = 'Internal error',
) {
  return async (_request, next) => {
    try {
      return await next()
    } catch (err) {
      throw toHttpsError(err, functionsModule, fallbackMessage)
    }
  }
}
