import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AccessibilityPreviewTest from '@/ux/accessibility/view/manual/AccessibilityPreviewTest.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

const mockStore = {
  state: {
    Auth: { user: { id: 'user-1' } },
    Assessment: {
      selectedPrincipleIdx: 0,
      selectedGuidelineIdx: 0,
      selectedRuleIdx: 0,
      filteredWcagData: {
        principles: [
          {
            title: 'Perceivable',
            Guidelines: [
              {
                id: '1.1',
                title: 'Text Alternatives',
                rules: [{ id: '1.1.1', title: 'Non-text Content', level: 'A' }],
              },
            ],
          },
        ],
      },
    },
  },
  getters: {
    user: { id: 'user-1' },
    test: { id: 'test-1', userId: 'user-1' },
    loading: false,
    'Assessment/getRuleAssessment': () => ({}),
  },
  dispatch: () => Promise.resolve(null),
}

jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'test-1' }, query: {} }),
}))
jest.mock('@/shared/utils/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}))

const mountView = async (locale) => {
  const wrapper = mount(AccessibilityPreviewTest, {
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
        PageWrapper: {
          props: ['title', 'loadingText'],
          template:
            '<div><h1>{{ title }}</h1><i class="loading-text">{{ loadingText }}</i><slot /></div>',
        },
        'v-textarea': {
          props: ['placeholder'],
          template: '<textarea :placeholder="placeholder" />',
        },
        'v-file-input': {
          props: ['label'],
          template: '<label class="file">{{ label }}</label>',
        },
        'v-radio': {
          props: ['label'],
          template: '<span class="radio">{{ label }}</span>',
        },
      },
    },
  })
  await flushPromises()
  return wrapper
}

describe('AccessibilityPreviewTest', () => {
  it('shows the page title and loading text in Spanish', async () => {
    const wrapper = await mountView('es')

    expect(wrapper.find('h1').text()).toBe(
      'Vista previa de la prueba de accesibilidad',
    )
    expect(wrapper.find('.loading-text').text()).toBe('Cargando datos WCAG...')
  })

  it('shows the note field and the severity and status options in Spanish', async () => {
    const wrapper = await mountView('es')
    const radios = wrapper.findAll('.radio').map((radio) => radio.text())

    expect(wrapper.find('textarea').attributes('placeholder')).toBe(
      'Escribe tus notas aquí...',
    )
    expect(wrapper.find('.file').text()).toBe('Adjuntar imagen')
    expect(radios).toEqual([
      'Alta',
      'Media',
      'Baja',
      'Aprobado',
      'Fallido',
      'N/A',
    ])
  })

  it('keeps the English text in English', async () => {
    const wrapper = await mountView('en')
    const radios = wrapper.findAll('.radio').map((radio) => radio.text())

    expect(wrapper.find('h1').text()).toBe('Accessibility Test Preview')
    expect(wrapper.find('textarea').attributes('placeholder')).toBe(
      'Enter your notes here...',
    )
    expect(radios).toEqual(['High', 'Medium', 'Low', 'Pass', 'Fail', 'N/A'])
  })
})
