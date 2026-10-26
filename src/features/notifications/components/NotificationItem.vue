<template>
  <div
    class="notification-item"
    :class="{ unread: !notification.read }"
    @click="onClick"
  >
    <div class="notification-inner">
      <!-- Icon -->
      <div class="position-relative">
        <v-avatar
          size="40"
          :color="`${typeConfig.color}-lighten-5`"
          class="icon"
        >
          <v-icon :color="typeConfig.color">
            {{ typeConfig.icon }}
          </v-icon>
        </v-avatar>

        <!-- Unread indicator -->
        <div v-if="!notification.read" class="unread-dot" />
      </div>

      <!-- Content -->
      <div class="content">
        <div class="title-row">
          <div class="title-content">
            <div class="d-flex align-center flex-wrap ga-2">
              <!-- Title -->
              <div class="text-subtitle-1 font-weight-medium">
                {{ notificationTitle }}
              </div>

              <!-- Type -->
              <v-chip
                size="x-small"
                label
                :color="typeConfig.color"
                variant="flat"
                density="compact"
                class="type-chip"
              >
                {{ $t(typeConfig.label) }}
              </v-chip>

              <!-- Important -->
              <v-chip
                v-if="notification.important"
                size="x-small"
                label
                color="warning"
                variant="flat"
                density="compact"
                prepend-icon="mdi-star"
              >
                {{ $t('notificationsPage.important') }}
              </v-chip>
            </div>
          </div>

          <!-- Time + read action -->
          <div class="d-flex align-center ga-1">
            <span class="time">
              {{ relativeTime(notification.createdDate) }}
            </span>

            <v-btn
              icon
              size="x-small"
              variant="text"
              class="mark-btn"
              :aria-label="
                notification.read
                  ? $t('notificationsPage.markAsUnread')
                  : $t('notificationsPage.markAsRead')
              "
              @click.stop="toggleRead"
            >
              <v-icon size="18" :color="notification.read ? 'grey' : 'primary'">
                {{
                  notification.read
                    ? 'mdi-email-outline'
                    : 'mdi-email-open-outline'
                }}
              </v-icon>

              <v-tooltip activator="parent">
                {{
                  notification.read
                    ? $t('notificationsPage.markAsUnread')
                    : $t('notificationsPage.markAsRead')
                }}
              </v-tooltip>
            </v-btn>
          </div>
        </div>

        <!-- Description -->
        <div class="description line-clamp-2">
          {{ notificationDescription }}
        </div>

        <!-- Author -->
        <div v-if="notification.author" class="meta">
          <v-icon size="small"> mdi-account-outline </v-icon>

          {{ notification.author }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getNotificationTypeConfig } from '@/features/notifications/utils/notificationUtils.js'

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['go-to-redirect', 'toggle-read'])

const { t } = useI18n()

/**
 * Resolve the visual configuration for the notification type.
 *
 * The notification keeps its original `type` value
 * (e.g. "Session", "Message", "Collaboration").
 */
const typeConfig = computed(() =>
  getNotificationTypeConfig(props.notification.type),
)

const notificationTitle = computed(() => {
  const notification = props.notification

  if (notification.title) {
    return notification.title
  }

  return t('notificationsPage.notification')
})

const notificationDescription = computed(() => {
  const notification = props.notification

  if (notification.description) {
    return notification.description
  }

  return t('notificationsPage.newNotification')
})

const onClick = () => {
  emit('go-to-redirect', props.notification)
}

const toggleRead = () => {
  emit('toggle-read', props.notification)
}

const relativeTime = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000

  if (diff < 60) {
    return t('notificationsPage.justNow')
  }

  if (diff < 3600) {
    return t('notificationsPage.minutesAgo', {
      count: Math.floor(diff / 60),
    })
  }

  if (diff < 86400) {
    return t('notificationsPage.hoursAgo', {
      count: Math.floor(diff / 3600),
    })
  }

  return t('notificationsPage.daysAgo', {
    count: Math.floor(diff / 86400),
  })
}
</script>

<style scoped>
.notification-item {
  position: relative;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.notification-item.unread {
  background: rgba(var(--v-theme-primary), 0.02);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background-color: rgb(var(--v-theme-primary));
}

.notification-inner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.icon {
  flex-shrink: 0;
}

.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: rgb(var(--v-theme-primary));
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

.content {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.title-content {
  min-width: 0;
  flex: 1;
}

.type-chip {
  flex-shrink: 0;
}

.time {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
}

.description {
  font-size: 13px;
  color: #555;
  margin: 4px 0 6px;
  white-space: pre-line;
}

.meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #888;
}

.mark-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .mark-btn {
  opacity: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
  -moz-box-orient: vertical;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}
</style>
