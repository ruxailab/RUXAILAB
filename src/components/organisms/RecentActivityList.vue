<template>
  <div class="recent-activity-list">
    <div
      v-if="activities.length === 0"
      class="empty-state text-center py-4"
    >
      <v-icon
        icon="mdi-history"
        size="48"
        color="grey-lighten-2"
        class="mb-2"
      />
      <p class="text-body-2 text-grey-darken-1">
        No recent activity
      </p>
    </div>

    <div
      v-else
      class="activity-timeline"
    >
      <div
        v-for="(activity, index) in activities"
        :key="activity.id"
        class="activity-item"
        :class="{ 'mb-4': index !== activities.length - 1 }"
      >
        <div class="activity-indicator">
          <div
            class="activity-icon"
            :class="`bg-${activity.color}`"
          >
            <v-icon
              :icon="activity.icon"
              size="16"
              color="white"
            />
          </div>
          <div
            v-if="index !== activities.length - 1"
            class="activity-line"
          />
        </div>

        <div class="activity-content">
          <div class="activity-header">
            <h4 class="text-subtitle-2 font-weight-medium text-grey-darken-4 mb-1">
              {{ activity.title }}
            </h4>
            <span class="text-caption text-grey-darken-1">{{ activity.timestamp }}</span>
          </div>
          <p class="text-body-2 text-grey-darken-2 mb-0">
            {{ activity.description }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="activities.length > 0"
      class="mt-4 text-center"
    >
      <v-btn
        variant="text"
        color="primary"
        size="small"
        @click="$router.push('/admin?section=notifications')"
      >
        View All Activity
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
    activities: {
        type: Array,
        default: () => []
    }
})
</script>

<style scoped>
.recent-activity-list {
    max-height: 400px;
    overflow-y: auto;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    position: relative;
}

.activity-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 16px;
    position: relative;
}

.activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

.activity-line {
    width: 2px;
    height: 40px;
    background-color: #e0e0e0;
    margin-top: 4px;
}

.activity-content {
    flex: 1;
    padding-top: 4px;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
}

.bg-success {
    background-color: rgb(var(--v-theme-success));
}

.bg-info {
    background-color: rgb(var(--v-theme-info));
}

.bg-warning {
    background-color: rgb(var(--v-theme-warning));
}

.bg-error {
    background-color: rgb(var(--v-theme-error));
}

.bg-primary {
    background-color: rgb(var(--v-theme-primary));
}
</style>
