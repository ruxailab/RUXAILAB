import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import WelcomeStep from '@/ux/UserTest/components/steps/WelcomeStep.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

let mockSmAndDown = false

jest.mock('vuetify', () => ({
  useDisplay: () => ({ smAndDown: require('vue').ref(mockSmAndDown) }),
}))
jest.mock(
  'vuetify/labs/VStepperVertical',
  () => ({
    VStepperVertical: {
      props: ['items'],
      template:
        '<ul><li v-for="item in items" :key="item">{{ item }}</li></ul>',
    },
  }),
  { virtual: true },
)
jest.mock('@/shared/utils/animations', () => ({
  animateWelcomeText: () => () => {},
}))

const mountStep = (locale) =>
  mount(WelcomeStep, {
    props: { stepperValue: 0, hasEyeTracking: true },
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
        ShowInfo: { template: '<div><slot name="content" /></div>' },
        StudyTypeBadges: true,
        'v-btn': { template: '<button><slot /></button>' },
        'v-stepper': { template: '<div><slot /></div>' },
        'v-stepper-header': { template: '<div><slot /></div>' },
        'v-stepper-item': {
          props: ['title'],
          template: '<span>{{ title }}</span>',
        },
        'v-divider': true,
      },
    },
  })

const openHowItWorks = async (wrapper) => {
  await wrapper.find('button').trigger('click')
  await nextTick()
}

describe('WelcomeStep', () => {
  beforeEach(() => {
    mockSmAndDown = false
  })

  it('shows the how it works button in Spanish', () => {
    const text = mountStep('es').text()

    expect(text).toContain('¿Cómo funciona este estudio?')
    expect(text).not.toContain('How does this test work?')
  })

  it('shows the calibration step in Spanish on desktop', async () => {
    const wrapper = mountStep('es')
    await openHowItWorks(wrapper)

    expect(wrapper.text()).toContain('Calibración')
    expect(wrapper.text()).not.toContain('Calibration')
  })

  it('shows the calibration step in Spanish on small screens', async () => {
    mockSmAndDown = true
    const wrapper = mountStep('es')
    await openHowItWorks(wrapper)

    expect(wrapper.text()).toContain('Calibración')
    expect(wrapper.text()).not.toContain('Calibration')
  })

  it('keeps the English text in English', async () => {
    const wrapper = mountStep('en')
    expect(wrapper.text()).toContain('How does this study work?')

    await openHowItWorks(wrapper)
    expect(wrapper.text()).toContain('Calibration')
  })
})
