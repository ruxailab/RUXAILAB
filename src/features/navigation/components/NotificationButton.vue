<template>
  <div v-if="Array.isArray(user.notifications)">
    <v-menu
      location="bottom"
      absolute
      offset="8"
      max-width="400"
    >
      <template #activator="{ props }">
        <v-badge
          color="red"
          location="bottom end"
          :content="checkIfHasNewNotifications()"
          :model-value="checkIfHasNewNotifications() > 0"
          offset-x="5"
          offset-y="5"
        >
          <v-btn
            size="small"
            icon
            class="mr-1"
            v-bind="props"
          >
            <v-icon size="20">
              {{
                checkIfHasNewNotifications() > 0
                  ? 'mdi-bell-ring'
                  : 'mdi-bell-outline'
              }}
            </v-icon>
          </v-btn>
        </v-badge>
      </template>

      <v-card
        class="pa-0"
        max-width="500"
        style="overflow: hidden"
      >
        <!-- Fixed header -->
        <div
          class="bg-secondary"
          style="
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span style="font-weight: bold; font-size: 16px; color: white">
            {{ $t('common.notifications') }}
          </span>
          <v-btn
            variant="text"
            size="small"
            style="color: white; text-transform: uppercase; font-weight: 500"
            @click="goToNotificationPage"
          >
            {{ $t('common.viewAll') }}
          </v-btn>
        </div>

        <v-divider />

        <!-- Notifications content -->
        <v-card-text style="padding: 0">
          <div
            v-if="user.notifications.length > 0"
            style="max-height: 50vh; overflow-y: auto"
          >
            <v-list
              density="compact"
              class="py-1 notification-list"
            >
              <template
                v-for="(notification, i) in sortedNotifications || []"
                :key="notification.id"
              >
                <NotificationItem
                  :notification="notification"
                  @go-to-redirect="handleNotificationClick"
                  @mark-as-read="handleNotificationClick"
                />
                <v-divider
                  v-if="i < (user.notifications?.length || 0) - 1"
                  class="mx-4"
                  color="secondary"
                />
              </template>
            </v-list>
          </div>

          <!-- No notifications -->
          <div
            v-else
            class="text-center py-6"
          >
            <v-icon
              size="36"
              class="mb-2"
              color="grey"
            >
              mdi-bell-off
            </v-icon>
            <div class="text-grey text-subtitle-2">
              <strong>{{ $t('common.noNotifications') }}</strong>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>

    <!-- Accept Invitation Dialog -->
    <AcceptInvitationDialog
      v-model="dialogVisible"
      @cancel="onReject"
      @submit="onAccept"
    />

    <!-- Message View Dialog -->
    <MessageViewDialog
      v-model:show="messageDialogVisible"
      :notification="selectedNotification"
      @close="onMessageClose"
      @reply="onMessageReply"
    />
  </div>
</template>

<script setup>
import NotificationItem from '@/features/notifications/components/NotificationItem.vue'
import MessageViewDialog from '@/shared/components/dialogs/MessageViewDialog.vue'
import Notification from '@/shared/models/Notification'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import AcceptInvitationDialog from '@/shared/components/dialogs/AcceptInvitationDialog.vue'
import StudyController from '@/controllers/StudyController'

// Initialize store, router, and toast
const store = useStore()
const router = useRouter()
const toast = useToast()

const user = computed(() => store.getters.user)

const sortedNotifications = computed(() => {
  return [...user.value.notifications].sort(
    (a, b) => b.createdDate - a.createdDate,
  )
})

// Invitation dialog state
const dialogVisible = ref(false)
let resolveDialog

// Message dialog state
const messageDialogVisible = ref(false)
const selectedNotification = ref(null)

const onAccept = () => {
  dialogVisible.value = false
  resolveDialog(true)
}

const onReject = () => {
  dialogVisible.value = false
  resolveDialog(false)
}

function showAcceptDialog() {
  dialogVisible.value = true
  return new Promise((resolve) => {
    resolveDialog = resolve
  })
}

const checkIfHasNewNotifications = () => {
  return user.value.notifications.filter((n) => !n.read).length
}

// Main handler that routes to appropriate dialog based on notification type
const handleNotificationClick = async (notification) => {
  if (notification.type === 'message') {
    // Show message view dialog
    selectedNotification.value = notification
    messageDialogVisible.value = true
  } else {
    // Default: treat as invitation (for backwards compatibility)
    await handleInvitationNotification(notification)
  }
}

// Handle invitation notifications (existing logic)
const handleInvitationNotification = async (notification) => {
  const accepted = await showAcceptDialog()
  if (!accepted) {
    // mark as read and exit
    await store.dispatch('markNotificationAsRead', {
      notification,
      user: user.value,
    })
    return
  }
  const study = await new StudyController().getStudy({
    id: notification.testId,
  })

  await store.dispatch('acceptStudyCollaboration', {
    test: study,
    cooperator: user.value,
  })

  await store.dispatch('markNotificationAsRead', {
    notification,
    user: user.value,
  })
  if (notification.redirectsTo) {
    try {
      window.open(window.location.origin + notification.redirectsTo, '_blank')
    } catch (e) {
      console.error(e)
      window.open(
        window.location.origin + '/' + notification.redirectsTo,
        '_blank',
      )
    }
  } else {
    goToNotificationPage()
  }
}

// Handle message dialog close
const onMessageClose = async (notification) => {
  if (notification && !notification.read) {
    await store.dispatch('markNotificationAsRead', {
      notification,
      user: user.value,
    })
  }
}

// Handle message reply
const onMessageReply = async ({ notification, replyContent }) => {
  try {
    // Get the sender's user ID to send the reply to
    const recipientUserId = notification.senderUserId

    if (!recipientUserId) {
      toast.error('Cannot reply: sender information not available')
      return
    }

    // Create reply notification
    const replyNotification = new Notification({
      title: `Re: ${notification.title}`,
      description: replyContent,
      redirectsTo: null,
      author: user.value.email,
      read: false,
      testId: notification.testId,
      type: 'message',
      senderUserId: user.value.id,
    })

    // Send the reply notification to the original sender
    await store.dispatch('addNotification', {
      userId: recipientUserId,
      notification: replyNotification,
    })

    // Mark original notification as read
    await store.dispatch('markNotificationAsRead', {
      notification,
      user: user.value,
    })

    toast.success('Reply sent successfully')
  } catch (error) {
    console.error('Error sending reply:', error)
    toast.error('Failed to send reply')
  }
}

const goToNotificationPage = () => {
  router
    .push({
      path: '/admin',
      query: { section: 'notifications' },
    })
    .catch(() => {})
}
</script>
