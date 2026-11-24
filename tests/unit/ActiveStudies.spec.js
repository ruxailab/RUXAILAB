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

const testAdmin = new StudyAdmin({ userDocId: 'user-1', email: 'a@b.c' })

const buildStudy = (id, testType, data) => ({
  id,
  ...instantiateStudyByType(testType, { testAdmin, ...data }).toFirestore(),
})

const accessibilityStudy = (status, index) =>
  buildStudy(`study-${index}`, STUDY_TYPES.ACCESSIBILITY_MANUAL, {
    title: `Audit ${index}`,
    status,
  })

const mountActiveStudies = async (locale, studies) => {
  const wrapper = mount(ActiveStudies, {
    props: { studies },
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
  return wrapper
}

const mountCards = async (locale, statuses) => {
  const wrapper = await mountActiveStudies(
    locale,
    statuses.map(accessibilityStudy),
  )
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

describe('accessibility studies', () => {
  const day = 24 * 60 * 60 * 1000
  const now = Date.now()

  const userStudy = (title, daysAgo) =>
    buildStudy(title, STUDY_TYPES.USER, {
      testTitle: title,
      testDescription: `${title} description`,
      creationDate: now - daysAgo * day,
      status: 'active',
    })

  const auditStudy = (title, testType, daysAgo) =>
    buildStudy(title, testType, {
      title,
      description: `${title} description`,
      createdAt: new Date(now - daysAgo * day).toISOString(),
    })

  it('lists the four newest studies when some are accessibility studies', async () => {
    const wrapper = await mountActiveStudies('en', [
      auditStudy('Old audit', STUDY_TYPES.ACCESSIBILITY_AUTOMATIC, 10),
      userStudy('Study 6', 6),
      userStudy('Study 5', 5),
      userStudy('Study 4', 4),
      userStudy('Study 2', 2),
      auditStudy('New audit', STUDY_TYPES.ACCESSIBILITY_MANUAL, 0),
    ])

    expect(wrapper.findAll('h4').map((title) => title.text())).toEqual([
      'New audit',
      'Study 2',
      'Study 4',
      'Study 5',
    ])
  })

  it('shows the description of an accessibility study', async () => {
    const wrapper = await mountActiveStudies('en', [
      auditStudy('New audit', STUDY_TYPES.ACCESSIBILITY_MANUAL, 0),
    ])

    expect(wrapper.find('.description-wrapper').text()).toBe(
      'New audit description',
    )
  })
})
