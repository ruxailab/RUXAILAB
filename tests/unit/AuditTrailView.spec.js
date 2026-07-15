import { mount, flushPromises } from '@vue/test-utils'
import { getDoc, getDocs } from 'firebase/firestore'
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
        'auditTrail.filters.activity': 'Activity',
        'auditTrail.filters.when': 'When',
        'auditTrail.filters.person': 'Person',
        'auditTrail.filters.allActivity': 'All activity',
        'auditTrail.filters.study': 'Study changes',
        'auditTrail.filters.settings': 'Settings changes',
        'auditTrail.filters.team': 'Team access',
        'auditTrail.filters.files': 'File changes',
        'auditTrail.filters.anyTime': 'Any time',
        'auditTrail.filters.last7Days': 'Last 7 days',
        'auditTrail.filters.last30Days': 'Last 30 days',
        'auditTrail.filters.anyone': 'Anyone',
        'auditTrail.filters.clear': 'Clear filters',
        'auditTrail.noMatchingEvents': 'No activity matches your filters.',
        'auditTrail.noEvents': 'No activity has been recorded yet.',
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
  doc: jest.fn(() => 'study-document'),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(() => 'timestamp-order'),
  query: jest.fn(() => 'audit-query'),
}))

const mountView = () =>
  mount(AuditTrailView, {
    global: {
      stubs: {
        PageWrapper: {
          template:
            '<main><slot name="subtitle"/><slot name="filters"/><slot/></main>',
        },
        VAlert: { template: '<div><slot/></div>' },
        VDataTable: {
          props: ['items', 'noDataText'],
          template:
            '<div data-test="audit-table"><span v-if="items.length === 0" data-test="audit-empty">{{ noDataText }}</span><span v-for="item in items" :key="item.id">{{ item.id }}</span></div>',
        },
        VChip: { template: '<span><slot/></span>' },
        VSelect: {
          props: ['items', 'modelValue'],
          emits: ['update:modelValue'],
          template:
            '<select v-bind="$attrs" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="item in items" :key="item.value" :value="item.value">{{ item.title }}</option></select>',
        },
        VBtn: {
          emits: ['click'],
          template:
            '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>',
        },
      },
    },
  })

describe('AuditTrailView', () => {
  it('loads the owner-visible audit collection', async () => {
    getDoc.mockResolvedValue({ data: () => ({}) })
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
    getDoc.mockResolvedValue({ data: () => ({}) })
    getDocs.mockRejectedValue(new Error('permission-denied'))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Unable to load the audit trail.')
  })

  it('distinguishes an empty trail from a filter with no matching activity', async () => {
    getDoc.mockResolvedValue({ data: () => ({}) })
    getDocs.mockResolvedValue({ docs: [] })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="audit-empty"]').text()).toBe(
      'No activity has been recorded yet.',
    )
  })

  it('filters activity by category and people from the study owner and members', async () => {
    getDoc.mockResolvedValue({
      data: () => ({
        testAdmin: { userDocId: 'owner-id', email: 'owner@example.com' },
        cooperators: [{ userDocId: 'member-id', email: 'member@example.com' }],
      }),
    })
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'study-event',
          data: () => ({ action: 'study.edited', actorId: 'owner-id' }),
        },
        {
          id: 'team-event',
          data: () => ({
            action: 'cooperator.roleChanged',
            actorId: 'member-id',
          }),
        },
      ],
    })

    const wrapper = mountView()
    await flushPromises()

    const filters = wrapper.findAll('[data-test="audit-filter"]')
    expect(filters).toHaveLength(3)
    expect(filters[2].text()).toContain('owner@example.com')
    expect(filters[2].text()).toContain('member@example.com')

    await filters[0].setValue('team')
    expect(wrapper.find('[data-test="audit-table"]').text()).toContain(
      'team-event',
    )
    expect(wrapper.find('[data-test="audit-table"]').text()).not.toContain(
      'study-event',
    )

    await filters[2].setValue('owner-id')
    expect(wrapper.find('[data-test="audit-table"]').text()).toBe(
      'No activity matches your filters.',
    )
  })
})
