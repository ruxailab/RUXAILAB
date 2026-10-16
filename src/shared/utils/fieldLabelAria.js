/**
 * Removes the redundant `aria-hidden="false"` that Vuetify renders on field
 * labels.
 *
 * While a field is idle, Vuetify's `VField` marks its label with an explicit
 * `aria-hidden="false"` and swaps the attribute between the main and the
 * floating label as the field becomes active. A `label` element that is
 * associated with a form control must not carry ARIA attributes (W3C
 * "ARIA in HTML", https://www.w3.org/TR/html-aria/#el-label), so accessibility
 * audits flag the sign-in form (ruxailab/RUXAILAB#2028).
 *
 * `aria-hidden="false"` is equivalent to the attribute being absent, so
 * removing it keeps the accessibility tree identical for assistive
 * technologies while making the markup conformant.
 */

const REDUNDANT_LABEL_ARIA_HIDDEN = 'label[aria-hidden="false"]'

/**
 * Remove every redundant `aria-hidden="false"` from the labels inside a node.
 * @param {Node} root - Node (and its descendants) to clean
 * @returns {void}
 */
export const stripRedundantLabelAriaHidden = (root) => {
  if (!root) return

  if (
    root.nodeType === Node.ELEMENT_NODE &&
    root.matches(REDUNDANT_LABEL_ARIA_HIDDEN)
  ) {
    root.removeAttribute('aria-hidden')
  }

  root.querySelectorAll?.(REDUNDANT_LABEL_ARIA_HIDDEN).forEach((label) => {
    label.removeAttribute('aria-hidden')
  })
}

/**
 * Keep field labels conformant while the app is running, including when
 * Vuetify sets the attribute again as fields become active or idle.
 * @param {Node} [target] - Root to observe; defaults to `document.body`
 * @returns {Function} Call to stop the cleanup
 */
export const installFieldLabelAriaCleanup = (target = document.body) => {
  if (!target) return () => {}

  stripRedundantLabelAriaHidden(target)

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        stripRedundantLabelAriaHidden(mutation.target)
        return
      }

      mutation.addedNodes.forEach((node) => {
        stripRedundantLabelAriaHidden(node)
      })
    })
  })

  observer.observe(target, {
    attributes: true,
    attributeFilter: ['aria-hidden'],
    childList: true,
    subtree: true,
  })

  return () => observer.disconnect()
}
