import safeHtml, { sanitizeHtml } from '@/shared/directives/safeHtml'

describe('sanitizeHtml', () => {
  it('strips script tags and inline event handlers from rich text', () => {
    const payload =
      '<p>Hello</p><script>alert(1)</script><img src="x" onerror="alert(1)">'
    const clean = sanitizeHtml(payload)

    expect(clean).not.toContain('<script')
    expect(clean).not.toContain('onerror')
    expect(clean).toContain('<p>Hello</p>')
  })

  it('removes javascript: URLs', () => {
    const clean = sanitizeHtml('<a href="javascript:alert(1)">click</a>')

    expect(clean).not.toContain('javascript:')
  })

  it('keeps ordinary formatting markup produced by the rich-text editor', () => {
    const clean = sanitizeHtml('<p><strong>Bold</strong> and <em>italic</em></p>')

    expect(clean).toBe('<p><strong>Bold</strong> and <em>italic</em></p>')
  })

  it('returns an empty string for null/undefined', () => {
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
  })
})

describe('v-safe-html directive', () => {
  it('writes sanitized innerHTML on mount and skips unchanged updates', () => {
    const el = document.createElement('div')
    const payload = '<p>Hi</p><script>alert(1)</script>'

    safeHtml.mounted(el, { value: payload })
    expect(el.innerHTML).toBe('<p>Hi</p>')

    el.innerHTML = '<p>manually changed</p>'
    safeHtml.updated(el, { value: payload, oldValue: payload })
    expect(el.innerHTML).toBe('<p>manually changed</p>')

    safeHtml.updated(el, { value: '<p>New</p>', oldValue: payload })
    expect(el.innerHTML).toBe('<p>New</p>')
  })
})
