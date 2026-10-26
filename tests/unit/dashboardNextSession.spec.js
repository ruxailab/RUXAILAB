import { mount } from '@vue/test-utils'
import { getNextSession } from '@/shared/utils/sessionsUtils'
import NextSession from '@/features/dashboard/components/NextSession.vue'
import DashboardView from '@/features/dashboard/views/DashboardView.vue'

const mockPush = jest.fn()

jest.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('vue-i18n', () => {
  const { ref } = require('vue')
  return { useI18n: () => ({ locale: ref('en'), t: (key) => key }) }
})

jest.mock('@/app/plugins/i18n', () => ({
  __esModule: true,
  default: { global: { t: (key) => key, locale: { value: 'en' } } },
}))

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  database: {},
}))

const mockDispatch = jest.fn()

jest.mock('vuex', () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    getters: {
      user: { id: 'user-1', username: 'Ada Lovelace' },
      'Dashboard/upcomingWebinar': null,
    },
  }),
}))

const inOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

// Shape returned by SessionController.getInvitedSessions / the Session store.
const buildSession = (overrides = {}) => ({
  id: 'session-1',
  studyId: 'study-1',
  title: 'Kickoff session',
  scheduledAt: inOneDay,
  lifecycleStatus: 'scheduled',
  staff: [{ email: 'facilitator@example.com', role: 'FACILITATOR' }],
  participants: [{ email: 'participant@example.com', role: 5 }],
  study: {
    id: 'study-1',
    testTitle: 'Checkout usability',
    testDescription: 'Moderated checkout walkthrough',
    testType: 'USER',
    subType: 'USER_MODERATED',
    testAdmin: { email: 'owner@example.com' },
  },
  ...overrides,
})

const passthrough = (tag = 'div') => ({ template: `<${tag}><slot/></${tag}>` })

const mountNextSession = (nextSession) =>
  mount(NextSession, {
    props: { nextSession },
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        VCard: passthrough(),
        VCardTitle: passthrough(),
        VCardText: passthrough(),
        VIcon: passthrough('i'),
        VChip: { template: '<span data-test="status"><slot/></span>' },
        VBtn: {
          props: ['disabled'],
          emits: ['click'],
          template:
            '<button data-test="start" :disabled="disabled" @click="$emit(\'click\')"><slot/></button>',
        },
      },
    },
  })

describe('getNextSession', () => {
  it('returns the upcoming session that starts first', () => {
    const later = buildSession({ id: 'later', scheduledAt: inTwoDays })
    const soon = buildSession({ id: 'soon', scheduledAt: inOneDay })
    const past = buildSession({ id: 'past', scheduledAt: yesterday })

    expect(getNextSession([later, past, soon])).toBe(soon)
  })

  it('ignores sessions without a valid scheduledAt', () => {
    expect(
      getNextSession([
        buildSession({ scheduledAt: null }),
        buildSession({ scheduledAt: 'not a date' }),
        buildSession({ scheduledAt: undefined }),
      ]),
    ).toBeNull()
    expect(getNextSession([])).toBeNull()
    expect(getNextSession(undefined)).toBeNull()
  })

  it('accepts Firestore timestamp-like values', () => {
    const date = new Date(inOneDay)
    const session = buildSession({ scheduledAt: { toDate: () => date } })

    expect(getNextSession([session])).toBe(session)
  })
})

describe('NextSession', () => {
  it('renders the study and schedule of a store session', () => {
    const wrapper = mountNextSession(buildSession())
    const text = wrapper.text()

    expect(text).toContain('Checkout usability')
    expect(text).toContain('Moderated checkout walkthrough')
    expect(text).toContain('owner@example.com')
    expect(text).toContain('participant@example.com')
    expect(text).not.toContain('Unknown')
    expect(text).not.toContain('N/A')
    expect(wrapper.find('[data-test="status"]').text()).toBe('Upcoming')
  })

  it('opens the session of the linked study', async () => {
    const wrapper = mountNextSession(buildSession())

    await wrapper.find('[data-test="start"]').trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/testview/study-1/session-1')
  })
})

describe('DashboardView', () => {
  it('passes the next upcoming store session to the NextSession card', async () => {
    const wrapper = mount(DashboardView, {
      props: {
        items: [],
        sessions: [
          buildSession({ id: 'later', scheduledAt: inTwoDays }),
          buildSession({ id: 'soon', scheduledAt: inOneDay }),
          buildSession({ id: 'past', scheduledAt: yesterday }),
        ],
      },
      global: {
        mocks: { $t: (key) => key },
        stubs: {
          VContainer: passthrough(),
          VRow: passthrough(),
          VCol: passthrough(),
          StatsCards: true,
          ActivityTimeline: true,
          ActiveStudies: true,
          BlogPosts: true,
          UpcomingWebinar: true,
          TopMethods: true,
          NextSession: {
            props: ['nextSession'],
            template:
              '<div data-test="next-session">{{ nextSession?.id ?? "none" }}</div>',
          },
        },
      },
    })

    expect(wrapper.find('[data-test="next-session"]').text()).toBe('soon')
  })
})
