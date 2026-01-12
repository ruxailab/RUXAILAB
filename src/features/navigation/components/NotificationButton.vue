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
          >
            <v-icon>mdi-bell-ring</v-icon>
          </v-btn>
        </v-badge>

        <v-btn
          v-else
          icon
          size="small"
          v-bind="props"
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <!-- 📬 Dropdown -->
      <v-card class="notification-dropdown" elevation="6">
        <!-- Header -->
        <div class="dropdown-header">
          <span class="text-h6">{{ $t('common.notifications') }}</span>

          <div class="actions">
            <v-btn
              v-if="unreadCount > 0"
              size="x-small"
              variant="text"
              color="primary"
              @click="markAllAsRead"
            >
              Mark all as read
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

        <!-- Content -->
        <div class="dropdown-content">
          <template v-if="unreadNotifications.length">
            <NotificationItem
              v-for="(notification, index) in unreadNotifications"
              :key="notification.id"
              :notification="notification"
              :class="{ active: index === activeIndex }"
              @go-to-redirect="goToNotificationRedirect"
              @mark-as-read="goToNotificationRedirect"
            />
          </template>

          <!-- Empty -->
          <div v-else class="empty-state">
            <v-icon size="40" color="grey">mdi-bell-check</v-icon>
            <div class="empty-title">You're all caught up</div>
            <div class="empty-subtitle">No new notifications</div>
          </div>
        </div>
      </v-card>
    </v-menu>

    <!-- Dialog -->
    <AcceptInvitationDialog
      v-model="dialogVisible"
      @cancel="onReject"
      @submit="onAccept"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import NotificationItem from '@/features/notifications/components/NotificationItem.vue'
import AcceptInvitationDialog from '@/shared/components/dialogs/AcceptInvitationDialog.vue'
import StudyController from '@/controllers/StudyController'

const store = useStore()
const router = useRouter()

const menuOpen = ref(false)
const activeIndex = ref(-1)

const user = computed(() => store.getters.user)

const unreadNotifications = computed(() =>
  [...user.value.notifications]
    .filter(n => !n.read)
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0, 6)
)

const unreadCount = computed(() =>
  user.value.notifications.filter(n => !n.read).length
)

/* Dialog  */
const dialogVisible = ref(false)
let resolveDialog

const onAccept = () => {
  dialogVisible.value = false
  resolveDialog(true)
}

const onReject = () => {
  dialogVisible.value = false
  resolveDialog(false)
}

const showAcceptDialog = () => {
  dialogVisible.value = true
  return new Promise(resolve => (resolveDialog = resolve))
}

/* actions */
const goToNotificationRedirect = async (notification) => {
  const accepted = await showAcceptDialog()

  if (!accepted) {
    await store.dispatch('markNotificationAsRead', { notification, user: user.value })
    return
  }

  if (notification.testId) {
    const study = await new StudyController().getStudy({ id: notification.testId })
    await store.dispatch('acceptStudyCollaboration', {
      test: study,
      cooperator: user.value,
    })
  }

  await store.dispatch('markNotificationAsRead', { notification, user: user.value })

  if (notification.redirectsTo) {
    globalThis.open(globalThis.location.origin + notification.redirectsTo, '_blank')
  } else {
    goToNotificationPage()
  }

  menuOpen.value = false
}

const markAllAsRead = async () => {
  const unread = user.value.notifications.filter(n => !n.read)
  await Promise.all(
    unread.map(n =>
      store.dispatch('markNotificationAsRead', { notification: n, user: user.value })
    )
  )
}

const goToNotificationPage = () => {
  menuOpen.value = false
  router.push({ path: '/admin', query: { section: 'notifications' } })
}

/* keyboard  */
const handleKey = (e) => {
  if (!menuOpen.value) return

  if (e.key === 'j') activeIndex.value = Math.min(activeIndex.value + 1, unreadNotifications.value.length - 1)
  if (e.key === 'k') activeIndex.value = Math.max(activeIndex.value - 1, 0)
  if (e.key === 'Enter' && unreadNotifications.value[activeIndex.value]) {
    goToNotificationRedirect(unreadNotifications.value[activeIndex.value])
  }
  if (e.key === 'Escape') menuOpen.value = false
}

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKey)
})

/* Reset keyboard index on open */
watch(menuOpen, (open) => {
  if (open) activeIndex.value = 0
})
</script>

<style scoped>
/* Pulse animation */
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
  0% { transform: scale(1.0); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* Dropdown */
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

.dropdown-header .title {
  font-weight: 600;
  font-size: 15px;
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

/* Empty */
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
