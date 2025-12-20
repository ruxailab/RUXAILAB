<template>
  <v-list-item
    class="notification-list-item p-0 m-0"
    @click="onClick"
  >
    <template #prepend>
      <v-avatar size="36" class="mr-3">
        <v-icon size="28" :color="!notification.read ? 'primary' : 'grey'">
          {{ getTestIcon(notification.testType) }}
        </v-icon>
      </v-avatar>
    </template>
      <v-list-item-title class="notification-item-title">
        {{ notification.title }}
        <span v-if="notification.type" class="ml-2 text-caption text-primary">({{ notification.type }})</span>
      </v-list-item-title>
      <v-list-item-subtitle class="notification-item-desc">
        <span v-html="formatMultiline(notification.description)"></span>
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
import { useI18n } from 'vue-i18n';
import { METHOD_DEFINITIONS } from '@/shared/constants/methodDefinitions.js';
const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['go-to-redirect', 'mark-as-read']);
const { t } = useI18n();

function formatMultiline(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const getTestIcon = (type) => {
  if (type && METHOD_DEFINITIONS[type] && METHOD_DEFINITIONS[type].icon) {
    return METHOD_DEFINITIONS[type].icon;
  }
  return 'mdi-help-circle';
};
const onClick = () => emit('go-to-redirect', props.notification);
</script>

<style scoped>
.notification-list-item {
  cursor: pointer;
}
.notification-item-title {
  font-weight: bold;
}
.notification-item-desc {
  white-space: pre-line;
}
.notification-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}
</style>
