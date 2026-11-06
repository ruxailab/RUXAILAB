import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import NextSession from '@/features/dashboard/components/NextSession.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'

jest.mock('vue-router', () => ({
  ...jest.requireActual('vue-router'),
  useRouter: () => ({ push: jest.fn() }),
}))

const nextSession = {
  id: 's1',
  scheduledAt: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
  study: {
    id: 'st1',
    testTitle: 'Checkout usability',
    testType: STUDY_TYPES.USER,
    subType: USER_STUDY_SUBTYPES.MODERATED,
  },
}

const mountCard = (locale) =>
  mount(NextSession, {
    props: { nextSession },
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
        'v-card': { template: '<div><slot /></div>' },
        'v-card-title': { template: '<div><slot /></div>' },
        'v-card-text': { template: '<div><slot /></div>' },
        'v-chip': { template: '<span><slot /></span>' },
        'v-btn': { template: '<button><slot /></button>' },
        'v-icon': true,
      },
    },
  })

it('shows the study type label and start button in Spanish', () => {
  const text = mountCard('es').text()

  expect(text).toContain('Tipo de estudio')
  expect(text).toContain('Iniciar sesión')
  expect(text).not.toContain('Study Type')
  expect(text).not.toContain('Start Session')
})

it('shows the study type label and start button in English', () => {
  const text = mountCard('en').text()

  expect(text).toContain('Study Type')
  expect(text).toContain('Start Session')
})
