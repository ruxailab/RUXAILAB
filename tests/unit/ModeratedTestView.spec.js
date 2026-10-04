import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'

const mockStore = { getters: {}, dispatch: jest.fn(), commit: jest.fn() }
const mockUpdates = []
const mockRuntime = {
  resumeAfterConsent: jest.fn(),
  seedStructuredScope: jest.fn(),
  structuredChoiceChanged: jest.fn(),
  structuredSliderFocus: jest.fn(),
  checkpointStructuredScope: jest.fn(),
  taskStarted: jest.fn(),
  recordingOutcome: jest.fn(),
  submitted: jest.fn(),
  destroy: jest.fn(),
}
const mockCreateRuntime = jest.fn()
jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useRoute: () => ({ params: { token: 'session-1' } }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase/index', () => ({ database: {} }))
jest.mock('firebase/database', () => ({
  ref: (_database, path) => ({ path }),
  onValue: () => () => {},
  update: async (target, value) => {
    mockUpdates.push({ path: target?.path, value })
  },
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
  props: ['tamAnswers', 'sartAnswers'],
  template: '<div />',
}))
jest.mock('@/shared/components/videoCall/VideoCallFactory.vue', () => ({
  template: '<div />',
}))
global.MediaStream = class {}
const ModeratedTestView =
  require('@/ux/UserTest/views/ModeratedTestView.vue').default

const mountModerated = async ({
  userId = 'participant',
  email = `${userId}@example.test`,
  userTasks = [{ taskName: 'Task', taskType: 'nasa-tlx' }],
  answer = {},
  session = null,
} = {}) => {
  mockStore.getters = reactive({
    user: { id: userId, email },
    test: {
      id: 'study-1',
      testType: 'USER',
      subType: 'USER_MODERATED',
      testAdmin: { userDocId: 'owner' },
      studyRoleMap: { participant: 5 },
      cooperators: [],
      testStructure: {
        preTest: [{ selectionField: true, selectionFields: ['Yes', 'No'] }],
        userTasks,
        postTest: [],
      },
    },
    currentUserTestAnswer: {
      userDocId: userId,
      consentCompleted: true,
      preTestAnswer: [{ answer: '' }],
      tasks: [{ nasaTlxAnswers: { effort: 3 } }],
      ...answer,
    },
    session,
    mediaUrls: {},
  })
  const mounted = shallowMount(ModeratedTestView, {
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })
  await flushPromises()
  mounted.vm.start = false
  return mounted
}

const goToStep = async (globalIndex, taskIndex = 0) => {
  wrapper.vm.globalIndex = globalIndex
  wrapper.vm.taskIndex = taskIndex
  await nextTick()
}

let wrapper
beforeEach(() => {
  window.scrollTo = jest.fn()
  mockCreateRuntime.mockImplementation(() => mockRuntime)
  mockStore.dispatch.mockResolvedValue(undefined)
  mockUpdates.length = 0
})
afterEach(() => wrapper?.unmount())

describe('moderated logging', () => {
  it('logs pre-test selections like unmoderated studies', async () => {
    wrapper = await mountModerated()
    await goToStep(2)

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

    await goToStep(3)
    expect(mockRuntime.checkpointStructuredScope).toHaveBeenCalledWith(
      'preTest',
    )
  })

  it('logs task entry and questionnaire activity', async () => {
    wrapper = await mountModerated()
    await goToStep(4)

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
  })

  it('never logs activity for the moderator', async () => {
    wrapper = await mountModerated({ userId: 'owner' })
    await goToStep(2)
    wrapper
      .findComponent({ name: 'PreTestStep' })
      .vm.$emit('selection-changed', {
        itemRef: 'preTest:question:0',
        value: 'Yes',
      })

    expect(mockCreateRuntime).not.toHaveBeenCalled()
    expect(mockRuntime.structuredChoiceChanged).not.toHaveBeenCalled()
  })

  it('logs recording outcomes once the media link is saved', async () => {
    wrapper = await mountModerated()
    await goToStep(4)
    const task = wrapper.findComponent({ name: 'TaskStep' })
    const failed = {
      taskRef: 'task:0',
      mediaType: 'webcam',
      outcome: 'failed',
      stage: 'permission',
      reason: 'deviceUnavailable',
    }
    const saved = {
      taskRef: 'task:0',
      mediaType: 'audio',
      outcome: 'completed',
      stage: 'upload',
    }

    task.vm.$emit('recording-result', failed)
    task.vm.$emit('recording-result', saved)
    expect(mockRuntime.recordingOutcome).toHaveBeenCalledWith(failed)
    expect(mockRuntime.recordingOutcome).not.toHaveBeenCalledWith(saved)

    mockStore.getters.mediaUrls = { 0: { audio: 'https://example.test/a' } }
    await wrapper.vm.saveAnswer()

    expect(mockRuntime.recordingOutcome).toHaveBeenCalledWith(saved)
  })
})

describe('moderated answers', () => {
  it('keeps TAM and SART answers like unmoderated studies', async () => {
    wrapper = await mountModerated({
      userTasks: [{ taskName: 'Task', taskType: 'tam-1' }],
      answer: { tasks: [{ tamAnswers: { perceivedUsefulness: [5] } }] },
    })
    await goToStep(4)

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
})

describe('moderated session', () => {
  it('does not treat a participant as an observer before the session loads', async () => {
    wrapper = await mountModerated({ email: 'Participant@Example.test' })

    expect(wrapper.vm.isObservator).toBe(false)
    expect(wrapper.vm.currentUserAccessLevel).toBe(5)
  })

  it('recognises a session participant saved without a user ID by email', async () => {
    wrapper = await mountModerated({
      email: 'Participant@Example.test',
      session: {
        staff: [{ userDocId: 'owner', role: 'FACILITATOR' }],
        participants: [
          { userDocId: null, email: 'participant@example.test', role: 5 },
        ],
      },
    })

    expect(wrapper.vm.isObservator).toBe(false)
    expect(wrapper.vm.isModerator).toBe(false)
    expect(wrapper.vm.currentUserAccessLevel).toBe(5)
  })

  it('does not re-run Start once the session has started', async () => {
    const requestFullscreen = jest.fn(async () => {})
    document.documentElement.requestFullscreen = requestFullscreen
    wrapper = await mountModerated({
      session: {
        staff: [{ userDocId: 'owner', role: 'FACILITATOR' }],
        participants: [{ userDocId: 'participant', role: 5 }],
      },
    })
    requestFullscreen.mockClear()

    await wrapper.vm.startTest()
    await wrapper.vm.startTest()

    expect(requestFullscreen).toHaveBeenCalledTimes(1)
  })

  it('shares finished tasks and submission with the facilitator', async () => {
    wrapper = await mountModerated({
      userTasks: [{ taskType: 'sus' }, { taskType: 'sus' }],
      session: { participants: [{ userDocId: 'participant', role: 5 }] },
      answer: {
        preTestCompleted: true,
        postTestCompleted: true,
        tasks: [
          { attempted: true, completed: true },
          { attempted: true, completed: false },
        ],
      },
    })
    mockUpdates.length = 0

    expect(wrapper.vm.completedSteps.tasks).toBe(true)
    await wrapper.vm.handleSubmit()
    await flushPromises()

    const published = mockUpdates.filter((item) => item.value?.progress).pop()
    expect(published.path).toBe('calls/study-1/participants/participant')
    expect(published.value.progress).toMatchObject({
      tasks: true,
      completion: true,
    })
  })
})
