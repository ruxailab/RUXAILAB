<template>
  <v-row v-if="user">
    <v-col cols="12" md="10" lg="8" xl="6">
      <!-- HEADER -->
      <v-card
        class="notification-card-clean"
        flat
        :class="{ 'pa-3': $vuetify.display.smAndDown }"
      >
        <!-- TABS FOR DESKTOP -->
        <v-tabs
          v-if="!$vuetify.display.smAndDown"
          v-model="activeTab"
          color="primary"
          class="mt-4"
          height="48"
        >
          <v-tab value="all" class="text-capitalize">
            <div class="d-flex align-center gap-2">
              <span>{{ $t('common.all') }}</span>
              <v-badge
                v-if="totalCount"
                :content="totalCount"
                inline
                size="small"
              />
            </div>
          </v-tab>

          <v-tab value="unread" class="text-capitalize">
            <div class="d-flex align-center gap-2">
              <span>{{ $t('common.unread') }}</span>
              <v-badge
                v-if="unreadCount"
                color="error"
                :content="unreadCount"
                inline
                size="small"
              />
            </div>
          </v-tab>

          <v-tab value="inbox" class="text-capitalize">
            <div class="d-flex align-center gap-2">
              <span>{{ $t('common.inbox') }}</span>
            </div>
          </v-tab>
        </v-tabs>

        <!-- SELECT FOR MOBILE -->
        <v-select
          v-else
          v-model="activeTab"
          :items="mobileTabItems"
          variant="outlined"
          density="compact"
          hide-details
          :placeholder="$t('notificationsPage.searchPlaceholder')"
          class="flex-grow-1"
          clearable
          @click:clear="search = ''"
        />
      </v-card>

      <!-- SEARCH BAR -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        :placeholder="$t('notificationsPage.searchPlaceholder')"
        variant="outlined"
        density="comfortable"
        hide-details
        class="mb-4"
        clearable
        @click:clear="search = ''"
      />

      <!-- MARK ALL AS READ -->
      <div
        v-if="['unread', 'inbox'].includes(activeTab)"
        class="d-flex justify-end mb-4"
      >
        <v-btn
          size="small"
          variant="flat"
          :color="unreadCount > 0 ? 'primary' : 'grey-lighten-2'"
          :class="{ 'text-medium-emphasis': unreadCount === 0 }"
          :disabled="unreadCount === 0"
          :loading="markingAllAsRead"
          prepend-icon="mdi-email-open-outline"
          class="text-capitalize"
          @click="markAllAsRead"
        >
          {{ $t('notificationsPage.markAllRead') }}
        </v-btn>
      </div>

      <!-- NOTIFICATIONS CONTENT -->
      <v-card
        flat
        class="notification-card-clean pa-4"
        :class="{ 'pa-3': $vuetify.display.smAndDown }"
      >
        <!-- SKELETON LOADER -->
        <template v-if="loading">
          <v-skeleton-loader
            v-for="i in 3"
            :key="i"
            type="list-item-avatar-two-line"
            class="mb-3"
          />
        </template>

        <!-- NOTIFICATIONS LIST -->
        <template v-else>
          <!-- EMPTY STATE -->
          <v-alert
            v-if="paginatedNotifications.length === 0"
            type="info"
            variant="tonal"
            icon="mdi-bell-off-outline"
            class="mb-0"
          >
            <template #title>
              <div class="d-flex align-center gap-2">
                <span>{{ emptyStateTitle }}</span>

                <v-icon v-if="search" color="info"> mdi-magnify-remove </v-icon>
              </div>
            </template>

            <template #text>
              {{ emptyStateMessage }}
            </template>
          </v-alert>

          <!-- LIST VIEW -->
          <div v-else>
            <NotificationItem
              v-for="(notification, index) in paginatedNotifications"
              :key="notification.id"
              :notification="notification"
              :class="{
                active: activeIndex === index,
              }"
              class="mb-3"
              @go-to-redirect="handleNotificationClick"
              @toggle-read="toggleRead"
            />
          </div>
        </template>

        <!-- PAGINATION -->
        <v-pagination
          v-if="currentPages > 1"
          v-model="currentPage"
          :length="currentPages"
          :total-visible="$vuetify.display.smAndDown ? 3 : 5"
          rounded="circle"
          class="mt-4 justify-center"
          density="comfortable"
        />
      </v-card>
    </v-col>
  </v-row>

  <!-- DIALOG -->
  <AcceptInvitationDialog
    v-model="dialogVisible"
    :title="$t('invite.pendingTitle')"
    :subtitle="`${$t('invite.pendingSubtitle')}: ${invite?.studyTitle ?? ''}`"
    @cancel="onReject"
    @submit="onAccept"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import AcceptInvitationDialog from '@/shared/components/dialogs/AcceptInvitationDialog.vue'
import NotificationItem from '@/features/notifications/components/NotificationItem.vue'
import { matchesSearch } from '@/shared/utils/searchUtils'
import { NOTIFICATION_TYPES } from '../utils/notificationUtils'

const store = useStore()
const { t } = useI18n()

// State
const activeTab = ref('unread')
const search = ref('')
const activeIndex = ref(-1)
const loading = ref(true)
const markingAllAsRead = ref(false)
const invite = ref(null)

// Pagination
const pageSize = ref(8)
const unreadPage = ref(1)
const inboxPage = ref(1)
const allPage = ref(1)

// Dialog
const dialogVisible = ref(false)
let resolveDialog

// Computed
const user = computed(() => store.getters.user)

const totalCount = computed(() => notifications.value?.length || 0)

const unreadCount = computed(
  () => notifications.value?.filter((n) => !n.read).length || 0,
)

// Mobile tabs
const mobileTabItems = computed(() => [
  {
    title: `${t('common.all')} (${totalCount.value})`,
    value: 'all',
    prependIcon: 'mdi-view-list',
  },
  {
    title: `${t('common.unread')} (${unreadCount.value})`,
    value: 'unread',
    prependIcon: 'mdi-email-outline',
  },
  {
    title: t('common.inbox'),
    value: 'inbox',
    prependIcon: 'mdi-inbox',
  },
])

const notifications = computed(() => store.getters.notifications ?? [])

// Filtered notifications
const filteredNotifications = computed(() => {
  let list = notifications.value

  if (activeTab.value === 'unread') {
    list = list.filter((n) => !n.read)
  }

  if (search.value.trim()) {
    const query = search.value.trim()

    list = list.filter(
      (n) =>
        matchesSearch(n.title, query) ||
        matchesSearch(n.description, query) ||
        matchesSearch(n.author, query),
    )
  }

  return list
})

// Paginated notifications
const paginatedNotifications = computed(() => {
  let list = []
  let page = 1

  if (activeTab.value === 'unread') {
    page = unreadPage.value
    list = filteredNotifications.value
  } else if (activeTab.value === 'inbox') {
    page = inboxPage.value
    list = notifications.value
  } else {
    page = allPage.value
    list = filteredNotifications.value
  }

  const start = (page - 1) * pageSize.value
  const end = start + pageSize.value

  return list.slice(start, end)
})

// Current page
const currentPage = computed({
  get() {
    if (activeTab.value === 'unread') {
      return unreadPage.value
    }

    if (activeTab.value === 'inbox') {
      return inboxPage.value
    }

    return allPage.value
  },

  set(value) {
    if (activeTab.value === 'unread') {
      unreadPage.value = value
    } else if (activeTab.value === 'inbox') {
      inboxPage.value = value
    } else {
      allPage.value = value
    }
  },
})

// Number of pages
const currentPages = computed(() => {
  if (activeTab.value === 'unread') {
    return Math.ceil(filteredNotifications.value.length / pageSize.value)
  }

  if (activeTab.value === 'inbox') {
    return Math.ceil(notifications.value.length / pageSize.value)
  }

  return Math.ceil(filteredNotifications.value.length / pageSize.value)
})

// Empty states
const emptyStateTitle = computed(() => {
  if (search.value.trim()) {
    return t('notificationsPage.noResultsFound')
  }

  if (activeTab.value === 'unread') {
    return t('notificationsPage.allCaughtUp')
  }

  return t('notificationsPage.noNotificationsYet')
})

const emptyStateMessage = computed(() => {
  if (search.value.trim()) {
    return t('notificationsPage.tryDifferentKeywords')
  }

  if (activeTab.value === 'unread') {
    return t('notificationsPage.allReadMessage')
  }

  return t('notificationsPage.newActivitiesMessage')
})

// Dialog
const onAccept = () => {
  dialogVisible.value = false

  if (resolveDialog) {
    resolveDialog(true)
  }
}

const onReject = () => {
  dialogVisible.value = false

  if (resolveDialog) {
    resolveDialog(false)
  }
}

const showAcceptDialog = () => {
  dialogVisible.value = true

  return new Promise((resolve) => {
    resolveDialog = resolve
  })
}

// Notification click
const handleNotificationClick = async (notification) => {
  if (!notification) return

  if (notification.redirectsTo) {
    await goToNotificationRedirect(notification)
  } else if (!notification.read) {
    await toggleRead(notification)
  }
}

// Redirect
const goToNotificationRedirect = async (notification) => {
  if (!notification?.redirectsTo) return

  let redirectTo = notification.redirectsTo

  const inviteToken =
    notification.inviteToken ?? localStorage.getItem('pendingInviteToken')

  if (
    (notification.type === NOTIFICATION_TYPES.COLLABORATION ||
      notification.type === NOTIFICATION_TYPES.PARTICIPANT) &&
    inviteToken
  ) {
    const result = await store.dispatch('loadInvite', {
      token: inviteToken,
    })

    if (result != null) {
      invite.value = result.invite
    }
  }

  if (
    (notification.type === NOTIFICATION_TYPES.COLLABORATION ||
      notification.type === NOTIFICATION_TYPES.PARTICIPANT) &&
    invite.value
  ) {
    const accepted = await showAcceptDialog()

    if (!accepted) {
      await store.dispatch('rejectInvite', {
        notification,
        user: user.value,
        membershipType: invite.value.membershipType,
        studyId: invite.value.studyId,
      })

      return
    }

    await store.dispatch('acceptInvite', {
      token: notification.inviteToken,
      user: user.value,
      studyId: notification.testId,
      notification,
      membershipType: invite.value.membershipType,
    })
  }

  if (!notification.read) {
    await markAsRead(notification)
  }

  let url = redirectTo

  if (!url.startsWith('http')) {
    const baseUrl = globalThis.location.origin
    const path = url.startsWith('/') ? url : `/${url}`

    url = baseUrl + path
  }

  try {
    globalThis.open(url, '_blank')
  } catch {
    // Ignore browser popup errors
  }
}

// Mark as read
const markAsRead = async (notification) => {
  if (!notification || notification.read) return

  await store.dispatch('markNotificationAsRead', {
    notificationId: notification.id,
    userId: user.value?.id,
  })
}
// Mar as unread
const markAsUnread = async (notification) => {
  if (!notification) return

  await store.dispatch('markNotificationAsUnread', {
    notificationId: notification.id,
    userId: user.value?.id,
  })
}

// NotificationItem action
const toggleRead = async (notification) => {
  if (notification.read) {
    await markAsUnread(notification)
  } else {
    await markAsRead(notification)
  }
}

// Mark all as read
const markAllAsRead = async () => {
  const unread = notifications.value?.filter((n) => !n.read)
  if (!unread?.length) return

  markingAllAsRead.value = true

  await store.dispatch('markAllNotificationsAsRead', {
    userId: user.value.id,
    notifications: notifications.value,
  })
  markingAllAsRead.value = false
}

// Keyboard navigation
const handleKeyDown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return
  }

  switch (e.key) {
    case 'j':
    case 'ArrowDown':
      e.preventDefault()

      if (activeIndex.value < filteredNotifications.value.length - 1) {
        activeIndex.value++
      }

      break

    case 'k':
    case 'ArrowUp':
      e.preventDefault()

      if (activeIndex.value > 0) {
        activeIndex.value--
      }

      break

    case 'Enter':
      e.preventDefault()

      if (
        activeIndex.value >= 0 &&
        filteredNotifications.value[activeIndex.value]
      ) {
        handleNotificationClick(filteredNotifications.value[activeIndex.value])
      }
      break

    case 'Escape':
      activeIndex.value = -1
      break
  }
}

// Watchers
watch(activeTab, () => {
  unreadPage.value = 1
  inboxPage.value = 1
  allPage.value = 1
  activeIndex.value = -1
})

watch(search, () => {
  unreadPage.value = 1
  inboxPage.value = 1
  allPage.value = 1
  activeIndex.value = -1
})

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 600)

  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* Page layout */

.notification-card-clean {
  border-radius: 12px;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  overflow: hidden;
}

/* Keyboard active state */

.notification-item.active {
  outline: 2px solid rgba(var(--v-theme-primary), 0.3);
  outline-offset: 2px;
  background: rgba(var(--v-theme-primary), 0.02);
}

/* Responsive */

@media (max-width: 600px) {
  .rounded-xl {
    border-radius: 12px !important;
  }

  .notification-item {
    padding: 12px !important;
    margin-bottom: 12px;
  }

  .v-btn {
    min-width: auto !important;
  }

  .v-btn--size-small {
    font-size: 0.75rem;
    padding: 0 8px;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .rounded-xl {
    border-radius: 14px !important;
  }
}
</style>
