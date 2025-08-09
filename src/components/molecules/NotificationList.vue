<template>
  <v-list lines="two" class="pl-5 pr-8">
    <template
      v-for="(notification, index) in notifications"
      :key="notification.id"
    >
      <v-row justify="space-between" align="center">
        <v-list-item
          @click="$emit('go-to-redirect', notification)"
          width="90%"
        >
          <v-list-item-title
            :class="{ 'font-weight-bold': !notification.read }"
          >
            {{ notification.title }}
            <v-chip
              v-if="!notification.read"
              size="x-small"
              color="success"
              class="ml-2"
              variant="outlined"
            >
              NEW!
            </v-chip>
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ notification.description }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            Sent by {{ notification.author }}
          </v-list-item-subtitle>
          <v-list-item-subtitle
            class="text-caption text-grey-darken-1 mt-1"
          >
            At: {{ formatFrontendDate(notification.createdDate) }}
          </v-list-item-subtitle>

          <!-- Notification read date (conditional) -->
          <v-list-item-subtitle
            v-if="notification.readAt"
            class="text-caption text-success mt-1"
          >
            Seen: {{ formatFrontendDate(notification.readAt) }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-btn
          icon
          @click.stop="$emit('mark-as-read', notification)"
        >
          <v-icon>
            {{ notification.read ? 'mdi-email-open' : 'mdi-email' }}
          </v-icon>
        </v-btn>
        <v-divider
          v-if="index < notifications.length - 1"
          :key="`divider-${index}`"
        />
      </v-row>
    </template>
  </v-list>
</template>

<script setup>

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['go-to-redirect', 'mark-as-read']);

const formatFrontendDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // Format the date in a human-readable way
};
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
}
</style>