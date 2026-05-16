import DOMPurify from 'dompurify'

const HTML_SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
}

export function sanitizeHtml(value) {
  return DOMPurify.sanitize(value || '', HTML_SANITIZE_CONFIG)
}
