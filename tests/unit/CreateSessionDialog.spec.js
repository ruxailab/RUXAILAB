import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createI18n } from 'vue-i18n'
import CreateSessionDialog from '@/shared/components/dialogs/CreateSessionDialog.vue'

jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}))
const toast = require('@/shared/utils/toast')

// Nov 11, 2026, 15:00 local time
const NOW = new Date(2026, 10, 11, 15, 0)
const at = (hours, minutes, day = 11) => new Date(2026, 10, day, hours, minutes)

const slot = {
  template: '<div><slot /><slot name="activator" :props="{}" /></div>',
}
const form = {
  template: '<form><slot /></form>',
  methods: {
    validate: () => Promise.resolve({ valid: true }),
    resetValidation: () => {},
  },
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: {} },
})

const buildStore = () => {
  const actions = {
    createSession: jest.fn(),
    updateSession: jest.fn(),
    fetchSessions: jest.fn(),
    findUserByEmail: jest.fn(),
  }
  const store = createStore({
    getters: {
      test: () => ({
        id: 'study-1',
        testType: 'USER',
        cooperators: [],
        testAdmin: { userDocId: 'owner' },
      }),
      user: () => ({ id: 'owner', email: 'owner@example.com' }),
    },
    actions,
  })
  return { store, actions }
}

const mountDialog = async ({ session = null } = {}) => {
  const { store, actions } = buildStore()
  const wrapper = mount(CreateSessionDialog, {
    props: { dialog: false, session },
    global: {
      plugins: [store, i18n],
      stubs: { 'v-form': form, 'v-dialog': slot, 'v-menu': slot },
    },
  })
  await wrapper.setProps({ dialog: true })
  return { wrapper, actions }
}

const savedSession = (actions, name) =>
  actions[name].mock.calls[0]?.[1]?.session

describe('CreateSessionDialog scheduling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Jest 27: 'modern' timers also fake Date. The save flow only awaits
    // promises, which are not faked.
    jest.useFakeTimers('modern')
    jest.setSystemTime(NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('only offers times from now on when today is selected', async () => {
    const { wrapper } = await mountDialog()

    expect(wrapper.vm.minTime).toBe('15:00')

    wrapper.vm.date = at(0, 0, 12)
    expect(wrapper.vm.minTime).toBe('00:00')
  })

  it('does not save a new session scheduled earlier today', async () => {
    const { wrapper, actions } = await mountDialog()

    wrapper.vm.hour = '10:00'
    await wrapper.vm.saveSession()

    expect(toast.showError).toHaveBeenCalledWith('Sessions.error.pastDateTime')
    expect(actions.createSession).not.toHaveBeenCalled()
  })

  it('saves a new session scheduled later today', async () => {
    const { wrapper, actions } = await mountDialog()

    wrapper.vm.hour = '16:30'
    await wrapper.vm.saveSession()

    expect(actions.createSession).toHaveBeenCalled()
    expect(savedSession(actions, 'createSession').scheduledAt).toBe(
      at(16, 30).toISOString(),
    )
  })

  it('keeps the default time valid while the form is being filled in', async () => {
    const { wrapper, actions } = await mountDialog()

    jest.setSystemTime(at(15, 7))
    await wrapper.vm.saveSession()

    expect(toast.showError).not.toHaveBeenCalled()
    expect(savedSession(actions, 'createSession').scheduledAt).toBe(
      NOW.toISOString(),
    )
  })

  it('moves a stale default time up to now when the dialog opens', async () => {
    jest.setSystemTime(at(9, 0))
    const { store } = buildStore()
    const wrapper = mount(CreateSessionDialog, {
      props: { dialog: false },
      global: {
        plugins: [store, i18n],
        stubs: { 'v-form': form, 'v-dialog': slot, 'v-menu': slot },
      },
    })

    jest.setSystemTime(NOW)
    await wrapper.setProps({ dialog: true })

    expect(wrapper.vm.hour).toBe('15:00')
  })

  it('still lets other details of a past session be edited', async () => {
    const pastSession = {
      id: 'session-1',
      title: 'Kickoff',
      scheduledAt: at(10, 0).toISOString(),
      message: '',
      staff: [],
      participants: [],
    }
    const { wrapper, actions } = await mountDialog({ session: pastSession })

    wrapper.vm.sessionMessage = 'Notes added after the session'
    await wrapper.vm.saveSession()

    expect(toast.showError).not.toHaveBeenCalled()
    expect(actions.updateSession).toHaveBeenCalled()
  })

  it('does not move an existing session into the past', async () => {
    const upcomingSession = {
      id: 'session-1',
      title: 'Kickoff',
      scheduledAt: at(18, 0).toISOString(),
      message: '',
      staff: [],
      participants: [],
    }
    const { wrapper, actions } = await mountDialog({ session: upcomingSession })

    wrapper.vm.hour = '11:00'
    await wrapper.vm.saveSession()

    expect(toast.showError).toHaveBeenCalledWith('Sessions.error.pastDateTime')
    expect(actions.updateSession).not.toHaveBeenCalled()
  })
})
