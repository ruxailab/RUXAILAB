import {
  installFieldLabelAriaCleanup,
  stripRedundantLabelAriaHidden,
} from '@/shared/utils/fieldLabelAria'

const flushDomMutations = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0)
  })

// The markup Vuetify renders for an idle outlined text field (VField): the
// label is associated with the input and carries aria-hidden="false".
const vuetifyFieldLabelMarkup = `
  <div class="v-input">
    <label class="v-label v-field-label" id="input-1-label" aria-hidden="false" for="input-1">Email</label>
    <input id="input-1" aria-labelledby="input-1-label" />
    <label class="v-label v-field-label v-field-label--floating" aria-hidden="true">Email</label>
  </div>
`

describe('fieldLabelAria', () => {
  let stopCleanup = () => {}

  afterEach(() => {
    stopCleanup()
    stopCleanup = () => {}
    document.body.innerHTML = ''
  })

  it('removes aria-hidden="false" from labels only', () => {
    const container = document.createElement('div')
    container.innerHTML = [
      '<label for="email" aria-hidden="false">Email</label>',
      '<label aria-hidden="true">Hidden label</label>',
      '<span aria-hidden="false">Decorative text</span>',
    ].join('')

    stripRedundantLabelAriaHidden(container)

    const emailLabel = container.querySelector('label[for="email"]')
    expect(emailLabel.hasAttribute('aria-hidden')).toBe(false)
    expect(
      container
        .querySelector('label[aria-hidden="true"]')
        .getAttribute('aria-hidden'),
    ).toBe('true')
    expect(container.querySelector('span').getAttribute('aria-hidden')).toBe(
      'false',
    )
  })

  it('makes a Vuetify field label conformant without touching the association', () => {
    const container = document.createElement('div')
    container.innerHTML = vuetifyFieldLabelMarkup

    stripRedundantLabelAriaHidden(container)

    const label = container.querySelector('label[for="input-1"]')
    expect(label.hasAttribute('aria-hidden')).toBe(false)
    expect(label.getAttribute('for')).toBe('input-1')
    expect(
      container.querySelectorAll('label[aria-hidden="false"]').length,
    ).toBe(0)
    // The floating duplicate keeps its aria-hidden, it is not associated with
    // the input so the audit rule does not apply to it.
    expect(
      container
        .querySelector('label.v-field-label--floating')
        .getAttribute('aria-hidden'),
    ).toBe('true')
  })

  it('cleans labels added after the cleanup is installed', async () => {
    stopCleanup = installFieldLabelAriaCleanup(document.body)

    const field = document.createElement('div')
    field.innerHTML = vuetifyFieldLabelMarkup
    document.body.appendChild(field)

    await flushDomMutations()

    expect(document.querySelectorAll('label[aria-hidden="false"]').length).toBe(
      0,
    )
    expect(document.querySelector('label[for="input-1"]')).not.toBeNull()
  })
})
