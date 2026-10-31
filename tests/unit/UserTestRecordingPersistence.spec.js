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
jest.mock('@/app/plugins/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'participant' } },
}))
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
const mountView = async (props = {}, { inspectSteps = false } = {}) => {
  wrapper = shallowMount(UserTestView, {
    props,
    global: {
      mocks: { $t: (key) => key, $vuetify: { display: {} } },
      stubs: inspectSteps
        ? {
            TaskStep: false,
            PreTestStep: false,
            PostTestStep: false,
            ShowInfo: { template: '<div><slot name="content" /></div>' },
          }
        : {},
    },
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

it.each([false, true])(
  'browses empty preview tasks and questionnaires forwards and backwards (optional questionnaires: %s)',
  async (withQuestionnaires) => {
    mockStore.getters.test.testStructure.userTasks = [
      { taskType: 'sus', hasEye: true, taskLink: 'https://example.com' },
      { taskType: 'no-answer' },
    ]
    if (withQuestionnaires) {
      for (const key of ['preTest', 'postTest']) {
        mockStore.getters.test.testStructure[key] = [
          { title: 'First question', textField: true },
          { title: 'Second question', textField: true },
        ]
      }
    }
    const open = jest.spyOn(window, 'open')
    try {
      const vm = await mountView({ preview: true }, { inspectSteps: true })
      const initialAnswer = JSON.stringify(vm.localTestAnswer)
      expect(wrapper.classes()).toContain('study-preview-start')
      const nav = () =>
        wrapper.findComponent({ name: 'StudyPreviewNavigation' })
      const next = async () => {
        nav().vm.$emit('next')
        await flushPromises()
      }
      const previous = async () => {
        nav().vm.$emit('previous')
        await flushPromises()
      }
      expect(nav().props('canPrevious')).toBe(false)
      await vm.navigatePreview(-1)
      expect(vm.start).toBe(true)
      await next()
      expect(vm.globalIndex).toBe(0)
      expect(wrapper.classes()).not.toContain('study-preview-start')
      await next()
      expect(vm.globalIndex).toBe(1)
      if (withQuestionnaires) {
        await next()
        expect(vm.globalIndex).toBe(2)
        const preTest = wrapper.findComponent({ name: 'PreTestStep' })
        await next()
        expect(preTest.vm.$.setupState.step).toBe(1)
        await previous()
        expect(preTest.vm.$.setupState.step).toBe(0)
        await next()
      }
      await next()
      expect(vm.globalIndex).toBe(3)
      await next()
      expect(vm.globalIndex).toBe(4)
      const task = () => wrapper.findComponent(TaskStep).vm.$.setupState
      expect(task().stage).toBe(1)
      expect(task().currentPreviewStep).toBe('recording')
      await next()
      expect(task().currentPreviewStep).toBe('link')
      await next()
      expect(task().stage).toBe(2)
      await next()
      expect(task().stage).toBe(3)
      await next()
      expect(task().stage).toBe(4)
      expect(task().shouldDisableFinishButton).toBe(true)
      await next()
      expect(task().stage).toBe(5)
      await next()
      expect(vm.taskIndex).toBe(1)
      expect(task().stage).toBe(2)
      await previous()
      expect(vm.taskIndex).toBe(0)
      expect(task().stage).toBe(5)
      await next()
      expect(vm.taskIndex).toBe(1)
      await next()
      expect(task().stage).toBe(3)
      await next()
      expect(task().stage).toBe(5)
      await next()
      if (withQuestionnaires) {
        expect(vm.globalIndex).toBe(5)
        await next()
        expect(
          wrapper.findComponent({ name: 'PostTestStep' }).vm.$.setupState.step,
        ).toBe(1)
        await next()
      }
      expect(wrapper.findComponent({ name: 'FinishStep' }).exists()).toBe(true)
      expect(nav().props('canNext')).toBe(false)
      await next()
      expect(vm.globalIndex).toBe(6)
      expect(JSON.stringify(vm.localTestAnswer)).toBe(initialAnswer)
      await previous()
      if (withQuestionnaires) {
        expect(vm.globalIndex).toBe(5)
        expect(
          wrapper.findComponent({ name: 'PostTestStep' }).vm.$.setupState.step,
        ).toBe(1)
        await previous()
        await previous()
      }
      expect(vm.taskIndex).toBe(1)
      expect(task().stage).toBe(5)
      expect(open).not.toHaveBeenCalled()
      expect(mockStore.dispatch).not.toHaveBeenCalled()
      expect(mockRuntime.taskFinished).not.toHaveBeenCalled()
      expect(mockRuntime.resumeAfterConsent).not.toHaveBeenCalled()
    } finally {
      open.mockRestore()
    }
  },
)

it('does not expose navigation or bypass validation in normal Answer mode', async () => {
  const vm = await mountView()
  expect(
    wrapper.findComponent({ name: 'StudyPreviewNavigation' }).exists(),
  ).toBe(false)
  await vm.navigatePreview(1)
  expect(vm.start).toBe(true)
})

it.each([0, 1])(
  'skips unconfigured preview stages without requiring task completion (tasks: %s)',
  async (taskCount) => {
    mockStore.getters.test.testStructure.userTasks = Array.from(
      { length: taskCount },
      () => ({ taskType: 'no-answer' }),
    )
    const vm = await mountView({ preview: true }, { inspectSteps: true })
    const initialAnswer = JSON.stringify(vm.localTestAnswer)
    expect(vm.showPreTasksStep).toBe(false)
    expect(vm.previewSteps.map((step) => step.globalIndex)).toEqual([
      0,
      0,
      1,
      ...Array(taskCount).fill(4),
      6,
    ])
    await vm.navigatePreview(1)
    await vm.navigatePreview(1)
    await vm.navigatePreview(1)
    if (taskCount) {
      expect(vm.globalIndex).toBe(4)
      const task = wrapper.findComponent(TaskStep).vm.$.setupState
      expect(task.stage).toBe(2)
      await vm.navigatePreview(1)
      expect(task.stage).toBe(3)
      await vm.navigatePreview(1)
      expect(task.stage).toBe(5)
      await vm.navigatePreview(1)
    }
    expect(vm.globalIndex).toBe(6)
    expect(wrapper.findComponent({ name: 'FinishStep' }).exists()).toBe(true)
    expect(JSON.stringify(vm.localTestAnswer)).toBe(initialAnswer)
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  },
)

it('keeps preview answers, completion, calibration and logging isolated from real responses', async () => {
  const saved = mockStore.getters.currentUserTestAnswer
  saved.submitted = true
  mockStore.getters.test.status = 'draft'
  mockStore.getters.test.endDate = '2000-01-01'
  const vm = await mountView({ preview: true })
  expect(vm.localTestAnswer.submitted).toBe(false)
  expect(vm.localTestAnswer.tasks[0].taskAnswer).toBe('')
  expect(vm.isStartTestDisabled).toBe(false)
  expect(vm.studyAllowsMobileTaskInstructions).toBe(false)
  vm.localTestAnswer.tasks[0].taskAnswer = 'Temporary response'
  await vm.savePartialAnswer()
  vm.openCalibration()
  await flushPromises()
  expect(vm.calibrationPopup).toBeNull()
  await vm.submitAnswer()
  expect(mockRouter.push).toHaveBeenCalledWith(
    '/userTest/unmoderated/manager/study-1',
  )
  expect(mockStore.dispatch).not.toHaveBeenCalled()
  expect(mockRuntime.resumeAfterConsent).not.toHaveBeenCalled()
  expect(mockRuntime.submitted).not.toHaveBeenCalled()
  expect(saved.tasks[0].taskAnswer).toBe('private-answer')
  expect(saved.submitted).toBe(true)
})

it.each([false, true])(
  'skips eye-tracking calibration in preview and reaches the task (pre-test: %s)',
  async (hasPreTest) => {
    mockStore.getters.test.testStructure.userTasks[0].hasEye = true
    if (hasPreTest) {
      mockStore.getters.test.testStructure.preTest = [{ question: 'Question' }]
    }
    const open = jest.spyOn(window, 'open')
    try {
      const vm = await mountView({ preview: true })
      expect(vm.hasEyeTracking).toBe(false)
      vm.start = false
      await vm.completeStep(0, 'consent')
      if (hasPreTest) {
        expect(vm.globalIndex).toBe(2)
        await vm.completeStep(0, 'preTest')
      }
      expect(vm.globalIndex).toBe(3)
      expect(vm.isOnPreTasksStage).toBe(true)
      await vm.enterPendingTask()
      expect(vm.globalIndex).toBe(4)
      expect(vm.isOnTaskStage).toBe(true)
      expect(vm.taskIndex).toBe(0)
      await vm.handleTaskFinish(true)
      expect(vm.localTestAnswer.tasks[0].attempted).toBe(true)
      expect(vm.localTestAnswer.postTestCompleted).toBe(true)
      expect(vm.globalIndex).toBe(6)
      expect(open).not.toHaveBeenCalled()
      expect(mockStore.dispatch).not.toHaveBeenCalled()
    } finally {
      open.mockRestore()
    }
  },
)

it('retains the calibration stage when answering an eye-tracking study normally', async () => {
  mockStore.getters.test.testStructure.userTasks[0].hasEye = true
  const vm = await mountView()
  expect(vm.hasEyeTracking).toBe(true)
  await vm.completeStep(0, 'consent')
  expect(vm.globalIndex).toBe(3)
  expect(vm.isOnPreTasksStage).toBe(false)
  expect(vm.isOnTaskStage).toBe(false)
})

it('advances out of a calibration screen already open in preview without opening a popup', async () => {
  mockStore.getters.test.testStructure.userTasks[0].hasEye = true
  const open = jest.spyOn(window, 'open')
  try {
    const vm = await mountView({ preview: true })
    vm.openCalibration()
    await flushPromises()
    expect(vm.isOnPreTasksStage).toBe(true)
    expect(open).not.toHaveBeenCalled()
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  } finally {
    open.mockRestore()
  }
})

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

function mountSharingTaskStep({
  task,
  captureScreen = jest.fn().mockResolvedValue(true),
  startAudioRecording = jest.fn().mockResolvedValue(undefined),
  startRecording = jest.fn().mockResolvedValue(true),
  extraProps = {},
} = {}) {
  wrapper = shallowMount(TaskStep, {
    props: { task, taskIndex: 0, ...extraProps },
    global: {
      mocks: { $vuetify: { display: {} } },
      stubs: {
        ShowInfo: { template: '<div><slot name="content" /></div>' },
        ScreenRecorder: {
          template: '<div />',
          setup() {
            return { captureScreen, abortCapture: jest.fn() }
          },
        },
        AudioRecorder: {
          template: '<div />',
          setup() {
            return { startAudioRecording, abortCapture: jest.fn() }
          },
        },
        VideoRecorder: {
          template: '<div />',
          setup() {
            return { startRecording, abortCapture: jest.fn() }
          },
        },
      },
    },
  })
  return wrapper.vm.$.setupState
}

it.each(['sus', 'nasa-tlx', 'sart', 'tam-1', 'tam-2', 'tam-3'])(
  'previews the %s questionnaire without setup, validation or task-completion events',
  async (taskType) => {
    const captureScreen = jest.fn()
    const startAudioRecording = jest.fn()
    const startRecording = jest.fn()
    const task = mountSharingTaskStep({
      task: {
        taskType,
        hasScreenRecord: true,
        hasAudioRecord: true,
        hasCamRecord: true,
        taskLink: 'https://example.com',
        postForm: 'https://example.com/form',
      },
      captureScreen,
      startAudioRecording,
      startRecording,
      extraProps: {
        preview: true,
        doneTaskDisabled: true,
        autoOpenTaskLink: true,
      },
    })
    const open = jest.spyOn(window, 'open')
    try {
      expect(task.movePreviewStep(-1)).toBe(false)
      for (const [stage, previewIndex] of [
        [1, 1],
        [1, 2],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ]) {
        expect(task.movePreviewStep(1)).toBe(true)
        await nextTick()
        expect(task.stage).toBe(stage)
        expect(task.previewStepIndex).toBe(previewIndex)
      }
      expect(task.movePreviewStep(1)).toBe(false)
      expect(task.shouldDisableFinishButton).toBe(true)
      expect(task.movePreviewStep(-1)).toBe(true)
      expect(task.stage).toBe(4)
      expect(wrapper.emitted('taskStarted')).toBeUndefined()
      expect(wrapper.emitted('startTask')).toBeUndefined()
      expect(wrapper.emitted('done')).toBeUndefined()
      expect(wrapper.emitted('couldNotFinish')).toBeUndefined()
      expect(wrapper.emitted('timer-stopped')).toBeUndefined()
      expect(captureScreen).not.toHaveBeenCalled()
      expect(startAudioRecording).not.toHaveBeenCalled()
      expect(startRecording).not.toHaveBeenCalled()
      expect(open).not.toHaveBeenCalled()
    } finally {
      open.mockRestore()
    }
  },
)

it('does not allow task preview navigation in Answer mode', () => {
  const task = mountSharingTaskStep({ task: { taskType: 'sus' } })
  expect(task.stage).toBe(2)
  expect(task.movePreviewStep(1)).toBe(false)
  task.showLastPreviewStep()
  expect(task.stage).toBe(2)
})

it('allows preview tasks to run without mounting recorders or requesting media permissions', async () => {
  const captureScreen = jest.fn()
  const startAudioRecording = jest.fn()
  const startRecording = jest.fn()
  const taskStep = mountSharingTaskStep({
    task: {
      taskType: 'no-answer',
      hasScreenRecord: true,
      hasAudioRecord: true,
      hasCamRecord: true,
    },
    captureScreen,
    startAudioRecording,
    startRecording,
    extraProps: { preview: true },
  })
  expect(wrapper.findComponent({ name: 'AudioRecorder' }).exists()).toBe(false)
  expect(wrapper.findComponent({ name: 'ScreenRecorder' }).exists()).toBe(false)
  expect(wrapper.findComponent({ name: 'VideoRecorder' }).exists()).toBe(false)
  await taskStep.startTask()
  expect(taskStep.stage).toBe(3)
  expect(taskStep.showScreenSharePrompt).toBe(false)
  expect(wrapper.emitted('taskStarted')).toHaveLength(1)
  expect(captureScreen).not.toHaveBeenCalled()
  expect(startAudioRecording).not.toHaveBeenCalled()
  expect(startRecording).not.toHaveBeenCalled()
})

it('opens the unmoderated task page only after sharing permissions finish', async () => {
  const open = jest.spyOn(window, 'open').mockReturnValue({})
  let resolveScreen
  let resolveAudio
  let resolveCamera
  const captureScreen = jest.fn(
    () =>
      new Promise((resolve) => {
        resolveScreen = resolve
      }),
  )
  const startAudioRecording = jest.fn(
    () =>
      new Promise((resolve) => {
        resolveAudio = resolve
      }),
  )
  const startRecording = jest.fn(
    () =>
      new Promise((resolve) => {
        resolveCamera = resolve
      }),
  )
  const taskStep = mountSharingTaskStep({
    task: {
      taskType: 'no-answer',
      hasScreenRecord: true,
      hasAudioRecord: true,
      hasCamRecord: true,
      taskLink: 'example.com/task',
    },
    captureScreen,
    startAudioRecording,
    startRecording,
    extraProps: { autoOpenTaskLink: true },
  })

  try {
    const pending = taskStep.confirmScreenShare()
    await flushPromises()
    expect(captureScreen).toHaveBeenCalledTimes(1)
    expect(startAudioRecording).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()

    resolveScreen(true)
    await flushPromises()
    expect(startAudioRecording).toHaveBeenCalledTimes(1)
    expect(startRecording).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()

    resolveAudio()
    await flushPromises()
    expect(startRecording).toHaveBeenCalledTimes(1)
    expect(open).not.toHaveBeenCalled()

    resolveCamera(true)
    await pending
    expect(open).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledWith('https://example.com/task', '_blank')
    expect(wrapper.emitted('taskStarted')).toHaveLength(1)
  } finally {
    open.mockRestore()
  }
})

it('does not open the task page when screen sharing is denied', async () => {
  const open = jest.spyOn(window, 'open').mockReturnValue({})
  const startAudioRecording = jest.fn().mockResolvedValue(undefined)
  const taskStep = mountSharingTaskStep({
    task: {
      taskType: 'no-answer',
      hasScreenRecord: true,
      hasAudioRecord: true,
      taskLink: 'https://example.com/task',
    },
    captureScreen: jest.fn().mockResolvedValue(false),
    startAudioRecording,
    extraProps: { autoOpenTaskLink: true },
  })

  try {
    await taskStep.confirmScreenShare()
    expect(startAudioRecording).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
    expect(wrapper.emitted('taskStarted')).toBeUndefined()
  } finally {
    open.mockRestore()
  }
})

it('opens the task page after microphone and camera when the task has no screen share', async () => {
  const open = jest.spyOn(window, 'open').mockReturnValue({})
  let resolveAudio
  const startAudioRecording = jest.fn(
    () =>
      new Promise((resolve) => {
        resolveAudio = resolve
      }),
  )
  const startRecording = jest.fn().mockResolvedValue(true)
  const taskStep = mountSharingTaskStep({
    task: {
      taskType: 'no-answer',
      hasAudioRecord: true,
      hasCamRecord: true,
      taskLink: 'https://example.com/page',
    },
    startAudioRecording,
    startRecording,
    extraProps: { autoOpenTaskLink: true },
  })

  try {
    const pending = taskStep.startTask()
    await flushPromises()
    expect(startAudioRecording).toHaveBeenCalledTimes(1)
    expect(startRecording).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()

    resolveAudio()
    await pending
    expect(startRecording).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledWith('https://example.com/page', '_blank')
  } finally {
    open.mockRestore()
  }
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

it('keeps Start disabled until the saved answer shows whether it was submitted', async () => {
  const requestFullscreen = jest.fn(async () => {})
  document.documentElement.requestFullscreen = requestFullscreen
  mockStore.getters.test.status = 'active'
  let finishLoading

  mockStore.dispatch.mockImplementation((action) =>
    action === 'getCurrentTestAnswerDoc'
      ? new Promise((resolve) => {
          finishLoading = resolve
        })
      : Promise.resolve(),
  )

  wrapper = shallowMount(UserTestView, {
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })

  await flushPromises()
  expect(wrapper.vm.isStartTestDisabled).toBe(true)

  mockStore.getters.currentUserTestAnswer.submitted = true
  finishLoading()
  await flushPromises()

  expect(wrapper.vm.isStartTestDisabled).toBe(true)
  expect(wrapper.vm.testDisabledReason).toBe('already-completed')

  await wrapper.vm.startTest()
  expect(requestFullscreen).not.toHaveBeenCalled()
})

function mountTaskStep(task) {
  return shallowMount(TaskStep, {
    props: { task, taskIndex: 0, taskName: 'Find the button' },
    global: {
      mocks: { $vuetify: { display: {} } },
      stubs: { ShowInfo: { template: '<div><slot name="content" /></div>' } },
    },
  })
}

it('skips the recording intro when the task does not record media', () => {
  wrapper = mountTaskStep({ taskType: 'no-answer' })
  const taskStep = wrapper.vm.$.setupState
  expect(taskStep.previewSteps).toEqual([])
  expect(taskStep.stage).toBe(2)
})

it('keeps the recording intro when the task records media', () => {
  wrapper = mountTaskStep({ taskType: 'no-answer', hasAudioRecord: true })
  const taskStep = wrapper.vm.$.setupState
  expect(taskStep.previewSteps).toEqual(['recording'])
  expect(taskStep.stage).toBe(1)
})

it('shows only the external-link intro when there is no recording', () => {
  wrapper = mountTaskStep({
    taskType: 'no-answer',
    taskLink: 'https://example.com',
  })
  const taskStep = wrapper.vm.$.setupState
  expect(taskStep.previewSteps).toEqual(['link'])
  expect(taskStep.stage).toBe(1)
})

it('asks for an optional comment only after the task timer stops', async () => {
  wrapper = mountTaskStep({ taskType: 'no-answer' })
  const taskStep = wrapper.vm.$.setupState
  await taskStep.startTask()

  expect(taskStep.stage).toBe(3)
  expect(wrapper.find('[data-study-field-ref="task:0:comment"]').exists()).toBe(
    false,
  )

  taskStep.handleShowPostForm(true)
  await nextTick()

  expect(wrapper.emitted('timer-stopped')).toHaveLength(1)
  expect(wrapper.emitted('done')).toBeUndefined()
  expect(taskStep.stage).toBe(5)
  expect(wrapper.find('[data-study-field-ref="task:0:comment"]').exists()).toBe(
    true,
  )

  taskStep.onUpdateTaskObservations('optional note')
  expect(wrapper.emitted('update:taskObservations')?.at(-1)).toEqual([
    'optional note',
  ])

  taskStep.attemptFinish()
  expect(wrapper.emitted('done')).toHaveLength(1)
})

it('shows a post-task questionnaire before the optional comment', async () => {
  wrapper = mountTaskStep({ taskType: 'sus' })
  const taskStep = wrapper.vm.$.setupState
  await taskStep.startTask()

  taskStep.handleShowPostForm(false)
  await nextTick()

  expect(taskStep.stage).toBe(4)
  expect(wrapper.emitted('task-questionnaire-entered')).toHaveLength(1)
  expect(wrapper.emitted('couldNotFinish')).toBeUndefined()
  expect(wrapper.find('[data-study-field-ref="task:0:comment"]').exists()).toBe(
    false,
  )

  taskStep.goToObservationStep()
  await nextTick()

  expect(taskStep.stage).toBe(5)
  taskStep.attemptFinish()
  expect(wrapper.emitted('couldNotFinish')).toHaveLength(1)
})
