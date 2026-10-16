import DOMPurify from 'dompurify'

export function sanitizeHtml(value) {
  if (value == null) return ''
  return DOMPurify.sanitize(String(value))
}

/**
 * v-safe-html: drop-in replacement for v-html that sanitizes the markup
 * with DOMPurify before it is written to the DOM, so study/evaluator-authored
 * rich text (consent text, welcome message, task descriptions, heuristic
 * instructions, etc.) can't carry an XSS payload to other viewers.
 */
const safeHtml = {
  mounted(el, binding) {
    el.innerHTML = sanitizeHtml(binding.value)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.innerHTML = sanitizeHtml(binding.value)
    }
  },
}

export default safeHtml
