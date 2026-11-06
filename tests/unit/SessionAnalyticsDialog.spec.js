import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createI18n } from 'vue-i18n'

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  database: {},
  fbFunctions: {},
}))

import SessionAnalyticsDialog from '@/ux/UserTest/components/dialogs/SessionAnalyticsDialog.vue'

const mockUpdateTaskMarker = jest.fn()
jest.mock(
  '@/shared/controllers/AnswerController',
  () =>
    class {
      updateTaskMarker(...args) {
        return mockUpdateTaskMarker(...args)
      }
    },
)
const mockGetRuns = jest.fn(() => Promise.resolve(null))
jest.mock(
  '@/ai/transcriptions/TranscriptionController',
  () =>
    class {
      getByAnswersDocIdandUserDocIdandTaskId(...args) {
        return mockGetRuns(...args)
      }
    },
)
jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}))
const toast = require('@/shared/utils/toast')

const slot = { template: '<div><slot /></div>' }
const dialog = {
  props: ['modelValue'],
  template: '<div v-if="modelValue"><slot /></div>',
}
const mockOpenAddMenu = jest.fn()
const mockSetSegmentStart = jest.fn()
const timelineStub = {
  props: ['silences'],
  template: '<div />',
  methods: {
    openAddMenu: mockOpenAddMenu,
    setSegmentStart: mockSetSegmentStart,
  },
}
const press = (key, options = {}) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...options }))
const button = {
  inheritAttrs: false,
  props: ['disabled', 'title'],
  emits: ['click'],
  template:
    '<button :data-testid="$attrs[\'data-testid\']" :title="title" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      buttons: { close: 'Close' },
      analytics: {
        sentimentAnalytics: 'Sentiment',
        testDetails: {
          tip: 'Tip',
          answer: 'Answer',
          taskPosition: 'Task {current} of {total}',
          previousTask: 'Previous task',
          nextTask: 'Next task',
          noRecordings: 'No recordings available for this task.',
        },
      },
    },
  },
})

const taskSummary = {
  statusLabel: 'Completed',
  statusColor: 'success',
  completed: true,
  attempted: true,
  timeLabel: '01:20',
  estimatedTimeLabel: '02:00',
  timeComparison: 'within',
  timeComparisonLabel: 'Within estimate',
  hasTipAvailable: true,
  tipPressCount: 0,
  tipUsage: 'Not used',
  answerPreview: 'Found the checkout',
}

const mountDialog = (props = {}) =>
  mount(SessionAnalyticsDialog, {
    attachTo: document.body,
    props: {
      modelValue: true,
      userId: 'user-1',
      selectedTask: 1,
      selectedTaskName: 'Checkout',
      taskId: 'task-2',
      taskAnswer: {},
      participant: { fullName: 'Ada Lovelace', email: 'ada@example.com' },
      taskSummary,
      taskCount: 3,
      ...props,
    },
    global: {
      plugins: [createStore({ getters: { user: () => null } }), i18n],
      stubs: {
        'v-dialog': dialog,
        'v-card-title': slot,
        'v-card': slot,
        'v-card-text': slot,
        'v-toolbar': slot,
        'v-avatar': slot,
        'v-spacer': true,
        'v-chip': { template: '<span class="chip"><slot /></span>' },
        'v-icon': true,
        'v-btn': button,
        'v-btn-toggle': slot,
        'v-tabs': slot,
        'v-tab': slot,
        'v-window': slot,
        'v-window-item': slot,
        'v-alert': slot,
        'v-list': slot,
        'v-list-item': slot,
        'v-list-item-title': slot,
        'v-list-item-subtitle': slot,
        SessionTimeline: timelineStub,
        EyeTrackingStats: true,
        FacialSentimentPanel: true,
        TextSentimentPanel: true,
        EyeTrackingOverlay: true,
        SessionTranscriptionPanel: true,
        SessionAnnotationsList: true,
        'v-progress-circular': true,
      },
    },
  })

describe('SessionAnalyticsDialog', () => {
  let wrapper

  beforeAll(() => {
    jest
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    wrapper?.unmount()
    wrapper = null
  })

  it('shows the participant, task position and task summary in the header', () => {
    wrapper = mountDialog()

    expect(
      wrapper.find('[data-testid="session-dialog-task-name"]').text(),
    ).toBe('Checkout')
    expect(wrapper.find('[data-testid="session-dialog-subtitle"]').text()).toBe(
      'Ada Lovelace · Task 2 of 3',
    )

    const summary = wrapper.find('[data-testid="session-dialog-summary"]')
    expect(summary.text()).toContain('Completed')
    expect(summary.text()).toContain('01:20')
    expect(summary.text()).toContain('02:00')
    expect(summary.text()).toContain('Within estimate')
    expect(summary.text()).toContain('Tip: Not used')
    expect(summary.text()).toContain('Found the checkout')
  })

  it('navigates to the previous and next task with buttons and arrow keys', async () => {
    wrapper = mountDialog()

    await wrapper
      .find('[data-testid="session-dialog-previous"]')
      .trigger('click')
    await wrapper.find('[data-testid="session-dialog-next"]').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))

    expect(wrapper.emitted('navigate')).toEqual([[0], [2], [2], [0]])
  })

  it('labels the navigation buttons with the adjacent task names', () => {
    wrapper = mountDialog({ taskNames: ['Login', 'Checkout', 'Logout'] })

    expect(wrapper.find('[data-testid="session-dialog-previous"]').text()).toBe(
      'Previous task',
    )
    expect(
      wrapper
        .find('[data-testid="session-dialog-previous"]')
        .attributes('title'),
    ).toBe('Previous task: Login (←)')
    expect(
      wrapper.find('[data-testid="session-dialog-next"]').attributes('title'),
    ).toBe('Next task: Logout (→)')
  })

  it('does not navigate past the first or last task', async () => {
    wrapper = mountDialog({ selectedTask: 0, taskCount: 2 })

    expect(
      wrapper
        .find('[data-testid="session-dialog-previous"]')
        .attributes('disabled'),
    ).toBeDefined()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))

    expect(wrapper.emitted('navigate')).toEqual([[1]])
  })

  it('ignores arrow keys while typing in a field', () => {
    wrapper = mountDialog()
    const input = document.createElement('input')
    document.body.appendChild(input)

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    )

    expect(wrapper.emitted('navigate')).toBeUndefined()
    input.remove()
  })

  it('stops listening to the keyboard after closing', async () => {
    wrapper = mountDialog()

    await wrapper.find('[data-testid="session-dialog-close"]').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))

    expect(wrapper.emitted('navigate')).toBeUndefined()
  })

  it('shows an empty state and the notes tab when the task has no media', () => {
    wrapper = mountDialog()

    expect(
      wrapper.find('[data-testid="session-dialog-no-media"]').text(),
    ).toContain('No recordings available for this task.')
    expect(wrapper.vm.$.setupState.rightTab).toBe('notes')
  })

  it('shows the screen as main video with the webcam picture-in-picture', () => {
    wrapper = mountDialog({
      taskAnswer: {
        screenRecordURL: 'https://example.com/screen.mp4',
        webcamRecordURL: 'https://example.com/webcam.mp4',
      },
    })

    expect(
      wrapper.find('[data-testid="session-dialog-media-stage"]').exists(),
    ).toBe(true)
    expect(
      wrapper.find('[data-testid="session-dialog-webcam"]').classes(),
    ).toContain('webcam-pip')
  })

  it('shows the webcam as main video when there is no screen recording', () => {
    wrapper = mountDialog({
      taskAnswer: { webcamRecordURL: 'https://example.com/webcam.mp4' },
    })

    expect(
      wrapper.find('[data-testid="session-dialog-webcam"]').classes(),
    ).toContain('media-frame')
  })

  it('toggles playback with Space and skips with J/L', async () => {
    const play = jest
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue()
    wrapper = mountDialog({
      taskAnswer: { screenRecordURL: 'https://example.com/screen.mp4' },
    })
    const state = wrapper.vm.$.setupState
    state.videoDuration = 60
    state.videoCurrentTime = 3

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }))
    expect(state.videoCurrentTime).toBe(8)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'J' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }))
    expect(state.videoCurrentTime).toBe(0)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    await flushPromises()
    expect(play).toHaveBeenCalled()
    play.mockRestore()
  })

  it('applies the selected playback speed to the media', async () => {
    wrapper = mountDialog({
      taskAnswer: { screenRecordURL: 'https://example.com/screen.mp4' },
    })
    const video = wrapper.find('video').element

    wrapper.vm.$.setupState.playbackRate = 2
    await wrapper.vm.$nextTick()

    expect(video.playbackRate).toBe(2)
    expect(video.defaultPlaybackRate).toBe(2)
  })

  it('keeps the chosen tab and layout when the next task offers them', async () => {
    wrapper = mountDialog({
      taskAnswer: {
        screenRecordURL: 'https://example.com/screen.mp4',
        webcamRecordURL: 'https://example.com/webcam.mp4',
      },
    })
    const state = wrapper.vm.$.setupState
    state.rightTab = 'notes'
    state.mediaLayout = 'screen'

    await wrapper.setProps({
      selectedTask: 2,
      taskId: 'task-3',
      taskAnswer: {
        screenRecordURL: 'https://example.com/screen-3.mp4',
        webcamRecordURL: 'https://example.com/webcam-3.mp4',
      },
    })

    expect(state.rightTab).toBe('notes')
    expect(state.mediaLayout).toBe('screen')
  })

  it('falls back to an available tab when the next task lacks the chosen one', async () => {
    wrapper = mountDialog({
      taskAnswer: { webcamRecordURL: 'https://example.com/webcam.mp4' },
    })
    const state = wrapper.vm.$.setupState
    state.rightTab = 'sentimental'

    await wrapper.setProps({
      selectedTask: 2,
      taskId: 'task-3',
      taskAnswer: {},
    })

    expect(state.rightTab).toBe('notes')
  })

  it('resets playback when moving to another task', async () => {
    wrapper = mountDialog({
      taskAnswer: { screenRecordURL: 'https://example.com/screen.mp4' },
    })
    const state = wrapper.vm.$.setupState
    state.videoCurrentTime = 42
    state.videoDuration = 90
    state.predictedData = [{ x: 1 }]

    await wrapper.setProps({
      selectedTask: 2,
      taskId: 'task-3',
      taskAnswer: { screenRecordURL: 'https://example.com/screen-3.mp4' },
    })

    expect(state.videoCurrentTime).toBe(0)
    expect(state.videoDuration).toBe(0)
    expect(state.predictedData).toBeNull()
    expect(wrapper.find('[data-testid="session-dialog-subtitle"]').text()).toBe(
      'Ada Lovelace · Task 3 of 3',
    )
  })

  describe('keyboard shortcuts', () => {
    const bothMedia = {
      taskAnswer: {
        screenRecordURL: 'https://example.com/screen.mp4',
        webcamRecordURL: 'https://example.com/webcam.mp4',
      },
    }

    it('opens the shortcuts dialog from the keyboard button and lists every group', async () => {
      wrapper = mountDialog(bothMedia)
      expect(
        wrapper.find('[data-testid="session-shortcuts-dialog"]').exists(),
      ).toBe(false)

      await wrapper
        .find('[data-testid="session-dialog-shortcuts"]')
        .trigger('click')

      expect(
        wrapper.find('[data-testid="session-shortcuts-dialog"]').exists(),
      ).toBe(true)
      for (const group of [
        'playback',
        'navigation',
        'view',
        'annotations',
        'help',
      ]) {
        expect(
          wrapper.find(`[data-testid="shortcut-group-${group}"]`).exists(),
        ).toBe(true)
      }
      expect(
        wrapper.find('[data-testid="shortcut-toggle-play"]').text(),
      ).toContain('K')
    })

    it('toggles the shortcuts dialog with ? and blocks other shortcuts while open', async () => {
      wrapper = mountDialog(bothMedia)
      const state = wrapper.vm.$.setupState

      press('?', { shiftKey: true })
      await wrapper.vm.$nextTick()
      expect(state.shortcutsOpen).toBe(true)

      press('ArrowRight')
      expect(wrapper.emitted('navigate')).toBeUndefined()

      press('?', { shiftKey: true })
      expect(state.shortcutsOpen).toBe(false)
    })

    it('marks shortcuts that do not apply to the current task as unavailable', async () => {
      wrapper = mountDialog()
      wrapper.vm.$.setupState.shortcutsOpen = true
      await wrapper.vm.$nextTick()

      expect(
        wrapper.find('[data-testid="shortcut-toggle-play"]').classes(),
      ).toContain('shortcut-row--unavailable')
      expect(
        wrapper.find('[data-testid="shortcut-next-task"]').classes(),
      ).not.toContain('shortcut-row--unavailable')
    })

    it('switches the recordings layout with 1, 2 and 3', () => {
      wrapper = mountDialog(bothMedia)
      const state = wrapper.vm.$.setupState

      press('3')
      expect(state.mediaLayout).toBe('screen')
      press('2')
      expect(state.mediaLayout).toBe('webcam')
      press('1')
      expect(state.mediaLayout).toBe('both')
    })

    it('changes the playback speed with < and > within the allowed rates', () => {
      wrapper = mountDialog(bothMedia)
      const state = wrapper.vm.$.setupState

      press('>', { shiftKey: true })
      press('>', { shiftKey: true })
      press('>', { shiftKey: true })
      expect(state.playbackRate).toBe(2)
      press('<')
      expect(state.playbackRate).toBe(1.5)
    })

    it('goes back to the start with Home or 0', () => {
      wrapper = mountDialog(bothMedia)
      const state = wrapper.vm.$.setupState
      state.videoCurrentTime = 30

      press('Home')
      expect(state.videoCurrentTime).toBe(0)
      state.videoCurrentTime = 12
      press('0')
      expect(state.videoCurrentTime).toBe(0)
    })

    it('opens the timeline annotations with M and S', () => {
      wrapper = mountDialog(bothMedia)

      press('m')
      press('S')

      expect(mockOpenAddMenu).toHaveBeenCalledTimes(1)
      expect(mockSetSegmentStart).toHaveBeenCalledTimes(1)
    })

    it('ignores modified and auto-repeated task navigation keys', () => {
      wrapper = mountDialog(bothMedia)

      press('ArrowRight', { shiftKey: true })
      press('ArrowRight', { metaKey: true })
      press('ArrowRight', { repeat: true })

      expect(wrapper.emitted('navigate')).toBeUndefined()
    })
  })

  describe('annotations, cinema, media and deep links', () => {
    const screenOnly = {
      taskAnswer: { screenRecordURL: 'https://example.com/screen.mp4' },
    }
    const annotated = {
      taskAnswer: {
        screenRecordURL: 'https://example.com/screen.mp4',
        markers: [{ id: 'm1', time: 10, comment: 'Hesitates' }],
        segments: [{ id: 's1', startTime: 40, endTime: 50, comment: 'Lost' }],
      },
    }

    it('jumps between annotations with N and P', () => {
      wrapper = mountDialog(annotated)
      const state = wrapper.vm.$.setupState

      press('n')
      expect(state.videoCurrentTime).toBe(10)
      press('n')
      expect(state.videoCurrentTime).toBe(40)
      press('n')
      expect(state.videoCurrentTime).toBe(40)
      press('p')
      expect(state.videoCurrentTime).toBe(10)
    })

    it('saves an edited annotation and rolls back when it fails', async () => {
      wrapper = mountDialog({ ...annotated, answersDocId: 'answers-1' })
      const state = wrapper.vm.$.setupState
      const marker = state.markers[0]

      mockUpdateTaskMarker.mockResolvedValueOnce()
      await state.updateAnnotation({
        type: 'marker',
        item: marker,
        comment: 'Hesitates at checkout',
      })
      expect(mockUpdateTaskMarker).toHaveBeenCalledWith(
        expect.objectContaining({
          answersDocId: 'answers-1',
          userDocId: 'user-1',
          taskId: 'task-2',
          previous: marker,
          marker: expect.objectContaining({
            id: 'm1',
            comment: 'Hesitates at checkout',
          }),
        }),
      )
      expect(state.markers[0].comment).toBe('Hesitates at checkout')

      const edited = state.markers[0]
      mockUpdateTaskMarker.mockRejectedValueOnce(new Error('offline'))
      await state.updateAnnotation({
        type: 'marker',
        item: edited,
        comment: 'X',
      })
      expect(state.markers[0].comment).toBe('Hesitates at checkout')
      expect(toast.showError).toHaveBeenCalledWith('errors.globalError')
    })

    it('maps transcript times to the audio lead', () => {
      wrapper = mountDialog(screenOnly)
      const state = wrapper.vm.$.setupState
      state.videoCurrentTime = 5

      expect(state.transcriptTime).toBe(6)
      state.onTranscriptSeek(20)
      expect(state.videoCurrentTime).toBe(19)
    })

    it('toggles cinema mode with the button, F and Esc', async () => {
      wrapper = mountDialog(screenOnly)
      const body = () => wrapper.find('.dialog-body')

      await wrapper
        .find('[data-testid="session-dialog-cinema"]')
        .trigger('click')
      expect(body().classes()).toContain('dialog-body--cinema')
      press('Escape')
      await flushPromises()
      expect(body().classes()).not.toContain('dialog-body--cinema')
      press('f')
      await flushPromises()
      expect(body().classes()).toContain('dialog-body--cinema')
      press('F', { shiftKey: true })
      await flushPromises()
      expect(body().classes()).toContain('dialog-body--cinema')
    })

    it('shows loading, error and retry states for a video', async () => {
      const load = jest
        .spyOn(window.HTMLMediaElement.prototype, 'load')
        .mockImplementation(() => {})
      wrapper = mountDialog(screenOnly)
      const status = () =>
        wrapper.find('[data-testid="session-dialog-screen-status"]')
      const video = wrapper.find('video')

      expect(status().classes()).toContain('media-status--loading')
      await video.trigger('canplay')
      expect(status().exists()).toBe(false)
      await video.trigger('waiting')
      expect(status().classes()).toContain('media-status--buffering')
      await video.trigger('error')
      expect(status().classes()).toContain('media-status--error')

      await wrapper
        .find('[data-testid="session-dialog-screen-retry"]')
        .trigger('click')
      expect(load).toHaveBeenCalledTimes(1)
      expect(status().classes()).toContain('media-status--loading')
      load.mockRestore()
    })

    it('starts at the deep-linked time once the video loads', async () => {
      wrapper = mountDialog({ ...screenOnly, startTime: 84 })
      await wrapper.find('video').trigger('loadedmetadata')

      expect(wrapper.vm.$.setupState.videoCurrentTime).toBe(84)
    })

    it('copies a link to the current task and moment', async () => {
      const writeText = jest.fn().mockResolvedValue()
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      })
      wrapper = mountDialog(screenOnly)
      wrapper.vm.$.setupState.videoCurrentTime = 84.6

      await wrapper
        .find('[data-testid="session-dialog-copy-link"]')
        .trigger('click')
      await flushPromises()

      const url = new URL(writeText.mock.calls[0][0])
      expect(url.searchParams.get('participant')).toBe('user-1')
      expect(url.searchParams.get('task')).toBe('2')
      expect(url.searchParams.get('t')).toBe('84')
      expect(toast.showSuccess).toHaveBeenCalledWith(
        'analytics.testDetails.linkCopied',
      )
    })
  })

  it('marks transcript gaps as silences on the video timeline', async () => {
    mockGetRuns.mockResolvedValueOnce([
      { id: 'other', evaluator: { segments: [] } },
      {
        id: 'run-1',
        evaluator: {
          segments: [
            { start: 8, end: 12, text: 'Hello' },
            { start: 20, end: 22, text: 'Done' },
          ],
        },
        moderator: { segments: [{ start: 11, end: 14, text: 'Hi' }] },
      },
    ])
    wrapper = mountDialog({
      answersDocId: 'answers-1',
      taskAnswer: { audioRecordURL: 'audio.webm', transcriptionDocId: 'run-1' },
    })
    await flushPromises()

    expect(mockGetRuns).toHaveBeenCalledWith('answers-1', 'user-1', 'task-2')
    // Audio leads the video by 1 s when the start was not synced.
    expect(wrapper.findComponent(timelineStub).props('silences')).toEqual([
      { start: 0, end: 7 },
      { start: 13, end: 19 },
    ])
  })
})
