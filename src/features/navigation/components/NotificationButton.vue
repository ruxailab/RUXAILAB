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
              {{ checkIfHasNewNotifications() > 0 ? 'mdi-bell-ring' : 'mdi-bell-outline' }}
            </v-icon>
          </v-btn>
        </v-badge>
      </template>

      <v-card
        class="pa-0"
        max-width="500"
        style="overflow: hidden;"
      >
        <!-- Fixed header -->
  <div class="bg-secondary" style="padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: bold; font-size: 16px; color: white;">
            {{ $t('common.notifications') }}
          </span>
          <v-btn
            variant="text"
            size="small"
            style="color: white; text-transform: uppercase; font-weight: 500;"
            @click="goToNotificationPage"
          >
            {{ $t('common.viewAll') }}
          </v-btn>
        </div>

        <v-divider />

        <!-- Notifications content -->
        <v-card-text style="padding: 0;">
          <div
            v-if="user.notifications.length > 0"
            style="max-height: 50vh; overflow-y: auto;"
          >
            <v-list
              density="compact"
              class="py-1 notification-list"
            >
              <template v-for="(notification, i) in sortedNotifications || []" :key="notification.id">
                <NotificationItem
                  :notification="notification"
                  @go-to-redirect="goToNotificationRedirect"
                  @mark-as-read="goToNotificationRedirect"
                />
                <v-divider v-if="i < (user.notifications?.length || 0) - 1" class="mx-4" color="secondary" />
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

    <AcceptInvitationDialog
    v-model="dialogVisible"
    @cancel="onReject"
    @submit="onAccept"
  />
  </div>
</template>

<script setup>
import NotificationItem from '@/features/notifications/components/NotificationItem.vue';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AcceptInvitationDialog from '@/shared/components/dialogs/AcceptInvitationDialog.vue';
import StudyController from '@/controllers/StudyController';

// Initialize store, router, and i18n
const store = useStore();
const router = useRouter();

const user = computed(() => store.getters.user);

const sortedNotifications = computed(() => {
  return [...user.value.notifications].sort(
    (a, b) => b.createdDate - a.createdDate
  )
})

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

const checkIfHasNewNotifications = () => {
  return user.value.notifications.filter((n) => !n.read).length;
};

const goToNotificationRedirect = async (notification) => {
    const accepted = await showAcceptDialog()
    if (!accepted) {
      // mark as read and exit
      await store.dispatch('markNotificationAsRead', {
        notification,
        user: user.value,
      });
      return
    }
    const study = await new StudyController().getStudy({ id: notification.testId })

    await store.dispatch('acceptStudyCollaboration', {
      test: study,
      cooperator: user.value,
    });

  await store.dispatch('markNotificationAsRead', {
    notification,
    user: user.value,
  });
  if (notification.redirectsTo) {
    try {
      window.open(window.location.origin + notification.redirectsTo, '_blank')
    } catch(e) {
      console.error(e)
      window.open(window.location.origin + '/' + notification.redirectsTo, '_blank')
    }
  } else {
    goToNotificationPage();
  }
};

const goToNotificationPage = () => {
  router.push({ 
    path: '/admin', 
    query: { section: 'notifications' } 
  }).catch(() => { });
};

</script>
