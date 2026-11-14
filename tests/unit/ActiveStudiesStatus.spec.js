import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ActiveStudies from '@/features/dashboard/components/ActiveStudies.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'
import StudyAdmin from '@/shared/models/StudyAdmin'
import {
  instantiateStudyByType,
  STUDY_TYPES,
} from '@/shared/constants/methodDefinitions'

jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('vuex', () => ({
  useStore: () => ({ getters: { user: { id: 'user-1' } } }),
}))

jest.mock('@/shared/controllers/AnswerController', () =>
  jest.fn().mockImplementation(() => ({ getAnswerById: jest.fn() })),
)

const accessibilityStudy = (status, index) => ({
  id: `study-${index}`,
  ...instantiateStudyByType(STUDY_TYPES.ACCESSIBILITY_MANUAL, {
    title: `Audit ${index}`,
    testAdmin: new StudyAdmin({ userDocId: 'user-1', email: 'a@b.c' }),
    status,
  }).toFirestore(),
})

const mountCards = async (locale, statuses) => {
  const wrapper = mount(ActiveStudies, {
    props: { studies: statuses.map(accessibilityStudy) },
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale,
          fallbackLocale: 'en',
          missingWarn: false,
          fallbackWarn: false,
          messages: { en, es },
        }),
      ],
      stubs: {
        'v-card': { template: '<div><slot /></div>' },
        'v-card-title': { template: '<div><slot /></div>' },
        'v-card-text': { template: '<div><slot /></div>' },
        'v-row': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-chip': { template: '<span class="status-chip"><slot /></span>' },
        'v-btn': { template: '<button><slot /></button>' },
        'v-icon': true,
        'v-progress-linear': true,
        'v-skeleton-loader': true,
      },
    },
  })
  await flushPromises()
  return wrapper.findAll('.status-chip').map((chip) => chip.text())
}

const statuses = ['draft', 'in-progress', 'completed', 'archived']

it('shows a label for every accessibility study status in English', async () => {
  expect(await mountCards('en', statuses)).toEqual(
    expect.arrayContaining(['Draft', 'In Progress', 'Completed', 'Archived']),
  )
})

it('shows a label for every accessibility study status in Spanish', async () => {
  expect(await mountCards('es', statuses)).toEqual(
    expect.arrayContaining([
      'Borrador',
      'En progreso',
      'Completado',
      'Archivado',
    ]),
  )
})

it('never shows a raw translation key on a study card', async () => {
  const labels = await mountCards('en', statuses)

  expect(labels).toHaveLength(statuses.length)
  labels.forEach((label) => expect(label).not.toMatch(/^Dashboard\./))
})
