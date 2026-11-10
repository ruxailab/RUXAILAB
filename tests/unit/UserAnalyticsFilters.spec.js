import { nextTick, reactive } from 'vue'
import { shallowMount } from '@vue/test-utils'

const mockStore = reactive({
  state: {
    Tests: {
      Test: {
        testStructure: {
          preTest: [
            {
              title: 'Country',
              type: 'selection',
              selectionFields: ['Brazil', 'Spain'],
            },
            { title: 'Occupation', type: 'text' },
          ],
          userTasks: [{ taskName: 'Task 1' }],
        },
      },
    },
    Answer: { testAnswerDocument: { id: 'answers-1' } },
  },
  getters: {
    test: { answersDocId: 'answers-1' },
    visibleUserAnswers: {
      u1: {
        userDocId: 'u1',
        fullName: 'Ana',
        preTestAnswer: [{ answer: 'Brazil' }, { answer: 'Designer' }],
        tasks: {},
      },
      u2: {
        userDocId: 'u2',
        fullName: 'Luis',
        preTestAnswer: [{ answer: 'Spain' }, { answer: '' }],
        tasks: {},
      },
    },
  },
})

jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: jest.fn(() => Promise.resolve()) }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock(
  '@/ux/UserTest/components/dialogs/SessionAnalyticsDialog.vue',
  () => ({ name: 'SessionAnalyticsDialog', render: () => null }),
)
jest.mock(
  '@/ux/UserTest/components/UnmoderatedTestAnalytics/TaskDetailsModal.vue',
  () => ({ name: 'TaskDetailsModal', render: () => null }),
)

const UserAnalytics =
  require('@/ux/UserTest/components/UnmoderatedTestAnalytics/UserAnalytics.vue').default

const mountView = () =>
  shallowMount(UserAnalytics, {
    global: {
      mocks: { $t: (key) => key },
      stubs: { SessionAnalyticsDialog: true, TaskDetailsModal: true },
    },
  })

const resetButton = (wrapper) =>
  wrapper
    .findAll('v-btn')
    .find((btn) => btn.attributes('prepend-icon') === 'mdi-filter-remove')

describe('UserAnalytics reset filters', () => {
  it('keeps Reset disabled when no filter is applied', () => {
    const wrapper = mountView()
    expect(wrapper.vm.hasActiveFilters).toBe(false)
    expect(resetButton(wrapper).attributes('disabled')).toBe('true')
  })

  it('enables Reset only while a filter actually narrows the list', async () => {
    const wrapper = mountView()

    wrapper.vm.onFilterChange(0, ['Brazil'])
    await nextTick()
    expect(wrapper.vm.tableData).toHaveLength(1)
    expect(wrapper.vm.hasActiveFilters).toBe(true)
    expect(resetButton(wrapper).attributes('disabled')).toBe('false')

    wrapper.vm.onFilterChange(0, [])
    await nextTick()
    expect(wrapper.vm.tableData).toHaveLength(2)
    expect(wrapper.vm.hasActiveFilters).toBe(false)
    expect(resetButton(wrapper).attributes('disabled')).toBe('true')

    wrapper.vm.onFilterChange(0, ['__ALL__'])
    await nextTick()
    expect(wrapper.vm.tableData).toHaveLength(2)
    expect(wrapper.vm.hasActiveFilters).toBe(false)

    wrapper.vm.selectedFilters[1] = 'design'
    await nextTick()
    expect(wrapper.vm.tableData).toHaveLength(1)
    expect(wrapper.vm.hasActiveFilters).toBe(true)

    wrapper.vm.selectedFilters[1] = null
    await nextTick()
    expect(wrapper.vm.tableData).toHaveLength(2)
    expect(wrapper.vm.hasActiveFilters).toBe(false)
    expect(resetButton(wrapper).attributes('disabled')).toBe('true')
  })
})
