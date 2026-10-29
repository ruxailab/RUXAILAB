import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createI18n } from 'vue-i18n'
import SessionTranscriptionPanel from '@/ux/UserTest/components/transcription/SessionTranscriptionPanel.vue'

const mockGetRuns = jest.fn()

jest.mock(
  '@/ai/transcriptions/TranscriptionController',
  () =>
    class {
      getByAnswersDocIdandUserDocIdandTaskId(...args) {
        return mockGetRuns(...args)
      }
    },
)
jest.mock('@/app/services/transcription/TranscriptionService', () => ({
  deleteTranscription: jest.fn(),
  transcribeTask: jest.fn(),
}))
jest.mock('@/app/services/jobs/watchJobDocument', () => ({
  watchJobDocument: jest.fn(),
}))
jest.mock('@/app/services/jobs/useFinishedJobWatch', () => ({
  useFinishedJobWatch: () => ({
    running: require('vue').ref(false),
    follow: jest.fn(),
    stop: jest.fn(),
  }),
}))
jest.mock('@/app/services/jobs/useStudyAnalysisQueue', () => ({
  useInFlightTaskJob: () => ({ awaitingQueue: require('vue').ref(false) }),
}))

const slot = { template: '<div><slot /></div>' }
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      analytics: {
        transcriptionNoAudioTitle: 'No audio was recorded for this task',
        transcriptionNoAudioDescription:
          "The participant's audio was not captured or failed to upload, so there is nothing to transcribe.",
        transcriptionNoAudio: 'No audio',
      },
    },
  },
})

const mountPanel = async (props) => {
  const wrapper = mount(SessionTranscriptionPanel, {
    props,
    global: {
      plugins: [createStore({ getters: { test: () => null } }), i18n],
      stubs: {
        'v-card': slot,
        'v-row': slot,
        'v-col': slot,
        'v-spacer': true,
        'v-chip': { template: '<span class="status-chip"><slot /></span>' },
        'v-icon': true,
        'v-btn': { template: '<button><slot /></button>' },
        'v-select': true,
        'v-alert': slot,
        'v-progress-circular': true,
        'v-progress-linear': true,
        'v-divider': true,
        'v-list': slot,
        'v-list-item': slot,
        'v-list-item-title': slot,
        'v-list-item-subtitle': slot,
        ConfirmDialog: true,
        AnalysisProgressState: true,
      },
    },
  })
  await flushPromises()
  return wrapper
}

it('explains that no audio was recorded instead of offering a transcription', async () => {
  const wrapper = await mountPanel({ hasAudio: false, canTranscribe: false })

  expect(wrapper.text()).toContain('No audio was recorded for this task')
  expect(wrapper.text()).not.toContain('Start Transcription')
  expect(wrapper.find('.status-chip').text()).toBe('No audio')
})

it('offers a transcription when the task has audio', async () => {
  const wrapper = await mountPanel({ hasAudio: true, canTranscribe: true })

  expect(wrapper.text()).toContain('Start Transcription')
  expect(wrapper.text()).not.toContain('No audio was recorded')
})

it('shows a failed transcription lookup instead of the no-audio state', async () => {
  mockGetRuns.mockRejectedValue(new Error('Lookup failed'))

  const wrapper = await mountPanel({
    hasAudio: false,
    answersDocId: 'answers-1',
    userDocId: 'user-1',
    taskId: '0',
  })

  expect(wrapper.text()).toContain('Lookup failed')
  expect(wrapper.text()).not.toContain('No audio was recorded')
  expect(wrapper.find('.status-chip').text()).not.toBe('No audio')
})

it('still shows an existing transcription when the audio file is gone', async () => {
  mockGetRuns.mockResolvedValue([
    { id: 'run-1', provider: 'whisper', model: 'medium', segments: [] },
  ])

  const wrapper = await mountPanel({
    hasAudio: false,
    answersDocId: 'answers-1',
    userDocId: 'user-1',
    taskId: '0',
  })

  expect(wrapper.text()).not.toContain('No audio was recorded')
  expect(wrapper.find('.status-chip').text()).toBe('Transcription Complete')
})
