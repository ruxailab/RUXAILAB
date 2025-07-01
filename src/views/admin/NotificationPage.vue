<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        md="10"
      >
        <v-card
          class="rounded-xxl"
          border
        >
          <v-card-title class="text-h5">
            {{ $t('common.notifications') }}
            <v-spacer />
            <v-btn
              v-if="activeTab === 'unread'"
              color="primary"
              :disabled="allRead"
              @click="markAllAsRead"
            >
              Mark all as read
            </v-btn>
          </v-card-title>

          <v-tabs
            v-model="activeTab"
            bg-color="#f3a426"
          >
            <v-tab href="#unread">
              {{ $t('common.unread') }}
            </v-tab>
            <v-tab href="#inbox">
              {{ $t('common.inbox') }}
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <v-window-item value="unread">
              <v-card-text v-if="unreadNotifications.length > 0">
                <notification-list
                  :notifications="unreadNotifications"
                  @mark-as-read="markAsRead"
                  @go-to-redirect="goToNotificationRedirect"
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
              <v-card-text v-if="user.inbox && user.inbox.length > 0">
                <notification-list
                  :notifications="user.inbox"
                  @mark-as-read="markAsRead"
                  @go-to-redirect="goToNotificationRedirect"
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
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import NotificationList from '@/components/molecules/NotificationList.vue'

const store = useStore()
const router = useRouter()

const activeTab = ref('unread')

const user = computed(() => store.getters.user)

const allRead = computed(() =>
  user.value.notifications.every((notification) => notification.read)
)

const unreadNotifications = computed(() =>
  user.value.notifications.filter((notification) => !notification.read)
)

const goToNotificationRedirect = async (notification) => {
  if (!notification.read) {
    await markAsRead(notification)
  }
  window.open(`/${notification.redirectsTo}`)
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
  for (const notification of unread) {
    await markAsRead(notification)
  }
}

const goBack = () => {
  router.go(-1)
}

const conall = () => {
  console.log(user.value.inbox[0])
}
</script>