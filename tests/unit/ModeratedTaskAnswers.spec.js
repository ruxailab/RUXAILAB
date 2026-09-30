import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'

const mockStore = { getters: {}, dispatch: jest.fn(), commit: jest.fn() }
jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useRoute: () => ({ params: { token: 'session-1' } }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase/index', () => ({ database: {} }))
jest.mock('firebase/database', () => ({
  ref: () => ({}),
  onValue: () => () => {},
  update: async () => {},
  get: async () => ({ exists: () => false, val: () => null }),
  remove: async () => {},
}))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {},
}))
jest.mock('@/shared/services/studyLoggingRuntime', () => ({
  createStudyLoggingRuntime: () => ({
    resumeAfterConsent: () => {},
    seedStructuredScope: () => {},
    checkpointStructuredScope: () => {},
    destroy: () => {},
  }),
}))
jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
  showWarning: jest.fn(),
  showInfo: jest.fn(),
  showSuccess: jest.fn(),
}))
jest.mock('@/shared/utils/animations', () => ({
  animateStepAnnouncement: jest.fn(),
}))
jest.mock('@/ux/UserTest/components/steps/WelcomeStep.vue', () => ({
  template: '<div />',
}))
jest.mock('@/ux/UserTest/components/steps/ModeratorWelcomeStep.vue', () => ({
  template: '<div />',
}))
jest.mock('@/ux/UserTest/components/steps/TaskStep.vue', () => ({
  name: 'TaskStep',
  props: ['tamAnswers', 'sartAnswers'],
  template: '<div />',
}))
jest.mock('@/shared/components/videoCall/VideoCallFactory.vue', () => ({
  template: '<div />',
}))
global.MediaStream = class {}
const ModeratedTestView =
  require('@/ux/UserTest/views/ModeratedTestView.vue').default

let wrapper
beforeEach(() => {
  window.scrollTo = jest.fn()
  mockStore.dispatch.mockResolvedValue(undefined)
  mockStore.getters = reactive({
    user: { id: 'participant', email: 'participant@example.test' },
    test: {
      id: 'study-1',
      testType: 'USER',
      subType: 'USER_MODERATED',
      testAdmin: { userDocId: 'owner' },
      cooperators: [],
      testStructure: {
        preTest: [],
        userTasks: [{ taskName: 'Task', taskType: 'tam-1' }],
        postTest: [],
      },
    },
    currentUserTestAnswer: {
      userDocId: 'participant',
      consentCompleted: true,
      tasks: [{ tamAnswers: { perceivedUsefulness: [5] } }],
    },
    mediaUrls: {},
  })
})
afterEach(() => wrapper?.unmount())

it('keeps moderated TAM and SART answers like unmoderated studies', async () => {
  wrapper = shallowMount(ModeratedTestView, {
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })
  await flushPromises()
  wrapper.vm.start = false
  wrapper.vm.globalIndex = 4
  wrapper.vm.taskIndex = 0
  await nextTick()

  const task = wrapper.findComponent({ name: 'TaskStep' })
  expect(task.props('tamAnswers')).toEqual({ perceivedUsefulness: [5] })

  task.vm.$emit('update:tamAnswers', { perceivedUsefulness: [5, 6] })
  task.vm.$emit('update:sartAnswers', { instability: 3 })

  expect(wrapper.vm.localTestAnswer.tasks[0].tamAnswers).toEqual({
    perceivedUsefulness: [5, 6],
  })
  expect(wrapper.vm.localTestAnswer.tasks[0].sartAnswers).toEqual({
    instability: 3,
  })
})
