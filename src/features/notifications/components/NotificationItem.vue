<template>
  <div
    class="notification-item"
    :class="{ unread: !notification.read }"
    @click="onClick"
  >
    <div class="notification-inner">
      <!-- Unread Dot -->
      <div v-if="!notification.read" class="unread-dot" />

      <!-- Icon -->
      <v-avatar size="40" class="icon">
        <v-icon :color="!notification.read ? 'primary' : 'grey'">
          {{ getTestIcon(notification.testType) }}
        </v-icon>
      </v-avatar>

      <!-- Content -->
      <div class="content">
        <div class="title-row">
          <div class="text-subtitle-1 font-weight-medium">
            {{ notification.title || (notification.titleTemplate ? $t(notification.titleTemplate, notification.titleParams || {}) : 'Notification') }}
          </div>

          <span class="time">
            {{ relativeTime(notification.createdDate) }}
          </span>
        </div>

        <div class="description line-clamp-2">
          {{ notification.description || (notification.descriptionTemplate ? $t(notification.descriptionTemplate, notification.descriptionParams || {}) : '') }}
        </div>

        <div class="meta">
          {{ $t('common.sentBy') }} {{ notification.author }}
        </div>
      </div>

      <!-- Hover Action -->
      <v-btn
        icon
        size="x-small"
        variant="text"
        class="mark-btn"
        @click.stop="emit('mark-as-read', notification)"
      >
        <v-icon size="16">
          {{
            notification.read ? 'mdi-email-outline' : 'mdi-email-open-outline'
          }}
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { METHOD_DEFINITIONS } from '@/shared/constants/methodDefinitions.js'

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['go-to-redirect', 'mark-as-read'])
const { t } = useI18n()

const onClick = () => emit('go-to-redirect', props.notification)


const getTestIcon = (type) =>
  METHOD_DEFINITIONS?.[type]?.icon || 'mdi-bell-outline'

const relativeTime = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
</script>

<style scoped>
.notification-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.notification-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

.notification-item.unread {
  background: rgba(var(--v-theme-primary), 0.08);
}

.notification-inner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #1976d2;
  border-radius: 50%;
  margin-top: 6px;
}

.icon {
  flex-shrink: 0;
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

.title {
  font-weight: 600;
  font-size: 14px;
}

.type-badge {
  font-size: 11px;
  color: var(--v-theme-primary);
  margin-left: 6px;
}

.time {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
}

.description {
  font-size: 13px;
  color: #555;
  margin: 4px 0;
  white-space: pre-line;
}

.meta {
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
</style>
