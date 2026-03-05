export const isValidEmail = (value) => {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.includes(' ')) return false
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0) return false
  if (trimmed.indexOf('@', atIndex + 1) !== -1) return false
  const dotIndex = trimmed.indexOf('.', atIndex + 2)
  if (dotIndex === -1 || dotIndex >= trimmed.length - 1) return false
  return true
}

export const createEmailRules = (t) => [
  (v) => !!v || t('errors.emailIsRequired'),
  (v) => isValidEmail(v) || t('errors.invalidEmail'),
]
