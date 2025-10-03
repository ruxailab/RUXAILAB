<template>
  <v-container>
    <v-row justify="center" v-if="user">
      <v-col
        cols="12"
      >
        <v-card
          class="rounded-xxl"
          flat
        >
          <v-row class="ma-0 " justify="space-between">
            <v-card-title class="text-h5 pl-0"> {{ $t('common.notifications') }}</v-card-title>
            <v-btn v-if="activeTab === 'unread'"
              color="primary"
              :disabled="allRead"
              @click="markAllAsRead"
            >
              Mark all as read
            </v-btn>
            </v-row>
          <v-tabs v-model="activeTab" bg-color="secondary">
            <v-tab value="unread">{{ $t('common.unread') }}</v-tab>
            <v-tab value="inbox">{{ $t('common.inbox') }}</v-tab>
          </v-tabs>
          <v-window v-model="activeTab">
            <v-window-item value="unread">
              <v-card-text v-if="paginatedUnreadNotifications.length > 0" class="pa-0">
                <notification-list
                  :notifications="paginatedUnreadNotifications"
                  @mark-as-read="markAsRead"
                  @go-to-redirect="goToNotificationRedirect"
                />
                <v-pagination
                  v-if="unreadPages > 1"
                  v-model="unreadPage"
                  :length="unreadPages"
                  rounded="circle"
                  class="mt-4"
                />
              </v-card-text>
              <v-card-text v-else>
                <v-alert
                  type="info"
                  variant="outlined"
                >
                  {{ $t('common.noNotifications') }}
                </v-alert>
              </v-card-text>
            </v-window-item>

            <v-window-item value="inbox">
              <v-card-text v-if="paginatedInboxNotifications.length > 0">
                <notification-list
                  :notifications="paginatedInboxNotifications"
                  @mark-as-read="markAsRead"
                  @go-to-redirect="goToNotificationRedirect"
                />
                <v-pagination
                  v-if="inboxPages > 1"
                  v-model="inboxPage"
                  :length="inboxPages"
                  rounded="circle"
                  class="mt-4"
                />
              </v-card-text>
              <v-card-text v-else>
                <v-alert
                  type="info"
                  variant="outlined"
                >
                  {{ $t('common.noNotifications') }}
                </v-alert>
              </v-card-text>
            </v-window-item>
          </v-window>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="secondary"
              variant="text"
              @click="goBack"
            >
              {{ $t('buttons.back') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

  <AcceptInvitationDialog
    v-model="dialogVisible"
    @cancel="onReject"
    @submit="onAccept"
  />
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import NotificationList from '@/features/notifications/components/NotificationList.vue'
import AcceptInvitationDialog from '@/shared/components/dialogs/AcceptInvitationDialog.vue'
import StudyController from '@/controllers/StudyController'

const store = useStore()
const router = useRouter()

const activeTab = ref('unread')

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

function showAcceptDialog() {
  dialogVisible.value = true
  return new Promise((resolve) => {
    resolveDialog = resolve
  })
}

const pageSize = 5
const unreadPage = ref(1)
const inboxPage = ref(1)

const user = computed(() => store.getters.user)

const allRead = computed(() =>
  user.value.notifications.every((notification) => notification.read)
)

const sortedNotifications = computed(() =>
  [...user.value.notifications].sort((a, b) => {
    const aDate = new Date(a.createdDate)
    const bDate = new Date(b.createdDate)
    return bDate - aDate
  })
)

const unreadNotifications = computed(() =>
  sortedNotifications.value.filter((notification) => !notification.read)
)

const unreadPages = computed(() => Math.ceil(unreadNotifications.value.length / pageSize))
const paginatedUnreadNotifications = computed(() => {
  const start = (unreadPage.value - 1) * pageSize
  const end = start + pageSize
  return unreadNotifications.value.slice(start, end)
})

const inboxPages = computed(() => Math.ceil(sortedNotifications.value.length / pageSize))
const paginatedInboxNotifications = computed(() => {
  const start = (inboxPage.value - 1) * pageSize
  const end = start + pageSize
  return sortedNotifications.value.slice(start, end)
})

const goToNotificationRedirect = async (notification) => {
  if(notification.redirectsTo === null) return
 
  const accepted = await showAcceptDialog()
  if (!accepted) {
    await markAsRead(notification)
    return
  }
  const study = await new StudyController().getStudy({ id: notification.testId })
    
  await store.dispatch('acceptStudyCollaboration', {
    test: study,
    cooperator: user.value,
  });
  
  if (!notification.read) {
    await markAsRead(notification)
  }

  try {
    window.open(window.location.origin + notification.redirectsTo, '_blank')
  } catch(e) {
    console.error(e)
    window.open(window.location.origin + '/' + notification.redirectsTo, '_blank')
  }
}

const markAsRead = async (notification) => {
  console.log(notification)
  await store.dispatch('markNotificationAsRead', {
    notification,
    user: user.value
  })
}

const markAllAsRead = async () => {
  const unread = user.value.notifications.filter((n) => !n.read)

  if (unread.length === 0) return

  try {
    await Promise.all(
      unread.map((notification) =>
        store.dispatch('markNotificationAsRead', {
          notification,
          user: user.value,
        })
      )
    )
  } catch (e) {
    console.error('Error marking all as read:', e)
  }
}

const goBack = () => {
  router.go(-1)
}
</script>