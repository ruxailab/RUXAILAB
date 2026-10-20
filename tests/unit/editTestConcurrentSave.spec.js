import { shallowMount, flushPromises } from '@vue/test-utils'

const subscribers = []
const mockStudyController = jest.fn()
jest.mock('@/controllers/StudyController', () => mockStudyController)

const mockStore = {
  getters: {},
  dispatch: jest.fn(),
  commit: jest.fn(),
}

jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'study-1' } }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase', () => ({
  auth: {},
  db: {},
  fbFunctions: {},
  storage: {},
  database: {},
}))
jest.mock('@/shared/utils/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}))

import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'

const EditTestView = require('@/ux/UserTest/views/EditTestView.vue').default

const vuetify = {
  display: {},
  theme: { current: { colors: { 'on-surface': '#000000' } } },
}

const rawStudy = {
  id: 'study-1',
  testType: 'USER',
  testTitle: 'Concurrent Editing Demo Study',
  testAdmin: { userDocId: 'owner', email: 'owner@example.test' },
  cooperators: [],
  testStructure: {
    welcomeMessage: '',
    finalMessage: '',
    preTest: [],
    userTasks: [{ taskName: 'Original task' }],
    postTest: [],
    consent: '',
  },
}

describe('the USER study editor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    subscribers.length = 0
    mockStudyController.mockImplementation(() => ({
      subscribeToStudy: (_id, callback) => {
        subscribers.push(callback)
        return () => {}
      },
    }))
    mockStore.getters = {
      test: instantiateStudyByType('USER', rawStudy),
      'UserStudy/tasks': rawStudy.testStructure.userTasks,
      'UserStudy/preTest': [],
      'UserStudy/postTest': [],
    }
  })

  it('sends the loaded study snapshot with the save', async () => {
    const wrapper = shallowMount(EditTestView, {
      global: {
        mocks: { $t: (key) => key, $vuetify: vuetify },
        stubs: {
          PageWrapper: { template: '<div><slot /><slot name="subtitle" /></div>' },
        },
      },
    })

    // The editor receives the study from the live subscription.
    subscribers[0](instantiateStudyByType('USER', rawStudy))
    await wrapper.vm.$nextTick()

    wrapper.findComponent('button-save-stub').vm.$emit('click')
    await flushPromises()

    const [action, payload] = mockStore.dispatch.mock.calls.find(
      ([name]) => name === 'updateStudy',
    )
    expect(action).toBe('updateStudy')
    expect(payload.base.testTitle).toBe('Concurrent Editing Demo Study')
    expect(payload.base.testStructure.userTasks.map((task) => task.taskName)).toEqual([
      'Original task',
    ])
    expect(payload.study.testStructure.userTasks.map((task) => task.taskName)).toEqual([
      'Original task',
    ])
  })
})
