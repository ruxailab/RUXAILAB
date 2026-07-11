import { mount, flushPromises } from '@vue/test-utils'
import { getDocs } from 'firebase/firestore'
import AuditTrailView from '@/shared/views/AuditTrailView.vue'

jest.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'study-1' } }),
}))

jest.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) =>
      ({
        'auditTrail.title': 'Audit Trail',
        'auditTrail.subtitle': 'Sensitive changes made to this study.',
        'auditTrail.loadError': 'Unable to load the audit trail.',
        'auditTrail.headers.time': 'Time',
        'auditTrail.headers.action': 'Action',
        'auditTrail.headers.actor': 'Actor',
        'auditTrail.headers.description': 'Description',
        'auditTrail.actions.study.edited': 'Study edited',
        'auditTrail.descriptions.studyUpdated': 'Updated {target}',
      })[key] || key,
    te: (key) =>
      [
        'auditTrail.actions.study.edited',
        'auditTrail.descriptions.studyUpdated',
      ].includes(key),
  }),
}))

jest.mock('@/app/plugins/firebase', () => ({ db: {} }))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'audit-collection'),
  getDocs: jest.fn(),
  orderBy: jest.fn(() => 'timestamp-order'),
  query: jest.fn(() => 'audit-query'),
}))

const mountView = () =>
  mount(AuditTrailView, {
    global: {
      stubs: {
        PageWrapper: {
          template: '<main><slot name="subtitle"/><slot/></main>',
        },
        VAlert: { template: '<div><slot/></div>' },
        VDataTable: { template: '<div data-test="audit-table" />' },
        VChip: { template: '<span><slot/></span>' },
      },
    },
  })

describe('AuditTrailView', () => {
  it('loads the owner-visible audit collection', async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'event-1',
          data: () => ({ action: 'study.edited', actorId: 'manager' }),
        },
      ],
    })

    const wrapper = mountView()
    await flushPromises()

    expect(getDocs).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-test="audit-table"]').exists()).toBe(true)
  })

  it('shows a safe message when audit loading is denied or fails', async () => {
    getDocs.mockRejectedValue(new Error('permission-denied'))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Unable to load the audit trail.')
  })
})
