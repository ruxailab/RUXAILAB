import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'

const mockStore = { getters: {}, dispatch: jest.fn(), commit: jest.fn() }
const mockRuntime = {
  resumeAfterConsent: jest.fn(),
  seedStructuredScope: jest.fn(),
  structuredChoiceChanged: jest.fn(),
  structuredSliderFocus: jest.fn(),
  checkpointStructuredScope: jest.fn(),
  taskStarted: jest.fn(),
  destroy: jest.fn(),
}
const mockCreateRuntime = jest.fn(() => mockRuntime)
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
  createStudyLoggingRuntime: (...args) => mockCreateRuntime(...args),
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
  template: '<div />',
}))
jest.mock('@/shared/components/videoCall/VideoCallFactory.vue', () => ({
  template: '<div />',
}))
global.MediaStream = class {}
const ModeratedTestView =
  require('@/ux/UserTest/views/ModeratedTestView.vue').default

const mountAs = async (userId) => {
  mockStore.getters = reactive({
    user: { id: userId, email: `${userId}@example.test` },
    test: {
      id: 'study-1',
      testType: 'USER',
      subType: 'USER_MODERATED',
      testAdmin: { userDocId: 'owner' },
      cooperators: [],
      testStructure: {
        preTest: [{ selectionField: true, selectionFields: ['Yes', 'No'] }],
        userTasks: [{ taskName: 'Task', taskType: 'nasa-tlx' }],
        postTest: [],
      },
    },
    currentUserTestAnswer: {
      userDocId: userId,
      consentCompleted: true,
      preTestAnswer: [{ answer: '' }],
      tasks: [{ nasaTlxAnswers: { effort: 3 } }],
    },
    mediaUrls: {},
  })
  const wrapper = shallowMount(ModeratedTestView, {
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })
  await flushPromises()
  wrapper.vm.start = false
  return wrapper
}

let wrapper
beforeEach(() => {
  window.scrollTo = jest.fn()
  mockCreateRuntime.mockImplementation(() => mockRuntime)
  mockStore.dispatch.mockResolvedValue(undefined)
})
afterEach(() => wrapper?.unmount())

it('logs moderated pre-test selections like unmoderated studies', async () => {
  wrapper = await mountAs('participant')
  wrapper.vm.globalIndex = 2
  wrapper.vm.taskIndex = 0
  await nextTick()

  expect(mockRuntime.seedStructuredScope).toHaveBeenCalledWith('preTest', {
    'preTest:question:0': '',
  })
  wrapper
    .findComponent({ name: 'PreTestStep' })
    .vm.$emit('selection-changed', {
      itemRef: 'preTest:question:0',
      value: 'Yes',
    })
  expect(mockRuntime.structuredChoiceChanged).toHaveBeenCalledWith(
    'preTest',
    'preTest:question:0',
    'Yes',
  )

  wrapper.vm.globalIndex = 3
  await nextTick()
  expect(mockRuntime.checkpointStructuredScope).toHaveBeenCalledWith('preTest')
})

it('logs moderated task entry and questionnaire activity', async () => {
  wrapper = await mountAs('participant')
  wrapper.vm.globalIndex = 4
  wrapper.vm.taskIndex = 0
  await nextTick()

  expect(mockRuntime.seedStructuredScope).toHaveBeenCalledWith(
    'task:0',
    expect.objectContaining({ 'nasa-tlx:effort': 3 }),
  )
  const task = wrapper.findComponent({ name: 'TaskStep' })
  task.vm.$emit('task-started', '2026-09-30T08:00:00.000Z')
  task.vm.$emit('structured-slider-focus', {
    scopeRef: 'task:0',
    itemRef: 'nasa-tlx:effort',
  })

  expect(mockRuntime.taskStarted).toHaveBeenCalledWith(
    0,
    '2026-09-30T08:00:00.000Z',
  )
  expect(mockRuntime.structuredSliderFocus).toHaveBeenCalledWith(
    'task:0',
    'nasa-tlx:effort',
  )
  expect(task.attributes()).not.toHaveProperty('onrecording-result')
})

it('never logs activity for the moderator', async () => {
  wrapper = await mountAs('owner')
  wrapper.vm.globalIndex = 2
  wrapper.vm.taskIndex = 0
  await nextTick()
  wrapper
    .findComponent({ name: 'PreTestStep' })
    .vm.$emit('selection-changed', {
      itemRef: 'preTest:question:0',
      value: 'Yes',
    })

  expect(mockCreateRuntime).not.toHaveBeenCalled()
  expect(mockRuntime.structuredChoiceChanged).not.toHaveBeenCalled()
})
