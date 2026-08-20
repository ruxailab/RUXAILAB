<template>
  <div v-if="Array.isArray(user.notifications)">
    <v-menu
      v-model="menuOpen"
      location="bottom end"
      offset="10"
      max-width="420"
      transition="scale-transition"
    >
      <!-- Bell -->
      <template #activator="{ props }">
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount"
          color="error"
          location="top end"
          offset-x="6"
          offset-y="6"
        >
          <v-btn
            icon
            size="small"
            class="notification-bell"
            :class="{ pulse: unreadCount > 0 }"
            v-bind="props"
            :aria-label="$t('common.notificationBell')"
          >
            <v-icon>mdi-bell-ring</v-icon>
          </v-btn>
        </v-badge>

        <v-btn
          v-else
          icon
          size="small"
          v-bind="props"
          :aria-label="$t('common.notificationBell')"
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <!-- Dropdown -->
      <v-card class="notification-dropdown" elevation="6">
        <div class="dropdown-header">
          <span class="text-h6">
            {{ $t('common.notifications') }}
          </span>

          <div class="actions">
            <v-btn
              v-if="unreadCount > 0"
              size="x-small"
              variant="text"
              color="primary"
              @click="markAllAsRead"
            >
              {{ $t('common.markAllAsRead') }}
            </v-btn>

            <v-btn
              size="x-small"
              variant="text"
              color="primary"
              @click="goToNotificationPage"
            >
              {{ $t('common.viewAll') }}
            </v-btn>
          </div>
        </div>

        <v-divider />

        <div class="dropdown-content">
          <template v-if="unreadNotifications.length">
            <NotificationItem
              v-for="(notification, index) in unreadNotifications"
              :key="notification.id"
              :notification="notification"
              :class="{ active: index === activeIndex }"
              style="margin-bottom: 10px"
              @go-to-redirect="goToNotificationRedirect"
              @mark-as-read="markNotificationAsRead"
            />
          </template>

          <div v-else class="empty-state">
            <v-icon size="40" color="grey"> mdi-bell-check </v-icon>

            <div class="empty-title">
              {{ $t('common.caughtUp') }}
            </div>

            <div class="empty-subtitle">
              {{ $t('common.noNewNotifications') }}
            </div>
          </div>
        </div>
      </v-card>
    </v-menu>

    <!-- Dialog -->
    <AcceptInvitationDialog
      v-model="dialogVisible"
      :title="$t('invite.pendingTitle')"
      :subtitle="`${$t('invite.pendingSubtitle')}: ${invite?.studyTitle ?? ''}`"
      @cancel="onReject"
      @submit="onAccept"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import NotificationItem from '@/features/notifications/components/NotificationItem.vue'
import AcceptInvitationDialog from '@/shared/components/dialogs/AcceptInvitationDialog.vue'
import { NOTIFICATION_TYPES } from '../../notifications/utils/notificationUtils'

const store = useStore()
const router = useRouter()

const menuOpen = ref(false)
const activeIndex = ref(-1)

const invite = ref(null)
const dialogVisible = ref(false)

let resolveDialog

const user = computed(() => store.getters.user)

const unreadNotifications = computed(() =>
  [...(user.value.notifications || [])]
    .filter((notification) => !notification.read)
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0, 6),
)

const unreadCount = computed(
  () =>
    (user.value.notifications || []).filter(
      (notification) => !notification.read,
    ).length,
)

/**
 * Notification type
 *
 * The notification itself should keep its original type string.
 * The visual configuration is handled by NotificationItem.
 */
const isCollaborationNotification = (notification) => {
  if (!notification) return false

  if (
    notification.type === NOTIFICATION_TYPES.COLLABORATION ||
    notification.type === NOTIFICATION_TYPES.PARTICIPANT
  ) {
    return true
  }
  return false
}

/* Dialog */

const onAccept = () => {
  dialogVisible.value = false
  resolveDialog?.(true)
  resolveDialog = null
}

const onReject = () => {
  dialogVisible.value = false
  resolveDialog?.(false)
  resolveDialog = null
}

const showAcceptDialog = () => {
  dialogVisible.value = true

  return new Promise((resolve) => {
    resolveDialog = resolve
  })
}

/* Actions */

const markNotificationAsRead = async (notification) => {
  if (!notification) return

  await store.dispatch('markNotificationAsRead', {
    notification,
    user: user.value,
  })
}

const goToNotificationRedirect = async (notification) => {
  if (!notification) return

  const isCollaboration = isCollaborationNotification(notification)

  let redirectTo = notification.redirectsTo

  const inviteToken =
    notification.inviteToken ?? localStorage.getItem('pendingInviteToken')

  /*
   * Collaboration notifications require accepting/rejecting
   * the invitation before following the redirect.
   */
  if (isCollaboration && inviteToken) {
    const result = await store.dispatch('loadInvite', {
      token: inviteToken,
    })

    if (result != null) {
      invite.value = result.invite
    }
  }

  if (isCollaboration && invite.value) {
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

    if (!notification.testId) {
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

  await markNotificationAsRead(notification)

  if (!redirectTo) {
    menuOpen.value = false
    return
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

  menuOpen.value = false
}

const markAllAsRead = async () => {
  const unread = (user.value.notifications || []).filter(
    (notification) => !notification.read,
  )

  if (!unread.length) return

  await store.dispatch('markAllNotificationsAsRead', user.value)
}

const goToNotificationPage = () => {
  menuOpen.value = false

  router.push({
    path: '/admin',
    query: {
      section: 'notifications',
    },
  })
}

/* Keyboard */

const handleKey = (event) => {
  if (!menuOpen.value) return

  if (event.key === 'j') {
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      unreadNotifications.value.length - 1,
    )
  }

  if (event.key === 'k') {
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  }

  if (event.key === 'Enter' && unreadNotifications.value[activeIndex.value]) {
    goToNotificationRedirect(unreadNotifications.value[activeIndex.value])
  }

  if (event.key === 'Escape') {
    menuOpen.value = false
  }
}

onMounted(() => {
  globalThis.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKey)
})

watch(menuOpen, (open) => {
  if (open) {
    activeIndex.value = unreadNotifications.value.length ? 0 : -1
  }
})
</script>

<style scoped>
.notification-bell.pulse {
  position: relative;
  z-index: 1;
}

.notification-bell.pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 0, 0, 0.5);
  animation: pulse 1.5s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.notification-dropdown {
  border-radius: 14px;
  max-height: 70vh;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.dropdown-header .actions {
  display: flex;
  gap: 6px;
}

.dropdown-content {
  max-height: 50vh;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  text-align: center;
  padding: 24px 12px;
}

.empty-title {
  font-weight: 600;
  margin-top: 8px;
}

.empty-subtitle {
  font-size: 12px;
  color: #888;
}
</style>
