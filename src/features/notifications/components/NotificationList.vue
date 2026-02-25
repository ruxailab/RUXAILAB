<template>
  <div class="notification-list">
    <NotificationItem
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @go-to-redirect="$emit('go-to-redirect', $event)"
      @mark-as-read="$emit('mark-as-read', $event)"
    />
  </div>
</template>

<script setup>
import NotificationItem from '@/features/notifications/components/NotificationItem.vue';

defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

defineEmits(['go-to-redirect', 'mark-as-read']);
</script>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>