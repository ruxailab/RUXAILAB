import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import ConsentStep from '@/shared/components/steps/ConsentStep.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

const mountStep = (locale) =>
  mount(ConsentStep, {
    props: { testTitle: 'Checkout study', consentText: '<p>Terms</p>' },
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale,
          fallbackLocale: 'en',
          messages: { en, es },
        }),
      ],
      directives: { safeHtml: () => {} },
      stubs: {
        ShowInfo: {
          props: ['title'],
          template: '<div><h1>{{ title }}</h1><slot name="content" /></div>',
        },
        'v-row': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-radio-group': { template: '<div><slot /></div>' },
        'v-radio': { props: ['label'], template: '<span>{{ label }}</span>' },
        'v-text-field': {
          props: ['label', 'rules'],
          template: '<label>{{ label }} {{ rules[0]("") }}</label>',
        },
        'v-btn': { template: '<button><slot /></button>' },
        'v-dialog': {
          props: ['modelValue'],
          template: '<div v-if="modelValue"><slot /></div>',
        },
        'v-card': { template: '<div><slot /></div>' },
        'v-card-title': { template: '<div><slot /></div>' },
        'v-card-text': { template: '<div><slot /></div>' },
        'v-card-actions': { template: '<div><slot /></div>' },
        'v-spacer': true,
        'v-icon': true,
      },
    },
  })

it('shows the consent form in Spanish', () => {
  const text = mountStep('es').text()

  expect(text).toContain('Checkout study - Consentimiento')
  expect(text).toContain('Nombre completo')
  expect(text).toContain('El nombre es obligatorio')
  expect(text).toContain('Acepto los términos de consentimiento')
  expect(text).toContain('No acepto los términos de consentimiento')
  expect(text).toContain('Continuar')
  expect(text).not.toContain('Full Name')
  expect(text).not.toContain('Continue')
})

it('shows the decline confirmation in Spanish', async () => {
  const wrapper = mountStep('es')
  wrapper.vm.showDeclineModal = true
  await nextTick()
  const text = wrapper.text()

  expect(text).toContain('Consentimiento rechazado')
  expect(text).toContain('Volver')
  expect(text).toContain('Sí, finalizar estudio')
  expect(text).not.toContain('Consent Declined')
  expect(text).not.toContain('Go Back')
})

it('keeps the English text in English', () => {
  const text = mountStep('en').text()

  expect(text).toContain('Checkout study - Consent')
  expect(text).toContain('Full Name')
  expect(text).toContain('I accept the consent terms')
  expect(text).toContain('Continue')
})
