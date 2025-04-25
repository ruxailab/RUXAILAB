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

      <v-card>
        <!-- Top bar -->
        <v-app-bar
          color="orange"
          dense
        >
          <v-toolbar-title>{{ $t('common.notifications') }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            variant="text"
            @click="goToNotificationPage"
          >
            {{ $t('common.viewAll') }}
          </v-btn>
        </v-app-bar>

        <v-card-text>
          <div
            v-if="user.notifications.length > 0"
            style="max-height: 50vh; overflow-y: auto;"
          >
            <v-list
              density="compact"
              class="ma-0 py-1"
            >
              <v-list-item
                v-for="(notification, i) in user.notifications"
                :key="i"
                class="px-2"
                style="font-size: 14px; font-family: Roboto;"
                :disabled="notification.read"
                @click="goToNotificationRedirect(notification)"
              >
                <v-list-item-title style="font-weight: bold">
                  {{ notification.title }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ notification.description }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  {{ $t('common.sentBy') }} {{ notification.author }}
                </v-list-item-subtitle>

                <template
                  v-if="!notification.read"
                  #prepend
                >
                  <v-chip
                    size="x-small"
                    color="success"
                    variant="outlined"
                    label
                  >
                    {{ $t('common.new') }}!
                  </v-chip>
                </template>
              </v-list-item>

              <v-divider />
            </v-list>
          </div>

          <div v-else>
            <v-list>
              <v-list-item>
                <v-list-item-title class="text-center text-grey">
                  <strong>{{ $t('common.noNotifications') }}</strong>
                </v-list-item-title>
              </v-list-item>
              <v-list-item-subtitle class="text-center">
                <v-icon class="mt-2 mb-3">
                  mdi-bell-off
                </v-icon>
              </v-list-item-subtitle>
            </v-list>
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