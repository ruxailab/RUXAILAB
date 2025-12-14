<template>
  <v-list-item
    class="notification-list-item p-0 m-0"
    :class="{ unread: !notification.read }"
    @click="onClick"
  >
    <template #prepend>
      <v-avatar size="36" class="mr-3" :color="getAvatarColor()">
        <v-icon size="20" color="white">
          {{ getNotificationIcon() }}
        </v-icon>
      </v-avatar>
    </template>
    <v-list-item-title class="notification-item-title">
      {{ notification.title }}
      <v-chip
        v-if="notification.type === 'message'"
        size="x-small"
        color="info"
        class="ml-2"
      >
        Message
      </v-chip>
      <v-chip
        v-else-if="notification.type === 'invitation' || !notification.type"
        size="x-small"
        color="warning"
        class="ml-2"
      >
        Invitation
      </v-chip>
    </v-list-item-title>
    <v-list-item-subtitle class="notification-item-desc">
      <span
        v-html="formatMultiline(truncateDescription(notification.description))"
      ></span>
    </v-list-item-subtitle>
    <div class="notification-meta">
      <span class="notification-author">
        {{ $t('common.sentBy') }}: {{ notification.author }}
      </span>
      <p class="notification-date">
        {{ formatDate(notification.createdDate) }}
      </p>
    </div>
  </v-list-item>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['go-to-redirect', 'mark-as-read'])
const { t } = useI18n()

function formatMultiline(text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

function truncateDescription(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return (
    d.toLocaleDateString() +
    ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

const getNotificationIcon = () => {
  if (props.notification.type === 'message') {
    return 'mdi-email'
  }
  // Default to invitation icon
  return 'mdi-account-plus'
}

const getAvatarColor = () => {
  if (!props.notification.read) {
    return props.notification.type === 'message' ? 'info' : 'warning'
  }
  return 'grey'
}

const onClick = () => emit('go-to-redirect', props.notification)
</script>

<style scoped>
.notification-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}
.notification-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.notification-list-item.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
.notification-item-title {
  font-weight: bold;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.notification-item-desc {
  white-space: pre-line;
  color: #666;
}
.notification-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
</style>
