<template>
  <v-list
    lines="three"
  >
    <template
      v-for="(notification, index) in notifications"
      :key="notification.id"
    >
      <NotificationItem
        :notification="notification"
        @go-to-redirect="$emit('go-to-redirect', $event)"
        @mark-as-read="$emit('mark-as-read', $event)"
      />
      <v-divider
        v-if="index < notifications.length - 1"
        :key="`divider-${index}`"
      />
    </template>
  </v-list>
</template>

<script setup>
import NotificationItem from '@/features/notifications/components/NotificationItem.vue';

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['go-to-redirect', 'mark-as-read']);
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
}
</style>