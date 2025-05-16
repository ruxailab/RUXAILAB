<template>
  <div v-if="user.notifications">
    <v-menu
      :location="`${x} ${y}`"
      absolute
      offset="8"
      min-width="300"
    >
      <template #activator="{ props }">
        <v-badge
          color="red"
          location="bottom end"
          :content="checkIfHasNewNotifications()"
          :model-value="checkIfHasNewNotifications() > 0"
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

      <v-card class="pa-0" max-width="500" style="overflow: hidden;">
        <!-- Fixed header -->
        <div style="background: orange; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
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
          <div v-if="user.notifications.length > 0" style="max-height: 50vh; overflow-y: auto;">
            <v-list density="compact" class="py-1">
              <v-list-item
                v-for="(notification, i) in user.notifications"
                :key="i"
                class="px-3"
                :disabled="notification.read"
                @click="goToNotificationRedirect(notification)"
              >
                <template #prepend v-if="!notification.read">
                  <v-chip
                    size="x-small"
                    color="success"
                    variant="outlined"
                    label
                  >
                    {{ $t('common.new') }}!
                  </v-chip>
                </template>

                <v-list-item-title style="font-weight: bold;">
                  {{ notification.title }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ notification.description }}</v-list-item-subtitle>
                <v-list-item-subtitle>
                  {{ $t('common.sentBy') }} {{ notification.author }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <!-- No notifications -->
          <div v-else class="text-center py-6">
            <v-icon size="36" class="mb-2" color="grey">
              mdi-bell-off
            </v-icon>
            <div class="text-grey text-subtitle-2">
              <strong>{{ $t('common.noNotifications') }}</strong>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// Initialize store, router, and i18n
const store = useStore();
const router = useRouter();
const { t } = useI18n();

const x = ref('right');
const y = ref('top');

const user = computed(() => store.getters.user);

const checkIfHasNewNotifications = () => {
  return user.value.notifications.filter((n) => !n.read).length;
};

const goToNotificationRedirect = async (notification) => {
  await store.dispatch('markNotificationAsRead', {
    notification,
    user: user.value,
  });
  window.open(`/${notification.redirectsTo}`, '_blank');
};

const goToNotificationPage = () => {
  router.push('/notifications');
};
</script>

<style scoped>
.text-grey {
  color: #9e9e9e;
}
</style>