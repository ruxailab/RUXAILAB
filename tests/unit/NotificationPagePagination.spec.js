import { nextTick, reactive } from 'vue'
import { shallowMount } from '@vue/test-utils'

const mockStore = reactive({
  getters: {
    user: { id: 'u1' },
    notifications: [],
  },
  dispatch: jest.fn(),
})

jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/shared/utils/toast', () => ({ showError: jest.fn() }))
jest.mock('@/shared/utils/studyNavigation', () => ({
  getInviteAcceptanceDestination: jest.fn(),
}))
jest.mock('@/shared/components/dialogs/AcceptInvitationDialog.vue', () => ({
  name: 'AcceptInvitationDialog',
  render: () => null,
}))
jest.mock('@/features/notifications/components/NotificationItem.vue', () => {
  const { h } = require('vue')
  return {
    name: 'NotificationItem',
    props: ['notification'],
    emits: ['toggle-read', 'go-to-redirect'],
    render() {
      return h('div', { class: 'notification-item' }, this.notification.id)
    },
  }
})

const NotificationPage =
  require('@/features/notifications/views/NotificationPage.vue').default

const PaginationStub = {
  name: 'VPagination',
  props: ['modelValue', 'length'],
  emits: ['update:modelValue'],
  template: '<nav class="pager" />',
}

const Wrap = { template: '<div><slot /></div>' }

const mountPage = () =>
  shallowMount(NotificationPage, {
    global: {
      stubs: {
        'v-row': Wrap,
        'v-col': Wrap,
        'v-card': Wrap,
        'v-tabs': true,
        'v-tab': true,
        'v-badge': true,
        'v-icon': true,
        'v-select': true,
        'v-text-field': true,
        'v-btn': true,
        'v-skeleton-loader': true,
        'v-alert': { template: '<div class="empty-state" />' },
        'v-pagination': PaginationStub,
      },
      mocks: { $t: (key) => key, $vuetify: { display: { smAndDown: false } } },
    },
  })

beforeEach(() => {
  mockStore.getters.notifications = Array.from({ length: 9 }, (_, i) => ({
    id: `n${i + 1}`,
    title: `Notification ${i + 1}`,
    read: false,
  }))
  mockStore.dispatch.mockImplementation((action, { notificationId }) => {
    if (action === 'markNotificationAsRead') {
      mockStore.getters.notifications = mockStore.getters.notifications.map(
        (n) => (n.id === notificationId ? { ...n, read: true } : n),
      )
    }
    return Promise.resolve()
  })
})

it('goes back to the last page when the unread list gets shorter', async () => {
  jest.useFakeTimers()
  const wrapper = mountPage()
  jest.runAllTimers()
  await nextTick()

  wrapper.findComponent(PaginationStub).vm.$emit('update:modelValue', 2)
  await nextTick()

  const items = wrapper.findAllComponents({ name: 'NotificationItem' })
  expect(items).toHaveLength(1)

  items[0].vm.$emit('toggle-read', items[0].props('notification'))
  await nextTick()
  await nextTick()

  expect(wrapper.findAllComponents({ name: 'NotificationItem' })).toHaveLength(
    8,
  )
  expect(wrapper.find('.empty-state').exists()).toBe(false)
  jest.useRealTimers()
})
