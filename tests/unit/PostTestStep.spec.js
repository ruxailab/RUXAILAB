import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import PostTestStep from '@/shared/components/steps/PostTestStep.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

const postTest = [
  { title: 'How easy was it?', textField: true },
  { title: 'Would you use it again?', textField: true },
]

const mountStep = (locale, props = {}) =>
  mount(PostTestStep, {
    props: {
      testTitle: 'Checkout study',
      postTest,
      postTestAnswer: [{ answer: '' }, { answer: '' }],
      ...props,
    },
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale,
          fallbackLocale: 'en',
          messages: { en, es },
        }),
      ],
      stubs: {
        ShowInfo: {
          props: ['title'],
          template: '<div><h1>{{ title }}</h1><slot name="content" /></div>',
        },
        'v-sheet': { template: '<div><slot /></div>' },
        'v-chip': { template: '<span><slot /></span>' },
        'v-progress-linear': true,
        'v-text-field': {
          props: ['placeholder'],
          template: '<input :placeholder="placeholder" />',
        },
        'v-radio-group': { template: '<div><slot /></div>' },
        'v-radio': true,
        'v-row': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-btn': { template: '<button><slot /></button>' },
      },
    },
  })

describe('PostTestStep', () => {
  it('shows the question header, answer field and buttons in Spanish', () => {
    const wrapper = mountStep('es')
    const text = wrapper.text()

    expect(text).toContain('Checkout study - Prueba posterior')
    expect(text).toContain('Pregunta 1')
    expect(text).toContain('2 en total')
    expect(text).toContain('Anterior')
    expect(text).toContain('Siguiente')
    expect(wrapper.find('input').attributes('placeholder')).toBe(
      'Escribe tu respuesta aquí...',
    )
    expect(text).not.toContain('Previous')
    expect(text).not.toContain('Question')
  })

  it('shows Hecho on the last question and the empty message in Spanish', () => {
    const last = mountStep('es', { postTest: [postTest[0]] })
    expect(last.text()).toContain('Hecho')
    expect(last.text()).not.toContain('Done')

    const empty = mountStep('es', { postTest: [], postTestAnswer: [] })
    expect(empty.text()).toContain(
      'Este estudio no tiene preguntas posteriores configuradas.',
    )
  })

  it('keeps the English text in English', () => {
    const wrapper = mountStep('en')
    const text = wrapper.text()

    expect(text).toContain('Checkout study - Post-Test')
    expect(text).toContain('Question 1')
    expect(text).toContain('2 total')
    expect(text).toContain('Next')
  })
})
