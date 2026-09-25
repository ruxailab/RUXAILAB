import { shallowMount, flushPromises } from '@vue/test-utils'
import { reactive, nextTick } from 'vue'

const mockStore = { getters: {}, dispatch: jest.fn(), commit: jest.fn() }
const mockRouter = { push: jest.fn() }
const mockRuntime = {
  recordingOutcome: jest.fn(),
  resumeAfterConsent: jest.fn(),
  taskFinished: jest.fn(),
  submitted: jest.fn(),
  seedStructuredScope: jest.fn(),
  structuredChoiceChanged: jest.fn(),
  structuredSliderFocus: jest.fn(),
  structuredSliderPointerStart: jest.fn(),
  structuredSliderValueChanged: jest.fn(),
  structuredSliderPointerEnd: jest.fn(),
  structuredSliderBlur: jest.fn(),
  checkpointStructuredScope: jest.fn().mockResolvedValue(null),
  checkpointStructuredScopes: jest.fn().mockResolvedValue([]),
  destroy: jest.fn(),
}
jest.mock('@/shared/utils/anonymousParticipantUtils', () => ({
  downloadAnonymousParticipantIdentifier: jest.fn(),
}))
jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
  showWarning: jest.fn(),
}))
jest.mock('nanoid', () => ({ nanoid: () => 'anonymous-participant' }))
jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({ useRouter: () => mockRouter }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: { callHttpsCallableFunction: jest.fn() },
}))
jest.mock('@/shared/services/studyLoggingRuntime', () => ({
  createStudyLoggingRuntime: () => mockRuntime,
}))
jest.mock('@/ux/UserTest/components/steps/WelcomeStep.vue', () => ({
  template: '<div />',
}))
jest.mock('@/ux/UserTest/components/IrisTracker.vue', () => ({
  template: '<div />',
}))
jest.mock(
  '@/ux/UserTest/components/calibration/EyeTrackingCalibrationStep.vue',
  () => ({ template: '<div />' }),
)
jest.mock('@/shared/utils/animations', () => ({
  animateStepAnnouncement: jest.fn(),
}))
global.MediaStream = class {}
const UserTestView = require('@/ux/UserTest/views/UserTestView.vue').default
const TaskStep = require('@/ux/UserTest/components/steps/TaskStep.vue').default
const result = {
  taskRef: 'task:0',
  mediaType: 'audio',
  outcome: 'completed',
  stage: 'upload',
}
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
let wrapper
const mountView = async () => {
  wrapper = shallowMount(UserTestView, {
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })
  await flushPromises()
  return wrapper.vm
}
beforeEach(() => {
  window.scrollTo = jest.fn()
  mockStore.getters = reactive({
    user: { id: 'participant', email: 'private-email' },
    test: {
      id: 'study-1',
      answersDocId: 'answer-1',
      testType: 'USER',
      subType: 'USER_UNMODERATED',
      testAdmin: { userDocId: 'owner' },
      testStructure: {
        userTasks: [{ taskType: 'no-answer', hasAudioRecord: true }],
        preTest: [],
        postTest: [],
      },
    },
    currentUserTestAnswer: {
      consentCompleted: true,
      tasks: [{ taskAnswer: 'private-answer', attempted: false }],
    },
    mediaUrls: {},
  })
  mockStore.dispatch.mockResolvedValue(undefined)
})
afterEach(() => wrapper?.unmount())

it('emits completion only after the uploaded reference is attached and answer persistence resolves', async () => {
  const vm = await mountView()
  mockStore.getters.mediaUrls = { 0: { audio: 'private-url' } }
  vm.handleRecordingResult(result)
  expect(mockRuntime.recordingOutcome).not.toHaveBeenCalled()
  const save = deferred()
  mockStore.dispatch.mockImplementation((action) =>
    action === 'saveTestAnswer' ? save.promise : Promise.resolve(),
  )
  const saving = vm.savePartialAnswer()
  expect(mockStore.dispatch).toHaveBeenLastCalledWith(
    'saveTestAnswer',
    expect.objectContaining({
      data: expect.objectContaining({
        tasks: expect.objectContaining({
          0: expect.objectContaining({ audioRecordURL: 'private-url' }),
        }),
      }),
    }),
  )
  expect(mockRuntime.recordingOutcome).not.toHaveBeenCalled()
  save.resolve()
  await saving
  expect(mockRuntime.recordingOutcome).toHaveBeenCalledTimes(1)
  expect(mockRuntime.recordingOutcome).toHaveBeenCalledWith(result)
  expect(JSON.stringify(mockRuntime.recordingOutcome.mock.calls)).not.toContain(
    'private-',
  )
})

it.each([false, true])(
  'gates task and recording completion after save failure (waiting for uploads: %s)',
  async (waiting) => {
    const vm = await mountView()
    mockStore.getters.mediaUrls = { 0: { audio: 'private-url' } }
    vm.handleRecordingResult(result)
    mockStore.dispatch.mockRejectedValueOnce(new Error('save failed'))
    vm.isLoading = waiting
    await vm.handleTaskFinish(true)
    if (waiting) {
      vm.isLoading = false
      await nextTick()
      await flushPromises()
    }
    expect(mockRuntime.recordingOutcome).not.toHaveBeenCalled()
    expect(mockRuntime.taskFinished).not.toHaveBeenCalled()
    await vm.handleTaskFinish(true)
    await flushPromises()
    expect(mockRuntime.recordingOutcome).toHaveBeenCalledTimes(1)
    expect(mockRuntime.taskFinished).toHaveBeenCalledWith(0, expect.any(String))
  },
)

it('captures finish time before persistence and refreshes it on retry', async () => {
  const vm = await mountView()
  const first = '2026-09-24T10:15:30.000Z'
  const second = '2026-09-24T10:16:30.000Z'
  const timeSpy = jest
    .spyOn(Date.prototype, 'toISOString')
    .mockReturnValueOnce(first)
    .mockReturnValue(second)
  const save = deferred()
  mockStore.dispatch.mockImplementation((action) =>
    action === 'saveTestAnswer' ? save.promise : Promise.resolve(),
  )

  try {
    const finishing = vm.handleTaskFinish(true)
    await flushPromises()
    expect(mockRuntime.taskFinished).not.toHaveBeenCalled()

    save.resolve()
    await finishing
    expect(mockRuntime.taskFinished).toHaveBeenCalledWith(0, first)

    await vm.handleTaskFinish(true)
    await flushPromises()
    expect(mockRuntime.taskFinished).toHaveBeenCalledTimes(2)
    expect(mockRuntime.taskFinished.mock.calls).toEqual([
      [0, first],
      [0, second],
    ])
  } finally {
    timeSpy.mockRestore()
  }
})

it('does not acknowledge an unattached media result or a result arriving during an earlier save', async () => {
  const vm = await mountView()
  vm.handleRecordingResult(result)
  await vm.savePartialAnswer()
  expect(mockRuntime.recordingOutcome).not.toHaveBeenCalled()
  const save = deferred()
  mockStore.dispatch.mockReturnValueOnce(save.promise)
  const saving = vm.savePartialAnswer()
  mockStore.getters.mediaUrls = { 0: { audio: 'private-url' } }
  vm.handleRecordingResult({ ...result })
  save.resolve()
  await saving
  expect(mockRuntime.recordingOutcome).not.toHaveBeenCalled()
  await vm.savePartialAnswer()
  expect(mockRuntime.recordingOutcome).toHaveBeenCalledTimes(1)
})

it('keeps submission retryable and does not navigate or log submission after a failed save', async () => {
  const vm = await mountView()
  mockStore.dispatch.mockRejectedValueOnce(new Error('save failed'))
  await vm.submitAnswer()
  expect(mockRuntime.submitted).not.toHaveBeenCalled()
  expect(mockRouter.push).not.toHaveBeenCalled()
  expect(vm.localTestAnswer.submitted).toBe(false)
  expect(vm.isLoading).toBe(false)
  await vm.submitAnswer()
  expect(mockRuntime.submitted).toHaveBeenCalledTimes(1)
  expect(mockRouter.push).toHaveBeenCalled()
})

it.each(['before consent', 'anonymous'])(
  'does not observe recordings %s',
  async (condition) => {
    if (condition === 'anonymous') mockStore.getters.user = null
    else mockStore.getters.currentUserTestAnswer.consentCompleted = false
    const vm = await mountView()
    vm.handleRecordingResult({
      ...result,
      outcome: 'failed',
      reason: 'uploadError',
    })
    vm.handleRecordingResult(result)
    mockStore.getters.mediaUrls = { 0: { audio: 'private-url' } }
    await vm.savePartialAnswer()
    expect(mockRuntime.recordingOutcome).not.toHaveBeenCalled()
  },
)

it('keeps task completion working when the logging queue rejects', async () => {
  const vm = await mountView()
  mockRuntime.recordingOutcome.mockRejectedValue(new Error('queue unavailable'))
  mockStore.getters.mediaUrls = { 0: { audio: 'private-url' } }
  vm.handleRecordingResult(result)
  await vm.handleTaskFinish(true)
  await flushPromises()
  expect(mockRuntime.taskFinished).toHaveBeenCalledWith(0, expect.any(String))
  expect(vm.localTestAnswer.tasks[0].attempted).toBe(true)
})

it('forwards each recorder result through TaskStep without treating spinner completion as success', async () => {
  wrapper = shallowMount(TaskStep, {
    props: {
      task: {
        taskType: 'no-answer',
        hasAudioRecord: true,
        hasCamRecord: true,
        hasScreenRecord: true,
      },
      taskIndex: 0,
    },
    global: {
      mocks: { $vuetify: { display: {} } },
      stubs: { ShowInfo: { template: '<div><slot name="content" /></div>' } },
    },
  })
  for (const [name, mediaType] of [
    ['AudioRecorder', 'audio'],
    ['VideoRecorder', 'webcam'],
    ['ScreenRecorder', 'screen'],
  ]) {
    const recorder = wrapper.findComponent({ name })
    recorder.vm.$emit('show-loading')
    recorder.vm.$emit('stop-show-loading')
    expect(wrapper.emitted('recording-result')?.length || 0).toBe(
      ['audio', 'webcam', 'screen'].indexOf(mediaType),
    )
    recorder.vm.$emit('recording-result', { ...result, mediaType })
  }
  expect(wrapper.emitted('recording-result')).toEqual(
    ['audio', 'webcam', 'screen'].map((mediaType) => [
      { ...result, mediaType },
    ]),
  )
})

it('observes each successful active-task entry only after setup succeeds', async () => {
  wrapper = shallowMount(TaskStep, {
    props: { task: { taskType: 'no-answer' }, taskIndex: 0 },
    global: {
      mocks: { $vuetify: { display: {} } },
      stubs: { ShowInfo: { template: '<div><slot name="content" /></div>' } },
    },
  })

  const taskStep = wrapper.vm.$.setupState
  await taskStep.startTask()

  const firstObservation = wrapper.emitted('taskStarted')?.[0]?.[0]
  expect(firstObservation).toEqual(expect.any(String))
  expect(Number.isNaN(Date.parse(firstObservation))).toBe(false)
  expect(wrapper.emitted('startTask')).toHaveLength(1)

  // Re-running setup while the task is active is not another entry.
  await taskStep.startTask()
  expect(wrapper.emitted('taskStarted')).toHaveLength(1)

  // A later transition back into the active stage is a new observation.
  taskStep.stage = 2
  await taskStep.startTask()
  expect(wrapper.emitted('taskStarted')).toHaveLength(2)
})

it('does not observe a task when screen-share setup is cancelled or denied', async () => {
  const captureScreen = jest.fn().mockResolvedValue(false)
  wrapper = shallowMount(TaskStep, {
    props: {
      task: { taskType: 'no-answer', hasScreenRecord: true },
      taskIndex: 0,
    },
    global: {
      mocks: { $vuetify: { display: {} } },
      stubs: {
        ShowInfo: { template: '<div><slot name="content" /></div>' },
        ScreenRecorder: {
          template: '<div />',
          setup() {
            return { captureScreen }
          },
        },
      },
    },
  })

  const taskStep = wrapper.vm.$.setupState
  await taskStep.startTask()
  expect(wrapper.emitted('taskStarted')).toBeUndefined()
  taskStep.cancelScreenSharePrompt()
  expect(wrapper.emitted('taskStarted')).toBeUndefined()

  // A denied/cancelled browser permission returns false from setup.
  taskStep.showScreenSharePrompt = true
  await taskStep.confirmScreenShare()
  expect(captureScreen).toHaveBeenCalledTimes(1)
  expect(wrapper.emitted('taskStarted')).toBeUndefined()
})

it('normalizes fresh and partial TAM answers by configured task type', () => {
  const cases = [
    {
      taskType: 'tam-1',
      construct: 'perceivedUsefulness',
      size: 10,
      tamAnswers: {},
    },
    {
      taskType: 'tam-2',
      construct: 'resultDemonstrability',
      size: 4,
      tamAnswers: { resultDemonstrability: [, , 7] },
    },
    {
      taskType: 'tam-3',
      construct: 'perceivedEnjoyment',
      size: 3,
      tamAnswers: { perceivedEnjoyment: [, , 5] },
    },
  ]

  for (const testCase of cases) {
    wrapper = shallowMount(TaskStep, {
      props: {
        task: { taskType: testCase.taskType },
        taskIndex: 0,
        tamAnswers: testCase.tamAnswers,
      },
      global: {
        mocks: { $vuetify: { display: {} } },
        stubs: { ShowInfo: { template: '<div />' } },
      },
    })

    const normalized = wrapper.vm.$.setupState.localTamAnswers
    expect(normalized[testCase.construct]).toHaveLength(testCase.size)
    if (testCase.tamAnswers[testCase.construct]) {
      expect(normalized[testCase.construct][2]).toBe(
        testCase.tamAnswers[testCase.construct][2],
      )
    }

    wrapper.unmount()
    wrapper = undefined
  }
})
