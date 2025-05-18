<template>
  <v-list two-line class="notification-list">
    <template v-for="(notification, index) in sortedNotifications">
      <v-list-item
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        :class="{ 'unread-notification': !notification.read }"
      >
        <v-list-item-content>
          <!-- Notification Title with 'NEW!' badge -->
          <v-list-item-title>
            <span :class="{ 'font-weight-bold': !notification.read }">
              {{ notification.title }}
            </span>
            <v-chip
              v-if="!notification.read"
              x-small
              color="primary"
              class="ml-2"
              text-color="white"
            >
              NEW
            </v-chip>
            <span class="float-right text-caption grey--text">
              {{ formatRelativeDate(notification.createdDate) }}
            </span>
          </v-list-item-title>

          <!-- Notification Description -->
          <v-list-item-subtitle class="mt-1">
            {{ notification.description }}
          </v-list-item-subtitle>

          <!-- Notification Author -->
          <v-list-item-subtitle v-if="notification.author" class="text-caption">
            <v-icon x-small>mdi-account</v-icon>
            {{ notification.author }}
          </v-list-item-subtitle>

          <!-- Notification Dates -->
          <v-list-item-subtitle
            class="text-caption grey--text text--darken-1 mt-1"
          >
            <v-icon x-small>mdi-clock-outline</v-icon>
            {{ formatFullDate(notification.createdDate) }}
          </v-list-item-subtitle>

          <!-- Notification Read Date -->
          <v-list-item-subtitle
            v-if="notification.readAt"
            class="text-caption success--text mt-1"
          >
            <v-icon x-small>mdi-check</v-icon>
            Seen {{ formatRelativeDate(notification.readAt) }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <!-- Mark as Read Button -->
        <v-list-item-action>
          <v-btn icon @click.stop="markAsRead(notification)">
            <v-icon :color="notification.read ? 'grey' : 'primary'">
              {{ notification.read ? 'mdi-email-open' : 'mdi-email' }}
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <!-- Divider Between Notifications -->
      <v-divider
        v-if="index < sortedNotifications.length - 1"
        :key="`divider-${index}`"
      ></v-divider>
    </template>
  </v-list>
</template>

<script>
export default {
  name: 'NotificationList',
  props: {
    notifications: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    sortedNotifications() {
      return [...this.notifications].sort((a, b) => {
        return new Date(b.createdDate) - new Date(a.createdDate);
      });
    }
  },
  methods: {
    /**
     * Formats a timestamp into a relative time string (e.g., "2 hours ago")
     * @param {number|string} timestamp - The timestamp to format
     * @returns {string} Relative time string
     */
    formatRelativeDate(timestamp) {
      const now = new Date();
      const date = new Date(timestamp);
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      
      const days = Math.floor(diffInSeconds / 86400);
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    },
    
    /**
     * Formats a timestamp into a full date string
     * @param {number|string} timestamp - The timestamp to format
     * @returns {string} Formatted date string
     */
    formatFullDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    /**
     * Handles notification click event
     * @param {Object} notification - The clicked notification
     */
    handleNotificationClick(notification) {
      if (!notification.read) {
        this.markAsRead(notification);
      }
      this.$emit('go-to-redirect', notification);
    },
    
    /**
     * Emits mark-as-read event
     * @param {Object} notification - Notification to mark as read
     */
    markAsRead(notification) {
      this.$emit('mark-as-read', notification);
    }
  }
};
</script>

<style scoped>
.notification-list {
  max-height: 600px;
  overflow-y: auto;
}

.unread-notification {
  background-color: rgba(0, 0, 0, 0.02);
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.float-right {
  float: right;
}
</style>
